# App context

You are building a prototype enterprise B2B application using the Atlas design system.

## Key references

- **Domain knowledge, users, and business rules:** see `/DOMAIN.md`
- **Tech stack and framework versions:** see `/TECHSTACK.md`
- **Atlas coding rules and styling conventions:** see `/AGENTS.md`
- **Current task assignments and milestones:** see `/ROADMAP.md`

These files are important to understand the project.

## App-specific patterns

### Route structure

All pages follow this pattern:
1. Page component in `src/pages/<pagename>/<PageName>Page.tsx`
2. Route added in `src/App.tsx` (inside the `<Routes>` block)
3. Nav link added in `src/Navigation.tsx`

### Component organization

- **Shared components** go in `src/components/` — these are used across multiple pages
- **Page-specific components** go in `src/pages/<pagename>/` — co-located with their page
- Always check if Atlas provides a component before creating a custom one (consult the Atlas MCP)

### Data layer

- Mock data and data hooks should be co-located with the page that uses them
- Shared data utilities go in `src/utils/` (create when needed)