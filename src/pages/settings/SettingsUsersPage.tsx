import SearchIcon from "@diligentcorp/atlas-react-bundle/icons/Search";
import FilterListIcon from "@diligentcorp/atlas-react-bundle/icons/FilterList";
import SortIcon from "@diligentcorp/atlas-react-bundle/icons/Sort";
import CloseIcon from "@diligentcorp/atlas-react-bundle/icons/Close";
import VisibleIcon from "@diligentcorp/atlas-react-bundle/icons/Visible";
import ExpandDownIcon from "@diligentcorp/atlas-react-bundle/icons/ExpandDown";
import GroupIcon from "@diligentcorp/atlas-react-bundle/icons/Group";
import MoreIcon from "@diligentcorp/atlas-react-bundle/icons/More";
import EditIcon from "@diligentcorp/atlas-react-bundle/icons/Edit";
import {
  Alert,
  Avatar,
  Box,
  Button,
  IconButton,
  InputAdornment,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";

import PageLayout from "../../components/PageLayout.js";
import { useSettingsData } from "../../contexts/SettingsDataContext.js";
import EditUserDialog from "../../components/settings/EditUserDialog.js";
import ManageCommitteesDialog from "../../components/settings/ManageCommitteesDialog.js";
import SettingsBreadcrumbs from "../../components/settings/SettingsBreadcrumbs.js";
import type { AppRole, SettingsUser, SettingsUserFormValues } from "../../types/settings.js";
import { ALL_COMMITTEES_LABEL, isAllCommitteesUser } from "../../utils/committeeMembership.js";
import {
  APP_ROLE_LABELS,
  formatUserDisplayName,
  userBelongsToCommittee,
} from "../../utils/settings.js";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return parts[0].substring(0, 2).toUpperCase();
}

const ALL_ROLES = "All roles";
const ALL_COMMITTEES = "All committees";
const NO_COMMITTEE = "No committee";

