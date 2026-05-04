import { OverflowBreadcrumbs, PageHeader } from "@diligentcorp/atlas-react-bundle";
import SearchIcon from "@diligentcorp/atlas-react-bundle/icons/Search";
import CalendarIcon from "@diligentcorp/atlas-react-bundle/icons/Calendar";
import CloseIcon from "@diligentcorp/atlas-react-bundle/icons/Close";
import FilterListIcon from "@diligentcorp/atlas-react-bundle/icons/FilterList";
import SortIcon from "@diligentcorp/atlas-react-bundle/icons/Sort";
import VisibleIcon from "@diligentcorp/atlas-react-bundle/icons/Visible";
import FolderIcon from "@diligentcorp/atlas-react-bundle/icons/Folder";
import StarIcon from "@diligentcorp/atlas-react-bundle/icons/Star";
import SuccessIcon from "@diligentcorp/atlas-react-bundle/icons/Success";
import WarningIcon from "@diligentcorp/atlas-react-bundle/icons/Warning";
import UploadIcon from "@diligentcorp/atlas-react-bundle/icons/Upload";
import AddFolderIcon from "@diligentcorp/atlas-react-bundle/icons/AddFolder";
import AddFileIcon from "@diligentcorp/atlas-react-bundle/icons/AddFile";
import PdfFileIcon from "@diligentcorp/atlas-react-bundle/icons/PdfFile";
import WordFileIcon from "@diligentcorp/atlas-react-bundle/icons/WordFile";
import ExcelFileIcon from "@diligentcorp/atlas-react-bundle/icons/ExcelFile";
import PowerpointFileIcon from "@diligentcorp/atlas-react-bundle/icons/PowerpointFile";
import ImageFileIcon from "@diligentcorp/atlas-react-bundle/icons/ImageFile";
import VideoFileIcon from "@diligentcorp/atlas-react-bundle/icons/VideoFile";
import FileIcon from "@diligentcorp/atlas-react-bundle/icons/File";
import ExpandRightIcon from "@diligentcorp/atlas-react-bundle/icons/ExpandRight";
import ExpandDownIcon from "@diligentcorp/atlas-react-bundle/icons/ExpandDown";
import MoreIcon from "@diligentcorp/atlas-react-bundle/icons/More";
import MoveIcon from "@diligentcorp/atlas-react-bundle/icons/Move";
import EditIcon from "@diligentcorp/atlas-react-bundle/icons/Edit";
import TrashIcon from "@diligentcorp/atlas-react-bundle/icons/Trash";
import LockedIcon from "@diligentcorp/atlas-react-bundle/icons/Locked";
import UnlockedIcon from "@diligentcorp/atlas-react-bundle/icons/Unlocked";
import {
  Alert,
  Box,
  Button,
  Divider,
  IconButton,
  InputAdornment,
  Link,
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
  Typography,
  useTheme,
} from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

import PageLayout from "../components/PageLayout.js";
import StatusChip from "../components/meetings/StatusChip";
import ConfirmDialog from "../components/meetings/ConfirmDialog";
import UploadDialog from "../components/UploadDialog";
import NewFolderDialog from "../components/NewFolderDialog";
import documentsData from "../data/documents.json";

// ── Types ────────────────────────────────────────────────────────────────────

type FeaturedToast = { message: string; severity: "success" | "warning" };

interface DocumentFile {
  name: string;
  size: string;
}

interface ContentSection {
  tags: string[];
  files: DocumentFile[];
}

interface DocumentItem {
  id: string;
  folderId: string | null;
  name: string;
  fileName: string;
  featured: boolean;
  releaseDate: string;
  expireDate: string | null;
  access: string;
  publicContent: ContentSection | null;
  administrativeContent: ContentSection | null;
  executiveContent: ContentSection | null;
  lastModifiedBy: string;
  lastModifiedDate: string;
}

interface SubFolder {
  id: string;
  name: string;
}

