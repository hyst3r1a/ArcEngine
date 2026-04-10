import { useState, useEffect, useCallback } from "react";
import { Save, Loader2 } from "lucide-react";
import type { ArcSchemaField, TodayResponse } from "@arc/shared";
import { computeScore } from "@arc/arc-engine";
import { PageFrame } from "@arc/ui";
import { api } from "../lib/api.js";
import { ArcHeader } from "../components/ArcHeader.js";
import { DailyToggleField } from "../components/DailyToggleField.js";
import { WeightInputCard } from "../components/WeightInputCard.js";
import { EnumSelector } from "../components/EnumSelector.js";
import { MultiselectField } from "../components/MultiselectField.js";
import { ScoreCard } from "../components/ScoreCard.js";
import { StreakCard } from "../components/StreakCard.js";
import { PairComparisonCard } from "../components/PairComparisonCard.js";

function defaultValue(field: ArcSchemaField): unknown {
  switch (field.kind) {
    case "boolean":
      return false;
    case "number":
      return field.min ?? 0;
    case "enum":
      return field.options[0];
    case "multiselect":
      return [];
  }
}

export function TodayPage() {
  const [data, setData] = useState<TodayResponse | null>(null);
  const [payload, setPayload] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .today()
      .then((d) => {
        setData(d);
        if (d.today.saved) {
          setPayload(d.today.payload);
        } else {
          const initial: Record<string, unknown> = {};
          for (const f of d.arc.schema.dailyFields) {
            initial[f.key] = defaultValue(f);
          }
          setPayload(initial);
        }
      })
      .catch((err) => console.error("Failed to load today data:", err))
      .finally(() => setLoading(false));
  }, []);

  const setField = useCallback((key: string, value: unknown) => {
    setPayload((prev) => ({ ...prev, [key]: value }));
  }, []);

  async function handleSave() {
    if (!data) return;
    setSaving(true);
    try {
      const resp = await api.saveToday(data.arc.id, payload);
      setData(resp);
    } finally {
      setSaving(false);
    }
  }

  if (loading || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="animate-spin text-arc-muted" size={32} />
      </div>
    );
  }

  const liveScore = computeScore(payload, data.arc.scoring);
  const maxScore = data.arc.scoring.reduce((s, r) => s + r.points, 0);

  return (
    <PageFrame theme={data.arc.theme}>
      <div className="mx-auto w-full max-w-md space-y-4 px-4 pt-12 pb-8">
        <ArcHeader arc={data.arc} state={data.arcState} />

        <ScoreCard
          score={liveScore}
          maxScore={maxScore}
          accentColor={data.arc.theme.accentColor}
        />

        <StreakCard
          current={data.arcState.currentStreak}
          best={data.arcState.bestStreak}
        />

        <div className="space-y-2">
          {data.arc.schema.dailyFields.map((field) => (
            <FieldRenderer
              key={field.key}
              field={field}
              value={payload[field.key]}
              onChange={(v) => setField(field.key, v)}
            />
          ))}
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-arc-accent py-3.5 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Save size={18} />
          )}
          {saving ? "Saving..." : data.today.saved ? "Update Entry" : "Save Entry"}
        </button>

        {data.partner && <PairComparisonCard partner={data.partner} />}
      </div>
    </PageFrame>
  );
}

function FieldRenderer({
  field,
  value,
  onChange,
}: {
  field: ArcSchemaField;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  switch (field.kind) {
    case "boolean":
      return (
        <DailyToggleField
          label={field.label}
          value={value as boolean}
          onChange={onChange}
        />
      );
    case "number":
      return (
        <WeightInputCard
          label={field.label}
          value={value as number}
          onChange={onChange}
          min={field.min}
          max={field.max}
          unit={field.unit}
        />
      );
    case "enum":
      return (
        <EnumSelector
          label={field.label}
          options={field.options}
          value={value as string}
          onChange={onChange}
        />
      );
    case "multiselect":
      return (
        <MultiselectField
          label={field.label}
          options={field.options}
          value={value as string[]}
          onChange={onChange}
        />
      );
  }
}
