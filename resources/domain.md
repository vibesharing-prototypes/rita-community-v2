# Domain Context: Public Sector Board Governance

## What This Space Is

This product operates in the **public sector board governance** domain. It serves government-adjacent organizations that are legally required to conduct formal meetings, maintain public records of their decisions, and make policy available to citizens.

These organizations are governed by elected or appointed boards. Their meetings, decisions, and policies are subject to **open-meeting laws** (also called sunshine laws) — state-level legislation that mandates public notice, public access to agendas and minutes, and transparent voting records. Non-compliance is a legal liability, not just a UX failure.

---

## Who the Clients Are

**~5,000 public sector organizations in the United States**, primarily:

- **School districts** — the largest segment. Governed by elected school boards. Run regular board meetings to approve budgets, curriculum policies, personnel decisions, and contracts.
- **Municipal governments** — city councils, town boards, village boards. Handle zoning, ordinances, public safety policy.
- **Special districts** — water districts, fire districts, library districts, transit authorities. Smaller governing bodies with narrow mandates.
- **State agencies and commissions** — less common, but present.

These are **not enterprise software buyers** in the traditional sense. They are often small administrative teams (1–3 staff managing all board operations), working with limited budgets, accountable to the public rather than shareholders, and slow to change workflows. Consistency and reliability matter more than features.

There is also a second client tier: **policy partner organizations** (e.g., Neola, OSBA) that author policy content and distribute it to subscriber districts. These partners are power users of the policy distribution layer, not the meeting management layer.

---

## The Regulatory Context

Open-meeting laws vary by state but share common requirements:
- **Public notice** of meetings must be given in advance (typically 24–72 hours)
- **Agendas** must be available to the public before the meeting
- **Minutes** must be recorded and made publicly available after the meeting
- **Votes** must be recorded by name (roll call) for certain decisions
- **Executive sessions** (closed meetings) are permitted only for specific topics (personnel, legal, real estate)

This means the software is not optional infrastructure — it is part of how these organizations **fulfill their legal obligations**. Downtime, content errors, or access failures have compliance consequences.

---

## The Primary Users

### Board Admin (Publisher / Staff)
The operational backbone of each organization. Typically a superintendent's assistant, city clerk, or district administrator.
- Creates and manages meetings, agendas, and templates
- Routes agenda items through approval workflows
- Runs or supervises live meetings via the Meeting Control Panel
- Generates, edits, and publishes minutes
- Manages users, committees, and site configuration
- Administers the policy library and document library
- High-frequency user. Power user of the system.

### Board Member (Executive)
Elected or appointed member of the governing body.
- Reviews agenda packets before meetings (including non-public tiers where configured)
- Participates in live meetings: roll call attendance, motions, and digital voting
- May review and approve minutes before formal adoption
- Low-frequency user. Needs fast, read-focused access.

### Staff Contributor
Department heads or staff who submit agenda items for board consideration.
- Authors and submits agenda items into the approval workflow
- Does not control meeting structure or publishing
- Occasional user.

### Subscriber (Notification)
Citizens or staff who register to receive updates about specific committees or meeting types.
- Self-registers on the public portal or is added by an admin
- Receives email (and optionally SMS) notifications when agendas or minutes are published
- Follows links back to the public portal; never logs into the internal system
- Passive user — no write access of any kind.

### Citizen / Public (Anonymous)
The highest-volume user by count. Parents, journalists, residents, advocacy groups.
- Accesses the public-facing portal without authentication
- Reads agendas, released minutes, and active policies
- Downloads documents
- In Community v1: can also subscribe to notifications, watch livestreams or recordings, and submit request-to-speak / public comment (this last capability exists in v1 but is explicitly deferred to P2 in v2 — not in the core commitment)
- Has no account. Expects the experience to work like a public website.

---

## The Core Domain Model

### Organization (Site / Tenant)
Each client organization has one instance. Contains one or more **governing bodies** and has an associated subscriber record in the policy distribution layer (for partner scenarios).

### Governing Body (Committee / Board)
A named group within an organization that holds its own meetings. All governing bodies are modeled as "committees" — the main board is a committee with a specific type. Each has its own member roster, meeting schedule, agenda/workflow rules, and visibility settings (public or private). A single organization may have 7 or more committees.

### Meeting
A formal session of a governing body. Has a defined lifecycle: `Draft → Active/Published → Completed → Archived`. A meeting contains one **agenda** and produces one **minutes** document. Visibility on the public portal is controlled by a configurable release date/time — early or late release has compliance implications.

### Agenda
Each meeting has a single agenda, composed of **categories** (top-level headings like "Consent Agenda" or "New Business") and nested **agenda items**.

### Agenda Item
A discrete item of business. Key attributes:
- **Subject** (title) and **action type** (Action, Consent, Information, Discussion, Minutes, Reports)
- **Tiered content bodies**: public, admin, and executive — each with separate text and attachments
- **Workflow state**: `Draft → Submitted → In Workflow → Approved / Rejected`

