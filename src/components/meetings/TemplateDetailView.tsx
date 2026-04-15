import { OverflowBreadcrumbs, PageHeader } from "@diligentcorp/atlas-react-bundle";
import AgendaIcon from "@diligentcorp/atlas-react-bundle/icons/Agenda";
import ArchiveIcon from "@diligentcorp/atlas-react-bundle/icons/Archive";
import ClockIcon from "@diligentcorp/atlas-react-bundle/icons/Clock";
import CopyIcon from "@diligentcorp/atlas-react-bundle/icons/Copy";
import LocationIcon from "@diligentcorp/atlas-react-bundle/icons/Location";
import MoreIcon from "@diligentcorp/atlas-react-bundle/icons/More";
import NotesIcon from "@diligentcorp/atlas-react-bundle/icons/Notes";
import UnarchiveIcon from "@diligentcorp/atlas-react-bundle/icons/Unarchive";
import {
  Box,
  Button,
  Divider,
  IconButton,
  Link,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  SvgIcon,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format, parse } from "date-fns";
import { useRef, useState } from "react";

import ConfirmDialog from "./ConfirmDialog";
import PageLayout from "../PageLayout";
import type { MeetingTemplate } from "../../types/meetings";

// ── Shared picker styles ───────────────────────────────────────────────────

const HIDDEN_FIELD_SX = {
  position: "absolute" as const,
  width: 0,
  height: 0,
  overflow: "hidden",
  opacity: 0,
  pointerEvents: "none" as const,
};

const TRIGGER_SX = {
  borderRadius: "4px",
  px: "4px",
  py: "4px",
  cursor: "pointer",
  fontSize: "1rem",
  lineHeight: 1.5,
  userSelect: "none" as const,
  "&:hover": { backgroundColor: "action.hover" },
};

// ── Time picker field ──────────────────────────────────────────────────────

function TimeField({
  time,
  onSave,
}: {
  time?: string;
  onSave: (val: string | undefined) => void;
}) {
  const { presets } = useTheme();
  const timePresets = (presets as any).TimePickerPresets?.withAtlasActionBar({
    cancelButtonLabel: "Cancel",
    clearButtonLabel: "Clear",
  });
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const timeValue = time ? parse(time, "h:mm a", new Date()) : null;

  return (
    <Box>
      <Stack
        direction="row"
        alignItems="center"
        gap="8px"
        sx={{ mb: 0, "& svg": { width: 20, height: 20, flexShrink: 0, color: "text.secondary" } }}
      >
        <ClockIcon />
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
          Time
        </Typography>
      </Stack>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Stack direction="row" alignItems="center" sx={{ pl: "28px" }}>
          <Box ref={triggerRef} onClick={() => setOpen(true)} sx={TRIGGER_SX}>
            {time ?? <Box component="span" sx={{ color: "text.disabled" }}>Add default time…</Box>}
          </Box>
          <TimePicker
            open={open}
            onClose={() => setOpen(false)}
            value={timeValue}
            onChange={(val) => {
              if (val) onSave(format(val, "h:mm a"));
              else onSave(undefined);
            }}
            {...timePresets}
            slotProps={{
              ...(timePresets?.slotProps ?? {}),
              textField: { sx: HIDDEN_FIELD_SX },
              popper: { anchorEl: triggerRef.current },
            }}
          />
        </Stack>
      </LocalizationProvider>
    </Box>
  );
}

// ── Inline-editable page title ─────────────────────────────────────────────

function EditableTitleField({
  value,
  onSave,
}: {
  value: string;
  onSave: (val: string) => void;
}) {
  const [local, setLocal] = useState(value);

  return (
    <TextField
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={() => {
        const trimmed = local.trim();
        if (trimmed && trimmed !== value) onSave(trimmed);
        else setLocal(value);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") (e.target as HTMLElement).blur();
        if (e.key === "Escape") {
          setLocal(value);
          (e.target as HTMLElement).blur();
        }
      }}
      variant="standard"
      fullWidth
      sx={{
        "& .MuiInput-root": {
          borderRadius: "4px",
          fontSize: "30px",
          fontWeight: 600,
          lineHeight: "38px",
          "&:not(.Mui-focused):hover": { backgroundColor: "action.hover" },
        },
        "& .MuiInput-input.MuiInput-input": {
          p: "0 4px",
          fontFamily: "inherit",
          fontSize: "30px",
          fontWeight: 600,
          lineHeight: "38px",
        },
        "& .MuiInput-root::before": { borderBottom: "none !important" },
      }}
    />
  );
}

// ── Inline-editable single-line field ─────────────────────────────────────

