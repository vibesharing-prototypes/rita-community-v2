import type { AgendaCategory } from "../types/agenda";
import agendaData from "./agenda.json";

const runtimeAgendas = new Map<string, AgendaCategory[]>();

export function getAgendaFor(id: string): AgendaCategory[] {
  if (runtimeAgendas.has(id)) return runtimeAgendas.get(id)!;
  const json = agendaData as { agendas: Record<string, { categories: AgendaCategory[] }> };
  return json.agendas[id]?.categories ?? [];
}

export function setAgendaFor(id: string, categories: AgendaCategory[]): void {
  runtimeAgendas.set(id, categories);
}

export function cloneAgendaFromTemplate(sourceId: string, newMeetingId: string): void {
  const source = getAgendaFor(sourceId);
  if (source.length === 0) {
    runtimeAgendas.set(newMeetingId, []);
    return;
  }
  const cloned: AgendaCategory[] = source.map((cat, ci) => {
    const newCatId = `${newMeetingId}-cat-${ci + 1}`;
    return {
      ...cat,
      id: newCatId,
      items: cat.items.map((item, ii) => ({
        ...item,
        id: `${newMeetingId}-i-${ci + 1}-${ii + 1}`,
        categoryId: newCatId,
        attachments: {
          public: [...item.attachments.public],
          staff: [...item.attachments.staff],
          executive: [...item.attachments.executive],
        },
      })),
    };
  });
  runtimeAgendas.set(newMeetingId, cloned);
}
