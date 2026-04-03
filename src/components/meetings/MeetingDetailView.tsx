import { OverflowBreadcrumbs, PageHeader } from "@diligentcorp/atlas-react-bundle";
import CalendarIcon from "@diligentcorp/atlas-react-bundle/icons/Calendar";
import DownloadIcon from "@diligentcorp/atlas-react-bundle/icons/Download";
import LocationIcon from "@diligentcorp/atlas-react-bundle/icons/Location";
import NotesIcon from "@diligentcorp/atlas-react-bundle/icons/Notes";
import MoreIcon from "@diligentcorp/atlas-react-bundle/icons/More";
import VideoIcon from "@diligentcorp/atlas-react-bundle/icons/Video";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Link,
  Stack,
  SvgIcon,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { useState } from "react";

import PageLayout from "../PageLayout";
import type { Meeting, MeetingVisibility } from "../../types/meetings";
import { formatDateLong } from "../../utils/meetings";
import StatusChip from "./StatusChip";

type MinutesStatus = "None" | "Draft" | "Adopted";

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
      <Stack direction="row" alignItems="center" gap="8px" sx={{ mb: "4px", "& svg": { width: 20, height: 20, flexShrink: 0, color: "text.secondary" } }}>
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
          "& .MuiInput-input.MuiInput-input": { pl: "28px", pr: 0, ...inputSx },
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
      <Stack direction="row" alignItems="center" gap="8px" sx={{ mb: "4px", "& svg": { width: 20, height: 20, flexShrink: 0, color: "text.secondary" } }}>
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
          "& .MuiInput-input.MuiInput-input": { pl: "28px", pr: 0 },
          "& .MuiInput-root::before": { borderBottom: "none !important" },
        }}
      />
    </Box>
  );
}

// ── Inline-editable title ──────────────────────────────────────────────────

