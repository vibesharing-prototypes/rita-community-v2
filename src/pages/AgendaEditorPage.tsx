import { useLocation, useParams } from "react-router";
import meetingsData from "../data/meetings.json";
import type { Meeting } from "../types/meetings";
import AgendaEditorLayout from "../components/agenda/AgendaEditorLayout";
import { getAgendaFor } from "../data/runtimeAgendaStore";

export default function AgendaEditorPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();

  const meeting =
    (meetingsData.meetings as Meeting[]).find((m) => m.id === id) ??
    (location.state as { meeting?: Meeting } | null)?.meeting ??
    null;
  if (!meeting) {
    return null;
  }

  const initialCategories = getAgendaFor(id ?? "");

  return (
    <AgendaEditorLayout
      meeting={meeting}
      initialCategories={initialCategories}
    />
  );
}
