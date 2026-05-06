import { AppLayout } from "@diligentcorp/atlas-react-bundle";
import { Outlet, Route, Routes } from "react-router";
import "./styles.css";

import Navigation from "./Navigation.js";
import HomePage from "./pages/HomePage.js";
import MeetingsPage from "./pages/MeetingsPage.js";
import MeetingDetailPage from "./pages/MeetingDetailPage.js";
import TemplateDetailPage from "./pages/TemplateDetailPage.js";
import CalendarPage from "./pages/CalendarPage.js";
import PlaceholderPage from "./pages/PlaceholderPage.js";
import AgendaEditorPage from "./pages/AgendaEditorPage.js";
import TemplateAgendaEditorPage from "./pages/TemplateAgendaEditorPage.js";
import DocumentsPage from "./pages/DocumentsPage.js";
import FolderDetailPage from "./pages/FolderDetailPage.js";
import GoalsPage from "./pages/GoalsPage.js";
import EventsPage from "./pages/EventsPage.js";
import GoalDetailPage from "./pages/GoalDetailPage.js";
import EventDetailPage from "./pages/EventDetailPage.js";
import MembersPage from "./pages/MembersPage.js";

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <AppLayout navigation={<Navigation />}>
            <Outlet />
          </AppLayout>
        }
      >
        <Route index element={<HomePage />} />
        <Route path="meetings" element={<MeetingsPage />} />
        <Route path="meetings/calendar" element={<CalendarPage />} />
        <Route path="meetings/templates/:id" element={<TemplateDetailPage />} />
        <Route path="meetings/templates/:id/agenda" element={<TemplateAgendaEditorPage />} />
        <Route path="meetings/:id" element={<MeetingDetailPage />} />
        <Route path="meetings/:id/agenda" element={<AgendaEditorPage />} />
        <Route path="agenda" element={<PlaceholderPage title="Agenda items" />} />
        <Route path="policies" element={<PlaceholderPage title="Policies" />} />
        <Route path="library/documents" element={<DocumentsPage />} />
        <Route path="library/documents/folder/:folderId" element={<FolderDetailPage />} />
        <Route path="library/goals" element={<GoalsPage />} />
        <Route path="library/goals/:goalId" element={<GoalDetailPage />} />
        <Route path="library/events" element={<EventsPage />} />
        <Route path="library/events/:eventId" element={<EventDetailPage />} />
        <Route path="library/members" element={<MembersPage />} />
        <Route path="settings" element={<PlaceholderPage title="Settings" />} />
      </Route>
    </Routes>
  );
}
