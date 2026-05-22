import { useState, useEffect, useCallback } from 'react';
import { X, CreditCard, AlignLeft, Tag, Users, Clock, CheckSquare, MessageSquare, Archive, Trash2, Palette } from 'lucide-react';
import { useBoard } from '../../context/BoardContext';
import * as api from '../../api/api.js';
import { format } from 'date-fns';

const COVER_COLORS = ['#ef4444','#f97316','#eab308','#22c55e','#3b82f6','#8b5cf6','#ec4899','#06b6d4','#fef3c7','#dbeafe','#dcfce7','#fce7f3'];

export default function CardModal({ cardId, boardId, onClose }) {
  const { board, editCard, removeCard, toggleCardLabel, toggleCardMember, loadBoard } = useBoard();
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState('');
  const [editingDesc, setEditingDesc] = useState(false);
  const [desc, setDesc] = useState('');
  const [showLabelPicker, setShowLabelPicker] = useState(false);
  const [showMemberPicker, setShowMemberPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  const [dueDate, setDueDate] = useState('');
  const [commentText, setCommentText] = useState('');
  const [checklistTitle, setChecklistTitle] = useState('');
  const [showAddChecklist, setShowAddChecklist] = useState(false);
  const [newItemTexts, setNewItemTexts] = useState({});

  const fetchCard = useCallback(async () => {
    try {
      const data = await api.getCard(cardId);
      setCard(data);
      setTitle(data.title);
      setDesc(data.description || '');
      setDueDate(data.dueDate ? format(new Date(data.dueDate), "yyyy-MM-dd'T'HH:mm") : '');
      setLoading(false);
    } catch { setLoading(false); }
  }, [cardId]);

  useEffect(() => { fetchCard(); }, [fetchCard]);

  const saveTitle = async () => {
    setEditingTitle(false);
    if (title.trim() && title !== card.title) {
      await editCard(card.id, { title: title.trim() });
      setCard(c => ({ ...c, title: title.trim() }));
    }
  };

  const saveDesc = async () => {
    setEditingDesc(false);
    if (desc !== card.description) {
      await editCard(card.id, { description: desc });
      setCard(c => ({ ...c, description: desc }));
    }
  };

  const handleToggleLabel = async (labelId) => {
    const has = card.labels.some(cl => cl.label.id === labelId);
    await toggleCardLabel(card.id, labelId, has);
    await fetchCard();
    loadBoard(boardId);
  };

  const handleToggleMember = async (memberId) => {
    const has = card.members.some(cm => cm.member.id === memberId);
    await toggleCardMember(card.id, memberId, has);
    await fetchCard();
    loadBoard(boardId);
  };

  const handleDueDateSave = async () => {
    setShowDatePicker(false);
    await editCard(card.id, { dueDate: dueDate || null });
    await fetchCard();
    loadBoard(boardId);
  };

  const handleRemoveDueDate = async () => {
    setShowDatePicker(false);
    setDueDate('');
    await editCard(card.id, { dueDate: null });
    await fetchCard();
    loadBoard(boardId);
  };

  const handleCover = async (color) => {
    await editCard(card.id, { coverColor: color });
    setCard(c => ({ ...c, coverColor: color }));
    loadBoard(boardId);
  };

  const handleArchive = async () => {
    await editCard(card.id, { isArchived: true });
    loadBoard(boardId);
    onClose();
  };

  const handleDelete = async () => {
    await removeCard(card.id);
    onClose();
  };

  const handleAddChecklist = async (e) => {
    e.preventDefault();
    await api.createChecklist(card.id, { title: checklistTitle || 'Checklist' });
    setChecklistTitle('');
    setShowAddChecklist(false);
    await fetchCard();
  };

  const handleDeleteChecklist = async (id) => {
    await api.deleteChecklist(id);
    await fetchCard();
  };

  const handleToggleItem = async (itemId, isChecked) => {
    await api.updateChecklistItem(itemId, { isChecked: !isChecked });
    await fetchCard();
    loadBoard(boardId);
  };

  const handleAddItem = async (checklistId) => {
    const text = newItemTexts[checklistId];
    if (!text?.trim()) return;
    await api.addChecklistItem(checklistId, { text: text.trim() });
    setNewItemTexts(t => ({ ...t, [checklistId]: '' }));
    await fetchCard();
  };

  const handleDeleteItem = async (itemId) => {
    await api.deleteChecklistItem(itemId);
    await fetchCard();
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    await api.createComment(card.id, { text: commentText.trim() });
    setCommentText('');
    await fetchCard();
  };

  const handleDeleteComment = async (id) => {
    await api.deleteComment(id);
    await fetchCard();
  };

  if (loading) return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
    </div>
  );
  if (!card) return null;

  const listName = card.list?.title || '';

  return (
    <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-50 overflow-y-auto py-12 px-4" onClick={onClose}>
      <div className="bg-[#f1f2f4] rounded-xl w-full max-w-[768px] shadow-2xl relative" onClick={e => e.stopPropagation()}>
        {/* Cover */}
        {card.coverColor && <div className="h-24 rounded-t-xl" style={{ backgroundColor: card.coverColor }} />}

        {/* Close button */}
        <button onClick={onClose} className="absolute top-3 right-3 p-1.5 rounded-full bg-black/10 hover:bg-black/20 text-slate-600 z-10 transition-colors">
          <X size={18} />
        </button>

        <div className="flex flex-col md:flex-row gap-4 p-6">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Title */}
            <div className="flex items-start gap-3 mb-1">
              <CreditCard size={20} className="text-slate-500 mt-1 shrink-0" />
              <div className="flex-1">
                {editingTitle ? (
                  <input autoFocus value={title} onChange={e => setTitle(e.target.value)} onBlur={saveTitle} onKeyDown={e => e.key === 'Enter' && saveTitle()} className="w-full text-xl font-semibold bg-white border-2 border-blue-500 rounded-md px-2 py-1 outline-none text-slate-800" />
                ) : (
                  <h2 onClick={() => setEditingTitle(true)} className="text-xl font-semibold text-slate-800 cursor-pointer hover:bg-black/5 rounded px-1 -mx-1">{card.title}</h2>
                )}
                <p className="text-xs text-slate-500 mt-0.5">in list <span className="font-medium underline">{listName}</span></p>
              </div>
            </div>

            {/* Labels display */}
            {card.labels.length > 0 && (
              <div className="ml-8 mb-4 mt-2">
                <p className="text-xs text-slate-500 font-semibold mb-1.5 uppercase tracking-wide">Labels</p>
                <div className="flex flex-wrap gap-1.5">
                  {card.labels.map(cl => (
                    <span key={cl.label.id} className="px-3 py-1 rounded text-xs font-semibold text-white" style={{ backgroundColor: cl.label.color }}>
                      {cl.label.name || '\u00A0'}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Due Date display */}
            {card.dueDate && (
              <div className="ml-8 mb-4">
                <p className="text-xs text-slate-500 font-semibold mb-1 uppercase tracking-wide">Due Date</p>
                <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded ${new Date(card.dueDate) < new Date() ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
                  <Clock size={13} /> {format(new Date(card.dueDate), 'MMM d, yyyy h:mm a')}
                </span>
              </div>
            )}

            {/* Members display */}
            {card.members.length > 0 && (
              <div className="ml-8 mb-4">
                <p className="text-xs text-slate-500 font-semibold mb-1.5 uppercase tracking-wide">Members</p>
                <div className="flex gap-1.5">
                  {card.members.map(cm => (
                    <div key={cm.member.id} title={cm.member.name} style={{ backgroundColor: cm.member.avatarColor }} className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white">
                      {cm.member.initials}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="flex items-start gap-3 mb-5">
              <AlignLeft size={20} className="text-slate-500 mt-0.5 shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-slate-800 mb-2">Description</h3>
                {editingDesc ? (
                  <div>
                    <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={6} autoFocus className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500 resize-y" placeholder="Add a more detailed description..." />
                    <div className="flex gap-2 mt-2">
                      <button onClick={saveDesc} className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-1.5 rounded-md">Save</button>
                      <button onClick={() => { setEditingDesc(false); setDesc(card.description || ''); }} className="text-slate-600 hover:bg-slate-200 text-sm px-3 py-1.5 rounded-md">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div onClick={() => setEditingDesc(true)} className={`text-sm rounded-lg px-3 py-2.5 cursor-pointer min-h-[56px] transition-colors ${card.description ? 'text-slate-700 bg-white hover:bg-slate-50' : 'text-slate-400 bg-slate-200/60 hover:bg-slate-200'}`}>
                    {card.description || 'Add a more detailed description...'}
                  </div>
                )}
              </div>
            </div>

            {/* Checklists */}
            {card.checklists?.map(cl => {
              const checked = cl.items.filter(i => i.isChecked).length;
              const total = cl.items.length;
              const pct = total > 0 ? Math.round((checked / total) * 100) : 0;
              return (
                <div key={cl.id} className="flex items-start gap-3 mb-5">
                  <CheckSquare size={20} className="text-slate-500 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-slate-800">{cl.title}</h3>
                      <button onClick={() => handleDeleteChecklist(cl.id)} className="text-xs text-slate-500 hover:bg-slate-200 px-2 py-1 rounded">Delete</button>
                    </div>
                    {/* Progress bar */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-slate-500 w-7">{pct}%</span>
                      <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${pct === 100 ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    {/* Items */}
                    <div className="space-y-1">
                      {cl.items.map(item => (
                        <div key={item.id} className="flex items-center gap-2 group hover:bg-slate-100 rounded px-1 py-0.5">
                          <input type="checkbox" checked={item.isChecked} onChange={() => handleToggleItem(item.id, item.isChecked)} className="w-4 h-4 rounded border-slate-300 accent-blue-600 cursor-pointer" />
                          <span className={`flex-1 text-sm ${item.isChecked ? 'line-through text-slate-400' : 'text-slate-700'}`}>{item.text}</span>
                          <button onClick={() => handleDeleteItem(item.id)} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 p-0.5"><X size={14} /></button>
                        </div>
                      ))}
                    </div>
                    {/* Add item */}
                    <div className="flex gap-2 mt-2">
                      <input value={newItemTexts[cl.id] || ''} onChange={e => setNewItemTexts(t => ({ ...t, [cl.id]: e.target.value }))} onKeyDown={e => e.key === 'Enter' && handleAddItem(cl.id)} placeholder="Add an item..." className="flex-1 bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-sm outline-none focus:border-blue-500" />
                      <button onClick={() => handleAddItem(cl.id)} className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-3 py-1.5 rounded-md">Add</button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Activity / Comments */}
            <div className="flex items-start gap-3">
              <MessageSquare size={20} className="text-slate-500 mt-0.5 shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-slate-800 mb-3">Activity</h3>
                {/* Add comment */}
                <form onSubmit={handleAddComment} className="mb-4">
                  <div className="flex gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0">AG</div>
                    <div className="flex-1">
                      <input value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Write a comment..." className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
                      {commentText && <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-1.5 rounded-md mt-2">Save</button>}
                    </div>
                  </div>
                </form>
                {/* Comments list */}
                <div className="space-y-3">
                  {card.comments?.map(c => (
                    <div key={c.id} className="flex gap-2 group">
                      <div style={{ backgroundColor: c.member?.avatarColor || '#0079BF' }} className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0">{c.member?.initials || '??'}</div>
                      <div className="flex-1">
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-semibold text-slate-800">{c.member?.name}</span>
                          <span className="text-xs text-slate-400">{format(new Date(c.createdAt), 'MMM d, h:mm a')}</span>
                        </div>
                        <p className="text-sm text-slate-700 bg-white rounded-lg px-3 py-2 mt-1 shadow-sm border border-slate-100">{c.text}</p>
                        <button onClick={() => handleDeleteComment(c.id)} className="text-xs text-slate-400 hover:text-red-500 mt-1 opacity-0 group-hover:opacity-100">Delete</button>
                      </div>
                    </div>
                  ))}
                  {/* Activity log */}
                  {card.activities?.map(a => (
                    <div key={a.id} className="flex gap-2 items-start">
                      <div style={{ backgroundColor: a.member?.avatarColor || '#666' }} className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0">{a.member?.initials || '??'}</div>
                      <div>
                        <p className="text-sm text-slate-600"><span className="font-semibold text-slate-800">{a.member?.name}</span> {a.details}</p>
                        <span className="text-xs text-slate-400">{format(new Date(a.createdAt), 'MMM d, h:mm a')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-full md:w-[168px] shrink-0 space-y-2">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Add to card</p>

            {/* Members */}
            <div className="relative">
              <button onClick={() => setShowMemberPicker(!showMemberPicker)} className="w-full flex items-center gap-2 bg-slate-200/80 hover:bg-slate-300/80 text-slate-700 text-sm font-medium px-3 py-1.5 rounded-md transition-colors"><Users size={14} /> Members</button>
              {showMemberPicker && (
                <div className="absolute left-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-slate-200 w-60 z-30 p-3">
                  <h4 className="text-sm font-semibold mb-2 text-slate-800">Members</h4>
                  {board.members?.map(bm => {
                    const isAssigned = card.members.some(cm => cm.member.id === bm.member.id);
                    return (
                      <button key={bm.member.id} onClick={() => handleToggleMember(bm.member.id)} className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-slate-100 rounded text-sm text-left">
                        <div style={{ backgroundColor: bm.member.avatarColor }} className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white">{bm.member.initials}</div>
                        <span className="flex-1 text-slate-700">{bm.member.name}</span>
                        {isAssigned && <span className="text-blue-600">✓</span>}
                      </button>
                    );
                  })}
                  <div className="fixed inset-0 -z-10" onClick={() => setShowMemberPicker(false)} />
                </div>
              )}
            </div>

            {/* Labels */}
            <div className="relative">
              <button onClick={() => setShowLabelPicker(!showLabelPicker)} className="w-full flex items-center gap-2 bg-slate-200/80 hover:bg-slate-300/80 text-slate-700 text-sm font-medium px-3 py-1.5 rounded-md transition-colors"><Tag size={14} /> Labels</button>
              {showLabelPicker && (
                <div className="absolute left-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-slate-200 w-60 z-30 p-3">
                  <h4 className="text-sm font-semibold mb-2 text-slate-800">Labels</h4>
                  <div className="space-y-1">
                    {board.labels?.map(label => {
                      const isActive = card.labels.some(cl => cl.label.id === label.id);
                      return (
                        <button key={label.id} onClick={() => handleToggleLabel(label.id)} className="w-full flex items-center gap-2 px-1 py-1 rounded hover:bg-slate-100">
                          <div className="flex-1 h-8 rounded flex items-center px-3 text-xs font-semibold text-white" style={{ backgroundColor: label.color }}>{label.name}</div>
                          {isActive && <span className="text-blue-600 text-sm">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                  <div className="fixed inset-0 -z-10" onClick={() => setShowLabelPicker(false)} />
                </div>
              )}
            </div>

            {/* Checklist */}
            <div className="relative">
              <button onClick={() => setShowAddChecklist(!showAddChecklist)} className="w-full flex items-center gap-2 bg-slate-200/80 hover:bg-slate-300/80 text-slate-700 text-sm font-medium px-3 py-1.5 rounded-md transition-colors"><CheckSquare size={14} /> Checklist</button>
              {showAddChecklist && (
                <form onSubmit={handleAddChecklist} className="absolute left-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-slate-200 w-60 z-30 p-3">
                  <h4 className="text-sm font-semibold mb-2 text-slate-800">Add Checklist</h4>
                  <input value={checklistTitle} onChange={e => setChecklistTitle(e.target.value)} placeholder="Checklist" autoFocus className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-sm outline-none focus:border-blue-500 mb-2" />
                  <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-1.5 rounded-md w-full">Add</button>
                  <div className="fixed inset-0 -z-10" onClick={() => setShowAddChecklist(false)} />
                </form>
              )}
            </div>

            {/* Due Date */}
            <div className="relative">
              <button onClick={() => setShowDatePicker(!showDatePicker)} className="w-full flex items-center gap-2 bg-slate-200/80 hover:bg-slate-300/80 text-slate-700 text-sm font-medium px-3 py-1.5 rounded-md transition-colors"><Clock size={14} /> Dates</button>
              {showDatePicker && (
                <div className="absolute left-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-slate-200 w-60 z-30 p-3">
                  <h4 className="text-sm font-semibold mb-2 text-slate-800">Due Date</h4>
                  <input type="datetime-local" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-sm outline-none focus:border-blue-500 mb-2" />
                  <div className="flex gap-2">
                    <button onClick={handleDueDateSave} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-sm py-1.5 rounded-md">Save</button>
                    <button onClick={handleRemoveDueDate} className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm py-1.5 rounded-md">Remove</button>
                  </div>
                  <div className="fixed inset-0 -z-10" onClick={() => setShowDatePicker(false)} />
                </div>
              )}
            </div>

            {/* Cover */}
            <div className="relative">
              <button onClick={() => setShowCoverPicker(!showCoverPicker)} className="w-full flex items-center gap-2 bg-slate-200/80 hover:bg-slate-300/80 text-slate-700 text-sm font-medium px-3 py-1.5 rounded-md transition-colors"><Palette size={14} /> Cover</button>
              {showCoverPicker && (
                <div className="absolute left-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-slate-200 w-60 z-30 p-3">
                  <h4 className="text-sm font-semibold mb-2 text-slate-800">Card Cover</h4>
                  <div className="grid grid-cols-6 gap-1.5">
                    {COVER_COLORS.map(c => (
                      <button key={c} onClick={() => { handleCover(c); setShowCoverPicker(false); }} className="w-full aspect-[4/3] rounded" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <button onClick={() => { handleCover(null); setShowCoverPicker(false); }} className="w-full text-sm text-slate-600 hover:bg-slate-100 py-1.5 rounded mt-2">Remove cover</button>
                  <div className="fixed inset-0 -z-10" onClick={() => setShowCoverPicker(false)} />
                </div>
              )}
            </div>

            <hr className="border-slate-200 my-3" />
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Actions</p>

            <button onClick={handleArchive} className="w-full flex items-center gap-2 bg-slate-200/80 hover:bg-slate-300/80 text-slate-700 text-sm font-medium px-3 py-1.5 rounded-md transition-colors"><Archive size={14} /> Archive</button>
            <button onClick={handleDelete} className="w-full flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 text-sm font-medium px-3 py-1.5 rounded-md transition-colors"><Trash2 size={14} /> Delete</button>
          </div>
        </div>
      </div>
    </div>
  );
}
