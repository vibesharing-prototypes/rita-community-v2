import SearchIcon from "@diligentcorp/atlas-react-bundle/icons/Search";
import CloseIcon from "@diligentcorp/atlas-react-bundle/icons/Close";
import GroupIcon from "@diligentcorp/atlas-react-bundle/icons/Group";
import CalendarIcon from "@diligentcorp/atlas-react-bundle/icons/Calendar";
import MoreIcon from "@diligentcorp/atlas-react-bundle/icons/More";
import EditIcon from "@diligentcorp/atlas-react-bundle/icons/Edit";
import {
  Alert,
  Box,
  Button,
  IconButton,
  InputAdornment,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";

import PageLayout from "../../components/PageLayout.js";
import SettingsBreadcrumbs from "../../components/settings/SettingsBreadcrumbs.js";
import SettingsListRow from "../../components/settings/SettingsListRow.js";
import SettingsRowColumn from "../../components/settings/SettingsRowColumn.js";
import { settingsRowBadgeSx } from "../../components/settings/settingsListRowStyles.js";
import { useSettingsData } from "../../contexts/SettingsDataContext.js";
import type { SettingsCommittee } from "../../types/settings.js";
import { formatMeetingReleaseDays } from "../../utils/settings.js";

function committeeFlagsSummary(committee: SettingsCommittee): string {
  const flags: string[] = [];
  if (committee.allowAdminViewDraftItems) flags.push("Admin drafts");
  if (committee.allowExecViewDraft) flags.push("Executive drafts");
  if (committee.allowAdminSubmitItems) flags.push("Admin agenda items");
  if (flags.length === 0) return "Default flags";
  if (flags.length === 1) return flags[0];
  return `${flags[0]} +${flags.length - 1}`;
}

export default function SettingsCommitteesPage() {
  const navigate = useNavigate();
  const { tokens } = useTheme();
  const dividerColor =
    tokens?.component?.divider?.colors?.default?.borderColor?.value ?? "#E0E0E0";

  const { committees: rawItems } = useSettingsData();

  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  const searchLower = search.toLowerCase();
  const filteredItems = rawItems.filter((item) =>
    searchLower.length === 0 ? true : item.name.toLowerCase().includes(searchLower),
  );

  const openMenu = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
  };

  const closeMenu = () => {
    setMenuAnchor(null);
  };

  return (
    <PageLayout id="page-settings-committees">
      <SettingsBreadcrumbs
        sectionId="committees"
        sectionLabel="Committees"
        pageTitle="Committee management"
        actions={
          <Button variant="contained" sx={{ whiteSpace: "nowrap" }}>
            Add committee
          </Button>
        }
      />

      <Typography
        variant="body1"
        sx={{ color: "var(--lens-semantic-color-type-muted)", mt: -2 }}
      >
        Per-committee flags control draft visibility and when public users can see meetings.
      </Typography>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          borderBottom: `1px solid ${dividerColor}`,
          pb: "4px",
        }}
      >
        <Box
          sx={{
            width: searchOpen ? 240 : 40,
            overflow: "hidden",
            flexShrink: 0,
            transition: "width 250ms cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {!searchOpen ? (
            <IconButton
              size="medium"
              onClick={() => setSearchOpen(true)}
              color="tertiary"
              aria-label="Search committees"
            >
              <SearchIcon />
            </IconButton>
          ) : (
            <TextField
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search committees"
              size="small"
              sx={{
                width: 240,
                "& .MuiOutlinedInput-root": {
                  background: "transparent",
                  boxShadow: "none !important",
                  "& .MuiOutlinedInput-notchedOutline": { border: "none !important" },
                  "&:hover .MuiOutlinedInput-notchedOutline": { border: "none !important" },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    border: "none !important",
                    boxShadow: "none !important",
                  },
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
                },
              }}
            />
          )}
        </Box>
      </Box>

      <Box id="settings-committees-content" sx={{ display: "flex", alignItems: "flex-start", mt: "-12px" }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {filteredItems.length === 0 ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              No committees found
            </Alert>
          ) : (
            <Stack id="settings-committees-list" gap="12px" sx={{ mt: 1.5 }}>
              {filteredItems.map((item) => (
                <SettingsListRow
                  key={item.id}
                  id={`settings-committee-row-${item.id}`}
                  onClick={() => navigate(`/settings/committees/${item.id}`)}
                >
                  <Stack direction="row" alignItems="center" gap="12px" sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={settingsRowBadgeSx}>
                      <GroupIcon style={{ fontSize: 24 }} />
                    </Box>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        minWidth: 0,
                        whiteSpace: "normal",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        color: "primary.main",
                        fontWeight: "var(--lens-core-font-weight-medium)",
                      }}
                    >
                      {item.name}
                    </Typography>
                  </Stack>
                  <SettingsRowColumn width={120} hideBelow={699} icon={<GroupIcon />}>
                    {`${item.memberCount} members`}
                  </SettingsRowColumn>
                  <SettingsRowColumn width={200} hideBelow={959} icon={<CalendarIcon />}>
                    {formatMeetingReleaseDays(item.meetingReleaseDays)}
                  </SettingsRowColumn>
                  <SettingsRowColumn width={200} hideBelow={699}>
                    {committeeFlagsSummary(item)}
                  </SettingsRowColumn>
                  <SettingsRowColumn width={120} hideBelow={959}>
                    {item.lastModifiedDate}
                  </SettingsRowColumn>
                  <Box sx={{ ml: "auto", flexShrink: 0 }}>
                    <IconButton
                      size="medium"
                      onClick={openMenu}
                      aria-label={`Actions for ${item.name}`}
                    >
                      <MoreIcon />
                    </IconButton>
                  </Box>
                </SettingsListRow>
              ))}
            </Stack>
          )}
        </Box>
      </Box>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={closeMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{ paper: { sx: { minWidth: 180, borderRadius: "12px" } } }}
      >
        <MenuItem onClick={closeMenu}>
          <ListItemIcon>
            <EditIcon style={{ fontSize: "var(--lens-semantic-font-title-h3-lg-font-size)" }} />
          </ListItemIcon>
          <ListItemText>Edit committee</ListItemText>
        </MenuItem>
      </Menu>
    </PageLayout>
  );
}
