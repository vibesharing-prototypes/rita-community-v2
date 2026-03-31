# Feature Brief: Home Page

## What This Page Is

The home page is the **landing surface for authenticated internal users** — board admins, board members, and staff. It serves as a **notice board**: a single compact view that surfaces what is most relevant right now. Meetings, workflow items, and admin-curated resources — nothing else.

This is **not a dashboard**. No charts, no analytics, no filters, no tabs within sections. It is a time-aware and curated aggregation of things a user needs to act on or be aware of.

The page was known as "Featured" or "Packet" in legacy systems. In v2 it is simply called **Home**.

---

## Design Principles for This Page

- **Compact and scannable.** Every section should be immediately digestible. No section should feel heavy.
- **No in-page filtering or tab sub-navigation.** Sections are static. Users navigate to full module pages for deeper browsing.
- **Meetings are time-aware, not curated.** They are not "featured" — they are surfaced automatically by date logic.
- **Featured sections are explicitly admin-curated.** The word "Featured" applies only to policies, documents, and goals — not meetings or agenda items.
- **The page reads top to bottom.** Primary actions first, supporting context last.

---

## Page Layout

Two-column layout:

| Column | Role | Width |
|---|---|---|
| **Left / primary** | Content blocks (meetings, agenda items, featured) | ~70–72% |
| **Right / secondary** | Welcome message + Board Members | ~28–30% |

The right column is visually subordinate — lower weight, supporting context only. The left column is what users come for.

---

## Right Column: Secondary Info Panel

### Welcome Message

Admin-configured organizational text (title, description, rich-text body). Shared with the public portal's home tab — not a separate field.

**Logo support:** If the organization has configured a custom logo, it appears inline next to the welcome message title. The logo is set in site settings and displayed at a fixed, compact size. It does not replace the site header logo — it is an optional contextual branding element within the welcome block.

**Long content handling:** If the welcome body exceeds 6 visible lines, the container collapses to 6 lines with a subtle "Show more" expand control. Expanding reveals the full text in place. This prevents the left column from dominating vertical space on information-dense welcome configurations.

**Typical content:** meeting schedule, location, public comment instructions, general org context.

### Board Members

Automatically populated from library items of type `board member`. Shows name and role/title. Read-only from this page — members are managed in the Library → Board members page.

Displayed as a simple stacked list beneath the welcome message. No grid, no columns. Name + title per row.

---

## Left Column: Primary Content Blocks

### Block 1 — Meetings

**Not a "featured" block.** Automatically populated by date logic — no admin curation required.

**Two visual tiers within the block:**

**Upcoming meetings** — primary, visually highlighted. Displayed with higher visual weight: larger text, prominent date, clear meeting name. These are the main call-to-attention. Sorted ascending (soonest first). All active future-dated meetings are shown.

**Recent meetings** — secondary, visually de-emphasized. Smaller, lower contrast. Shows the 3 most recently completed meetings sorted descending. Displays minutes status inline (None / Draft / Adopted / Released) so admins can track post-meeting work at a glance.

Meetings manually pinned (`isCurrent = true`) are shown at the top of the upcoming tier regardless of date.

**What this replaces:** BoardDocs required manual admin curation for meetings on the packet, leading to stale content. v2's time-based logic means the block is always current without admin intervention.

---

### Block 2 — My Agenda Items

A simple, compact list of agenda items currently in the user's approval workflow. **No filters. No tabs.**

Each item shows:
- Item title
- Status indicator (color-coded pill or icon: Draft / Submitted / Approved / Rejected / Action Needed)

Items where the current user is the designated approver (`isApprover = true`) are pinned to the top of the list.

**Expand behavior:** If the user has more than 3 items, the list shows 3 by default with a subtle "Show N more" expand control. Expanding reveals all items inline without pagination.

Only visible to users with workflow involvement. Hidden entirely if the user has no active agenda items.

---

### Block 3 — Featured

A single grouped section containing admin-curated items across three content types: **Policies**, **Documents**, and **Goals**.

**Section header:** "Featured" with a subtle subtitle: *"Selected by your administrator"* (or similar — short, plain, low-weight text that explains the curation source without over-explaining it).

Items are displayed in a compact list format. Goals include a progress indicator (color-coded bar: <40% gray, 40–99% yellow, 100% green). Policies and documents show title and type label only.

**View all navigation:** Each content type within the Featured section includes a subtle inline "View all" link that navigates to the relevant page. This is not a button — it is a low-weight text link aligned to the section or type heading.

**Empty state:** If no items have been featured by the admin, the Featured section is hidden entirely. No empty message, no placeholder — the section simply does not render.

---

## Block Trimming

Each block shows a **maximum of 5 items** by default (except My Agenda Items, which uses 3). A "Show more" or "Show all N" control reveals hidden items inline. Threshold is configurable server-side per deployment.

Blocks with no items are **removed from the page entirely** — not shown as empty sections.

---

## Page Title / Fallback State

The page is always labeled **Home**.

When no featured content has been configured (new org, nothing curated yet), the Featured block is hidden. The page still renders with the Meetings block and My Agenda Items if applicable. This is a valid, non-broken state — not a fallback that requires a label change.

---

## Cross-Module Navigation

Clicking any item on the home page navigates to the correct page:

- Upcoming/recent meeting → Meetings page, meeting selected
- My Agenda Item → Meetings page, item in context
- Featured Policy → Policies page, book expanded, policy selected
- Featured Document → Library → Files page, item selected
- Featured Goal → Library → Goals page, goal selected
- "View all" Policies link → Policies page
- "View all" Documents link → Library → Files page
- "View all" Goals link → Library → Goals page

Navigation uses **programmatic routing** (URL/state changes). Each item carries sufficient metadata: item ID, committee ID, module target, hierarchy context. If a target item is deleted or the user lacks access, navigation shows an error rather than silently failing.

---

## Content and Role Filtering

Block content is **filtered and sorted server-side** based on the requesting user's role. The client does not perform filtering or sorting.

- 3-tier visibility model applies (Public / Admin / Executive) — home page is authenticated-only, but tier rules still govern what appears within blocks
- My Agenda Items only returns items for the current user
- Goals, Documents, and Policy blocks respect tier-based access

---

## Left Column: Design Intent

In BoardDocs, the secondary column occupied ~40% of screen width and competed visually with featured content. In v2:

- The panel is narrower (~28–30%) and placed on the right
- Lower visual weight — subdued background, smaller type, no action affordances
- Welcome message collapses if long (>6 lines)
- Logo appears next to title if configured, without inflating the column
- Board Members list is a simple stacked list — no grid, no visual noise

The right column is **reference information**, not action-oriented content. It should feel like a sidebar, not a co-equal panel.

---

## What This Page Is Not

- Not a public-facing page (public portal has its own separate home)
- Not a dashboard with analytics or aggregate counts
- Not a notification inbox
- Not a live meeting surface (that is the MCP)
- Not a filtered/tabbed view of any module

---

## Out of Scope

- Public portal featured page (separate feature)
- Real-time goal progress via WebSocket (future)
- AI-assisted content summarization (future)
- Bulk add/remove from featured (future)
- Per-user block ordering preferences (future)
