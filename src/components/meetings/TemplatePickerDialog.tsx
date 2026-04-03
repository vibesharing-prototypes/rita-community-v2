import AddIcon from "@diligentcorp/atlas-react-bundle/icons/Add";
import CloseIcon from "@diligentcorp/atlas-react-bundle/icons/Close";
import PageIcon from "@diligentcorp/atlas-react-bundle/icons/Page";
import {
  Box,
  ButtonBase,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  SvgIcon,
  Typography,
  useTheme,
} from "@mui/material";


import type { MeetingTemplate } from "../../types/meetings";

function TemplateCard({
  icon,
  iconBg,
  title,
  subtitle,
  onClick,
  borderColor,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle?: string;
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
          backgroundColor: iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          "& svg": { width: 24, height: 24 },
        }}
      >
        {icon}
      </Box>
      <Stack flex={1} alignItems="flex-start" spacing={0}>
        <Typography
          sx={{ fontSize: "16px", fontWeight: 600, lineHeight: "24px", color: "text.primary" }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography
            sx={{ fontSize: "14px", fontWeight: 400, lineHeight: "20px", color: "text.secondary" }}
          >
            {subtitle}
          </Typography>
        )}
      </Stack>
      <SvgIcon sx={{ width: 20, height: 20, color: "text.secondary", flexShrink: 0 }}>
        <path d="M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
      </SvgIcon>
    </ButtonBase>
  );
}

export default function TemplatePickerDialog({
  open,
  templates,
  onClose,
  onSelect,
}: {
  open: boolean;
  templates: MeetingTemplate[];
  onClose: () => void;
  onSelect: (templateId: string | null) => void;
}) {
  const { tokens } = useTheme();
  const dividerColor = tokens?.component?.divider?.colors?.default?.borderColor?.value ?? "#E0E0E0";
  const activeTemplates = templates.filter((t) => t.status === "Active");

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        New meeting
        <Box component="p" sx={{ m: 0 }}>
          Start with a template or create a blank meeting.
        </Box>
        <IconButton aria-label="Close" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: "0 !important", pb: "20px", px: "20px" }}>
        <Stack gap={1.5}>
          {activeTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              icon={<PageIcon />}
              iconBg="#D7F6FF"
              title={template.name}
              subtitle={template.committee}
              onClick={() => onSelect(template.id)}
              borderColor={dividerColor}
            />
          ))}
          <TemplateCard
            icon={<AddIcon />}
            iconBg="#F0F0F0"
            title="Create blank meeting"
            onClick={() => onSelect(null)}
            borderColor={dividerColor}
          />
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
