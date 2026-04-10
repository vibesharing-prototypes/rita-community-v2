import AddIcon from "@diligentcorp/atlas-react-bundle/icons/Add";
import CloseIcon from "@diligentcorp/atlas-react-bundle/icons/Close";
import GroupIcon from "@diligentcorp/atlas-react-bundle/icons/Group";
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
import { useEffect, useState } from "react";

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
  committees,
  onClose,
  onSelect,
}: {
  open: boolean;
  templates: MeetingTemplate[];
  committees: string[];
  onClose: () => void;
  onSelect: (templateId: string | null, committee: string | null) => void;
}) {
  const { tokens } = useTheme();
  const dividerColor = tokens?.component?.divider?.colors?.default?.borderColor?.value ?? "#E0E0E0";
  const activeTemplates = templates.filter((t) => t.status === "Active");
  const [step, setStep] = useState<1 | 2>(1);

  useEffect(() => {
    if (!open) setStep(1);
  }, [open]);

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ pl: "20px" }}>
        <Stack direction="row" alignItems="center" gap={1}>
          {step === 2 && (
            <IconButton
              aria-label="Back"
              onClick={() => setStep(1)}
              edge="start"
              sx={{ flexShrink: 0 }}
            >
              <SvgIcon sx={{ width: 20, height: 20 }}>
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
              </SvgIcon>
            </IconButton>
          )}
          <Box flex={1}>
            New meeting
            <Box component="p" sx={{ m: 0 }}>
              {step === 1
                ? "Start with a template or create a blank meeting."
                : "Choose a committee for this meeting."}
            </Box>
          </Box>
        </Stack>
        <IconButton aria-label="Close" onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: "0 !important", pb: "20px", px: "20px" }}>
        {step === 1 ? (
          <Stack gap={1.5}>
            {activeTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                icon={<PageIcon />}
                iconBg="#D7F6FF"
                title={template.name}
                subtitle={template.committee}
                onClick={() => onSelect(template.id, null)}
                borderColor={dividerColor}
              />
            ))}
            <TemplateCard
              icon={<AddIcon />}
              iconBg="#F0F0F0"
              title="Create blank meeting"
              onClick={() => setStep(2)}
              borderColor={dividerColor}
            />
          </Stack>
        ) : (
          <Stack gap={1.5}>
            {committees.map((committee) => (
              <TemplateCard
                key={committee}
                icon={<GroupIcon />}
                iconBg="#F0F0F0"
                title={committee}
                onClick={() => onSelect(null, committee)}
                borderColor={dividerColor}
              />
            ))}
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
}
