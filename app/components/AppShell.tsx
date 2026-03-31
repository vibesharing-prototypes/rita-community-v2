"use client";

import { useState, useEffect } from "react";

// ── Types ────────────────────────────────────────────────────────

export type PageId =
  | "home"
  | "meetings"
  | "agenda"
  | "policies"
  | "library"
  | "settings";

type NavItemConfig = {
  id: PageId;
  label: string;
  icon: string;
  badge?: number;
};

// ── Nav config ───────────────────────────────────────────────────

const PRIMARY_NAV: NavItemConfig[] = [
  { id: "home", label: "Home", icon: "home" },
  { id: "meetings", label: "Meetings", icon: "calendar_month" },
  { id: "agenda", label: "Agenda items", icon: "checklist", badge: 3 },
  { id: "policies", label: "Policies", icon: "gavel" },
  { id: "library", label: "Library", icon: "folder_open" },
];

// ── Icon primitive ───────────────────────────────────────────────

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

// ── Nav item ─────────────────────────────────────────────────────

function NavItem({
  icon,
  label,
  active = false,
  badge,
  external = false,
  onClick,
}: {
  icon: string;
  label: string;
  active?: boolean;
  badge?: number;
  external?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium",
        "transition-colors duration-100 select-none",
        active
          ? "text-action-primary bg-selection"
          : "text-type-muted hover:bg-selection-hover hover:text-type",
      ].join(" ")}
      style={
        active ? { boxShadow: "inset 2px 0 0 var(--action-primary)" } : undefined
      }
    >
      <Icon
        name={icon}
        size={20}
        className={active ? "text-action-primary" : ""}
      />
      <span className="flex-1 text-left leading-snug truncate">{label}</span>

      {badge !== undefined && badge > 0 && (
        <span className="bg-action-primary text-action-on-primary text-[10px] font-semibold rounded-full px-1.5 min-w-[18px] h-[18px] flex items-center justify-center leading-none shrink-0">
          {badge > 99 ? "99+" : badge}
        </span>
      )}

      {external && (
        <Icon name="open_in_new" size={14} className="text-type-disabled opacity-70" />
      )}
    </button>
  );
}

// ── Sidebar logo ─────────────────────────────────────────────────

function SidebarLogo() {
  return (
    <div className="h-14 flex items-center px-4 border-b border-outline shrink-0 gap-3">
      {/* Diligent brand mark */}
      <div className="w-7 h-7 rounded flex items-center justify-center shrink-0 bg-[#C8102E]">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path
            d="M2 2h5.5C10.537 2 13 4.462 13 7s-2.463 5-5.5 5H2V2z"
            fill="white"
          />
        </svg>
      </div>
      <span className="text-type font-semibold text-sm tracking-tight">Diligent</span>
    </div>
  );
}

// ── Icon button (header) ─────────────────────────────────────────

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
      className="relative w-9 h-9 flex items-center justify-center rounded-md text-type-muted hover:bg-selection-hover hover:text-type transition-colors"
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
    <header className="h-14 shrink-0 flex items-center justify-between px-5 bg-surface border-b border-outline">
      {/* Org name */}
      <button className="flex items-center gap-1 text-sm font-medium text-type hover:text-type-muted transition-colors">
        <span>Emerald City School District</span>
        <Icon name="expand_more" size={18} className="text-type-muted" />
      </button>

      {/* Utility cluster */}
      <div className="flex items-center gap-0.5">
        {/* Theme toggle — prototype helper */}
        <HeaderIconButton
          icon={darkMode ? "light_mode" : "dark_mode"}
          label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          onClick={onToggleDark}
        />

        {/* Search */}
        <HeaderIconButton icon="search" label="Search" />

        {/* Notifications */}
        <HeaderIconButton icon="notifications" label="Notifications">
          {/* Unread dot */}
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#C8102E] border-2 border-surface"
            aria-hidden="true"
          />
        </HeaderIconButton>

        {/* Avatar */}
        <button
          aria-label="Profile"
          className="ml-1 w-8 h-8 rounded-full bg-action-primary flex items-center justify-center text-action-on-primary text-xs font-semibold shrink-0 hover:opacity-90 transition-opacity"
        >
          JS
        </button>
      </div>
    </header>
  );
}

// ── Sidebar ──────────────────────────────────────────────────────

function Sidebar({
  activePage,
  onNavigate,
}: {
  activePage: PageId;
  onNavigate: (id: PageId) => void;
}) {
  return (
    <aside className="w-[220px] shrink-0 flex flex-col bg-surface border-r border-outline">
      <SidebarLogo />

      {/* Primary nav */}
      <nav className="flex-1 py-2 overflow-y-auto" aria-label="Primary navigation">
        {PRIMARY_NAV.map((item) => (
          <NavItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            badge={item.badge}
            active={activePage === item.id}
            onClick={() => onNavigate(item.id)}
          />
        ))}
      </nav>

      {/* Utility nav */}
      <div className="shrink-0 border-t border-outline py-2" aria-label="Utility navigation">
        <NavItem
          icon="settings"
          label="Settings"
          active={activePage === "settings"}
          onClick={() => onNavigate("settings")}
        />
        <NavItem
          icon="open_in_new"
          label="Public site"
          external
          onClick={() => {}}
        />
      </div>
    </aside>
  );
}

// ── Page placeholder ─────────────────────────────────────────────

const PAGE_META: Record<PageId, { title: string; breadcrumb: string }> = {
  home: { title: "Home", breadcrumb: "Home" },
  meetings: { title: "Meetings", breadcrumb: "Meetings" },
  agenda: { title: "Agenda items", breadcrumb: "Agenda items" },
  policies: { title: "Policies", breadcrumb: "Policies" },
  library: { title: "Library", breadcrumb: "Library" },
  settings: { title: "Settings", breadcrumb: "Settings" },
};

function PagePlaceholder({ page }: { page: PageId }) {
  const meta = PAGE_META[page];
  return (
    <div className="p-8 max-w-5xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-type-muted mb-5">
        <span className="hover:text-type cursor-pointer transition-colors">Community v2</span>
        <Icon name="chevron_right" size={14} className="text-type-disabled" />
        <span className="text-type">{meta.breadcrumb}</span>
      </div>

      {/* Page title */}
      <h1 className="text-2xl font-semibold text-type mb-6 tracking-tight">
        {meta.title}
      </h1>

      {/* Placeholder card */}
      <div className="rounded-lg border border-outline bg-surface p-12 flex flex-col items-center justify-center gap-3 text-center">
        <div className="w-10 h-10 rounded-full bg-selection flex items-center justify-center">
          <Icon
            name={PRIMARY_NAV.find((n) => n.id === page)?.icon ?? "grid_view"}
            size={20}
            className="text-action-primary"
          />
        </div>
        <p className="text-sm font-medium text-type">{meta.title}</p>
        <p className="text-xs text-type-muted">Content coming soon</p>
      </div>
    </div>
  );
}

// ── App shell ────────────────────────────────────────────────────

export default function AppShell({ children }: { children?: React.ReactNode }) {
  const [activePage, setActivePage] = useState<PageId>("home");
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <div className="flex h-screen overflow-hidden bg-background-base">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />

      <div className="flex flex-col flex-1 min-w-0">
        <GlobalHeader
          darkMode={darkMode}
          onToggleDark={() => setDarkMode((d) => !d)}
        />
        <main className="flex-1 overflow-auto">
          {children ?? <PagePlaceholder page={activePage} />}
        </main>
      </div>
    </div>
  );
}
