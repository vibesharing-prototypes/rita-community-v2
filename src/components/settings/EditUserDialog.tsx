import CloseIcon from "@diligentcorp/atlas-react-bundle/icons/Close";
import InfoIcon from "@diligentcorp/atlas-react-bundle/icons/Info";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState, type ReactNode } from "react";

import type { SettingsUser, SettingsUserFormValues } from "../../types/settings.js";

type EditUserDialogProps = {
  open: boolean;
  user: SettingsUser | null;
  onClose: () => void;
  onSave: (values: SettingsUserFormValues) => void;
};

type FormState = SettingsUserFormValues;

const EMPTY_FORM: FormState = {
  firstName: "",
  middleInitial: "",
  lastName: "",
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
};

function UserFormRow({
  label,
  required,
  helperText,
  children,
}: {
  label: string;
  required?: boolean;
  helperText?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "200px 1fr" },
        gap: { xs: 0.5, sm: 2 },
        alignItems: "start",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, pt: { xs: 0, sm: 1 } }}>
        {required && (
          <Typography component="span" sx={{ color: "#c9a000", fontSize: 14, lineHeight: 1 }}>
            *
          </Typography>
        )}
        <Typography
          sx={{
            fontSize: "var(--lens-semantic-font-text-body-font-size)",
            fontWeight: "var(--lens-core-font-weight-regular)",
            color: "var(--lens-semantic-color-type-default)",
          }}
        >
          {label}
        </Typography>
      </Box>
      <Box>
        {children}
        {helperText}
      </Box>
    </Box>
  );
}

export default function EditUserDialog({ open, user, onClose, onSave }: EditUserDialogProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const isAddMode = !user;

  useEffect(() => {
    if (!open) return;
    if (user) {
      setForm({
        firstName: user.firstName,
        middleInitial: user.middleInitial ?? "",
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        password: "",
        confirmPassword: "",
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setPasswordError(null);
  }, [open, user]);

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key === "password" || key === "confirmPassword") {
      setPasswordError(null);
    }
  };

  const handleSave = () => {
    if (isAddMode) {
      if (!form.password || !form.confirmPassword) {
        setPasswordError("Password and confirm password are required.");
        return;
      }
      if (form.password !== form.confirmPassword) {
        setPasswordError("Password and confirm password must match.");
        return;
      }
    } else {
      const hasPassword = form.password.length > 0 || form.confirmPassword.length > 0;
      if (hasPassword && form.password !== form.confirmPassword) {
        setPasswordError("Password and confirm password must match.");
        return;
      }
      if (hasPassword && !form.password) {
        setPasswordError("Enter a password.");
        return;
      }
    }
    onSave(form);
    onClose();
  };

  const fieldSx = { "& .MuiInputBase-root": { bgcolor: "background.paper" } };
  const readOnlyFieldSx = {
    ...fieldSx,
    "& .MuiInputBase-root": {
      bgcolor: "#fff9e6",
    },
    "& .MuiInputBase-input.Mui-disabled": {
      WebkitTextFillColor: "var(--lens-semantic-color-type-default)",
    },
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth={false}
      slotProps={{
        paper: {
          sx: {
            width: "100%",
            maxWidth: 720,
            m: 2,
          },
        },
      }}
    >
      <DialogTitle
        component="div"
        sx={{
          fontSize: "var(--lens-semantic-font-title-h3-lg-font-size)",
          fontWeight: "var(--lens-core-font-weight-semi-bold)",
          lineHeight: "var(--lens-semantic-font-title-h3-lg-line-height)",
          color: "var(--lens-semantic-color-type-default)",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 1,
          pb: 2,
          bgcolor: "var(--lens-semantic-color-surface-subtle)",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        Add/Edit Person
        <IconButton aria-label="Close" size="small" onClick={onClose} sx={{ flexShrink: 0, mt: "-2px", mr: "-4px" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, px: 4, pb: 4 }}>
        <Stack gap={3}>
          <UserFormRow
            label="First Name"
            required
            helperText={
              <Stack direction="row" alignItems="flex-start" gap={0.75} sx={{ mt: 1 }}>
                <InfoIcon
                  style={{
                    fontSize: 16,
                    flexShrink: 0,
                    marginTop: 2,
                    color: "var(--lens-semantic-color-type-muted)",
                  }}
                />
                <Typography
                  sx={{
                    fontSize: "var(--lens-semantic-font-text-md-font-size)",
                    color: "var(--lens-semantic-color-type-muted)",
                    lineHeight: "var(--lens-semantic-font-text-md-line-height)",
                  }}
                >
                  Required: First Name can contain letters, hyphens and apostrophes.
                </Typography>
              </Stack>
            }
          >
            <TextField
              value={form.firstName}
              onChange={(e) => updateField("firstName", e.target.value)}
              fullWidth
              size="medium"
              disabled={!isAddMode}
              sx={isAddMode ? fieldSx : readOnlyFieldSx}
            />
          </UserFormRow>

          <UserFormRow label="Middle Initial">
            <TextField
              value={form.middleInitial}
              onChange={(e) => updateField("middleInitial", e.target.value.slice(0, 1))}
              fullWidth
              size="medium"
              inputProps={{ maxLength: 1 }}
              sx={fieldSx}
            />
          </UserFormRow>

          <UserFormRow label="Last Name" required>
            <TextField
              value={form.lastName}
              onChange={(e) => updateField("lastName", e.target.value)}
              fullWidth
              size="medium"
              sx={fieldSx}
            />
          </UserFormRow>

          <UserFormRow label="Username" required>
            <TextField
              value={form.username}
              onChange={(e) => updateField("username", e.target.value)}
              fullWidth
              size="medium"
              sx={fieldSx}
            />
          </UserFormRow>

          <UserFormRow label="Email Address" required>
            <TextField
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              fullWidth
              size="medium"
              type="email"
              sx={fieldSx}
            />
          </UserFormRow>

          <UserFormRow label="Password" required>
            <TextField
              value={form.password}
              onChange={(e) => updateField("password", e.target.value)}
              fullWidth
              size="medium"
              type="password"
              autoComplete="new-password"
              sx={fieldSx}
            />
          </UserFormRow>

          <UserFormRow label="Confirm" required>
            <TextField
              value={form.confirmPassword}
              onChange={(e) => updateField("confirmPassword", e.target.value)}
              fullWidth
              size="medium"
              type="password"
              autoComplete="new-password"
              error={Boolean(passwordError)}
              helperText={passwordError ?? undefined}
              sx={fieldSx}
            />
          </UserFormRow>
        </Stack>
      </DialogContent>

      <Divider />
      <DialogActions sx={{ px: 3, py: 2, justifyContent: "flex-end", gap: 1 }}>
        <Button variant="outlined" size="medium" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="contained" size="medium" onClick={handleSave}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
