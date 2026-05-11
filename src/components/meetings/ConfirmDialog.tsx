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

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  destructive = false,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  destructive?: boolean;
  onConfirm: () => void;
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
        {title}
        <IconButton aria-label="Close" size="small" onClick={onClose} sx={{ flexShrink: 0, mt: "-2px", mr: "-4px" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Typography sx={{ fontSize: 'var(--lens-semantic-font-text-body-font-size)', fontWeight: 'var(--lens-core-font-weight-regular)', lineHeight: 'var(--lens-semantic-font-text-body-line-height)', letterSpacing: 'var(--lens-semantic-letter-spacing-xs)', color: "var(--lens-semantic-color-type-default)" }}>
          {message}
        </Typography>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ px: 3, py: 2, justifyContent: "space-between" }}>
        <Button variant="outlined" size="medium" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color={destructive ? "destructive" : "primary"}
          size="medium"
          onClick={onConfirm}
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
