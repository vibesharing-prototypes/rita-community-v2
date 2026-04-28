import CopyIcon from "@diligentcorp/atlas-react-bundle/icons/Copy";
import GroupIcon from "@diligentcorp/atlas-react-bundle/icons/Group";
import HideIcon from "@diligentcorp/atlas-react-bundle/icons/Hide";
import PaperClipIcon from "@diligentcorp/atlas-react-bundle/icons/PaperClip";
import VisibleIcon from "@diligentcorp/atlas-react-bundle/icons/Visible";
import {
  Box, Divider, IconButton, ListItemIcon, ListItemText,
  Menu, MenuItem, Stack, SvgIcon, TextField, Tooltip, Typography, useTheme,
} from "@mui/material";
import { differenceInHours, differenceInMinutes, format, isSameDay } from "date-fns";
import { useEffect, useState } from "react";
import type { AgendaAttachment, AgendaCategory, AgendaItem, AgendaItemType } from "../../../types/agenda";

const ALL_TYPES: AgendaItemType[] = [
  "Action", "Action (Consent)", "Minutes", "Information",
  "Discussion", "Reports", "Procedural", "Presentation", "Good News",
];

const PATH_MORE = "M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z";
const PATH_TRASH = "M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z";

// ── Inline title ───────────────────────────────────────────────────────────

function InlineTitle({ value, onSave }: { value: string; onSave: (v: string) => void }) {
  const [val, setVal] = useState(value);

  useEffect(() => { setVal(value); }, [value]);

  return (
    <TextField
      value={val}
      onChange={(e) => setVal(e.target.value)}
      onBlur={() => {
        const trimmed = val.trim();
        if (trimmed && trimmed !== value) onSave(trimmed);
        else setVal(value);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") { e.preventDefault(); (e.target as HTMLElement).blur(); }
        if (e.key === "Escape") { setVal(value); (e.target as HTMLElement).blur(); }
      }}
      fullWidth
      variant="standard"
      inputProps={{ style: { fontSize: 20, fontWeight: 600, lineHeight: "28px", letterSpacing: "0.15px", fontFamily: "inherit", padding: 0 } }}
      sx={{
        mx: "-4px",
        "& .MuiInput-root": { borderRadius: "4px", px: "4px", "&:not(.Mui-focused):hover": { backgroundColor: "action.hover" } },
        "& .MuiInput-root::before": { borderBottom: "none !important" },
        "& .MuiInput-root::after": { borderBottom: "none" },
      }}
    />
  );
}

// ── Inline description ─────────────────────────────────────────────────────

function InlineDescription({
  value, onSave, placeholder,
}: { value: string; onSave: (v: string) => void; placeholder: string }) {
  const [val, setVal] = useState(value);

  useEffect(() => { setVal(value); }, [value]);

  return (
    <TextField
      value={val}
      onChange={(e) => setVal(e.target.value)}
      onBlur={() => { if (val !== value) onSave(val); }}
      onKeyDown={(e) => { if (e.key === "Escape") { setVal(value); (e.target as HTMLElement).blur(); } }}
      multiline
      minRows={3}
      fullWidth
      variant="standard"
      placeholder={placeholder}
      inputProps={{ style: { fontSize: 14, lineHeight: "22px", fontFamily: "inherit", padding: 0 } }}
      sx={{
        mx: "-4px",
        "& .MuiInput-root": { borderRadius: "4px", px: "4px", py: "4px", alignItems: "flex-start", "&:not(.Mui-focused):hover": { backgroundColor: "action.hover" } },
        "& .MuiInput-root::before": { borderBottom: "none !important" },
        "& .MuiInput-root::after": { borderBottom: "none" },
      }}
    />
  );
}

// ── Type selector ─────────────────────────────────────────────────────────

const PATH_CHEVRON_DOWN = "M7 10l5 5 5-5z";

function TypeSelect({ value, onChange }: { value: AgendaItemType | ""; onChange: (v: AgendaItemType | "") => void }) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  return (
    <>
      <Box
        component="button"
        onClick={(e) => setAnchor(e.currentTarget)}
        sx={{
          background: "none", border: "none", cursor: "pointer", p: 0,
          fontSize: 13, color: "text.secondary", fontFamily: "inherit", lineHeight: "20px",
          display: "inline-flex", alignItems: "center", gap: "2px",
          borderRadius: "4px", px: "4px", mx: "-4px",
          "&:hover": { bgcolor: "action.hover" },
        }}
      >
        <span>{value || "No type"}</span>
        <SvgIcon sx={{ width: 16, height: 16, flexShrink: 0 }}>
          <path d={PATH_CHEVRON_DOWN} />
        </SvgIcon>
      </Box>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
      >
        <MenuItem onClick={() => { onChange(""); setAnchor(null); }} sx={{ fontSize: 13 }}>
          <em>No type</em>
        </MenuItem>
        {ALL_TYPES.map((t) => (
          <MenuItem key={t} onClick={() => { onChange(t); setAnchor(null); }} sx={{ fontSize: 13 }}>{t}</MenuItem>
        ))}
      </Menu>
    </>
  );
}

