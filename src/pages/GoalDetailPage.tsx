import { OverflowBreadcrumbs, PageHeader } from "@diligentcorp/atlas-react-bundle";
import SearchIcon from "@diligentcorp/atlas-react-bundle/icons/Search";
import ArrowDownIcon from "@diligentcorp/atlas-react-bundle/icons/ArrowDown";
import FilterIcon from "@diligentcorp/atlas-react-bundle/icons/Filter";
import FilterListIcon from "@diligentcorp/atlas-react-bundle/icons/FilterList";
import UploadIcon from "@diligentcorp/atlas-react-bundle/icons/Upload";
import PdfFileIcon from "@diligentcorp/atlas-react-bundle/icons/PdfFile";
import WordFileIcon from "@diligentcorp/atlas-react-bundle/icons/WordFile";
import ExcelFileIcon from "@diligentcorp/atlas-react-bundle/icons/ExcelFile";
import PowerpointFileIcon from "@diligentcorp/atlas-react-bundle/icons/PowerpointFile";
import ImageFileIcon from "@diligentcorp/atlas-react-bundle/icons/ImageFile";
import VideoFileIcon from "@diligentcorp/atlas-react-bundle/icons/VideoFile";
import FileIcon from "@diligentcorp/atlas-react-bundle/icons/File";
import MoreIcon from "@diligentcorp/atlas-react-bundle/icons/More";
import EditIcon from "@diligentcorp/atlas-react-bundle/icons/Edit";
import TrashIcon from "@diligentcorp/atlas-react-bundle/icons/Trash";
import LockedIcon from "@diligentcorp/atlas-react-bundle/icons/Locked";
import UnlockedIcon from "@diligentcorp/atlas-react-bundle/icons/Unlocked";
import {
  Box,
  Button,
  Divider,
  FormControl,
  FormLabel,
  IconButton,
  InputAdornment,
  LinearProgress,
  Link,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Popover,
  Select,
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
import { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";

import PageLayout from "../components/PageLayout.js";
import StatusChip from "../components/meetings/StatusChip";
import ConfirmDialog from "../components/meetings/ConfirmDialog";
import UploadDialog from "../components/UploadDialog";
import goalsData from "../data/goals.json";

// ── Types ────────────────────────────────────────────────────────────────────

interface GoalFile {
  id: string;
  fileName: string;
  name: string;
  access: string;
  lastModifiedBy: string;
  lastModifiedDate: string;
}

interface GoalItem {
  id: string;
  name: string;
  progress: number;
  access: string;
  lastModifiedDate: string;
  files: GoalFile[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const ICON_SIZE = 20;

const FILE_TYPE_COLORS: Record<string, string> = {
  pdf: "#E53935",
  doc: "#2B579A",
  docx: "#2B579A",
  xls: "#217346",
  xlsx: "#217346",
  ppt: "#D24726",
  pptx: "#D24726",
  jpg: "#7B1FA2",
  jpeg: "#7B1FA2",
  png: "#7B1FA2",
  gif: "#7B1FA2",
  svg: "#7B1FA2",
  mp4: "#00796B",
  mov: "#00796B",
  avi: "#00796B",
  webm: "#00796B",
};

function getFileExtension(fileName: string): string {
  const parts = fileName.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
}

function getFileIcon(fileName: string) {
  const ext = getFileExtension(fileName);
  const color = FILE_TYPE_COLORS[ext] ?? "var(--lens-semantic-color-type-muted)";
  const sx = { fontSize: ICON_SIZE, color };

  switch (ext) {
    case "pdf":
      return <PdfFileIcon style={sx} />;
    case "doc":
    case "docx":
      return <WordFileIcon style={sx} />;
    case "xls":
    case "xlsx":
      return <ExcelFileIcon style={sx} />;
    case "ppt":
    case "pptx":
      return <PowerpointFileIcon style={sx} />;
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "svg":
      return <ImageFileIcon style={sx} />;
    case "mp4":
    case "mov":
    case "avi":
    case "webm":
      return <VideoFileIcon style={sx} />;
    default:
      return <FileIcon style={sx} />;
  }
}

function progressColor(value: number): string {
  if (value >= 100) return "#2E7D32";
  if (value >= 60) return "#1976D2";
  if (value >= 30) return "#ED6C02";
  return "#D32F2F";
}

function progressLabel(value: number): string {
  if (value >= 100) return "Completed";
  if (value >= 60) return "On track";
  if (value >= 30) return "In progress";
  return "At risk";
}

// ── Component ────────────────────────────────────────────────────────────────

export default function GoalDetailPage() {
  const { tokens } = useTheme();
  const dividerColor =
    tokens?.component?.divider?.colors?.default?.borderColor?.value ?? "#E0E0E0";
  const navigate = useNavigate();
  const { goalId } = useParams<{ goalId: string }>();

  const rawItems = goalsData.items as GoalItem[];
  const goal = rawItems.find((g) => g.id === goalId) ?? null;

  // ── State ──────────────────────────────────────────────────────────────────

  const [search, setSearch] = useState("");
  const [headerMenuAnchor, setHeaderMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuItemId, setMenuItemId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [publishTargetId, setPublishTargetId] = useState<string | null>(null);
  const [accessOverrides, setAccessOverrides] = useState<Record<string, string>>({});
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const [accessFilter, setAccessFilter] = useState<string>("All");
  const [sortColumn, setSortColumn] = useState<"lastModified" | "modifiedBy" | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  type FilterColumn = "access";
  const [openFilter, setOpenFilter] = useState<FilterColumn | null>(null);
  const filterAnchors = {
    access: useRef<HTMLTableCellElement>(null),
  };

  let filteredFiles: NonNullable<typeof goal>["files"] = [];
  if (goal) {
    const searchLower = search.toLowerCase();
    const isSearching = searchLower.length > 0;
    const isAccessActive = accessFilter !== "All";

    filteredFiles = goal.files.filter((file) => {
      if (isSearching && !file.name.toLowerCase().includes(searchLower)) return false;
      if (isAccessActive && file.access !== accessFilter) return false;
      return true;
    });

    if (sortColumn) {
      filteredFiles = [...filteredFiles].sort((a, b) => {
        let cmp = 0;
        if (sortColumn === "lastModified") {
          const ta = new Date(a.lastModifiedDate).getTime();
          const tb = new Date(b.lastModifiedDate).getTime();
          if (isNaN(ta) && isNaN(tb)) cmp = 0;
          else if (isNaN(ta)) cmp = 1;
          else if (isNaN(tb)) cmp = -1;
          else cmp = ta - tb;
        } else {
          cmp = a.lastModifiedBy.localeCompare(b.lastModifiedBy, undefined, { sensitivity: "base" });
        }
        return sortDirection === "asc" ? cmp : -cmp;
      });
    }
  }

  if (!goal) {
    return (
      <PageLayout id="page-goal-detail">
        <Typography variant="h6">Goal not found</Typography>
      </PageLayout>
    );
  }

  const color = progressColor(goal.progress);
  const status = progressLabel(goal.progress);

  // ── Filters ────────────────────────────────────────────────────────────────

  const isAccessActive = accessFilter !== "All";

  const toggleSort = (column: "lastModified" | "modifiedBy") => {
    if (sortColumn === column) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

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

  const getAccess = (id: string) => accessOverrides[id] ?? goal.files.find((f) => f.id === id)?.access ?? "Internal";
  const menuItemAccess = menuItemId ? getAccess(menuItemId) : null;
  const isMenuItemPublic = menuItemAccess === "Public";
  const isGoalPublic = (accessOverrides[goal.id] ?? goal.access) === "Public";
  const publishTargetAccess = publishTargetId
    ? (publishTargetId === goal.id ? (accessOverrides[goal.id] ?? goal.access) : getAccess(publishTargetId))
    : null;
  const isPublishTargetPublic = publishTargetAccess === "Public";

  const filterHeaderSx = (isActive: boolean) => ({
    userSelect: "none" as const,
    ...(isActive && { color: "primary.main", fontWeight: 'var(--lens-core-font-weight-bold)' }),
  });

  const fileRowSx = {
    "&:hover": { backgroundColor: "action.hover" },
  };

  // ── Breadcrumbs ────────────────────────────────────────────────────────────

  const breadcrumbItems = [
    { id: "product", label: "Community" },
    { id: "library", label: "Library" },
    { id: "goals", label: "Goals" },
    { id: "current", label: goal.name, isCurrent: true },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <PageLayout id="page-goal-detail">
      <Box sx={{ borderBottom: `1px solid ${dividerColor}`, pb: "12px" }}>
        <PageHeader
          breadcrumbs={
            <OverflowBreadcrumbs items={breadcrumbItems}>
              {(item) => {
                const disabledSx = { fontSize: 'var(--lens-semantic-font-text-body-font-size)', fontWeight: 'var(--lens-core-font-weight-semi-bold)', lineHeight: 'var(--lens-semantic-font-text-body-line-height)', letterSpacing: 'var(--lens-semantic-letter-spacing-xs)', color: "#6f7377", pl: "4px", pr: "12px", py: "4px" };
                if (item.id === "product" || item.isCurrent) {
                  return <Typography key={item.id} sx={disabledSx}>{item.label}</Typography>;
                }
                if (item.id === "library") {
                  return <Link key={item.id} underline="hover" variant="body1" sx={{ cursor: "pointer" }} onClick={() => navigate("/library/goals")}>{item.label}</Link>;
                }
                return <Link key={item.id} underline="hover" variant="body1" sx={{ cursor: "pointer" }} onClick={() => navigate("/library/goals")}>{item.label}</Link>;
              }}
            </OverflowBreadcrumbs>
          }
          pageTitle={goal.name}
          pageSubtitle={
            <Stack direction="row" spacing={1} alignItems="center">
              <StatusChip label={accessOverrides[goal.id] ?? goal.access} />
            </Stack>
          }
          moreButton={
            <IconButton
              aria-label="More actions"
              onClick={(e) => setHeaderMenuAnchor(e.currentTarget)}
            >
              <MoreIcon />
            </IconButton>
          }
          containerProps={{
            sx: {
              "--lens-component-page-header-desktop-middle-container-padding-bottom": "0px",
              "--lens-component-page-header-desktop-container-gap": "8px",
              "--lens-component-page-header-desktop-title-container-gap": "12px",
              "--lens-component-page-header-tablet-title-container-gap": "12px",
              "& nav.MuiBreadcrumbs-root li:first-child > *": { pl: 0 },
            },
          }}
        />
      </Box>

      <Stack gap={3} sx={{ mt: 1 }}>
        {/* ── Progress bar (constrained width) ── */}
        <Box sx={{ maxWidth: 400 }}>
          <Stack gap={1}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="body2" sx={{ fontWeight: 'var(--lens-core-font-weight-semi-bold)', color }}>
                {status}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 'var(--lens-core-font-weight-semi-bold)', color }}>
                {goal.progress}%
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={goal.progress}
              sx={{
                height: 10,
                borderRadius: 5,
                backgroundColor: "#E0E0E0",
                "& .MuiLinearProgress-bar": {
                  borderRadius: 5,
                  backgroundColor: color,
                },
              }}
            />
          </Stack>
        </Box>

        {/* ── Files section ── */}
        <Stack gap={2}>
          {/* Toolbar */}
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <FormControl sx={{ minWidth: 280 }}>
              <FormLabel>Search</FormLabel>
              <TextField
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search files"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </FormControl>

            <Button
              variant="contained"
              startIcon={<UploadIcon />}
              onClick={() => setUploadDialogOpen(true)}
            >
              Upload
            </Button>
          </Box>

          {/* Table */}
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
                  <TableCell sx={{ width: "36%" }}>Name</TableCell>
                  <TableCell
                    ref={filterAnchors.access}
                    sx={{ width: "12%", ...filterHeaderSx(isAccessActive) }}
                  >
                    <Stack direction="row" alignItems="center" gap={0.5}>
                      Visibility
                      <IconButton size="small" color="tertiary" onClick={() => setOpenFilter(openFilter === "access" ? null : "access")}>
                        <FilterListIcon
                          style={{
                            width: "var(--lens-semantic-icon-size-sm)",
                            height: "var(--lens-semantic-icon-size-sm)",
                          }}
                        />
                      </IconButton>
                    </Stack>
                  </TableCell>
                  <TableCell
                    sx={{ width: "16%", ...filterHeaderSx(sortColumn === "lastModified") }}
                  >
                    <Stack direction="row" alignItems="center" gap={0.5}>
                      Last modified
                      <IconButton size="small" color="tertiary" onClick={() => toggleSort("lastModified")}>
                        <ArrowDownIcon
                          style={{
                            width: "var(--lens-semantic-icon-size-sm)",
                            height: "var(--lens-semantic-icon-size-sm)",
                            transform:
                              sortColumn === "lastModified" && sortDirection === "asc"
                                ? "rotate(180deg)"
                                : undefined,
                          }}
                        />
                      </IconButton>
                    </Stack>
                  </TableCell>
                  <TableCell
                    sx={{ width: "20%", ...filterHeaderSx(sortColumn === "modifiedBy") }}
                  >
                    <Stack direction="row" alignItems="center" gap={0.5}>
                      Modified by
                      <IconButton size="small" color="tertiary" onClick={() => toggleSort("modifiedBy")}>
                        <ArrowDownIcon
                          style={{
                            width: "var(--lens-semantic-icon-size-sm)",
                            height: "var(--lens-semantic-icon-size-sm)",
                            transform:
                              sortColumn === "modifiedBy" && sortDirection === "asc"
                                ? "rotate(180deg)"
                                : undefined,
                          }}
                        />
                      </IconButton>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ width: "10%" }} />
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredFiles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                      <Typography
                        variant="body2"
                        sx={{ color: "var(--lens-semantic-color-type-muted)" }}
                      >
                        No files found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFiles.map((file) => (
                    <TableRow key={file.id} sx={fileRowSx}>
                      <TableCell>
                        <Stack direction="row" alignItems="center" gap={1}>
                          {getFileIcon(file.fileName)}
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 'var(--lens-core-font-weight-medium)',
                              color: "primary.main",
                              "&:hover": {
                                textDecoration: "underline",
                                cursor: "pointer",
                              },
                            }}
                          >
                            {file.name}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <StatusChip label={accessOverrides[file.id] ?? file.access} />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{file.lastModifiedDate}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{file.lastModifiedBy}</Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ width: 48 }}>
                        <IconButton size="small" onClick={(e) => openMenu(e, file.id)}>
                          <MoreIcon style={{ fontSize: 'var(--lens-semantic-font-title-h4-md-font-size)' }} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Box>
        </Stack>
      </Stack>

      {/* ── Column filter popovers ── */}

      <Popover
        open={openFilter === "access"}
        anchorEl={filterAnchors.access.current}
        onClose={() => setOpenFilter(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{ paper: { sx: { p: 2, minWidth: 200, borderRadius: "12px" } } }}
      >
        <Stack gap={1.5}>
          <Typography variant="subtitle2">Filter by visibility</Typography>
          <FormControl size="small">
            <Select value={accessFilter} onChange={(e) => setAccessFilter(e.target.value)}>
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Public">Public</MenuItem>
              <MenuItem value="Internal">Internal</MenuItem>
            </Select>
          </FormControl>
          {isAccessActive && (
            <Button
              variant="text"
              size="small"
              onClick={() => setAccessFilter("All")}
              sx={{ alignSelf: "flex-start" }}
            >
              Clear
            </Button>
          )}
        </Stack>
      </Popover>

      {/* ── File context menu ── */}
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
          <ListItemText>Rename</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { setPublishTargetId(menuItemId); closeMenu(); }}>
          <ListItemIcon>
            {isMenuItemPublic ? <LockedIcon style={{ fontSize: 'var(--lens-semantic-font-title-h3-lg-font-size)' }} /> : <UnlockedIcon style={{ fontSize: 'var(--lens-semantic-font-title-h3-lg-font-size)' }} />}
          </ListItemIcon>
          <ListItemText>{isMenuItemPublic ? "Remove from site" : "Publish to site"}</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
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
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* ── Header more menu ── */}
      <Menu
        anchorEl={headerMenuAnchor}
        open={Boolean(headerMenuAnchor)}
        onClose={() => setHeaderMenuAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{ paper: { sx: { minWidth: 180, borderRadius: "12px" } } }}
      >
        <MenuItem onClick={() => setHeaderMenuAnchor(null)}>
          <ListItemIcon>
            <EditIcon style={{ fontSize: 'var(--lens-semantic-font-title-h3-lg-font-size)' }} />
          </ListItemIcon>
          <ListItemText>Rename</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { setPublishTargetId(goal.id); setHeaderMenuAnchor(null); }}>
          <ListItemIcon>
            {isGoalPublic ? <LockedIcon style={{ fontSize: 'var(--lens-semantic-font-title-h3-lg-font-size)' }} /> : <UnlockedIcon style={{ fontSize: 'var(--lens-semantic-font-title-h3-lg-font-size)' }} />}
          </ListItemIcon>
          <ListItemText>{isGoalPublic ? "Remove from site" : "Publish to site"}</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            setHeaderMenuAnchor(null);
            setDeleteDialogOpen(true);
          }}
          sx={{
            color: "var(--lens-semantic-color-status-error-text)",
            "& .MuiListItemIcon-root": {
              color: "var(--lens-semantic-color-status-error-text)",
            },
            "& .MuiListItemText-primary": {
              color: "var(--lens-semantic-color-status-error-text)",
            },
            "&:hover .MuiListItemIcon-root": {
              color: "var(--lens-semantic-color-status-error-text)",
            },
            "&:hover .MuiListItemText-primary": {
              color: "var(--lens-semantic-color-status-error-text)",
            },
          }}
        >
          <ListItemIcon>
            <TrashIcon style={{ fontSize: 'var(--lens-semantic-font-title-h3-lg-font-size)' }} />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* ── Publish / Remove from site dialog ── */}
      <ConfirmDialog
        open={Boolean(publishTargetId)}
        title={isPublishTargetPublic ? "Remove from site?" : "Publish to site?"}
        message={
          isPublishTargetPublic
            ? "This item, including its contents, will no longer be visible on the public site. It will only be accessible to internal users."
            : "This item, including its contents, will be visible to anyone on the public site."
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
        title="Delete item"
        message="Are you sure you want to delete this item? This action cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          setDeleteDialogOpen(false);
          navigate("/library/goals");
        }}
        onClose={() => setDeleteDialogOpen(false)}
      />

      {/* ── Upload dialog ── */}
      <UploadDialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
      />
    </PageLayout>
  );
}
