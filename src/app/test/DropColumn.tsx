// Column.tsx
import { Droppable } from "react-beautiful-dnd";
import DragCard from "./DragCard";

type DropColumnProps = {
  columnId: string;
  tasks: { id: string; content: string }[];
};

const DropColumn: React.FC<DropColumnProps> = ({ columnId, tasks }) => {
  return (
    <Droppable droppableId={columnId}>
      {(provided) => (
        <div
          className="bg-gray-100 p-4 w-64 rounded-lg shadow-md"
          ref={provided.innerRef}
          {...provided.droppableProps}
        >
          <h2 className="text-lg font-semibold mb-4">
            {columnId.charAt(0).toUpperCase() + columnId.slice(1)}
          </h2>
          {tasks.map((task, index) => (
            <DragCard key={task.id} task={task} index={index} />
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};

export default DropColumn;
