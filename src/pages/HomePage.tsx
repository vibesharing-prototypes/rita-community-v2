import { PageHeader } from "@diligentcorp/atlas-react-bundle";
import BookPublishIcon from "@diligentcorp/atlas-react-bundle/icons/BookPublish";
import BookUnpublishIcon from "@diligentcorp/atlas-react-bundle/icons/BookUnpublish";
import CopyIcon from "@diligentcorp/atlas-react-bundle/icons/Copy";
import DocumentIcon from "@diligentcorp/atlas-react-bundle/icons/Document";
import GoalIcon from "@diligentcorp/atlas-react-bundle/icons/Goal";
import MoreOptionsIcon from "@diligentcorp/atlas-react-bundle/icons/More";
import PolicyIcon from "@diligentcorp/atlas-react-bundle/icons/Policy";
import CalendarIcon from "@diligentcorp/atlas-react-bundle/icons/Calendar";
import TrashIcon from "@diligentcorp/atlas-react-bundle/icons/Trash";
import {
  Box,
  Card,
  Divider,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router";

import PageLayout from "../components/PageLayout.js";
import DateBadge from "../components/home/DateBadge";
import type { Meeting } from "../types/meetings";
import meetingsData from "../data/meetings.json";
import homeData from "../data/home.json";
import {
  formatDate,
  formatDateLong,
  getDayOfMonth,
  getMonthAbbrev,
  isUpcoming,
} from "../utils/meetings";

export default function HomePage() {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState<Meeting[]>(meetingsData.meetings as Meeting[]);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [menuMeeting, setMenuMeeting] = useState<Meeting | null>(null);

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>, meeting: Meeting) => {
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
    setMenuMeeting(meeting);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuMeeting(null);
  };

  const handlePublishToggle = () => {
    if (!menuMeeting) return;
    setMeetings((prev) =>
      prev.map((m) =>
        m.id === menuMeeting.id
          ? { ...m, status: m.status === "Published" ? "Draft" : "Published" }
          : m,
      ),
    );
    handleMenuClose();
  };

  const handleDelete = () => {
    if (!menuMeeting) return;
    setMeetings((prev) => prev.filter((m) => m.id !== menuMeeting.id));
    handleMenuClose();
  };

  const {
    featuredMeetings,
    featuredPolicies,
    featuredDocuments,
    featuredGoals,
  } = homeData;
  const upcomingMeetings = meetings
    .filter((meeting) => isUpcoming(meeting.date))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 4)
    .map((meeting) => ({
      ...meeting,
      month: getMonthAbbrev(meeting.date),
      day: getDayOfMonth(meeting.date),
      fullDate: formatDateLong(meeting.date),
    }));

  const recentMeetings = meetings
    .filter((meeting) => !isUpcoming(meeting.date))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3)
    .map((meeting) => ({
      ...meeting,
      formattedDate: formatDate(meeting.date),
    }));

  return (
    <PageLayout id="page-home">
      <PageHeader pageTitle="Home" />
      <Box
        id="home-grid"
        sx={{
          display: "grid",
          gap: 3,
          gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
        }}
      >
        {/* Left column — Meetings */}
        <Card id="home-meetings-card" variant="outlined" sx={{ borderRadius: "12px", p: "0 !important", borderColor: "var(--lens-semantic-color-ui-divider-default)" }}>
          <Stack sx={{ p: 3, gap: "12px" }}>
            <Typography variant="h3" fontWeight={600}>Meetings</Typography>

            <Stack gap={3}>
              {/* Upcoming */}
              <Stack gap={1}>
                <Typography variant="overline" color="text.secondary">
                  Upcoming
                </Typography>
                <Box
                  sx={{
                    display: "grid",
                    gap: "12px",
                    gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
                  }}
                >
                  {upcomingMeetings.map((meeting) => (
                    <Box
                      key={meeting.id}
                      sx={{
                        border: "1px solid",
                        borderColor: "var(--lens-semantic-color-ui-divider-default)",
                        borderRadius: "12px",
                        overflow: "hidden",
                        cursor: "pointer",
                      }}
                      onClick={() => navigate(`/meetings/${meeting.id}`)}
                    >
                      <Stack direction="row" alignItems="center" sx={{ gap: "12px", pl: "12px", pr: "12px", py: "12px" }}>
                        <DateBadge month={meeting.month} day={meeting.day} />
                        <Stack flex={1} minWidth={0} gap="2px">
                          <Typography noWrap sx={{
                            fontSize: "14px",
                            fontWeight: "var(--lens-core-font-weight-semi-bold)",
                            lineHeight: "20px",
                            letterSpacing: "0.2px",
                            color: "var(--lens-semantic-color-type-default)",
                          }}>
                            {meeting.name}
                          </Typography>
                          <Typography noWrap sx={{
                            fontSize: "12px",
                            fontWeight: "var(--lens-core-font-weight-regular)",
                            lineHeight: "16px",
                            letterSpacing: "0.3px",
                            color: "var(--lens-semantic-color-type-default)",
                          }}>
                            {meeting.fullDate} · {meeting.time}
                          </Typography>
                          <Typography noWrap sx={{
                            fontSize: "12px",
                            fontWeight: "var(--lens-core-font-weight-regular)",
                            lineHeight: "16px",
                            letterSpacing: "0.3px",
                            color: "var(--lens-semantic-color-type-muted)",
                          }}>
                            {meeting.committee}
                          </Typography>
                        </Stack>
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, meeting)}
                          sx={{ flexShrink: 0 }}
                        >
                          <MoreOptionsIcon />
                        </IconButton>
                      </Stack>
                    </Box>
                  ))}
                </Box>
              </Stack>

              {/* Recent */}
              <Stack gap={1}>
                <Typography variant="overline" color="text.secondary">
                  Recent
                </Typography>
                <List disablePadding>
                  {recentMeetings.map((meeting, i) => (
                    <ListItem
                      key={meeting.id}
                      disablePadding
                      divider={i < recentMeetings.length - 1}
                      sx={{ cursor: "pointer" }}
                      onClick={() => navigate(`/meetings/${meeting.id}`)}
                    >
                      <Stack direction="row" alignItems="center" sx={{ flex: 1, pr: "12px", py: 1 }} minWidth={0}>
                        <Stack flex={1} minWidth={0} gap="4px">
                          <Typography noWrap sx={{
                            fontSize: "14px",
                            fontWeight: "var(--lens-core-font-weight-semi-bold)",
                            lineHeight: "20px",
                            letterSpacing: "0.2px",
                            color: "var(--lens-semantic-color-type-default)",
                          }}>
                            {meeting.name}
                          </Typography>
                          <Typography sx={{
                            fontSize: "12px",
                            fontWeight: "var(--lens-core-font-weight-regular)",
                            lineHeight: "16px",
                            letterSpacing: "0.3px",
                            color: "var(--lens-semantic-color-type-muted)",
                          }}>
                            {meeting.formattedDate} · {meeting.committee}
                          </Typography>
                        </Stack>
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, meeting)}
                          sx={{ flexShrink: 0 }}
                        >
                          <MoreOptionsIcon />
                        </IconButton>
                      </Stack>
                    </ListItem>
                  ))}
                </List>
              </Stack>
            </Stack>
          </Stack>
        </Card>

        {/* Right column — Featured */}
        <Stack gap="12px" id="home-featured-section" sx={{ pt: 3 }}>
          <Stack gap="8px" id="home-featured-header">
            <Typography variant="h3" fontWeight={600}>Featured</Typography>
            <Typography variant="textSm" sx={{ color: "var(--lens-semantic-color-type-muted)" }}>
              Selected by your administrator
            </Typography>
          </Stack>

          {/* Featured Meetings */}
          <Stack gap="12px">
            <Typography variant="subtitle2">Meetings</Typography>
            <Stack gap="12px">
              {featuredMeetings.map((meeting) => (
                <Stack
                  key={meeting.id}
                  direction="row"
                  gap="8px"
                  alignItems="center"
                  sx={{ cursor: "pointer" }}
                  onClick={() => navigate("/meetings")}
                >
                  <Box sx={{
                    width: 32, height: 32, flexShrink: 0, borderRadius: "8px",
                    backgroundColor: "#E4F3FF",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <CalendarIcon style={{ fontSize: 20, width: 20, height: 20 }} />
                  </Box>
                  <Stack flex={1} minWidth={0} gap="4px">
                    <Typography noWrap sx={{ fontSize: "12px", fontWeight: "var(--lens-core-font-weight-semi-bold)", lineHeight: "16px", letterSpacing: "0.3px", color: "var(--lens-semantic-color-type-default)" }}>
                      {meeting.title}
                    </Typography>
                    <Typography sx={{ fontSize: "10px", fontWeight: "var(--lens-core-font-weight-regular)", lineHeight: "12px", letterSpacing: "0.3px", color: "var(--lens-semantic-color-type-muted)" }}>
                      {meeting.date} · {meeting.committee}
                    </Typography>
                  </Stack>
                </Stack>
              ))}
            </Stack>
          </Stack>

          <Divider />

          {/* Featured Policies */}
          <Stack gap="12px">
            <Typography variant="subtitle2">Policies</Typography>
            <Stack gap="12px">
              {featuredPolicies.map((policy) => (
                <Stack
                  key={policy.id}
                  direction="row"
                  gap="8px"
                  alignItems="center"
                  sx={{ cursor: "pointer" }}
                  onClick={() => navigate("/policies")}
                >
                  <Box sx={{
                    width: 32, height: 32, flexShrink: 0, borderRadius: "8px",
                    backgroundColor: "#E4F3FF",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <PolicyIcon style={{ fontSize: 20, width: 20, height: 20 }} />
                  </Box>
                  <Stack flex={1} minWidth={0} gap="4px">
                    <Typography noWrap sx={{ fontSize: "12px", fontWeight: "var(--lens-core-font-weight-semi-bold)", lineHeight: "16px", letterSpacing: "0.3px", color: "var(--lens-semantic-color-type-default)" }}>
                      {policy.title}
                    </Typography>
                    <Typography sx={{ fontSize: "10px", fontWeight: "var(--lens-core-font-weight-regular)", lineHeight: "12px", letterSpacing: "0.3px", color: "var(--lens-semantic-color-type-muted)" }}>
                      {policy.subtitle}
                    </Typography>
                  </Stack>
                </Stack>
              ))}
            </Stack>
          </Stack>

          <Divider />

          {/* Featured Documents */}
          <Stack gap="12px">
            <Typography variant="subtitle2">Documents</Typography>
            <Stack gap="12px">
              {featuredDocuments.map((doc) => (
                <Stack
                  key={doc.id}
                  direction="row"
                  gap="8px"
                  alignItems="center"
                  sx={{ cursor: "pointer" }}
                  onClick={() => navigate("/library/files")}
                >
                  <Box sx={{
                    width: 32, height: 32, flexShrink: 0, borderRadius: "8px",
                    backgroundColor: "#E4F3FF",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <DocumentIcon style={{ fontSize: 20, width: 20, height: 20 }} />
                  </Box>
                  <Stack flex={1} minWidth={0} gap="4px">
                    <Typography noWrap sx={{ fontSize: "12px", fontWeight: "var(--lens-core-font-weight-semi-bold)", lineHeight: "16px", letterSpacing: "0.3px", color: "var(--lens-semantic-color-type-default)" }}>
                      {doc.title}
                    </Typography>
                  </Stack>
                </Stack>
              ))}
            </Stack>
          </Stack>

          <Divider />

          {/* Featured Goals */}
          <Stack gap="12px">
            <Typography variant="subtitle2">Goals</Typography>
            <Stack gap="12px">
              {featuredGoals.map((goal) => (
                <Stack
                  key={goal.id}
                  direction="row"
                  gap="8px"
                  alignItems="center"
                  sx={{ cursor: "pointer" }}
                  onClick={() => navigate("/library/goals")}
                >
                  <Box sx={{
                    width: 32, height: 32, flexShrink: 0, borderRadius: "8px",
                    backgroundColor: "#E4F3FF",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <GoalIcon style={{ fontSize: 20, width: 20, height: 20 }} />
                  </Box>
                  <Stack flex={1} minWidth={0} gap="4px">
                    <Stack direction="row" alignItems="center" gap="4px">
                      <Typography noWrap flex={1} sx={{ fontSize: "12px", fontWeight: "var(--lens-core-font-weight-semi-bold)", lineHeight: "16px", letterSpacing: "0.3px", color: "var(--lens-semantic-color-type-default)" }}>
                        {goal.title}
                      </Typography>
                      <Typography sx={{ fontSize: "10px", fontWeight: "var(--lens-core-font-weight-regular)", lineHeight: "12px", letterSpacing: "0.3px", color: "var(--lens-semantic-color-type-muted)", flexShrink: 0 }}>
                        {goal.progress}%
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={goal.progress}
                    />
                  </Stack>
                </Stack>
              ))}
            </Stack>
          </Stack>
        </Stack>
      </Box>

      {/* More menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem onClick={handlePublishToggle}>
          <ListItemIcon>
            {menuMeeting?.status === "Published" ? <BookUnpublishIcon /> : <BookPublishIcon />}
          </ListItemIcon>
          <ListItemText>
            {menuMeeting?.status === "Published" ? "Unpublish" : "Publish"}
          </ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon><CopyIcon /></ListItemIcon>
          <ListItemText>Duplicate</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
          <ListItemIcon sx={{ color: "error.main" }}><TrashIcon /></ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </PageLayout>
  );
}
