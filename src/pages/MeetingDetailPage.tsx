import { useLocation, useNavigate, useParams } from "react-router";
import MeetingDetailView from "../components/meetings/MeetingDetailView";
import type { Meeting } from "../types/meetings";
import { setMeetings, useMeetings } from "../state/meetingsStore";

export default function MeetingDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const meetings = useMeetings();
  const meeting =
    meetings.find((m) => m.id === id) ??
    (location.state as { meeting?: Meeting } | null)?.meeting ??
    null;

  if (!meeting) return null;

  return (
    <MeetingDetailView
      meeting={meeting}
      onBack={() => navigate("/meetings")}
      onUpdate={(updated) =>
        setMeetings((prev) => {
          const idx = prev.findIndex((m) => m.id === updated.id);
          if (idx === -1) return [updated, ...prev];
          const next = [...prev];
          next[idx] = updated;
          return next;
        })
      }
    />
  );
}
