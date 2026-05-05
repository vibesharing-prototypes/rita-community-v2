import { Button, IconButton, ListItemText, Menu, MenuItem, Stack, SvgIcon } from "@mui/material";
import { useState } from "react";
import AddIcon from "@diligentcorp/atlas-react-bundle/icons/Add";
import ListIcon from "@diligentcorp/atlas-react-bundle/icons/List";
import SearchIcon from "@diligentcorp/atlas-react-bundle/icons/Search";
import AnnotationsIcon from "@diligentcorp/atlas-react-bundle/icons/Annotations";

export type AgendaPanelView = "content" | "search" | "notes";

const ACTIVE_BG = "#ECF0FF";
const ACTIVE_FG = "#0040D5";

export default function AgendaToolbar({
  view,
  onChangeView,
  onAddCategory,
  onAddItem,
  onCollapse,
  hasCategories,
}: {
  view: AgendaPanelView;
  onChangeView: (v: AgendaPanelView) => void;
  onAddCategory: () => void;
  onAddItem: () => void;
  onCollapse: () => void;
  hasCategories: boolean;
}) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const close = () => setAnchor(null);

  const isActive = (v: AgendaPanelView) => v === view;

  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between" gap={0.5} sx={{ width: "100%" }}>
      {/* Left: view tabs */}
      <Stack direction="row" alignItems="center" gap={0.5}>
        <Button
          size="small"
          onClick={() => onChangeView("content")}
          startIcon={<ListIcon style={{ fontSize: 16 }} />}
          sx={{
            minWidth: 0, px: "10px", py: "4px",
            fontSize: 13, fontWeight: 600,
            color: isActive("content") ? ACTIVE_FG : "text.secondary",
            bgcolor: isActive("content") ? ACTIVE_BG : "transparent",
            "&:hover": {
              bgcolor: isActive("content") ? ACTIVE_BG : "action.hover",
              color: isActive("content") ? ACTIVE_FG : "text.primary",
            },
          }}
        >
          Content
        </Button>

        <IconButton
          size="small"
          onClick={() => onChangeView("search")}
          aria-label="Search"
          sx={{
            color: isActive("search") ? ACTIVE_FG : "text.secondary",
            bgcolor: isActive("search") ? ACTIVE_BG : "transparent",
            "&:hover": {
              bgcolor: isActive("search") ? ACTIVE_BG : "action.hover",
            },
          }}
        >
          <SearchIcon style={{ fontSize: 18 }} />
        </IconButton>

        <IconButton
          size="small"
          onClick={() => onChangeView("notes")}
          aria-label="Notes"
          sx={{
            color: isActive("notes") ? ACTIVE_FG : "text.secondary",
            bgcolor: isActive("notes") ? ACTIVE_BG : "transparent",
            "&:hover": {
              bgcolor: isActive("notes") ? ACTIVE_BG : "action.hover",
            },
          }}
        >
          <AnnotationsIcon style={{ fontSize: 18 }} />
        </IconButton>
      </Stack>

      {/* Right: add + collapse */}
      <Stack direction="row" alignItems="center" gap={0.5}>
        <IconButton
          size="small"
          onClick={(e) => setAnchor(e.currentTarget)}
          aria-label="Add"
        >
          <AddIcon style={{ fontSize: 18 }} />
        </IconButton>
        <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={close}>
          <MenuItem onClick={() => { close(); onAddCategory(); }}>
            <ListItemText>New category</ListItemText>
          </MenuItem>
          <MenuItem
            disabled={!hasCategories}
            onClick={() => { close(); onAddItem(); }}
          >
            <ListItemText>New item</ListItemText>
          </MenuItem>
        </Menu>

        <IconButton size="small" onClick={onCollapse} aria-label="Collapse agenda">
          <SvgIcon sx={{ width: 18, height: 18 }} viewBox="0 0 24 24">
            <path d="M15.6538 16.1543L10 10.5005L15.6538 4.84668L16.7077 5.90051L12.1077 10.5005L16.7077 15.1005L15.6538 16.1543Z" transform="translate(2 1)" />
            <path d="M10.6538 16.1543L5 10.5005L10.6538 4.84668L11.7077 5.90051L7.10767 10.5005L11.7077 15.1005L10.6538 16.1543Z" transform="translate(2 1)" />
          </SvgIcon>
        </IconButton>
      </Stack>
    </Stack>
  );
}
