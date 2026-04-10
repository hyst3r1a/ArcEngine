import type { ArcDefinition } from "@arc/shared";
import { consistencyArc } from "./definitions/consistency-arc.js";

const arcMap = new Map<string, ArcDefinition>();

function register(arc: ArcDefinition) {
  arcMap.set(arc.id, arc);
}

register(consistencyArc);

export function getArc(id: string): ArcDefinition | undefined {
  return arcMap.get(id);
}

export function getActiveArcs(): ArcDefinition[] {
  return getAllArcs();
}

export function getAllArcs(): ArcDefinition[] {
  return Array.from(arcMap.values()).sort((a, b) => a.order - b.order);
}
