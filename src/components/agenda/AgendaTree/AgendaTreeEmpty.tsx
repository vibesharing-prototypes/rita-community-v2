import { Box, Button, SvgIcon, Typography } from "@mui/material";

export default function AgendaTreeEmpty({ onAddCategory }: { onAddCategory: () => void }) {
  return (
    <Box sx={{ p: 3, textAlign: "center" }}>
      <Typography sx={{ fontSize: 14, color: "text.secondary", mb: 1.5 }}>
        No agenda items yet.
      </Typography>
      <Button
        variant="outlined"
        size="small"
        startIcon={
          <SvgIcon sx={{ width: 16, height: 16 }}>
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </SvgIcon>
        }
        onClick={onAddCategory}
      >
        Add your first category
      </Button>
    </Box>
  );
}
