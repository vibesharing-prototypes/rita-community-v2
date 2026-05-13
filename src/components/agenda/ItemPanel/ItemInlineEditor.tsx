import CopyIcon from "@diligentcorp/atlas-react-bundle/icons/Copy";
import AttachIcon from "@diligentcorp/atlas-react-bundle/icons/Attach";
import DocumentIcon from "@diligentcorp/atlas-react-bundle/icons/Document";
import RemoveCircleIcon from "@diligentcorp/atlas-react-bundle/icons/RemoveCircle";
import LockedIcon from "@diligentcorp/atlas-react-bundle/icons/Locked";
import UnlockedIcon from "@diligentcorp/atlas-react-bundle/icons/Unlocked";
import {
  Box, Button, IconButton, ListItemIcon, ListItemText,
  Menu, MenuItem, Stack, SvgIcon, Tab, Tabs, TextField, Tooltip, Typography, useTheme,
} from "@mui/material";
import { differenceInHours, differenceInMinutes, format, isSameDay } from "date-fns";
import { useEffect, useRef, useState } from "react";
import type { AgendaAttachment, AgendaCategory, AgendaItem, AgendaItemType } from "../../../types/agenda";
import RichTextField from "../../common/RichTextField";

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
      inputProps={{ style: { fontSize: 'var(--lens-semantic-font-title-h3-lg-font-size)', fontWeight: 'var(--lens-core-font-weight-semi-bold)', lineHeight: 'var(--lens-semantic-font-title-h4-md-line-height)', letterSpacing: 'var(--lens-semantic-letter-spacing-xs)', fontFamily: "inherit", padding: 0 } }}
      sx={{
        mx: "-4px",
        "& .MuiInput-root": { borderRadius: "4px", px: "4px", "&:not(.Mui-focused):hover": { backgroundColor: "action.hover" } },
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
          fontSize: 'var(--lens-semantic-font-text-body-font-size)', color: "text.secondary", fontFamily: "inherit", lineHeight: 'var(--lens-semantic-font-text-body-line-height)',
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
        <MenuItem onClick={() => { onChange(""); setAnchor(null); }} sx={{ fontSize: 'var(--lens-semantic-font-text-body-font-size)' }}>
          <em>No type</em>
        </MenuItem>
        {ALL_TYPES.map((t) => (
          <MenuItem key={t} onClick={() => { onChange(t); setAnchor(null); }} sx={{ fontSize: 'var(--lens-semantic-font-text-body-font-size)' }}>{t}</MenuItem>
        ))}
      </Menu>
    </>
  );
}

// ── Attachment row ─────────────────────────────────────────────────────────

