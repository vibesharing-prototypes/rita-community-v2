import type { SxProps, Theme } from "@mui/material";

/** Matches meeting list row styling on MeetingsPage. */
export function getSettingsListRowSx(dividerColor: string): SxProps<Theme> {
  return {
    border: `1px solid ${dividerColor}`,
    borderRadius: "12px",
    backgroundColor: "white",
    p: 1.5,
    display: "flex",
    alignItems: "center",
    gap: 2,
    overflow: "hidden",
    "@media (min-width: 960px)": { gap: 3 },
  };
}

export const settingsRowBadgeSx: SxProps<Theme> = {
  width: 50,
  height: 50,
  flexShrink: 0,
  bgcolor: "#E4F3FF",
  borderRadius: "8px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  color: "var(--lens-semantic-color-type-default)",
};

export const settingsRowMutedTextSx: SxProps<Theme> = {
  fontSize: "var(--lens-semantic-font-text-md-font-size)",
  color: "var(--lens-semantic-color-type-muted)",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

export const settingsRowColumnSx = (width: number, hideBelow?: number): SxProps<Theme> => ({
  width,
  flexShrink: 0,
  ...(hideBelow != null && { [`@media (max-width: ${hideBelow}px)`]: { display: "none" } }),
});
