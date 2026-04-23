import AddIcon from "@diligentcorp/atlas-react-bundle/icons/Add";
import ArrowLeftIcon from "@diligentcorp/atlas-react-bundle/icons/ArrowLeft";
import CloseIcon from "@diligentcorp/atlas-react-bundle/icons/Close";
import CopyIcon from "@diligentcorp/atlas-react-bundle/icons/Copy";
import GroupIcon from "@diligentcorp/atlas-react-bundle/icons/Group";
import PageIcon from "@diligentcorp/atlas-react-bundle/icons/Page";
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
import { useEffect, useState } from "react";

import type { Meeting, MeetingTemplate } from "../../types/meetings";

export type NewMeetingResult =
  | { type: "template"; templateId: string }
  | { type: "duplicate"; meeting: Meeting }
  | { type: "blank"; committee: string };

type Step = "choose" | "from-template" | "duplicate" | "blank";

// ── Shared option card ─────────────────────────────────────────────────────

function OptionCard({
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
          p: 1,
          borderRadius: "8px",
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
      <Stack flex={1} alignItems="flex-start" gap="2px">
        <Typography sx={{ fontSize: "14px", fontWeight: 600, lineHeight: "20px", letterSpacing: "0.2px", color: "text.primary" }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography sx={{ fontSize: "12px", fontWeight: 400, lineHeight: "16px", letterSpacing: "0.3px", color: "var(--lens-semantic-color-type-muted)" }}>
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

// ── Main dialog ────────────────────────────────────────────────────────────

export default function TemplatePickerDialog({
  open,
  templates,
  meetings,
  committees,
  onClose,
  onSelect,
}: {
  open: boolean;
  templates: MeetingTemplate[];
  meetings: Meeting[];
  committees: string[];
  onClose: () => void;
  onSelect: (result: NewMeetingResult) => void;
}) {
  const { tokens } = useTheme();
  const dividerColor = tokens?.component?.divider?.colors?.default?.borderColor?.value ?? "#E0E0E0";
  const activeTemplates = templates.filter((t) => t.status === "Active");
  const activeMeetings = meetings.filter((m) => m.status === "Active");

  const [step, setStep] = useState<Step>("choose");

  useEffect(() => {
    if (!open) setStep("choose");
  }, [open]);

  const stepTitle: Record<Step, string> = {
    choose: "New meeting",
    "from-template": "From template",
    duplicate: "Duplicate existing",
    blank: "Blank meeting",
  };

  const stepSubtitle: Record<Step, string> = {
    choose: "Start with a template, duplicate, or create blank.",
    "from-template": "Choose a template to start from.",
    duplicate: "Choose an active meeting to copy.",
    blank: "Choose a committee for this meeting.",
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      scroll="paper"
      PaperProps={{ sx: { maxHeight: 560 } }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: "8px", px: "24px", pt: "20px", pb: "24px" }}>
        {step !== "choose" && (
          <IconButton
            aria-label="Back"
            size="small"
            onClick={() => setStep("choose")}
            sx={{ flexShrink: 0 }}
          >
            <ArrowLeftIcon />
          </IconButton>
        )}
        <Stack gap="4px" flex={1} minWidth={0}>
          <Typography sx={{ fontSize: 20, fontWeight: 600, lineHeight: "24px", letterSpacing: 0 }}>
            {stepTitle[step]}
          </Typography>
          <Typography sx={{ fontSize: 12, fontWeight: 400, lineHeight: "16px", letterSpacing: "0.3px", color: "text.secondary" }}>
            {stepSubtitle[step]}
          </Typography>
        </Stack>
        <IconButton aria-label="Close" size="small" onClick={onClose} sx={{ flexShrink: 0 }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent sx={{ pt: "0 !important", pb: "24px", px: "24px" }}>
        {/* Step 1 — choose method */}
        {step === "choose" && (
          <Stack gap={1.5}>
            <OptionCard
              icon={<PageIcon />}
              iconBg="#E4F3FF"
              title="From template"
              subtitle="Start from a saved agenda structure"
              onClick={() => setStep("from-template")}
              borderColor={dividerColor}
            />
            <OptionCard
              icon={<CopyIcon />}
              iconBg="#E4F3FF"
              title="Duplicate existing"
              subtitle="Copy a past meeting's structure"
              onClick={() => setStep("duplicate")}
              borderColor={dividerColor}
            />
            <OptionCard
              icon={<AddIcon />}
              iconBg="#F0F0F0"
              title="Blank meeting"
              subtitle="Start from scratch"
              onClick={() => setStep("blank")}
              borderColor={dividerColor}
            />
          </Stack>
        )}

        {/* Step 2a — template picker */}
        {step === "from-template" && (
          <Stack gap={1.5}>
            {activeTemplates.map((template) => (
              <OptionCard
                key={template.id}
                icon={<PageIcon />}
                iconBg="#E4F3FF"
                title={template.name}
                subtitle={template.committee}
                onClick={() => onSelect({ type: "template", templateId: template.id })}
                borderColor={dividerColor}
              />
            ))}
          </Stack>
        )}

        {/* Step 2b — duplicate existing meeting */}
        {step === "duplicate" && (
          <Stack gap={1.5}>
            {activeMeetings.map((meeting) => (
              <OptionCard
                key={meeting.id}
                icon={<CopyIcon />}
                iconBg="#E4F3FF"
                title={meeting.name}
                subtitle={meeting.committee}
                onClick={() => onSelect({ type: "duplicate", meeting })}
                borderColor={dividerColor}
              />
            ))}
          </Stack>
        )}

        {/* Step 2c — committee picker for blank */}
        {step === "blank" && (
          <Stack gap={1.5}>
            {committees.map((committee) => (
              <OptionCard
                key={committee}
                icon={<GroupIcon />}
                iconBg="#F0F0F0"
                title={committee}
                onClick={() => onSelect({ type: "blank", committee })}
                borderColor={dividerColor}
              />
            ))}
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
}