function EditableTitle({
  value,
  onSave,
}: {
  value: string;
  onSave: (val: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [local, setLocal] = useState(value);

  const commit = () => {
    setEditing(false);
    if (local.trim() && local !== value) onSave(local.trim());
    else setLocal(value);
  };

  if (editing) {
    return (
      <TextField
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") { setLocal(value); setEditing(false); } }}
        autoFocus
        fullWidth
        inputProps={{ style: { fontSize: "1.5rem", fontWeight: 600, lineHeight: 1.3, padding: "2px 0" } }}
        variant="standard"
      />
    );
  }

  return (
    <Typography
      variant="h5"
      onClick={() => { setLocal(value); setEditing(true); }}
      sx={{
        fontWeight: 600,
        fontSize: "1.5rem",
        lineHeight: 1.3,
        cursor: "text",
        borderRadius: "4px",
        px: 0.5,
        mx: -0.5,
        "&:hover": { backgroundColor: "action.hover" },
      }}
    >
      {value}
    </Typography>
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

// ── Visibility confirmation dialog ────────────────────────────────────────

function VisibilityConfirmDialog({
  open,
  targetVisibility,
  onConfirm,
  onClose,
}: {
  open: boolean;
  targetVisibility: MeetingVisibility | null;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const toPublic = targetVisibility === "Public";
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        {toPublic ? "Publish to public site?" : "Make meeting internal?"}
        <Box component="p" sx={{ m: 0 }}>
          {toPublic
            ? "This meeting will be visible to anyone on the public site, including agenda and documents."
            : "This meeting will be hidden from the public site and accessible to admins only."}
        </Box>
        <IconButton
          aria-label="Close"
          onClick={onClose}
          sx={{ position: "absolute", top: 8, right: 8 }}
        >
          <SvgIcon><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></SvgIcon>
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ pt: 1 }}>
          <Button variant="outlined" onClick={onClose}>Cancel</Button>
          <Button variant="contained" color={toPublic ? "primary" : "warning"} onClick={onConfirm}>
            {toPublic ? "Publish to public" : "Make internal"}
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export default function MeetingDetailView({
  meeting,
  onBack,
  onUpdate,
}: {
  meeting: Meeting;
  onBack: () => void;
  onUpdate: (meeting: Meeting) => void;
}) {
  const { tokens } = useTheme();
  const dividerColor = tokens?.component?.divider?.colors?.default?.borderColor?.value ?? "#E0E0E0";

  const [draft, setDraft] = useState<Meeting>({ ...meeting });
  const [minutesStatus] = useState<MinutesStatus>("None");
  const [visibilityConfirmOpen, setVisibilityConfirmOpen] = useState(false);
  const [pendingVisibility, setPendingVisibility] = useState<MeetingVisibility | null>(null);
  const save = (partial: Partial<Meeting>) => {
    const updated = { ...draft, ...partial };
    setDraft(updated);
    onUpdate(updated);
  };

  const requestVisibilityChange = (to: MeetingVisibility) => {
    setPendingVisibility(to);
    setVisibilityConfirmOpen(true);
  };

  const confirmVisibilityChange = () => {
    if (pendingVisibility) save({ visibility: pendingVisibility });
    setVisibilityConfirmOpen(false);
    setPendingVisibility(null);
  };

  const isPublic = draft.visibility === "Public";
  const minutesStatusColor: Record<MinutesStatus, string> = {
    None: "#9E9E9E",
    Draft: "#ED6C02",
    Adopted: "#2E7D32",
  };

  return (
    <PageLayout id="page-meeting-detail">
      {/* ── Atlas PageHeader ── */}
      <Box sx={{ borderBottom: `1px solid ${dividerColor}`, pb: "12px" }}>
      <PageHeader
        breadcrumbs={
          <OverflowBreadcrumbs
            items={[
              { id: "meetings", label: "Meetings" },
              { id: "current", label: draft.name, isCurrent: true },
            ]}
          >
            {(item) =>
              item.isCurrent ? (
                <Typography variant="body2">{item.label}</Typography>
              ) : (
                <Link underline="hover" variant="body2" sx={{ cursor: "pointer" }} onClick={onBack}>
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
          </Stack>
        }
        slotProps={{ backButton: { onClick: onBack, "aria-label": "Back to meetings" } }}
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
            <IconButton aria-label="More actions">
              <MoreIcon />
            </IconButton>
          </Stack>
        }
        containerProps={{ sx: { "--lens-component-page-header-desktop-middle-container-padding-bottom": "0px", "--lens-component-page-header-desktop-container-gap": "8px" } }}
      />
      </Box>

      {/* ── Two-column body ── */}
      <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start" }}>

        {/* Left column — metadata */}
        <Stack flex={1} gap="24px" minWidth={0}>

          {/* Fields */}
          <EditableField
            icon={<CalendarIcon />}
            label="Date and time"
            value={`${formatDateLong(draft.date)}${draft.time ? ` · ${draft.time}` : ""}`}
            placeholder="Add date and time…"
            onSave={(val) => save({ time: val })}
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

        {/* Right column — status cards */}
        <Stack gap={2} sx={{ width: 300, flexShrink: 0 }}>

          {/* Visibility card — only shown for published meetings */}
          {draft.status === "Published" && (
            <StatusCard title="Visibility" dividerColor={dividerColor}>
              <Box
                sx={{
                  borderRadius: "8px",
                  p: 1.5,
                  mb: 1.5,
                  backgroundColor: isPublic ? "#F0FFF4" : "#FFF8E1",
                  border: `1px solid ${isPublic ? "#A5D6A7" : "#FFE082"}`,
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600, color: isPublic ? "#2E7D32" : "#E65100" }}>
                  {isPublic ? "Published — visible on public site" : "Internal — admins only"}
                </Typography>
              </Box>
              <Button
                fullWidth
                variant="outlined"
                size="small"
                color={isPublic ? "warning" : "primary"}
                onClick={() => requestVisibilityChange(isPublic ? "Internal" : "Public")}
              >
                {isPublic ? "Make internal" : "Publish to public"}
              </Button>
            </StatusCard>
          )}

          {/* Agenda card */}
          <Box sx={{ border: `1px solid ${dividerColor}`, borderRadius: "12px", p: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="subtitle2">Agenda</Typography>
              <Stack direction="row" spacing={1}>
                <IconButton size="small" aria-label="Download agenda">
                  <DownloadIcon />
                </IconButton>
                <Button variant="outlined" size="small" endIcon={
                  <SvgIcon sx={{ width: 16, height: 16 }}><path d="M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" /></SvgIcon>
                }>
                  View
                </Button>
              </Stack>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {draft.agendaCategories} {draft.agendaCategories === 1 ? "category" : "categories"} · {draft.agendaItems} {draft.agendaItems === 1 ? "item" : "items"}
            </Typography>
          </Box>

          {/* Minutes card */}
          <Box sx={{ border: `1px solid ${dividerColor}`, borderRadius: "12px", p: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle2">Minutes</Typography>
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

      {/* ── Visibility confirmation dialog ── */}
      <VisibilityConfirmDialog
        open={visibilityConfirmOpen}
        targetVisibility={pendingVisibility}
        onConfirm={confirmVisibilityChange}
        onClose={() => { setVisibilityConfirmOpen(false); setPendingVisibility(null); }}
      />
    </PageLayout>
  );
}
