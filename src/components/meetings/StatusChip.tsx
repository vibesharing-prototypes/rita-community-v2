import { useTheme } from "@mui/material";

const MUTED = { backgroundColor: "#F3F3F3", color: "#515255" };
const PUBLISHED = { backgroundColor: "#E4F3FF", color: "#004C6C" };

export default function StatusChip({ label }: { label: string }) {
  const { presets } = useTheme();
  const StatusIndicator = presets.StatusIndicatorPresets?.components.StatusIndicator;
  if (!StatusIndicator) return null;

  const customColor = label === "Published" ? PUBLISHED : MUTED;

  return (
    <StatusIndicator
      label={label}
      customColor={customColor}
      sx={{ boxShadow: "0 0 0 1px #FFFFFF", "& .MuiChip-label": { display: "flex", alignItems: "center", lineHeight: 1, fontWeight: 600 } }}
    />
  );
}
