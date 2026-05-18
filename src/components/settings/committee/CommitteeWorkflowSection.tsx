import {
  FormControl,
  FormLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  Typography,
} from "@mui/material";

import type {
  CommitteeWorkflowSettings,
  DefaultAgendaItemAccess,
  RequireApproval,
  SettingsCommittee,
} from "../../../types/settings.js";
import {
  DEFAULT_AGENDA_ITEM_ACCESS_OPTIONS,
  REQUIRE_APPROVAL_OPTIONS,
  syncWorkflowToCommitteeFlags,
  YES_NO_OPTIONS,
} from "../../../utils/committeeSettings.js";
import CommitteeSettingsCard from "./CommitteeSettingsCard.js";

type CommitteeWorkflowSectionProps = {
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

function YesNoSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <FormControl fullWidth size="small">
      <FormLabel>{label}</FormLabel>
      <Select value={value ? "yes" : "no"} onChange={(e) => onChange(e.target.value === "yes")}>
        {YES_NO_OPTIONS.map((option) => (
          <MenuItem key={option.label} value={option.value ? "yes" : "no"}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default function CommitteeWorkflowSection({
  committee,
  dividerColor,
  onChange,
}: CommitteeWorkflowSectionProps) {
  const updateWorkflow = (patch: Partial<CommitteeWorkflowSettings>) => {
    onChange(syncWorkflowToCommitteeFlags({ ...committee.workflow, ...patch }));
  };

  return (
    <Stack gap={2}>
      <CommitteeSettingsCard title="Workflow" dividerColor={dividerColor}>
        <Stack gap={2.5}>
          <FormControl fullWidth size="small">
            <FormLabel>Require approval</FormLabel>
            <Select
              value={committee.workflow.requireApproval}
              onChange={(e) =>
                updateWorkflow({ requireApproval: e.target.value as RequireApproval })
              }
            >
              {REQUIRE_APPROVAL_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <YesNoSelect
            label="Allow administration to view draft agenda items"
            value={committee.workflow.allowAdminViewDraftItems}
            onChange={(allowAdminViewDraftItems) => updateWorkflow({ allowAdminViewDraftItems })}
          />

          <YesNoSelect
            label="Allow administration to submit agenda items"
            value={committee.workflow.allowAdminSubmitItems}
            onChange={(allowAdminSubmitItems) => updateWorkflow({ allowAdminSubmitItems })}
          />

          <YesNoSelect
            label="Allow executive readers to view draft agenda items"
            value={committee.workflow.allowExecutiveViewDraftItems}
            onChange={(allowExecutiveViewDraftItems) =>
              updateWorkflow({ allowExecutiveViewDraftItems })
            }
          />

          <FormControl fullWidth size="small">
            <FormLabel>Default agenda item access</FormLabel>
            <Select
              value={committee.workflow.defaultAgendaItemAccess}
              onChange={(e) =>
                updateWorkflow({
                  defaultAgendaItemAccess: e.target.value as DefaultAgendaItemAccess,
                })
              }
            >
              {DEFAULT_AGENDA_ITEM_ACCESS_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <YesNoSelect
            label="Allow submitter to set agenda items as public"
            value={committee.workflow.allowSubmitterSetPublic}
            onChange={(allowSubmitterSetPublic) => updateWorkflow({ allowSubmitterSetPublic })}
          />
        </Stack>
      </CommitteeSettingsCard>

      <CommitteeSettingsCard
        title="Agenda item workflow history"
        dividerColor={dividerColor}
      >
        <Stack gap={0}>
          <BooleanSettingRow
            label="Show to public"
            checked={committee.workflow.historyShowToPublic}
            onToggle={() =>
              updateWorkflow({ historyShowToPublic: !committee.workflow.historyShowToPublic })
            }
          />
          <BooleanSettingRow
            label="Show to admin"
            checked={committee.workflow.historyShowToAdmin}
            onToggle={() =>
              updateWorkflow({ historyShowToAdmin: !committee.workflow.historyShowToAdmin })
            }
          />
          <BooleanSettingRow
            label="Show to executive"
            checked={committee.workflow.historyShowToExecutive}
            onToggle={() =>
              updateWorkflow({
                historyShowToExecutive: !committee.workflow.historyShowToExecutive,
              })
            }
          />
        </Stack>
      </CommitteeSettingsCard>
    </Stack>
  );
}
