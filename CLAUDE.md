# Community v2 v6

## What this is
A board governance and meeting management prototype built with React and TypeScript. It provides a centralized hub for viewing and managing board meetings, meeting templates, and related governance content. The app is designed for board members and administrators who need to organize, schedule, and access meeting information and documentation.

## Key pages and components

**Pages:**
- Home — displays upcoming meetings and recent activity
- Meetings — lists all meetings with filtering and actions
- Meeting Detail — shows full meeting information with edit/duplicate capabilities
- Calendar — calendar view of meetings
- Template Detail — displays meeting template details
- Placeholder pages — Agenda items, Policies, Files, Goals, Events, Board members, Settings

**Key components:**
- Navigation — sidebar with collapsible Library section and main navigation links
- Meeting dialogs — committee picker, template picker, duplicate confirmation, generic confirm dialog
- Meeting forms — form page for creating/editing meetings
- Status indicators — status pills and chips for meeting states
- Empty states — reusable empty state UI with action buttons
- Date badge — styled date display component

## Tech stack
- **Framework:** React 18+ with TypeScript
- **Routing:** React Router
- **UI Library:** Material-UI (MUI) with Atlas React Bundle (Diligent's design system)
- **Build tool:** Vite
- **Deployment:** Netlify
- **Data:** Local JSON files (meetings.json, home.json)

## Current state
Core meeting management features are functional (list, detail view, create/edit, duplicate). Most secondary features (Agenda, Policies, Library sections) are placeholder pages. The app uses mock data from JSON files and the Atlas design system for consistent styling.