// ── Attachment row ─────────────────────────────────────────────────────────

function AttachmentRow({ att }: { att: AgendaAttachment }) {
  return (
    <Stack direction="row" alignItems="center" gap={1}>
      <PaperClipIcon sx={{ width: 16, height: 16, color: "text.secondary", flexShrink: 0 }} />
      <Typography
        sx={{
          fontSize: 13, color: "primary.main", flex: 1, minWidth: 0,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}
      >
        {att.filename}
      </Typography>
    </Stack>
  );
}

// ── Content section ────────────────────────────────────────────────────────

function ContentSection({
  icon, label, content, attachments, onSave, placeholder,
}: {
  icon: React.ReactNode;
  label: string;
  content: string;
  attachments: AgendaAttachment[];
  onSave: (v: string) => void;
  placeholder: string;
}) {
  return (
    <Box sx={{ px: 2.5, py: 2 }}>
      <Stack
        direction="row"
        alignItems="center"
        gap={1}
        sx={{ mb: 1, "& > svg:first-of-type": { width: 20, height: 20, color: "text.secondary", flexShrink: 0 } }}
      >
        {icon}
        <Typography sx={{ fontSize: 14, fontWeight: 600, flex: 1 }}>{label}</Typography>
        <IconButton size="small" disabled sx={{ color: "text.secondary", flexShrink: 0 }}>
          <PaperClipIcon sx={{ width: 18, height: 18 }} />
        </IconButton>
      </Stack>
      <Box sx={{ pl: "28px" }}>
        <InlineDescription value={content} onSave={onSave} placeholder={placeholder} />
        {attachments.length > 0 && (
          <Stack gap={0.75} sx={{ mt: 1.5 }}>
            {attachments.map((att) => <AttachmentRow key={att.id} att={att} />)}
          </Stack>
        )}
      </Box>
    </Box>
  );
}

// ── Edited label ──────────────────────────────────────────────────────────

function formatEditedLabel(date: Date): string {
  const now = new Date();
  const mins = differenceInMinutes(now, date);
  if (mins < 1) return "Edited just now";
  if (mins < 60) return `Edited ${mins}m ago`;
  const hours = differenceInHours(now, date);
  if (isSameDay(now, date)) return `Edited ${hours}h ago`;
  return `Edited on ${format(date, "MMMM d")}`;
}

// ── Main component ─────────────────────────────────────────────────────────

export default function ItemInlineEditor({
  item,
  categories,
  onSave,
  onDelete,
  onDuplicate,
}: {
  item: AgendaItem;
  categories: AgendaCategory[];
  onSave: (updated: AgendaItem) => void;
  onDelete: (id: string) => void;
  onDuplicate: (item: AgendaItem) => void;
}) {
  const { tokens } = useTheme();
  const borderColor = tokens?.component?.divider?.colors?.default?.borderColor?.value ?? "#E0E0E0";
  const category = categories.find((c) => c.id === item.categoryId);

  const [subject, setSubject] = useState(item.subject);
  const [type, setType] = useState<AgendaItemType | "">(item.type[0] ?? "");
  const [publicContent, setPublicContent] = useState(item.publicContent);
  const [staffContent, setStaffContent] = useState(item.staffContent);
  const [executiveContent, setExecutiveContent] = useState(item.executiveContent);
  const [lastModifiedAt, setLastModifiedAt] = useState<Date | null>(
    item.lastModifiedAt ? new Date(item.lastModifiedAt) : null
  );
  const [moreAnchor, setMoreAnchor] = useState<null | HTMLElement>(null);

  useEffect(() => {
    setSubject(item.subject);
    setType(item.type[0] ?? "");
    setPublicContent(item.publicContent);
    setStaffContent(item.staffContent);
    setExecutiveContent(item.executiveContent);
    setLastModifiedAt(item.lastModifiedAt ? new Date(item.lastModifiedAt) : null);
  }, [item.id]);

  const saved = (overrides: Partial<AgendaItem> = {}) => {
    const now = new Date();
    setLastModifiedAt(now);
    return {
      ...item,
      subject,
      type: type ? [type] : [],
      publicContent,
      staffContent,
      executiveContent,
      lastModifiedAt: now.toISOString(),
      ...overrides,
    };
  };

  return (
    <Box sx={{ p: 2, height: "100%", overflowY: "auto", boxSizing: "border-box" }}>
      <Box sx={{ border: `1px solid ${borderColor}`, borderRadius: "12px", bgcolor: "#fff", overflow: "hidden" }}>

        {/* Header: title + more menu */}
        <Stack direction="row" alignItems="flex-start" gap={1} sx={{ px: 2.5, pt: 2.5, pb: 2 }}>
          <Box flex={1} minWidth={0}>
            <InlineTitle
              value={subject}
              onSave={(v) => { setSubject(v); onSave(saved({ subject: v })); }}
            />

            {/* Category · Type */}
            <Stack direction="row" alignItems="center" sx={{ mt: 0.5 }}>
              {category && (
                <Typography sx={{ fontSize: 13, color: "text.secondary", whiteSpace: "nowrap" }}>
                  {category.name}
                </Typography>
              )}
              {category && (
                <Typography sx={{ fontSize: 13, color: "text.secondary", mx: "4px" }}>·</Typography>
              )}
              <TypeSelect
                value={type}
                onChange={(v) => { setType(v); onSave(saved({ type: v ? [v as AgendaItemType] : [] })); }}
              />
            </Stack>

            {/* Edited label */}
            {lastModifiedAt && (
              <Tooltip title={`Edited by you on ${format(lastModifiedAt, "MMMM d")} at ${format(lastModifiedAt, "h:mm a")}`} placement="bottom-start">
                <Typography sx={{ fontSize: 12, color: "var(--lens-semantic-color-type-muted)", lineHeight: "16px", letterSpacing: "0.3px", cursor: "default", mt: 0.25 }}>
                  {formatEditedLabel(lastModifiedAt)}
                </Typography>
              </Tooltip>
            )}
          </Box>

          {/* More button */}
          <IconButton
            size="small"
            onClick={(e) => setMoreAnchor(e.currentTarget)}
            sx={{ flexShrink: 0, mt: "2px" }}
          >
            <SvgIcon sx={{ width: 20, height: 20 }}><path d={PATH_MORE} /></SvgIcon>
          </IconButton>
          <Menu
            anchorEl={moreAnchor}
            open={Boolean(moreAnchor)}
            onClose={() => setMoreAnchor(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <MenuItem onClick={() => { setMoreAnchor(null); onDuplicate(item); }}>
              <ListItemIcon><CopyIcon /></ListItemIcon>
              <ListItemText>Duplicate</ListItemText>
            </MenuItem>
            <Box sx={{ borderBottom: "1px solid", borderColor: "divider" }} />
            <MenuItem
              onClick={() => { setMoreAnchor(null); onDelete(item.id); }}
              sx={{
                color: "var(--lens-semantic-color-status-error-text)",
                "& .MuiListItemIcon-root": { color: "var(--lens-semantic-color-status-error-text)" },
                "& .MuiListItemText-primary": { color: "var(--lens-semantic-color-status-error-text)" },
                "&:hover .MuiListItemIcon-root": { color: "var(--lens-semantic-color-status-error-text)" },
                "&:hover .MuiListItemText-primary": { color: "var(--lens-semantic-color-status-error-text)" },
              }}
            >
              <ListItemIcon>
                <SvgIcon sx={{ width: 18, height: 18 }}><path d={PATH_TRASH} /></SvgIcon>
              </ListItemIcon>
              <ListItemText>Delete</ListItemText>
            </MenuItem>
          </Menu>
        </Stack>

        {/* Content sections */}
        <Divider />
        <ContentSection
          icon={<VisibleIcon />}
          label="Public content"
          content={publicContent}
          attachments={item.attachments.public}
          placeholder="Add public content…"
          onSave={(v) => { setPublicContent(v); onSave(saved({ publicContent: v })); }}
        />
        <Divider />
        <ContentSection
          icon={<HideIcon />}
          label="Staff content"
          content={staffContent}
          attachments={item.attachments.staff}
          placeholder="Add staff content…"
          onSave={(v) => { setStaffContent(v); onSave(saved({ staffContent: v })); }}
        />
        <Divider />
        <ContentSection
          icon={<GroupIcon />}
          label="Executive content"
          content={executiveContent}
          attachments={item.attachments.executive}
          placeholder="Add executive content…"
          onSave={(v) => { setExecutiveContent(v); onSave(saved({ executiveContent: v })); }}
        />

      </Box>
    </Box>
  );
}
