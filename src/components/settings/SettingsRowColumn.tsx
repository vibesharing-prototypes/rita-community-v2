import { Box, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

import { settingsRowColumnSx, settingsRowMutedTextSx } from "./settingsListRowStyles.js";

type SettingsRowColumnProps = {
  width: number;
  hideBelow?: number;
  icon?: ReactNode;
  children: ReactNode;
};

export default function SettingsRowColumn({
  width,
  hideBelow,
  icon,
  children,
}: SettingsRowColumnProps) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      gap="4px"
      sx={settingsRowColumnSx(width, hideBelow)}
    >
      {icon && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            width: 20,
            height: 20,
            color: "var(--lens-semantic-color-type-muted)",
            flexShrink: 0,
            "& svg": { width: 20, height: 20, display: "block" },
          }}
        >
          {icon}
        </Box>
      )}
      <Typography sx={settingsRowMutedTextSx}>{children}</Typography>
    </Stack>
  );
}
