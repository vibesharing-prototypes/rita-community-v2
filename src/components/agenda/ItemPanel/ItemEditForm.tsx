import {
  Box, Button, Checkbox, Divider, FormControlLabel, FormGroup,
  IconButton, MenuItem, Select, Stack, SvgIcon, TextField, Typography,
} from "@mui/material";
import { useState } from "react";
import type { AgendaAttachment, AgendaCategory, AgendaItem, AgendaItemType } from "../../../types/agenda";

const ALL_TYPES: AgendaItemType[] = [
  "Action", "Action (Consent)", "Minutes", "Information",
  "Discussion", "Reports", "Procedural", "Presentation", "Good News",
];

function AttachmentRow({
  att,
  onDelete,
}: {
  att: AgendaAttachment;
  onDelete: (id: string) => void;
}) {
  return (
    <Stack direction="row" alignItems="center" gap={1}>
      <SvgIcon sx={{ width: 16, height: 16, color: "text.secondary", flexShrink: 0 }}>
        <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z" />
      </SvgIcon>
      <Typography sx={{ fontSize: 13, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {att.filename}
      </Typography>
      <Box sx={{
        fontSize: 11, fontWeight: 600, px: "8px", py: "2px", flexShrink: 0,
        bgcolor: att.tier === "public" ? "#C2FFD2" : att.tier === "staff" ? "#FFF2AA" : "#F3E8FF",
        color: att.tier === "public" ? "#006D3E" : att.tier === "staff" ? "#504700" : "#5B21B6",
        borderRadius: "9999px",
      }}>
        {att.tier === "public" ? "Public" : att.tier === "staff" ? "Staff / Internal" : "Executive"}
      </Box>
      <IconButton size="small" onClick={() => onDelete(att.id)} title="Remove attachment">
        <SvgIcon sx={{ width: 16, height: 16 }}>
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
        </SvgIcon>
      </IconButton>
    </Stack>
  );
}

function TierEditSection({
  label,
  tier,
  content,
  attachments,
  onContentChange,
  onDeleteAttachment,
}: {
  label: string;
  tier: "public" | "staff" | "executive";
  content: string;
  attachments: AgendaAttachment[];
  onContentChange: (val: string) => void;
  onDeleteAttachment: (id: string) => void;
}) {
  return (
    <Stack gap={1.5}>
      <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", color: "text.secondary" }}>
        {label}
      </Typography>
      <TextField
        multiline
        minRows={3}
        value={content}
        onChange={(e) => onContentChange(e.target.value)}
        placeholder="Add content…"
        size="small"
        fullWidth
        inputProps={{ style: { fontSize: 14, lineHeight: "22px" } }}
      />
      {attachments.length > 0 && (
        <Stack gap={0.75}>
          {attachments.map((att) => (
            <AttachmentRow key={att.id} att={att} onDelete={onDeleteAttachment} />
          ))}
        </Stack>
      )}
      <Button
        size="small"
        variant="text"
        startIcon={
          <SvgIcon sx={{ width: 16, height: 16 }}>
            <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z" />
          </SvgIcon>
        }
        sx={{ alignSelf: "flex-start", fontSize: 13, color: "text.secondary" }}
        // File upload is a stub in this prototype
        disabled
      >
        Attach file
      </Button>
    </Stack>
  );
}

export default function ItemEditForm({
  item,
  categories,
  onSave,
  onCancel,
}: {
  item: AgendaItem;
  categories: AgendaCategory[];
  onSave: (updated: AgendaItem) => void;
  onCancel: () => void;
}) {
  const [subject, setSubject] = useState(item.subject);
  const [categoryId, setCategoryId] = useState(item.categoryId);
  const [type, setType] = useState<AgendaItemType[]>([...item.type]);
  const [publicContent, setPublicContent] = useState(item.publicContent);
  const [staffContent, setStaffContent] = useState(item.staffContent);
  const [executiveContent, setExecutiveContent] = useState(item.executiveContent);
  const [publicAtts, setPublicAtts] = useState<AgendaAttachment[]>([...item.attachments.public]);
  const [staffAtts, setStaffAtts] = useState<AgendaAttachment[]>([...item.attachments.staff]);
  const [execAtts, setExecAtts] = useState<AgendaAttachment[]>([...item.attachments.executive]);
  const [subjectError, setSubjectError] = useState(false);

  const toggleType = (t: AgendaItemType) => {
    setType((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);
  };

  const handleSave = () => {
    if (!subject.trim()) { setSubjectError(true); return; }
    onSave({
      ...item,
      subject: subject.trim(),
      categoryId,
      type,
      publicContent,
      staffContent,
      executiveContent,
      attachments: { public: publicAtts, staff: staffAtts, executive: execAtts },
      lastModifiedAt: new Date().toISOString(),
    });
  };

  return (
    <Stack gap={0} sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Fixed header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2.5, py: 1.5, borderBottom: "1px solid", borderColor: "divider", flexShrink: 0 }}>
        <Typography sx={{ fontSize: 16, fontWeight: 600 }}>Edit Agenda Item</Typography>
        <Stack direction="row" gap={1}>
          <Button variant="outlined" size="small" onClick={onCancel}>Cancel</Button>
          <Button variant="contained" size="small" onClick={handleSave}>Save</Button>
        </Stack>
      </Stack>

      {/* Scrollable body */}
      <Stack gap={2.5} sx={{ flex: 1, overflowY: "auto", p: 2.5 }}>
        {/* Subject */}
        <Stack gap={0.5}>
          <Typography sx={{ fontSize: 12, fontWeight: 600, color: "text.secondary" }}>Subject *</Typography>
          <TextField
            value={subject}
            onChange={(e) => { setSubject(e.target.value); setSubjectError(false); }}
            size="small"
            fullWidth
            error={subjectError}
            helperText={subjectError ? "Subject is required" : undefined}
            inputProps={{ style: { fontSize: 14 } }}
          />
        </Stack>

        {/* Category */}
        <Stack gap={0.5}>
          <Typography sx={{ fontSize: 12, fontWeight: 600, color: "text.secondary" }}>Category</Typography>
          <Select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            size="small"
            sx={{ fontSize: 14 }}
          >
            {categories.map((c) => (
              <MenuItem key={c.id} value={c.id} sx={{ fontSize: 14 }}>{c.name}</MenuItem>
            ))}
          </Select>
        </Stack>

        {/* Type */}
        <Stack gap={0.5}>
          <Typography sx={{ fontSize: 12, fontWeight: 600, color: "text.secondary" }}>Type</Typography>
          <FormGroup row sx={{ gap: 0 }}>
            {ALL_TYPES.map((t) => (
              <FormControlLabel
                key={t}
                control={
                  <Checkbox
                    checked={type.includes(t)}
                    onChange={() => toggleType(t)}
                    size="small"
                  />
                }
                label={<Typography sx={{ fontSize: 13 }}>{t}</Typography>}
                sx={{ mr: 1.5 }}
              />
            ))}
          </FormGroup>
        </Stack>

        <Divider />

        {/* Content tiers */}
        <TierEditSection
          label="Public Content"
          tier="public"
          content={publicContent}
          attachments={publicAtts}
          onContentChange={setPublicContent}
          onDeleteAttachment={(id) => setPublicAtts((a) => a.filter((x) => x.id !== id))}
        />
        <Divider />
        <TierEditSection
          label="Staff / Internal Content"
          tier="staff"
          content={staffContent}
          attachments={staffAtts}
          onContentChange={setStaffContent}
          onDeleteAttachment={(id) => setStaffAtts((a) => a.filter((x) => x.id !== id))}
        />
        <Divider />
        <TierEditSection
          label="Executive Content"
          tier="executive"
          content={executiveContent}
          attachments={execAtts}
          onContentChange={setExecutiveContent}
          onDeleteAttachment={(id) => setExecAtts((a) => a.filter((x) => x.id !== id))}
        />

        {/* Bottom save row */}
        <Divider />
        <Stack direction="row" justifyContent="flex-end" gap={1}>
          <Button variant="outlined" size="small" onClick={onCancel}>Cancel</Button>
          <Button variant="contained" size="small" onClick={handleSave}>Save</Button>
        </Stack>
      </Stack>
    </Stack>
  );
}
