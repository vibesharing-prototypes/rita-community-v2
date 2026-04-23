import { Box, Typography, useTheme } from "@mui/material";

export default function DateBadge({ month, day }: { month: string; day: string }) {
  const { tokens } = useTheme();

  const background = "#E4F3FF";
  const textColor = tokens.semantic?.color?.type?.default?.value
    ?? "var(--lens-semantic-color-type-default)";
  const semiBold = tokens.core?.fontWeight?.semiBold?.value
    ?? "var(--lens-core-font-weight-semi-bold)";
  const regular = tokens.core?.fontWeight?.regular?.value
    ?? "var(--lens-core-font-weight-regular)";

  return (
    <Box
      sx={{
        width: 59,
        flexShrink: 0,
        alignSelf: "stretch",
        textAlign: "center",
        borderRadius: tokens.semantic?.radius?.md?.value ?? "8px",
        backgroundColor: background,
        color: textColor,
        px: "20px",
        py: "12px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Typography
        component="span"
        sx={{
          fontSize: "12px",
          fontWeight: regular,
          lineHeight: "16px",
          letterSpacing: "0.3px",
          display: "block",
          width: "100%",
        }}
      >
        {month}
      </Typography>
      <Typography
        component="span"
        sx={{
          fontSize: "14px",
          fontWeight: semiBold,
          lineHeight: "20px",
          letterSpacing: "0.2px",
          display: "block",
          width: "100%",
        }}
      >
        {day}
      </Typography>
    </Box>
  );
}
