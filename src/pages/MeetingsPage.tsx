import { PageHeader } from "@diligentcorp/atlas-react-bundle";
import AddIcon from "@diligentcorp/atlas-react-bundle/icons/Add";
import AgendaIcon from "@diligentcorp/atlas-react-bundle/icons/Agenda";
import ClockIcon from "@diligentcorp/atlas-react-bundle/icons/Clock";
import ExpandDownIcon from "@diligentcorp/atlas-react-bundle/icons/ExpandDown";
import LocationIcon from "@diligentcorp/atlas-react-bundle/icons/Location";
import PageIcon from "@diligentcorp/atlas-react-bundle/icons/Page";
import SortIcon from "@diligentcorp/atlas-react-bundle/icons/Sort";
import CalendarIcon from "@diligentcorp/atlas-react-bundle/icons/Calendar";
import GroupIcon from "@diligentcorp/atlas-react-bundle/icons/Group";
import CloseIcon from "@diligentcorp/atlas-react-bundle/icons/Close";
import CheckCircleLiteIcon from "@diligentcorp/atlas-react-bundle/icons/CheckCircleLite";
import FilterListIcon from "@diligentcorp/atlas-react-bundle/icons/FilterList";
import SearchIcon from "@diligentcorp/atlas-react-bundle/icons/Search";
import VisibleIcon from "@diligentcorp/atlas-react-bundle/icons/Visible";
import ArchiveIcon from "@diligentcorp/atlas-react-bundle/icons/Archive";
import CopyIcon from "@diligentcorp/atlas-react-bundle/icons/Copy";
import UnarchiveIcon from "@diligentcorp/atlas-react-bundle/icons/Unarchive";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  ListItemIcon,
  Menu,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format } from "date-fns";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

import PageLayout from "../components/PageLayout.js";
import MeetingDetailView from "../components/meetings/MeetingDetailView";
import MeetingRowActions from "../components/meetings/MeetingRowActions";
import TemplatePickerDialog, { type NewMeetingResult } from "../components/meetings/TemplatePickerDialog";
import CommitteePickerDialog from "../components/meetings/CommitteePickerDialog";
import DuplicateMeetingDialog from "../components/meetings/DuplicateMeetingDialog";
import ConfirmDialog from "../components/meetings/ConfirmDialog";
import StatusChip from "../components/meetings/StatusChip";
import type {
  Meeting,
  MeetingStatus,
  MeetingTab,
  MeetingTemplate,
  MeetingVisibility,
} from "../types/meetings";
import { formatDateLong, getDayOfMonth, getMonthAbbrev, getYear, isUpcoming } from "../utils/meetings";
import meetingsData from "../data/meetings.json";

