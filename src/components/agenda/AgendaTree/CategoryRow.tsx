import {
  Box, Button, IconButton, ListItemIcon, ListItemText,
  Menu, MenuItem, Stack, SvgIcon, Typography,
} from "@mui/material";
import { Droppable, Draggable, DraggableProvidedDragHandleProps } from "@hello-pangea/dnd";
import { useRef, useState } from "react";
import type { AgendaCategory } from "../../../types/agenda";
import ItemRow from "./ItemRow";
import ConfirmDialog from "../../meetings/ConfirmDialog";

export default function CategoryRow({
  category,
  index,
  selectedItemId,
  dragHandleProps,
  onSelectItem,
  onRenameCategory,
  onDeleteCategory,
  onRenameItem,
  onAddItem,
}: {
  category: AgendaCategory;
  index: number;
  selectedItemId: string | null;
  dragHandleProps: DraggableProvidedDragHandleProps | null | undefined;
  onSelectItem: (id: string) => void;
  onRenameCategory: (id: string, name: string) => void;
  onDeleteCategory: (id: string) => void;
  onRenameItem: (id: string, subject: string) => void;
  onAddItem: (categoryId: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(category.name);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const startEdit = () => {
    setValue(category.name);
    setEditing(true);
    setMenuAnchor(null);
    setTimeout(() => { inputRef.current?.focus(); inputRef.current?.select(); }, 0);
  };

  const commitEdit = () => {
    const trimmed = value.trim();
    if (trimmed && trimmed !== category.name) onRenameCategory(category.id, trimmed);
    else setValue(category.name);
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") { e.preventDefault(); commitEdit(); }
    if (e.key === "Escape") { setValue(category.name); setEditing(false); }
  };

  return (
    <Box sx={{ mb: 0.5 }}>
      {/* Category header */}
      <Stack
        direction="row"
        alignItems="center"
        gap={0.5}
        onDoubleClick={startEdit}
        sx={{
          px: 1, py: "6px", bgcolor: "#F3F4F5", borderRadius: "6px",
          "&:hover .cat-drag-handle": { opacity: 1 },
          cursor: "default",
        }}
      >
        {/* Drag handle */}
        <Box
          {...(dragHandleProps ?? {})}
          className="cat-drag-handle"
          sx={{
            opacity: 0, cursor: "grab", flexShrink: 0, display: "flex", alignItems: "center",
            color: "text.disabled",
            "& svg": { width: 14, height: 14 },
          }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
          </svg>
        </Box>

        {/* Number */}
        <Typography sx={{ fontSize: 13, fontWeight: 700, color: "text.secondary", flexShrink: 0, minWidth: 20 }}>
          {index + 1}.
        </Typography>

        {/* Name (editable or static) */}
        {editing ? (
          <Box
            component="input"
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={handleKeyDown}
            sx={{
              flex: 1, border: "1px solid", borderColor: "primary.main", borderRadius: "4px",
              px: 1, py: "2px", fontSize: 13, fontWeight: 700, lineHeight: "20px",
              outline: "none", bgcolor: "white", fontFamily: "inherit",
            }}
          />
        ) : (
          <Typography sx={{ fontSize: 13, fontWeight: 700, lineHeight: "20px", flex: 1, minWidth: 0 }}>
            {category.name}
          </Typography>
        )}

        {/* Context menu button */}
        {!editing && (
          <IconButton
            size="small"
            onClick={(e) => { e.stopPropagation(); setMenuAnchor(e.currentTarget); }}
            sx={{ flexShrink: 0, opacity: 0.6, "&:hover": { opacity: 1 } }}
          >
            <SvgIcon sx={{ width: 16, height: 16 }}>
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
            </SvgIcon>
          </IconButton>
        )}
      </Stack>

      {/* Context menu */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
        <MenuItem onClick={startEdit}>
          <ListItemText>Rename</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { setMenuAnchor(null); setConfirmDelete(true); }} sx={{ color: "error.main" }}>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Items droppable */}
      <Droppable droppableId={category.id} type="ITEM">
        {(provided) => (
          <Box ref={provided.innerRef} {...provided.droppableProps} sx={{ minHeight: 4, pt: 0.25 }}>
            {category.items.map((item, idx) => (
              <Draggable key={item.id} draggableId={item.id} index={idx}>
                {(provided) => (
                  <Box
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    sx={{ mb: 0.25 }}
                  >
                    <ItemRow
                      item={item}
                      index={idx}
                      isSelected={selectedItemId === item.id}
                      dragHandleProps={provided.dragHandleProps}
                      onSelect={onSelectItem}
                      onRename={onRenameItem}
                    />
                  </Box>
                )}
              </Draggable>
            ))}
            {provided.placeholder}

            {/* Empty category inline prompt */}
            {category.items.length === 0 && (
              <Box sx={{ pl: "28px", py: "4px" }}>
                <Button
                  size="small"
                  variant="text"
                  startIcon={
                    <SvgIcon sx={{ width: 14, height: 14 }}>
                      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                    </SvgIcon>
                  }
                  onClick={() => onAddItem(category.id)}
                  sx={{ fontSize: 12, color: "text.secondary", py: "2px" }}
                >
                  Add item
                </Button>
              </Box>
            )}
          </Box>
        )}
      </Droppable>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={confirmDelete}
        title="Delete category"
        message={
          category.items.length > 0
            ? `"${category.name}" has ${category.items.length} item${category.items.length > 1 ? "s" : ""}. Deleting it will also remove all items. This cannot be undone.`
            : `Delete "${category.name}"? This cannot be undone.`
        }
        confirmLabel="Delete"
        destructive
        onConfirm={() => { setConfirmDelete(false); onDeleteCategory(category.id); }}
        onClose={() => setConfirmDelete(false)}
      />
    </Box>
  );
}
