import { AppLayout } from "@diligentcorp/atlas-react-bundle";
import { useEffect } from "react";
import { Outlet, Route, Routes } from "react-router";
import "./styles.css";

import Navigation from "./Navigation.js";

const SIDE_NAV_APP_LABEL = "Community v2";

/**
 * Atlas's mock global nav hardcodes the side-nav title as "Boards" inside
 * a closed-ish shadow DOM tree we don't control. We replace the text once
 * it mounts and re-apply if Atlas re-renders.
 */
function useSideNavAppLabel(label: string) {
  useEffect(() => {
    let stopped = false;

    const apply = () => {
      const host = document.querySelector("mock-hb-global-navigator");
      if (!host) return false;
      // Walk into any shadow roots and patch:
      //   1. The H2 with "Boards" → the project's app label.
      //   2. The atlas-gn-side-nav host's `border-right` color — it ships
      //      transparent, and lives inside a shadow root so a stylesheet
      //      selector can't reach it. We set it inline so the side nav has
      //      the same hairline outline on its right edge that the top nav
      //      already has at its bottom edge.
      const seen = new Set<Node>();
      const stack: Node[] = [host];
      while (stack.length) {
        const node = stack.pop()!;
        if (seen.has(node)) continue;
        seen.add(node);
        if (node instanceof Element) {
          if (node.tagName === "H2" && node.textContent !== label) {
            node.textContent = label;
          }
          if (node.tagName === "ATLAS-GN-SIDE-NAV") {
            const el = node as HTMLElement;
            if (el.style.borderRightColor !== "var(--lens-component-global-nav-list-divider-border-color)") {
              el.style.borderRightColor = "var(--lens-component-global-nav-list-divider-border-color)";
            }
          }
        }
        const el = node as Element;
        if ((el as HTMLElement).shadowRoot) stack.push((el as HTMLElement).shadowRoot!);
        for (const child of (node.childNodes ?? [])) stack.push(child);
      }
      return true;
    };

    // Try until the custom element has rendered its shadow tree.
    const tick = () => {
      if (stopped) return;
      apply();
      requestAnimationFrame(() => setTimeout(tick, 250));
    };
    tick();

    // Also reapply on route / navigation activity in case Atlas re-renders.
    const observer = new MutationObserver(() => apply());
    observer.observe(document.body, { childList: true, subtree: true });

    return () => { stopped = true; observer.disconnect(); };
  }, [label]);
}
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
  useSideNavAppLabel(SIDE_NAV_APP_LABEL);

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
