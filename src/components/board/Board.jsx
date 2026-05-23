import { Droppable } from '@hello-pangea/dnd';
import List from './List';
import AddList from './AddList';

export default function Board({ lists, boardId, onCardClick }) {
  return (
    <Droppable droppableId="board" direction="horizontal" type="list">
      {(provided) => (
        <div
          className="h-full flex items-start gap-3 px-4 pt-3 pb-4 overflow-x-auto overflow-y-hidden"
          ref={provided.innerRef}
          {...provided.droppableProps}
        >
          {lists.map((list, index) => (
            <List
              key={list.id}
              list={list}
              index={index}
              onCardClick={onCardClick}
            />
          ))}
          {provided.placeholder}
          <AddList boardId={boardId} />
        </div>
      )}
    </Droppable>
  );
}