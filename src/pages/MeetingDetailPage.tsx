import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import MeetingDetailView from "../components/meetings/MeetingDetailView";
import meetingsData from "../data/meetings.json";
import type { Meeting } from "../types/meetings";

export default function MeetingDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const seed =
    (meetingsData.meetings as Meeting[]).find((m) => m.id === id) ??
    (location.state as { meeting?: Meeting } | null)?.meeting ??
    null;
  const [meeting, setMeeting] = useState<Meeting | null>(seed);

  if (!meeting) return null;

  return (
    <MeetingDetailView
      meeting={meeting}
      onBack={() => navigate("/meetings")}
      onUpdate={(updated) => setMeeting(updated)}
    />
  );
}
