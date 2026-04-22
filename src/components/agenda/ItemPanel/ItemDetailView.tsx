import { Box, Button, Divider, IconButton, Stack, SvgIcon, Typography } from "@mui/material";
import { format } from "date-fns";
import type { AgendaAttachment, AgendaCategory, AgendaItem } from "../../../types/agenda";

function TierSection({
  label,
  content,
  attachments,
}: {
  label: string;
  content: string;
  attachments: AgendaAttachment[];
}) {
  const hasContent = content.trim().length > 0 || attachments.length > 0;

  return (
    <Box>
      <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", color: "text.secondary", mb: 1 }}>
        {label}
      </Typography>
      {hasContent ? (
        <Stack gap={1}>
          {content.trim() && (
            <Typography sx={{ fontSize: 14, lineHeight: "22px", whiteSpace: "pre-wrap" }}>
              {content}
            </Typography>
          )}
          {attachments.map((att) => (
            <Stack key={att.id} direction="row" alignItems="center" gap={1}>
              <SvgIcon sx={{ width: 16, height: 16, color: "text.secondary", flexShrink: 0 }}>
                <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z" />
              </SvgIcon>
              <Typography sx={{ fontSize: 13, color: "primary.main", flex: 1 }}>
                {att.filename}
              </Typography>
              <Box sx={{
                fontSize: 11, fontWeight: 600, px: "8px", py: "2px",
                bgcolor: att.tier === "public" ? "#C2FFD2" : att.tier === "staff" ? "#FFF2AA" : "#F3E8FF",
                color: att.tier === "public" ? "#006D3E" : att.tier === "staff" ? "#504700" : "#5B21B6",
                borderRadius: "9999px",
              }}>
                {att.tier === "public" ? "Public" : att.tier === "staff" ? "Staff / Internal" : "Executive"}
              </Box>
            </Stack>
          ))}
        </Stack>
      ) : (
        <Typography sx={{ fontSize: 13, color: "text.disabled", fontStyle: "italic" }}>
          No content added yet.
        </Typography>
      )}
    </Box>
  );
}

export default function ItemDetailView({
  item,
  categories,
  onEdit,
}: {
  item: AgendaItem;
  categories: AgendaCategory[];
  onEdit: () => void;
}) {
  const category = categories.find((c) => c.id === item.categoryId);

  const lastModified = item.lastModifiedAt
    ? `${format(new Date(item.lastModifiedAt), "MMMM d")}${item.lastModifiedBy ? ` by ${item.lastModifiedBy}` : ""}`
    : null;

  return (
    <Stack gap={2.5} sx={{ p: 2.5, height: "100%", overflowY: "auto" }}>
      {/* Header row */}
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={1}>
        <Stack gap={0.5} flex={1} minWidth={0}>
          <Typography sx={{ fontSize: 18, fontWeight: 600, lineHeight: "28px", letterSpacing: "0.2px" }}>
            {item.subject}
          </Typography>
          {category && (
            <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
              {category.name}
            </Typography>
          )}
        </Stack>
        <Stack direction="row" alignItems="center" gap={1} sx={{ flexShrink: 0 }}>
          <Button variant="outlined" size="small" onClick={onEdit}>Edit</Button>
        </Stack>
      </Stack>

      {/* Meta row */}
      <Stack direction="row" gap={2} flexWrap="wrap">
        {item.type.length > 0 && (
          <Stack gap={0.5}>
            <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", color: "text.secondary" }}>
              Type
            </Typography>
            <Typography sx={{ fontSize: 13 }}>{item.type.join(", ")}</Typography>
          </Stack>
        )}
        <Stack gap={0.5}>
          <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", color: "text.secondary" }}>
            Status
          </Typography>
          <Box sx={{
            display: "inline-flex", alignItems: "center", height: 22,
            bgcolor: "#F3F3F3", color: "#515255", borderRadius: "9999px", px: "10px",
          }}>
            <Typography sx={{ fontSize: 12, fontWeight: 600, lineHeight: "16px" }}>Draft</Typography>
          </Box>
        </Stack>
      </Stack>

      <Divider />

      {/* Content tiers */}
      <TierSection
        label="Public Content"
        content={item.publicContent}
        attachments={item.attachments.public}
      />
      <Divider />
      <TierSection
        label="Staff / Internal Content"
        content={item.staffContent}
        attachments={item.attachments.staff}
      />
      <Divider />
      <TierSection
        label="Executive Content"
        content={item.executiveContent}
        attachments={item.attachments.executive}
      />

      {/* Footer */}
      {lastModified && (
        <>
          <Divider />
          <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
            Last modified: {lastModified}
          </Typography>
        </>
      )}
    </Stack>
  );
}