export default function MeetingsPage() {
  const { presets, tokens } = useTheme();
  const dividerColor = tokens?.component?.divider?.colors?.default?.borderColor?.value ?? "#E0E0E0";
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { meetings: seedMeetings, templates: seedTemplates, committees } = meetingsData as {
    meetings: Meeting[];
    templates: MeetingTemplate[];
    committees: string[];
  };
  const [meetings, setMeetings] = useState<Meeting[]>(seedMeetings);
  const [templates, setTemplates] = useState<MeetingTemplate[]>(seedTemplates);
  const activeTab: MeetingTab = (searchParams.get("tab") as MeetingTab | null) ?? "upcoming";
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("date-asc");
  const [committeeFilter, setCommitteeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<MeetingStatus | "All">("All");
  const [visibilityFilter, setVisibilityFilter] = useState<MeetingVisibility | "All">("All");
  const [startDateFilter, setStartDateFilter] = useState<Date | null>(null);
  const [endDateFilter, setEndDateFilter] = useState<Date | null>(null);
  type PendingAction =
    | { type: "make-active" | "make-draft" | "publish-to-site" | "remove-from-site" | "delete"; meeting: Meeting };
  type FilterType = "date" | "status" | "visibility" | "committee";
  const allFilterTypes: FilterType[] = ["date", "status", "visibility", "committee"];
  const [filterRowVisible, setFilterRowVisible] = useState(false);
  const [filterConfigAnchor, setFilterConfigAnchor] = useState<{ el: HTMLElement; type: FilterType } | null>(null);
  type TemplateFilterType = "status" | "committee";
  const allTemplateFilterTypes: TemplateFilterType[] = ["status", "committee"];
  const [templateCommitteeFilter, setTemplateCommitteeFilter] = useState("");
  const [templateStatusFilter, setTemplateStatusFilter] = useState<"All" | "Active" | "Archived">("Active");
  const [templateFilterConfigAnchor, setTemplateFilterConfigAnchor] = useState<{ el: HTMLElement; type: TemplateFilterType } | null>(null);

  const filterMeta: Record<FilterType, { label: string; icon: React.ReactNode }> = {
    date: { label: "Meeting date", icon: <CalendarIcon /> },
    status: { label: "Status", icon: <CheckCircleLiteIcon /> },
    visibility: { label: "Visibility", icon: <VisibleIcon /> },
    committee: { label: "Committee", icon: <GroupIcon /> },
  };

  const isFilterActive = (type: FilterType) => {
    switch (type) {
      case "status": return statusFilter !== "All";
      case "visibility": return visibilityFilter !== "All";
      case "committee": return !!committeeFilter;
      case "date": return !!startDateFilter || !!endDateFilter;
    }
  };
  const anyFilterActive = allFilterTypes.some(isFilterActive);

  const clearFilter = (type: FilterType) => {
    if (type === "status") setStatusFilter("All");
    if (type === "visibility") setVisibilityFilter("All");
    if (type === "committee") setCommitteeFilter("");
    if (type === "date") { setStartDateFilter(null); setEndDateFilter(null); }
  };

  const clearAllFilters = () => {
    setStatusFilter("All");
    setVisibilityFilter("All");
    setCommitteeFilter("");
    setStartDateFilter(null);
    setEndDateFilter(null);
  };

  const templateFilterMeta: Record<TemplateFilterType, { label: string; icon: React.ReactNode }> = {
    status: { label: "Status", icon: <CheckCircleLiteIcon /> },
    committee: { label: "Committee", icon: <GroupIcon /> },
  };

  const isTemplateFilterActive = (type: TemplateFilterType) => {
    switch (type) {
      case "status": return templateStatusFilter !== "All";
      case "committee": return !!templateCommitteeFilter;
    }
  };
  const anyTemplateFilterActive = allTemplateFilterTypes.some(isTemplateFilterActive);

  const clearTemplateFilter = (type: TemplateFilterType) => {
    if (type === "status") setTemplateStatusFilter("All");
    if (type === "committee") setTemplateCommitteeFilter("");
  };

  const clearAllTemplateFilters = () => {
    setTemplateStatusFilter("All");
    setTemplateCommitteeFilter("");
  };

  const getActiveFilterLabel = (type: FilterType): string => {
    switch (type) {
      case "status": return statusFilter;
      case "visibility": return visibilityFilter;
      case "committee": return committeeFilter;
      case "date": {
        if (startDateFilter && endDateFilter)
          return `${format(startDateFilter, "MMM d, yyyy")} – ${format(endDateFilter, "MMM d, yyyy")}`;
        if (startDateFilter) return `After ${format(startDateFilter, "MMM d, yyyy")}`;
        return `Before ${format(endDateFilter!, "MMM d, yyyy")}`;
      }
    }
  };

  const getActiveTemplateFilterLabel = (type: TemplateFilterType): string => {
    switch (type) {
      case "status": return templateStatusFilter;
      case "committee": return templateCommitteeFilter;
    }
  };

  const [newMenuAnchor, setNewMenuAnchor] = useState<null | HTMLElement>(null);
  const [sortMenuAnchor, setSortMenuAnchor] = useState<null | HTMLElement>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newTemplateDialogOpen, setNewTemplateDialogOpen] = useState(false);
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [duplicateSource, setDuplicateSource] = useState<Meeting | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [detailView, setDetailView] = useState<Meeting | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) {
      const timer = setTimeout(() => searchInputRef.current?.focus(), 260);
      return () => clearTimeout(timer);
    }
  }, [searchOpen]);

  useEffect(() => {
    setSearch("");
    setSearchOpen(false);
  }, [activeTab]);

  const filteredMeetings = useMemo(() => {
    return meetings
      .filter((meeting) =>
        !search ? true : meeting.name.toLowerCase().includes(search.toLowerCase()),
      )
      .filter((meeting) => (statusFilter === "All" ? true : meeting.status === statusFilter))
      .filter((meeting) =>
        visibilityFilter === "All" ? true : meeting.visibility === visibilityFilter,
      )
      .filter((meeting) => (!committeeFilter ? true : meeting.committee === committeeFilter))
      .filter((meeting) => (!startDateFilter ? true : meeting.date >= startDateFilter.toISOString().slice(0, 10)))
      .filter((meeting) => (!endDateFilter ? true : meeting.date <= endDateFilter.toISOString().slice(0, 10)));
  }, [meetings, search, statusFilter, visibilityFilter, committeeFilter, startDateFilter, endDateFilter]);

  const sortedMeetings = useMemo(() => {
    const next = [...filteredMeetings];
    next.sort((a, b) =>
      sortBy === "date-desc" ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date),
    );
    return next;
  }, [filteredMeetings, sortBy]);

  const upcomingMeetings = sortedMeetings.filter((meeting) => isUpcoming(meeting.date));
  const previousMeetings = sortedMeetings.filter((meeting) => !isUpcoming(meeting.date));
  const previousYears = Array.from(new Set(previousMeetings.map((meeting) => getYear(meeting.date)))).sort(
    (a, b) => b - a,
  );

  const visibleTemplates = useMemo(() => templates
    .filter((t) => !search ? true : t.name.toLowerCase().includes(search.toLowerCase()))
    .filter((t) => templateStatusFilter === "All" ? true : t.status === templateStatusFilter)
    .filter((t) => !templateCommitteeFilter ? true : t.committee === templateCommitteeFilter),
  [templates, search, templateStatusFilter, templateCommitteeFilter]);
  if (detailView) {
    return (
      <MeetingDetailView
        meeting={detailView}
        onBack={() => setDetailView(null)}
        onUpdate={(updated) => {
          setMeetings((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
          setDetailView(updated);
        }}
      />
    );
  }


  return (
    <PageLayout id="page-meetings">
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center" }}>
        <PageHeader pageTitle="Meetings" />
        <Stack direction="row" gap={1} alignItems="center">
          {activeTab !== "templates" && (
            <Button
              variant="outlined"
              size="medium"
              startIcon={<CalendarIcon />}
              sx={{ whiteSpace: "nowrap" }}
              onClick={() => navigate("/meetings/calendar")}
            >
              Open calendar
            </Button>
          )}
          <Button
            variant="contained"
            size="medium"
            startIcon={<AddIcon />}
            endIcon={<ExpandDownIcon />}
            onClick={(e) => setNewMenuAnchor(e.currentTarget)}
            sx={{ whiteSpace: "nowrap" }}
          >
            New
          </Button>
          <Menu
            anchorEl={newMenuAnchor}
            open={Boolean(newMenuAnchor)}
            onClose={() => setNewMenuAnchor(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <MenuItem onClick={() => { setNewMenuAnchor(null); setCreateDialogOpen(true); }}>
              <ListItemIcon><CalendarIcon /></ListItemIcon>
              New meeting
            </MenuItem>
            <Box sx={{ borderBottom: `1px solid ${tokens?.component?.divider?.colors?.default?.borderColor?.value}` }} />
            <MenuItem onClick={() => { setNewMenuAnchor(null); setNewTemplateDialogOpen(true); }}>
              <ListItemIcon><AgendaIcon /></ListItemIcon>
              New template
            </MenuItem>
          </Menu>
        </Stack>
      </Box>

      {/* Tabs + inline icon buttons */}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-end",
          borderBottom: `1px solid ${tokens?.component?.divider?.colors?.default?.borderColor?.value}`,
          mt: -1,
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, value) => navigate(`/meetings?tab=${value}`, { replace: true })}
          sx={{
            flex: 1,
            "& .MuiTab-root:not(.Mui-selected)::after": { display: "none" },
            ...presets?.TabsPresets?.Tabs?.alignToPageHeader?.sx,
          }}
        >
          <Tab label="Upcoming" value="upcoming" />
          <Tab label="Previous" value="previous" />
          <Tab label="Templates" value="templates" />
        </Tabs>

        <Stack direction="row" alignItems="center" sx={{ pb: "4px", gap: "8px" }}>
          <IconButton
            size="medium"
            onClick={() => setFilterRowVisible((v) => !v)}
            color="tertiary"
            sx={{
              ...(filterRowVisible && {
                bgcolor: "var(--lens-component-button-tertiary-hover-background)",
                "&:hover": { bgcolor: "var(--lens-component-button-tertiary-hover-background)" },
              }),
              ...((activeTab === "templates" ? anyTemplateFilterActive : anyFilterActive) && { "& svg": { color: "#0040d5" } }),
            }}
          >
            <FilterListIcon />
          </IconButton>
          {activeTab !== "templates" && (
            <IconButton
              size="medium"
              onClick={(e) => setSortMenuAnchor(e.currentTarget)}
              color="tertiary"
            >
              <SortIcon />
            </IconButton>
          )}
          <Box sx={{
            width: searchOpen ? 0 : 40,
            overflow: "hidden",
            opacity: searchOpen ? 0 : 1,
            flexShrink: 0,
            transition: "width 250ms cubic-bezier(0.4, 0, 0.2, 1), opacity 150ms ease",
          }}>
            <IconButton
              size="medium"
              onClick={() => setSearchOpen(true)}
              color="tertiary"
              tabIndex={searchOpen ? -1 : 0}
            >
              <SearchIcon />
            </IconButton>
          </Box>
          <Box sx={{
            width: searchOpen ? 220 : 0,
            overflow: "hidden",
            opacity: searchOpen ? 1 : 0,
            flexShrink: 0,
            transition: "width 250ms cubic-bezier(0.4, 0, 0.2, 1), opacity 200ms ease 50ms",
          }}>
            <TextField
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={activeTab === "templates" ? "Search templates" : "Search meetings"}
              size="small"
              sx={{
                width: 220,
                "& .MuiOutlinedInput-root": {
                  background: "transparent",
                  boxShadow: "none !important",
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
            <MenuItem selected={sortBy === "date-asc"} onClick={() => { setSortBy("date-asc"); setSortMenuAnchor(null); }}>
              Sort by date ascending
            </MenuItem>
            <MenuItem selected={sortBy === "date-desc"} onClick={() => { setSortBy("date-desc"); setSortMenuAnchor(null); }}>
              Sort by date descending
            </MenuItem>
          </Menu>
        </Stack>
      </Box>

      <Box sx={{ display: "flex", alignItems: "flex-start", mt: "-12px" }} id="meetings-content">
        <Box sx={{ flex: 1, minWidth: 0 }}>

          {/* Filter chips row */}
          {filterRowVisible && activeTab === "templates" && (
            <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1, mb: 1 }}>
              {allTemplateFilterTypes.map((type) => {
                const { label, icon } = templateFilterMeta[type];
                const active = isTemplateFilterActive(type);
                return (
                  <Box
                    key={type}
                    data-filter-chip={`tpl-${type}`}
                    onClick={(e) => { setTemplateFilterConfigAnchor({ el: e.currentTarget, type }); }}
                    sx={{
                      display: "inline-flex", alignItems: "center", height: 24,
                      border: active ? "none" : "1px solid #e2e2e5",
                      bgcolor: active ? "#ecf0ff" : "transparent",
                      borderRadius: "9999px", pl: "2px", pr: "2px",
                      overflow: "hidden", cursor: "pointer", "&:hover": { opacity: 0.85 },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: 24, height: 24, flexShrink: 0, color: active ? "#0040d5" : "#242628", "& svg": { width: 16, height: 16, display: "block" } }}>
                      {icon}
                    </Box>
                    <Typography sx={{ px: "4px", fontSize: 12, fontWeight: 400, lineHeight: "16px", letterSpacing: "0.3px", color: active ? "#0040d5" : "#242628", whiteSpace: "nowrap", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      {active ? getActiveTemplateFilterLabel(type) : label}
                    </Typography>
                    <Box
                      sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: 20, height: 20, mr: "2px", flexShrink: 0, color: active ? "#0040d5" : "var(--lens-semantic-color-type-muted)", borderRadius: "50%", "&:hover": { bgcolor: active ? "rgba(0,64,213,0.12)" : "rgba(0,0,0,0.06)" } }}
                      onClick={(e) => { e.stopPropagation(); if (active) { clearTemplateFilter(type); } else { setTemplateFilterConfigAnchor({ el: (e.currentTarget.closest("[data-filter-chip]") as HTMLElement) ?? e.currentTarget, type }); } }}
                    >
                      {active ? <CloseIcon sx={{ fontSize: 16 }} /> : <ExpandDownIcon sx={{ fontSize: 16 }} />}
                    </Box>
                  </Box>
                );
              })}
              <Button variant="text" size="small" onClick={clearAllTemplateFilters} sx={{ visibility: anyTemplateFilterActive ? "visible" : "hidden" }}>
                Clear filters
              </Button>
            </Box>
          )}
          {filterRowVisible && activeTab !== "templates" && (
            <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1, mb: 1 }}>
              {allFilterTypes.map((type) => {
                const { label, icon } = filterMeta[type];
                const active = isFilterActive(type);
                return (
                  <Box
                    key={type}
                    data-filter-chip={type}
                    onClick={(e) => {
                      setFilterConfigAnchor({ el: e.currentTarget, type });
                    }}
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      height: 24,
                      border: active ? "none" : "1px solid #e2e2e5",
                      bgcolor: active ? "#ecf0ff" : "transparent",
                      borderRadius: "9999px",
                      pl: "2px",
                      pr: "2px",
                      overflow: "hidden",
                      cursor: "pointer",
                      "&:hover": { opacity: 0.85 },
                    }}
                  >
                    <Box sx={{
                      display: "flex", alignItems: "center", justifyContent: "center",
                      width: 24, height: 24, flexShrink: 0,
                      color: active ? "#0040d5" : "#242628",
                      "& svg": { width: 16, height: 16, display: "block" },
                    }}>
                      {icon}
                    </Box>
                    <Typography sx={{
                      px: "4px", fontSize: 12, fontWeight: 400,
                      lineHeight: "16px", letterSpacing: "0.3px",
                      color: active ? "#0040d5" : "#242628",
                      whiteSpace: "nowrap",
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}>
                      {active ? getActiveFilterLabel(type) : label}
                    </Typography>
                    {/* Trailing: X to clear (active) or chevron to open (inactive) */}
                    <Box
                      sx={{
                        display: "flex", alignItems: "center", justifyContent: "center",
                        width: 20, height: 20, mr: "2px", flexShrink: 0,
                        color: active ? "#0040d5" : "var(--lens-semantic-color-type-muted)",
                        borderRadius: "50%",
                        "&:hover": { bgcolor: active ? "rgba(0,64,213,0.12)" : "rgba(0,0,0,0.06)" },
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (active) {
                          clearFilter(type);
                        } else {
                          setFilterConfigAnchor({ el: (e.currentTarget.closest("[data-filter-chip]") as HTMLElement) ?? e.currentTarget, type });
                        }
                      }}
                    >
                      {active
                        ? <CloseIcon sx={{ fontSize: 16 }} />
                        : <ExpandDownIcon sx={{ fontSize: 16 }} />
                      }
                    </Box>
                  </Box>
                );
              })}
              <Button
                variant="text"
                size="small"
                onClick={clearAllFilters}
                sx={{ visibility: anyFilterActive ? "visible" : "hidden" }}
              >
                Clear filters
              </Button>
            </Box>
          )}

          {/* Filter config popover */}
          <Menu
            anchorEl={filterConfigAnchor?.el}
            open={Boolean(filterConfigAnchor)}
            onClose={() => setFilterConfigAnchor(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            transformOrigin={{ vertical: "top", horizontal: "left" }}
            slotProps={{ paper: { sx: { minWidth: 200 } } }}
          >
            {filterConfigAnchor?.type === "status" && [
              <MenuItem key="draft" selected={statusFilter === "Draft"} onClick={() => { setStatusFilter("Draft"); setFilterConfigAnchor(null); }}>Draft</MenuItem>,
              <MenuItem key="active" selected={statusFilter === "Active"} onClick={() => { setStatusFilter("Active"); setFilterConfigAnchor(null); }}>Active</MenuItem>,
            ]}
            {filterConfigAnchor?.type === "visibility" && [
              <MenuItem key="internal" selected={visibilityFilter === "Internal"} onClick={() => { setVisibilityFilter("Internal"); setFilterConfigAnchor(null); }}>Internal</MenuItem>,
              <MenuItem key="public" selected={visibilityFilter === "Public"} onClick={() => { setVisibilityFilter("Public"); setFilterConfigAnchor(null); }}>Public</MenuItem>,
            ]}
            {filterConfigAnchor?.type === "committee" && committees.map((c) => (
              <MenuItem key={c} selected={committeeFilter === c} onClick={() => { setCommitteeFilter(c); setFilterConfigAnchor(null); }}>{c}</MenuItem>
            ))}
            {filterConfigAnchor?.type === "date" && (
              <Box sx={{ p: 2 }}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <Stack spacing={2}>
                    <Stack spacing={0.5}>
                      <Typography variant="body2" sx={{ fontSize: 12, fontWeight: 600 }}>After</Typography>
                      <DatePicker value={startDateFilter} onChange={(v) => setStartDateFilter(v)} slotProps={{ textField: { size: "small" } }} />
                    </Stack>
                    <Stack spacing={0.5}>
                      <Typography variant="body2" sx={{ fontSize: 12, fontWeight: 600 }}>Before</Typography>
                      <DatePicker value={endDateFilter} onChange={(v) => setEndDateFilter(v)} slotProps={{ textField: { size: "small" } }} />
                    </Stack>
                    <Button size="small" variant="outlined" onClick={() => setFilterConfigAnchor(null)}>Apply</Button>
                  </Stack>
                </LocalizationProvider>
              </Box>
            )}
          </Menu>

          {/* Template filter config popover */}
          <Menu
            anchorEl={templateFilterConfigAnchor?.el}
            open={Boolean(templateFilterConfigAnchor)}
            onClose={() => setTemplateFilterConfigAnchor(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            transformOrigin={{ vertical: "top", horizontal: "left" }}
            slotProps={{ paper: { sx: { minWidth: 200 } } }}
          >
            {templateFilterConfigAnchor?.type === "status" && [
              <MenuItem key="all" selected={templateStatusFilter === "All"} onClick={() => { setTemplateStatusFilter("All"); setTemplateFilterConfigAnchor(null); }}>All</MenuItem>,
              <MenuItem key="active" selected={templateStatusFilter === "Active"} onClick={() => { setTemplateStatusFilter("Active"); setTemplateFilterConfigAnchor(null); }}>Active</MenuItem>,
              <MenuItem key="archived" selected={templateStatusFilter === "Archived"} onClick={() => { setTemplateStatusFilter("Archived"); setTemplateFilterConfigAnchor(null); }}>Archived</MenuItem>,
            ]}
            {templateFilterConfigAnchor?.type === "committee" && committees.map((c) => (
              <MenuItem key={c} selected={templateCommitteeFilter === c} onClick={() => { setTemplateCommitteeFilter(c); setTemplateFilterConfigAnchor(null); }}>{c}</MenuItem>
            ))}
          </Menu>

          {/* Upcoming tab */}
          {activeTab === "upcoming" && (
            upcomingMeetings.length === 0 ? (
              <Alert severity="info" sx={{ mt: 2 }}>No upcoming meetings</Alert>
            ) : (
              <Stack id="meetings-upcoming-list" gap="12px" sx={{ mt: 1.5 }}>
                {upcomingMeetings.map((meeting) => (
                  <Box
                    key={meeting.id}
                    id={`meeting-row-${meeting.id}`}
                    sx={{ border: `1px solid ${dividerColor}`, borderRadius: "12px", backgroundColor: "white", p: 1.5, display: "flex", alignItems: "center", gap: 3 }}
                  >
                    <Stack direction="row" alignItems="center" gap="12px" sx={{ width: 300, flexShrink: 0 }}>
                      <Box sx={{ width: 50, height: 50, flexShrink: 0, bgcolor: "#E4F3FF", borderRadius: "12px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", color: "var(--lens-semantic-color-type-default)" }}>
                        <Typography sx={{ fontSize: 12, fontWeight: 400, lineHeight: "16px", letterSpacing: "0.3px", display: "block", width: "100%" }}>{getMonthAbbrev(meeting.date)}</Typography>
                        <Typography sx={{ fontSize: 14, fontWeight: 600, lineHeight: "20px", letterSpacing: "0.2px", display: "block", width: "100%" }}>{getDayOfMonth(meeting.date)}</Typography>
                      </Box>
                      <Typography variant="subtitle2" onClick={() => setDetailView(meeting)} sx={{ cursor: "pointer", minWidth: 0, whiteSpace: "normal", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", "&:hover": { textDecoration: "underline" } }}>
                        {meeting.name}
                      </Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" gap="4px" sx={{ width: 240, flexShrink: 0 }}>
                      <Box sx={{ display: "flex", alignItems: "center", width: 20, height: 20, color: "var(--lens-semantic-color-type-muted)", flexShrink: 0 }}><CalendarIcon /></Box>
                      <Typography sx={{ fontSize: 12, color: "var(--lens-semantic-color-type-muted)", whiteSpace: "nowrap" }}>
                        {formatDateLong(meeting.date)} · {meeting.time ?? "Time TBD"}
                      </Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" gap="4px" sx={{ width: 160, flexShrink: 0 }}>
                      <Box sx={{ display: "flex", alignItems: "center", width: 20, height: 20, color: "var(--lens-semantic-color-type-muted)", flexShrink: 0 }}><GroupIcon /></Box>
                      <Typography sx={{ fontSize: 12, color: "var(--lens-semantic-color-type-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{meeting.committee}</Typography>
                    </Stack>
                    <Box sx={{ width: 90, flexShrink: 0 }}>
                      {meeting.status === "Draft" ? <StatusChip label="Draft" /> : <StatusChip label={meeting.visibility} />}
                    </Box>
                    <MeetingRowActions
                      status={meeting.status}
                      visibility={meeting.visibility}
                      onMakeActive={() => setPendingAction({ type: "make-active", meeting })}
                      onMakeDraft={() => setPendingAction({ type: "make-draft", meeting })}
                      onToggleVisibility={() => setPendingAction({ type: meeting.visibility === "Internal" ? "publish-to-site" : "remove-from-site", meeting })}
                      onDuplicate={() => { setDuplicateSource(meeting); setDuplicateDialogOpen(true); }}
                      onDelete={() => setPendingAction({ type: "delete", meeting })}
                    />
                  </Box>
                ))}
              </Stack>
            )
          )}

          {/* Previous tab */}
          {activeTab === "previous" && (
            <Stack gap={2} id="meetings-previous-accordion" sx={{ mt: 2 }}>
              {previousYears.map((year, index) => {
                const yearMeetings = previousMeetings.filter((meeting) => getYear(meeting.date) === year);
                return (
                  <Accordion key={year} defaultExpanded={index === 0} id={`meetings-year-${year}`} sx={{ "&::before": { display: "none" } }}>
                    <AccordionSummary>
                      <Typography variant="subtitle2">
                        {year}{" "}
                        <Box component="span" sx={{ fontWeight: 400 }}>({yearMeetings.length})</Box>
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ px: 2, pb: 2, pt: 0 }}>
                      <Stack id={`meetings-year-${year}-list`} gap="12px">
                        {yearMeetings.map((meeting) => (
                          <Box
                            key={meeting.id}
                            id={`meeting-row-${meeting.id}`}
                            sx={{ border: `1px solid ${dividerColor}`, borderRadius: "12px", backgroundColor: "white", p: 1.5, display: "flex", alignItems: "center", gap: 3 }}
                          >
                            <Stack direction="row" alignItems="center" gap="12px" sx={{ width: 300, flexShrink: 0 }}>
                              <Box sx={{ width: 50, height: 50, flexShrink: 0, bgcolor: "#E4F3FF", borderRadius: "12px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", color: "var(--lens-semantic-color-type-default)" }}>
                                <Typography sx={{ fontSize: 12, fontWeight: 400, lineHeight: "16px", letterSpacing: "0.3px", display: "block", width: "100%" }}>{getMonthAbbrev(meeting.date)}</Typography>
                                <Typography sx={{ fontSize: 14, fontWeight: 600, lineHeight: "20px", letterSpacing: "0.2px", display: "block", width: "100%" }}>{getDayOfMonth(meeting.date)}</Typography>
                              </Box>
                              <Typography variant="subtitle2" onClick={() => setDetailView(meeting)} sx={{ cursor: "pointer", minWidth: 0, whiteSpace: "normal", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", "&:hover": { textDecoration: "underline" } }}>
                                {meeting.name}
                              </Typography>
                            </Stack>
                            <Stack direction="row" alignItems="center" gap="4px" sx={{ width: 240, flexShrink: 0 }}>
                              <Box sx={{ display: "flex", alignItems: "center", width: 20, height: 20, color: "var(--lens-semantic-color-type-muted)", flexShrink: 0 }}><CalendarIcon /></Box>
                              <Typography sx={{ fontSize: 12, color: "var(--lens-semantic-color-type-muted)", whiteSpace: "nowrap" }}>
                                {formatDateLong(meeting.date)} · {meeting.time ?? "Time TBD"}
                              </Typography>
                            </Stack>
                            <Stack direction="row" alignItems="center" gap="4px" sx={{ flexShrink: 0, minWidth: 150 }}>
                              <Box sx={{ display: "flex", alignItems: "center", width: 20, height: 20, color: "var(--lens-semantic-color-type-muted)", flexShrink: 0 }}><GroupIcon /></Box>
                              <Typography sx={{ fontSize: 12, color: "var(--lens-semantic-color-type-muted)" }}>{meeting.committee}</Typography>
                            </Stack>
                            <Box sx={{ width: 90, flexShrink: 0 }}>
                              {meeting.status === "Draft" ? <StatusChip label="Draft" /> : <StatusChip label={meeting.visibility} />}
                            </Box>
                            <MeetingRowActions
                              status={meeting.status}
                              visibility={meeting.visibility}
                              onMakeActive={() => setMeetings((prev) => prev.map((m) => (m.id === meeting.id ? { ...m, status: "Active" as const } : m)))}
                              onMakeDraft={() => setMeetings((prev) => prev.map((m) => (m.id === meeting.id ? { ...m, status: "Draft" as const } : m)))}
                              onToggleVisibility={() => setPendingAction({ type: meeting.visibility === "Internal" ? "publish-to-site" : "remove-from-site", meeting })}
                              onDuplicate={() => { setDuplicateSource(meeting); setDuplicateDialogOpen(true); }}
                              onDelete={() => setPendingAction({ type: "delete", meeting })}
                            />
                          </Box>
                        ))}
                      </Stack>
                    </AccordionDetails>
                  </Accordion>
                );
              })}
            </Stack>
          )}

        {activeTab === "templates" && (
          <Table
            id="meetings-templates-table"
            sx={{
              "& .MuiTableBody-root .MuiTableRow-root:last-child .MuiTableCell-root": { borderBottom: 0 },
              "& .MuiTableRow-root": { background: "transparent" },
            }}
          >
            <TableBody>
              {visibleTemplates.map((template) => (
                <TableRow key={template.id} id={`template-row-${template.id}`}>
                  <TableCell sx={{ pl: 0, width: 368, minWidth: 280, maxWidth: 368 }}>
                    <Stack direction="row" alignItems="center" gap="12px">
                      <Box sx={{ width: 50, height: 50, flexShrink: 0, bgcolor: "#E4F3FF", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--lens-semantic-color-type-default)" }}>
                        <PageIcon sx={{ width: 24, height: 24 }} />
                      </Box>
                      <Stack direction="row" alignItems="center" gap={1} minWidth={0}>
                        <Typography
                          variant="subtitle2"
                          onClick={() => navigate(`/meetings/templates/${template.id}`, { state: { template } })}
                          sx={{ cursor: "pointer", minWidth: 0, whiteSpace: "normal", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", "&:hover": { textDecoration: "underline" } }}
                        >
                          {template.name}
                        </Typography>
                        {template.status === "Archived" && <StatusChip label="Archived" />}
                      </Stack>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center" gap="4px">
                      <Box sx={{ display: "flex", alignItems: "center", width: 20, height: 20, color: "var(--lens-semantic-color-type-muted)", flexShrink: 0 }}><GroupIcon /></Box>
                      <Typography sx={{ fontSize: 12, color: "var(--lens-semantic-color-type-muted)" }}>{template.committee}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center" gap="4px">
                      <Box sx={{ display: "flex", alignItems: "center", width: 20, height: 20, color: "var(--lens-semantic-color-type-muted)", flexShrink: 0 }}><ClockIcon /></Box>
                      <Typography sx={{ fontSize: 12, color: "var(--lens-semantic-color-type-muted)" }}>{template.time ?? "—"}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center" gap="4px">
                      <Box sx={{ display: "flex", alignItems: "center", width: 20, height: 20, color: "var(--lens-semantic-color-type-muted)", flexShrink: 0 }}><LocationIcon /></Box>
                      <Typography sx={{ fontSize: 12, color: "var(--lens-semantic-color-type-muted)" }}>{template.location ?? "—"}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell align="right" sx={{ pr: 0 }}>
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                      <Tooltip title="Duplicate">
                        <IconButton size="medium" aria-label="Duplicate template">
                          <CopyIcon />
                        </IconButton>
                      </Tooltip>
                      {template.status === "Archived" ? (
                        <Tooltip title="Unarchive">
                          <IconButton
                            size="medium"
                            aria-label="Unarchive template"
                            onClick={() => setTemplates((prev) => prev.map((t) => t.id === template.id ? { ...t, status: "Active" as const } : t))}
                          >
                            <UnarchiveIcon />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Archive">
                          <IconButton
                            size="medium"
                            aria-label="Archive template"
                            onClick={() => setTemplates((prev) => prev.map((t) => t.id === template.id ? { ...t, status: "Archived" as const } : t))}
                          >
                            <ArchiveIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
          </Box>

        </Box>

      <CommitteePickerDialog
        open={newTemplateDialogOpen}
        committees={committees}
        onClose={() => setNewTemplateDialogOpen(false)}
        onSelect={(committee) => {
          setNewTemplateDialogOpen(false);
          const newTemplate: MeetingTemplate = {
            id: `t-new-${Date.now()}`,
            name: "Untitled template",
            committee,
            status: "Active",
            meetingsCreated: 0,
          };
          navigate(`/meetings/templates/${newTemplate.id}`, { state: { template: newTemplate } });
        }}
      />
      <TemplatePickerDialog
        open={createDialogOpen}
        templates={templates}
        meetings={meetings}
        committees={committees}
        onClose={() => setCreateDialogOpen(false)}
        onSelect={(result: NewMeetingResult) => {
          setCreateDialogOpen(false);
          const today = new Date().toISOString().slice(0, 10);
          let newMeeting: Meeting;
          if (result.type === "template") {
            const tpl = templates.find((t) => t.id === result.templateId)!;
            newMeeting = {
              id: `m-new-${Date.now()}`,
              name: tpl.name,
              date: today,
              time: tpl.time,
              location: tpl.location,
              committee: tpl.committee,
              status: "Draft",
              visibility: "Internal",
              agendaStatus: "Not published",
              agendaCategories: 2,
              agendaItems: 5,
              membersOnly: false,
              publicRTS: false,
            };
          } else if (result.type === "duplicate") {
            const src = result.meeting;
            newMeeting = {
              ...src,
              id: `m-new-${Date.now()}`,
              name: `Copy of ${src.name}`,
              date: today,
              status: "Draft",
              visibility: "Internal",
            };
          } else {
            newMeeting = {
              id: `m-new-${Date.now()}`,
              name: "New meeting",
              date: today,
              committee: result.committee,
              status: "Draft",
              visibility: "Internal",
              agendaStatus: "Not published",
              agendaCategories: 0,
              agendaItems: 0,
              membersOnly: false,
              publicRTS: false,
            };
          }
          setMeetings((prev) => [newMeeting, ...prev]);
          setDetailView(newMeeting);
        }}
      />
      <DuplicateMeetingDialog
        open={duplicateDialogOpen}
        meeting={duplicateSource}
        committees={committees}
        onClose={() => { setDuplicateDialogOpen(false); setDuplicateSource(null); }}
        onDuplicate={(meeting) => setMeetings((prev) => [meeting, ...prev])}
      />
      <ConfirmDialog
        open={Boolean(pendingAction)}
        title={
          pendingAction?.type === 'make-active' ? 'Make active?' :
          pendingAction?.type === 'make-draft' ? 'Make draft?' :
          pendingAction?.type === 'publish-to-site' ? 'Publish to site?' :
          pendingAction?.type === 'remove-from-site' ? 'Remove from site?' :
          'Delete meeting'
        }
        message={
          !pendingAction ? '' :
          pendingAction.type === 'make-active' ? `Make "${pendingAction.meeting.name}" active? It will be visible to internal users.` :
          pendingAction.type === 'make-draft' ? `Move "${pendingAction.meeting.name}" back to draft? It will no longer be visible.` :
          pendingAction.type === 'publish-to-site' ? 'This meeting, including its agenda and any released minutes, will be visible to anyone on the public site.' :
          pendingAction.type === 'remove-from-site' ? 'This meeting, including its agenda and any released minutes, will no longer be visible on the public site. It will only be accessible to internal users.' :
          `Delete "${pendingAction.meeting.name}"? This action cannot be undone.`
        }
        confirmLabel={
          pendingAction?.type === 'make-active' ? 'Make active' :
          pendingAction?.type === 'make-draft' ? 'Make draft' :
          pendingAction?.type === 'publish-to-site' ? 'Publish to site' :
          pendingAction?.type === 'remove-from-site' ? 'Remove from site' :
          'Delete'
        }
        destructive={pendingAction?.type === "delete"}
        onConfirm={() => {
          if (!pendingAction) return;
          const { type, meeting } = pendingAction;
          if (type === 'make-active') {
            setMeetings((prev) => prev.map((m) => m.id === meeting.id ? { ...m, status: 'Active' as const, visibility: 'Internal' as const } : m));
          } else if (type === 'make-draft') {
            setMeetings((prev) => prev.map((m) => m.id === meeting.id ? { ...m, status: 'Draft' as const } : m));
          } else if (type === 'publish-to-site') {
            setMeetings((prev) => prev.map((m) => m.id === meeting.id ? { ...m, visibility: 'Public' as const } : m));
          } else if (type === 'remove-from-site') {
            setMeetings((prev) => prev.map((m) => m.id === meeting.id ? { ...m, visibility: 'Internal' as const } : m));
          } else if (type === 'delete') {
            setMeetings((prev) => prev.filter((m) => m.id !== meeting.id));
          }
          setPendingAction(null);
        }}
        onClose={() => setPendingAction(null)}
      />
    </PageLayout>
  );
}
