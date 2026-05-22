import { Draggable } from '@hello-pangea/dnd';
import { MessageSquare, CheckSquare, Clock, Pencil } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';

export default function TaskCard({ card, index, onClick, dimmed }) {
  const checkedCount = card.checklists?.reduce((sum, cl) => sum + cl.items.filter(i => i.isChecked).length, 0) || 0;
  const totalCount = card.checklists?.reduce((sum, cl) => sum + cl.items.length, 0) || 0;
  const hasChecklist = totalCount > 0;
  const allChecked = hasChecklist && checkedCount === totalCount;
  const commentCount = card._count?.comments || 0;
  const hasDueDate = !!card.dueDate;
  const dueDate = hasDueDate ? new Date(card.dueDate) : null;
  const isOverdue = dueDate && isPast(dueDate) && !isToday(dueDate);
  const isDueToday = dueDate && isToday(dueDate);

  return (
    <Draggable draggableId={String(card.id)} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={`relative bg-white rounded-lg shadow-sm border border-slate-200/80 cursor-pointer group transition-all duration-200 hover:border-blue-400 hover:shadow-md ${
            snapshot.isDragging ? 'rotate-3 scale-105 shadow-xl ring-2 ring-blue-400' : ''
          } ${dimmed ? 'opacity-40 pointer-events-none select-none' : ''}`}
        >
          {/* Card Cover */}
          {card.coverColor && (
            <div
              className="h-8 rounded-t-lg"
              style={{ backgroundColor: card.coverColor }}
            />
          )}

          <div className="p-2 px-3">
            {/* Labels */}
            {card.labels && card.labels.length > 0 && (
              <div className="flex gap-1 flex-wrap mb-1.5">
                {card.labels.map(cl => (
                  <span
                    key={cl.label.id}
                    title={cl.label.name}
                    className="h-2 w-10 rounded-full"
                    style={{ backgroundColor: cl.label.color }}
                  />
                ))}
              </div>
            )}

            {/* Title */}
            <p className="text-sm text-slate-800 leading-snug mb-1.5">{card.title}</p>

            {/* Badges row */}
            {(hasDueDate || hasChecklist || commentCount > 0 || card.members?.length > 0) && (
              <div className="flex items-center justify-between mt-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Due date badge */}
                  {hasDueDate && (
                    <span className={`inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded font-medium ${
                      isOverdue ? 'bg-red-600 text-white' :
                      isDueToday ? 'bg-yellow-500 text-white' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      <Clock size={12} />
                      {format(dueDate, 'MMM d')}
                    </span>
                  )}

                  {/* Description indicator */}
                  {card.description && (
                    <span className="text-slate-400" title="Has description">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 6h16M4 12h10M4 18h14" />
                      </svg>
                    </span>
                  )}

                  {/* Comments */}
                  {commentCount > 0 && (
                    <span className="inline-flex items-center gap-0.5 text-[11px] text-slate-500">
                      <MessageSquare size={12} /> {commentCount}
                    </span>
                  )}

                  {/* Checklist */}
                  {hasChecklist && (
                    <span className={`inline-flex items-center gap-0.5 text-[11px] px-1.5 py-0.5 rounded ${allChecked ? 'bg-green-600 text-white' : 'text-slate-500'}`}>
                      <CheckSquare size={12} /> {checkedCount}/{totalCount}
                    </span>
                  )}
                </div>

                {/* Member avatars */}
                {card.members && card.members.length > 0 && (
                  <div className="flex -space-x-1">
                    {card.members.slice(0, 3).map(cm => (
                      <div
                        key={cm.member.id}
                        title={cm.member.name}
                        style={{ backgroundColor: cm.member.avatarColor }}
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white ring-2 ring-white"
                      >
                        {cm.member.initials}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Edit pencil on hover */}
          <button className="absolute top-1 right-1 p-1 bg-slate-100 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-200" onClick={e => { e.stopPropagation(); onClick(); }}>
            <Pencil size={12} className="text-slate-600" />
          </button>
        </div>
      )}
    </Draggable>
  );
}
