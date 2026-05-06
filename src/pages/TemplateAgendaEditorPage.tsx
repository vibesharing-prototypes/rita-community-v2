import { useLocation, useParams } from "react-router";
import meetingsData from "../data/meetings.json";
import type { Meeting, MeetingTemplate } from "../types/meetings";
import AgendaEditorLayout from "../components/agenda/AgendaEditorLayout";
import { getAgendaFor } from "../data/runtimeAgendaStore";

export default function TemplateAgendaEditorPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();

  const template =
    (meetingsData.templates as MeetingTemplate[]).find((t) => t.id === id) ??
    (location.state as { template?: MeetingTemplate } | null)?.template ??
    null;

  if (!template) return null;

  const initialCategories = getAgendaFor(id ?? "");

  const meetingShape: Meeting = {
    id: template.id,
    name: template.name,
    date: new Date().toISOString().slice(0, 10),
    time: template.time,
    location: template.location,
    committee: template.committee,
    description: template.description,
    status: "Draft",
    visibility: "Internal",
    agendaStatus: "Not published",
    agendaCategories: 0,
    agendaItems: 0,
    membersOnly: false,
    publicRTS: false,
  };

  return (
    <AgendaEditorLayout
      meeting={meetingShape}
      initialCategories={initialCategories}
      kind="template"
    />
  );
}
