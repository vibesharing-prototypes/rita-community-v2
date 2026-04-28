import CopyIcon from "@diligentcorp/atlas-react-bundle/icons/Copy";
import {
  Box, Button, IconButton, ListItemIcon, ListItemText,
  Menu, MenuItem, Select, Stack, SvgIcon, TextField, Typography, useTheme,
} from "@mui/material";
import { useEffect, useState } from "react";
import type { AgendaAttachment, AgendaCategory, AgendaItem, AgendaItemType } from "../../../types/agenda";

const ALL_TYPES: AgendaItemType[] = [
  "Action", "Action (Consent)", "Minutes", "Information",
  "Discussion", "Reports", "Procedural", "Presentation", "Good News",
];

const PATH_EYE_OPEN = "M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z";
const PATH_EYE_OFF = "M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z";
const PATH_PEOPLE = "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z";
const PATH_PAPERCLIP = "M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z";
const PATH_MORE = "M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z";
const PATH_TRASH = "M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z";

// ── Inline title ───────────────────────────────────────────────────────────

function InlineTitle({ value, onSave }: { value: string; onSave: (v: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);

  useEffect(() => { setVal(value); }, [value]);

  const commit = () => {
    setEditing(false);
    const trimmed = val.trim();
    if (trimmed && trimmed !== value) onSave(trimmed);
    else setVal(value);
  };

  if (editing) {
    return (
      <TextField
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") { e.preventDefault(); commit(); }
          if (e.key === "Escape") { setVal(value); setEditing(false); }
        }}
        autoFocus
        fullWidth
        variant="standard"
        inputProps={{ style: { fontSize: 20, fontWeight: 600, lineHeight: "28px", letterSpacing: "0.15px" } }}
        sx={{
          "& .MuiInput-underline:before": { borderBottomColor: "transparent" },
          "& .MuiInput-underline:hover:before": { borderBottomColor: "transparent !important" },
        }}
      />
    );
  }

  return (
    <Typography
      onClick={() => setEditing(true)}
      sx={{
        fontSize: 20, fontWeight: 600, lineHeight: "28px", letterSpacing: "0.15px",
        cursor: "text", borderRadius: "4px", px: "4px", mx: "-4px",
        "&:hover": { bgcolor: "action.hover" },
      }}
    >
      {value}
    </Typography>
  );
}

// ── Inline description ─────────────────────────────────────────────────────

function InlineDescription({
  value, onSave, placeholder,
}: { value: string; onSave: (v: string) => void; placeholder: string }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);

  useEffect(() => { setVal(value); }, [value]);

  const commit = () => {
    setEditing(false);
    if (val !== value) onSave(val);
  };

  if (editing) {
    return (
      <TextField
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={commit}
        autoFocus
        multiline
        minRows={3}
        fullWidth
        variant="standard"
        placeholder={placeholder}
        inputProps={{ style: { fontSize: 14, lineHeight: "22px" } }}
        sx={{
          "& .MuiInput-underline:before": { borderBottomColor: "transparent" },
          "& .MuiInput-underline:hover:before": { borderBottomColor: "transparent !important" },
        }}
      />
    );
  }

  return (
    <Box
      onClick={() => setEditing(true)}
      sx={{
        minHeight: 66, cursor: "text", borderRadius: "4px",
        px: "4px", mx: "-4px",
        "&:hover": { bgcolor: "action.hover" },
      }}
    >
      {value ? (
        <Typography sx={{ fontSize: 14, lineHeight: "22px", whiteSpace: "pre-wrap" }}>{value}</Typography>
      ) : (
        <Typography sx={{ fontSize: 14, lineHeight: "22px", color: "text.disabled" }}>{placeholder}</Typography>
      )}
    </Box>
  );
}

// ── Attachment row ─────────────────────────────────────────────────────────

