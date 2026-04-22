import { Button, Stack, SvgIcon } from "@mui/material";

export default function AgendaToolbar({
  onAddCategory,
  onAddItem,
  hasCategories,
}: {
  onAddCategory: () => void;
  onAddItem: () => void;
  hasCategories: boolean;
}) {
  return (
    <Stack direction="row" gap={1}>
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
        Add Category
      </Button>
      <Button
        variant="outlined"
        size="small"
        disabled={!hasCategories}
        startIcon={
          <SvgIcon sx={{ width: 16, height: 16 }}>
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </SvgIcon>
        }
        onClick={onAddItem}
      >
        Add Item
      </Button>
    </Stack>
  );
}
