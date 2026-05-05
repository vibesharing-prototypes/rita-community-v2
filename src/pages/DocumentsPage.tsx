import { PageHeader } from "@diligentcorp/atlas-react-bundle";
import SearchIcon from "@diligentcorp/atlas-react-bundle/icons/Search";
import CalendarIcon from "@diligentcorp/atlas-react-bundle/icons/Calendar";
import CloseIcon from "@diligentcorp/atlas-react-bundle/icons/Close";
import FilterIcon from "@diligentcorp/atlas-react-bundle/icons/Filter";
import FilterListIcon from "@diligentcorp/atlas-react-bundle/icons/FilterList";
import FolderIcon from "@diligentcorp/atlas-react-bundle/icons/Folder";
import UploadIcon from "@diligentcorp/atlas-react-bundle/icons/Upload";
import AddFolderIcon from "@diligentcorp/atlas-react-bundle/icons/AddFolder";
import AddFileIcon from "@diligentcorp/atlas-react-bundle/icons/AddFile";
import StarIcon from "@diligentcorp/atlas-react-bundle/icons/Star";
import SuccessIcon from "@diligentcorp/atlas-react-bundle/icons/Success";
import WarningIcon from "@diligentcorp/atlas-react-bundle/icons/Warning";
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
import VisibleIcon from "@diligentcorp/atlas-react-bundle/icons/Visible";
import SortIcon from "@diligentcorp/atlas-react-bundle/icons/Sort";
import {
  Alert,
  Box,
  Button,
  Divider,
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
  Typography,
  useTheme,
} from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
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

function collectAllFolderIds(folder: Folder): string[] {
  return [folder.id, ...folder.children.map((c) => c.id)];
}

// ── Component ────────────────────────────────────────────────────────────────

const FEATURED_FOLDER_ID = "__featured__";

