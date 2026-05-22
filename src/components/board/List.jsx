import { useState, useRef, useEffect } from 'react';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import { MoreHorizontal, Plus, X } from 'lucide-react';
import { useBoard } from '../../context/BoardContext';
import TaskCard from './TaskCard';
import AddCard from './AddCard';

export default function List({ list, index, onCardClick, filteredCardIds }) {
  const { editListTitle, removeList } = useBoard();
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState(list.title);
  const [showAddCard, setShowAddCard] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const titleRef = useRef(null);

  // Keep title in sync with prop
  useEffect(() => {
    setTitle(list.title);
  }, [list.title]);

  // Auto-focus when editing title
  useEffect(() => {
    if (editingTitle && titleRef.current) {
      titleRef.current.focus();
      titleRef.current.select();
    }
  }, [editingTitle]);

  // Save the edited title
  const saveTitle = () => {
    setEditingTitle(false);
    if (title.trim() && title.trim() !== list.title) {
      editListTitle(list.id, title.trim());
    } else {
      setTitle(list.title);
    }
  };

  // Handle delete list
  const handleDelete = () => {
    if (confirm(`Delete list "${list.title}" and all its cards?`)) {
      removeList(list.id);
    }
  };

  return (
    <Draggable draggableId={`list-${list.id}`} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`min-w-[272px] max-w-[272px] bg-[#f1f2f4] rounded-xl flex flex-col max-h-[calc(100vh-160px)] shrink-0 shadow-sm ${
            snapshot.isDragging ? 'rotate-2 shadow-xl' : ''
          }`}
        >
          {/* List header — this is the drag handle */}
          <div
            {...provided.dragHandleProps}
            className="flex items-center justify-between px-3 py-2 cursor-grab active:cursor-grabbing"
          >
            {editingTitle ? (
              <input
                ref={titleRef}
                value={title}
                onChange={e => setTitle(e.target.value)}
                onBlur={saveTitle}
                onKeyDown={e => {
                  if (e.key === 'Enter') saveTitle();
                  if (e.key === 'Escape') {
                    setTitle(list.title);
                    setEditingTitle(false);
                  }
                }}
                className="flex-1 text-sm font-semibold bg-white border-2 border-blue-500 rounded-md px-2 py-1 outline-none text-slate-800"
              />
            ) : (
              <h3
                onClick={() => setEditingTitle(true)}
                className="flex-1 text-sm font-semibold text-slate-800 cursor-pointer hover:bg-black/5 rounded px-1 py-0.5 -mx-1"
              >
                {list.title}
              </h3>
            )}

            {/* List menu */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 hover:bg-black/10 rounded transition-colors text-slate-500"
              >
                <MoreHorizontal size={16} />
              </button>

              {showMenu && (
                <>
                  <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-slate-200 w-48 z-30 py-1">
                    <button
                      onClick={() => { setShowMenu(false); setShowAddCard(true); }}
                      className="w-full text-left px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
                    >
                      Add card
                    </button>
                    <button
                      onClick={() => { setShowMenu(false); handleDelete(); }}
                      className="w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
                    >
                      Delete list
                    </button>
                  </div>
                  <div className="fixed inset-0 z-20" onClick={() => setShowMenu(false)} />
                </>
              )}
            </div>
          </div>

          {/* Cards area — droppable zone */}
          <Droppable droppableId={String(list.id)} type="card">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`flex-1 overflow-y-auto px-2 pb-1 space-y-2 min-h-[4px] transition-colors ${
                  snapshot.isDraggingOver ? 'bg-black/5 rounded-lg' : ''
                }`}
              >
                {list.cards.map((card, cardIndex) => (
                  <TaskCard
                    key={card.id}
                    card={card}
                    index={cardIndex}
                    onClick={() => onCardClick(card.id)}
                    dimmed={filteredCardIds !== null && !filteredCardIds.has(card.id)}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          {/* Add card section */}
          {showAddCard ? (
            <AddCard listId={list.id} onClose={() => setShowAddCard(false)} />
          ) : (
            <button
              onClick={() => setShowAddCard(true)}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:bg-black/5 hover:text-slate-700 px-3 py-2 rounded-b-xl transition-colors w-full text-left"
            >
              <Plus size={16} />
              Add a card
            </button>
          )}
        </div>
      )}
    </Draggable>
  );
}