interface Folder {
  id: string;
  name: string;
  children: SubFolder[];
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

const FEATURED_FOLDER_ID = "__featured__";

// ── Component ────────────────────────────────────────────────────────────────

export default function FolderDetailPage() {
  const { tokens } = useTheme();
  const dividerColor =
    tokens?.component?.divider?.colors?.default?.borderColor?.value ?? "#E0E0E0";
  const navigate = useNavigate();
  const { folderId } = useParams<{ folderId: string }>();

  const { folders, items: rawItems } = documentsData as {
    folders: Folder[];
    items: DocumentItem[];
  };

  const isFeaturedFolder = folderId === FEATURED_FOLDER_ID;

  // Resolve current folder, its parent (if sub-folder), and display name
  const { folder, parentFolder, folderName, folderIcon } = useMemo(() => {
    if (isFeaturedFolder) {
      return {
        folder: null,
        parentFolder: null,
        folderName: "Featured",
        folderIcon: (
          <StarIcon
            size="md"
            variant="filled"
            style={{ color: "var(--lens-semantic-color-type-muted)" }}
          />
        ),
      };
    }

    for (const f of folders) {
      if (f.id === folderId) {
        return {
          folder: f,
          parentFolder: null,
          folderName: f.name,
          folderIcon: (
            <FolderIcon
              style={{ fontSize: ICON_SIZE, color: "var(--lens-semantic-color-type-muted)" }}
            />
          ),
        };
      }
      for (const child of f.children) {
        if (child.id === folderId) {
          return {
            folder: null,
            parentFolder: f,
            folderName: child.name,
            folderIcon: (
              <FolderIcon
                style={{ fontSize: ICON_SIZE, color: "var(--lens-semantic-color-type-muted)" }}
              />
            ),
          };
        }
      }
    }

    return { folder: null, parentFolder: null, folderName: "Unknown", folderIcon: null };
  }, [folderId, folders, isFeaturedFolder]);

  // ── State ──────────────────────────────────────────────────────────────────

  const [search, setSearch] = useState("");
  const [featuredIds, setFeaturedIds] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    for (const item of rawItems) {
      if (item.featured) initial.add(item.id);
    }
    return initial;
  });

  const [expandedSubFolders, setExpandedSubFolders] = useState<Set<string>>(new Set());

  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuItemId, setMenuItemId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [publishTargetId, setPublishTargetId] = useState<string | null>(null);
  const [accessOverrides, setAccessOverrides] = useState<Record<string, string>>({});
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [newFolderDialogOpen, setNewFolderDialogOpen] = useState(false);
  const [featuredToast, setFeaturedToast] = useState<FeaturedToast | null>(null);

  const [accessFilter, setAccessFilter] = useState<string>("All");
  const [filterChipsVisible, setFilterChipsVisible] = useState(false);
  const [accessFilterAnchor, setAccessFilterAnchor] = useState<null | HTMLElement>(null);
  const [lastModifiedFrom, setLastModifiedFrom] = useState<Date | null>(null);
  const [lastModifiedTo, setLastModifiedTo] = useState<Date | null>(null);
  const [lastModifiedFilterAnchor, setLastModifiedFilterAnchor] = useState<null | HTMLElement>(null);
  const [sortMenuAnchor, setSortMenuAnchor] = useState<null | HTMLElement>(null);

  type SortColumn = "name" | "lastModified" | "modifiedBy" | null;
  type SortDirection = "asc" | "desc";
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const toggleSort = (col: SortColumn) => {
    if (sortColumn === col) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(col);
      setSortDirection("asc");
    }
  };

  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // ── Derived data ───────────────────────────────────────────────────────────

  const items = useMemo(
    () =>
      rawItems.map((item) => ({
        ...item,
        featured: featuredIds.has(item.id),
      })),
    [rawItems, featuredIds],
  );

  const searchLower = search.toLowerCase();
  const isSearching = searchLower.length > 0;
  const isAccessActive = accessFilter !== "All";
  const isDateFilterActive = lastModifiedFrom !== null || lastModifiedTo !== null;

  const dateFilterLabel = useMemo(() => {
    const fmt = (d: Date) =>
      d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    if (lastModifiedFrom && lastModifiedTo) return `${fmt(lastModifiedFrom)} – ${fmt(lastModifiedTo)}`;
    if (lastModifiedFrom) return `From ${fmt(lastModifiedFrom)}`;
    if (lastModifiedTo) return `Until ${fmt(lastModifiedTo)}`;
    return "Last modified";
  }, [lastModifiedFrom, lastModifiedTo]);

  const passesFilters = (item: DocumentItem) => {
    if (isSearching && !item.name.toLowerCase().includes(searchLower)) return false;
    if (isAccessActive && item.access !== accessFilter) return false;
    if (lastModifiedFrom) {
      const itemDate = new Date(item.lastModifiedDate);
      if (isNaN(itemDate.getTime()) || itemDate < lastModifiedFrom) return false;
    }
    if (lastModifiedTo) {
      const endOfDay = new Date(lastModifiedTo);
      endOfDay.setHours(23, 59, 59, 999);
      const itemDate = new Date(item.lastModifiedDate);
      if (isNaN(itemDate.getTime()) || itemDate > endOfDay) return false;
    }
    return true;
  };

  const sortItems = <T extends { name: string; lastModifiedDate: string; lastModifiedBy: string }>(arr: T[]): T[] => {
    if (!sortColumn) return arr;
    return [...arr].sort((a, b) => {
      let cmp = 0;
      if (sortColumn === "name") {
        cmp = a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
      } else if (sortColumn === "lastModified") {
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
  };

  const anyFilterActive = isAccessActive || isDateFilterActive;

  useEffect(() => {
    if (searchOpen) {
      const timer = setTimeout(() => searchInputRef.current?.focus(), 260);
      return () => clearTimeout(timer);
    }
  }, [searchOpen]);

  // Gather folder contents: items directly inside this folder (and sub-folders if top-level folder)
  const folderContents = useMemo(() => {
    const filtered = items.filter(passesFilters);

    if (isFeaturedFolder) {
      return filtered.filter((item) => featuredIds.has(item.id));
    }

    const childFolderIds: string[] = [];
    if (folder) {
      childFolderIds.push(...folder.children.map((c) => c.id));
    }

    const directItems = filtered.filter((item) => item.folderId === folderId);
    const subFolderItems = new Map<string, DocumentItem[]>();

    for (const childId of childFolderIds) {
      const childItems = filtered.filter((item) => item.folderId === childId);
      if (childItems.length > 0 || !isSearching) {
        subFolderItems.set(childId, childItems);
      }
    }

    return { directItems, subFolderItems, childFolderIds };
  }, [items, folderId, folder, featuredIds, isFeaturedFolder, isSearching, searchLower, accessFilter, lastModifiedFrom, lastModifiedTo]);

  // Visibility badges for the page subtitle
  const visibilityBadges = useMemo(() => {
    const set = new Set<string>();
    const allItems = isFeaturedFolder
      ? items.filter((item) => featuredIds.has(item.id))
      : items.filter((item) => {
          if (item.folderId === folderId) return true;
          if (folder) {
            return folder.children.some((c) => c.id === item.folderId);
          }
          return false;
        });
    for (const item of allItems) set.add(item.access);
    return Array.from(set);
  }, [items, folderId, folder, featuredIds, isFeaturedFolder]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const toggleFeatured = (itemId: string) => {
    const wasFeatured = featuredIds.has(itemId);
    setFeaturedIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
    const item = items.find((i) => i.id === itemId);
    if (!item) return;
    if (!wasFeatured) {
      setFeaturedToast({ message: `"${item.name}" added to Featured`, severity: "success" });
    } else {
      setFeaturedToast({ message: `"${item.name}" removed from Featured`, severity: "warning" });
    }
  };

  const toggleSubFolder = (id: string) => {
    setExpandedSubFolders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
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

  const getAccess = (id: string) => accessOverrides[id] ?? items.find((i) => i.id === id)?.access ?? "Internal";
  const menuItemAccess = menuItemId ? getAccess(menuItemId) : null;
  const isMenuItemPublic = menuItemAccess === "Public";
  const publishTargetAccess = publishTargetId ? getAccess(publishTargetId) : null;
  const isPublishTargetPublic = publishTargetAccess === "Public";


  // ── Row renderers ──────────────────────────────────────────────────────────

  const documentRowSx = {
    "&:hover": { backgroundColor: "action.hover" },
  };

  const folderRowSx = {
    cursor: "pointer",
    "&:hover": { backgroundColor: "action.hover" },
  };

  const renderDocumentRow = (
    item: DocumentItem,
    indent: number,
    options?: { keyPrefix?: string; starFilled?: boolean },
  ) => {
    const keyPrefix = options?.keyPrefix ?? "";
    const isFilled = options?.starFilled || featuredIds.has(item.id);

    return (
      <TableRow key={`${keyPrefix}${item.id}`} sx={documentRowSx}>
        <TableCell sx={{ pl: indent }}>
          <Stack direction="row" alignItems="center" gap={1}>
            <Box sx={{ width: 20, flexShrink: 0 }} />
            {getFileIcon(item.fileName)}
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                color: "primary.main",
                "&:hover": { textDecoration: "underline", cursor: "pointer" },
              }}
            >
              {item.name}
            </Typography>
          </Stack>
        </TableCell>
        <TableCell>
          <StatusChip label={accessOverrides[item.id] ?? item.access} />
        </TableCell>
        <TableCell>
          <Typography variant="body2">{item.lastModifiedDate}</Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2">{item.lastModifiedBy}</Typography>
        </TableCell>
        <TableCell align="right" sx={{ width: 48 }}>
          <Stack direction="row" alignItems="center" justifyContent="flex-end" gap={0}>
            <IconButton
              size="small"
              onClick={() => toggleFeatured(item.id)}
              sx={{ color: "var(--lens-semantic-color-type-muted)" }}
            >
              <StarIcon size="md" variant={isFilled ? "filled" : "outlined"} />
            </IconButton>
            <IconButton size="small" onClick={(e) => openMenu(e, item.id)}>
              <MoreIcon style={{ fontSize: 18 }} />
            </IconButton>
          </Stack>
        </TableCell>
      </TableRow>
    );
  };

  const getFolderMeta = (folderIds: string[]) => {
    let latestDate: Date | null = null;
    let latestModifiedDate = "";
    let latestModifiedBy = "";
    const accessSet = new Set<string>();

    for (const fid of folderIds) {
      for (const item of items.filter((i) => i.folderId === fid)) {
        accessSet.add(item.access);
        const d = new Date(item.lastModifiedDate);
        if (!isNaN(d.getTime()) && (latestDate === null || d > latestDate)) {
          latestDate = d;
          latestModifiedDate = item.lastModifiedDate;
          latestModifiedBy = item.lastModifiedBy;
        }
      }
    }

    return { latestModifiedDate, latestModifiedBy, accessSet };
  };

  const renderSubFolderRow = (childId: string, childName: string) => {
    const isExpanded = expandedSubFolders.has(childId);
    const childItems = !isFeaturedFolder && !Array.isArray(folderContents)
      ? folderContents.subFolderItems.get(childId) ?? []
      : [];
    const meta = getFolderMeta([childId]);

    return (
      <TableRow
        key={`subfolder-${childId}`}
        onClick={() => toggleSubFolder(childId)}
        sx={folderRowSx}
      >
        <TableCell sx={{ pl: 2 }}>
          <Stack direction="row" alignItems="center" gap={1}>
            {isExpanded ? (
              <ExpandDownIcon size="md" style={{ opacity: 0.6 }} />
            ) : (
              <ExpandRightIcon size="md" style={{ opacity: 0.6 }} />
            )}
            <FolderIcon style={{ fontSize: ICON_SIZE, color: "var(--lens-semantic-color-type-muted)" }} />
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: "primary.main",
                "&:hover": { textDecoration: "underline", cursor: "pointer" },
              }}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/library/documents/folder/${childId}`);
              }}
            >
              {childName}
            </Typography>
            {childItems.length > 0 && (
              <Typography
                variant="caption"
                sx={{ color: "var(--lens-semantic-color-type-muted)", ml: 0.5 }}
              >
                ({childItems.length})
              </Typography>
            )}
          </Stack>
        </TableCell>
        <TableCell />
        <TableCell>
          <Typography variant="body2">{meta.latestModifiedDate}</Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2">{meta.latestModifiedBy}</Typography>
        </TableCell>
        <TableCell align="right" sx={{ width: 48 }}>
          <IconButton size="small" onClick={(e) => openMenu(e, childId)}>
            <MoreIcon style={{ fontSize: 18 }} />
          </IconButton>
        </TableCell>
      </TableRow>
    );
  };

  // ── Build rows ─────────────────────────────────────────────────────────────

  const rows: React.ReactNode[] = [];

  if (isFeaturedFolder && Array.isArray(folderContents)) {
    for (const item of sortItems(folderContents)) {
      rows.push(renderDocumentRow(item, 2, { starFilled: true }));
    }
  } else if (!isFeaturedFolder && !Array.isArray(folderContents)) {
    // Sub-folders first — sort them like top-level folders
    if (folder) {
      const childEntries = folder.children
        .filter((child) => !isSearching || (folderContents.subFolderItems.get(child.id) ?? []).length > 0)
        .map((child) => ({
          folder: child,
          meta: getFolderMeta([child.id]),
          items: folderContents.subFolderItems.get(child.id) ?? [],
        }));

      const sortedChildren = sortColumn
        ? [...childEntries].sort((a, b) => {
            let cmp = 0;
            if (sortColumn === "name") {
              cmp = a.folder.name.localeCompare(b.folder.name, undefined, { sensitivity: "base" });
            } else if (sortColumn === "lastModified") {
              const ta = new Date(a.meta.latestModifiedDate).getTime();
              const tb = new Date(b.meta.latestModifiedDate).getTime();
              if (isNaN(ta) && isNaN(tb)) cmp = 0;
              else if (isNaN(ta)) cmp = 1;
              else if (isNaN(tb)) cmp = -1;
              else cmp = ta - tb;
            } else {
              cmp = a.meta.latestModifiedBy.localeCompare(b.meta.latestModifiedBy, undefined, { sensitivity: "base" });
            }
            return sortDirection === "asc" ? cmp : -cmp;
          })
        : childEntries;

      for (const child of sortedChildren) {
        rows.push(renderSubFolderRow(child.folder.id, child.folder.name));

        if (expandedSubFolders.has(child.folder.id)) {
          for (const item of sortItems(child.items)) {
            rows.push(renderDocumentRow(item, 5));
          }
        }
      }
    }

    // Direct items
    for (const item of sortItems(folderContents.directItems)) {
      rows.push(renderDocumentRow(item, 2));
    }
  }

  // ── Breadcrumb items ───────────────────────────────────────────────────────

  const breadcrumbItems: { id: string; label: string; isCurrent?: boolean }[] = [
    { id: "product", label: "Community" },
    { id: "library", label: "Library" },
    { id: "documents", label: "Documents" },
  ];

  if (parentFolder) {
    breadcrumbItems.push({ id: parentFolder.id, label: parentFolder.name });
  }

  breadcrumbItems.push({ id: "current", label: folderName, isCurrent: true });

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <PageLayout id="page-folder-detail">
      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-end">
          <PageHeader
            breadcrumbs={
              <OverflowBreadcrumbs items={breadcrumbItems}>
                {(item) => {
                  const disabledSx = { fontSize: 14, fontWeight: 600, lineHeight: "20px", letterSpacing: "0.14px", color: "#6f7377", pl: "4px", pr: "12px", py: "4px" };
                  if (item.id === "product" || item.isCurrent) {
                    return <Typography key={item.id} sx={disabledSx}>{item.label}</Typography>;
                  }
                  if (item.id === "library" || item.id === "documents") {
                    return <Link key={item.id} underline="hover" variant="body1" sx={{ cursor: "pointer" }} onClick={() => navigate("/library/documents")}>{item.label}</Link>;
                  }
                  return <Link key={item.id} underline="hover" variant="body1" sx={{ cursor: "pointer" }} onClick={() => navigate(`/library/documents/folder/${item.id}`)}>{item.label}</Link>;
                }}
              </OverflowBreadcrumbs>
            }
            pageTitle={folderName}
            pageSubtitle={
              <Stack direction="row" spacing={1} alignItems="center">
                {visibilityBadges.map((badge) => (
                  <StatusChip key={badge} label={badge} />
                ))}
              </Stack>
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
          <Stack direction="row" spacing={1} sx={{ pb: "4px" }}>
            <Button
              variant="outlined"
              startIcon={<AddFolderIcon />}
              onClick={() => setNewFolderDialogOpen(true)}
              sx={{ whiteSpace: "nowrap" }}
            >
              New folder
            </Button>
            <Button variant="outlined" startIcon={<AddFileIcon />} sx={{ whiteSpace: "nowrap" }}>
              New document
            </Button>
            <Button
              variant="contained"
              startIcon={<UploadIcon />}
              onClick={() => setUploadDialogOpen(true)}
              sx={{ whiteSpace: "nowrap" }}
            >
              Upload
            </Button>
          </Stack>
        </Stack>
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
            onClick={() => setFilterChipsVisible((v) => !v)}
            color="tertiary"
            sx={{
              ...(filterChipsVisible && {
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
              placeholder="Search documents"
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
        </Stack>
      </Box>

      <Box sx={{ mt: "-12px" }}>
        {filterChipsVisible && (
          <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1, mb: 1, pt: "16px" }}>
            {/* Visibility chip */}
            <Box
              data-filter-chip="access"
              onClick={(e) => setAccessFilterAnchor(e.currentTarget)}
              sx={{ display: "inline-flex", alignItems: "center", height: 24, border: isAccessActive ? "none" : "1px solid #e2e2e5", bgcolor: isAccessActive ? "#ecf0ff" : "transparent", borderRadius: "9999px", pl: "2px", pr: "2px", overflow: "hidden", cursor: "pointer", "&:hover": { opacity: 0.85 } }}
            >
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: 24, height: 24, flexShrink: 0 }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: 24, height: 24, color: isAccessActive ? "#0040d5" : "var(--lens-semantic-color-type-muted)", "& svg": { width: 16, height: 16, display: "block" } }}>
                  <VisibleIcon />
                </Box>
              </Box>
              <Typography sx={{ px: 1, fontSize: 12, fontWeight: 400, lineHeight: "16px", letterSpacing: "0.3px", color: isAccessActive ? "#0040d5" : "#242628", whiteSpace: "nowrap", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {isAccessActive ? accessFilter : "Visibility"}
              </Typography>
              <Box
                sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: 20, height: 20, mr: "2px", flexShrink: 0, color: isAccessActive ? "#0040d5" : "var(--lens-semantic-color-type-muted)", borderRadius: "50%", "&:hover": { bgcolor: isAccessActive ? "rgba(0,64,213,0.12)" : "rgba(0,0,0,0.06)" } }}
                onClick={(e) => { e.stopPropagation(); if (isAccessActive) { setAccessFilter("All"); } else { setAccessFilterAnchor((e.currentTarget.closest("[data-filter-chip]") as HTMLElement) ?? e.currentTarget); } }}
              >
                {isAccessActive ? <CloseIcon sx={{ fontSize: 16 }} /> : <ExpandDownIcon sx={{ fontSize: 16 }} />}
              </Box>
            </Box>
            {/* Last modified chip */}
            <Box
              data-filter-chip="lastModified"
              onClick={(e) => setLastModifiedFilterAnchor(e.currentTarget)}
              sx={{ display: "inline-flex", alignItems: "center", height: 24, border: isDateFilterActive ? "none" : "1px solid #e2e2e5", bgcolor: isDateFilterActive ? "#ecf0ff" : "transparent", borderRadius: "9999px", pl: "2px", pr: "2px", overflow: "hidden", cursor: "pointer", "&:hover": { opacity: 0.85 } }}
            >
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: 24, height: 24, flexShrink: 0 }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: 24, height: 24, color: isDateFilterActive ? "#0040d5" : "var(--lens-semantic-color-type-muted)", "& svg": { width: 16, height: 16, display: "block" } }}>
                  <CalendarIcon />
                </Box>
              </Box>
              <Typography sx={{ px: 1, fontSize: 12, fontWeight: 400, lineHeight: "16px", letterSpacing: "0.3px", color: isDateFilterActive ? "#0040d5" : "#242628", whiteSpace: "nowrap", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {dateFilterLabel}
              </Typography>
              <Box
                sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: 20, height: 20, mr: "2px", flexShrink: 0, color: isDateFilterActive ? "#0040d5" : "var(--lens-semantic-color-type-muted)", borderRadius: "50%", "&:hover": { bgcolor: isDateFilterActive ? "rgba(0,64,213,0.12)" : "rgba(0,0,0,0.06)" } }}
                onClick={(e) => { e.stopPropagation(); if (isDateFilterActive) { setLastModifiedFrom(null); setLastModifiedTo(null); } else { setLastModifiedFilterAnchor((e.currentTarget.closest("[data-filter-chip]") as HTMLElement) ?? e.currentTarget); } }}
              >
                {isDateFilterActive ? <CloseIcon sx={{ fontSize: 16 }} /> : <ExpandDownIcon sx={{ fontSize: 16 }} />}
              </Box>
            </Box>
            <Button variant="text" size="small" onClick={() => { setAccessFilter("All"); setLastModifiedFrom(null); setLastModifiedTo(null); }} sx={{ visibility: anyFilterActive ? "visible" : "hidden" }}>
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
                <TableCell sx={{ width: "40%" }}>Name</TableCell>
                <TableCell sx={{ width: "12%" }}>Visibility</TableCell>
                <TableCell sx={{ width: "16%" }}>Last modified</TableCell>
                <TableCell sx={{ width: "22%" }}>Modified by</TableCell>
                <TableCell sx={{ width: "10%" }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <Typography
                      variant="body2"
                      sx={{ color: "var(--lens-semantic-color-type-muted)" }}
                    >
                      No documents found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                rows
              )}
            </TableBody>
          </Table>
        </Box>
      </Box>

      {/* ── Visibility filter menu ── */}
      <Menu
        anchorEl={accessFilterAnchor}
        open={Boolean(accessFilterAnchor)}
        onClose={() => setAccessFilterAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{ paper: { sx: { minWidth: 200 } } }}
      >
        <MenuItem selected={accessFilter === "Internal"} onClick={() => { setAccessFilter("Internal"); setAccessFilterAnchor(null); }}>Internal</MenuItem>
        <MenuItem selected={accessFilter === "Public"} onClick={() => { setAccessFilter("Public"); setAccessFilterAnchor(null); }}>Public</MenuItem>
      </Menu>

      {/* ── Last modified filter menu ── */}
      <Menu
        anchorEl={lastModifiedFilterAnchor}
        open={Boolean(lastModifiedFilterAnchor)}
        onClose={() => setLastModifiedFilterAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{ paper: { sx: { p: 2, minWidth: 280 } } }}
      >
        <Box sx={{ p: 1 }}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Stack spacing={2}>
              <Stack spacing={0.5}>
                <Typography variant="body2" sx={{ fontSize: 12, fontWeight: 600 }}>After</Typography>
                <DatePicker value={lastModifiedFrom} onChange={(v) => setLastModifiedFrom(v)} slotProps={{ textField: { size: "small" } }} />
              </Stack>
              <Stack spacing={0.5}>
                <Typography variant="body2" sx={{ fontSize: 12, fontWeight: 600 }}>Before</Typography>
                <DatePicker value={lastModifiedTo} onChange={(v) => setLastModifiedTo(v)} slotProps={{ textField: { size: "small" } }} />
              </Stack>
              <Button size="small" variant="outlined" onClick={() => setLastModifiedFilterAnchor(null)}>Apply</Button>
            </Stack>
          </LocalizationProvider>
        </Box>
      </Menu>

      {/* ── Sort menu ── */}
      <Menu
        anchorEl={sortMenuAnchor}
        open={Boolean(sortMenuAnchor)}
        onClose={() => setSortMenuAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem selected={sortColumn === "name" && sortDirection === "asc"} onClick={() => { toggleSort("name"); setSortMenuAnchor(null); }}>Sort by name ascending</MenuItem>
        <MenuItem selected={sortColumn === "name" && sortDirection === "desc"} onClick={() => { setSortColumn("name"); setSortDirection("desc"); setSortMenuAnchor(null); }}>Sort by name descending</MenuItem>
        <MenuItem selected={sortColumn === "lastModified" && sortDirection === "asc"} onClick={() => { toggleSort("lastModified"); setSortMenuAnchor(null); }}>Sort by last modified ascending</MenuItem>
        <MenuItem selected={sortColumn === "lastModified" && sortDirection === "desc"} onClick={() => { setSortColumn("lastModified"); setSortDirection("desc"); setSortMenuAnchor(null); }}>Sort by last modified descending</MenuItem>
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
            <MoveIcon style={{ fontSize: 20 }} />
          </ListItemIcon>
          <ListItemText>Move</ListItemText>
        </MenuItem>
        <MenuItem onClick={closeMenu}>
          <ListItemIcon>
            <EditIcon style={{ fontSize: 20 }} />
          </ListItemIcon>
          <ListItemText>Rename</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            setPublishTargetId(menuItemId);
            closeMenu();
          }}
        >
          <ListItemIcon>
            {isMenuItemPublic ? <LockedIcon style={{ fontSize: 20 }} /> : <UnlockedIcon style={{ fontSize: 20 }} />}
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
            <TrashIcon style={{ fontSize: 20 }} />
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
          setDeleteTargetId(null);
        }}
        onClose={() => {
          setDeleteDialogOpen(false);
          setDeleteTargetId(null);
        }}
      />

      {/* ── Upload dialog ── */}
      <UploadDialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
      />

      {/* ── New folder dialog ── */}
      <NewFolderDialog
        open={newFolderDialogOpen}
        onClose={() => setNewFolderDialogOpen(false)}
        onCreate={() => setNewFolderDialogOpen(false)}
      />

      {/* ── Toast (featured add / remove) ── */}
      <Snackbar
        open={featuredToast !== null}
        autoHideDuration={3000}
        onClose={() => setFeaturedToast(null)}
      >
        {featuredToast ? (
          <Alert
            severity={featuredToast.severity}
            icon={
              featuredToast.severity === "success" ? (
                <SuccessIcon variant="filled" size="lg" aria-hidden />
              ) : (
                <WarningIcon variant="filled" size="lg" aria-hidden />
              )
            }
            onClose={() => setFeaturedToast(null)}
            slotProps={{
              closeButton: {
                size: "medium",
                sx: {
                  color: featuredToast.severity === "warning" ? "#6a5f00" : "#3f6900",
                },
              },
              closeIcon: {
                fontSize: "medium",
                sx: {
                  color: featuredToast.severity === "warning" ? "#6a5f00" : "#3f6900",
                  fill: "currentColor",
                },
              },
            }}
            sx={{
              "&&&": {
                backgroundColor: "#282e37",
                border: "none",
                borderRadius: "12px",
                minWidth: 272,
                maxWidth: 480,
                minHeight: 56,
                padding: 0,
                overflow: "hidden",
                alignItems: "stretch",
                boxShadow:
                  "0px 0px 2px 0px rgba(0,0,0,0.25), 0px 32px 32px 0px rgba(0,0,0,0.1)",
                "& .MuiAlert-icon": {
                  alignSelf: "stretch",
                  width: 40,
                  minHeight: 56,
                  borderRadius: "12px 0 0 12px",
                  ...(featuredToast.severity === "warning"
                    ? { backgroundColor: "#fee400", color: "#6a5f00" }
                    : { backgroundColor: "#8ee400", color: "#3f6900" }),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0,
                  margin: 0,
                  border: "none",
                  outline: "none",
                  boxShadow: "none",
                  "& svg": { display: "block" },
                },
                "& .MuiAlert-message": {
                  color: "#ffffff",
                  fontSize: "1rem",
                  lineHeight: "1.5rem",
                  letterSpacing: "0.2px",
                  fontWeight: 400,
                  paddingTop: "8px",
                  paddingBottom: "8px",
                  paddingLeft: "16px",
                  paddingRight: "8px",
                  display: "-webkit-box",
                  WebkitBoxOrient: "vertical",
                  WebkitLineClamp: 2,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "normal",
                  wordBreak: "break-word",
                  minWidth: 0,
                  alignSelf: "center",
                },
                "& .MuiAlert-action": {
                  paddingLeft: "8px",
                  paddingRight: "8px",
                  margin: 0,
                  alignSelf: "center",
                  "& .MuiIconButton-root .MuiSvgIcon-root": {
                    color: featuredToast.severity === "warning" ? "#6a5f00" : "#3f6900",
                    fill: "currentColor",
                  },
                },
              },
            }}
          >
            {featuredToast.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </PageLayout>
  );
}
