import { useState, useRef, useEffect } from 'react';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import { MoreHorizontal, Plus, X } from 'lucide-react';
import { useBoard } from '../../context/BoardContext';
import TaskCard from './TaskCard';
import AddCard from './AddCard';

export default function List({ list, index, onCardClick }) {
  const { editListTitle, archiveList, editListColor } = useBoard();
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

  // Handle archive list
  const handleArchive = () => {
    archiveList(list.id);
  };

  return (
    <Draggable draggableId={`list-${list.id}`} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          style={{
            backgroundColor: list.color || '#f1f2f4',
            ...provided.draggableProps.style,
          }}
          className={`min-w-[272px] max-w-[272px] rounded-xl flex flex-col max-h-[calc(100vh-160px)] shrink-0 shadow-sm ${
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
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <h3
                  onClick={() => setEditingTitle(true)}
                  className="text-sm font-semibold text-slate-800 cursor-pointer hover:bg-black/5 rounded px-1 py-0.5 -mx-1 truncate"
                >
                  {list.title}
                </h3>
                <span className="text-xs font-semibold bg-black/5 text-slate-600 px-1.5 py-0.5 rounded-full shrink-0">
                  {list.cards.length}
                </span>
              </div>
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
                      onClick={() => { setShowMenu(false); handleArchive(); }}
                      className="w-full text-left px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100 mb-1"
                    >
                      Archive list
                    </button>

                    <div className="px-3 py-2 border-t border-slate-150 bg-slate-50/60 rounded-b-lg">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">List color</p>
                      <div className="grid grid-cols-4 gap-1.5">
                        {[
                          { name: 'Default', value: null, class: 'bg-[#f1f2f4] border-slate-300' },
                          { name: 'Blue', value: '#bae6fd', class: 'bg-[#bae6fd]' },
                          { name: 'Green', value: '#bbf7d0', class: 'bg-[#bbf7d0]' },
                          { name: 'Yellow', value: '#fef08a', class: 'bg-[#fef08a]' },
                          { name: 'Orange', value: '#fed7aa', class: 'bg-[#fed7aa]' },
                          { name: 'Red', value: '#fecdd3', class: 'bg-[#fecdd3]' },
                          { name: 'Purple', value: '#e9d5ff', class: 'bg-[#e9d5ff]' },
                        ].map((c) => (
                          <button
                            key={c.name}
                            onClick={() => {
                              editListColor(list.id, c.value);
                              setShowMenu(false);
                            }}
                            title={c.name}
                            className={`w-6 h-6 rounded-full border border-black/10 hover:scale-110 active:scale-95 transition-all cursor-pointer ${c.class} ${
                              (list.color === c.value || (!list.color && c.value === null))
                                ? 'ring-2 ring-blue-500 ring-offset-1 scale-105'
                                : ''
                            }`}
                          />
                        ))}
                      </div>
                    </div>
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
