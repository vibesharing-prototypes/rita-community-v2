import {
  Box, IconButton, ListItemText, Menu, MenuItem, Stack, SvgIcon, Typography,
} from "@mui/material";
import { DraggableProvidedDragHandleProps } from "@hello-pangea/dnd";
import { useRef, useState } from "react";
import type { AgendaItem } from "../../../types/agenda";
import ConfirmDialog from "../../meetings/ConfirmDialog";
import LockedIcon from "@diligentcorp/atlas-react-bundle/icons/Locked";

const LETTER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";


export default function ItemRow({
  item,
  index,
  isSelected,
  dragHandleProps,
  onSelect,
  onRename,
  onDuplicate,
  onDelete,
}: {
  item: AgendaItem;
  index: number;
  isSelected: boolean;
  dragHandleProps: DraggableProvidedDragHandleProps | null | undefined;
  onSelect: (id: string) => void;
  onRename: (id: string, subject: string) => void;
  onDuplicate: (item: AgendaItem) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(item.subject);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const startEdit = (e?: React.MouseEvent | React.SyntheticEvent) => {
    e?.stopPropagation();
    setMenuAnchor(null);
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
        pl: "16px", pr: "4px", py: "4px", cursor: "pointer", position: "relative",
        bgcolor: isSelected ? "#ECF0FF" : "transparent",
        color: isSelected ? "#0040D5" : "inherit",
        "&:hover": { bgcolor: isSelected ? "#ECF0FF" : "action.hover" },
        "&:hover .drag-handle, &:hover .item-more-btn": { opacity: 1 },
        borderRadius: "8px",
        ...(isSelected && {
          "&::before": {
            content: '""',
            position: "absolute",
            left: 0,
            top: "50%",
            transform: "translateY(-50%)",
            width: "2px",
            height: "24px",
            bgcolor: "#0040D5",
            borderRadius: "12px",
          },
        }),
      }}
    >
      {/* Drag handle */}
      <Box
        {...(dragHandleProps ?? {})}
        className="drag-handle"
        onClick={(e) => e.stopPropagation()}
        sx={{
          opacity: 0, cursor: "grab", flexShrink: 0, display: "flex", alignItems: "center",
          color: "text.disabled", mr: "2px",
          width: 14, height: 14,
          "& svg": { width: 14, height: 14 },
        }}
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
        </svg>
      </Box>

      {/* Letter index */}
      <Typography sx={{ fontSize: 'var(--lens-semantic-font-text-md-font-size)', fontWeight: 'var(--lens-core-font-weight-semi-bold)', color: isSelected ? "#0040D5" : "text.secondary", flexShrink: 0, mr: "2px" }}>
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
            px: 1, py: "2px", fontSize: 'var(--lens-semantic-font-text-body-font-size)', lineHeight: 'var(--lens-semantic-font-text-body-line-height)',
            outline: "none", bgcolor: "white", fontFamily: "inherit",
          }}
        />
      ) : (
        <Typography sx={{
          fontSize: 'var(--lens-semantic-font-text-body-font-size)', lineHeight: 'var(--lens-semantic-font-text-body-line-height)', flex: 1, minWidth: 0,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
          overflow: "hidden", wordBreak: "break-word",
        }}>
          {item.subject}
        </Typography>
      )}

      {/* Members-only badge */}
      {!editing && item.membersOnly && (
        <Box
          aria-label="Members only"
          sx={{
            flexShrink: 0,
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            height: 24, width: 24,
            bgcolor: "#F3F3F3", color: "#515255",
            borderRadius: "9999px",
            border: "1px solid white",
            "& svg": { width: 16, height: 16, display: "block" },
          }}
        >
          <LockedIcon />
        </Box>
      )}

      {/* More menu */}
      {!editing && (
        <IconButton
          size="small"
          className="item-more-btn"
          onClick={(e) => { e.stopPropagation(); setMenuAnchor(e.currentTarget); }}
          sx={{
            flexShrink: 0,
            opacity: menuAnchor ? 1 : 0,
            transition: "opacity 0.15s",
            "&:hover": { opacity: 1 },
          }}
        >
          <SvgIcon sx={{ width: 16, height: 16 }}>
            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
          </SvgIcon>
        </IconButton>
      )}

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
        <MenuItem onClick={(e) => startEdit(e)}>
          <ListItemText>Rename</ListItemText>
        </MenuItem>
        <MenuItem onClick={(e) => { e.stopPropagation(); setMenuAnchor(null); onDuplicate(item); }}>
          <ListItemText>Duplicate</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={(e) => { e.stopPropagation(); setMenuAnchor(null); setConfirmDelete(true); }}
          sx={{ color: "error.main" }}
        >
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete agenda item"
        message={`Delete "${item.subject}"? This cannot be undone.`}
        confirmLabel="Delete"
        destructive
        onConfirm={() => { setConfirmDelete(false); onDelete(item.id); }}
        onClose={() => setConfirmDelete(false)}
      />
    </Stack>
  );
}
