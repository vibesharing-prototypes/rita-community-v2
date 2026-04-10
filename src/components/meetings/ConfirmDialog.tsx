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
          fontSize: "20px",
          fontWeight: 600,
          lineHeight: "24px",
          letterSpacing: 0,
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
        <Typography sx={{ fontSize: "14px", fontWeight: 400, lineHeight: "20px", letterSpacing: "0.2px", color: "var(--lens-semantic-color-type-default)" }}>
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
          size="medium"
          onClick={onConfirm}
          sx={destructive ? {
            backgroundColor: "var(--lens-semantic-color-status-error-default)",
            color: "#fff",
            "&:hover": { backgroundColor: "var(--lens-semantic-color-status-error-text)" },
          } : {}}
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
