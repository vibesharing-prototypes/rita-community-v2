import { Box } from "@mui/material";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import type { AgendaCategory } from "../../../types/agenda";
import CategoryRow from "./CategoryRow";
import AgendaTreeEmpty from "./AgendaTreeEmpty";

export default function AgendaTree({
  categories,
  selectedItemId,
  onSelectItem,
  onReorder,
  onRenameCategory,
  onDeleteCategory,
  onRenameItem,
  onAddCategory,
  onAddItem,
}: {
  categories: AgendaCategory[];
  selectedItemId: string | null;
  onSelectItem: (id: string) => void;
  onReorder: (updated: AgendaCategory[]) => void;
  onRenameCategory: (id: string, name: string) => void;
  onDeleteCategory: (id: string) => void;
  onRenameItem: (id: string, subject: string) => void;
  onAddCategory: () => void;
  onAddItem: (categoryId: string) => void;
}) {
  const handleDragEnd = (result: DropResult) => {
    const { source, destination, type } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const cats = categories.map((c) => ({ ...c, items: [...c.items] }));

    if (type === "CATEGORY") {
      const [moved] = cats.splice(source.index, 1);
      cats.splice(destination.index, 0, moved);
      onReorder(cats.map((c, i) => ({ ...c, order: i })));
      return;
    }

    // type === "ITEM"
    const srcCat = cats.find((c) => c.id === source.droppableId);
    const dstCat = cats.find((c) => c.id === destination.droppableId);
    if (!srcCat || !dstCat) return;

    const [movedItem] = srcCat.items.splice(source.index, 1);
    movedItem.categoryId = dstCat.id;
    dstCat.items.splice(destination.index, 0, movedItem);
    onReorder(cats);
  };

  if (categories.length === 0) {
    return <AgendaTreeEmpty onAddCategory={onAddCategory} />;
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="categories" type="CATEGORY">
        {(provided) => (
          <Box ref={provided.innerRef} {...provided.droppableProps} sx={{ pb: 1 }}>
            {categories.map((cat, index) => (
              <Draggable key={cat.id} draggableId={cat.id} index={index}>
                {(provided) => (
                  <Box
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    sx={{ mb: 1 }}
                  >
                    <CategoryRow
                      category={cat}
                      index={index}
                      selectedItemId={selectedItemId}
                      dragHandleProps={provided.dragHandleProps}
                      onSelectItem={onSelectItem}
                      onRenameCategory={onRenameCategory}
                      onDeleteCategory={onDeleteCategory}
                      onRenameItem={onRenameItem}
                      onAddItem={onAddItem}
                    />
                  </Box>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </Box>
        )}
      </Droppable>
    </DragDropContext>
  );
}
