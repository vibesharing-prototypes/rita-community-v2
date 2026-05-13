import CloseIcon from "@diligentcorp/atlas-react-bundle/icons/Close";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Typography,
} from "@mui/material";

/**
 * Shown when the user tries to switch agenda tabs or items while the rich
 * text editor has uncommitted changes. Save commits the in-progress edit and
 * proceeds, Discard throws the changes away and proceeds. Closing the dialog
 * (X or backdrop) cancels the attempted navigation.
 */
export default function UnsavedChangesDialog({
  open,
  onSave,
  onDiscard,
  onClose,
}: {
  open: boolean;
  onSave: () => void;
  onDiscard: () => void;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle
        component="div"
        sx={{
          fontSize: 'var(--lens-semantic-font-title-h3-lg-font-size)',
          fontWeight: 'var(--lens-core-font-weight-semi-bold)',
          lineHeight: 'var(--lens-semantic-font-title-h3-lg-line-height)',
          letterSpacing: 'var(--lens-semantic-letter-spacing-normal)',
          color: "var(--lens-semantic-color-type-default)",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 1,
          pb: "24px",
        }}
      >
        Unsaved changes
        <IconButton aria-label="Close" size="small" onClick={onClose} sx={{ flexShrink: 0, mt: "-2px", mr: "-4px" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Typography sx={{
          fontSize: 'var(--lens-semantic-font-text-body-font-size)',
          fontWeight: 'var(--lens-core-font-weight-regular)',
          lineHeight: 'var(--lens-semantic-font-text-body-line-height)',
          letterSpacing: 'var(--lens-semantic-letter-spacing-xs)',
          color: "var(--lens-semantic-color-type-default)",
        }}>
          You have unsaved changes. Save or discard before leaving.
        </Typography>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ px: 3, py: 2, justifyContent: "flex-end", gap: 1 }}>
        <Button variant="outlined" size="medium" onClick={onDiscard}>
          Discard
        </Button>
        <Button variant="contained" color="primary" size="medium" onClick={onSave}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
