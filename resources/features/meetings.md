# Community v2 — Meeting Management Feature Spec
**Version:** 0.1 (First Draft for Iteration)
**Scope:** Meeting CRUD · Status Lifecycle · Meeting List · Templates

---

## 1. Overview

Meetings are the primary object in Community v2. Everything else (agenda, minutes, voting, video) is attached to a meeting. This spec covers:

- Meeting list views (dashboard + archive)
- Meeting creation flow
- Meeting detail & editing
- Status lifecycle (Draft → Active → Deleted)
- Meeting duplication
- Template management (create, edit, instantiate, archive)

**Out of scope for this spec:** Agenda management, Minutes, Voting, MCP (covered in separate feature specs).

---

## 2. Design Decisions

| # | Decision |
|---|----------|
| D1 | Single "Meetings" nav item. Upcoming and Previous as tabs within the same view. |
| D2 | Meetings list has two sections: a dashboard section (upcoming + recent) and a year-grouped archive (Previous tab). |
| D3 | Explicit `+ New Meeting` button always visible in the top right of the Meetings list. |
| D4 | Meeting creation flow starts with a template selector as step 1. |
| D5 | Templates are accessible as a tab within the Meetings section, not under Settings. |
| D6 | Every meeting list row shows a status badge (Draft / Active) and an agenda status badge. |
| D7 | Creating a meeting from a template pre-populates both the agenda structure and the minutes structure. |
| D8 | Template list rows include a direct "Create meeting from this template" action. |
| D9 | All status transitions are server-validated. No optimistic client-side updates. Errors returned as structured JSON and displayed inline. |
| D10 | Status badges are read-only. Publish and Unpublish are explicit CTA buttons in the meeting detail header. |

---

## 3. Status Lifecycle

```
[TEMPLATE] ──(Create from template)──→ [DRAFT]
                                           │
                         (Publish)         │       (Unpublish)
                            └─────────→ [ACTIVE] ←──────────┘
                                           │
                                     (Delete) ↓
                                        [DELETED]

DRAFT ──(Delete)──→ DELETED
TEMPLATE ──(Delete)──→ DELETED
```

**Rules:**
- Templates only produce Drafts (via duplication). No direct activation from template.
- `DRAFT → ACTIVE`: server validates. Rejects with structured errors if invalid (e.g. missing date).
- `ACTIVE → DRAFT`: allowed. Warns if meeting date is in the past.
- No `ACTIVE → TEMPLATE` path. Templates are created independently or duplicated from templates.
- Deletion of a Draft with approved agenda items requires explicit confirmation listing at-risk items.
- All transitions are server-validated. Client never optimistically updates status.

---

## 4. Meeting List

### 4.1 Page Structure

The Meetings page defaults to the Upcoming tab. Three tabs total: Upcoming, Previous, and Templates.

```
[ Meetings ]                                   [ + New Meeting ]

[ Upcoming ]  [ Previous ]  [ Templates ]      [ Search... ]  [ Filters ▾ ]

─── UPCOMING ─────────────────────────────────────────────────────
  Apr 15, 2026  Regular Board Meeting        [Draft]   [Edit Agenda]  [⋯]
  Apr 22, 2026  Finance Committee            [Active]  [View]         [⋯]

─── PREVIOUS ─────────────────────────────────────────────────────
  ▶ 2026 (12)
  ▶ 2025 (38)
  ▶ 2024 (41)
```

### 4.2 List Item — Display Fields

| Field | Notes |
|-------|-------|
| Date | `MMM DD, YYYY` |
| Meeting name | From template or manual |
| Status badge | `Draft` / `Active` |
| Agenda status badge | `Not Published` / `Published` / `Out of Sync` — shown on both list row and meeting detail |
| Primary action button | Context-sensitive (see §4.3) |
| Row overflow menu `⋯` | Context-sensitive (see §4.3) |

### 4.3 Actions by Status

| Status | Primary Button | Overflow Menu `⋯` |
|--------|---------------|-------------------|
| Draft | Edit Agenda | Publish · Duplicate · Delete |
| Active | View | Make Draft · Duplicate · Delete |

