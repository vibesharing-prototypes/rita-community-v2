import {
  FormControl,
  FormLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";

import type {
  CommitteeMeetingControlSettings,
  CommitteeTimerPreset,
  SettingsCommittee,
  VotingMode,
} from "../../../types/settings.js";
import { VOTING_MODE_OPTIONS } from "../../../utils/committeeSettings.js";
import CommitteeSettingsCard from "./CommitteeSettingsCard.js";

type CommitteeMeetingControlSectionProps = {
  committee: SettingsCommittee;
  dividerColor: string;
  onChange: (patch: Partial<SettingsCommittee>) => void;
};

function BooleanSettingRow({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      gap={2}
      role="button"
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle();
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
      <Typography variant="body1">{label}</Typography>
      <Stack direction="row" alignItems="center" gap={1}>
        <Typography
          variant="body1"
          sx={{ color: "var(--lens-semantic-color-type-muted)", minWidth: 56, textAlign: "end" }}
        >
          {checked ? "Yes" : "No"}
        </Typography>
        <Switch
          checked={checked}
          size="small"
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          inputProps={{ "aria-label": label }}
        />
      </Stack>
    </Stack>
  );
}

function TimerPresetFields({
  label,
  preset,
  onChange,
}: {
  label: string;
  preset: CommitteeTimerPreset;
  onChange: (preset: CommitteeTimerPreset) => void;
}) {
  return (
    <Stack gap={1}>
      <Typography variant="body1" sx={{ fontWeight: "var(--lens-core-font-weight-medium)" }}>
        {label}
      </Typography>
      <Stack direction="row" gap={2}>
        <FormControl size="small" sx={{ flex: 1 }}>
          <FormLabel>Minutes</FormLabel>
          <TextField
            type="number"
            size="small"
            inputProps={{ min: 0 }}
            value={preset.minutes}
            onChange={(e) => onChange({ ...preset, minutes: Number(e.target.value) })}
          />
        </FormControl>
        <FormControl size="small" sx={{ flex: 1 }}>
          <FormLabel>Seconds</FormLabel>
          <TextField
            type="number"
            size="small"
            inputProps={{ min: 0, max: 59 }}
            value={preset.seconds}
            onChange={(e) => onChange({ ...preset, seconds: Number(e.target.value) })}
          />
        </FormControl>
      </Stack>
    </Stack>
  );
}

export default function CommitteeMeetingControlSection({
  committee,
  dividerColor,
  onChange,
}: CommitteeMeetingControlSectionProps) {
  const updateMeetingControl = (patch: Partial<CommitteeMeetingControlSettings>) => {
    onChange({ meetingControl: { ...committee.meetingControl, ...patch } });
  };

  const updateVoteLabel = (key: keyof CommitteeMeetingControlSettings["voteLabels"], value: string) => {
    updateMeetingControl({
      voteLabels: { ...committee.meetingControl.voteLabels, [key]: value },
    });
  };

  const updateActionLabel = (
    key: keyof CommitteeMeetingControlSettings["actionLabels"],
    value: string,
  ) => {
    updateMeetingControl({
      actionLabels: { ...committee.meetingControl.actionLabels, [key]: value },
    });
  };

  const updateTimerPreset = (index: 0 | 1 | 2, preset: CommitteeTimerPreset) => {
    const timerPresets = [...committee.meetingControl.timerPresets] as [
      CommitteeTimerPreset,
      CommitteeTimerPreset,
      CommitteeTimerPreset,
    ];
    timerPresets[index] = preset;
    updateMeetingControl({ timerPresets });
  };

  return (
    <Stack gap={2}>
      <CommitteeSettingsCard title="Voting" dividerColor={dividerColor}>
        <FormControl fullWidth size="small">
          <FormLabel>Voting</FormLabel>
          <Select
            value={committee.meetingControl.votingMode}
            onChange={(e) => updateMeetingControl({ votingMode: e.target.value as VotingMode })}
          >
            {VOTING_MODE_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </CommitteeSettingsCard>

      <CommitteeSettingsCard title="Vote customization" dividerColor={dividerColor}>
        <Stack gap={2.5}>
          <FormControl fullWidth size="small">
            <FormLabel>Yea</FormLabel>
            <TextField
              size="small"
              value={committee.meetingControl.voteLabels.yea}
              onChange={(e) => updateVoteLabel("yea", e.target.value)}
            />
          </FormControl>
          <FormControl fullWidth size="small">
            <FormLabel>Nay</FormLabel>
            <TextField
              size="small"
              value={committee.meetingControl.voteLabels.nay}
              onChange={(e) => updateVoteLabel("nay", e.target.value)}
            />
          </FormControl>
          <FormControl fullWidth size="small">
            <FormLabel>Abstain</FormLabel>
            <TextField
              size="small"
              value={committee.meetingControl.voteLabels.abstain}
              onChange={(e) => updateVoteLabel("abstain", e.target.value)}
            />
          </FormControl>
          <FormControl fullWidth size="small">
            <FormLabel>Not present at vote</FormLabel>
            <TextField
              size="small"
              value={committee.meetingControl.voteLabels.notPresentAtVote}
              onChange={(e) => updateVoteLabel("notPresentAtVote", e.target.value)}
            />
          </FormControl>
        </Stack>
      </CommitteeSettingsCard>

      <CommitteeSettingsCard title="Action customization" dividerColor={dividerColor}>
        <Stack gap={2.5}>
          <FormControl fullWidth size="small">
            <FormLabel>Unanimous</FormLabel>
            <TextField
              size="small"
              value={committee.meetingControl.actionLabels.unanimous}
              onChange={(e) => updateActionLabel("unanimous", e.target.value)}
            />
          </FormControl>
          <FormControl fullWidth size="small">
            <FormLabel>Motion carries</FormLabel>
            <TextField
              size="small"
              value={committee.meetingControl.actionLabels.motionCarries}
              onChange={(e) => updateActionLabel("motionCarries", e.target.value)}
            />
          </FormControl>
          <FormControl fullWidth size="small">
            <FormLabel>Motion fails</FormLabel>
            <TextField
              size="small"
              value={committee.meetingControl.actionLabels.motionFails}
              onChange={(e) => updateActionLabel("motionFails", e.target.value)}
            />
          </FormControl>
        </Stack>
      </CommitteeSettingsCard>

      <CommitteeSettingsCard title="Minutes generation" dividerColor={dividerColor}>
        <BooleanSettingRow
          label="Include original resolution for consent items"
          checked={committee.meetingControl.includeOriginalResolutionForConsent}
          onToggle={() =>
            updateMeetingControl({
              includeOriginalResolutionForConsent:
                !committee.meetingControl.includeOriginalResolutionForConsent,
            })
          }
        />
      </CommitteeSettingsCard>

      <CommitteeSettingsCard title="Timer" dividerColor={dividerColor}>
        <Stack gap={2.5}>
          <TimerPresetFields
            label="Preset 1"
            preset={committee.meetingControl.timerPresets[0]}
            onChange={(preset) => updateTimerPreset(0, preset)}
          />
          <TimerPresetFields
            label="Preset 2"
            preset={committee.meetingControl.timerPresets[1]}
            onChange={(preset) => updateTimerPreset(1, preset)}
          />
          <TimerPresetFields
            label="Preset 3"
            preset={committee.meetingControl.timerPresets[2]}
            onChange={(preset) => updateTimerPreset(2, preset)}
          />
        </Stack>
      </CommitteeSettingsCard>
    </Stack>
  );
}
