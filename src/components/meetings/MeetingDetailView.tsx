import { OverflowBreadcrumbs, PageHeader } from "@diligentcorp/atlas-react-bundle";
import AgendaIcon from "@diligentcorp/atlas-react-bundle/icons/Agenda";
import CalendarIcon from "@diligentcorp/atlas-react-bundle/icons/Calendar";
import ClockIcon from "@diligentcorp/atlas-react-bundle/icons/Clock";
import CopyIcon from "@diligentcorp/atlas-react-bundle/icons/Copy";
import LockedIcon from "@diligentcorp/atlas-react-bundle/icons/Locked";
import LocationIcon from "@diligentcorp/atlas-react-bundle/icons/Location";
import MoreIcon from "@diligentcorp/atlas-react-bundle/icons/More";
import NotesIcon from "@diligentcorp/atlas-react-bundle/icons/Notes";
import TrashIcon from "@diligentcorp/atlas-react-bundle/icons/Trash";
import UnlockedIcon from "@diligentcorp/atlas-react-bundle/icons/Unlocked";
import VideoIcon from "@diligentcorp/atlas-react-bundle/icons/Video";
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
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format, parse } from "date-fns";
import { useState } from "react";

import ConfirmDialog from "./ConfirmDialog";

import PageLayout from "../PageLayout";
import type { Meeting, MeetingVisibility } from "../../types/meetings";
import { isUpcoming } from "../../utils/meetings";
import StatusChip from "./StatusChip";

type MinutesStatus = "None" | "Draft" | "Adopted";

// ── Date + Time picker field ───────────────────────────────────────────────