**Notes:**
- "Make Draft" on an Active meeting with a past date → confirmation warning.
- "Delete" on a Draft with approved agenda items → confirmation listing at-risk items.
- Pre-migration legacy meetings: Duplicate action hidden.

### 4.4 Filters

- Keyword search (meeting name)
- Date range (from / to)
- Committee / Meeting Group (dropdown)
- Status (Draft / Active / All)
- Agenda status (Published / Not Published / Out of Sync)

### 4.5 Archive (Previous tab)

- Year-grouped accordion. Default: current year expanded, all others collapsed.
- Each year shows meeting count.
- Same row structure as Upcoming.

---

## 5. Meeting Creation Flow

### 5.1 Entry Point

`+ New Meeting` button — top right of Meetings list. Always visible.

### 5.2 Flow

```
Step 1: Select template
  └─ Dropdown list of available (non-archived) templates
  └─ "No template" option available (blank meeting)
  └─ Template name auto-fills meeting name (editable)

Step 2: Fill meeting details (modal or side panel)
  └─ Name (pre-filled, editable)
  └─ Date (required)
  └─ Time (optional)
  └─ Duration (optional)
  └─ Location (optional)
  └─ Committee / Meeting Group (required if multiple exist)
  └─ Members only toggle (default: off)
  └─ Public request-to-speak toggle (default: from template)

[ Cancel ]  [ Create Draft ]
```

**On submit:**
- Meeting created in `Draft` status.
- If template selected: agenda categories/items + minutes structure duplicated into the new draft.
- User lands on the Meeting Detail page.

**Validation:**
- Name: required, max 255 chars.
- Date: required, must be parseable `YYYY-MM-DD`.
- Committee: required if org has >1 committee.

---

## 6. Meeting Detail Page

### 6.1 Layout

```
← Meetings

[Meeting Name]                              Apr 15, 2026 · 7:00 PM  [Draft ▾]

─────────────────────────────────────────────────────────────────────────────
AGENDA                             [Edit Agenda]   [Share]   [Publish]
  Status: Not Published
  0 categories · 0 items

─────────────────────────────────────────────────────────────────────────────
MINUTES
  Status: None
  [Edit Minutes]

─────────────────────────────────────────────────────────────────────────────
VIDEO
  [Add Broadcast Link]
```

### 6.2 Status Control

- Status badge (`Draft` / `Active`) is **read-only**. It communicates state, it does not trigger actions.
- Status transitions are driven by explicit CTA buttons:
  - Draft meeting → `[ Publish ]` button (prominent, in the meeting header action area)
  - Active meeting → `[ Unpublish ]` button (secondary, in the meeting header action area)
- Server validates on action. Errors displayed inline below the header (not HTML dialog).
- Unpublishing an Active meeting with a past date → confirmation dialog before proceeding.

### 6.3 Meeting Details Edit

- Inline edit on the meeting header (name, date, time, location) — or via `Edit Details` overflow.
- Fields: Name · Date · Time · Duration · Location · Members only · Public RTS.

---

## 7. Meeting Duplication

### 7.1 Trigger

Overflow menu `⋯` → `Duplicate` on any Draft or Active meeting.

### 7.2 Flow

```
Duplicate Meeting

  Source: "Apr 15, 2026 — Regular Board Meeting"

  Target Committee:    [ Regular Board ▾ ]  ← can be different committee
  New Date:            [ _______ ]  (required)
  New Name:            [ Regular Board Meeting - Apr 15 2026 ]  (editable)

  Agenda Items to include:
  ☑ 1. Call to Order
      ☑ A. Roll Call
      ☑ B. Pledge
  ☑ 2. Public Comments
  ☐ 3. Consent Agenda
      ☐ A. Minutes Approval
  ...

  ☐ Include attachments  (unchecked by default)

  [ Cancel ]  [ Duplicate ]   ← button disabled after first click
```

