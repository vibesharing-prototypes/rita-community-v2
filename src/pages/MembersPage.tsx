import { PageHeader } from "@diligentcorp/atlas-react-bundle";
import SearchIcon from "@diligentcorp/atlas-react-bundle/icons/Search";
import FilterListIcon from "@diligentcorp/atlas-react-bundle/icons/FilterList";
import SortIcon from "@diligentcorp/atlas-react-bundle/icons/Sort";
import CloseIcon from "@diligentcorp/atlas-react-bundle/icons/Close";
import VisibleIcon from "@diligentcorp/atlas-react-bundle/icons/Visible";
import ExpandDownIcon from "@diligentcorp/atlas-react-bundle/icons/ExpandDown";
import MoreIcon from "@diligentcorp/atlas-react-bundle/icons/More";
import EditIcon from "@diligentcorp/atlas-react-bundle/icons/Edit";
import TrashIcon from "@diligentcorp/atlas-react-bundle/icons/Trash";
import LockedIcon from "@diligentcorp/atlas-react-bundle/icons/Locked";
import UnlockedIcon from "@diligentcorp/atlas-react-bundle/icons/Unlocked";
import {
  Avatar,
  Box,
  Button,
  Divider,
  IconButton,
  InputAdornment,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";

import PageLayout from "../components/PageLayout.js";
import StatusChip from "../components/meetings/StatusChip";
import ConfirmDialog from "../components/meetings/ConfirmDialog";
import membersData from "../data/members.json";

// ── Types ────────────────────────────────────────────────────────────────────

interface MemberItem {
  id: string;
  name: string;
  role: string;
  email: string;
  access: string;
  lastModifiedDate: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return parts[0].substring(0, 2).toUpperCase();
}

// ── Component ────────────────────────────────────────────────────────────────

export default function MembersPage() {
  const { tokens, presets } = useTheme();
  const dividerColor =
    tokens?.component?.divider?.colors?.default?.borderColor?.value ?? "#E0E0E0";
  const { getAvatarProps } = presets.AvatarPresets;

  const rawItems = membersData.items as MemberItem[];

  // ── State ──────────────────────────────────────────────────────────────────

  const [search, setSearch] = useState("");

  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuItemId, setMenuItemId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [publishTargetId, setPublishTargetId] = useState<string | null>(null);
  const [accessOverrides, setAccessOverrides] = useState<Record<string, string>>({});

  const [accessFilter, setAccessFilter] = useState<string>("All");

  type SortColumn = "lastModified" | null;
  type SortDirection = "asc" | "desc";
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [filterRowVisible, setFilterRowVisible] = useState(false);
  const [filterConfigAnchor, setFilterConfigAnchor] = useState<null | HTMLElement>(null);
  const [sortMenuAnchor, setSortMenuAnchor] = useState<null | HTMLElement>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // ── Derived data ───────────────────────────────────────────────────────────

  const searchLower = search.toLowerCase();
  const isSearching = searchLower.length > 0;
  const isAccessActive = accessFilter !== "All";

  let filteredItems = rawItems.filter((item) => {
    if (isSearching && !item.name.toLowerCase().includes(searchLower) && !item.role.toLowerCase().includes(searchLower)) return false;
    if (isAccessActive && item.access !== accessFilter) return false;
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

  // ── Handlers ───────────────────────────────────────────────────────────────

  const openMenu = (event: React.MouseEvent<HTMLElement>, id: string) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setMenuItemId(id);
  };

  const closeMenu = () => {
    setMenuAnchor(null);
    setMenuItemId(null);
  };

  const getAccess = (id: string) => accessOverrides[id] ?? rawItems.find((i) => i.id === id)?.access ?? "Internal";
  const menuItemAccess = menuItemId ? getAccess(menuItemId) : null;
  const isMenuItemPublic = menuItemAccess === "Public";
  const publishTargetAccess = publishTargetId ? getAccess(publishTargetId) : null;
  const isPublishTargetPublic = publishTargetAccess === "Public";

  const anyFilterActive = isAccessActive;

  useEffect(() => {
    if (searchOpen) {
      const timer = setTimeout(() => searchInputRef.current?.focus(), 260);
      return () => clearTimeout(timer);
    }
  }, [searchOpen]);

  // ── Row renderer ───────────────────────────────────────────────────────────

  const memberRowSx = {
    "&:hover": { backgroundColor: "action.hover" },
  };

  const renderMemberRow = (item: MemberItem) => {
    const avatarProps = getAvatarProps({ size: "medium", uniqueId: item.id });
    return (
    <TableRow key={item.id} sx={memberRowSx}>
      <TableCell>
        <Stack direction="row" alignItems="center" gap={1.5}>
          <Avatar
            {...avatarProps}
            sx={[avatarProps?.sx ?? {}, { flexShrink: 0 }]}
          >
            {getInitials(item.name)}
          </Avatar>
          <Stack gap={0}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 'var(--lens-core-font-weight-medium)',
                color: "primary.main",
                "&:hover": { textDecoration: "underline", cursor: "pointer" },
              }}
            >
              {item.name}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "var(--lens-semantic-color-type-muted)", lineHeight: 'var(--lens-semantic-font-text-body-line-height)' }}
            >
              {item.email}
            </Typography>
          </Stack>
        </Stack>
      </TableCell>
      <TableCell>
        <Typography variant="body2">{item.role}</Typography>
      </TableCell>
      <TableCell>
        <StatusChip label={accessOverrides[item.id] ?? item.access} />
      </TableCell>
      <TableCell>
        <Typography variant="body2">{item.lastModifiedDate}</Typography>
      </TableCell>
      <TableCell align="right" sx={{ width: 48 }}>
        <IconButton size="small" onClick={(e) => openMenu(e, item.id)}>
          <MoreIcon style={{ fontSize: 'var(--lens-semantic-font-title-h4-md-font-size)' }} />
        </IconButton>
      </TableCell>
    </TableRow>
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <PageLayout id="page-members">
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center" }}>
        <PageHeader pageTitle="Board members" />
      </Box>

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
          >
            <FilterListIcon />
          </IconButton>
          <IconButton size="medium" onClick={(e) => setSortMenuAnchor(e.currentTarget)} color="tertiary">
            <SortIcon />
          </IconButton>
          <Box sx={{ width: searchOpen ? 0 : 40, overflow: "hidden", opacity: searchOpen ? 0 : 1, flexShrink: 0, transition: "width 250ms cubic-bezier(0.4, 0, 0.2, 1), opacity 150ms ease" }}>
            <IconButton size="medium" onClick={() => setSearchOpen(true)} color="tertiary" tabIndex={searchOpen ? -1 : 0}>
              <SearchIcon />
            </IconButton>
          </Box>
          <Box sx={{ width: searchOpen ? 220 : 0, overflow: "hidden", opacity: searchOpen ? 1 : 0, flexShrink: 0, transition: "width 250ms cubic-bezier(0.4, 0, 0.2, 1), opacity 200ms ease 50ms" }}>
            <TextField
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search members"
              size="small"
              sx={{
                width: 220,
                "& .MuiOutlinedInput-root": {
                  background: "transparent", boxShadow: "none !important",
                  "& .MuiOutlinedInput-notchedOutline": { border: "none !important" },
                  "&:hover .MuiOutlinedInput-notchedOutline": { border: "none !important" },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { border: "none !important", boxShadow: "none !important" },
                  "&:hover": { boxShadow: "none !important" },
                  "&.Mui-focused": { boxShadow: "none !important" },
                  "& .MuiInputBase-input": { background: "transparent" },
                },
              }}
              inputRef={searchInputRef}
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" color="tertiary" onClick={() => { setSearch(""); setSearchOpen(false); }}>
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
            <MenuItem selected={sortColumn === "lastModified" && sortDirection === "asc"} onClick={() => { setSortColumn("lastModified"); setSortDirection("asc"); setSortMenuAnchor(null); }}>
              Sort by last modified ascending
            </MenuItem>
            <MenuItem selected={sortColumn === "lastModified" && sortDirection === "desc"} onClick={() => { setSortColumn("lastModified"); setSortDirection("desc"); setSortMenuAnchor(null); }}>
              Sort by last modified descending
            </MenuItem>
          </Menu>
        </Stack>
      </Box>

      <Box sx={{ mt: "-12px" }}>
        {filterRowVisible && (
          <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1, mb: 1, pt: "16px" }}>
            <Box
              data-filter-chip="access"
              onClick={(e) => setFilterConfigAnchor(e.currentTarget)}
              sx={{ display: "inline-flex", alignItems: "center", height: 24, border: isAccessActive ? "none" : "1px solid #e2e2e5", bgcolor: isAccessActive ? "#ecf0ff" : "transparent", borderRadius: "9999px", pl: "2px", pr: "2px", overflow: "hidden", cursor: "pointer", "&:hover": { opacity: 0.85 } }}
            >
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: 24, height: 24, flexShrink: 0 }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: 24, height: 24, color: isAccessActive ? "#0040d5" : "var(--lens-semantic-color-type-muted)", "& svg": { width: 16, height: 16, display: "block" } }}>
                  <VisibleIcon />
                </Box>
              </Box>
              <Typography sx={{ px: 1, fontSize: 'var(--lens-semantic-font-text-md-font-size)', fontWeight: 'var(--lens-core-font-weight-regular)', lineHeight: 'var(--lens-semantic-font-text-md-line-height)', letterSpacing: 'var(--lens-semantic-letter-spacing-sm)', color: isAccessActive ? "#0040d5" : "#242628", whiteSpace: "nowrap" }}>
                {isAccessActive ? accessFilter : "Visibility"}
              </Typography>
              <Box
                sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: 20, height: 20, mr: "2px", flexShrink: 0, color: isAccessActive ? "#0040d5" : "var(--lens-semantic-color-type-muted)", borderRadius: "50%", "&:hover": { bgcolor: isAccessActive ? "rgba(0,64,213,0.12)" : "rgba(0,0,0,0.06)" } }}
                onClick={(e) => { e.stopPropagation(); if (isAccessActive) { setAccessFilter("All"); } else { setFilterConfigAnchor((e.currentTarget.closest("[data-filter-chip]") as HTMLElement) ?? e.currentTarget); } }}
              >
                {isAccessActive ? <CloseIcon sx={{ fontSize: 'var(--lens-semantic-font-title-h5-sm-font-size)' }} /> : <ExpandDownIcon sx={{ fontSize: 'var(--lens-semantic-font-title-h5-sm-font-size)' }} />}
              </Box>
            </Box>
            <Button variant="text" size="small" onClick={() => setAccessFilter("All")} sx={{ visibility: anyFilterActive ? "visible" : "hidden" }}>
              Clear filters
            </Button>
          </Box>
        )}

        {/* ── Table ── */}
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
                <TableCell sx={{ width: "34%" }}>Name</TableCell>
                <TableCell sx={{ width: "18%" }}>Role</TableCell>
                <TableCell sx={{ width: "14%" }}>Visibility</TableCell>
                <TableCell sx={{ width: "18%" }}>Last modified</TableCell>
                <TableCell sx={{ width: "10%" }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <Typography
                      variant="body2"
                      sx={{ color: "var(--lens-semantic-color-type-muted)" }}
                    >
                      No members found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map(renderMemberRow)
              )}
            </TableBody>
          </Table>
        </Box>
      </Box>

      {/* ── Filter config menu ── */}
      <Menu
        anchorEl={filterConfigAnchor}
        open={Boolean(filterConfigAnchor)}
        onClose={() => setFilterConfigAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{ paper: { sx: { minWidth: 200 } } }}
      >
        <MenuItem selected={accessFilter === "Internal"} onClick={() => { setAccessFilter("Internal"); setFilterConfigAnchor(null); }}>Internal</MenuItem>
        <MenuItem selected={accessFilter === "Public"} onClick={() => { setAccessFilter("Public"); setFilterConfigAnchor(null); }}>Public</MenuItem>
      </Menu>

      {/* ── Context menu ── */}
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
            <EditIcon style={{ fontSize: 'var(--lens-semantic-font-title-h3-lg-font-size)' }} />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            setPublishTargetId(menuItemId);
            closeMenu();
          }}
        >
          <ListItemIcon>
            {isMenuItemPublic ? <LockedIcon style={{ fontSize: 'var(--lens-semantic-font-title-h3-lg-font-size)' }} /> : <UnlockedIcon style={{ fontSize: 'var(--lens-semantic-font-title-h3-lg-font-size)' }} />}
          </ListItemIcon>
          <ListItemText>{isMenuItemPublic ? "Remove from site" : "Publish to site"}</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            setDeleteTargetId(menuItemId);
            closeMenu();
            setDeleteDialogOpen(true);
          }}
          sx={{
            color: "var(--lens-semantic-color-status-error-text)",
            "& .MuiListItemIcon-root": { color: "var(--lens-semantic-color-status-error-text)" },
            "& .MuiListItemText-primary": { color: "var(--lens-semantic-color-status-error-text)" },
            "&:hover .MuiListItemIcon-root": { color: "var(--lens-semantic-color-status-error-text)" },
            "&:hover .MuiListItemText-primary": { color: "var(--lens-semantic-color-status-error-text)" },
          }}
        >
          <ListItemIcon>
            <TrashIcon style={{ fontSize: 'var(--lens-semantic-font-title-h3-lg-font-size)' }} />
          </ListItemIcon>
          <ListItemText>Remove</ListItemText>
        </MenuItem>
      </Menu>

      {/* ── Publish / Remove from site dialog ── */}
      <ConfirmDialog
        open={Boolean(publishTargetId)}
        title={isPublishTargetPublic ? "Remove from site?" : "Publish to site?"}
        message={
          isPublishTargetPublic
            ? "This item will no longer be visible on the public site. It will only be accessible to internal users."
            : "This item will be visible to anyone on the public site."
        }
        confirmLabel={isPublishTargetPublic ? "Remove from site" : "Publish to site"}
        onConfirm={() => {
          if (publishTargetId) {
            setAccessOverrides((prev) => ({
              ...prev,
              [publishTargetId]: isPublishTargetPublic ? "Internal" : "Public",
            }));
          }
          setPublishTargetId(null);
        }}
        onClose={() => setPublishTargetId(null)}
      />

      {/* ── Delete confirmation dialog ── */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Remove member"
        message="Are you sure you want to remove this board member? This action cannot be undone."
        confirmLabel="Remove"
        destructive
        onConfirm={() => {
          setDeleteDialogOpen(false);
          setDeleteTargetId(null);
        }}
        onClose={() => {
          setDeleteDialogOpen(false);
          setDeleteTargetId(null);
        }}
      />
    </PageLayout>
  );
}
