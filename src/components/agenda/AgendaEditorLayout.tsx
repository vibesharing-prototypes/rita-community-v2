import { OverflowBreadcrumbs, PageHeader } from "@diligentcorp/atlas-react-bundle";
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  IconButton, MenuItem, Select, Stack, TextField, Tooltip, Typography, useTheme,
} from "@mui/material";
import ExpandSideNavIcon from "@diligentcorp/atlas-react-bundle/icons/ExpandSideNav";
import DownloadIcon from "@diligentcorp/atlas-react-bundle/icons/Download";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { setAgendaFor } from "../../data/runtimeAgendaStore";
import type { AgendaCategory, AgendaItem } from "../../types/agenda";
import type { Meeting } from "../../types/meetings";
import { isUpcoming } from "../../utils/meetings";
import StatusChip from "../meetings/StatusChip";
import AgendaToolbar, { type AgendaPanelView } from "./AgendaToolbar";
import AgendaTree from "./AgendaTree/AgendaTree";
import ItemInlineEditor from "./ItemPanel/ItemInlineEditor";

function generateId() {
  return `new-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function AgendaEditorLayout({
  meeting,
  initialCategories,
  kind = "meeting",
}: {
  meeting: Meeting;
  initialCategories: AgendaCategory[];
  kind?: "meeting" | "template";
}) {
  const { tokens } = useTheme();
  const dividerColor = tokens?.component?.divider?.colors?.default?.borderColor?.value ?? "#E0E0E0";
  const navigate = useNavigate();

  const [categories, setCategories] = useState<AgendaCategory[]>(initialCategories);

  useEffect(() => {
    setAgendaFor(meeting.id, categories);
  }, [meeting.id, categories]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [agendaCollapsed, setAgendaCollapsed] = useState(false);
  const [panelView, setPanelView] = useState<AgendaPanelView>("content");

  // Add item dialog
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [addItemSubject, setAddItemSubject] = useState("");
  const [addItemCategoryId, setAddItemCategoryId] = useState<string>("");
  const [addItemSubjectError, setAddItemSubjectError] = useState(false);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const findItem = (id: string): AgendaItem | undefined => {
    for (const cat of categories) {
      const item = cat.items.find((i) => i.id === id);
      if (item) return item;
    }
  };

  // ── Category actions ───────────────────────────────────────────────────────

  const handleAddCategory = () => {
    const id = generateId();
    const newCat: AgendaCategory = { id, name: "New Category", order: categories.length, items: [] };
    setCategories((prev) => [...prev, newCat]);
    // The CategoryRow will enter inline edit mode on mount when name === "New Category"
    // For simplicity we rely on the user double-clicking to rename immediately.
    // A more polished approach would auto-focus — acceptable for prototype.
  };

  const handleRenameCategory = (id: string, name: string) => {
    setCategories((prev) => prev.map((c) => c.id === id ? { ...c, name } : c));
  };

  const handleDeleteCategory = (id: string) => {
    const deleted = categories.find((c) => c.id === id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
    if (deleted?.items.some((i) => i.id === selectedItemId)) {
      setSelectedItemId(null);
    }
  };

  // ── Item actions ───────────────────────────────────────────────────────────

  const handleRenameItem = (id: string, subject: string) => {
    setCategories((prev) =>
      prev.map((c) => ({
        ...c,
        items: c.items.map((i) => (i.id === id ? { ...i, subject } : i)),
      }))
    );
  };

  const handleSaveItem = (updated: AgendaItem) => {
    setCategories((prev) =>
      prev.map((c) => {
        if (c.id === updated.categoryId) {
          return { ...c, items: c.items.map((i) => i.id === updated.id ? updated : i) };
        }
        return c;
      })
    );
  };

  const handleDeleteItem = (id: string) => {
    setCategories((prev) =>
      prev.map((c) => ({ ...c, items: c.items.filter((i) => i.id !== id) }))
    );
    setSelectedItemId(null);
  };

  const handleDuplicateItem = (item: AgendaItem) => {
    const newId = generateId();
    const copy = { ...item, id: newId, subject: `${item.subject} (copy)` };
    setCategories((prev) =>
      prev.map((c) => {
        if (c.id !== item.categoryId) return c;
        const idx = c.items.findIndex((i) => i.id === item.id);
        const items = [...c.items];
        items.splice(idx + 1, 0, copy);
        return { ...c, items };
      })
    );
    setSelectedItemId(newId);
  };

  // ── Add Item dialog ────────────────────────────────────────────────────────

  const openAddItem = (prefillCategoryId?: string) => {
    setAddItemSubject("");
    setAddItemSubjectError(false);
    setAddItemCategoryId(prefillCategoryId ?? categories[categories.length - 1]?.id ?? "");
    setAddItemOpen(true);
  };

  const confirmAddItem = () => {
    if (!addItemSubject.trim()) { setAddItemSubjectError(true); return; }
    const id = generateId();
    const newItem: AgendaItem = {
      id,
      subject: addItemSubject.trim(),
      categoryId: addItemCategoryId,
      type: [],
      status: "Draft",
      publicContent: "",
      staffContent: "",
      executiveContent: "",
      attachments: { public: [], staff: [], executive: [] },
    };
    setCategories((prev) =>
      prev.map((c) => c.id === addItemCategoryId ? { ...c, items: [...c.items, newItem] } : c)
    );
    setAddItemOpen(false);
    setSelectedItemId(id);
  };

  // ── Reorder ────────────────────────────────────────────────────────────────

  const handleReorder = (updated: AgendaCategory[]) => {
    setCategories(updated);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  const selectedItem = selectedItemId ? findItem(selectedItemId) : null;

  const tab = kind === "template" ? "Templates" : isUpcoming(meeting.date) ? "Upcoming" : "Previous";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>

      {/* ── Header ── */}
      <Box sx={{ borderBottom: `1px solid ${dividerColor}`, pt: 3, px: { xs: 2, sm: 3 }, pb: "12px", flexShrink: 0 }}>
        <PageHeader
          breadcrumbs={
            <OverflowBreadcrumbs
              items={[
                { id: "meetings", label: "Meetings" },
                { id: "tab", label: tab },
                { id: "meeting", label: meeting.name },
                { id: "current", label: "Agenda", isCurrent: true },
              ]}
              leadingElement={
                <Box sx={{ height: 32, display: "flex", alignItems: "center", pr: "16px" }}>
                  <Typography sx={{ fontSize: 14, fontWeight: 600, lineHeight: "20px", color: "#6f7377", letterSpacing: "0.2px", whiteSpace: "nowrap" }}>
                    Community v2
                  </Typography>
                </Box>
              }
            >
              {(item) => {
                const baseSx = { fontSize: 14, fontWeight: 600, lineHeight: "20px", letterSpacing: "0.14px", whiteSpace: "nowrap" as const };
                const activeSx = { ...baseSx, color: "#282e37" };
                if (item.isCurrent) return <span />;
                const isMeeting = item.id === "meeting";
                const label = (
                  <Box sx={{ display: "flex", alignItems: "center", height: 24, px: "4px" }}>
                    <Typography sx={{ ...activeSx, ...(isMeeting ? { maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" } : {}) }}>
                      {item.label}
                    </Typography>
                  </Box>
                );
                const destinations: Record<string, string> = {
                  meetings: "/meetings",
                  tab: `/meetings?tab=${tab.toLowerCase()}`,
                  meeting: kind === "template" ? `/meetings/templates/${meeting.id}` : `/meetings/${meeting.id}`,
                };
                return (
                  <Box component="button" onClick={() => navigate(destinations[item.id])} sx={{ display: "flex", alignItems: "center", justifyContent: "center", px: "12px", py: "4px", borderRadius: "10px", cursor: "pointer", background: "none", border: "none", "&:hover": { bgcolor: "action.hover" } }}>
                    {label}
                  </Box>
                );
              }}
            </OverflowBreadcrumbs>
          }
          pageTitle={(
            <Box sx={{
              display: "flex", alignItems: "baseline", minWidth: 0, maxWidth: "100%", gap: "8px",
              fontSize: "24px", fontWeight: 600, lineHeight: "32px",
              overflow: "hidden",
            }}>
              <Box component="span" sx={{ flexShrink: 0 }}>Agenda —</Box>
              <Box component="span" sx={{
                minWidth: 0, flex: 1,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {meeting.name}
              </Box>
            </Box>
          ) as unknown as string}
          pageSubtitle={
            <Stack direction="row" alignItems="center" gap={1}>
              <Typography sx={{ fontSize: 12, color: "var(--lens-semantic-color-type-muted)", lineHeight: "16px", letterSpacing: "0.3px" }}>
                {meeting.committee}
              </Typography>
              {meeting.status === "Draft"
                ? <StatusChip label="Draft" />
                : <StatusChip label={meeting.visibility} />}
            </Stack>
          }
          moreButton={
            <Stack direction="row" spacing={1} alignItems="center">
              <Tooltip title="Download">
                <IconButton size="medium" aria-label="Download">
                  <DownloadIcon style={{ fontSize: 20 }} />
                </IconButton>
              </Tooltip>
              <Button variant="outlined" size="medium">
                Share
              </Button>
            </Stack>
          }
          containerProps={{ sx: {
            "--lens-component-page-header-desktop-middle-container-padding-bottom": "0px",
            "--lens-component-page-header-desktop-container-gap": "8px",
            "--lens-component-page-header-desktop-title-container-gap": "12px",
            "--lens-component-page-header-tablet-title-container-gap": "12px",
            "& nav.MuiBreadcrumbs-root li:first-child a": { pl: 0 },
          } }}
        />
      </Box>

      {/* ── Two-panel body ── */}
      <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* Collapsed-state open button (overlays when collapsed) */}
        {agendaCollapsed && (
          <Box sx={{ p: 2, flexShrink: 0 }}>
            <Tooltip title="Open agenda">
              <IconButton
                size="small"
                onClick={() => setAgendaCollapsed(false)}
                aria-label="Open agenda"
                sx={{
                  border: `1px solid ${dividerColor}`,
                  borderRadius: "8px",
                  bgcolor: "#fff",
                  "&:hover": { bgcolor: "action.hover" },
                }}
              >
                <ExpandSideNavIcon style={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </Box>
        )}

        {/* Left: Agenda tree (card) */}
        <Box sx={{
          width: agendaCollapsed ? 0 : "30%",
          minWidth: agendaCollapsed ? 0 : 280,
          maxWidth: agendaCollapsed ? 0 : 380,
          pt: 2, pb: 2,
          pl: agendaCollapsed ? 0 : 2,
          pr: agendaCollapsed ? 0 : "12px",
          display: "flex", flexDirection: "column",
          flexShrink: 0,
          overflow: "hidden",
          opacity: agendaCollapsed ? 0 : 1,
          transition: "width 160ms ease-out, min-width 160ms ease-out, max-width 160ms ease-out, padding 160ms ease-out, opacity 120ms ease-out",
        }}>
          <Box sx={{
            border: `1px solid ${dividerColor}`,
            borderRadius: "12px",
            bgcolor: "#fff",
            display: "flex",
            flexDirection: "column",
            flex: 1,
            minHeight: 0,
            overflow: "hidden",
            minWidth: 268,
          }}>
            {/* Card header */}
            <Box sx={{
              px: 1, py: 1,
              borderBottom: `1px solid ${dividerColor}`,
              flexShrink: 0,
            }}>
              <AgendaToolbar
                view={panelView}
                onChangeView={setPanelView}
                onAddCategory={handleAddCategory}
                onAddItem={() => openAddItem()}
                onCollapse={() => setAgendaCollapsed(true)}
                hasCategories={categories.length > 0}
              />
            </Box>

            {/* Body */}
            <Box sx={{ overflowY: "auto", flex: 1, p: 1 }}>
              {panelView === "content" && (
                <AgendaTree
                  categories={categories}
                  selectedItemId={selectedItemId}
                  onSelectItem={setSelectedItemId}
                  onReorder={handleReorder}
                  onRenameCategory={handleRenameCategory}
                  onDeleteCategory={handleDeleteCategory}
                  onRenameItem={handleRenameItem}
                  onDuplicateItem={handleDuplicateItem}
                  onDeleteItem={handleDeleteItem}
                  onAddCategory={handleAddCategory}
                  onAddItem={openAddItem}
                />
              )}
              {panelView === "search" && (
                <Box sx={{ p: 2, textAlign: "center", color: "text.secondary", fontSize: 13 }}>
                  Search coming soon
                </Box>
              )}
              {panelView === "notes" && (
                <Box sx={{ p: 2, textAlign: "center", color: "text.secondary", fontSize: 13 }}>
                  Notes coming soon
                </Box>
              )}
            </Box>
          </Box>
        </Box>

        {/* Right: Item panel */}
        <Box sx={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {selectedItem ? (
            <ItemInlineEditor
              item={selectedItem}
              categories={categories}
              onSave={handleSaveItem}
              onDelete={handleDeleteItem}
              onDuplicate={handleDuplicateItem}
            />
          ) : (
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", p: 3 }}>
              <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
                Select an item to view or edit
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* ── Add Item dialog ── */}
      <Dialog open={addItemOpen} onClose={() => setAddItemOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontSize: 18, fontWeight: 600, pb: 1 }}>New Agenda Item</DialogTitle>
        <DialogContent sx={{ pt: "8px !important" }}>
          <Stack gap={2}>
            <Stack gap={0.5}>
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: "text.secondary" }}>Subject</Typography>
              <TextField
                autoFocus
                value={addItemSubject}
                onChange={(e) => { setAddItemSubject(e.target.value); setAddItemSubjectError(false); }}
                size="small"
                fullWidth
                error={addItemSubjectError}
                helperText={addItemSubjectError ? "Subject is required" : undefined}
                onKeyDown={(e) => { if (e.key === "Enter") confirmAddItem(); }}
                inputProps={{ style: { fontSize: 14 } }}
              />
            </Stack>
            <Stack gap={0.5}>
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: "text.secondary" }}>Category</Typography>
              <Select
                value={addItemCategoryId}
                onChange={(e) => setAddItemCategoryId(e.target.value)}
                size="small"
                sx={{ fontSize: 14 }}
              >
                {categories.map((c) => (
                  <MenuItem key={c.id} value={c.id} sx={{ fontSize: 14 }}>{c.name}</MenuItem>
                ))}
              </Select>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="outlined" size="small" onClick={() => setAddItemOpen(false)}>Cancel</Button>
          <Button variant="contained" size="small" onClick={confirmAddItem}>Create Item</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}
