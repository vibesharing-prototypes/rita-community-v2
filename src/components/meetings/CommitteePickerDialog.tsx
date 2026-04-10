import CloseIcon from "@diligentcorp/atlas-react-bundle/icons/Close";
import GroupIcon from "@diligentcorp/atlas-react-bundle/icons/Group";
import {
  Box,
  ButtonBase,
  Dialog,
  DialogContent,
  IconButton,
  Stack,
  SvgIcon,
  Typography,
  useTheme,
} from "@mui/material";

function CommitteeCard({
  title,
  onClick,
  borderColor,
}: {
  title: string;
  onClick: () => void;
  borderColor: string;
}) {
  return (
    <ButtonBase
      onClick={onClick}
      sx={{
        width: "100%",
        textAlign: "left",
        border: `1px solid ${borderColor}`,
        borderRadius: "12px",
        p: "12px",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: "12px",
        "&:hover": { backgroundColor: "action.hover" },
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: "10px",
          backgroundColor: "#F0F0F0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          "& svg": { width: 24, height: 24 },
        }}
      >
        <GroupIcon />
      </Box>
      <Typography
        sx={{ fontSize: "16px", fontWeight: 600, lineHeight: "24px", flex: 1, textAlign: "left" }}
      >
        {title}
      </Typography>
      <SvgIcon sx={{ width: 20, height: 20, color: "text.secondary", flexShrink: 0 }}>
        <path d="M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
      </SvgIcon>
    </ButtonBase>
  );
}

export default function CommitteePickerDialog({
  open,
  committees,
  onClose,
  onSelect,
}: {
  open: boolean;
  committees: string[];
  onClose: () => void;
  onSelect: (committee: string) => void;
}) {
  const { tokens } = useTheme();
  const dividerColor =
    tokens?.component?.divider?.colors?.default?.borderColor?.value ?? "#E0E0E0";

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          px: "24px",
          pt: "24px",
          pb: "24px",
        }}
      >
        <Box>
          <Typography sx={{ fontSize: 22, fontWeight: 600, lineHeight: "28px" }}>
            New template
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Choose a committee for this template.
          </Typography>
        </Box>
        <IconButton
          aria-label="Close"
          onClick={onClose}
          sx={{ flexShrink: 0, mt: "-4px", mr: "-8px" }}
        >
          <CloseIcon />
        </IconButton>
      </Box>
      <DialogContent sx={{ pt: "0 !important", pb: "24px", px: "24px" }}>
        <Stack gap={1.5}>
          {committees.map((committee) => (
            <CommitteeCard
              key={committee}
              title={committee}
              onClick={() => onSelect(committee)}
              borderColor={dividerColor}
            />
          ))}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
