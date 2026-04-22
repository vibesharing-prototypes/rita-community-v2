import { Box, Stack, Typography } from "@mui/material";
import { DraggableProvidedDragHandleProps } from "@hello-pangea/dnd";
import { useRef, useState } from "react";
import type { AgendaItem } from "../../../types/agenda";

const LETTER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function DraftBadge() {
  return (
    <Box sx={{
      display: "inline-flex", alignItems: "center", height: 20,
      bgcolor: "#F3F3F3", color: "#515255", borderRadius: "9999px",
      px: "8px", flexShrink: 0,
    }}>
      <Typography sx={{ fontSize: 11, fontWeight: 600, lineHeight: "16px", letterSpacing: "0.3px" }}>
        Draft
      </Typography>
    </Box>
  );
}

export default function ItemRow({
  item,
  index,
  isSelected,
  dragHandleProps,
  onSelect,
  onRename,
}: {
  item: AgendaItem;
  index: number;
  isSelected: boolean;
  dragHandleProps: DraggableProvidedDragHandleProps | null | undefined;
  onSelect: (id: string) => void;
  onRename: (id: string, subject: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(item.subject);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasAttachments =
    item.attachments.public.length > 0 ||
    item.attachments.staff.length > 0 ||
    item.attachments.executive.length > 0;

  const startEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setValue(item.subject);
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const commitEdit = () => {
    const trimmed = value.trim();
    if (trimmed && trimmed !== item.subject) onRename(item.id, trimmed);
    else setValue(item.subject);
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") { e.preventDefault(); commitEdit(); }
    if (e.key === "Escape") { setValue(item.subject); setEditing(false); }
  };

  return (
    <Stack
      direction="row"
      alignItems="center"
      gap={0.5}
      onClick={() => !editing && onSelect(item.id)}
      onDoubleClick={startEdit}
      sx={{
        pl: "28px", pr: 1, py: "6px", cursor: "pointer", position: "relative",
        bgcolor: isSelected ? "#E4F3FF" : "transparent",
        "&:hover": { bgcolor: isSelected ? "#E4F3FF" : "action.hover" },
        "&:hover .drag-handle": { opacity: 1 },
        borderRadius: "4px",
      }}
    >
      {/* Drag handle */}
      <Box
        {...(dragHandleProps ?? {})}
        className="drag-handle"
        onClick={(e) => e.stopPropagation()}
        sx={{
          opacity: 0, cursor: "grab", flexShrink: 0, display: "flex", alignItems: "center",
          color: "text.disabled", mr: 0.5,
          "& svg": { width: 14, height: 14 },
        }}
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
        </svg>
      </Box>

      {/* Letter index */}
      <Typography sx={{ fontSize: 12, fontWeight: 600, color: "text.secondary", flexShrink: 0, minWidth: 18 }}>
        {LETTER[index] ?? index + 1}.
      </Typography>

      {/* Subject (editable or static) */}
      {editing ? (
        <Box
          component="input"
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={handleKeyDown}
          onClick={(e) => e.stopPropagation()}
          sx={{
            flex: 1, border: "1px solid", borderColor: "primary.main", borderRadius: "4px",
            px: 1, py: "2px", fontSize: 13, lineHeight: "20px",
            outline: "none", bgcolor: "white", fontFamily: "inherit",
          }}
        />
      ) : (
        <Typography sx={{ fontSize: 13, lineHeight: "20px", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {item.subject}
        </Typography>
      )}

      {/* Icons */}
      {!editing && (
        <Stack direction="row" alignItems="center" gap={0.5} sx={{ flexShrink: 0 }}>
          {hasAttachments && (
            <Typography sx={{ fontSize: 12 }} title="Has attachments">📎</Typography>
          )}
          <DraftBadge />
        </Stack>
      )}
    </Stack>
  );
}
