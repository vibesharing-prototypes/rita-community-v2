import { PageHeader } from "@diligentcorp/atlas-react-bundle";
import AddIcon from "@diligentcorp/atlas-react-bundle/icons/Add";
import CalendarIcon from "@diligentcorp/atlas-react-bundle/icons/Calendar";
import GroupIcon from "@diligentcorp/atlas-react-bundle/icons/Group";
import CloseIcon from "@diligentcorp/atlas-react-bundle/icons/Close";
import FilterIcon from "@diligentcorp/atlas-react-bundle/icons/Filter";
import SearchIcon from "@diligentcorp/atlas-react-bundle/icons/Search";
import ArchiveIcon from "@diligentcorp/atlas-react-bundle/icons/Archive";
import CopyIcon from "@diligentcorp/atlas-react-bundle/icons/Copy";
import UnarchiveIcon from "@diligentcorp/atlas-react-bundle/icons/Unarchive";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Badge,
  Box,
  Button,
  Divider,
  FormControl,
  FormLabel,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
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
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useTheme,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useMemo, useState } from "react";

import PageLayout from "../components/PageLayout.js";
import MeetingFormPage from "../components/meetings/MeetingFormPage";
import MeetingDetailView from "../components/meetings/MeetingDetailView";
import MeetingRowActions from "../components/meetings/MeetingRowActions";
import TemplatePickerDialog from "../components/meetings/TemplatePickerDialog";
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
import { formatDateLong, getYear, isUpcoming } from "../utils/meetings";
import meetingsData from "../data/meetings.json";