const PICKER_INPUT_SX = {
  "& .MuiInput-root": {
    borderRadius: "4px",
    "&:not(.Mui-focused):hover": { backgroundColor: "action.hover" },
  },
  "& .MuiInput-input.MuiInput-input": { pl: "4px", pr: 0, pt: "4px", pb: "4px" },
  "& .MuiInput-root::before": { borderBottom: "none !important" },
  "& .MuiInput-root::after": { borderBottom: "none" },
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
  const datePresets = (presets as any).DatePickerPresets?.withAtlasActionBar({ cancelButtonLabel: "Cancel", clearButtonLabel: "Clear" });
  const timePresets = (presets as any).TimePickerPresets?.withAtlasActionBar({ cancelButtonLabel: "Cancel", clearButtonLabel: "Clear" });

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
        <Stack direction="row" alignItems="center" gap={1} sx={{ pl: "28px" }}>
          <DatePicker
            value={dateValue}
            onChange={(val) => { if (val) onSaveDate(format(val, "yyyy-MM-dd")); }}
            {...datePresets}
            slotProps={{ textField: { variant: "standard", sx: { ...PICKER_INPUT_SX, minWidth: 0 } } }}
          />
          <TimePicker
            value={timeValue}
            onChange={(val) => { if (val) onSaveTime(format(val, "h:mm a")); }}
            {...timePresets}
            slotProps={{ textField: { variant: "standard", sx: { ...PICKER_INPUT_SX, width: 110 } } }}
          />
        </Stack>
      </LocalizationProvider>
    </Box>
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
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  placeholder: string;
  onSave: (val: string) => void;
  inputSx?: object;
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
  type PendingAction = 'make-public' | 'make-internal' | 'duplicate' | 'delete';
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
                <Typography variant="body1">{item.label}</Typography>
              ) : item.id === "meetings" ? (
                <Typography variant="body1">{item.label}</Typography>
              ) : (
                <Link underline="hover" variant="body1" sx={{ cursor: "pointer" }} onClick={onBack}>
                  {item.label}
                </Link>
              )
            }
          </OverflowBreadcrumbs>
        }
        pageTitle={draft.name}
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
            {draft.status === "Published" && <StatusChip label={draft.visibility} />}
          </Stack>
        }
        moreButton={
          <Stack direction="row" spacing={1} alignItems="center">
            {draft.status === "Draft" ? (
              <Button variant="contained" onClick={() => save({ status: "Published" })}>
                Publish
              </Button>
            ) : (
              <Button variant="outlined" onClick={() => save({ status: "Draft" })}>
                Unpublish
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
              {draft.status === "Published" && (
                <MenuItem onClick={() => { setMoreMenuAnchor(null); setPendingAction(isPublic ? "make-internal" : "make-public"); }}>
                  <ListItemIcon>{isPublic ? <LockedIcon /> : <UnlockedIcon />}</ListItemIcon>
                  <ListItemText>{isPublic ? "Make internal" : "Make public"}</ListItemText>
                </MenuItem>
              )}
              <MenuItem onClick={() => { setMoreMenuAnchor(null); setPendingAction("duplicate"); }}>
                <ListItemIcon><CopyIcon /></ListItemIcon>
                <ListItemText>Duplicate</ListItemText>
              </MenuItem>
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
        } }}
      />
      </Box>

      {/* ── Two-column body ── */}
      <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start" }}>

        {/* Left column — metadata */}
        <Stack flex={1} gap="24px" minWidth={0}>

          {/* Fields */}
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
          <EditableField
            icon={<VideoIcon />}
            label="Live video"
            value={draft.videoUrl ?? ""}
            placeholder="Add broadcast link…"
            onSave={(val) => save({ videoUrl: val })}
            inputSx={draft.videoUrl ? { fontWeight: 600, textDecoration: "underline" } : {}}
          />
        </Stack>

        {/* Right column — meeting content */}
        <Stack gap={1.5} sx={{ width: 300, flexShrink: 0 }}>

          <Typography variant="h3" sx={{ fontSize: 22, fontWeight: 600, lineHeight: "28px", letterSpacing: 0 }}>
            Meeting content
          </Typography>

          {/* Agenda card */}
          <Box sx={{ border: `1px solid ${dividerColor}`, borderRadius: "12px", p: 2, backgroundColor: "white" }}>
            <Stack direction="row" alignItems="center" gap={1.5}>
              <Box sx={{
                backgroundColor: "#E4F3FF",
                borderRadius: "12px",
                p: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}>
                <AgendaIcon sx={{ width: 24, height: 24 }} />
              </Box>
              <Box flex={1} minWidth={0}>
                <Typography sx={{ fontSize: 18, fontWeight: 600, lineHeight: "28px", letterSpacing: "0.2px" }}>
                  Agenda
                </Typography>
              </Box>
              <Button variant="outlined" size="small">View</Button>
            </Stack>
          </Box>

          {/* Minutes card */}
          <Box sx={{ border: `1px solid ${dividerColor}`, borderRadius: "12px", p: 2, backgroundColor: "white" }}>
            <Stack direction="row" alignItems="center" gap={1.5}>
              <Box sx={{
                backgroundColor: "#E4F3FF",
                borderRadius: "12px",
                p: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}>
                <ClockIcon sx={{ width: 24, height: 24 }} />
              </Box>
              <Box flex={1} minWidth={0}>
                <Typography sx={{ fontSize: 18, fontWeight: 600, lineHeight: "28px", letterSpacing: "0.2px" }}>
                  Minutes
                </Typography>
              </Box>
              {minutesStatus === "None" ? (
                <Button variant="outlined" size="small" startIcon={
                  <SvgIcon sx={{ width: 16, height: 16 }}><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" /></SvgIcon>
                }>
                  Add
                </Button>
              ) : (
                <Button variant="outlined" size="small" endIcon={
                  <SvgIcon sx={{ width: 16, height: 16 }}><path d="M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" /></SvgIcon>
                }>
                  Edit
                </Button>
              )}
            </Stack>
          </Box>

        </Stack>
      </Box>

      <ConfirmDialog
        open={Boolean(pendingAction)}
        title={
          pendingAction === 'make-public' ? 'Make public' :
          pendingAction === 'make-internal' ? 'Make internal' :
          pendingAction === 'duplicate' ? 'Duplicate meeting' :
          'Delete meeting'
        }
        message={
          pendingAction === 'make-public' ? `Make "${draft.name}" public? It will be visible to all site visitors.` :
          pendingAction === 'make-internal' ? `Make "${draft.name}" internal? Only members will be able to see it.` :
          pendingAction === 'duplicate' ? `Duplicate "${draft.name}"? A copy will be created as a draft.` :
          `Delete "${draft.name}"? This action cannot be undone.`
        }
        confirmLabel={
          pendingAction === 'make-public' ? 'Make public' :
          pendingAction === 'make-internal' ? 'Make internal' :
          pendingAction === 'duplicate' ? 'Duplicate' :
          'Delete'
        }
        destructive={pendingAction === 'delete'}
        onConfirm={() => {
          if (pendingAction === 'make-public') save({ visibility: 'Public' as const });
          else if (pendingAction === 'make-internal') save({ visibility: 'Internal' as const });
          else if (pendingAction === 'duplicate') onDuplicate?.();
          else if (pendingAction === 'delete') { setPendingAction(null); onDelete?.(); return; }
          setPendingAction(null);
        }}
        onClose={() => setPendingAction(null)}
      />
    </PageLayout>
  );
}
