# Project Brief: Community v2

## What We're Building

Community v2 is a ground-up rebuild of Diligent's board meeting and policy governance platform, serving ~5,000 public sector organizations (school districts, municipalities, special districts, state agencies).

It replaces two failing systems:
- **BoardDocs** — the original product, built on HCL Lotus Notes/Domino. Technically unviable but functionally well-regarded by users. Simple, fast, intuitive.
- **Community v1** — a .NET/React rebuild graded D+ architecturally: 3.6% test coverage, God classes exceeding 7,000 lines, EAV schema, 90 tracked bugs. Perceived by users as overly complex and over-designed.

The goal is not to build something new. It is to build something **better than BoardDocs** — keeping what made it work, fixing what didn't, and discarding Community v1's complexity entirely.

---

## Deadline

**End of Q2 2026.** A complete, shippable product.

This is a hard deadline, not a target. The entire team — engineering, design, product — operates in **AI-native ways**. Cycle times are measured in **hours and days**, not weeks. There is no time for extended research phases, lengthy validation cycles, or committee-driven decisions. We make 80/20 decisions and move. Iteration happens after shipping, not before.

---

## The Design Mandate

**BoardDocs is the baseline. Community v1 is the warning.**

BoardDocs is genuinely well-received by users. Its mental models are correct. Its information hierarchy works. Its interactions are simple and predictable. Users understand it without training.

Community v1 was an attempt to improve on BoardDocs that went wrong. It added complexity, over-designed interactions, and buried functionality. Users find it harder to use despite it being technically more capable.

v2 must return to the simplicity of BoardDocs. That means:

- **Keep** BoardDocs' mental models, major interaction patterns, and information hierarchy where they work
- **Modernize only where it genuinely improves usability** — not for aesthetic reasons, not to look modern
- **Default to simpler** when in doubt — fewer steps, less cognitive load, more predictable outcomes
- **Discard** Community v1's patterns unless they solve a real problem that BoardDocs couldn't

The measure of success is: *does it feel as simple and intuitive as BoardDocs?*

---

## What We're Building (Feature Scope)

### In Scope — Core Features

These are the features v2 must ship:

| Feature | Notes |
|---|---|
| **Meeting Management** | Full lifecycle: draft → active → completed → archived. Templates, duplication, status transitions with server-side validation |
| **Agenda Management** | Categories + items, three-tier content (public/admin/executive), attachments, approval workflow |
| **Minutes** | Generate from agenda + votes, edit, approve, adopt, release to public |
| **Voting & Roll Call** | MCP-driven live meeting control, per-member votes, motion recording, real-time scoreboard |
| **Policy Management** | Book → Section → Policy hierarchy, draft/active/retired lifecycle, versioning, legal references |
| **Policy Distribution** | Subscriber organization management, policy book subscriptions, news/publications authoring and distribution |
| **Document Library** | Three-tier access, file management, goals module with progress tracking |
| **Public Portal** | Citizen-facing site for meetings, agendas, released minutes, policies, and documents. SEO-friendly, WCAG 2.1 AA compliant, fully separate from the authenticated app |
| **Search** | Cross-content search across meetings, policies, library, minutes, and attachments. This is the #1 parity gap and a P1 priority |
| **Admin & Access Control** | User management, role assignment, committee configuration, per-committee permissions |
| **Video Integration** | Link to externally hosted video (YouTube, Vimeo, Swagit) from meetings. No video hosting. |
| **Import / Migration Pipeline** | BoardDocs → v2 migration with validated data pipeline and rollback |

### Explicitly Out of Scope

These are **not** in v2:

- Real-time collaborative editing (deferred — architecture decision needed first)
- eVote (between-meetings electronic voting) — separate future PRD
- Request-to-speak / public comment integration with MCP — deferred to P2
- Public engagement portal beyond basic read access
- SSO/SAML — required for enterprise but phased separately
- Custom per-partner UI theming beyond basic branding
- BoxCast live streaming — v1-only, dropping unless demand requires it
- Supermajority and weighted voting configurations
- AI-assisted minutes from livestream captions — future phase

---

## What v2 Retains from the Existing Systems

From the Master PRD: v2 retains the **deeply understood domain model**, the **proven RBAC hierarchy**, the **meeting-to-minutes lifecycle**, **policy versioning**, and the **subscriber distribution network**. These are stable, well-understood concepts that both systems share and that v2 rebuilds cleanly on top of.

---

## What We're Discarding from Community v1

These Community v1 patterns are explicitly not carried forward:

- Over-complex, over-designed interfaces
- God classes, EAV schema, scattered permissions, unvalidated import pipelines

---

## Technical Baseline

v2 is a clean architectural rebuild. Key technical mandates:

- **80%+ test coverage** on critical paths — TDD from day one
- **Server-side content tier enforcement** — public/admin/executive access never delegated to the client
- **WebSocket/SSE for real-time** — no polling for live meeting state
- **Formal state machines** for meeting lifecycle, minutes lifecycle, and agenda item workflow
- **Validated import pipeline** with rollback — the current pipeline is the #1 source of bugs
- **WCAG 2.1 AA compliance** — semantic HTML, keyboard navigation, screen reader support
- **Zero data loss** during migration — guardrail metric, non-negotiable
- **Document locking** — session-UUID-based, server-side expiry, fixes race condition from v1

---

## Success Criteria

The project succeeds if:

1. **Full feature parity with BoardDocs** — all 11 unstarted parity features are shipped, starting with Search
2. **Migration success rate >95%** per partner organization
3. **It feels as simple and intuitive as BoardDocs** — users can operate it without training
4. **Zero data loss** during migration
5. **No regression** of completed v1 features
6. **80%+ test coverage** on critical paths

The project fails if it ships something that feels like Community v1.
