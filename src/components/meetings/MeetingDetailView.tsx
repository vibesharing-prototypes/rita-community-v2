import { OverflowBreadcrumbs, PageHeader } from "@diligentcorp/atlas-react-bundle";
import AgendaIcon from "@diligentcorp/atlas-react-bundle/icons/Agenda";
import CalendarIcon from "@diligentcorp/atlas-react-bundle/icons/Calendar";
import ClockIcon from "@diligentcorp/atlas-react-bundle/icons/Clock";
import CopyIcon from "@diligentcorp/atlas-react-bundle/icons/Copy";
import EditIcon from "@diligentcorp/atlas-react-bundle/icons/Edit";
import HideIcon from "@diligentcorp/atlas-react-bundle/icons/Hide";
import LocationIcon from "@diligentcorp/atlas-react-bundle/icons/Location";
import MoreIcon from "@diligentcorp/atlas-react-bundle/icons/More";
import NotesIcon from "@diligentcorp/atlas-react-bundle/icons/Notes";
import TrashIcon from "@diligentcorp/atlas-react-bundle/icons/Trash";
import VisibleIcon from "@diligentcorp/atlas-react-bundle/icons/Visible";
import DownloadIcon from "@diligentcorp/atlas-react-bundle/icons/Download";
import {
  Box,
  Button,
  Divider,
  IconButton,
  InputAdornment,
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
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format, parse } from "date-fns";
import { useRef, useState } from "react";

import ConfirmDialog from "./ConfirmDialog";

import PageLayout from "../PageLayout";
import type { Meeting, MeetingVisibility } from "../../types/meetings";
import { isUpcoming } from "../../utils/meetings";
import StatusChip from "./StatusChip";

type MinutesStatus = "None" | "Draft" | "Adopted";

// ── Date + Time picker field ───────────────────────────────────────────────

// Hides the picker's own text field completely — we render our own trigger instead.
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

function DateTimeField({
  date,
  time,
  onSaveDate,
  onSaveTime,
}: {
  date: string;
  time?: string;
  onSaveDate: (val: string) => void;
  onSaveTime: (val: string) => void;
}) {
  const { presets } = useTheme();
  const timePresets = (presets as any).TimePickerPresets?.withAtlasActionBar({ cancelButtonLabel: "Cancel", clearButtonLabel: "Clear" });

  const [dateOpen, setDateOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);
  const dateRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLDivElement>(null);

  const dateValue = new Date(`${date}T12:00:00`);
  const timeValue = time ? parse(time, "h:mm a", new Date()) : null;

  return (
    <Box>
      <Stack direction="row" alignItems="center" gap="8px" sx={{ mb: 0, "& svg": { width: 20, height: 20, flexShrink: 0, color: "text.secondary" } }}>
        <CalendarIcon />
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
          Date and time
        </Typography>
      </Stack>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Stack direction="row" alignItems="center" sx={{ pl: "24px" }}>

          {/* Clickable date text */}
          <Box ref={dateRef} onClick={() => setDateOpen(true)} sx={TRIGGER_SX}>
            {format(dateValue, "EEEE, MMMM d, yyyy")}
          </Box>

          <Typography sx={{ px: "4px", userSelect: "none", color: "text.secondary" }}>·</Typography>

          {/* Clickable time text */}
          <Box ref={timeRef} onClick={() => setTimeOpen(true)} sx={TRIGGER_SX}>
            {time ?? "—"}
          </Box>

          {/* Date picker — field hidden, popper anchored to dateRef */}
          <DatePicker
            open={dateOpen}
            onClose={() => setDateOpen(false)}
            value={dateValue}
            onChange={(val) => {
              if (val) { onSaveDate(format(val, "yyyy-MM-dd")); setDateOpen(false); }
            }}
            closeOnSelect
            slots={{ actionBar: () => null }}
            slotProps={{
              textField: { sx: HIDDEN_FIELD_SX },
              popper: { anchorEl: dateRef.current },
            }}
          />

          {/* Time picker — field hidden, popper anchored to timeRef */}
          <TimePicker
            open={timeOpen}
            onClose={() => setTimeOpen(false)}
            value={timeValue}
            onChange={(val) => { if (val) onSaveTime(format(val, "h:mm a")); }}
            {...timePresets}
            slotProps={{
              ...(timePresets?.slotProps ?? {}),
              textField: { sx: HIDDEN_FIELD_SX },
              popper: { anchorEl: timeRef.current },
            }}
          />

        </Stack>
      </LocalizationProvider>
    </Box>
  );
}