function EditableField({
  icon,
  label,
  value,
  placeholder,
  onSave,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  placeholder: string;
  onSave: (val: string) => void;
}) {
  const [local, setLocal] = useState(value);

  return (
    <Box>
      <Stack
        direction="row"
        alignItems="center"
        gap="8px"
        sx={{ mb: 0, "& svg": { width: 20, height: 20, flexShrink: 0, color: "text.secondary" } }}
      >
        {icon}
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
          {label}
        </Typography>
      </Stack>
      <TextField
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={() => {
          if (local !== value) onSave(local);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLElement).blur();
          if (e.key === "Escape") setLocal(value);
        }}
        fullWidth
        variant="standard"
        placeholder={placeholder}
        sx={{
          "& .MuiInput-root": {
            borderRadius: "4px",
            "&:not(.Mui-focused):hover": { backgroundColor: "action.hover" },
          },
          "& .MuiInput-input.MuiInput-input": { pl: "28px", pr: 0, pt: "4px", pb: "4px" },
          "& .MuiInput-root::before": { borderBottom: "none !important" },
        }}
      />
    </Box>
  );
}

// ── Inline-editable multiline field ───────────────────────────────────────

function EditableMultilineField({
  icon,
  label,
  value,
  placeholder,
  onSave,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  placeholder: string;
  onSave: (val: string) => void;
}) {
  const [local, setLocal] = useState(value);

  return (
    <Box>
      <Stack
        direction="row"
        alignItems="center"
        gap="8px"
        sx={{ mb: 0, "& svg": { width: 20, height: 20, flexShrink: 0, color: "text.secondary" } }}
      >
        {icon}
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
          {label}
        </Typography>
      </Stack>
      <TextField
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={() => {
          if (local !== value) onSave(local);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") setLocal(value);
        }}
        fullWidth
        multiline
        variant="standard"
        placeholder={placeholder}
        sx={{
          "& .MuiInput-root": {
            borderRadius: "4px",
            "&:not(.Mui-focused):hover": { backgroundColor: "action.hover" },
          },
          "& .MuiInput-input.MuiInput-input": { pl: "28px", pr: 0, pt: "4px", pb: "4px" },
          "& .MuiInput-root::before": { borderBottom: "none !important" },
        }}
      />
    </Box>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export default function TemplateDetailView({
  template,
  onBack,
  onUpdate,
  onDuplicate,
  onUseTemplate,
}: {
  template: MeetingTemplate;
  onBack: () => void;
  onUpdate: (template: MeetingTemplate) => void;
  onDuplicate?: (copy: MeetingTemplate) => void;
  onUseTemplate?: () => void;
}) {
  const { tokens } = useTheme();
  const dividerColor =
    tokens?.component?.divider?.colors?.default?.borderColor?.value ?? "#E0E0E0";

  const [draft, setDraft] = useState<MeetingTemplate>({ ...template });
  const [moreMenuAnchor, setMoreMenuAnchor] = useState<HTMLElement | null>(null);
  type PendingAction = "archive" | "unarchive";
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  const save = (partial: Partial<MeetingTemplate>) => {
    const updated = { ...draft, ...partial };
    setDraft(updated);
    onUpdate(updated);
  };

  const isArchived = draft.status === "Archived";

  return (
    <PageLayout id="page-template-detail">
      {/* ── Atlas PageHeader ── */}
      <Box sx={{ borderBottom: `1px solid ${dividerColor}`, pb: "12px" }}>
        <PageHeader
          breadcrumbs={
            <OverflowBreadcrumbs
              items={[
                { id: "root", label: "Community v2", isDisabled: true },
                { id: "meetings", label: "Meetings", isDisabled: true },
                { id: "templates", label: "Templates" },
                { id: "current", label: draft.name, isCurrent: true },
              ]}
            >
              {(item) => {
                const textSx = {
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: 14,
                  fontWeight: 600,
                  lineHeight: "20px",
                  letterSpacing: "0.14px",
                  color: "#6f7377",
                  whiteSpace: "nowrap" as const,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                };
                if (item.isCurrent) return <span />;
                if (item.id === "root") return (
                  <Box sx={{ height: 32, display: "flex", alignItems: "center", pr: "16px" }}>
                    <Typography sx={{ ...textSx, letterSpacing: "0.2px" }}>{item.label}</Typography>
                  </Box>
                );
                const label = (
                  <Box sx={{ display: "flex", alignItems: "center", height: 24, px: "4px" }}>
                    <Typography sx={textSx}>{item.label}</Typography>
                  </Box>
                );
                if (item.isDisabled) return (
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", px: "12px", py: "4px", borderRadius: "10px" }}>
                    {label}
                  </Box>
                );
                return (
                  <Box
                    component="button"
                    onClick={onBack}
                    sx={{ display: "flex", alignItems: "center", justifyContent: "center", px: "12px", py: "4px", borderRadius: "10px", cursor: "pointer", background: "none", border: "none", "&:hover": { bgcolor: "action.hover" } }}
                  >
                    {label}
                  </Box>
                );
              }}
            </OverflowBreadcrumbs>
          }
          pageTitle={
            (<EditableTitleField value={draft.name} onSave={(val) => save({ name: val })} />) as unknown as string
          }
          pageSubtitle={
            <Stack direction="row" alignItems="center">
              <Box
                component="span"
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  border: "1px solid #76777A",
                  borderRadius: "100px",
                  px: 1.5,
                  height: 24,
                  fontSize: 12,
                  lineHeight: 1,
                  whiteSpace: "nowrap",
                }}
              >
                {draft.committee}
              </Box>
            </Stack>
          }
          moreButton={
            <Stack direction="row" spacing={1} alignItems="center">
              <Button variant="outlined" onClick={onUseTemplate}>
                Use template
              </Button>
              <IconButton
                aria-label="More actions"
                onClick={(e) => setMoreMenuAnchor(e.currentTarget)}
              >
                <MoreIcon />
              </IconButton>
              <Menu
                anchorEl={moreMenuAnchor}
                open={Boolean(moreMenuAnchor)}
                onClose={() => setMoreMenuAnchor(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
              >
                <MenuItem
                  onClick={() => {
                    setMoreMenuAnchor(null);
                    const copy: MeetingTemplate = {
                      ...draft,
                      id: `t-dup-${Date.now()}`,
                      name: `Copy of ${draft.name}`,
                      meetingsCreated: 0,
                    };
                    onDuplicate?.(copy);
                  }}
                >
                  <ListItemIcon>
                    <CopyIcon />
                  </ListItemIcon>
                  <ListItemText>Duplicate</ListItemText>
                </MenuItem>
                <Divider />
                <MenuItem
                  onClick={() => {
                    setMoreMenuAnchor(null);
                    setPendingAction(isArchived ? "unarchive" : "archive");
                  }}
                >
                  <ListItemIcon>
                    {isArchived ? <UnarchiveIcon /> : <ArchiveIcon />}
                  </ListItemIcon>
                  <ListItemText>{isArchived ? "Unarchive" : "Archive"}</ListItemText>
                </MenuItem>
              </Menu>
            </Stack>
          }
          containerProps={{
            sx: {
              "--lens-component-page-header-desktop-middle-container-padding-bottom": "0px",
              "--lens-component-page-header-desktop-container-gap": "8px",
              "--lens-component-page-header-desktop-title-container-gap": "12px",
              "--lens-component-page-header-tablet-title-container-gap": "12px",
              "& nav.MuiBreadcrumbs-root li:first-child a": { pl: 0 },
              "& .MuiStack-root:has(.MuiTextField-root)": { flex: "1 1 auto !important" },
            },
          }}
        />
      </Box>

      {/* ── Body ── */}
      <Stack gap={2} sx={{ maxWidth: 760 }}>

        {/* Agenda card */}
        <Box sx={{ border: `1px solid ${dividerColor}`, borderRadius: "12px", p: 2, backgroundColor: "white" }}>
          <Stack direction="row" alignItems="center" gap={1.5}>
            <Box sx={{ backgroundColor: "#E4F3FF", borderRadius: "12px", p: 1, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <AgendaIcon sx={{ width: 24, height: 24 }} />
            </Box>
            <Typography flex={1} minWidth={0} sx={{ fontSize: 18, fontWeight: 600, lineHeight: "28px", letterSpacing: "0.2px" }}>
              Agenda
            </Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<SvgIcon sx={{ width: 16, height: 16 }}><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" /></SvgIcon>}
            >
              Add
            </Button>
          </Stack>
        </Box>

        {/* Details card */}
        <Box sx={{ border: `1px solid ${dividerColor}`, borderRadius: "12px", px: 2, py: 3, backgroundColor: "white" }}>
          <Stack gap={3}>
            <TimeField
              time={draft.time}
              onSave={(val) => save({ time: val })}
            />
            <EditableField
              icon={<LocationIcon />}
              label="Location"
              value={draft.location ?? ""}
              placeholder="Add default location…"
              onSave={(val) => save({ location: val || undefined })}
            />
            <EditableMultilineField
              icon={<NotesIcon />}
              label="Description"
              value={draft.description ?? ""}
              placeholder="Add a description…"
              onSave={(val) => save({ description: val || undefined })}
            />
          </Stack>
        </Box>

      </Stack>

      <ConfirmDialog
        open={Boolean(pendingAction)}
        title={pendingAction === "archive" ? "Archive template" : "Unarchive template"}
        message={
          pendingAction === "archive"
            ? `Archive "${draft.name}"? It will be hidden from the active templates list.`
            : `Unarchive "${draft.name}"? It will appear in the active templates list.`
        }
        confirmLabel={pendingAction === "archive" ? "Archive" : "Unarchive"}
        onConfirm={() => {
          save({ status: pendingAction === "archive" ? "Archived" : "Active" });
          setPendingAction(null);
        }}
        onClose={() => setPendingAction(null)}
      />
    </PageLayout>
  );
}
