# Navigation Structure — Community V2

## Application Shell

The application uses a two-part persistent shell: a **global header** across the top and a **side navigation** on the left. These are always visible for authenticated users. The main content area fills the remaining space.

---

## Global Header

Persistent across all pages. Contains three utility items, always right-aligned:

- **Search** — global full-text search across meetings, agenda items, policies, and library content
- **Notifications** — in-app notification bell for workflow events (approvals, rejections, meeting updates)
- **Profile** — current user's name/avatar, links to account settings and sign out

The header also displays the **organisation name** on the left (e.g. "Emerald City Board of Education"). There is no committee selector in the header.

### Visual implementation

- Background: `surface-default` (same as sidebar — part of the chrome, not the content area)
- Bottom border: `outline-static` (1px, `thin` border width token)
- Height: 56px (h-14)
- Organisation name: `type-default`, medium weight
- Icon buttons: `rounded-full`, hover state `selection-primary-hover`
- Notification dot: `action-destructive-secondary-default`

---

## Side Navigation

Five primary nav items, plus two utility items at the bottom. Library expands inline as a collapsible group — all other top-level items are flat.

```
Home
Meetings
Agenda items          [badge: pending count]
Policies
Library ▾
  └─ Files
  └─ Goals
  └─ Events
  └─ Board members
────────────────
Settings              (permission-scoped)
Public site ↗         (external link)
```

**Home** — Cross-committee aggregator. Surfaces upcoming meetings (all committees), agenda items pending the user's action, featured policies, and featured library items. Permission-scoped: each user sees only content their role allows. No manual curation required to populate — meetings surface automatically by date.

**Meetings** — Full meeting management. Create, edit, publish, archive. Committee filter lives here as a tab or dropdown at the top of the list — it is not a global selector. Meetings carry a committee tag visible on every list item and card. Scoped by committee only within this section.

**Agenda items** — Personal submission queue for publishers. Create, edit, and submit agenda items into the approval workflow. Independent of the meeting builder — items are assigned to a meeting at submission time. Shows a live badge with the count of items in an actionable state (draft, rejected, awaiting the user's action). This is a first-level nav item, not nested under Meetings.

**Policies** — Organisation-wide policy library. Books → Sections → Policies hierarchy. Not committee-scoped — all policies are shared across the organisation.

**Library** — Organisation-wide document repository. The Library nav item expands inline in the side navigation as a collapsible group. Each of the four sub-items is a **direct navigation destination** — its own standalone page. There is no "Library" landing page; the group is an expandable container only. Clicking Library in the nav expands or collapses the group. Clicking a sub-item navigates directly to that content page.

- **Files** — general documents (contracts, reports, bylaws, reference materials)
- **Goals** — strategic objectives with 0–100% progress tracking, colour-coded by completion. Goals can be linked to agenda items.
- **Events** — calendar-style items surfaced on the public portal
- **Board members** — member profiles with names, titles, and photos

Not committee-scoped — all Library content is shared across the organisation.

**Settings** — Organisation and committee configuration. Visible to Admin and SuperPublisher roles only; hidden for Publisher, Executive, and anonymous users. SuperPublisher has full access (committee CRUD, user management, site config, approval trees). Admin has scoped access depending on per-committee permissions.

**Public site ↗** — External link to the public-facing portal. Opens in a new tab. Visible to all authenticated roles.

### Visual implementation

- Sidebar background: `surface-default` (chrome, not content area)
- Right border: `outline-static` (1px, `thin` border width token)
- Width expanded: 220px — collapsed: 60px
- Nav item height: ~36px (py-2 + text)
- **Selected state**: `selection-primary-default` background, `action-primary-default` text/icon, `rounded-xl` (Atlas `lg`, 12px)
- **Hover state**: `selection-primary-hover` background, `type-default` text/icon
- **Default state**: `type-muted` text/icon
- Badge (pending count): `action-primary-default` background, `action-primary-on-primary` text, `rounded-full`
- Library chevron: rotates 180° when group is open, `type-disabled` colour
- Sub-items: indented (pl-8 when expanded), same selected/hover states as top-level items, `text-sm`
- Active sub-item highlights parent Library item as "highlighted" (not selected) while sub-item takes the selected style

---

## Role-Scoped Nav

The nav items rendered depend on the user's role. The structure does not change — items are either shown or hidden.

| Nav item | SuperPublisher | Admin / Publisher | Executive |
|---|---|---|---|
| Home | ✓ | ✓ | ✓ |
| Meetings | ✓ full | ✓ full | ✓ read-only |
| Agenda items | ✓ | ✓ | — hidden |
| Policies | ✓ | ✓ | ✓ |
| Library | ✓ | ✓ | ✓ |
| Settings | ✓ full | ✓ scoped | — hidden |
| Public site | ✓ | ✓ | ✓ |

**Publisher vs Admin nav is identical.** The difference between these roles is what actions are available within each section (e.g. only admins can publish a meeting to the public portal), not what appears in the navigation.

**Executive sees Meetings as read-only.** The nav item is visible but meeting creation, editing, and publishing actions are not rendered. Executives review agendas and attend meetings; they do not manage them.

**Agenda items is hidden for Executives.** The submission workflow is a publisher/staff function only. Executives participate in meetings directly, not through the item submission queue.

---

## Committee Scoping Rules

Committee selection is **not global**. It is a filter within the Meetings section only.

- **Meetings** — filtered by committee. The committee selector (tabs or dropdown) appears at the top of the Meetings list. Default is "All committees".
- **Home** — always cross-committee. Meetings shown on Home carry a committee tag for context.
- **Policies** — organisation-wide. No committee filter.
- **Library** — organisation-wide. No committee filter.
- **Agenda items** — shows the current user's own items across all committees.
