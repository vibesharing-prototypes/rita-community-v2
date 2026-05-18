import {
  Box,
  Chip,
  FormControl,
  FormLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";

import type { CommitteeAccessRoleKey, SettingsCommittee, SettingsUser } from "../../../types/settings.js";
import { COMMITTEE_ACCESS_ROLES } from "../../../utils/committeeSettings.js";
import CommitteeSettingsCard from "./CommitteeSettingsCard.js";

type CommitteeUserAccessSectionProps = {
  committee: SettingsCommittee;
  allUsers: SettingsUser[];
  dividerColor: string;
  onChange: (userAccess: SettingsCommittee["userAccess"]) => void;
};

export default function CommitteeUserAccessSection({
  committee,
  allUsers,
  dividerColor,
  onChange,
}: CommitteeUserAccessSectionProps) {
  const handleRoleUsersChange =
    (role: CommitteeAccessRoleKey) => (event: SelectChangeEvent<string[]>) => {
      const value = event.target.value;
      const userIds = typeof value === "string" ? value.split(",") : value;
      onChange({
        ...committee.userAccess,
        [role]: userIds,
      });
    };

  return (
    <CommitteeSettingsCard
      title="User access"
      description="Assign users to BoardDocs-style roles for this committee. Roles control what each person can view and manage."
      dividerColor={dividerColor}
    >
      <Stack gap={2}>
        {COMMITTEE_ACCESS_ROLES.map((role) => {
          const selectedIds = committee.userAccess[role.key] ?? [];
          return (
            <Box key={role.key}>
              <FormControl fullWidth size="small">
                <FormLabel>{role.label}</FormLabel>
                {role.description && (
                  <Typography
                    variant="body1"
                    sx={{ color: "var(--lens-semantic-color-type-muted)", mb: 0.5 }}
                  >
                    {role.description}
                  </Typography>
                )}
                <Select
                  multiple
                  value={selectedIds}
                  onChange={handleRoleUsersChange(role.key)}
                  input={<OutlinedInput />}
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {(selected as string[]).map((userId) => {
                        const user = allUsers.find((u) => u.id === userId);
                        return (
                          <Chip key={userId} label={user?.name ?? userId} size="small" />
                        );
                      })}
                    </Box>
                  )}
                >
                  {allUsers.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          );
        })}
      </Stack>
    </CommitteeSettingsCard>
  );
}
