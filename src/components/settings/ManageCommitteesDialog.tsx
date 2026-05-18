import CloseIcon from "@diligentcorp/atlas-react-bundle/icons/Close";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormLabel,
  IconButton,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import { useEffect, useState } from "react";

import type { SettingsUser } from "../../types/settings.js";
import { ALL_COMMITTEES_LABEL, isAllCommitteesUser } from "../../utils/committeeMembership.js";

type ManageCommitteesDialogProps = {
  open: boolean;
  user: SettingsUser | null;
  committeeNames: string[];
  onClose: () => void;
  onSave: (committeeNames: string[]) => void;
};

export default function ManageCommitteesDialog({
  open,
  user,
  committeeNames,
  onClose,
  onSave,
}: ManageCommitteesDialogProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const allCommitteesUser = user ? isAllCommitteesUser(user) : false;

  useEffect(() => {
    if (!open || !user) return;
    setSelected(user.committees.filter((name) => name !== ALL_COMMITTEES_LABEL));
  }, [open, user]);

  const handleChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setSelected(typeof value === "string" ? value.split(",") : value);
  };

  const handleSave = () => {
    onSave(selected);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth={false}
      slotProps={{ paper: { sx: { width: "100%", maxWidth: 560, m: 2 } } }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 1,
          pb: 2,
        }}
      >
        <Stack gap={0.5}>
          <Typography
            sx={{
              fontSize: "var(--lens-semantic-font-title-h3-lg-font-size)",
              fontWeight: "var(--lens-core-font-weight-semi-bold)",
            }}
          >
            Manage committees
          </Typography>
          {user && (
            <Typography variant="body1" sx={{ color: "var(--lens-semantic-color-type-muted)" }}>
              {user.name}
            </Typography>
          )}
        </Stack>
        <IconButton aria-label="Close" size="small" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 0 }}>
        {allCommitteesUser ? (
          <Typography variant="body1" sx={{ color: "var(--lens-semantic-color-type-muted)" }}>
            This user has access to all committees and cannot be reassigned here.
          </Typography>
        ) : (
          <FormControl fullWidth size="small">
            <FormLabel>Committees</FormLabel>
            <Select
              multiple
              value={selected}
              onChange={handleChange}
              input={<OutlinedInput />}
              renderValue={(values) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {(values as string[]).map((name) => (
                    <Chip key={name} label={name} size="small" />
                  ))}
                </Box>
              )}
            >
              {committeeNames.map((name) => (
                <MenuItem key={name} value={name}>
                  {name}
                </MenuItem>
              ))}
            </Select>
            <Typography variant="body1" sx={{ color: "var(--lens-semantic-color-type-muted)", mt: 1 }}>
              New assignments receive the Administrator role on that committee.
            </Typography>
          </FormControl>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button variant="outlined" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={!user || allCommitteesUser}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
