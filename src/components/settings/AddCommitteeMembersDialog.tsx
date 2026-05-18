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
import { useEffect, useMemo, useState } from "react";

import type { SettingsUser } from "../../types/settings.js";
import { isAllCommitteesUser } from "../../utils/committeeMembership.js";
import { userBelongsToCommittee } from "../../utils/settings.js";

type AddCommitteeMembersDialogProps = {
  open: boolean;
  committeeName: string;
  users: SettingsUser[];
  onClose: () => void;
  onAdd: (userIds: string[]) => void;
};

export default function AddCommitteeMembersDialog({
  open,
  committeeName,
  users,
  onClose,
  onAdd,
}: AddCommitteeMembersDialogProps) {
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  const availableUsers = useMemo(
    () =>
      users.filter(
        (user) =>
          !isAllCommitteesUser(user) && !userBelongsToCommittee(user, committeeName),
      ),
    [users, committeeName],
  );

  useEffect(() => {
    if (!open) return;
    setSelectedUserIds([]);
  }, [open, committeeName]);

  const handleChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setSelectedUserIds(typeof value === "string" ? value.split(",") : value);
  };

  const handleAdd = () => {
    onAdd(selectedUserIds);
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
            Add members
          </Typography>
          <Typography variant="body1" sx={{ color: "var(--lens-semantic-color-type-muted)" }}>
            {committeeName}
          </Typography>
        </Stack>
        <IconButton aria-label="Close" size="small" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 0 }}>
        {availableUsers.length === 0 ? (
          <Typography variant="body1" sx={{ color: "var(--lens-semantic-color-type-muted)" }}>
            All eligible users are already on this committee.
          </Typography>
        ) : (
          <FormControl fullWidth size="small">
            <FormLabel>Users</FormLabel>
            <Select
              multiple
              value={selectedUserIds}
              onChange={handleChange}
              input={<OutlinedInput />}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {(selected as string[]).map((userId) => {
                    const user = users.find((item) => item.id === userId);
                    return <Chip key={userId} label={user?.name ?? userId} size="small" />;
                  })}
                </Box>
              )}
            >
              {availableUsers.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.name}
                </MenuItem>
              ))}
            </Select>
            <Typography variant="body1" sx={{ color: "var(--lens-semantic-color-type-muted)", mt: 1 }}>
              Added users receive the Administrator role on this committee.
            </Typography>
          </FormControl>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button variant="outlined" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleAdd}
          disabled={selectedUserIds.length === 0}
        >
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
}
