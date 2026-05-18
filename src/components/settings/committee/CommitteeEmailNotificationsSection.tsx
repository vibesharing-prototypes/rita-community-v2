import { Stack, Switch, Typography } from "@mui/material";

import type { CommitteeEmailNotifications, SettingsCommittee } from "../../../types/settings.js";
import CommitteeSettingsCard from "./CommitteeSettingsCard.js";

type NotificationKey = keyof CommitteeEmailNotifications;

const NOTIFICATION_ROWS: { key: NotificationKey; label: string }[] = [
  { key: "meetingPublished", label: "Meeting published" },
  { key: "agendaPublished", label: "Agenda published" },
  { key: "agendaItemUpdated", label: "Agenda item updated" },
  { key: "minutesPublished", label: "Minutes published" },
  { key: "workflowReminder", label: "Workflow reminder" },
];

type CommitteeEmailNotificationsSectionProps = {
  committee: SettingsCommittee;
  dividerColor: string;
  onChange: (emailNotifications: CommitteeEmailNotifications) => void;
};

export default function CommitteeEmailNotificationsSection({
  committee,
  dividerColor,
  onChange,
}: CommitteeEmailNotificationsSectionProps) {
  const toggle = (key: NotificationKey) => {
    onChange({
      ...committee.emailNotifications,
      [key]: !committee.emailNotifications[key],
    });
  };

  return (
    <CommitteeSettingsCard
      title="Email notifications"
      description="Choose which events send email notifications for this committee."
      dividerColor={dividerColor}
    >
      <Stack gap={0}>
        {NOTIFICATION_ROWS.map((row) => (
          <Stack
            key={row.key}
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            gap={2}
            role="button"
            tabIndex={0}
            onClick={() => toggle(row.key)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggle(row.key);
              }
            }}
            sx={{
              cursor: "pointer",
              borderRadius: "6px",
              mx: -1,
              px: 1,
              py: 0.25,
              minHeight: 32,
              "&:hover": { bgcolor: "action.hover" },
            }}
          >
            <Typography variant="body1">{row.label}</Typography>
            <Switch
              checked={committee.emailNotifications[row.key]}
              size="small"
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => {
                e.stopPropagation();
                toggle(row.key);
              }}
              inputProps={{ "aria-label": row.label }}
            />
          </Stack>
        ))}
      </Stack>
    </CommitteeSettingsCard>
  );
}
