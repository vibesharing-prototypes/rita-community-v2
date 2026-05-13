import { Box, Stack } from "@mui/material";
import type { PropsWithChildren } from "react";

type PageLayoutProps = PropsWithChildren<{ id?: string }>;

/**
 * Standard page wrapper. Uses the full available width (matching the
 * Agenda editor layout) rather than MUI's max-width Container, so the
 * content sits flush against the side navigation with consistent
 * 16/24px gutters across screen sizes.
 */
export default function PageLayout({ children, id }: PageLayoutProps) {
  return (
    <Box id={id} sx={{ pt: 4, pb: 3, px: 4 }}>
      <Stack gap={3}>{children}</Stack>
    </Box>
  );
}
