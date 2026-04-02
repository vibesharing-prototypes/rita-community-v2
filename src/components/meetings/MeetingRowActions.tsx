import CopyIcon from "@diligentcorp/atlas-react-bundle/icons/Copy";
import EditIcon from "@diligentcorp/atlas-react-bundle/icons/Edit";
import MoreIcon from "@diligentcorp/atlas-react-bundle/icons/More";
import SuccessIcon from "@diligentcorp/atlas-react-bundle/icons/Success";
import TrashIcon from "@diligentcorp/atlas-react-bundle/icons/Trash";
import { IconButton, Menu, MenuItem, Typography } from "@mui/material";
import { useState } from "react";

import type { MeetingStatus } from "../../types/meetings";

export default function MeetingRowActions({
  onEdit,
  onPublish,
  onUnpublish,
  onDuplicate,
  onDelete,
  status,
}: {
  onEdit: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  status: MeetingStatus;
}) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton onClick={(event) => setAnchorEl(event.currentTarget)} aria-label="More actions">
        <MoreIcon />
      </IconButton>
      <Menu open={open} onClose={() => setAnchorEl(null)} anchorEl={anchorEl}>
        <MenuItem onClick={() => { onEdit(); setAnchorEl(null); }}>
          <EditIcon />
          <Typography sx={{ ml: 1 }}>Edit</Typography>
        </MenuItem>
        {status === "Draft" ? (
          <MenuItem onClick={() => { onPublish(); setAnchorEl(null); }}>
            <SuccessIcon />
            <Typography sx={{ ml: 1 }}>Publish</Typography>
          </MenuItem>
        ) : (
          <MenuItem onClick={() => { onUnpublish(); setAnchorEl(null); }}>
            <SuccessIcon />
            <Typography sx={{ ml: 1 }}>Unpublish</Typography>
          </MenuItem>
        )}
        <MenuItem onClick={() => { onDuplicate(); setAnchorEl(null); }}>
          <CopyIcon />
          <Typography sx={{ ml: 1 }}>Duplicate</Typography>
        </MenuItem>
        <MenuItem onClick={() => { onDelete(); setAnchorEl(null); }}>
          <TrashIcon />
          <Typography sx={{ ml: 1 }}>Delete</Typography>
        </MenuItem>
      </Menu>
    </>
  );
}
