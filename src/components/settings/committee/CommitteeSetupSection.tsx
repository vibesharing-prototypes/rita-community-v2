import {
  FormControl,
  FormLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import type { CommitteeGroupType, CommitteeVisibility, SettingsCommittee } from "../../../types/settings.js";
import {
  COMMITTEE_GROUP_TYPES,
  COMMITTEE_VISIBILITY_OPTIONS,
} from "../../../utils/committeeSettings.js";
import { formatMeetingReleaseDays } from "../../../utils/settings.js";
import CommitteeSettingsCard from "./CommitteeSettingsCard.js";

type CommitteeSetupSectionProps = {
  committee: SettingsCommittee;
  dividerColor: string;
  onChange: (patch: Partial<SettingsCommittee>) => void;
};

export default function CommitteeSetupSection({
  committee,
  dividerColor,
  onChange,
}: CommitteeSetupSectionProps) {
  return (
    <CommitteeSettingsCard
      title="Setup"
      description="Group type and committee visibility on the transparency site."
      dividerColor={dividerColor}
    >
      <Stack gap={2.5}>
        <FormControl fullWidth size="small">
          <FormLabel>Group type</FormLabel>
          <Select
            value={committee.groupType}
            onChange={(e) => onChange({ groupType: e.target.value as CommitteeGroupType })}
          >
            {COMMITTEE_GROUP_TYPES.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth size="small">
          <FormLabel>Visibility</FormLabel>
          <Select
            value={committee.visibility}
            onChange={(e) => onChange({ visibility: e.target.value as CommitteeVisibility })}
          >
            {COMMITTEE_VISIBILITY_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          <Typography variant="body1" sx={{ color: "var(--lens-semantic-color-type-muted)", mt: 1 }}>
            {committee.visibility === "public"
              ? "Meetings may appear on the public site after the release window."
              : "Visible only to authenticated users with access to this committee."}
          </Typography>
        </FormControl>

        <FormControl fullWidth size="small">
          <FormLabel>Public meeting release (days before meeting)</FormLabel>
          <TextField
            type="number"
            size="small"
            value={committee.meetingReleaseDays}
            onChange={(e) => onChange({ meetingReleaseDays: Number(e.target.value) })}
            helperText={`Currently: ${formatMeetingReleaseDays(committee.meetingReleaseDays)}. Use -1 for no gate.`}
          />
        </FormControl>
      </Stack>
    </CommitteeSettingsCard>
  );
}