// ── Inline-editable page title ────────────────────────────────────────────

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
        if (e.key === "Escape") { setLocal(value); (e.target as HTMLElement).blur(); }
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
        "& .MuiInput-input.MuiInput-input": { p: "0 4px", fontFamily: "inherit", fontSize: "30px", fontWeight: 600, lineHeight: "38px" },
        "& .MuiInput-root::before": { borderBottom: "none !important" },
      }}
    />
  );
}

// ── Inline-editable single-line field ──────────────────────────────────────

function EditableField({
  icon,
  label,
  value,
  placeholder,
  onSave,
  inputSx,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  placeholder: string;
  onSave: (val: string) => void;
  inputSx?: object;
  href?: string;
}) {
  const [local, setLocal] = useState(value);

  return (
    <Box>
      <Stack direction="row" alignItems="center" gap="8px" sx={{ mb: 0, "& svg": { width: 20, height: 20, flexShrink: 0, color: "text.secondary" } }}>
        {icon}
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
          {label}
        </Typography>
      </Stack>
      <TextField
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={() => { if (local !== value) onSave(local); }}
        onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLElement).blur(); if (e.key === "Escape") setLocal(value); }}
        fullWidth
        variant="standard"
        placeholder={placeholder}
        InputProps={href ? {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={() => window.open(href, "_blank", "noopener,noreferrer")}
                sx={{ color: "text.secondary", mr: "-4px" }}
              >
                <SvgIcon sx={{ width: 18, height: 18 }}>
                  <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" />
                </SvgIcon>
              </IconButton>
            </InputAdornment>
          ),
        } : undefined}
        sx={{
          "& .MuiInput-root": {
            borderRadius: "4px",
            "&:not(.Mui-focused):hover": { backgroundColor: "action.hover" },
          },
          "& .MuiInput-input.MuiInput-input": { pl: "28px", pr: 0, pt: "4px", pb: "4px", ...inputSx },
          "& .MuiInput-root::before": { borderBottom: "none !important" },
        }}
      />
    </Box>
  );
}

// ── Inline-editable multiline field ────────────────────────────────────────

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
      <Stack direction="row" alignItems="center" gap="8px" sx={{ mb: 0, "& svg": { width: 20, height: 20, flexShrink: 0, color: "text.secondary" } }}>
        {icon}
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
          {label}
        </Typography>
      </Stack>
      <TextField
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={() => { if (local !== value) onSave(local); }}
        onKeyDown={(e) => { if (e.key === "Escape") setLocal(value); }}
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

// ── Right-column card shell ────────────────────────────────────────────────

