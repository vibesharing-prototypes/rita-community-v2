import CloseIcon from "@diligentcorp/atlas-react-bundle/icons/Close";
import UploadIcon from "@diligentcorp/atlas-react-bundle/icons/Upload";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { useCallback, useRef, useState } from "react";

export default function UploadDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const handleFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    setFiles((prev) => [...prev, ...Array.from(incoming)]);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, []);

  const handleClose = () => {
    setFiles([]);
    setIsDragOver(false);
    onClose();
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle
        component="div"
        sx={{
          fontSize: "20px",
          fontWeight: 600,
          lineHeight: "24px",
          color: "var(--lens-semantic-color-type-default)",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 1,
          pb: "16px",
        }}
      >
        Upload files
        <IconButton
          aria-label="Close"
          size="small"
          onClick={handleClose}
          sx={{ flexShrink: 0, mt: "-2px", mr: "-4px" }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pb: 3 }}>
        <Stack gap={2}>
          {/* Drop zone */}
          <Box
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            sx={{
              border: "2px dashed",
              borderColor: isDragOver
                ? "primary.main"
                : "var(--lens-semantic-color-type-muted)",
              borderRadius: "12px",
              backgroundColor: isDragOver
                ? "rgba(25, 118, 210, 0.04)"
                : "transparent",
              px: 4,
              py: 5,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 1.5,
              cursor: "pointer",
              transition: "border-color 0.2s, background-color 0.2s",
              "&:hover": {
                borderColor: "primary.main",
                backgroundColor: "rgba(25, 118, 210, 0.04)",
              },
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                backgroundColor: "action.hover",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <UploadIcon style={{ fontSize: 24, color: "var(--lens-semantic-color-type-muted)" }} />
            </Box>
            <Stack alignItems="center" gap={0.5}>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                Drag and drop files here
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "var(--lens-semantic-color-type-muted)" }}
              >
                or
              </Typography>
            </Stack>
            <Button
              variant="outlined"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              Browse files
            </Button>
          </Box>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            hidden
            onChange={(e) => {
              handleFiles(e.target.files);
              e.target.value = "";
            }}
          />

          {/* Selected files list */}
          {files.length > 0 && (
            <Stack gap={1}>
              <Typography variant="subtitle2">
                {files.length} {files.length === 1 ? "file" : "files"} selected
              </Typography>
              <Stack
                gap={0.5}
                sx={{
                  maxHeight: 160,
                  overflowY: "auto",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: "8px",
                  p: 1,
                }}
              >
                {files.map((file, i) => (
                  <Stack
                    key={`${file.name}-${i}`}
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ px: 1, py: 0.5 }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: "70%",
                      }}
                    >
                      {file.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "var(--lens-semantic-color-type-muted)", flexShrink: 0 }}
                    >
                      {formatSize(file.size)}
                    </Typography>
                  </Stack>
                ))}
              </Stack>

              <Stack direction="row" justifyContent="flex-end" gap={1} sx={{ mt: 1 }}>
                <Button variant="outlined" size="small" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<UploadIcon />}
                  onClick={handleClose}
                >
                  Upload
                </Button>
              </Stack>
            </Stack>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
