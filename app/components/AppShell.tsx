"use client";

import { useState, useEffect } from "react";
import MeetingsPage from "./MeetingsPage";

// ── Types ────────────────────────────────────────────────────────

export type PageId =
  | "home"
  | "meetings"
  | "agenda"
  | "policies"
  | "library-files"
  | "library-goals"
  | "library-events"
  | "library-members"
  | "settings";

type NavItemConfig = {
  id: PageId;
  label: string;
  icon: string;
  badge?: number;
};

type LibrarySubItem = {
  id: PageId;
  label: string;
  icon: string;
};

// ── Nav config ───────────────────────────────────────────────────

const PRIMARY_NAV: NavItemConfig[] = [
  { id: "home",     label: "Home",         icon: "home" },
  { id: "meetings", label: "Meetings",     icon: "calendar_month" },
  { id: "agenda",   label: "Agenda items", icon: "checklist", badge: 3 },
  { id: "policies", label: "Policies",     icon: "gavel" },
];

const LIBRARY_SUB_NAV: LibrarySubItem[] = [
  { id: "library-files",   label: "Files",         icon: "description" },
  { id: "library-goals",   label: "Goals",         icon: "flag" },
  { id: "library-events",  label: "Events",        icon: "event" },
  { id: "library-members", label: "Board members", icon: "group" },
];

// ── Primitives ───────────────────────────────────────────────────

