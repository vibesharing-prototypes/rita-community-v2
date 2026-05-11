import CloseIcon from "@diligentcorp/atlas-react-bundle/icons/Close";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  TextField,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";

export default function NewFolderDialog({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
}) {
  const [name, setName] = useState("Untitled folder");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setName("Untitled folder");
      setTimeout(() => inputRef.current?.select(), 0);
    }
  }, [open]);

  const handleCreate = () => {
    const trimmed = name.trim();
    if (trimmed) {
      onCreate(trimmed);
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
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
        New folder
        <IconButton
          aria-label="Close"
          size="small"
          onClick={onClose}
          sx={{ flexShrink: 0, mt: "-2px", mr: "-4px" }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <TextField
          inputRef={inputRef}
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleCreate();
          }}
          autoFocus
          sx={{
            "& .MuiOutlinedInput-root.Mui-focused": {
              boxShadow: "none",
              outline: "none",
            },
            "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "divider",
              borderWidth: 1,
              boxShadow: "none",
            },
          }}
        />
      </DialogContent>
      <Divider />
      <DialogActions sx={{ px: 3, py: 2, justifyContent: "space-between" }}>
        <Button variant="outlined" size="medium" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          size="medium"
          onClick={handleCreate}
          disabled={!name.trim()}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}