function AttachmentRow({ att, onRemove, borderColor }: { att: AgendaAttachment; onRemove?: () => void; borderColor: string }) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      gap={0.5}
      sx={{
        border: `1px solid ${borderColor}`,
        borderRadius: "4px",
        p: "4px",
        "&:hover": { bgcolor: "action.hover" },
        "&:hover .att-remove": { opacity: 1 },
        "&:hover .att-name": { textDecoration: "underline" },
      }}
    >
      <DocumentIcon style={{ width: 20, height: 20, flexShrink: 0 }} />
      <Typography
        component="a"
        href="#"
        onClick={(e: React.MouseEvent) => e.preventDefault()}
        className="att-name"
        sx={{
          fontSize: 'var(--lens-semantic-font-text-md-font-size)', fontWeight: 'var(--lens-core-font-weight-semi-bold)', lineHeight: 'var(--lens-semantic-font-text-md-line-height)', letterSpacing: 'var(--lens-semantic-letter-spacing-sm)',
          color: "var(--lens-semantic-color-type-default, #282e37)",
          flex: 1, minWidth: 0,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          textDecoration: "none",
          cursor: "pointer",
        }}
      >
        {att.filename}
      </Typography>
      {onRemove && (
        <IconButton
          className="att-remove"
          size="small"
          onClick={onRemove}
          aria-label="Remove attachment"
          sx={{ opacity: 0, transition: "opacity 120ms", flexShrink: 0 }}
        >
          <RemoveCircleIcon style={{ width: 18, height: 18 }} />
        </IconButton>
      )}
    </Stack>
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
  const [contentEditedAt, setContentEditedAt] = useState<{ public?: string; staff?: string; executive?: string }>(
    item.contentEditedAt ?? {}
  );
  const [membersOnly, setMembersOnly] = useState<boolean>(Boolean(item.membersOnly));
  const [moreAnchor, setMoreAnchor] = useState<null | HTMLElement>(null);
  const [activeTab, setActiveTab] = useState<"public" | "staff" | "executive">("public");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSubject(item.subject);
    setType(item.type[0] ?? "");
    setPublicContent(item.publicContent);
    setStaffContent(item.staffContent);
    setExecutiveContent(item.executiveContent);
    setContentEditedAt(item.contentEditedAt ?? {});
    setMembersOnly(Boolean(item.membersOnly));
    setActiveTab("public");
  }, [item.id]);

  /**
   * Build the next item snapshot. If `editedTier` is given, also bump the
   * per-tier edit timestamp and the overall lastModifiedAt.
   */
  const saved = (
    overrides: Partial<AgendaItem> = {},
    editedTier?: "public" | "staff" | "executive",
  ) => {
    const now = new Date();
    const nowIso = now.toISOString();
    let nextContentEditedAt = contentEditedAt;
    if (editedTier) {
      nextContentEditedAt = { ...contentEditedAt, [editedTier]: nowIso };
      setContentEditedAt(nextContentEditedAt);
    }
    return {
      ...item,
      subject,
      type: type ? [type] : [],
      publicContent,
      staffContent,
      executiveContent,
      membersOnly,
      lastModifiedAt: nowIso,
      contentEditedAt: nextContentEditedAt,
      ...overrides,
    };
  };

  const toggleMembersOnly = () => {
    const next = !membersOnly;
    setMembersOnly(next);
    onSave(saved({ membersOnly: next }));
  };

  // ── Tab data ─────────────────────────────────────────────────────────────
  const tabs = [
    {
      id: "public" as const,
      label: "Public",
      content: publicContent,
      placeholder: "Add public content…",
      attachments: item.attachments.public,
      setContent: setPublicContent,
      contentKey: "publicContent" as const,
      attachKey: "public" as const,
    },
    {
      id: "staff" as const,
      label: "Admin",
      content: staffContent,
      placeholder: "Add admin content…",
      attachments: item.attachments.staff,
      setContent: setStaffContent,
      contentKey: "staffContent" as const,
      attachKey: "staff" as const,
    },
    {
      id: "executive" as const,
      label: "Executive",
      content: executiveContent,
      placeholder: "Add executive content…",
      attachments: item.attachments.executive,
      setContent: setExecutiveContent,
      contentKey: "executiveContent" as const,
      attachKey: "executive" as const,
    },
  ];

  const active = tabs.find((t) => t.id === activeTab)!;

  // Per-tab edited date — falls back to overall lastModifiedAt for legacy data
  // so existing items show a sensible label until each tab is individually edited.
  const tabEditedAtIso = contentEditedAt[active.id] ?? item.lastModifiedAt;
  const tabEditedAt = tabEditedAtIso ? new Date(tabEditedAtIso) : null;

  const handleAddAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const newAtts: AgendaAttachment[] = files.map((file) => ({
      id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      filename: file.name,
      tier: active.attachKey,
    }));
    const nextAttachments = {
      ...item.attachments,
      [active.attachKey]: [...item.attachments[active.attachKey], ...newAtts],
    };
    onSave(saved({ attachments: nextAttachments }, active.id));
    e.target.value = "";
  };

  const handleRemoveAttachment = (id: string) => {
    const nextAttachments = {
      ...item.attachments,
      [active.attachKey]: item.attachments[active.attachKey].filter((a) => a.id !== id),
    };
    onSave(saved({ attachments: nextAttachments }, active.id));
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
              <Typography sx={{ fontSize: 'var(--lens-semantic-font-text-body-font-size)', color: "text.secondary", whiteSpace: "nowrap" }}>
                {category.name}
              </Typography>
            )}
            {category && (
              <Typography sx={{ fontSize: 'var(--lens-semantic-font-text-body-font-size)', color: "text.secondary", mx: "4px" }}>·</Typography>
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
                <Typography sx={{ fontSize: 'var(--lens-semantic-font-text-md-font-size)', fontWeight: 'var(--lens-core-font-weight-semi-bold)', lineHeight: 'var(--lens-semantic-font-text-md-line-height)', letterSpacing: 'var(--lens-semantic-letter-spacing-sm)', color: "inherit" }}>
                  Members only
                </Typography>
              </Box>
            )}
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

      {/* Content tabs */}
      <Box>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          style={{ display: "none" }}
          onChange={handleAddAttachment}
        />

        {/* Tab bar */}
        <Box sx={{ borderBottom: `1px solid ${borderColor}` }}>
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            sx={{
              minHeight: 0,
              "& .MuiTab-root:not(.Mui-selected)::after": { display: "none" },
            }}
          >
            {tabs.map((t) => (
              <Tab key={t.id} value={t.id} label={t.label} />
            ))}
          </Tabs>
        </Box>

        {/* Per-tab edited label */}
        {tabEditedAt && (
          <Tooltip title={`Edited by you on ${format(tabEditedAt, "MMMM d")} at ${format(tabEditedAt, "h:mm a")}`} placement="bottom-start">
            <Typography sx={{
              fontSize: 'var(--lens-semantic-font-text-md-font-size)',
              color: "var(--lens-semantic-color-type-muted)",
              lineHeight: 'var(--lens-semantic-font-text-md-line-height)',
              letterSpacing: 'var(--lens-semantic-letter-spacing-sm)',
              cursor: "default",
              mt: 1, mb: 1.5,
              width: "fit-content",
            }}>
              {formatEditedLabel(tabEditedAt)}
            </Typography>
          </Tooltip>
        )}

        {/* Active tab panel — card wrapper */}
        <Box sx={{
          mt: tabEditedAt ? 0 : 2,
          p: "16px",
          border: `1px solid ${borderColor}`,
          borderRadius: "12px",
          bgcolor: "#fff",
        }}>
          {/* Description */}
          <Typography sx={{
            fontSize: 'var(--lens-semantic-font-text-md-font-size)',
            fontWeight: 'var(--lens-core-font-weight-semi-bold)',
            lineHeight: 'var(--lens-semantic-font-text-md-line-height)',
            letterSpacing: 'var(--lens-semantic-letter-spacing-sm)',
            color: "var(--lens-semantic-color-type-default, #282e37)",
            mb: 0.5,
          }}>
            Description
          </Typography>
          <RichTextField
            key={active.id}
            value={active.content}
            placeholder={active.placeholder}
            onSave={(v) => {
              active.setContent(v);
              onSave(saved({ [active.contentKey]: v } as Partial<AgendaItem>, active.id));
            }}
          />

          {/* Attachments */}
          <Stack gap={1} sx={{ mt: 2 }}>
            <Typography sx={{
              fontSize: 'var(--lens-semantic-font-text-md-font-size)',
              fontWeight: 'var(--lens-core-font-weight-semi-bold)',
              lineHeight: 'var(--lens-semantic-font-text-md-line-height)',
              letterSpacing: 'var(--lens-semantic-letter-spacing-sm)',
              color: "var(--lens-semantic-color-type-default, #282e37)",
            }}>
              Attachments
            </Typography>
            {active.attachments.length > 0 && (
              <Stack>
                {active.attachments.map((att) => (
                  <AttachmentRow
                    key={att.id}
                    att={att}
                    onRemove={() => handleRemoveAttachment(att.id)}
                    borderColor={borderColor}
                  />
                ))}
              </Stack>
            )}
            <Button
              variant="outlined"
              size="small"
              onClick={() => fileInputRef.current?.click()}
              startIcon={<AttachIcon sx={{ width: 16, height: 16 }} />}
              sx={{ alignSelf: "flex-start" }}
            >
              Add attachment
            </Button>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
