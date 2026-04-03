import BookPublishIcon from "@diligentcorp/atlas-react-bundle/icons/BookPublish";
import BookUnpublishIcon from "@diligentcorp/atlas-react-bundle/icons/BookUnpublish";
import CopyIcon from "@diligentcorp/atlas-react-bundle/icons/Copy";
import TrashIcon from "@diligentcorp/atlas-react-bundle/icons/Trash";
import { IconButton, Stack, Tooltip } from "@mui/material";

import type { MeetingStatus } from "../../types/meetings";

export default function MeetingRowActions({
  onPublish,
  onUnpublish,
  onDuplicate,
  onDelete,
  status,
}: {
  onPublish: () => void;
  onUnpublish: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  status: MeetingStatus;
}) {
  return (
    <Stack direction="row" alignItems="center">
      {status === "Draft" ? (
        <Tooltip title="Publish">
          <IconButton size="medium" onClick={onPublish} aria-label="Publish">
            <BookPublishIcon />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title="Unpublish">
          <IconButton size="medium" onClick={onUnpublish} aria-label="Unpublish">
            <BookUnpublishIcon />
          </IconButton>
        </Tooltip>
      )}
      <Tooltip title="Duplicate">
        <IconButton size="medium" onClick={onDuplicate} aria-label="Duplicate">
          <CopyIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete">
        <IconButton size="medium" onClick={onDelete} aria-label="Delete">
          <TrashIcon />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}
