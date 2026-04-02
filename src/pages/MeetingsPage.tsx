import { PageHeader } from "@diligentcorp/atlas-react-bundle";
import AddIcon from "@diligentcorp/atlas-react-bundle/icons/Add";
import CalendarIcon from "@diligentcorp/atlas-react-bundle/icons/Calendar";
import CloseIcon from "@diligentcorp/atlas-react-bundle/icons/Close";
import FilterIcon from "@diligentcorp/atlas-react-bundle/icons/Filter";
import MoreIcon from "@diligentcorp/atlas-react-bundle/icons/More";
import SearchIcon from "@diligentcorp/atlas-react-bundle/icons/Search";
import TemplateIcon from "@diligentcorp/atlas-react-bundle/icons/Document";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Badge,
  Box,
  Button,
  Divider,
  Drawer,
  FormControl,
  FormHelperText,
  FormLabel,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
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
  const { presets } = useTheme();
  const { meetings: seedMeetings, templates: seedTemplates, committees } = meetingsData as {
    meetings: Meeting[];
    templates: MeetingTemplate[];
    committees: string[];
  };
  const [meetings, setMeetings] = useState<Meeting[]>(seedMeetings);
  const [templates] = useState<MeetingTemplate[]>(seedTemplates);
  const [activeTab, setActiveTab] = useState<MeetingTab>("upcoming");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("date-asc");
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [committeeFilter, setCommitteeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<MeetingStatus | "All">("All");
  const [visibilityFilter, setVisibilityFilter] = useState<MeetingVisibility | "All">("All");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [duplicateSource, setDuplicateSource] = useState<Meeting | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Meeting | null>(null);
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
      .filter((meeting) => (!startDateFilter ? true : meeting.date >= startDateFilter))
      .filter((meeting) => (!endDateFilter ? true : meeting.date <= endDateFilter));
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
        onEdit={() => { setEditView(detailView); setDetailView(null); }}
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
      <PageHeader
        pageTitle="Meetings"
        moreButton={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateDialogOpen(true)}>
            {activeTab === "templates" ? "New template" : "New meeting"}
          </Button>
        }
      />

      <Stack gap={2} id="meetings-content">
        <Tabs
          value={activeTab}
          onChange={(_, value) => setActiveTab(value)}
          {...presets?.TabsPresets?.Tabs?.alignToPageHeader}
        >
          <Tab label="Upcoming" value="upcoming" />
          <Tab label="Previous" value="previous" />
          <Tab label="Templates" value="templates" />
        </Tabs>

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems="flex-end"
          id="meetings-toolbar"
        >
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
                  ].filter(Boolean).length}
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

        {activeTab === "upcoming" && (
          <Stack gap={1} id="meetings-upcoming-list">
            {upcomingMeetings.length === 0 ? (
              <Alert severity="info">No upcoming meetings</Alert>
            ) : (
              upcomingMeetings.map((meeting) => (
                <Box
                  key={meeting.id}
                  id={`meeting-row-${meeting.id}`}
                  sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, p: 2 }}
                >
                  <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center">
                    <Stack direction="row" spacing={1} alignItems="center" flex={1}>
                      <CalendarIcon />
                      <Stack>
                        <Typography variant="subtitle2">{meeting.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDateLong(meeting.date)} · {meeting.time ?? "Time TBD"}
                        </Typography>
                      </Stack>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <StatusChip label={meeting.status} />
                      <StatusChip label={meeting.visibility} />
                      <StatusChip label={meeting.agendaStatus} />
                    </Stack>
                    <MeetingRowActions
                      status={meeting.status}
                      onEdit={() => setEditView(meeting)}
                      onPublish={() => setMeetings((prev) => prev.map((m) => (m.id === meeting.id ? { ...m, status: "Published" } : m)))}
                      onUnpublish={() => setMeetings((prev) => prev.map((m) => (m.id === meeting.id ? { ...m, status: "Draft" } : m)))}
                      onDuplicate={() => { setDuplicateSource(meeting); setDuplicateDialogOpen(true); }}
                      onDelete={() => setDeleteTarget(meeting)}
                    />
                  </Stack>
                </Box>
              ))
            )}
          </Stack>
        )}

        {activeTab === "previous" && (
          <Stack gap={2} id="meetings-previous-accordion">
            {previousYears.map((year) => (
              <Accordion key={year} defaultExpanded id={`meetings-year-${year}`}>
                <AccordionSummary>
                  <Typography variant="subtitle2">{year}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack gap={1} id={`meetings-year-${year}-list`}>
                    {previousMeetings
                      .filter((meeting) => getYear(meeting.date) === year)
                      .map((meeting) => (
                        <Box
                          key={meeting.id}
                          id={`meeting-row-${meeting.id}`}
                          sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, p: 2 }}
                        >
                          <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center">
                            <Stack direction="row" spacing={1} alignItems="center" flex={1}>
                              <CalendarIcon />
                              <Stack>
                                <Typography variant="subtitle2">{meeting.name}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {formatDateLong(meeting.date)} · {meeting.time ?? "Time TBD"}
                                </Typography>
                              </Stack>
                            </Stack>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <StatusChip label={meeting.status} />
                              <StatusChip label={meeting.visibility} />
                              <StatusChip label={meeting.agendaStatus} />
                            </Stack>
                            <MeetingRowActions
                              status={meeting.status}
                              onEdit={() => setEditView(meeting)}
                              onPublish={() => setMeetings((prev) => prev.map((m) => (m.id === meeting.id ? { ...m, status: "Published" } : m)))}
                              onUnpublish={() => setMeetings((prev) => prev.map((m) => (m.id === meeting.id ? { ...m, status: "Draft" } : m)))}
                              onDuplicate={() => { setDuplicateSource(meeting); setDuplicateDialogOpen(true); }}
                              onDelete={() => setDeleteTarget(meeting)}
                            />
                          </Stack>
                        </Box>
                      ))}
                  </Stack>
                </AccordionDetails>
              </Accordion>
            ))}
          </Stack>
        )}

        {activeTab === "templates" && (
          <Stack gap={1} id="meetings-templates-list">
            {visibleTemplates.map((template) => (
              <Box
                key={template.id}
                id={`template-row-${template.id}`}
                sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, p: 2 }}
              >
                <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center">
                  <Stack direction="row" spacing={1} alignItems="center" flex={1}>
                    <TemplateIcon />
                    <Stack>
                      <Typography variant="subtitle2">{template.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {template.committee} · {template.time ?? "Time TBD"}
                      </Typography>
                    </Stack>
                  </Stack>
                  <StatusChip label={template.status} />
                  <IconButton aria-label="Template actions">
                    <MoreIcon />
                  </IconButton>
                </Stack>
              </Box>
            ))}
          </Stack>
        )}
      </Stack>

      <Drawer
        open={filterPanelOpen}
        onClose={() => setFilterPanelOpen(false)}
        anchor="right"
        id="meetings-filter-drawer"
      >
        <Box sx={{ width: 360, p: 3 }} id="meetings-filter-content">
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Filters</Typography>
            <IconButton aria-label="Close filters" onClick={() => setFilterPanelOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Stack>
          <Stack gap={2}>
            <FormControl>
              <FormLabel>Committee</FormLabel>
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
              <FormLabel>Meeting state</FormLabel>
              <ToggleButtonGroup
                exclusive
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
              <FormLabel>Meeting visibility</FormLabel>
              <ToggleButtonGroup
                exclusive
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
              <FormLabel>Date range</FormLabel>
              <Stack spacing={1}>
                <TextField type="date" value={startDateFilter} onChange={(event) => setStartDateFilter(event.target.value)} />
                <TextField type="date" value={endDateFilter} onChange={(event) => setEndDateFilter(event.target.value)} />
                <FormHelperText>Leave blank to include all dates.</FormHelperText>
              </Stack>
            </FormControl>
          </Stack>
          <Divider sx={{ my: 3 }} />
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={() => {
                setCommitteeFilter("");
                setStatusFilter("All");
                setVisibilityFilter("All");
                setStartDateFilter("");
                setEndDateFilter("");
              }}
            >
              Clear all
            </Button>
            <Button variant="contained" onClick={() => setFilterPanelOpen(false)}>
              Apply
            </Button>
          </Stack>
        </Box>
      </Drawer>

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
        open={Boolean(deleteTarget)}
        title="Delete meeting?"
        message={
          deleteTarget
            ? `Delete “${deleteTarget.name}”? This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        onConfirm={() => {
          if (deleteTarget) {
            setMeetings((prev) => prev.filter((meeting) => meeting.id !== deleteTarget.id));
          }
          setDeleteTarget(null);
        }}
        onClose={() => setDeleteTarget(null)}
      />
    </PageLayout>
  );
}
