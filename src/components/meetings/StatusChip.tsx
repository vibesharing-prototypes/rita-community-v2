import HideIcon from "@diligentcorp/atlas-react-bundle/icons/Hide";
import VisibleIcon from "@diligentcorp/atlas-react-bundle/icons/Visible";
import { Box, Typography } from "@mui/material";

const CHIP_STYLES: Record<string, { bg: string; color: string }> = {
  Draft:    { bg: "#F3F3F3", color: "#515255" },
  Active:   { bg: "#E4F3FF", color: "#004C6C" },
  Internal: { bg: "#FFF2AA", color: "#504700" },
  Public:   { bg: "#C2FFD2", color: "#006D3E" },
  Archived: { bg: "#F3F3F3", color: "#515255" },
};

const ICONS: Record<string, React.ReactNode> = {
  Internal: <HideIcon />,
  Public:   <VisibleIcon />,
};

export default function StatusChip({ label }: { label: string }) {
  const style = CHIP_STYLES[label] ?? { bg: "#F3F3F3", color: "#515255" };
  const icon = ICONS[label];

  return (
    <Box sx={{
      display: "inline-flex",
      alignItems: "center",
      gap: "4px",
      height: 24,
      bgcolor: style.bg,
      color: style.color,
      borderRadius: "9999px",
      border: "1px solid white",
      pl: icon ? "4px" : "12px",
      pr: "12px",
      py: "2px",
      whiteSpace: "nowrap",
    }}>
      {icon && (
        <Box sx={{ display: "flex", alignItems: "center", width: 20, height: 20, "& svg": { width: 16, height: 16, display: "block" } }}>
          {icon}
        </Box>
      )}
      <Typography sx={{ fontSize: 12, fontWeight: 600, lineHeight: "16px", letterSpacing: "0.3px", color: "inherit", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {label}
      </Typography>
    </Box>
  );
}
