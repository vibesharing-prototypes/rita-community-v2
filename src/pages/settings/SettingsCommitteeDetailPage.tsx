import GroupIcon from "@diligentcorp/atlas-react-bundle/icons/Group";
import MoreIcon from "@diligentcorp/atlas-react-bundle/icons/More";
import TrashIcon from "@diligentcorp/atlas-react-bundle/icons/Trash";
import {
  Alert,
  Box,
  Button,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Snackbar,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  Typography,
  useTheme,
} from "@mui/material";
import { useEffect, useMemo, useState, type SyntheticEvent } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";

import PageLayout from "../../components/PageLayout.js";
import { useSettingsData } from "../../contexts/SettingsDataContext.js";
import AddCommitteeMembersDialog from "../../components/settings/AddCommitteeMembersDialog.js";
import CommitteeAgendaSection from "../../components/settings/committee/CommitteeAgendaSection.js";
import CommitteeMeetingControlSection from "../../components/settings/committee/CommitteeMeetingControlSection.js";
import CommitteeWorkflowSection from "../../components/settings/committee/CommitteeWorkflowSection.js";
import CommitteeEmailNotificationsSection from "../../components/settings/committee/CommitteeEmailNotificationsSection.js";
import CommitteeSetupSection from "../../components/settings/committee/CommitteeSetupSection.js";
import CommitteeUserAccessSection from "../../components/settings/committee/CommitteeUserAccessSection.js";
import SettingsBreadcrumbs from "../../components/settings/SettingsBreadcrumbs.js";
import type { CommitteeSettingsTab, SettingsCommittee } from "../../types/settings.js";
import { normalizeCommittee, syncWorkflowToCommitteeFlags } from "../../utils/committeeSettings.js";
import { isAllCommitteesUser } from "../../utils/committeeMembership.js";
import { APP_ROLE_LABELS, userBelongsToCommittee } from "../../utils/settings.js";

const COMMITTEE_SETTINGS_TABS: CommitteeSettingsTab[] = [
  "setup",
  "userAccess",
  "email",
  "agenda",
  "workflow",
  "members",
  "meetingControl",
];

const TAB_LABELS: Record<CommitteeSettingsTab, string> = {
  setup: "Setup",
  userAccess: "User access",
  email: "Email",
  agenda: "Agenda",
  workflow: "Workflow",
  members: "Members",
  meetingControl: "Meeting control",
};

function isCommitteeSettingsTab(value: string | null): value is CommitteeSettingsTab {
  return value !== null && COMMITTEE_SETTINGS_TABS.includes(value as CommitteeSettingsTab);
}

