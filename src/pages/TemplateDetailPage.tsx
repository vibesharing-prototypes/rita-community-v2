import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import TemplateDetailView from "../components/meetings/TemplateDetailView";
import meetingsData from "../data/meetings.json";
import type { Meeting, MeetingTemplate } from "../types/meetings";

export default function TemplateDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const seed =
    (meetingsData.templates as MeetingTemplate[]).find((t) => t.id === id) ??
    (location.state as { template?: MeetingTemplate } | null)?.template ??
    null;

  const [template, setTemplate] = useState<MeetingTemplate | null>(seed);

  if (!template) return null;

  return (
    <TemplateDetailView
      template={template}
      onBack={() => navigate("/meetings?tab=templates")}
      onUpdate={(updated) => setTemplate(updated)}
      onDuplicate={(copy) =>
        navigate(`/meetings/templates/${copy.id}`, { state: { template: copy } })
      }
      onUseTemplate={() => {
        const newMeeting: Meeting = {
          id: `m-new-${Date.now()}`,
          name: template.name,
          date: new Date().toISOString().slice(0, 10),
          time: template.time,
          location: template.location,
          description: template.description,
          committee: template.committee,
          status: "Draft",
          visibility: "Internal",
          agendaStatus: "Not published",
          agendaCategories: 0,
          agendaItems: 0,
          membersOnly: false,
          publicRTS: false,
        };
        navigate(`/meetings/${newMeeting.id}`, { state: { meeting: newMeeting } });
      }}
    />
  );
}