export default function MeetingsPage() {
  const { presets, tokens } = useTheme();
  const { meetings: seedMeetings, templates: seedTemplates, committees } = meetingsData as {
    meetings: Meeting[];
    templates: MeetingTemplate[];
    committees: string[];
  };
  const [meetings, setMeetings] = useState<Meeting[]>(seedMeetings);
  const [templates, setTemplates] = useState<MeetingTemplate[]>(seedTemplates);
  const [activeTab, setActiveTab] = useState<MeetingTab>("upcoming");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("date-asc");
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [committeeFilter, setCommitteeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<MeetingStatus | "All">("All");
  const [visibilityFilter, setVisibilityFilter] = useState<MeetingVisibility | "All">("All");
  const [startDateFilter, setStartDateFilter] = useState<Date | null>(null);
  const [endDateFilter, setEndDateFilter] = useState<Date | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  type PendingAction =
    | { type: "publish" | "unpublish" | "make-public" | "make-internal" | "delete"; meeting: Meeting };
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [duplicateSource, setDuplicateSource] = useState<Meeting | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [detailView, setDetailView] = useState<Meeting | null>(null);
  const [editView, setEditView] = useState<Meeting | null>(null);
  const [createTemplateId, setCreateTemplateId] = useState<string | null>(null);

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

  const visibleTemplates = showArchived ? templates : templates.filter((t) => t.status === "Active");

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

  if (editView || createTemplateId !== null) {
    const template = createTemplateId
      ? templates.find((t) => t.id === createTemplateId) ?? null
      : null;
    return (
      <MeetingFormPage
        mode={editView ? "edit" : "create"}
        meeting={editView ?? undefined}
        template={template}
        committees={committees}
        onBack={() => { setEditView(null); setCreateTemplateId(null); }}
        onSubmit={(meeting) => {
          if (editView) {
            setMeetings((prev) => prev.map((m) => (m.id === meeting.id ? meeting : m)));
          } else {
            setMeetings((prev) => [meeting, ...prev]);
          }
          setEditView(null);
          setCreateTemplateId(null);
          setDetailView(meeting);
        }}
      />
    );
  }

  return (
    <PageLayout id="page-meetings">
      <PageHeader pageTitle="Meetings" />

      <Tabs
        value={activeTab}
        onChange={(_, value) => setActiveTab(value)}
        sx={{
          "& .MuiTab-root:not(.Mui-selected)::after": { display: "none" },
          borderBottom: `1px solid ${tokens?.component?.divider?.colors?.default?.borderColor?.value}`,
          ...presets?.TabsPresets?.Tabs?.alignToPageHeader?.sx,
          mt: -1,
        }}
      >
        <Tab label="Upcoming" value="upcoming" />
        <Tab label="Previous" value="previous" />
        <Tab label="Templates" value="templates" />
      </Tabs>

      <Stack gap={2} id="meetings-content">
        <Box id="meetings-toolbar" sx={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", width: "100%" }}>
          <Stack direction="row" spacing={2} alignItems="flex-end">
            <FormControl sx={{ minWidth: 240 }}>
              <FormLabel>Search</FormLabel>
              <TextField
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search meetings"
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

            {activeTab !== "templates" && (
              <>
                <FormControl sx={{ minWidth: 240 }}>
                  <FormLabel>Sort by</FormLabel>
                  <Select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                    <MenuItem value="date-asc">Meeting date ascending</MenuItem>
                    <MenuItem value="date-desc">Meeting date descending</MenuItem>
                  </Select>
                </FormControl>
                <Button
                  variant="text"
                  startIcon={<FilterIcon />}
                  onClick={() => setFilterPanelOpen(true)}
                >
                  Filters
                  <Badge
                    color="primary"
                    badgeContent={[
                      committeeFilter,
                      statusFilter !== "All" ? statusFilter : "",
                      visibilityFilter !== "All" ? visibilityFilter : "",
                      startDateFilter,
                      endDateFilter,
                    ].filter((v) => v !== null && v !== "").length}
                    sx={{ ml: 1 }}
                  />
                </Button>
              </>
            )}

            {activeTab === "templates" && (
              <FormControl sx={{ minWidth: 200 }}>
                <FormLabel>Show archived</FormLabel>
                <Select
                  value={showArchived ? "yes" : "no"}
                  onChange={(event) => setShowArchived(event.target.value === "yes")}
                >
                  <MenuItem value="no">Active only</MenuItem>
                  <MenuItem value="yes">Active + archived</MenuItem>
                </Select>
              </FormControl>
            )}
          </Stack>

          <Button
            variant="contained"
            size="medium"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
            sx={{ whiteSpace: "nowrap" }}
          >
            {activeTab === "templates" ? "New template" : "New meeting"}
          </Button>
        </Box>

        <Box sx={{ display: "flex", alignItems: "flex-start" }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>

        {activeTab === "upcoming" && (
          <Stack id="meetings-upcoming-list">
            {upcomingMeetings.length === 0 ? (
              <Alert severity="info">No upcoming meetings</Alert>
            ) : (
              upcomingMeetings.map((meeting, index) => (
                <Box
                  key={meeting.id}
                  id={`meeting-row-${meeting.id}`}
                  sx={{
                    borderBottom: index < upcomingMeetings.length - 1 ? `1px solid ${tokens?.component?.divider?.colors?.default?.borderColor?.value}` : "none",
                    py: 2,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Stack flex={1} gap="4px" minWidth={0}>
                    <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
                      <Typography
                        variant="subtitle2"
                        onClick={() => setDetailView(meeting)}
                        sx={{ cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                      >
                        {meeting.name}
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        {meeting.status === "Draft" ? (
                          <StatusChip label="Draft" />
                        ) : (
                          <>
                            <StatusChip label="Published" />
                            <StatusChip label={meeting.visibility} />
                          </>
                        )}
                      </Stack>
                    </Stack>
                    <Stack direction="row" alignItems="center" gap="12px">
                      <Stack direction="row" alignItems="center" gap="4px">
                        <Box sx={{ display: "flex", alignItems: "center", width: 20, height: 20, color: "var(--lens-semantic-color-type-muted)", flexShrink: 0 }}>
                          <CalendarIcon />
                        </Box>
                        <Typography variant="caption" sx={{ color: "var(--lens-semantic-color-type-muted)" }}>
                          {formatDateLong(meeting.date)} · {meeting.time ?? "Time TBD"}
                        </Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" gap="4px">
                        <Box sx={{ display: "flex", alignItems: "center", width: 20, height: 20, color: "var(--lens-semantic-color-type-muted)", flexShrink: 0 }}>
                          <GroupIcon />
                        </Box>
                        <Typography variant="caption" sx={{ color: "var(--lens-semantic-color-type-muted)" }}>
                          {meeting.committee}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Stack>
                  <MeetingRowActions
                    status={meeting.status}
                    visibility={meeting.visibility}
                    onPublish={() => setPendingAction({ type: "publish", meeting })}
                    onUnpublish={() => setPendingAction({ type: "unpublish", meeting })}
                    onToggleVisibility={() => setPendingAction({ type: meeting.visibility === "Internal" ? "make-public" : "make-internal", meeting })}
                    onDuplicate={() => { setDuplicateSource(meeting); setDuplicateDialogOpen(true); }}
                    onDelete={() => setPendingAction({ type: "delete", meeting })}
                  />
                </Box>
              ))
            )}
          </Stack>
        )}

        {activeTab === "previous" && (
          <Stack gap={2} id="meetings-previous-accordion">
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
                  <AccordionDetails>
                    <Stack id={`meetings-year-${year}-list`}>
                      {yearMeetings.map((meeting, meetingIndex) => (
                        <Box
                          key={meeting.id}
                          id={`meeting-row-${meeting.id}`}
                          sx={{
                            borderBottom: meetingIndex < yearMeetings.length - 1 ? `1px solid ${tokens?.component?.divider?.colors?.default?.borderColor?.value}` : "none",
                            py: 2,
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <Stack flex={1} gap="4px" minWidth={0}>
                            <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
                              <Typography
                                variant="subtitle2"
                                onClick={() => setDetailView(meeting)}
                                sx={{ cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                              >
                                {meeting.name}
                              </Typography>
                              <Stack direction="row" spacing={1} alignItems="center">
                                {meeting.status === "Draft" ? (
                                  <StatusChip label="Draft" />
                                ) : (
                                  <>
                                    <StatusChip label="Published" />
                                    <StatusChip label={meeting.visibility} />
                                  </>
                                )}
                              </Stack>
                            </Stack>
                            <Stack direction="row" alignItems="center" gap="12px">
                              <Stack direction="row" alignItems="center" gap="4px">
                                <Box sx={{ display: "flex", alignItems: "center", width: 20, height: 20, color: "var(--lens-semantic-color-type-muted)", flexShrink: 0 }}>
                                  <CalendarIcon />
                                </Box>
                                <Typography variant="caption" sx={{ color: "var(--lens-semantic-color-type-muted)" }}>
                                  {formatDateLong(meeting.date)} · {meeting.time ?? "Time TBD"}
                                </Typography>
                              </Stack>
                              <Stack direction="row" alignItems="center" gap="4px">
                                <Box sx={{ display: "flex", alignItems: "center", width: 20, height: 20, color: "var(--lens-semantic-color-type-muted)", flexShrink: 0 }}>
                                  <GroupIcon />
                                </Box>
                                <Typography variant="caption" sx={{ color: "var(--lens-semantic-color-type-muted)" }}>
                                  {meeting.committee}
                                </Typography>
                              </Stack>
                            </Stack>
                          </Stack>
                          <MeetingRowActions
                            status={meeting.status}
                            onPublish={() => setMeetings((prev) => prev.map((m) => (m.id === meeting.id ? { ...m, status: "Published" } : m)))}
                            onUnpublish={() => setMeetings((prev) => prev.map((m) => (m.id === meeting.id ? { ...m, status: "Draft" } : m)))}
                            onDuplicate={() => { setDuplicateSource(meeting); setDuplicateDialogOpen(true); }}
                            onDelete={() => setDeleteTarget(meeting)}
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
          <Box
            sx={{
              width: "100%",
              border: `1px solid ${tokens?.component?.divider?.colors?.default?.borderColor?.value}`,
              borderRadius: "12px",
              overflow: "hidden",
            }}
          >
            <Table
              id="meetings-templates-table"
              sx={{
                width: "100%",
                "& .MuiTableBody-root .MuiTableRow-root:last-child .MuiTableCell-root": { borderBottom: 0 },
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Committee</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell align="right" />
                </TableRow>
              </TableHead>
              <TableBody>
                {visibleTemplates.map((template) => (
                  <TableRow key={template.id} id={`template-row-${template.id}`}>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>{template.name}</Typography>
                        {template.status === "Archived" && <StatusChip label="Archived" />}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Box
                        component="span"
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          border: "1px solid #76777A",
                          borderRadius: "100px",
                          px: 1.5,
                          height: 24,
                          fontSize: 12,
                          lineHeight: 1,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {template.committee}
                      </Box>
                    </TableCell>
                    <TableCell>{template.time ?? "—"}</TableCell>
                    <TableCell>{template.location ?? "—"}</TableCell>
                    <TableCell align="right">
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
          </Box>
        )}
          </Box>

          {/* Inline filter panel */}
          <Box
            sx={{
              width: filterPanelOpen ? 300 : 0,
              ml: filterPanelOpen ? 3 : 0,
              overflow: "hidden",
              flexShrink: 0,
              transition: "width 225ms cubic-bezier(0.4, 0, 0.2, 1), margin-left 225ms cubic-bezier(0.4, 0, 0.2, 1)",
              position: "sticky",
              top: 16,
              alignSelf: "flex-start",
            }}
          >
            <Box
              id="meetings-filter-content"
              sx={{
                width: 300,
                border: `1px solid ${tokens?.component?.divider?.colors?.default?.borderColor?.value}`,
                borderRadius: "12px",
                bgcolor: "#ffffff",
                display: "flex",
                flexDirection: "column",
                maxHeight: "calc(100vh - 120px)",
                overflow: "hidden",
              }}
            >
              {/* Header */}
              <Box sx={{ px: 2, pt: 2, pb: 3, flexShrink: 0 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h4" sx={{ fontSize: 18, fontWeight: 600 }}>Filters</Typography>
                  <IconButton size="small" aria-label="Close filters" onClick={() => setFilterPanelOpen(false)}>
                    <CloseIcon />
                  </IconButton>
                </Stack>
              </Box>

              {/* Scrollable content */}
              <Box sx={{ flex: 1, overflowY: "auto", px: 2, pb: 3 }}>
                <Stack gap={2}>
                  <FormControl>
                    <FormLabel>
                      Committee{" "}
                      <Box component="span" sx={{ fontWeight: 400 }}>(Required)</Box>
                    </FormLabel>
                    <Select
                      value={committeeFilter}
                      onChange={(event) => setCommitteeFilter(event.target.value)}
                      displayEmpty
                    >
                      <MenuItem value="">All committees</MenuItem>
                      {committees.map((value) => (
                        <MenuItem key={value} value={value}>
                          {value}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel>State</FormLabel>
                    <ToggleButtonGroup
                      exclusive
                      size="small"
                      value={statusFilter}
                      onChange={(_, value) => {
                        if (value) setStatusFilter(value as MeetingStatus | "All");
                      }}
                    >
                      <ToggleButton value="All">All</ToggleButton>
                      <ToggleButton value="Published">Published</ToggleButton>
                      <ToggleButton value="Draft">Draft</ToggleButton>
                    </ToggleButtonGroup>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Visibility</FormLabel>
                    <ToggleButtonGroup
                      exclusive
                      size="small"
                      value={visibilityFilter}
                      onChange={(_, value) => {
                        if (value) setVisibilityFilter(value as MeetingVisibility | "All");
                      }}
                    >
                      <ToggleButton value="All">All</ToggleButton>
                      <ToggleButton value="Public">Public</ToggleButton>
                      <ToggleButton value="Internal">Internal</ToggleButton>
                    </ToggleButtonGroup>
                  </FormControl>
                  <FormControl>
                    <Typography variant="body1" sx={{ mb: 1, color: "#6F7377", fontSize: "12px", lineHeight: "16px" }}>
                      Show meetings within the time frame you select below:
                    </Typography>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <Stack spacing={1}>
                        <Stack spacing={0.5}>
                          <FormLabel>Start date</FormLabel>
                          <DatePicker
                            value={startDateFilter}
                            onChange={(value) => setStartDateFilter(value)}
                            slotProps={{ textField: { size: "small" } }}
                          />
                        </Stack>
                        <Stack spacing={0.5}>
                          <FormLabel>End date</FormLabel>
                          <DatePicker
                            value={endDateFilter}
                            onChange={(value) => setEndDateFilter(value)}
                            slotProps={{ textField: { size: "small" } }}
                          />
                        </Stack>
                      </Stack>
                    </LocalizationProvider>
                  </FormControl>
                </Stack>
              </Box>

              {/* Sticky footer */}
              <Box sx={{ flexShrink: 0 }}>
                <Divider />
                <Box sx={{ px: 2, py: 1.5, display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      setCommitteeFilter("");
                      setStatusFilter("All");
                      setVisibilityFilter("All");
                      setStartDateFilter(null);
                      setEndDateFilter(null);
                    }}
                  >
                    Clear all
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Stack>

      <TemplatePickerDialog
        open={createDialogOpen}
        templates={templates}
        onClose={() => setCreateDialogOpen(false)}
        onSelect={(templateId) => {
          setCreateDialogOpen(false);
          setCreateTemplateId(templateId);
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
          pendingAction?.type === 'publish' ? 'Publish meeting' :
          pendingAction?.type === 'unpublish' ? 'Unpublish meeting' :
          pendingAction?.type === 'make-public' ? 'Make public' :
          pendingAction?.type === 'make-internal' ? 'Make internal' :
          'Delete meeting'
        }
        message={
          !pendingAction ? '' :
          pendingAction.type === 'publish' ? `Publish "${pendingAction.meeting.name}"? It will become visible to members.` :
          pendingAction.type === 'unpublish' ? `Unpublish "${pendingAction.meeting.name}"? It will be hidden from members.` :
          pendingAction.type === 'make-public' ? `Make "${pendingAction.meeting.name}" public? It will be visible to all site visitors.` :
          pendingAction.type === 'make-internal' ? `Make "${pendingAction.meeting.name}" internal? Only members will be able to see it.` :
          `Delete "${pendingAction.meeting.name}"? This action cannot be undone.`
        }
        confirmLabel={
          pendingAction?.type === 'publish' ? 'Publish' :
          pendingAction?.type === 'unpublish' ? 'Unpublish' :
          pendingAction?.type === 'make-public' ? 'Make public' :
          pendingAction?.type === 'make-internal' ? 'Make internal' :
          'Delete'
        }
        destructive={pendingAction?.type === "delete"}
        onConfirm={() => {
          if (!pendingAction) return;
          const { type, meeting } = pendingAction;
          if (type === 'publish') {
            setMeetings((prev) => prev.map((m) => m.id === meeting.id ? { ...m, status: 'Published' as const } : m));
          } else if (type === 'unpublish') {
            setMeetings((prev) => prev.map((m) => m.id === meeting.id ? { ...m, status: 'Draft' as const } : m));
          } else if (type === 'make-public') {
            setMeetings((prev) => prev.map((m) => m.id === meeting.id ? { ...m, visibility: 'Public' as const } : m));
          } else if (type === 'make-internal') {
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
