// useDragAndDrop.ts
import { useState } from "react";
import { DropResult } from "react-beautiful-dnd";

type DragAndDropHook<T> = {
  items: { [key: string]: T[] };
  setItems: React.Dispatch<React.SetStateAction<{ [key: string]: T[] }>>;
  onDragEnd: (result: DropResult) => void;
};

export const useDragAndDrop = <T extends { id: string }>(
  initialItems: { [key: string]: T[] },
  customLogic?: (sourceId: string, destId: string, item: T) => void
): DragAndDropHook<T> => {
  const [items, setItems] = useState<{ [key: string]: T[] }>(initialItems);

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;

    if (source.droppableId === destination.droppableId) {
      // Reordering within the same column
      const updatedItems = Array.from(items[source.droppableId]);
      const [movedItem] = updatedItems.splice(source.index, 1);
      updatedItems.splice(destination.index, 0, movedItem);

      setItems((prev) => ({
        ...prev,
        [source.droppableId]: updatedItems,
      }));

      if (customLogic)
        customLogic(source.droppableId, destination.droppableId, movedItem);
    } else {
      // Moving to a different column
      const sourceItems = Array.from(items[source.droppableId]);
      const [movedItem] = sourceItems.splice(source.index, 1);
      const destinationItems = Array.from(items[destination.droppableId]);
      destinationItems.splice(destination.index, 0, movedItem);

      setItems((prev) => ({
        ...prev,
        [source.droppableId]: sourceItems,
        [destination.droppableId]: destinationItems,
      }));

      if (customLogic)
        customLogic(source.droppableId, destination.droppableId, movedItem);
    }
  };

  return { items, setItems, onDragEnd };
};