export default function DocumentsPage() {
  const { tokens } = useTheme();
  const dividerColor =
    tokens?.component?.divider?.colors?.default?.borderColor?.value ?? "#E0E0E0";
  const navigate = useNavigate();

  const { folders, items: rawItems } = documentsData as {
    folders: Folder[];
    items: DocumentItem[];
  };

  // ── State ────────────────────────────────────────────────────────────────

  const [search, setSearch] = useState("");
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [featuredIds, setFeaturedIds] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    for (const item of rawItems) {
      if (item.featured) initial.add(item.id);
    }
    return initial;
  });

  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuItemId, setMenuItemId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [publishTargetId, setPublishTargetId] = useState<string | null>(null);
  const [accessOverrides, setAccessOverrides] = useState<Record<string, string>>({});
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [newFolderDialogOpen, setNewFolderDialogOpen] = useState(false);
  const [createMenuAnchor, setCreateMenuAnchor] = useState<null | HTMLElement>(null);
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

  // ── Derived data ─────────────────────────────────────────────────────────

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
    if (isAccessActive && (accessOverrides[item.id] ?? item.access) !== accessFilter) return false;
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

  const ROOT_FOLDER_KEY = "__root__";

  const itemsByFolder = useMemo(() => {
    const map = new Map<string, DocumentItem[]>();
    for (const item of items) {
      if (!passesFilters(item)) continue;
      const key = item.folderId ?? ROOT_FOLDER_KEY;
      const arr = map.get(key) ?? [];
      arr.push(item);
      map.set(key, arr);
    }
    return map;
  }, [items, isSearching, searchLower, accessFilter, lastModifiedFrom, lastModifiedTo]);

  const featuredItems = useMemo(
    () => sortItems(items.filter((item) => featuredIds.has(item.id) && passesFilters(item))),
    [items, featuredIds, isSearching, searchLower, accessFilter, lastModifiedFrom, lastModifiedTo, sortColumn, sortDirection],
  );

  const visibleTopFolders = useMemo(() => {
    if (!isSearching) return folders;
    return folders.filter((folder) => {
      const childIds = collectAllFolderIds(folder);
      return childIds.some((id) => (itemsByFolder.get(id)?.length ?? 0) > 0);
    });
  }, [folders, itemsByFolder, isSearching]);

  const anyFilterActive = isAccessActive || isDateFilterActive;

  useEffect(() => {
    if (searchOpen) {
      const timer = setTimeout(() => searchInputRef.current?.focus(), 260);
      return () => clearTimeout(timer);
    }
  }, [searchOpen]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  const toggleFeatured = (itemId: string) => {
    const wasFeatured = featuredIds.has(itemId);
    setFeaturedIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
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

  const filterHeaderSx = (isActive: boolean) => ({
    userSelect: "none" as const,
    ...(isActive && {
      color: "primary.main",
      fontWeight: 700,
    }),
  });

  // ── Row renderers ────────────────────────────────────────────────────────

  const folderRowSx = {
    cursor: "pointer",
    "&:hover": { backgroundColor: "action.hover" },
  };

  const documentRowSx = {
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
              <StarIcon
                size="md"
                variant={isFilled ? "filled" : "outlined"}
              />
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
      for (const item of itemsByFolder.get(fid) ?? []) {
        accessSet.add(accessOverrides[item.id] ?? item.access);
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

  const renderFolderRow = (
    folderId: string,
    folderName: string,
    depth: number,
    childCount: number,
    meta: { latestModifiedDate: string; latestModifiedBy: string; accessSet: Set<string> },
  ) => {
    const isExpanded = expandedFolders.has(folderId);
    const pl = 2 + depth * 3;

    return (
      <TableRow
        key={`folder-${folderId}`}
        onClick={() => toggleFolder(folderId)}
        sx={folderRowSx}
      >
        <TableCell sx={{ pl }}>
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
                navigate(`/library/documents/folder/${folderId}`);
              }}
            >
              {folderName}
            </Typography>
            {childCount > 0 && (
              <Typography
                variant="caption"
                sx={{ color: "var(--lens-semantic-color-type-muted)", ml: 0.5 }}
              >
                ({childCount})
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
          <IconButton
            size="small"
            onClick={(e) => openMenu(e, folderId)}
          >
            <MoreIcon style={{ fontSize: 18 }} />
          </IconButton>
        </TableCell>
      </TableRow>
    );
  };

  // ── Build table rows ─────────────────────────────────────────────────────

  const rows: React.ReactNode[] = [];

  // Featured folder
  if (featuredItems.length > 0) {
    const isFeaturedExpanded = expandedFolders.has(FEATURED_FOLDER_ID);

    rows.push(
      <TableRow
        key="folder-featured"
        onClick={() => toggleFolder(FEATURED_FOLDER_ID)}
        sx={folderRowSx}
      >
        <TableCell sx={{ pl: 2 }}>
          <Stack direction="row" alignItems="center" gap={1}>
            {isFeaturedExpanded ? (
              <ExpandDownIcon size="md" style={{ opacity: 0.6 }} />
            ) : (
              <ExpandRightIcon size="md" style={{ opacity: 0.6 }} />
            )}
            <StarIcon size="md" variant="filled" style={{ color: "var(--lens-semantic-color-type-muted)" }} />
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: "primary.main",
                "&:hover": { textDecoration: "underline", cursor: "pointer" },
              }}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/library/documents/folder/${FEATURED_FOLDER_ID}`);
              }}
            >
              Featured
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "var(--lens-semantic-color-type-muted)", ml: 0.5 }}
            >
              ({featuredItems.length})
            </Typography>
          </Stack>
        </TableCell>
        <TableCell />
        <TableCell />
        <TableCell />
        <TableCell />
      </TableRow>,
    );

    if (isFeaturedExpanded) {
      for (const item of featuredItems) {
        rows.push(renderDocumentRow(item, 6, { keyPrefix: "featured-", starFilled: true }));
      }
    }
  }

  // Regular folders — build sortable list, then sort
  const folderEntries = visibleTopFolders.map((folder) => {
    const allFolderIds = [folder.id, ...folder.children.map((c) => c.id)];
    const meta = getFolderMeta(allFolderIds);
    let totalCount = (itemsByFolder.get(folder.id) ?? []).length;
    for (const child of folder.children) {
      totalCount += (itemsByFolder.get(child.id) ?? []).length;
    }
    return { folder, meta, totalCount };
  });

  const sortFolderEntries = <T extends { folder: { name: string }; meta: { latestModifiedDate: string; latestModifiedBy: string } }>(entries: T[]): T[] => {
    if (!sortColumn) return entries;
    return [...entries].sort((a, b) => {
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
    });
  };

  for (const { folder, meta: folderMeta, totalCount } of sortFolderEntries(folderEntries)) {
    const hasChildren = folder.children.length > 0;
    const directItems = itemsByFolder.get(folder.id) ?? [];

    rows.push(renderFolderRow(folder.id, folder.name, 0, totalCount, folderMeta));

    if (expandedFolders.has(folder.id)) {
      if (hasChildren) {
        const childEntries = folder.children
          .filter((child) => !isSearching || (itemsByFolder.get(child.id) ?? []).length > 0)
          .map((child) => ({
            folder: child,
            meta: getFolderMeta([child.id]),
            items: itemsByFolder.get(child.id) ?? [],
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
          rows.push(renderFolderRow(child.folder.id, child.folder.name, 1, child.items.length, child.meta));

          if (expandedFolders.has(child.folder.id)) {
            for (const item of sortItems(child.items)) {
              rows.push(renderDocumentRow(item, 2 + 3 * 3));
            }
          }
        }

        for (const item of sortItems(directItems)) {
          rows.push(renderDocumentRow(item, 2 + 2 * 3));
        }
      } else {
        for (const item of sortItems(directItems)) {
          rows.push(renderDocumentRow(item, 2 + 1 * 3));
        }
      }
    }
  }

  // Root-level files (not in any folder)
  const rootItems = sortItems(itemsByFolder.get(ROOT_FOLDER_KEY) ?? []);
  for (const item of rootItems) {
    rows.push(renderDocumentRow(item, 2));
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <PageLayout id="page-documents">
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center" }}>
        <PageHeader pageTitle="Documents" />
        <Stack direction="row" gap={1} alignItems="center">
          <Button
            variant="outlined"
            endIcon={<ExpandDownIcon />}
            onClick={(e) => setCreateMenuAnchor(e.currentTarget)}
            sx={{ whiteSpace: "nowrap" }}
          >
            Create
          </Button>
          <Menu
            anchorEl={createMenuAnchor}
            open={Boolean(createMenuAnchor)}
            onClose={() => setCreateMenuAnchor(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <MenuItem onClick={() => { setCreateMenuAnchor(null); setNewFolderDialogOpen(true); }}>
              <ListItemIcon><AddFolderIcon /></ListItemIcon>
              <ListItemText>New folder</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => setCreateMenuAnchor(null)}>
              <ListItemIcon><AddFileIcon /></ListItemIcon>
              <ListItemText>New document</ListItemText>
            </MenuItem>
          </Menu>
          <Button
            variant="contained"
            startIcon={<UploadIcon />}
            onClick={() => setUploadDialogOpen(true)}
            sx={{ whiteSpace: "nowrap" }}
          >
            Upload
          </Button>
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
          <ListItemIcon><TrashIcon style={{ fontSize: 20 }} /></ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

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
