import { useParams } from "react-router";
import meetingsData from "../data/meetings.json";
import agendaData from "../data/agenda.json";
import type { Meeting } from "../types/meetings";
import type { AgendaCategory } from "../types/agenda";
import AgendaEditorLayout from "../components/agenda/AgendaEditorLayout";

export default function AgendaEditorPage() {
  const { id } = useParams<{ id: string }>();

  const meeting = (meetingsData.meetings as Meeting[]).find((m) => m.id === id);
  if (!meeting) {
    return null;
  }

  const agendas = agendaData.agendas as Record<string, { categories: AgendaCategory[] }>;
  const initialCategories: AgendaCategory[] = agendas[id ?? ""]?.categories ?? [];

  return (
    <AgendaEditorLayout
      meeting={meeting}
      initialCategories={initialCategories}
    />
  );
}
