import CopyIcon from "@diligentcorp/atlas-react-bundle/icons/Copy";
import LockedIcon from "@diligentcorp/atlas-react-bundle/icons/Locked";
import MoreOptionsIcon from "@diligentcorp/atlas-react-bundle/icons/More";
import TrashIcon from "@diligentcorp/atlas-react-bundle/icons/Trash";
import UnlockedIcon from "@diligentcorp/atlas-react-bundle/icons/Unlocked";
import { Button, Divider, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Stack } from "@mui/material";
import { useState } from "react";

import type { MeetingStatus, MeetingVisibility } from "../../types/meetings";

export default function MeetingRowActions({
  onMakeActive,
  onMakeDraft,
  onDuplicate,
  onDelete,
  onToggleVisibility,
  status,
  visibility,
}: {
  onMakeActive: () => void;
  onMakeDraft: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onToggleVisibility: () => void;
  status: MeetingStatus;
  visibility: MeetingVisibility;
}) {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
  };

  const handleMenuClose = () => setMenuAnchor(null);

  return (
    <Stack direction="row" alignItems="center" gap="8px">
      {status === "Draft" && (
        <Button
          variant="outlined"
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onMakeActive();
          }}
        >
          Make active
        </Button>
      )}

      <IconButton size="medium" onClick={handleMenuOpen} aria-label="More options">
        <MoreOptionsIcon />
      </IconButton>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {status === "Active" && (
          <MenuItem
            onClick={(e) => {
              e.stopPropagation();
              handleMenuClose();
              onToggleVisibility();
            }}
          >
            <ListItemIcon>
              {visibility === "Internal" ? <UnlockedIcon /> : <LockedIcon />}
            </ListItemIcon>
            <ListItemText>
              {visibility === "Internal" ? "Publish to site" : "Remove from site"}
            </ListItemText>
          </MenuItem>
        )}
        <MenuItem
          onClick={(e) => {
            e.stopPropagation();
            handleMenuClose();
            onDuplicate();
          }}
        >
          <ListItemIcon><CopyIcon /></ListItemIcon>
          <ListItemText>Duplicate</ListItemText>
        </MenuItem>
        {status === "Active" && (
          <MenuItem
            onClick={(e) => {
              e.stopPropagation();
              handleMenuClose();
              onMakeDraft();
            }}
          >
            <ListItemText inset>Make draft</ListItemText>
          </MenuItem>
        )}
        <Divider />
        <MenuItem
          onClick={(e) => {
            e.stopPropagation();
            handleMenuClose();
            onDelete();
          }}
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
  );
}