Items must pass through a configured approval tree before the agenda can be published. Approval rules are configured per committee and may apply to action items only or all item types.

### Minutes
The official post-meeting record. Generated from the agenda structure, capturing motions, roll call results, and per-member vote tallies. Lifecycle: `None → Draft → Pending → Adopted`. An independent **Released** flag controls public visibility — only `Adopted + Released` minutes appear on the public portal.

### Policy (Book → Section → Policy)
A formal rule or regulation adopted by the board, organized hierarchically:
- **Policy Book** — a high-level collection (e.g., General, Personnel, Finance)
- **Section** — a topic grouping within a book
- **Policy** — a single policy with code, title, rich-text body, adopted/revised/retired dates, legal references, and optional attachments

Policy lifecycle: `Draft → Active → Retired`. Policies may cross-reference each other and be linked to agenda items, goals, or minutes. Historical versions are preserved when policies are revised.

### Document Library
A repository for supplementary organizational content that is not a meeting agenda or policy: board member profiles, contracts, budget reports, bylaws, and general reference materials. Supports the same three content tiers (public / admin / executive). Items can be organized into general, board member, event, and goal types.

### Goals
A standalone module (distinct from the library) for tracking strategic objectives with progress indicators (0–100%). Goals can be linked to agenda items and library documents. Progress is color-coded: below 40% gray, 40–99% yellow, 100% green.

### News / Publications
A content type within the policy distribution layer. Policy partners author news items organized by category and section, which are distributed to subscriber organizations alongside policy content. News has a simple two-state lifecycle: `Draft → Active`. Active news is visible to subscribed districts; deactivating returns it to Draft.

### Subscriber (Organization — Policy Distribution)
A **subscriber organization** (e.g., a school district) that receives policy content from a policy partner. Has subscriptions to specific Policy Books and entitlements to specific news/package streams. Distinct from the individual notification subscriber. Managed through the Policy Distribution Console.

### Subscriber (Individual — Notification)
A **person** (citizen, media, staff) who registers to receive email alerts when agendas or minutes are published for specific committees. Subscribed/Unsubscribed per meeting type. Self-service on the public portal.

---

## Content Visibility: The Three-Tier Model

This is a foundational concept that cuts across every entity in the system. All content — agenda items, documents, library files, policies — can exist at one of three visibility tiers:

| Tier | Who Can See It |
|---|---|
| **Public** | Anyone, including anonymous citizens |
| **Admin** | Staff and admin roles only |
| **Executive** | Board members and executive roles only |

A single agenda item can have three separate content bodies — one per tier — each with its own text and attachments. Serving the wrong tier to the wrong audience is not just a UX bug; it is a potential legal or governance violation. The system must enforce this server-side, not client-side.

---

## The Core Workflow

```
Meeting Created
  → Agenda Built (items authored by staff)
    → Items submitted through approval workflow
      → Agenda released to public (on configured date)
        → Meeting conducted live (roll call → voting → motions)
          → Minutes drafted (auto-generated from agenda + votes)
            → Minutes approved internally
              → Minutes adopted by board (at subsequent meeting)
                → Minutes released to public portal
                  → Policy updates (if any decisions created new/revised policies)
                    → Policy distributed to subscribers (if partner org)
                      → Notification subscribers alerted
```

---

## Key Constraints the Software Must Respect

1. **Content visibility is legally significant.** Public content must be accessible to anyone. Admin and executive content must never leak to the public tier. Enforcement must be server-side.

2. **Meeting release timing is regulated.** Agendas become visible to the public only after a configured release date/time. The system fails closed — if release date is unparseable or missing, content stays hidden.

3. **Vote records are permanent.** Roll call votes (who voted yes/no/abstain, per member, per motion) must be recorded accurately and preserved in minutes. They cannot be retroactively altered.

4. **Minutes are official records.** Once published, minutes carry legal weight. The system must prevent accidental overwrites and enforce a clear adoption-before-release gate.

5. **Policies are versioned.** Boards adopt, amend, and retire policies over time. All historical versions must be preserved and accessible.

6. **Public portal availability is a legal requirement.** If citizens cannot access meeting records, the organization may be in violation of state transparency law. Portal correctness and uptime are not optional.

7. **Policy uniqueness must be enforced.** A policy is uniquely identified by Book + Section + Code. The legacy system allowed duplicates; v2 must not.

---

## What This Software Is Not

- Not a general document management system
- Not a project management tool
- Not a CRM or constituent engagement platform
- Not a live-streaming or video conferencing tool (though it may link to or embed external streams)
- Not a legal document filing system (though it produces legally required records)
- Not a voting platform in the general sense — voting is strictly scoped to formal motions within board meetings
