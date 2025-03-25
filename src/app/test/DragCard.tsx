import { Draggable } from "react-beautiful-dnd";

type DragPropsCard = {
  task: { id: string; content: string };
  index: number;
};

const DragCard: React.FC<DragPropsCard> = ({ task, index }) => {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided) => (
        <div
          className="bg-white p-2 mb-2 rounded shadow"
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          {task.content}
        </div>
      )}
    </Draggable>
  );
};

export default DragCard;