function AttachmentRow({ att }: { att: AgendaAttachment }) {
  return (
    <Stack direction="row" alignItems="center" gap={1}>
      <SvgIcon sx={{ width: 16, height: 16, color: "text.secondary", flexShrink: 0 }}>
        <path d={PATH_PAPERCLIP} />
      </SvgIcon>
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

// ── Content card ───────────────────────────────────────────────────────────

function ContentCard({
  iconPath, label, content, attachments, onSave, placeholder,
}: {
  iconPath: string;
  label: string;
  content: string;
  attachments: AgendaAttachment[];
  onSave: (v: string) => void;
  placeholder: string;
}) {
  const { tokens } = useTheme();
  const borderColor = tokens?.component?.divider?.colors?.default?.borderColor?.value ?? "#E0E0E0";

  return (
    <Box sx={{ border: `1px solid ${borderColor}`, borderRadius: "8px", overflow: "hidden" }}>
      <Stack
        direction="row"
        alignItems="center"
        gap={1}
        sx={{ px: 2, py: 1.25, borderBottom: `1px solid ${borderColor}` }}
      >
        <SvgIcon sx={{ width: 20, height: 20, color: "text.secondary", flexShrink: 0 }}>
          <path d={iconPath} />
        </SvgIcon>
        <Typography sx={{ fontSize: 14, fontWeight: 600, flex: 1 }}>{label}</Typography>
        <Button
          size="small"
          startIcon={
            <SvgIcon sx={{ width: 15, height: 15 }}><path d={PATH_PAPERCLIP} /></SvgIcon>
          }
          sx={{ fontSize: 13, color: "text.secondary", textTransform: "none", flexShrink: 0 }}
          disabled
        >
          Attach file
        </Button>
      </Stack>

      <Box sx={{ px: 2, py: 1.5 }}>
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
  const category = categories.find((c) => c.id === item.categoryId);

  const [subject, setSubject] = useState(item.subject);
  const [type, setType] = useState<AgendaItemType | "">(item.type[0] ?? "");
  const [publicContent, setPublicContent] = useState(item.publicContent);
  const [staffContent, setStaffContent] = useState(item.staffContent);
  const [executiveContent, setExecutiveContent] = useState(item.executiveContent);
  const [moreAnchor, setMoreAnchor] = useState<null | HTMLElement>(null);

  useEffect(() => {
    setSubject(item.subject);
    setType(item.type[0] ?? "");
    setPublicContent(item.publicContent);
    setStaffContent(item.staffContent);
    setExecutiveContent(item.executiveContent);
  }, [item.id]);

  const saved = (overrides: Partial<AgendaItem> = {}) => ({
    ...item,
    subject,
    type: type ? [type] : [],
    publicContent,
    staffContent,
    executiveContent,
    lastModifiedAt: new Date().toISOString(),
    ...overrides,
  });

  return (
    <Stack gap={2} sx={{ p: 2.5, height: "100%", overflowY: "auto" }}>

      {/* Header: title + more menu */}
      <Stack direction="row" alignItems="flex-start" gap={1}>
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
            <Select
              value={type}
              onChange={(e) => {
                const v = e.target.value as AgendaItemType | "";
                setType(v);
                onSave(saved({ type: v ? [v as AgendaItemType] : [] }));
              }}
              variant="standard"
              displayEmpty
              sx={{
                fontSize: 13, color: "text.secondary", fontFamily: "inherit", lineHeight: "20px",
                "& .MuiSelect-select": { py: 0, pr: "18px !important", lineHeight: "20px", fontSize: 13, color: "text.secondary" },
                "& .MuiInput-underline:before": { borderBottom: "none" },
                "& .MuiInput-underline:after": { borderBottom: "none" },
                "&:hover .MuiInput-underline:before": { borderBottom: "none !important" },
                "& .MuiSvgIcon-root": { fontSize: 16, color: "text.secondary", right: 0 },
              }}
            >
              <MenuItem value="" sx={{ fontSize: 13 }}><em>No type</em></MenuItem>
              {ALL_TYPES.map((t) => (
                <MenuItem key={t} value={t} sx={{ fontSize: 13 }}>{t}</MenuItem>
              ))}
            </Select>
          </Stack>
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

      {/* Content cards */}
      <ContentCard
        iconPath={PATH_EYE_OPEN}
        label="Public content"
        content={publicContent}
        attachments={item.attachments.public}
        placeholder="Add public content…"
        onSave={(v) => { setPublicContent(v); onSave(saved({ publicContent: v })); }}
      />
      <ContentCard
        iconPath={PATH_EYE_OFF}
        label="Staff content"
        content={staffContent}
        attachments={item.attachments.staff}
        placeholder="Add staff content…"
        onSave={(v) => { setStaffContent(v); onSave(saved({ staffContent: v })); }}
      />
      <ContentCard
        iconPath={PATH_PEOPLE}
        label="Executive content"
        content={executiveContent}
        attachments={item.attachments.executive}
        placeholder="Add executive content…"
        onSave={(v) => { setExecutiveContent(v); onSave(saved({ executiveContent: v })); }}
      />

    </Stack>
  );
}
