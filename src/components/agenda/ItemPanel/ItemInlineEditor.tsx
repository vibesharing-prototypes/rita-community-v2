import CopyIcon from "@diligentcorp/atlas-react-bundle/icons/Copy";
import GroupIcon from "@diligentcorp/atlas-react-bundle/icons/Group";
import LanguageIcon from "@diligentcorp/atlas-react-bundle/icons/Language";
import CustomerAdminIcon from "@diligentcorp/atlas-react-bundle/icons/CustomerAdmin";
import AttachIcon from "@diligentcorp/atlas-react-bundle/icons/Attach";
import LockedIcon from "@diligentcorp/atlas-react-bundle/icons/Locked";
import UnlockedIcon from "@diligentcorp/atlas-react-bundle/icons/Unlocked";
import {
  Box, IconButton, ListItemIcon, ListItemText,
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
      minRows={1}
      fullWidth
      variant="standard"
      placeholder={placeholder}
      inputProps={{ style: { fontSize: 14, lineHeight: "22px", fontFamily: "inherit", padding: 0 } }}
      sx={{
        "& .MuiInput-root": { borderRadius: "4px", py: "2px", alignItems: "flex-start", "&:not(.Mui-focused):hover": { backgroundColor: "action.hover" } },
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
    <Stack
      component="a"
      href="#"
      onClick={(e) => e.preventDefault()}
      direction="row"
      alignItems="center"
      gap={1}
      sx={{
        textDecoration: "none",
        color: "primary.main",
        cursor: "pointer",
        "&:hover .att-name": { textDecoration: "underline" },
      }}
    >
      <AttachIcon sx={{ width: 16, height: 16, color: "text.secondary", flexShrink: 0 }} />
      <Typography
        className="att-name"
        sx={{
          fontSize: 13, fontWeight: 600, color: "primary.main", flex: 1, minWidth: 0,
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
  icon, label, content, attachments, onSave, placeholder, borderColor,
}: {
  icon: React.ReactNode;
  label: string;
  content: string;
  attachments: AgendaAttachment[];
  onSave: (v: string) => void;
  placeholder: string;
  borderColor: string;
}) {
  return (
    <Box sx={{
      pt: "12px", pr: "12px", pl: "12px", pb: "16px",
      border: `1px solid ${borderColor}`,
      borderRadius: "12px",
      bgcolor: "#fff",
    }}>
      <Stack direction="row" alignItems="center" gap={1.5} sx={{ mb: 1 }}>
        <Box sx={{
          backgroundColor: "#E4F3FF",
          borderRadius: "8px",
          p: "4px",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
          "& svg": { width: 20, height: 20, display: "block" },
        }}>
          {icon}
        </Box>
        <Typography sx={{ fontSize: 14, fontWeight: 600, flex: 1 }}>{label}</Typography>
        <IconButton size="small" sx={{ flexShrink: 0 }} aria-label="Attach file">
          <AttachIcon sx={{ width: 18, height: 18 }} />
        </IconButton>
      </Stack>
      <Box sx={{ pl: "40px" }}>
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
  const [membersOnly, setMembersOnly] = useState<boolean>(Boolean(item.membersOnly));
  const [moreAnchor, setMoreAnchor] = useState<null | HTMLElement>(null);

  useEffect(() => {
    setSubject(item.subject);
    setType(item.type[0] ?? "");
    setPublicContent(item.publicContent);
    setStaffContent(item.staffContent);
    setExecutiveContent(item.executiveContent);
    setLastModifiedAt(item.lastModifiedAt ? new Date(item.lastModifiedAt) : null);
    setMembersOnly(Boolean(item.membersOnly));
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
      membersOnly,
      lastModifiedAt: now.toISOString(),
      ...overrides,
    };
  };

  const toggleMembersOnly = () => {
    const next = !membersOnly;
    setMembersOnly(next);
    onSave(saved({ membersOnly: next }));
  };

  return (
    <Box sx={{ pt: 2, pb: 2, pr: 2, pl: "12px", height: "100%", overflowY: "auto", boxSizing: "border-box" }}>

      {/* Header: title + more menu (no card) */}
      <Stack direction="row" alignItems="flex-start" gap={1} sx={{ px: "4px", pb: 2 }}>
        <Box flex={1} minWidth={0}>
          <InlineTitle
            value={subject}
            onSave={(v) => { setSubject(v); onSave(saved({ subject: v })); }}
          />

          {/* Category · Type */}
          <Stack direction="row" alignItems="center" flexWrap="wrap" sx={{ mt: 0.5, rowGap: "4px" }}>
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
            {membersOnly && (
              <Box sx={{
                ml: "8px",
                display: "inline-flex", alignItems: "center", gap: "4px",
                height: 24,
                bgcolor: "#F3F3F3", color: "#515255",
                borderRadius: "9999px",
                border: "1px solid white",
                pl: "4px", pr: "12px", py: "2px",
                whiteSpace: "nowrap",
              }}>
                <Box sx={{ display: "flex", alignItems: "center", flexShrink: 0, "& svg": { width: 16, height: 16, display: "block" } }}>
                  <LockedIcon />
                </Box>
                <Typography sx={{ fontSize: 12, fontWeight: 600, lineHeight: "16px", letterSpacing: "0.3px", color: "inherit" }}>
                  Members only
                </Typography>
              </Box>
            )}
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
          <MenuItem onClick={() => { setMoreAnchor(null); toggleMembersOnly(); }}>
            <ListItemIcon>
              {membersOnly ? <UnlockedIcon /> : <LockedIcon />}
            </ListItemIcon>
            <ListItemText>{membersOnly ? "Make public" : "Make members only"}</ListItemText>
          </MenuItem>
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

      {/* Content sections — separate cards */}
      <Stack gap={1.5}>
        <ContentSection
          icon={<LanguageIcon />}
          label="Public content"
          content={publicContent}
          attachments={item.attachments.public}
          placeholder="Add public content…"
          onSave={(v) => { setPublicContent(v); onSave(saved({ publicContent: v })); }}
          borderColor={borderColor}
        />
        <ContentSection
          icon={<CustomerAdminIcon />}
          label="Admin content"
          content={staffContent}
          attachments={item.attachments.staff}
          placeholder="Add admin content…"
          onSave={(v) => { setStaffContent(v); onSave(saved({ staffContent: v })); }}
          borderColor={borderColor}
        />
        <ContentSection
          icon={<GroupIcon />}
          label="Executive content"
          content={executiveContent}
          attachments={item.attachments.executive}
          placeholder="Add executive content…"
          onSave={(v) => { setExecutiveContent(v); onSave(saved({ executiveContent: v })); }}
          borderColor={borderColor}
        />
      </Stack>
    </Box>
  );
}