function Icon({
  name,
  size = 20,
  className = "",
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={`material-symbols-outlined select-none shrink-0 ${className}`}
      style={{ fontSize: size }}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}

// ── Diligent D-blob mark (extracted from logo.svg) ───────────────

function DiligentMark({ size = 26 }: { size?: number }) {
  // Aspect ratio of the D-blob viewport: 201 × 222
  const w = Math.round(size * (201 / 222));
  return (
    <svg
      width={w}
      height={size}
      viewBox="0 0 201 222"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M200.87,110.85c0,33.96-12.19,61.94-33.03,81.28c-0.24,0.21-0.42,0.43-0.66,0.64
           c-15.5,14.13-35.71,23.52-59.24,27.11l-1.59-1.62l35.07-201.75l1.32-3.69
           C178.64,30.36,200.87,65.37,200.87,110.85z"
        fill="#EE312E"
      />
      <path
        d="M142.75,12.83l-0.99,1.47L0.74,119.34L0,118.65c0,0,0-0.03,0-0.06V0.45
           h85.63c5.91,0,11.64,0.34,17.19,1.01h0.21c14.02,1.66,26.93,5.31,38.48,10.78
           C141.97,12.46,142.75,12.83,142.75,12.83z"
        fill="#AF292E"
      />
      <path
        d="M142.75,12.83L0,118.65v99.27v3.62h85.96c7.61,0,14.94-0.58,21.99-1.66
           C107.95,219.89,142.75,12.83,142.75,12.83z"
        fill="#D3222A"
      />
    </svg>
  );
}

// ── Nav item ─────────────────────────────────────────────────────

function NavItem({
  icon,
  label,
  active = false,
  badge,
  external = false,
  onClick,
  expanded,
}: {
  icon: string;
  label: string;
  active?: boolean;
  badge?: number;
  external?: boolean;
  onClick?: () => void;
  expanded: boolean;
}) {
  return (
    <div className="relative px-2 py-0.5">
      <button
        onClick={onClick}
        title={!expanded ? label : undefined}
        aria-current={active ? "page" : undefined}
        className={[
          "w-full rounded-xl text-sm font-normal transition-colors duration-150 select-none",
          expanded
            ? "flex items-center gap-3 p-3"
            : "flex items-center justify-center p-2.5",
          active
            ? "bg-selection text-action-primary"
            : "text-type hover:bg-selection-hover",
        ].join(" ")}
      >
        <Icon
          name={icon}
          size={20}
          className={active ? "text-action-primary" : ""}
        />

        {expanded && (
          <>
            <span className="flex-1 text-left leading-snug truncate">
              {label}
            </span>
            {badge !== undefined && badge > 0 && (
              <span className="bg-action-primary text-action-primary-on-primary text-[10px] font-semibold rounded-full px-1.5 min-w-[18px] h-[18px] flex items-center justify-center leading-none shrink-0">
                {badge > 99 ? "99+" : badge}
              </span>
            )}
            {external && (
              <Icon
                name="open_in_new"
                size={14}
                className="text-type-disabled opacity-70"
              />
            )}
          </>
        )}
      </button>

      {/* Badge dot when collapsed */}
      {!expanded && badge !== undefined && badge > 0 && (
        <span
          className="absolute top-1 right-2.5 w-2 h-2 rounded-full bg-action-primary border-2 border-surface pointer-events-none"
          aria-hidden="true"
        />
      )}
    </div>
  );
}

// ── Sidebar ──────────────────────────────────────────────────────

function Sidebar({
  activePage,
  onNavigate,
  expanded,
  onToggle,
}: {
  activePage: PageId;
  onNavigate: (id: PageId) => void;
  expanded: boolean;
  onToggle: () => void;
}) {
  const isLibraryActive = activePage.startsWith("library-");
  const [libraryOpen, setLibraryOpen] = useState(isLibraryActive);

  // Keep library group open when a sub-item is active
  const handleLibraryToggle = () => {
    if (!expanded) {
      // Collapsed sidebar: navigate to first sub-item instead
      onNavigate("library-files");
    } else {
      setLibraryOpen((v) => !v);
    }
  };

  return (
    <aside
      className={[
        "shrink-0 flex flex-col bg-surface border-r border-outline-static",
        "overflow-hidden transition-[width] duration-200 ease-in-out",
        expanded ? "w-[300px]" : "w-[60px]",
      ].join(" ")}
    >
      {/* Logo row */}
      <div
        className={[
          "h-14 flex items-center border-b border-outline-static shrink-0",
          expanded ? "px-3 gap-2.5" : "justify-center px-0 gap-0",
        ].join(" ")}
      >
        <button
          onClick={onToggle}
          aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
          className="w-8 h-8 flex items-center justify-center rounded-full text-type-muted hover:bg-selection-hover hover:text-type transition-colors shrink-0"
        >
          <Icon name="menu" size={20} />
        </button>

        <div
          className={[
            "flex items-center gap-2 overflow-hidden transition-opacity duration-100",
            expanded ? "opacity-100" : "opacity-0 pointer-events-none w-0",
          ].join(" ")}
        >
          <DiligentMark size={26} />
          <span className="text-type font-semibold text-sm tracking-tight whitespace-nowrap">
            Diligent
          </span>
        </div>
      </div>

      {/* Primary nav */}
      <nav
        className="flex-1 py-2 overflow-y-auto overflow-x-hidden"
        aria-label="Primary navigation"
      >
        {PRIMARY_NAV.map((item) => (
          <NavItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            badge={item.badge}
            active={activePage === item.id}
            expanded={expanded}
            onClick={() => onNavigate(item.id)}
          />
        ))}

        {/* Library — expandable group */}
        <div className="px-2 py-0.5">
          <div
            className={[
              "rounded-xl overflow-hidden",
              expanded && libraryOpen ? "border border-[#E2E2E5]" : "",
            ].join(" ")}
          >
            <button
              onClick={handleLibraryToggle}
              title={!expanded ? "Library" : undefined}
              className={[
                "w-full text-sm font-normal transition-colors duration-150 select-none",
                expanded
                  ? "flex items-center gap-3 p-3"
                  : "flex items-center justify-center p-2.5",
                isLibraryActive
                  ? "bg-selection text-action-primary"
                  : "text-type hover:bg-selection-hover",
              ].join(" ")}
            >
              <Icon name="folder_open" size={20} className={isLibraryActive ? "text-action-primary" : ""} />
              {expanded && (
                <>
                  <span className="flex-1 text-left leading-snug truncate">Library</span>
                  <Icon
                    name="expand_more"
                    size={16}
                    className={[
                      "text-type-disabled transition-transform duration-200 shrink-0",
                      libraryOpen ? "rotate-180" : "",
                    ].join(" ")}
                  />
                </>
              )}
            </button>

            {/* Library sub-items */}
            {expanded && libraryOpen && (
              <div className="pb-1.5">
                {LIBRARY_SUB_NAV.map((item) => (
                  <div key={item.id} className="px-1.5 py-0.5">
                    <button
                      onClick={() => onNavigate(item.id)}
                      aria-current={activePage === item.id ? "page" : undefined}
                      className={[
                        "w-full rounded-lg text-sm font-normal transition-colors duration-150 select-none",
                        "flex items-center pl-[44px] pr-3 py-3",
                        activePage === item.id
                          ? "bg-selection text-action-primary"
                          : "text-type hover:bg-selection-hover",
                      ].join(" ")}
                    >
                      <span className="flex-1 text-left leading-snug truncate">{item.label}</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Utility nav */}
      <div
        className="shrink-0 border-t border-outline-static py-2"
        aria-label="Utility navigation"
      >
        <NavItem
          icon="settings"
          label="Settings"
          active={activePage === "settings"}
          expanded={expanded}
          onClick={() => onNavigate("settings")}
        />
        <NavItem
          icon="language"
          label="Public site"
          external
          expanded={expanded}
          onClick={() => {}}
        />
      </div>
    </aside>
  );
}

// ── Header icon button ───────────────────────────────────────────

function HeaderIconButton({
  icon,
  label,
  onClick,
  children,
}: {
  icon: string;
  label: string;
  onClick?: () => void;
  children?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className="relative w-9 h-9 flex items-center justify-center rounded-full text-type-muted hover:bg-selection-hover hover:text-type transition-colors"
    >
      <Icon name={icon} size={20} />
      {children}
    </button>
  );
}

// ── Global header ────────────────────────────────────────────────

function GlobalHeader({
  darkMode,
  onToggleDark,
}: {
  darkMode: boolean;
  onToggleDark: () => void;
}) {
  return (
    <header className="h-14 shrink-0 flex items-center justify-between px-5 bg-surface border-b border-outline-static">
      <span className="text-base font-semibold text-type">Emerald City School District</span>

      <div className="flex items-center gap-0.5">
        <HeaderIconButton
          icon={darkMode ? "light_mode" : "dark_mode"}
          label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          onClick={onToggleDark}
        />
        <HeaderIconButton icon="search" label="Search" />
        <HeaderIconButton icon="notifications" label="Notifications">
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-action-destructive-secondary-default border-2 border-surface"
            aria-hidden="true"
          />
        </HeaderIconButton>
        <button
          aria-label="Profile"
          className="ml-1 w-8 h-8 rounded-full bg-action-primary flex items-center justify-center text-action-primary-on-primary text-xs font-semibold shrink-0 hover:opacity-90 transition-opacity"
        >
          JS
        </button>
      </div>
    </header>
  );
}

// ── Page placeholder ─────────────────────────────────────────────

const PAGE_META: Record<PageId, { title: string; librarySubPage?: string }> = {
  home:            { title: "Home" },
  meetings:        { title: "Meetings" },
  agenda:          { title: "Agenda items" },
  policies:        { title: "Policies" },
  "library-files":   { title: "Files",         librarySubPage: "Files" },
  "library-goals":   { title: "Goals",         librarySubPage: "Goals" },
  "library-events":  { title: "Events",        librarySubPage: "Events" },
  "library-members": { title: "Board members", librarySubPage: "Board members" },
  settings:        { title: "Settings" },
};

function PagePlaceholder({ page }: { page: PageId }) {
  const meta = PAGE_META[page];
  const navIcon =
    PRIMARY_NAV.find((n) => n.id === page)?.icon ??
    LIBRARY_SUB_NAV.find((n) => n.id === page)?.icon ??
    (page === "settings" ? "settings" : "grid_view");

  return (
    <div className="p-8 max-w-5xl">
      {meta.librarySubPage && (
        <div className="flex items-center gap-1.5 text-xs text-type-muted mb-5">
          <span className="text-type-muted">Library</span>
          <Icon name="chevron_right" size={14} className="text-type-disabled" />
          <span className="text-type">{meta.librarySubPage}</span>
        </div>
      )}
      <h1 className="text-2xl font-semibold text-type mb-6 tracking-tight">
        {meta.title}
      </h1>
      <div className="rounded-xl border border-outline-static bg-surface p-12 flex flex-col items-center justify-center gap-3 text-center">
        <div className="w-10 h-10 rounded-full bg-selection flex items-center justify-center">
          <Icon name={navIcon} size={20} className="text-action-primary" />
        </div>
        <p className="text-sm font-medium text-type">{meta.title}</p>
        <p className="text-xs text-type-muted">Content coming soon</p>

        <div className="flex items-center gap-3 mt-6">
          {/* Primary button */}
          <button
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-action-primary-on-primary transition-colors"
            style={{
              background: "linear-gradient(to right, var(--action-primary-default-gradient-start), var(--action-primary-default-gradient-end))",
            }}
          >
            <Icon name="add" size={18} className="text-action-primary-on-primary" />
            Primary action
          </button>

          {/* Secondary button */}
          <button className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-action-secondary-on-secondary border border-action-secondary-outline hover:bg-action-secondary-hover transition-colors">
            <Icon name="tune" size={18} className="text-type-muted" />
            Secondary action
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Home page ─────────────────────────────────────────────────────

const UPCOMING_MEETINGS = [
  { id: "m1", month: "APR", day: "15", name: "Regular Board Meeting", fullDate: "Tue, April 15, 2026", time: "6:00 PM", location: "District Office · Board Room", status: "Draft" as const, visibility: "Public" as const },
  { id: "m2", month: "APR", day: "22", name: "Finance Committee",     fullDate: "Wed, April 22, 2026", time: "5:30 PM", location: "District Office · Room 204",   status: "Published" as const, visibility: "Internal" as const },
  { id: "m3", month: "MAY", day:  "3", name: "Special Board Meeting", fullDate: "Sun, May 3, 2026",    time: "4:00 PM", location: "Superintendent's Conference Room", status: "Draft" as const, visibility: "Internal" as const },
  { id: "m4", month: "MAY", day: "14", name: "Audit & Risk Review",   fullDate: "Thu, May 14, 2026",   time: "3:00 PM", location: "District Office · Room 101",   status: "Published" as const, visibility: "Public" as const },
  { id: "m5", month: "MAY", day: "20", name: "Budget Workshop",       fullDate: "Wed, May 20, 2026",   time: "9:00 AM", location: "District Office · Board Room", status: "Draft" as const, visibility: "Public" as const },
];

const RECENT_MEETINGS = [
  { id: "m6", name: "Regular Board Meeting", date: "Mar 18, 2026", status: "Published" as const, visibility: "Public" as const },
  { id: "m7", name: "Audit Committee",       date: "Mar 10, 2026", status: "Published" as const, visibility: "Internal" as const },
  { id: "m8", name: "Finance Committee",     date: "Feb 25, 2026", status: "Published" as const, visibility: "Internal" as const },
];

type AgendaStatus = "Action Needed" | "Submitted" | "Approved" | "Rejected" | "Draft";

const AGENDA_ITEMS: { id: string; title: string; status: AgendaStatus; isApprover: boolean }[] = [
  { id: "a1", title: "Budget Amendment FY2026",        status: "Action Needed", isApprover: true  },
  { id: "a2", title: "Capital Projects Update Q1",     status: "Submitted",     isApprover: false },
  { id: "a3", title: "Policy Revision 4.1.2",          status: "Draft",         isApprover: false },
  { id: "a4", title: "Staff Recognition Program",      status: "Approved",      isApprover: false },
  { id: "a5", title: "Community Outreach Initiative",  status: "Submitted",     isApprover: false },
];

const FEATURED_POLICIES = [
  { id: "p1", title: "Board Governance Policy",    subtitle: "Section 2.4" },
  { id: "p2", title: "Conflict of Interest Policy", subtitle: "Section 7.1" },
];

const FEATURED_DOCUMENTS = [
  { id: "d1", title: "Annual Report 2025"        },
  { id: "d2", title: "Strategic Plan 2025–2028"  },
];

const FEATURED_GOALS = [
  { id: "g1", title: "Student Achievement Rate",   progress: 78  },
  { id: "g2", title: "Budget Utilization",          progress: 100 },
  { id: "g3", title: "Community Engagement Index", progress: 32  },
];

const BOARD_MEMBERS = [
  { name: "Dr. Patricia Chen", role: "Board President" },
  { name: "Marcus Williams",   role: "Vice President"  },
  { name: "Sarah Johnson",     role: "Board Member"    },
  { name: "Robert Okafor",     role: "Board Member"    },
  { name: "Linda Torres",      role: "Board Member"    },
  { name: "James Huang",       role: "Board Member"    },
  { name: "Emily Nakamura",    role: "Board Member"    },
];

const WELCOME_PARA_1 = `The Emerald City School District Board of Education meets on the third Tuesday of each month at 6:30 PM in the District Office Board Room, 1234 Emerald Avenue.`;

const WELCOME_PARA_2 = `Public comment is accepted at the start of each meeting. Speakers must sign in by 6:15 PM and are allotted three minutes. Written comments may be submitted to board@ecsd.edu at least 24 hours prior to the meeting. Board packets are made available to the public 72 hours before each regular meeting.`;

function HomeMeetingStatusBadge({ status }: { status: "Draft" | "Published" }) {
  const styles = {
    Draft: { bg: "#F3F3F3", text: "#515255" },
    Published: { bg: "#E4F3FF", text: "#004C6C" },
  };
  const s = styles[status];
  return (
    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap" style={{ background: s.bg, color: s.text }}>
      {status}
    </span>
  );
}

function HomeVisibilityBadge({ visibility }: { visibility: "Public" | "Internal" }) {
  return (
    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap border" style={{ background: "transparent", color: "var(--type-muted)", borderColor: "var(--outline-static)" }}>
      {visibility}
    </span>
  );
}

function AgendaStatusPill({ status }: { status: AgendaStatus }) {
  const styles: Record<AgendaStatus, { bg: string; text: string }> = {
    "Action Needed": { bg: "var(--status-warning-bg-default)",      text: "var(--status-warning-content-default)"      },
    "Submitted":     { bg: "var(--status-notification-bg-variant)", text: "var(--status-notification-content-variant)" },
    "Approved":      { bg: "var(--status-success-bg-variant)",      text: "var(--status-success-content-variant)"      },
    "Rejected":      { bg: "var(--status-error-bg-variant)",        text: "var(--status-error-content-variant)"        },
    "Draft":         { bg: "var(--status-neutral-bg-variant)",      text: "var(--status-neutral-content-variant)"      },
  };
  const s = styles[status];
  return (
    <span className="text-xs font-medium px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap"
      style={{ background: s.bg, color: s.text }}>
      {status}
    </span>
  );
}

function MinutesStatusPill({ status }: { status: string }) {
  const styles: Record<string, { bg: string; text: string }> = {
    None:     { bg: "var(--status-neutral-bg-variant)",      text: "var(--status-neutral-content-variant)"      },
    Draft:    { bg: "var(--status-warning-bg-variant)",      text: "var(--status-warning-content-variant)"      },
    Adopted:  { bg: "var(--status-success-bg-variant)",      text: "var(--status-success-content-variant)"      },
    Released: { bg: "var(--status-notification-bg-variant)", text: "var(--status-notification-content-variant)" },
  };
  const s = styles[status] ?? styles["None"];
  return (
    <span className="text-xs font-medium px-2 py-0.5 rounded-full shrink-0"
      style={{ background: s.bg, color: s.text }}>
      {status}
    </span>
  );
}

function GoalProgressBar({ progress }: { progress: number }) {
  const color =
    progress >= 100 ? "var(--status-success-bg-default)" :
    progress >= 40  ? "var(--status-warning-bg-default)" :
                      "var(--status-neutral-bg-default)";
  return (
    <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "var(--outline-static)" }}>
      <div className="h-full rounded-full" style={{ width: `${Math.min(progress, 100)}%`, background: color }} />
    </div>
  );
}

function HomePage({ onNavigate, onViewMeeting }: { onNavigate: (id: PageId) => void; onViewMeeting: (meetingId: string) => void }) {
  const [welcomeExpanded, setWelcomeExpanded] = useState(false);
  const [agendaExpanded, setAgendaExpanded]   = useState(false);

  const pinnedAgenda  = AGENDA_ITEMS.filter((i) =>  i.isApprover);
  const otherAgenda   = AGENDA_ITEMS.filter((i) => !i.isApprover);
  const sortedAgenda  = [...pinnedAgenda, ...otherAgenda];
  const hiddenCount   = sortedAgenda.length - 3;
  const visibleAgenda = agendaExpanded ? sortedAgenda : sortedAgenda.slice(0, 3);

  return (
    <div className="flex flex-col gap-6 p-6 pb-12">

      {/* Page title */}
      <h1 className="text-2xl font-semibold text-type tracking-tight shrink-0">Home</h1>

      <div className="flex gap-6 items-start">

      {/* ── Left column (primary) ── */}
      <div className="flex-1 min-w-0 flex flex-col gap-6">

        {/* Meetings — no outer container */}
        <div className="rounded-xl border border-outline-static bg-surface overflow-hidden">
          {/* Header with inline "View all" */}
          <div className="flex items-center justify-between px-5 pt-4 pb-4">
            <h2 className="text-sm font-semibold text-type">Meetings</h2>
            <button onClick={() => onNavigate("meetings")}
              className="text-xs text-type-muted cursor-pointer">
              View all meetings →
            </button>
          </div>

          {/* Upcoming label */}
          <p className="text-xs font-semibold text-type-muted uppercase tracking-wide px-5 pb-2">Upcoming</p>

          {/* Upcoming cards */}
          <div className="grid grid-cols-2 gap-3 px-5 pb-4">
            {UPCOMING_MEETINGS.slice(0, 4).map((m) => (
              <div key={m.id}
                onClick={() => onViewMeeting(m.id)}
                className="flex items-start gap-3 p-3 rounded-xl border border-outline-static bg-surface cursor-pointer hover:bg-selection-hover transition-colors"
              >
                {/* Calendar block */}
                <div className="flex flex-col items-center justify-center w-10 shrink-0 rounded-lg py-1.5 bg-selection">
                  <span className="text-[9px] font-semibold text-action-primary uppercase tracking-wider leading-none mb-0.5">{m.month}</span>
                  <span className="text-lg font-bold text-action-primary leading-tight">{m.day}</span>
                </div>
                {/* Details */}
                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                  <span className="text-sm font-semibold text-type leading-snug">{m.name}</span>
                  <span className="text-xs text-type-muted truncate">{m.fullDate} · {m.time}</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <HomeMeetingStatusBadge status={m.status} />
                    {m.status === "Published" && <HomeVisibilityBadge visibility={m.visibility} />}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent */}
          <div className="px-5 pt-3 pb-4 border-t border-outline-static bg-surface">
            <p className="text-xs font-semibold text-type-muted uppercase tracking-wide mb-2">Recent</p>
            <ul className="flex flex-col divide-y divide-outline-static">
              {RECENT_MEETINGS.map((m) => (
                <li key={m.id}
                  className="flex items-center justify-between gap-3 py-2 cursor-pointer hover:bg-selection-hover transition-colors"
                  onClick={() => onViewMeeting(m.id)}>
                  <div className="flex items-center gap-2 min-w-0">
                    <Icon name="event" size={14} className="text-type-disabled shrink-0" />
                    <span className="text-xs font-semibold text-type truncate">{m.name}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-type-muted">{m.date}</span>
                    <HomeMeetingStatusBadge status={m.status} />
                    {m.status === "Published" && <HomeVisibilityBadge visibility={m.visibility} />}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* My Agenda Items */}
        <div className="rounded-xl border border-outline-static bg-surface overflow-hidden">
          <div className="px-5 pt-4 pb-3 border-b border-outline-static">
            <h2 className="text-sm font-semibold text-type">My Agenda Items</h2>
          </div>
          <ul className="flex flex-col divide-y divide-outline-static">
            {visibleAgenda.map((item) => (
              <li key={item.id}
                className="flex items-center justify-between gap-3 px-5 py-3 cursor-pointer hover:bg-selection-hover transition-colors"
                onClick={() => onNavigate("agenda")}>
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon name="checklist" size={16} className="text-type-disabled shrink-0" />
                  <span className="text-sm text-type leading-snug truncate">{item.title}</span>
                </div>
                <AgendaStatusPill status={item.status} />
              </li>
            ))}
          </ul>
          {hiddenCount > 0 && (
            <div className="px-5 py-3 border-t border-outline-static">
              <button onClick={() => setAgendaExpanded((v) => !v)}
                className="text-xs text-action-primary hover:underline">
                {agendaExpanded ? "Show less" : `Show ${hiddenCount} more`}
              </button>
            </div>
          )}
        </div>

        {/* Featured — header */}
        <div>
          <div className="mb-3">
            <h2 className="text-sm font-semibold text-type">Featured</h2>
            <p className="text-xs text-type-muted mt-0.5">Selected by your administrator</p>
          </div>

          {/* Policies + Files — side by side */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Policies card */}
            <div className="rounded-xl border border-outline-static bg-surface overflow-hidden">
              <div className="flex items-center justify-between px-4 pt-3 pb-2">
                <span className="text-xs font-semibold text-type-muted uppercase tracking-wide">Policies</span>
                <button onClick={() => onNavigate("policies")}
                  className="text-xs text-action-primary hover:underline">View all</button>
              </div>
              <ul className="flex flex-col divide-y divide-outline-static">
                {FEATURED_POLICIES.map((p) => (
                  <li key={p.id}
                    className="flex items-center justify-between gap-3 py-2.5 px-4 cursor-pointer hover:bg-selection-hover transition-colors"
                    onClick={() => onNavigate("policies")}>
                    <div className="flex items-center gap-2 min-w-0">
                      <Icon name="gavel" size={14} className="text-type-disabled shrink-0" />
                      <span className="text-sm text-type leading-snug truncate">{p.title}</span>
                    </div>
                    <span className="text-xs text-type-muted shrink-0">{p.subtitle}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Files card */}
            <div className="rounded-xl border border-outline-static bg-surface overflow-hidden">
              <div className="flex items-center justify-between px-4 pt-3 pb-2">
                <span className="text-xs font-semibold text-type-muted uppercase tracking-wide">Files</span>
                <button onClick={() => onNavigate("library-files")}
                  className="text-xs text-action-primary hover:underline">View all</button>
              </div>
              <ul className="flex flex-col divide-y divide-outline-static">
                {FEATURED_DOCUMENTS.map((d) => (
                  <li key={d.id}
                    className="flex items-center gap-2 py-2.5 px-4 cursor-pointer hover:bg-selection-hover transition-colors"
                    onClick={() => onNavigate("library-files")}>
                    <Icon name="description" size={14} className="text-type-disabled shrink-0" />
                    <span className="text-sm text-type leading-snug">{d.title}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Goals */}
          <div className="rounded-xl border border-outline-static bg-surface overflow-hidden">
            <div className="flex items-center justify-between px-4 pt-3 pb-2">
              <span className="text-xs font-semibold text-type-muted uppercase tracking-wide">Goals</span>
              <button onClick={() => onNavigate("library-goals")}
                className="text-xs text-action-primary hover:underline">View all</button>
            </div>
            <ul className="flex flex-col divide-y divide-outline-static">
              {FEATURED_GOALS.map((g) => (
                <li key={g.id}
                  className="flex flex-col gap-1.5 py-2.5 px-4 cursor-pointer hover:bg-selection-hover transition-colors"
                  onClick={() => onNavigate("library-goals")}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Icon name="flag" size={14} className="text-type-disabled shrink-0" />
                      <span className="text-sm text-type leading-snug truncate">{g.title}</span>
                    </div>
                    <span className="text-xs text-type-muted shrink-0">{g.progress}%</span>
                  </div>
                  <GoalProgressBar progress={g.progress} />
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>

      {/* ── Right column (secondary) ── */}
      <div className="w-[28%] shrink-0 flex flex-col gap-6">

        {/* Welcome message — no container chrome */}
        <div>
          {/* Org name + logo on right */}
          <div className="flex items-center justify-between gap-3 mb-3">
            <h2 className="text-sm font-semibold text-type leading-snug">
              Emerald City School District
            </h2>
            <img src="/org-logo.png" alt="Organization logo"
              className="w-12 h-12 shrink-0 object-contain mix-blend-multiply dark:mix-blend-screen dark:invert" />
          </div>

          {/* Two-paragraph body — plain div so line-clamp works */}
          <div className={!welcomeExpanded ? "line-clamp-6" : ""}>
            <p className="text-[11px] text-type-muted leading-relaxed">{WELCOME_PARA_1}</p>
            <p className="text-[11px] text-type-muted leading-relaxed mt-2">{WELCOME_PARA_2}</p>
          </div>
          <button onClick={() => setWelcomeExpanded((v) => !v)}
            className="mt-1.5 text-[11px] text-action-primary hover:underline">
            {welcomeExpanded ? "Show less" : "Show more"}
          </button>
        </div>

        {/* Board members — no container chrome */}
        <div>
          <h2 className="text-xs font-semibold text-type-muted uppercase tracking-wide mb-2">
            Board Members
          </h2>
          <ul className="flex flex-col gap-1.5">
            {BOARD_MEMBERS.map((m) => (
              <li key={m.name} className="leading-tight">
                <span className="text-xs text-type">{m.name}</span>
                <span className="text-[11px] text-type-muted"> · {m.role}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      </div>{/* end two-column flex */}
    </div>
  );
}

// ── App shell ────────────────────────────────────────────────────

export default function AppShell({ children }: { children?: React.ReactNode }) {
  const [activePage, setActivePage] = useState<PageId>("home");
  const [darkMode, setDarkMode]     = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [initialMeetingId, setInitialMeetingId] = useState<string | undefined>();

  const handleViewMeeting = (meetingId: string) => {
    setInitialMeetingId(meetingId);
    setActivePage("meetings");
  };

  const handleNavigate = (id: PageId) => {
    setInitialMeetingId(undefined);
    setActivePage(id);
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <div className="flex h-screen overflow-hidden bg-background-base">
      <Sidebar
        activePage={activePage}
        onNavigate={handleNavigate}
        expanded={sidebarExpanded}
        onToggle={() => setSidebarExpanded((v) => !v)}
      />
      <div className="flex flex-col flex-1 min-w-0">
        <GlobalHeader
          darkMode={darkMode}
          onToggleDark={() => setDarkMode((d) => !d)}
        />
        <main
          className="flex-1 overflow-auto"
          style={{
            background: "linear-gradient(to bottom, var(--background-base-gradient-start) 0%, var(--background-base) 31%, var(--background-base-gradient-end) 100%)",
          }}
        >
          {children ?? (
            activePage === "home"
              ? <HomePage onNavigate={handleNavigate} onViewMeeting={handleViewMeeting} />
              : activePage === "meetings"
              ? <MeetingsPage initialMeetingId={initialMeetingId} />
              : <PagePlaceholder page={activePage} />
          )}
        </main>
      </div>
    </div>
  );
}