export default function SettingsCommitteeDetailPage() {
  const { presets, tokens } = useTheme();
  const dividerColor =
    tokens?.component?.divider?.colors?.default?.borderColor?.value ?? "#E0E0E0";
  const { committeeId } = useParams<{ committeeId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab: CommitteeSettingsTab = isCommitteeSettingsTab(tabParam) ? tabParam : "setup";

  const {
    users,
    getCommitteeById,
    patchCommittee,
    addMembersToCommittee,
    removeMemberFromCommittee,
  } = useSettingsData();

  const committeeFromStore = committeeId ? getCommitteeById(committeeId) : undefined;
  const [committee, setCommittee] = useState<SettingsCommittee | null>(null);
  const [addMembersOpen, setAddMembersOpen] = useState(false);
  const [memberMenuAnchor, setMemberMenuAnchor] = useState<null | HTMLElement>(null);
  const [memberMenuUserId, setMemberMenuUserId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setCommittee(committeeFromStore ? normalizeCommittee({ ...committeeFromStore }) : null);
  }, [committeeFromStore]);

  const assignedUsers = useMemo(() => {
    if (!committee) return [];
    return users.filter((user) => userBelongsToCommittee(user, committee.name));
  }, [committee, users]);

  const patchLocalAndStore = (patch: Partial<SettingsCommittee>) => {
    if (!committee) return;
    const workflowPatch = patch.workflow
      ? syncWorkflowToCommitteeFlags(patch.workflow)
      : {};
    const next = { ...committee, ...patch, ...workflowPatch };
    setCommittee(next);
    patchCommittee(committee.id, { ...patch, ...workflowPatch });
  };

  const handleTabChange = (_: SyntheticEvent, value: CommitteeSettingsTab) => {
    navigate(`/settings/committees/${committeeId}?tab=${value}`, { replace: true });
  };

  const openMemberMenu = (event: React.MouseEvent<HTMLElement>, userId: string) => {
    event.stopPropagation();
    setMemberMenuAnchor(event.currentTarget);
    setMemberMenuUserId(userId);
  };

  const closeMemberMenu = () => {
    setMemberMenuAnchor(null);
    setMemberMenuUserId(null);
  };

  const handleRemoveMember = () => {
    if (!committee || !memberMenuUserId) return;
    const user = users.find((item) => item.id === memberMenuUserId);
    removeMemberFromCommittee(committee.name, memberMenuUserId);
    setToastMessage(user ? `Removed ${user.name} from ${committee.name}.` : "Member removed.");
    closeMemberMenu();
  };

  if (!committee) {
    return (
      <PageLayout id="page-settings-committee-detail">
        <Typography variant="h6">Committee not found</Typography>
      </PageLayout>
    );
  }

  return (
    <PageLayout id="page-settings-committee-detail">
      <SettingsBreadcrumbs
        sectionId="committees"
        sectionLabel="Committees"
        currentLabel={committee.name}
        pageTitle={committee.name}
      />

      <Box
        sx={{
          display: "flex",
          alignItems: "flex-end",
          borderBottom: `1px solid ${dividerColor}`,
          mt: -1,
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            flex: 1,
            "& .MuiTab-root:not(.Mui-selected)::after": { display: "none" },
            ...presets?.TabsPresets?.Tabs?.alignToPageHeader?.sx,
          }}
        >
          {COMMITTEE_SETTINGS_TABS.map((tab) => (
            <Tab key={tab} label={TAB_LABELS[tab]} value={tab} />
          ))}
        </Tabs>
      </Box>

      <Box sx={{ pt: 3 }}>
        {activeTab === "setup" && (
          <CommitteeSetupSection
            committee={committee}
            dividerColor={dividerColor}
            onChange={patchLocalAndStore}
          />
        )}

        {activeTab === "userAccess" && (
          <CommitteeUserAccessSection
            committee={committee}
            allUsers={users}
            dividerColor={dividerColor}
            onChange={(userAccess) => patchLocalAndStore({ userAccess })}
          />
        )}

        {activeTab === "email" && (
          <CommitteeEmailNotificationsSection
            committee={committee}
            dividerColor={dividerColor}
            onChange={(emailNotifications) => patchLocalAndStore({ emailNotifications })}
          />
        )}

        {activeTab === "agenda" && (
          <CommitteeAgendaSection
            committee={committee}
            dividerColor={dividerColor}
            onChange={patchLocalAndStore}
          />
        )}

        {activeTab === "workflow" && (
          <CommitteeWorkflowSection
            committee={committee}
            dividerColor={dividerColor}
            onChange={patchLocalAndStore}
          />
        )}

        {activeTab === "members" && (
          <Stack gap={2}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
              <Typography variant="body1" sx={{ color: "var(--lens-semantic-color-type-muted)" }}>
                <GroupIcon
                  style={{
                    fontSize: 18,
                    verticalAlign: "text-bottom",
                    marginRight: 6,
                    color: "var(--lens-semantic-color-type-muted)",
                  }}
                />
                {committee.memberCount} members · manage assignments here or from User management
              </Typography>
              <Button variant="contained" onClick={() => setAddMembersOpen(true)}>
                Add members
              </Button>
            </Stack>
            <Box
              sx={{
                border: `1px solid ${dividerColor}`,
                borderRadius: "12px",
                overflow: "hidden",
              }}
            >
              <Table
                sx={{
                  width: "100%",
                  tableLayout: "fixed",
                  "& .MuiTableBody-root .MuiTableRow-root:last-child .MuiTableCell-root": {
                    borderBottom: 0,
                  },
                }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: "40%" }}>Name</TableCell>
                    <TableCell sx={{ width: "28%" }}>Role</TableCell>
                    <TableCell sx={{ width: "22%" }}>Last modified</TableCell>
                    <TableCell sx={{ width: "10%" }} />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {assignedUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                        <Typography
                          variant="body1"
                          sx={{ color: "var(--lens-semantic-color-type-muted)" }}
                        >
                          No users assigned to this committee
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    assignedUsers.map((user) => (
                      <TableRow
                        key={user.id}
                        sx={{ "&:hover": { backgroundColor: "action.hover" } }}
                      >
                        <TableCell>
                          <Stack gap={0.25}>
                            <Typography
                              variant="body1"
                              sx={{ fontWeight: "var(--lens-core-font-weight-medium)" }}
                            >
                              {user.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: "var(--lens-semantic-color-type-muted)" }}
                            >
                              {user.email}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body1">
                            {APP_ROLE_LABELS[user.appRole]}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body1">{user.lastModifiedDate}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            aria-label={`Actions for ${user.name}`}
                            disabled={isAllCommitteesUser(user)}
                            onClick={(e) => openMemberMenu(e, user.id)}
                          >
                            <MoreIcon
                              style={{ fontSize: "var(--lens-semantic-font-title-h4-md-font-size)" }}
                            />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Box>
          </Stack>
        )}

        {activeTab === "meetingControl" && (
          <CommitteeMeetingControlSection
            committee={committee}
            dividerColor={dividerColor}
            onChange={patchLocalAndStore}
          />
        )}
      </Box>

      <Menu
        anchorEl={memberMenuAnchor}
        open={Boolean(memberMenuAnchor)}
        onClose={closeMemberMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem onClick={handleRemoveMember}>
          <ListItemIcon>
            <TrashIcon style={{ fontSize: "var(--lens-semantic-font-title-h3-lg-font-size)" }} />
          </ListItemIcon>
          <ListItemText>Remove from committee</ListItemText>
        </MenuItem>
      </Menu>

      <AddCommitteeMembersDialog
        open={addMembersOpen}
        committeeName={committee.name}
        users={users}
        onClose={() => setAddMembersOpen(false)}
        onAdd={(userIds) => {
          addMembersToCommittee(committee.name, userIds);
          setToastMessage(
            userIds.length === 1
              ? "Member added to committee."
              : `${userIds.length} members added to committee.`,
          );
        }}
      />

      <Snackbar
        open={Boolean(toastMessage)}
        autoHideDuration={4000}
        onClose={() => setToastMessage(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" onClose={() => setToastMessage(null)} sx={{ width: "100%" }}>
          {toastMessage}
        </Alert>
      </Snackbar>
    </PageLayout>
  );
}
