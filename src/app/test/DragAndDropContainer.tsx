// DragAndDropContainer.tsx
import { DragDropContext } from "react-beautiful-dnd";
import DropColumn from "./DropColumn";
import { useDragAndDrop } from "./useDragAndDrop";

type DemoTask = { id: string; content: string };

const initialData = {
  todo: [
    { id: "1", content: "Task 1" },
    { id: "2", content: "Task 2" },
  ],
  inProgress: [
    { id: "3", content: "Task 3" },
    { id: "4", content: "Task 4" },
  ],
  done: [{ id: "5", content: "Task 5" }],
};

const DragAndDropContainer = () => {
  const customLogic = (sourceId: string, destId: string, item: DemoTask) => {
    console.log(`Item ${item.content} moved from ${sourceId} to ${destId}`);
    // Example of additional logic:
    // Send API request to update item's status in the backend
    // axios.post(`/api/update`, { itemId: item.id, newStatus: destId });
  };

  const { items, onDragEnd } = useDragAndDrop<DemoTask>(
    initialData,
    customLogic
  );

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4">
        {Object.keys(items).map((columnId) => (
          <DropColumn
            key={columnId}
            columnId={columnId}
            tasks={items[columnId]}
          />
        ))}
      </div>
    </DragDropContext>
  );
};

export default DragAndDropContainer;