export default function SettingsUsersPage() {
  const { tokens, presets } = useTheme();
  const dividerColor =
    tokens?.component?.divider?.colors?.default?.borderColor?.value ?? "#E0E0E0";
  const { getAvatarProps } = presets.AvatarPresets;

  const { users, committeeNames, setUsers, setUserCommittees } = useSettingsData();

  const committeeOptions = [...committeeNames, NO_COMMITTEE];

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>(ALL_ROLES);
  const [committeeFilter, setCommitteeFilter] = useState<string>(ALL_COMMITTEES);
  const [filterRowVisible, setFilterRowVisible] = useState(false);
  const [filterConfigAnchor, setFilterConfigAnchor] = useState<{
    el: HTMLElement;
    type: "role" | "committee";
  } | null>(null);
  const [sortMenuAnchor, setSortMenuAnchor] = useState<null | HTMLElement>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  type SortColumn = "lastModified" | null;
  type SortDirection = "asc" | "desc";
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuItemId, setMenuItemId] = useState<string | null>(null);
  /** `null` = closed, `"new"` = add user, otherwise edit existing user id. */
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [manageCommitteesUserId, setManageCommitteesUserId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const userFormOpen = editUserId !== null;
  const isAddUser = editUserId === "new";

  const manageCommitteesUser =
    manageCommitteesUserId ? users.find((item) => item.id === manageCommitteesUserId) ?? null : null;
  const menuUser = menuItemId ? users.find((item) => item.id === menuItemId) ?? null : null;

  const searchLower = search.toLowerCase();
  const isSearching = searchLower.length > 0;
  const isRoleActive = roleFilter !== ALL_ROLES;
  const isCommitteeActive = committeeFilter !== ALL_COMMITTEES;
  const anyFilterActive = isRoleActive || isCommitteeActive;

  let filteredItems = users.filter((item) => {
    if (isSearching) {
      const haystack = `${item.name} ${item.email} ${item.username} ${APP_ROLE_LABELS[item.appRole]}`.toLowerCase();
      if (!haystack.includes(searchLower)) return false;
    }
    if (isRoleActive && item.appRole !== roleFilter) return false;
    if (isCommitteeActive) {
      if (committeeFilter === NO_COMMITTEE) {
        if (item.committees.length > 0) return false;
      } else if (!userBelongsToCommittee(item, committeeFilter)) {
        return false;
      }
    }
    return true;
  });

  if (sortColumn === "lastModified") {
    filteredItems = [...filteredItems].sort((a, b) => {
      const ta = new Date(a.lastModifiedDate).getTime();
      const tb = new Date(b.lastModifiedDate).getTime();
      if (isNaN(ta) && isNaN(tb)) return 0;
      if (isNaN(ta)) return 1;
      if (isNaN(tb)) return -1;
      const cmp = ta - tb;
      return sortDirection === "asc" ? cmp : -cmp;
    });
  }

  const editUser =
    editUserId && !isAddUser ? users.find((item) => item.id === editUserId) ?? null : null;

  const handleSaveUser = (values: SettingsUserFormValues) => {
    const middleInitial = values.middleInitial?.trim() || undefined;
    const displayName = formatUserDisplayName({
      firstName: values.firstName,
      middleInitial,
      lastName: values.lastName,
    });
    const lastModifiedDate = new Date().toISOString().slice(0, 10);

    if (isAddUser) {
      setUsers((prev) => [
        ...prev,
        {
          id: `u-${Date.now()}`,
          firstName: values.firstName.trim(),
          middleInitial,
          lastName: values.lastName.trim(),
          username: values.username.trim(),
          name: displayName,
          email: values.email.trim(),
          appRole: "boardStaff",
          committees: [],
          status: "Active",
          lastModifiedDate,
        },
      ]);
    } else if (editUserId) {
      setUsers((prev) =>
        prev.map((user) => {
          if (user.id !== editUserId) return user;
          return {
            ...user,
            firstName: values.firstName,
            middleInitial,
            lastName: values.lastName,
            username: values.username,
            email: values.email,
            name: displayName,
            lastModifiedDate,
          };
        }),
      );
    }
    setEditUserId(null);
  };

  const openMenu = (event: React.MouseEvent<HTMLElement>, id: string) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setMenuItemId(id);
  };

  const closeMenu = () => {
    setMenuAnchor(null);
    setMenuItemId(null);
  };

  useEffect(() => {
    if (searchOpen) {
      const timer = setTimeout(() => searchInputRef.current?.focus(), 260);
      return () => clearTimeout(timer);
    }
  }, [searchOpen]);

  const memberRowSx = {
    "&:hover": { backgroundColor: "action.hover" },
  };

  const getCommitteeTooltip = (user: SettingsUser): string | null => {
    if (isAllCommitteesUser(user)) {
      return committeeNames.join(", ");
    }
    if (user.committees.length > 1) {
      const committees = user.committees.filter((name) => name !== ALL_COMMITTEES_LABEL);
      const hiddenCommittees = committees.slice(1);
      return hiddenCommittees.length > 0 ? hiddenCommittees.join(", ") : null;
    }
    return null;
  };

  const renderUserRow = (item: SettingsUser) => {
    const avatarProps = getAvatarProps({ size: "medium", uniqueId: item.id });
    const committeeLabel =
      item.committees.length === 0
        ? "—"
        : item.committees.length === 1
          ? item.committees[0]
          : `${item.committees[0]} +${item.committees.length - 1}`;
    const committeeTooltip = getCommitteeTooltip(item);

    return (
      <TableRow key={item.id} id={`settings-user-row-${item.id}`} sx={memberRowSx}>
        <TableCell>
          <Stack direction="row" alignItems="center" gap={1.5}>
            <Avatar {...avatarProps} sx={[avatarProps?.sx ?? {}, { flexShrink: 0 }]}>
              {getInitials(item.name)}
            </Avatar>
            <Stack gap={0}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: "var(--lens-core-font-weight-medium)",
                  color: "primary.main",
                  "&:hover": { textDecoration: "underline", cursor: "pointer" },
                }}
              >
                {item.name}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "var(--lens-semantic-color-type-muted)",
                  lineHeight: "var(--lens-semantic-font-text-body-line-height)",
                }}
              >
                {item.email}
              </Typography>
            </Stack>
          </Stack>
        </TableCell>
        <TableCell>
          <Typography variant="body2">{APP_ROLE_LABELS[item.appRole]}</Typography>
        </TableCell>
        <TableCell>
          {committeeTooltip ? (
            <Tooltip title={committeeTooltip} arrow placement="top">
              <Typography
                variant="body2"
                noWrap
                component="span"
                sx={{ display: "block", cursor: "default" }}
              >
                {committeeLabel}
              </Typography>
            </Tooltip>
          ) : (
            <Typography variant="body2" noWrap>
              {committeeLabel}
            </Typography>
          )}
        </TableCell>
        <TableCell>
          <Typography variant="body2">{item.lastModifiedDate}</Typography>
        </TableCell>
        <TableCell align="right" sx={{ width: 48 }}>
          <IconButton size="small" onClick={(e) => openMenu(e, item.id)} aria-label={`Actions for ${item.name}`}>
            <MoreIcon style={{ fontSize: "var(--lens-semantic-font-title-h4-md-font-size)" }} />
          </IconButton>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <PageLayout id="page-settings-users">
      <SettingsBreadcrumbs
        sectionId="users"
        sectionLabel="Users"
        pageTitle="User management"
        actions={
          <Button
            variant="contained"
            sx={{ whiteSpace: "nowrap" }}
            onClick={() => setEditUserId("new")}
          >
            Add user
          </Button>
        }
      />

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          borderBottom: `1px solid ${dividerColor}`,
          mt: -1,
          pb: "4px",
        }}
      >
        <Stack direction="row" alignItems="center" gap="8px">
          <IconButton
            size="medium"
            onClick={() => setFilterRowVisible((v) => !v)}
            color="tertiary"
            sx={{
              ...(filterRowVisible && {
                bgcolor: "var(--lens-component-button-tertiary-hover-background)",
                "&:hover": { bgcolor: "var(--lens-component-button-tertiary-hover-background)" },
              }),
              ...(anyFilterActive && { "& svg": { color: "#0040d5" } }),
            }}
            aria-label="Toggle filters"
          >
            <FilterListIcon />
          </IconButton>
          <IconButton
            size="medium"
            onClick={(e) => setSortMenuAnchor(e.currentTarget)}
            color="tertiary"
            aria-label="Sort users"
          >
            <SortIcon />
          </IconButton>
          <Box
            sx={{
              width: searchOpen ? 0 : 40,
              overflow: "hidden",
              opacity: searchOpen ? 0 : 1,
              flexShrink: 0,
              transition: "width 250ms cubic-bezier(0.4, 0, 0.2, 1), opacity 150ms ease",
            }}
          >
            <IconButton
              size="medium"
              onClick={() => setSearchOpen(true)}
              color="tertiary"
              tabIndex={searchOpen ? -1 : 0}
              aria-label="Search users"
            >
              <SearchIcon />
            </IconButton>
          </Box>
          <Box
            sx={{
              width: searchOpen ? 220 : 0,
              overflow: "hidden",
              opacity: searchOpen ? 1 : 0,
              flexShrink: 0,
              transition: "width 250ms cubic-bezier(0.4, 0, 0.2, 1), opacity 200ms ease 50ms",
            }}
          >
            <TextField
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users"
              size="small"
              sx={{
                width: 220,
                "& .MuiOutlinedInput-root": {
                  background: "transparent",
                  boxShadow: "none !important",
                  "& .MuiOutlinedInput-notchedOutline": { border: "none !important" },
                  "&:hover .MuiOutlinedInput-notchedOutline": { border: "none !important" },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    border: "none !important",
                    boxShadow: "none !important",
                  },
                  "&:hover": { boxShadow: "none !important" },
                  "&.Mui-focused": { boxShadow: "none !important" },
                  "& .MuiInputBase-input": { background: "transparent" },
                },
              }}
              inputRef={searchInputRef}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        color="tertiary"
                        onClick={() => {
                          setSearch("");
                          setSearchOpen(false);
                        }}
                        aria-label="Close search"
                      >
                        <CloseIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                  sx: { pointerEvents: searchOpen ? "auto" : "none" },
                },
              }}
            />
          </Box>
          <Menu
            anchorEl={sortMenuAnchor}
            open={Boolean(sortMenuAnchor)}
            onClose={() => setSortMenuAnchor(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <MenuItem
              selected={sortColumn === "lastModified" && sortDirection === "asc"}
              onClick={() => {
                setSortColumn("lastModified");
                setSortDirection("asc");
                setSortMenuAnchor(null);
              }}
            >
              Sort by last modified ascending
            </MenuItem>
            <MenuItem
              selected={sortColumn === "lastModified" && sortDirection === "desc"}
              onClick={() => {
                setSortColumn("lastModified");
                setSortDirection("desc");
                setSortMenuAnchor(null);
              }}
            >
              Sort by last modified descending
            </MenuItem>
          </Menu>
        </Stack>
      </Box>

      <Box sx={{ mt: "-12px" }}>
        {filterRowVisible && (
          <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1, mb: 1, pt: "16px" }}>
            <Box
              data-filter-chip="role"
              onClick={(e) => setFilterConfigAnchor({ el: e.currentTarget, type: "role" })}
              sx={{
                display: "inline-flex",
                alignItems: "center",
                height: 24,
                border: isRoleActive ? "none" : "1px solid #e2e2e5",
                bgcolor: isRoleActive ? "#ecf0ff" : "transparent",
                borderRadius: "9999px",
                pl: "2px",
                pr: "2px",
                overflow: "hidden",
                cursor: "pointer",
                "&:hover": { opacity: 0.85 },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: 24, height: 24, flexShrink: 0 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 24,
                    height: 24,
                    color: isRoleActive ? "#0040d5" : "var(--lens-semantic-color-type-muted)",
                    "& svg": { width: 16, height: 16, display: "block" },
                  }}
                >
                  <VisibleIcon />
                </Box>
              </Box>
              <Typography
                sx={{
                  px: 1,
                  fontSize: "var(--lens-semantic-font-text-md-font-size)",
                  fontWeight: "var(--lens-core-font-weight-regular)",
                  lineHeight: "var(--lens-semantic-font-text-md-line-height)",
                  letterSpacing: "var(--lens-semantic-letter-spacing-sm)",
                  color: isRoleActive ? "#0040d5" : "#242628",
                  whiteSpace: "nowrap",
                }}
              >
                {isRoleActive ? APP_ROLE_LABELS[roleFilter as AppRole] : "Role"}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 20,
                  height: 20,
                  mr: "2px",
                  flexShrink: 0,
                  color: isRoleActive ? "#0040d5" : "var(--lens-semantic-color-type-muted)",
                  borderRadius: "50%",
                  "&:hover": { bgcolor: isRoleActive ? "rgba(0,64,213,0.12)" : "rgba(0,0,0,0.06)" },
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isRoleActive) {
                    setRoleFilter(ALL_ROLES);
                  } else {
                    setFilterConfigAnchor({
                      el: (e.currentTarget.closest("[data-filter-chip]") as HTMLElement) ?? e.currentTarget,
                      type: "role",
                    });
                  }
                }}
              >
                {isRoleActive ? (
                  <CloseIcon style={{ fontSize: "var(--lens-semantic-font-title-h5-sm-font-size)" }} />
                ) : (
                  <ExpandDownIcon style={{ fontSize: "var(--lens-semantic-font-title-h5-sm-font-size)" }} />
                )}
              </Box>
            </Box>
            <Box
              data-filter-chip="committee"
              onClick={(e) => setFilterConfigAnchor({ el: e.currentTarget, type: "committee" })}
              sx={{
                display: "inline-flex",
                alignItems: "center",
                height: 24,
                border: isCommitteeActive ? "none" : "1px solid #e2e2e5",
                bgcolor: isCommitteeActive ? "#ecf0ff" : "transparent",
                borderRadius: "9999px",
                pl: "2px",
                pr: "2px",
                overflow: "hidden",
                cursor: "pointer",
                "&:hover": { opacity: 0.85 },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: 24, height: 24, flexShrink: 0 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 24,
                    height: 24,
                    color: isCommitteeActive ? "#0040d5" : "var(--lens-semantic-color-type-muted)",
                    "& svg": { width: 16, height: 16, display: "block" },
                  }}
                >
                  <GroupIcon />
                </Box>
              </Box>
              <Typography
                sx={{
                  px: 1,
                  fontSize: "var(--lens-semantic-font-text-md-font-size)",
                  fontWeight: "var(--lens-core-font-weight-regular)",
                  lineHeight: "var(--lens-semantic-font-text-md-line-height)",
                  letterSpacing: "var(--lens-semantic-letter-spacing-sm)",
                  color: isCommitteeActive ? "#0040d5" : "#242628",
                  whiteSpace: "nowrap",
                }}
              >
                {isCommitteeActive ? committeeFilter : "Committee"}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 20,
                  height: 20,
                  mr: "2px",
                  flexShrink: 0,
                  color: isCommitteeActive ? "#0040d5" : "var(--lens-semantic-color-type-muted)",
                  borderRadius: "50%",
                  "&:hover": { bgcolor: isCommitteeActive ? "rgba(0,64,213,0.12)" : "rgba(0,0,0,0.06)" },
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isCommitteeActive) {
                    setCommitteeFilter(ALL_COMMITTEES);
                  } else {
                    setFilterConfigAnchor({
                      el: (e.currentTarget.closest("[data-filter-chip]") as HTMLElement) ?? e.currentTarget,
                      type: "committee",
                    });
                  }
                }}
              >
                {isCommitteeActive ? (
                  <CloseIcon style={{ fontSize: "var(--lens-semantic-font-title-h5-sm-font-size)" }} />
                ) : (
                  <ExpandDownIcon style={{ fontSize: "var(--lens-semantic-font-title-h5-sm-font-size)" }} />
                )}
              </Box>
            </Box>
            <Button
              variant="text"
              size="small"
              onClick={() => {
                setRoleFilter(ALL_ROLES);
                setCommitteeFilter(ALL_COMMITTEES);
              }}
              sx={{ visibility: anyFilterActive ? "visible" : "hidden" }}
            >
              Clear filters
            </Button>
          </Box>
        )}

        <Box
          id="settings-users-list"
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
                <TableCell sx={{ width: "34%" }}>Name</TableCell>
                <TableCell sx={{ width: "20%" }}>Role</TableCell>
                <TableCell sx={{ width: "24%" }}>Committees</TableCell>
                <TableCell sx={{ width: "16%" }}>Last modified</TableCell>
                <TableCell sx={{ width: "6%" }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <Typography variant="body2" sx={{ color: "var(--lens-semantic-color-type-muted)" }}>
                      No users found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map(renderUserRow)
              )}
            </TableBody>
          </Table>
        </Box>
      </Box>

      <Menu
        anchorEl={filterConfigAnchor?.el}
        open={Boolean(filterConfigAnchor)}
        onClose={() => setFilterConfigAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{ paper: { sx: { minWidth: 220 } } }}
      >
        {filterConfigAnchor?.type === "role" &&
          (Object.keys(APP_ROLE_LABELS) as AppRole[]).map((role) => (
            <MenuItem
              key={role}
              selected={roleFilter === role}
              onClick={() => {
                setRoleFilter(role);
                setFilterConfigAnchor(null);
              }}
            >
              {APP_ROLE_LABELS[role]}
            </MenuItem>
          ))}
        {filterConfigAnchor?.type === "committee" &&
          committeeOptions.map((committee) => (
            <MenuItem
              key={committee}
              selected={committeeFilter === committee}
              onClick={() => {
                setCommitteeFilter(committee);
                setFilterConfigAnchor(null);
              }}
            >
              {committee}
            </MenuItem>
          ))}
      </Menu>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={closeMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{ paper: { sx: { minWidth: 180, borderRadius: "12px" } } }}
      >
        <MenuItem
          onClick={() => {
            setEditUserId(menuItemId);
            closeMenu();
          }}
        >
          <ListItemIcon>
            <EditIcon style={{ fontSize: "var(--lens-semantic-font-title-h3-lg-font-size)" }} />
          </ListItemIcon>
          <ListItemText>Edit user</ListItemText>
        </MenuItem>
        <MenuItem
          disabled={!menuUser || isAllCommitteesUser(menuUser)}
          onClick={() => {
            if (menuItemId) setManageCommitteesUserId(menuItemId);
            closeMenu();
          }}
        >
          <ListItemIcon>
            <GroupIcon style={{ fontSize: "var(--lens-semantic-font-title-h3-lg-font-size)" }} />
          </ListItemIcon>
          <ListItemText>Manage committees</ListItemText>
        </MenuItem>
      </Menu>

      <EditUserDialog
        open={userFormOpen}
        user={isAddUser ? null : editUser}
        onClose={() => setEditUserId(null)}
        onSave={handleSaveUser}
      />

      <ManageCommitteesDialog
        open={manageCommitteesUserId !== null}
        user={manageCommitteesUser}
        committeeNames={committeeNames}
        onClose={() => setManageCommitteesUserId(null)}
        onSave={(names) => {
          if (!manageCommitteesUserId) return;
          setUserCommittees(manageCommitteesUserId, names);
          setToastMessage("Committee memberships updated.");
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
