import { OverflowBreadcrumbs, PageHeader } from "@diligentcorp/atlas-react-bundle";
import { Box, Link, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { useNavigate } from "react-router";

type SettingsBreadcrumbsProps = {
  sectionId: string;
  sectionLabel: string;
  pageTitle: string;
  /** When set, renders a fourth crumb (e.g. committee name on detail pages). */
  currentLabel?: string;
  actions?: ReactNode;
};

const disabledSx = {
  fontSize: "var(--lens-semantic-font-text-body-font-size)",
  fontWeight: "var(--lens-core-font-weight-semi-bold)",
  lineHeight: "var(--lens-semantic-font-text-body-line-height)",
  letterSpacing: "var(--lens-semantic-letter-spacing-xs)",
  color: "#6f7377",
  pl: "4px",
  pr: "12px",
  py: "4px",
};

export default function SettingsBreadcrumbs({
  sectionId,
  sectionLabel,
  pageTitle,
  currentLabel,
  actions,
}: SettingsBreadcrumbsProps) {
  const navigate = useNavigate();

  const breadcrumbItems = currentLabel
    ? [
        { id: "product", label: "Community" },
        { id: "settings", label: "Settings" },
        { id: sectionId, label: sectionLabel },
        { id: "current", label: currentLabel, isCurrent: true },
      ]
    : [
        { id: "product", label: "Community" },
        { id: "settings", label: "Settings" },
        { id: sectionId, label: sectionLabel, isCurrent: true },
      ];

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "1fr auto",
        alignItems: "center",
        pb: "12px",
      }}
    >
      <PageHeader
        breadcrumbs={
          <OverflowBreadcrumbs items={breadcrumbItems}>
            {(item) => {
              if (item.id === "product" || item.isCurrent) {
                return (
                  <Typography key={item.id} sx={disabledSx}>
                    {item.label}
                  </Typography>
                );
              }
              if (item.id === "settings") {
                return (
                  <Link
                    key={item.id}
                    underline="hover"
                    variant="body1"
                    sx={{ cursor: "pointer" }}
                    onClick={() => navigate("/settings")}
                  >
                    {item.label}
                  </Link>
                );
              }
              return (
                <Link
                  key={item.id}
                  underline="hover"
                  variant="body1"
                  sx={{ cursor: "pointer" }}
                  onClick={() => navigate(`/settings/${sectionId}`)}
                >
                  {item.label}
                </Link>
              );
            }}
          </OverflowBreadcrumbs>
        }
        pageTitle={pageTitle}
      />
      {actions}
    </Box>
  );
}
