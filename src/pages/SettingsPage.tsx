import { PageHeader } from "@diligentcorp/atlas-react-bundle";
import GroupIcon from "@diligentcorp/atlas-react-bundle/icons/Group";
import ListIcon from "@diligentcorp/atlas-react-bundle/icons/List";
import ExpandRightIcon from "@diligentcorp/atlas-react-bundle/icons/ExpandRight";
import { Box, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router";

import PageLayout from "../components/PageLayout.js";
import SettingsListRow from "../components/settings/SettingsListRow.js";
import { settingsRowBadgeSx, settingsRowMutedTextSx } from "../components/settings/settingsListRowStyles.js";

const SECTIONS = [
  {
    id: "users",
    title: "User management",
    description:
      "Manage accounts, Community roles, and committee assignments. SuperPublisher scope.",
    path: "/settings/users",
    icon: ListIcon,
  },
  {
    id: "committees",
    title: "Committee management",
    description:
      "Create committees and configure per-committee visibility flags and public meeting release.",
    path: "/settings/committees",
    icon: GroupIcon,
  },
] as const;

export default function SettingsPage() {
  const navigate = useNavigate();

  return (
    <PageLayout id="page-settings">
      <PageHeader pageTitle="Settings" />
      <Box id="settings-content" sx={{ display: "flex", alignItems: "flex-start", mt: -2 }}>
        <Stack gap={1.5} sx={{ flex: 1, minWidth: 0, width: "100%" }}>
          <Typography variant="body1" sx={{ color: "var(--lens-semantic-color-type-muted)" }}>
            Organization-wide configuration and access control for administrators.
          </Typography>

          <Stack id="settings-sections-list" gap="12px" sx={{ mt: 0.5 }}>
            {SECTIONS.map((section) => {
              const Icon = section.icon;
              return (
                <SettingsListRow
                  key={section.id}
                  id={`settings-section-${section.id}`}
                  onClick={() => navigate(section.path)}
                >
                  <Stack direction="row" alignItems="center" gap="12px" sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={settingsRowBadgeSx}>
                      <Icon style={{ fontSize: 24 }} />
                    </Box>
                    <Stack gap={0.25} sx={{ minWidth: 0 }}>
                      <Typography variant="subtitle2">{section.title}</Typography>
                      <Typography
                        sx={{
                          ...settingsRowMutedTextSx,
                          whiteSpace: "normal",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {section.description}
                      </Typography>
                    </Stack>
                  </Stack>
                  <ExpandRightIcon
                    style={{
                      fontSize: 20,
                      color: "var(--lens-semantic-color-type-muted)",
                      flexShrink: 0,
                    }}
                  />
                </SettingsListRow>
              );
            })}
          </Stack>
        </Stack>
      </Box>
    </PageLayout>
  );
}
