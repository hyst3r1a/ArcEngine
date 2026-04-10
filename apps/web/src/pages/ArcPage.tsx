import { useEffect, useState } from "react";
import { Loader2, Lock, Unlock } from "lucide-react";
import type { ArcDetailResponse, ArcListItem } from "@arc/shared";
import { PageFrame, Card, ChapterTitle } from "@arc/ui";
import { api } from "../lib/api.js";
import { ArcProgressCard } from "../components/ArcProgressCard.js";

export function ArcPage() {
  const [arcList, setArcList] = useState<ArcListItem[]>([]);
  const [detail, setDetail] = useState<ArcDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.arcs(), api.today()]).then(([arcs, today]) => {
      setArcList(arcs);
      api.arcDetail(today.arc.id).then((d) => {
        setDetail(d);
        setLoading(false);
      });
    });
  }, []);

  if (loading || !detail) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="animate-spin text-arc-muted" size={32} />
      </div>
    );
  }

  const { arc, state } = detail;

  return (
    <PageFrame theme={arc.theme}>
      <div className="mx-auto w-full max-w-md space-y-4 px-4 pt-12 pb-8">
        <ChapterTitle
          subtitle={`Arc ${arc.order}`}
          title={arc.name}
          accentColor={arc.theme.accentColor}
        />

        <Card variant="glass">
          <p className="text-sm leading-relaxed text-arc-text/80">
            {arc.description}
          </p>
        </Card>

        <ArcProgressCard arc={arc} state={state} />

        <Card variant="ink">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-arc-muted">
            Daily Fields
          </h3>
          <ul className="space-y-1">
            {arc.schema.dailyFields.map((f) => (
              <li key={f.key} className="text-sm text-arc-text/70">
                <span className="mr-2 text-arc-accent">•</span>
                {f.label}
                <span className="ml-1 text-xs text-arc-muted">({f.kind})</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card variant="ink">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-arc-muted">
            Scoring
          </h3>
          <ul className="space-y-1">
            {arc.scoring.map((r, i) => (
              <li key={i} className="text-sm text-arc-text/70">
                <span className="mr-2 text-emerald-400">+{r.points}</span>
                {r.field}
                <span className="ml-1 text-xs text-arc-muted">
                  ({r.type})
                </span>
              </li>
            ))}
          </ul>
        </Card>

        {arcList.length > 1 && (
          <>
            <h3 className="pt-2 text-xs font-semibold uppercase tracking-wider text-arc-muted">
              All Arcs
            </h3>
            <div className="space-y-2">
              {arcList.map((a) => {
                const isCurrent = a.id === arc.id;
                return (
                  <Card
                    key={a.id}
                    variant={isCurrent ? "glass" : "ink"}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <div className="text-sm font-semibold text-arc-text">
                        {a.name}
                      </div>
                      <div className="text-xs text-arc-muted">
                        Arc {a.order}
                      </div>
                    </div>
                    {a.isActive ? (
                      <Unlock size={16} className="text-emerald-400" />
                    ) : (
                      <Lock size={16} className="text-arc-muted" />
                    )}
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>
    </PageFrame>
  );
}