**Rules:**
- Result is always `Draft` status.
- Agenda structure (categories + items) and minutes structure are always copied.
- Category checkbox toggles all children; checking a child auto-checks parent.
- Attachments opt-in (unchecked by default).
- Pre-migration legacy meetings: Duplicate not available.
- Cross-committee duplication supported.

---

## 8. Template Management

### 8.1 Entry Point

Templates tab within the Meetings page. Peer to Upcoming and Previous.

### 8.2 Template List

```
[ Templates ]

Name                   Committee          Time       Location     Status
─────────────────────────────────────────────────────────────────────────
Regular Board Mtg      Regular Board      7:00 PM    City Hall    Active    [⋯]
Finance Committee      Finance            9:00 AM    Room 2B      Active    [⋯]
Special Session        Regular Board      —          —            Archived  [⋯]
```

- Sort by: Name / Committee / Status.
- Filter: Show archived (toggle, off by default).

### 8.3 Template Row Actions `⋯`

| Action | Notes |
|--------|-------|
| Edit | Opens template editor |
| Create meeting from this template | Shortcut → starts creation flow with this template pre-selected |
| Duplicate | Creates a copy of the template including agenda and minutes structure. Lands as a new template. |
| Archive / Unarchive | Soft-hide; doesn't affect existing meetings created from it |
| Delete | Permanent. Confirmation required. Blocked if meetings have been created from it (show count). |

### 8.4 Template Creation

**Trigger:** `⋯` menu on any existing template → `Duplicate`.

- Duplicating a template creates a new template (not a meeting draft).
- Result lands in the template list for editing.

> ⚠️ **Open question (Q6):** Neither BDC nor Community supports creating a template from scratch — both require duplicating an existing one. The mapping flags this as a gap for first-time org setup. A `+ New Template` from-scratch path is **not currently in the PRD** and should be confirmed with PM before adding to scope. See Q6 in §11.

### 8.5 Template Editor

Three-tab structure (from Community — keep this, it's correct):

**Tab 1 — Meeting Details**
- Name (required)
- Committee / Meeting Group (required)
- Time (optional)
- Duration (optional)
- Location (optional)
- Members only toggle
- Public request-to-speak toggle
- Public site description (rich text, brief)
- Archived toggle

**Tab 2 — Agenda**
- Pre-built agenda structure (categories + items)
- Same editor as meeting agenda (scoped spec: Agenda Management)

**Tab 3 — Minutes**
- Pre-built minutes structure
- Same editor as meeting minutes (scoped spec: Minutes & Approvals)

**Save / Discard:** Auto-save on field blur (draft state). Explicit `Save` button for confirmation. `Discard Changes` returns to template list.

---

## 9. Key Behaviors & Edge Cases

| # | Scenario | Behavior |
|---|----------|----------|
| E1 | Creating a meeting with no templates | "No template" option in picker. Meeting created blank. |
| E2 | Org with single committee | Committee field hidden in creation form (auto-assigned). |
| E3 | Publish (Draft → Active) fails validation | Inline error list below status control. Meeting stays Draft. |
| E4 | Unpublish Active meeting with past date | Confirmation dialog: "This meeting date has passed. Unpublish anyway?" |
| E5 | Delete Draft with approved agenda items | Confirmation dialog listing item names. Explicit confirm required. |
| E6 | Delete template used by existing meetings | Blocked. Show count: "This template was used to create 12 meetings." |
| E7 | Duplicate — double-click prevention | Duplicate button disabled after first click. |
| E8 | Meeting release window | Release window is configured per committee. If `meetingRelease ≥ 0`, meeting hidden from non-privileged users until N days before meeting date. Super users and committee members exempt. |
| E9 | Date unparseable on legacy import | Meeting hidden fail-closed. Never shown to non-privileged users. |

---

## 10. Out of Scope (This Spec)

- Agenda item management → Agenda Management spec
- Minutes creation and adoption → Minutes & Approvals spec
- Voting & Roll Call → Voting spec
- Meeting Control Panel (live meeting) → MCP spec
- Video broadcast links → Video Integration spec
- Public portal meeting view → Public Portal spec
- Committee/board configuration → Admin & Access Control spec

---