function StatusCard({
  title,
  children,
  dividerColor,
}: {
  title: string;
  children: React.ReactNode;
  dividerColor: string;
}) {
  return (
    <Box
      sx={{
        border: `1px solid ${dividerColor}`,
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${dividerColor}` }}>
        <Typography variant="subtitle2">{title}</Typography>
      </Box>
      <Box sx={{ p: 2 }}>{children}</Box>
    </Box>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export default function MeetingDetailView({
  meeting,
  onBack,
  onUpdate,
  onDuplicate,
  onDelete,
}: {
  meeting: Meeting;
  onBack: () => void;
  onUpdate: (meeting: Meeting) => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
}) {
  const { tokens } = useTheme();
  const dividerColor = tokens?.component?.divider?.colors?.default?.borderColor?.value ?? "#E0E0E0";

  const [draft, setDraft] = useState<Meeting>({ ...meeting });
  const [minutesStatus] = useState<MinutesStatus>("None");
  const [moreMenuAnchor, setMoreMenuAnchor] = useState<HTMLElement | null>(null);
  type PendingAction = 'make-active' | 'make-draft' | 'publish-to-site' | 'remove-from-site' | 'duplicate' | 'delete';
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  const save = (partial: Partial<Meeting>) => {
    const updated = { ...draft, ...partial };
    setDraft(updated);
    onUpdate(updated);
  };

  const isPublic = draft.visibility === "Public";

  return (
    <PageLayout id="page-meeting-detail">
      {/* ── Atlas PageHeader ── */}
      <Box sx={{ borderBottom: `1px solid ${dividerColor}`, pb: "12px" }}>
      <PageHeader
        breadcrumbs={
          <OverflowBreadcrumbs
            items={[
              { id: "meetings", label: "Meetings" },
              { id: "tab", label: isUpcoming(draft.date) ? "Upcoming" : "Previous" },
              { id: "current", label: draft.name, isCurrent: true },
            ]}
          >
            {(item) =>
              item.isCurrent ? (
                <Typography sx={{ fontSize: 14, fontWeight: 600, lineHeight: "20px", letterSpacing: "0.14px", color: "#6f7377", pl: "4px", pr: "12px", py: "4px" }}>{item.label}</Typography>
              ) : item.id === "meetings" ? (
                <Typography sx={{ fontSize: 14, fontWeight: 600, lineHeight: "20px", letterSpacing: "0.14px", color: "#6f7377", pl: "4px", pr: "12px", py: "4px" }}>{item.label}</Typography>
              ) : (
                <Link underline="hover" variant="body1" sx={{ cursor: "pointer" }} onClick={onBack}>
                  {item.label}
                </Link>
              )
            }
          </OverflowBreadcrumbs>
        }
        pageTitle={(<EditableTitleField value={draft.name} onSave={(val) => save({ name: val })} />) as unknown as string}
        pageSubtitle={
          <Stack direction="row" spacing={1} alignItems="center">
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
            <StatusChip label={draft.status} />
          </Stack>
        }
        moreButton={
          <Stack direction="row" spacing={1} alignItems="center">
            {draft.status === "Draft" && (
              <Button variant="contained" onClick={() => setPendingAction("make-active")}>
                Make active
              </Button>
            )}
            <IconButton aria-label="More actions" onClick={(e) => setMoreMenuAnchor(e.currentTarget)}>
              <MoreIcon />
            </IconButton>
            <Menu
              anchorEl={moreMenuAnchor}
              open={Boolean(moreMenuAnchor)}
              onClose={() => setMoreMenuAnchor(null)}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
              <MenuItem onClick={() => { setMoreMenuAnchor(null); setPendingAction("duplicate"); }}>
                <ListItemIcon><CopyIcon /></ListItemIcon>
                <ListItemText>Duplicate</ListItemText>
              </MenuItem>
              {draft.status === "Active" && (
                <MenuItem onClick={() => { setMoreMenuAnchor(null); setPendingAction("make-draft"); }}>
                  <ListItemIcon><EditIcon /></ListItemIcon>
                  <ListItemText>Make draft</ListItemText>
                </MenuItem>
              )}
              <Divider />
              <MenuItem
                onClick={() => { setMoreMenuAnchor(null); setPendingAction("delete"); }}
                sx={{
                  color: "var(--lens-semantic-color-status-error-text)",
                  "& .MuiListItemIcon-root": { color: "var(--lens-semantic-color-status-error-text)" },
                  "& .MuiListItemText-primary": { color: "var(--lens-semantic-color-status-error-text)" },
                  "&:hover .MuiListItemIcon-root": { color: "var(--lens-semantic-color-status-error-text)" },
                  "&:hover .MuiListItemText-primary": { color: "var(--lens-semantic-color-status-error-text)" },
                }}
              >
                <ListItemIcon><TrashIcon /></ListItemIcon>
                <ListItemText>Delete</ListItemText>
              </MenuItem>
            </Menu>
          </Stack>
        }
        containerProps={{ sx: {
          "--lens-component-page-header-desktop-middle-container-padding-bottom": "0px",
          "--lens-component-page-header-desktop-container-gap": "8px",
          "--lens-component-page-header-desktop-title-container-gap": "12px",
          "--lens-component-page-header-tablet-title-container-gap": "12px",
          "& nav.MuiBreadcrumbs-root li:first-child a": { pl: 0 },
          // Force the Atlas title container (flex: 0 1 auto by default) to grow
          "& .MuiStack-root:has(.MuiTextField-root)": { flex: "1 1 auto !important" },
        } }}
      />
      </Box>

      {/* ── Two-column body ── */}
      <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start" }}>

        {/* Left column */}
        <Stack flex={1} gap={2} minWidth={0}>

          {/* Agenda + Minutes cards */}
          <Stack direction="row" gap={1.5}>

            {/* Agenda card */}
            <Box sx={{ flex: 1, border: `1px solid ${dividerColor}`, borderRadius: "12px", p: 2, backgroundColor: "white" }}>
              <Stack direction="row" alignItems="center" gap={1.5}>
                <Box sx={{ backgroundColor: "#E4F3FF", borderRadius: "12px", p: 1, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <AgendaIcon sx={{ width: 24, height: 24 }} />
                </Box>
                <Typography flex={1} minWidth={0} sx={{ fontSize: 18, fontWeight: 600, lineHeight: "28px", letterSpacing: "0.2px" }}>
                  Agenda
                </Typography>
                {draft.agendaItems > 0 ? (
                  <Stack direction="row" alignItems="center" gap={0.5}>
                    <IconButton size="small" aria-label="Download agenda PDF">
                      <DownloadIcon />
                    </IconButton>
                    <Button variant="outlined" size="small">View</Button>
                  </Stack>
                ) : (
                  <Button variant="outlined" size="small" startIcon={
                    <SvgIcon sx={{ width: 16, height: 16 }}><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" /></SvgIcon>
                  }>Add</Button>
                )}
              </Stack>
            </Box>

            {/* Minutes card */}
            <Box sx={{ flex: 1, border: `1px solid ${dividerColor}`, borderRadius: "12px", p: 2, backgroundColor: "white" }}>
              <Stack direction="row" alignItems="center" gap={1.5}>
                <Box sx={{ backgroundColor: "#E4F3FF", borderRadius: "12px", p: 1, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <ClockIcon sx={{ width: 24, height: 24 }} />
                </Box>
                <Typography flex={1} minWidth={0} sx={{ fontSize: 18, fontWeight: 600, lineHeight: "28px", letterSpacing: "0.2px" }}>
                  Minutes
                </Typography>
                {minutesStatus === "None" ? (
                  <Button variant="outlined" size="small" startIcon={
                    <SvgIcon sx={{ width: 16, height: 16 }}><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" /></SvgIcon>
                  }>Create</Button>
                ) : (
                  <Button variant="outlined" size="small" endIcon={
                    <SvgIcon sx={{ width: 16, height: 16 }}><path d="M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" /></SvgIcon>
                  }>Edit</Button>
                )}
              </Stack>
            </Box>

          </Stack>

          {/* Meeting details card */}
          <Box sx={{ border: `1px solid ${dividerColor}`, borderRadius: "12px", p: 3, backgroundColor: "white" }}>
            <Stack gap={3}>
              <DateTimeField
                date={draft.date}
                time={draft.time}
                onSaveDate={(val) => save({ date: val })}
                onSaveTime={(val) => save({ time: val })}
              />
              <EditableField
                icon={<LocationIcon />}
                label="Location"
                value={draft.location ?? ""}
                placeholder="Add location…"
                onSave={(val) => save({ location: val })}
              />
              <EditableMultilineField
                icon={<NotesIcon />}
                label="Description"
                value={draft.description ?? ""}
                placeholder="Add a description…"
                onSave={(val) => save({ description: val })}
              />
              <Box sx={{ pl: "28px" }}>
                <Button
                  variant="outlined"
                  size="small"
                  endIcon={
                    <SvgIcon sx={{ width: 16, height: 16 }}>
                      <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" />
                    </SvgIcon>
                  }
                  onClick={() => draft.videoUrl && window.open(draft.videoUrl, "_blank", "noopener,noreferrer")}
                >
                  Live video
                </Button>
              </Box>
            </Stack>
          </Box>

        </Stack>

        {/* Right column — visibility only */}
        <Stack sx={{ width: 336, flexShrink: 0 }}>
          <Box sx={{ pb: 2.5 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
              <Typography sx={{ fontSize: 20, fontWeight: 600, lineHeight: "24px", letterSpacing: 0 }}>
                Meeting visibility
              </Typography>
              {draft.status === "Active" && (
                <StatusChip label={draft.visibility} />
              )}
            </Stack>
            <Typography sx={{ fontSize: 14, lineHeight: "20px", letterSpacing: "0.2px", color: "text.primary", mb: 1.5 }}>
              {draft.status === "Draft"
                ? "Make this meeting active to control its public site visibility."
                : isPublic
                ? "This meeting, including its agenda and minutes, is visible to anyone on the public site."
                : "This meeting, including its agenda and minutes, is only visible to internal users."}
            </Typography>
            {draft.status === "Draft" ? (
              <Button variant="outlined" size="small" startIcon={<VisibleIcon />} disabled>
                Publish to site
              </Button>
            ) : (
              <Button
                variant="outlined"
                size="small"
                startIcon={isPublic ? <HideIcon /> : <VisibleIcon />}
                onClick={() => setPendingAction(isPublic ? "remove-from-site" : "publish-to-site")}
              >
                {isPublic ? "Remove from site" : "Publish to site"}
              </Button>
            )}
          </Box>
        </Stack>

      </Box>

      <ConfirmDialog
        open={Boolean(pendingAction)}
        title={
          pendingAction === 'make-active' ? 'Make active?' :
          pendingAction === 'make-draft' ? 'Make draft?' :
          pendingAction === 'publish-to-site' ? 'Publish to site?' :
          pendingAction === 'remove-from-site' ? 'Remove from site?' :
          pendingAction === 'duplicate' ? 'Duplicate meeting' :
          'Delete meeting'
        }
        message={
          pendingAction === 'make-active' ? `Make "${draft.name}" active? It will be visible to internal users.` :
          pendingAction === 'make-draft' ? `Move "${draft.name}" back to draft? It will no longer be visible.` :
          pendingAction === 'publish-to-site' ? 'This meeting, including its agenda and any released minutes, will be visible to anyone on the public site.' :
          pendingAction === 'remove-from-site' ? 'This meeting, including its agenda and any released minutes, will no longer be visible on the public site. It will only be accessible to internal users.' :
          pendingAction === 'duplicate' ? `Duplicate "${draft.name}"? A copy will be created as a draft.` :
          `Delete "${draft.name}"? This action cannot be undone.`
        }
        confirmLabel={
          pendingAction === 'make-active' ? 'Make active' :
          pendingAction === 'make-draft' ? 'Make draft' :
          pendingAction === 'publish-to-site' ? 'Publish to site' :
          pendingAction === 'remove-from-site' ? 'Remove from site' :
          pendingAction === 'duplicate' ? 'Duplicate' :
          'Delete'
        }
        destructive={pendingAction === 'delete'}
        onConfirm={() => {
          if (pendingAction === 'make-active') save({ status: 'Active' as const, visibility: 'Internal' as const });
          else if (pendingAction === 'make-draft') save({ status: 'Draft' as const });
          else if (pendingAction === 'publish-to-site') save({ visibility: 'Public' as const });
          else if (pendingAction === 'remove-from-site') save({ visibility: 'Internal' as const });
          else if (pendingAction === 'duplicate') onDuplicate?.();
          else if (pendingAction === 'delete') { setPendingAction(null); onDelete?.(); return; }
          setPendingAction(null);
        }}
        onClose={() => setPendingAction(null)}
      />
    </PageLayout>
  );
}
