import InfoIcon from "@diligentcorp/atlas-react-bundle/icons/Info";
import {
  Box,
  Chip,
  FormControl,
  FormLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";

import type {
  AgendaItemTypeKey,
  AgendaMeetingSecurity,
  AgendaNumberingStyle,
  AgendaStyle,
  CommitteeAgendaSettings,
  SettingsCommittee,
} from "../../../types/settings.js";
import {
  AGENDA_ITEM_TYPE_OPTIONS,
  AGENDA_MEETING_SECURITY_OPTIONS,
  AGENDA_NUMBERING_OPTIONS,
  AGENDA_STYLE_OPTIONS,
  PUBLIC_RELEASE_OPTIONS,
} from "../../../utils/committeeSettings.js";
import CommitteeSettingsCard from "./CommitteeSettingsCard.js";

type CommitteeAgendaSectionProps = {
  committee: SettingsCommittee;
  dividerColor: string;
  onChange: (patch: Partial<SettingsCommittee>) => void;
};

function BooleanSettingRow({
  label,
  checked,
  checkedLabel,
  onToggle,
}: {
  label: string;
  checked: boolean;
  checkedLabel: string;
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
          {checked ? checkedLabel : "No"}
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

export default function CommitteeAgendaSection({
  committee,
  dividerColor,
  onChange,
}: CommitteeAgendaSectionProps) {
  const updateAgenda = (patch: Partial<CommitteeAgendaSettings>) => {
    onChange({ agenda: { ...committee.agenda, ...patch } });
  };

  const releaseValueInOptions = PUBLIC_RELEASE_OPTIONS.some(
    (o) => o.value === committee.meetingReleaseDays,
  );

  const handleAgendaItemTypesChange = (event: SelectChangeEvent<AgendaItemTypeKey[]>) => {
    const value = event.target.value;
    const types = typeof value === "string" ? (value.split(",") as AgendaItemTypeKey[]) : value;
    updateAgenda({ agendaItemTypes: types });
  };

  return (
    <Stack gap={2}>
      <CommitteeSettingsCard title="Meeting" dividerColor={dividerColor}>
        <Stack gap={2.5}>
          <FormControl fullWidth size="small">
            <FormLabel>Public release</FormLabel>
            <Select
              value={committee.meetingReleaseDays}
              onChange={(e) => onChange({ meetingReleaseDays: Number(e.target.value) })}
            >
              {!releaseValueInOptions && (
                <MenuItem value={committee.meetingReleaseDays}>
                  {committee.meetingReleaseDays} days before the meeting
                </MenuItem>
              )}
              {PUBLIC_RELEASE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <FormLabel>Default meeting security</FormLabel>
            <Select
              value={committee.agenda.defaultMeetingSecurity}
              onChange={(e) =>
                updateAgenda({ defaultMeetingSecurity: e.target.value as AgendaMeetingSecurity })
              }
            >
              {AGENDA_MEETING_SECURITY_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            <Stack direction="row" alignItems="flex-start" gap={0.75} sx={{ mt: 1 }}>
              <InfoIcon
                style={{
                  fontSize: 16,
                  marginTop: 2,
                  flexShrink: 0,
                  color: "var(--lens-semantic-color-type-muted)",
                }}
              />
              <Typography variant="body1" sx={{ color: "var(--lens-semantic-color-type-muted)" }}>
                Determines security level that is initially selected when a meeting is created.
              </Typography>
            </Stack>
          </FormControl>
        </Stack>
      </CommitteeSettingsCard>

      <CommitteeSettingsCard title="Agenda item content" dividerColor={dividerColor}>
        <Stack gap={2.5}>
          <FormControl fullWidth size="small">
            <FormLabel>Agenda style</FormLabel>
            <Select
              value={committee.agenda.agendaStyle}
              onChange={(e) => updateAgenda({ agendaStyle: e.target.value as AgendaStyle })}
            >
              {AGENDA_STYLE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <FormLabel>Default numbering</FormLabel>
            <Select
              value={committee.agenda.defaultNumbering}
              onChange={(e) =>
                updateAgenda({ defaultNumbering: e.target.value as AgendaNumberingStyle })
              }
            >
              {AGENDA_NUMBERING_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <FormLabel>Agenda item types</FormLabel>
            <Select
              multiple
              value={committee.agenda.agendaItemTypes}
              onChange={handleAgendaItemTypesChange}
              input={<OutlinedInput />}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {(selected as AgendaItemTypeKey[]).map((typeKey) => {
                    const option = AGENDA_ITEM_TYPE_OPTIONS.find((o) => o.value === typeKey);
                    return <Chip key={typeKey} label={option?.label ?? typeKey} size="small" />;
                  })}
                </Box>
              )}
            >
              {AGENDA_ITEM_TYPE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <BooleanSettingRow
            label="Show motion to public prior to action"
            checked={committee.agenda.showMotionToPublicBeforeAction}
            checkedLabel="Yes"
            onToggle={() =>
              updateAgenda({
                showMotionToPublicBeforeAction: !committee.agenda.showMotionToPublicBeforeAction,
              })
            }
          />

          <BooleanSettingRow
            label="Goal tracking"
            checked={committee.agenda.goalTrackingEnabled}
            checkedLabel="Enabled"
            onToggle={() =>
              updateAgenda({ goalTrackingEnabled: !committee.agenda.goalTrackingEnabled })
            }
          />
        </Stack>
      </CommitteeSettingsCard>

      <CommitteeSettingsCard title="Content areas" dividerColor={dividerColor}>
        <Stack gap={0}>
          <BooleanSettingRow
            label="Administrative content"
            checked={committee.agenda.administrativeContentEnabled}
            checkedLabel="Enabled"
            onToggle={() =>
              updateAgenda({
                administrativeContentEnabled: !committee.agenda.administrativeContentEnabled,
              })
            }
          />
          <BooleanSettingRow
            label="Executive content"
            checked={committee.agenda.executiveContentEnabled}
            checkedLabel="Enabled"
            onToggle={() =>
              updateAgenda({
                executiveContentEnabled: !committee.agenda.executiveContentEnabled,
              })
            }
          />
        </Stack>
      </CommitteeSettingsCard>

      <CommitteeSettingsCard title="Consent items" dividerColor={dividerColor}>
        <Stack gap={2.5}>
          <BooleanSettingRow
            label="Show consent paragraph"
            checked={committee.agenda.showConsentParagraph}
            checkedLabel="Yes"
            onToggle={() =>
              updateAgenda({ showConsentParagraph: !committee.agenda.showConsentParagraph })
            }
          />

          <FormControl fullWidth size="small">
            <FormLabel>Consent paragraph text</FormLabel>
            <TextField
              multiline
              minRows={4}
              size="small"
              value={committee.agenda.consentParagraphText}
              onChange={(e) => updateAgenda({ consentParagraphText: e.target.value })}
              placeholder="Test Consent"
              disabled={!committee.agenda.showConsentParagraph}
            />
          </FormControl>
        </Stack>
      </CommitteeSettingsCard>

      <CommitteeSettingsCard title="Template" dividerColor={dividerColor}>
        <FormControl fullWidth size="small">
          <FormLabel>Public template</FormLabel>
          <TextField
            multiline
            minRows={6}
            size="small"
            value={committee.agenda.publicTemplate}
            onChange={(e) => updateAgenda({ publicTemplate: e.target.value })}
            placeholder="Enter public template content"
          />
        </FormControl>
      </CommitteeSettingsCard>
    </Stack>
  );
}
