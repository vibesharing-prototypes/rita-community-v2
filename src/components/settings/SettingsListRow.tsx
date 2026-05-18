import { Box, useTheme } from "@mui/material";
import type { PropsWithChildren } from "react";

import { getSettingsListRowSx } from "./settingsListRowStyles.js";

type SettingsListRowProps = PropsWithChildren<{
  id: string;
  onClick?: () => void;
}>;

export default function SettingsListRow({ id, children, onClick }: SettingsListRowProps) {
  const { tokens } = useTheme();
  const dividerColor =
    tokens?.component?.divider?.colors?.default?.borderColor?.value ?? "#E0E0E0";

  return (
    <Box
      id={id}
      onClick={onClick}
      sx={{
        ...getSettingsListRowSx(dividerColor),
        ...(onClick && {
          cursor: "pointer",
          "&:hover": { backgroundColor: "action.hover" },
        }),
      }}
    >
      {children}
    </Box>
  );
}
