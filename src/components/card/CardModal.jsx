import { useState, useEffect, useCallback } from 'react';
import { X, AlignLeft, Tag, Users, Clock, CheckSquare, MessageSquare, Archive, Trash2, MoreHorizontal, CheckCircle2, Circle, Image, Plus } from 'lucide-react';
import { useBoard } from '../../context/BoardContext';
import * as api from '../../api/api.js';
import { format, formatDistanceToNow } from 'date-fns';

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
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);
  const [dueDate, setDueDate] = useState('');
  const [commentText, setCommentText] = useState('');
  const [checklistTitle, setChecklistTitle] = useState('');
  const [showAddChecklist, setShowAddChecklist] = useState(false);
  const [newItemTexts, setNewItemTexts] = useState({});
  const [customFieldValues, setCustomFieldValues] = useState({});
  const [showAddMenu, setShowAddMenu] = useState(false);

  const [showCreateLabel, setShowCreateLabel] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('#3b82f6');
  const [showCreateMember, setShowCreateMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [allMembers, setAllMembers] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [showAttachmentPicker, setShowAttachmentPicker] = useState(false);
  const [newAttachmentName, setNewAttachmentName] = useState('');
  const [newAttachmentUrl, setNewAttachmentUrl] = useState('');
  const [showCFManager, setShowCFManager] = useState(false);
  const [newCFName, setNewCFName] = useState('');
  const [newCFType, setNewCFType] = useState('text');

  const formatRelativeTime = (date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return 'some time ago';
    }
  };

  const fetchCard = useCallback(async () => {
    try {
      const data = await api.getCard(cardId);
      setCard(data);
      setTitle(data.title);
      setDesc(data.description || '');
      setDueDate(data.dueDate ? format(new Date(data.dueDate), "yyyy-MM-dd'T'HH:mm") : '');
      const valMap = {};
      data.customFieldValues?.forEach(v => { valMap[v.customFieldId] = v.value; });
      setCustomFieldValues(valMap);
      const attachData = await api.getCardAttachments(cardId);
      setAttachments(attachData || []);
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

  const handleAddAttachment = async (e) => {
    e.preventDefault();
    if (!newAttachmentUrl.trim()) return;
    try {
      let url = newAttachmentUrl.trim();
      if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
      const name = newAttachmentName.trim() || url;
      await api.addCardAttachment(card.id, { name, url });
      setNewAttachmentName('');
      setNewAttachmentUrl('');
      setShowAttachmentPicker(false);
      await fetchCard();
    } catch (err) {
      console.error('Failed to add attachment', err);
      alert('Failed to add attachment');
    }
  };

  const handleDeleteAttachment = async (id) => {
    try {
      await api.deleteCardAttachment(id);
      await fetchCard();
    } catch (err) {
      console.error('Failed to delete attachment', err);
      alert('Failed to delete attachment');
    }
  };

  const handleCreateCustomField = async (e) => {
    e.preventDefault();
    if (!newCFName.trim()) return;
    try {
      await api.createCustomField(boardId, { name: newCFName.trim(), type: newCFType });
      setNewCFName('');
      setNewCFType('text');
      await loadBoard(boardId);
      await fetchCard();
    } catch (err) {
      console.error('Failed to create custom field', err);
      alert('Failed to create custom field');
    }
  };

  const handleDeleteCustomField = async (id) => {
    if (window.confirm('Are you sure you want to delete this custom field? This will delete all values stored for it on all cards.')) {
      try {
        await api.deleteCustomField(id);
        await loadBoard(boardId);
        await fetchCard();
      } catch (err) {
        console.error('Failed to delete custom field', err);
        alert('Failed to delete custom field');
      }
    }
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

  const handleStartEditComment = (id, text) => {
    setEditingCommentId(id);
    setEditingCommentText(text);
  };

  const handleCancelEditComment = () => {
    setEditingCommentId(null);
    setEditingCommentText('');
  };

  const handleSaveEditComment = async (id) => {
    if (!editingCommentText.trim()) return;
    await api.updateComment(id, { text: editingCommentText.trim() });
    setEditingCommentId(null);
    setEditingCommentText('');
    await fetchCard();
  };

  const handleToggleComplete = async () => {
    const nextVal = !card.isCompleted;
    await editCard(card.id, { isCompleted: nextVal });
    setCard(c => ({ ...c, isCompleted: nextVal }));
    loadBoard(boardId);
  };

  const handleListChange = async (e) => {
    const newListId = parseInt(e.target.value);
    if (newListId !== card.listId) {
      await editCard(card.id, { listId: newListId });
      await fetchCard();
      loadBoard(boardId);
    }
  };

  const handleCustomFieldChange = (fieldId, value) => {
    setCustomFieldValues(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleCustomFieldBlur = async (fieldId, value) => {
    try {
      await api.updateCardCustomField(card.id, fieldId, value);
      loadBoard(boardId);
    } catch (err) {
      console.error('Failed to update custom field', err);
    }
  };

  const handleCreateLabel = async (e) => {
    e.preventDefault();
    if (!newLabelColor) return;
    try {
      await api.createLabel(boardId, { name: newLabelName.trim(), color: newLabelColor });
      setNewLabelName('');
      setNewLabelColor('#3b82f6');
      setShowCreateLabel(false);
      loadBoard(boardId);
    } catch (err) {
      console.error('Failed to create label', err);
    }
  };

  const fetchAllMembers = async () => {
    try {
      const members = await api.getMembers();
      setAllMembers(members);
    } catch (err) {
      console.error('Failed to fetch members', err);
    }
  };

  const handleAddMemberToBoard = async (memberId) => {
    try {
      await api.addBoardMember(boardId, memberId);
      loadBoard(boardId);
    } catch (err) {
      console.error('Failed to add member to board', err);
    }
  };

  const handleCreateMember = async (e) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberEmail.trim()) return;
    try {
      const member = await api.createMember({ name: newMemberName.trim(), email: newMemberEmail.trim() });
      await api.addBoardMember(boardId, member.id);
      setNewMemberName('');
      setNewMemberEmail('');
      setShowCreateMember(false);
      loadBoard(boardId);
      fetchAllMembers();
    } catch (err) {
      console.error('Failed to create member', err);
      alert(err.message || 'Failed to create member');
    }
  };

  // Close all pickers when clicking outside
  const closeAllPickers = () => {
    setShowLabelPicker(false);
    setShowMemberPicker(false);
    setShowDatePicker(false);
    setShowCoverPicker(false);
    setShowHeaderMenu(false);
    setShowAddMenu(false);
    setShowAddChecklist(false);
    setShowAttachmentPicker(false);
    setShowCFManager(false);
    setShowCreateLabel(false);
    setShowCreateMember(false);
    setMemberSearchQuery('');
  };

  if (loading) return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
    </div>
  );
  if (!card) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-start justify-center z-50 overflow-y-auto py-8 px-4"
      onClick={onClose}
    >
      <div
        className="bg-[#f1f2f4] rounded-xl w-full max-w-[1000px] shadow-2xl relative my-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Cover */}
        {card.coverColor && <div className="h-24 rounded-t-xl" style={{ backgroundColor: card.coverColor }} />}

        {/* Top-Right Header Actions */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
          <div className="relative">
            <button
              onClick={() => setShowCoverPicker(!showCoverPicker)}
              className="p-1.5 rounded bg-black/5 hover:bg-black/10 text-slate-700 transition-colors"
              title="Cover"
            >
              <Image size={16} />
            </button>
            {showCoverPicker && (
              <>
                <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-slate-200 w-60 z-30 p-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Card Cover</h4>
                  <div className="grid grid-cols-6 gap-1.5">
                    {COVER_COLORS.map(c => (
                      <button key={c} onClick={() => { handleCover(c); setShowCoverPicker(false); }} className="w-full aspect-[4/3] rounded hover:opacity-85 transition-opacity" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <button onClick={() => { handleCover(null); setShowCoverPicker(false); }} className="w-full text-xs text-slate-600 hover:bg-slate-100 py-1.5 rounded mt-2 border border-slate-200">Remove cover</button>
                </div>
                <div className="fixed inset-0 z-20" onClick={() => setShowCoverPicker(false)} />
              </>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setShowHeaderMenu(!showHeaderMenu)}
              className="p-1.5 rounded bg-black/5 hover:bg-black/10 text-slate-700 transition-colors"
              title="More actions"
            >
              <MoreHorizontal size={16} />
            </button>
            {showHeaderMenu && (
              <>
                <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-slate-200 w-44 z-30 py-1">
                  <button
                    onClick={() => { setShowHeaderMenu(false); handleArchive(); }}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                  >
                    <Archive size={14} /> Archive Card
                  </button>
                  <button
                    onClick={() => { setShowHeaderMenu(false); handleDelete(); }}
                    className="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <Trash2 size={14} /> Delete Card
                  </button>
                </div>
                <div className="fixed inset-0 z-20" onClick={() => setShowHeaderMenu(false)} />
              </>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded bg-black/5 hover:bg-black/10 text-slate-700 transition-colors"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 pb-2">
          {/* List Selector */}
          <div className="mb-4 flex items-center">
            <div className="relative">
              <select
                value={card.listId}
                onChange={handleListChange}
                className="appearance-none bg-[#e2f0d9] hover:bg-[#d4e8c8] text-[#385723] font-semibold text-xs rounded px-3 py-1.5 pr-8 cursor-pointer outline-none border-none transition-colors"
              >
                {board.lists?.map(l => (
                  <option key={l.id} value={l.id} className="bg-white text-slate-800 font-normal">{l.title}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-[#385723]">
                <svg className="fill-current h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Title Row */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleComplete}
              className="text-slate-400 hover:text-green-600 transition-colors duration-150 focus:outline-none"
            >
              {card.isCompleted ? (
                <CheckCircle2 size={24} className="text-green-600 fill-green-100" />
              ) : (
                <Circle size={24} className="opacity-60 hover:opacity-100 text-slate-500" />
              )}
            </button>
            <div className="flex-1 min-w-0">
              {editingTitle ? (
                <input
                  autoFocus
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  onBlur={saveTitle}
                  onKeyDown={e => e.key === 'Enter' && saveTitle()}
                  className="w-full text-2xl font-bold bg-white border-2 border-blue-500 rounded-md px-2 py-1 outline-none text-slate-800"
                />
              ) : (
                <h2
                  onClick={() => setEditingTitle(true)}
                  className="text-2xl font-bold cursor-pointer hover:bg-black/5 rounded px-1 -mx-1 truncate text-slate-800"
                >
                  {card.title}
                </h2>
              )}
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="ml-9 mt-4 flex flex-wrap gap-2 items-center">
            {/* + Add Button */}
            <div className="relative">
              <button
                onClick={() => setShowAddMenu(!showAddMenu)}
                className="flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded transition-colors"
              >
                <Plus size={13} /> Add
              </button>
              {showAddMenu && (
                <>
                  <div className="absolute left-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-slate-200 w-48 z-30 p-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 py-1 mb-1">Add to Card</h4>
                    <button onClick={() => { setShowAddMenu(false); setShowMemberPicker(true); }} className="w-full text-left px-2 py-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded flex items-center gap-2"><Users size={12} /> Members</button>
                    <button onClick={() => { setShowAddMenu(false); setShowLabelPicker(true); }} className="w-full text-left px-2 py-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded flex items-center gap-2"><Tag size={12} /> Labels</button>
                    <button onClick={() => { setShowAddMenu(false); setShowDatePicker(true); }} className="w-full text-left px-2 py-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded flex items-center gap-2"><Clock size={12} /> Dates</button>
                    <button onClick={() => { setShowAddMenu(false); setShowAddChecklist(true); }} className="w-full text-left px-2 py-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded flex items-center gap-2"><CheckSquare size={12} /> Checklist</button>
                  </div>
                  <div className="fixed inset-0 z-20" onClick={() => setShowAddMenu(false)} />
                </>
              )}
            </div>

            {/* Labels Button */}
            <div className="relative">
              <button
                onClick={() => setShowLabelPicker(!showLabelPicker)}
                className="flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded transition-colors"
              >
                <Tag size={13} /> Labels
              </button>
              {showLabelPicker && (
                <>
                  <div className="absolute left-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-slate-200 w-72 z-30 p-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Labels</h4>
                    <div className="space-y-1 max-h-[200px] overflow-y-auto">
                      {board.labels?.length > 0 ? board.labels.map(label => {
                        const isActive = card.labels?.some(cl => cl.label.id === label.id);
                        return (
                          <button key={label.id} onClick={() => handleToggleLabel(label.id)} className="w-full flex items-center gap-2 px-1 py-1 rounded hover:bg-slate-100">
                            <div className="flex-1 h-8 rounded flex items-center px-3 text-xs font-semibold text-white" style={{ backgroundColor: label.color }}>{label.name || '—'}</div>
                            {isActive && <span className="text-blue-600 text-sm">✓</span>}
                          </button>
                        );
                      }) : (
                        <p className="text-xs text-slate-400 italic py-2">No labels yet. Create one below.</p>
                      )}
                    </div>
                    <div className="border-t border-slate-200 mt-2 pt-2">
                      {showCreateLabel ? (
                        <form onSubmit={handleCreateLabel} className="space-y-2">
                          <input value={newLabelName} onChange={e => setNewLabelName(e.target.value)} placeholder="Label name" autoFocus className="w-full border border-slate-300 rounded px-2 py-1.5 text-xs outline-none focus:border-blue-500 text-slate-700" />
                          <div>
                            <p className="text-[10px] text-slate-400 font-medium mb-1">Pick a color</p>
                            <div className="flex gap-1.5 flex-wrap">
                              {['#ef4444','#f97316','#eab308','#22c55e','#3b82f6','#8b5cf6','#ec4899','#06b6d4','#84cc16','#1d1d1d'].map(c => (
                                <button type="button" key={c} onClick={() => setNewLabelColor(c)} className={`w-7 h-5 rounded ${newLabelColor === c ? 'ring-2 ring-blue-500 ring-offset-1' : 'hover:opacity-80'}`} style={{ backgroundColor: c }} />
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1.5 rounded font-medium">Create</button>
                            <button type="button" onClick={() => setShowCreateLabel(false)} className="text-slate-500 text-xs px-2 py-1.5 hover:bg-slate-100 rounded">Cancel</button>
                          </div>
                        </form>
                      ) : (
                        <button onClick={() => setShowCreateLabel(true)} className="w-full text-left text-xs text-blue-600 hover:bg-blue-50 px-2 py-1.5 rounded font-medium flex items-center gap-1.5">
                          <Plus size={12} /> Create a new label
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="fixed inset-0 z-20" onClick={() => { setShowLabelPicker(false); setShowCreateLabel(false); }} />
                </>
              )}
            </div>

            {/* Dates Button */}
            <div className="relative">
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded transition-colors"
              >
                <Clock size={13} /> Dates
              </button>
              {showDatePicker && (
                <>
                  <div className="absolute left-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-slate-200 w-60 z-30 p-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Due Date</h4>
                    <input type="datetime-local" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-sm outline-none focus:border-blue-500 mb-2 text-slate-700" />
                    <div className="flex gap-2">
                      <button onClick={handleDueDateSave} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs py-1.5 rounded font-medium">Save</button>
                      <button onClick={handleRemoveDueDate} className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs py-1.5 rounded font-medium">Remove</button>
                    </div>
                  </div>
                  <div className="fixed inset-0 z-20" onClick={() => setShowDatePicker(false)} />
                </>
              )}
            </div>

            {/* Checklist Button */}
            <div className="relative">
              <button
                onClick={() => setShowAddChecklist(!showAddChecklist)}
                className="flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded transition-colors"
              >
                <CheckSquare size={13} /> Checklist
              </button>
              {showAddChecklist && (
                <>
                  <form onSubmit={handleAddChecklist} className="absolute left-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-slate-200 w-60 z-30 p-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Add Checklist</h4>
                    <input value={checklistTitle} onChange={e => setChecklistTitle(e.target.value)} placeholder="Checklist" autoFocus className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-sm outline-none focus:border-blue-500 mb-2 text-slate-700" />
                    <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-4 py-1.5 rounded w-full font-medium">Add</button>
                  </form>
                  <div className="fixed inset-0 z-20" onClick={() => setShowAddChecklist(false)} />
                </>
              )}
            </div>

            {/* Members Button */}
            <div className="relative">
              <button
                onClick={() => { setShowMemberPicker(!showMemberPicker); if (!showMemberPicker) fetchAllMembers(); }}
                className="flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded transition-colors"
              >
                <Users size={13} /> Members
              </button>
              {showMemberPicker && (
                <>
                  <div className="absolute left-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-slate-200 w-72 z-30 p-3 text-slate-700">
                    <input value={memberSearchQuery} onChange={e => setMemberSearchQuery(e.target.value)} placeholder="Search members..." className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs outline-none focus:border-blue-500 mb-3 text-slate-700 bg-white" autoFocus />
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Board Members</h4>
                    <div className="max-h-[150px] overflow-y-auto space-y-0.5 mb-2">
                      {(() => {
                        const filteredBoardMembers = board.members?.filter(bm => bm.member.name.toLowerCase().includes(memberSearchQuery.toLowerCase())) || [];
                        if (filteredBoardMembers.length === 0) return <p className="text-xs text-slate-400 italic py-1">No matching board members.</p>;
                        return filteredBoardMembers.map(bm => {
                          const isAssigned = card.members?.some(cm => cm.member.id === bm.member.id);
                          return (
                            <button key={bm.member.id} onClick={() => handleToggleMember(bm.member.id)} className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-slate-100 rounded text-xs text-left">
                              <div style={{ backgroundColor: bm.member.avatarColor }} className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0">{bm.member.initials}</div>
                              <span className="flex-1 text-slate-700 truncate">{bm.member.name}</span>
                              {isAssigned && <span className="text-blue-600 text-xs">✓</span>}
                            </button>
                          );
                        });
                      })()}
                    </div>
                    {(() => {
                      if (!memberSearchQuery.trim()) return null;
                      const boardMemberIds = new Set(board.members?.map(bm => bm.member.id) || []);
                      const otherMembers = allMembers.filter(m => !boardMemberIds.has(m.id) && m.name.toLowerCase().includes(memberSearchQuery.toLowerCase()));
                      if (otherMembers.length === 0) return null;
                      return (
                        <div className="border-t border-slate-200 mt-2 pt-2">
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Add to Board</p>
                          <div className="max-h-[100px] overflow-y-auto space-y-0.5">
                            {otherMembers.map(m => (
                              <button key={m.id} onClick={() => handleAddMemberToBoard(m.id)} className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-green-50 rounded text-xs text-left">
                                <div style={{ backgroundColor: m.avatarColor }} className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0">{m.initials}</div>
                                <span className="flex-1 text-slate-700 truncate">{m.name}</span>
                                <span className="text-green-600 text-[10px] font-medium">+ Add</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                    <div className="border-t border-slate-200 mt-2 pt-2">
                      {showCreateMember ? (
                        <form onSubmit={handleCreateMember} className="space-y-2">
                          <input value={newMemberName} onChange={e => setNewMemberName(e.target.value)} placeholder="Full name" className="w-full border border-slate-300 rounded px-2 py-1.5 text-xs outline-none focus:border-blue-500 text-slate-700 bg-white" />
                          <input value={newMemberEmail} onChange={e => setNewMemberEmail(e.target.value)} placeholder="Email address" type="email" className="w-full border border-slate-300 rounded px-2 py-1.5 text-xs outline-none focus:border-blue-500 text-slate-700 bg-white" />
                          <div className="flex gap-2">
                            <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1.5 rounded font-medium">Create & Add</button>
                            <button type="button" onClick={() => setShowCreateMember(false)} className="text-slate-500 text-xs px-2 py-1.5 hover:bg-slate-100 rounded">Cancel</button>
                          </div>
                        </form>
                      ) : (
                        <button onClick={() => setShowCreateMember(true)} className="w-full text-left text-xs text-blue-600 hover:bg-blue-50 px-2 py-1.5 rounded font-medium flex items-center gap-1.5">
                          <Plus size={12} /> Create a new member
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="fixed inset-0 z-20" onClick={() => { setShowMemberPicker(false); setShowCreateMember(false); setMemberSearchQuery(''); }} />
                </>
              )}
            </div>

            {/* Attachment Button */}
            <div className="relative">
              <button
                onClick={() => setShowAttachmentPicker(!showAttachmentPicker)}
                className="flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded transition-colors"
              >
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-700">
                  <path d="M15.172 7l-6.586 6.586a3 3 0 104.243 4.243l6.586-6.586a5 5 0 10-7.072-7.072L5.758 10.758a7 7 0 109.9 9.9l6.586-6.586" />
                </svg>
                Attachment
              </button>
              {showAttachmentPicker && (
                <>
                  <form onSubmit={handleAddAttachment} className="absolute left-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-slate-200 w-64 z-30 p-3" onClick={e => e.stopPropagation()}>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Attach a link</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] text-slate-400 font-medium block mb-1">Attach link URL</label>
                        <input required value={newAttachmentUrl} onChange={e => setNewAttachmentUrl(e.target.value)} placeholder="Paste link here..." autoFocus className="w-full border border-slate-300 rounded px-2 py-1.5 text-xs outline-none focus:border-blue-500 text-slate-700" />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 font-medium block mb-1">Link name (optional)</label>
                        <input value={newAttachmentName} onChange={e => setNewAttachmentName(e.target.value)} placeholder="Link name" className="w-full border border-slate-300 rounded px-2 py-1.5 text-xs outline-none focus:border-blue-500 text-slate-700" />
                      </div>
                      <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-4 py-1.5 rounded w-full font-medium">Attach</button>
                    </div>
                  </form>
                  <div className="fixed inset-0 z-20" onClick={() => setShowAttachmentPicker(false)} />
                </>
              )}
            </div>

            {/* Custom Fields Button */}
            <div className="relative">
              <button
                onClick={() => setShowCFManager(!showCFManager)}
                className="flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded transition-colors"
              >
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-700">
                  <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Custom Fields
              </button>
              {showCFManager && (
                <>
                  <div className="absolute left-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-slate-200 w-64 z-30 p-3" onClick={e => e.stopPropagation()}>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Custom Fields</h4>
                    <div className="space-y-1 max-h-[150px] overflow-y-auto mb-3">
                      {board.customFields?.length > 0 ? (
                        board.customFields.map(cf => (
                          <div key={cf.id} className="flex items-center justify-between px-2 py-1 bg-slate-50 border border-slate-100 rounded text-xs">
                            <span className="font-medium text-slate-700">{cf.name} <span className="text-[10px] text-slate-400 font-normal">({cf.type})</span></span>
                            <button onClick={() => handleDeleteCustomField(cf.id)} className="text-slate-400 hover:text-red-500 p-0.5 rounded transition-colors" title="Delete custom field">
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 italic py-1">No custom fields yet.</p>
                      )}
                    </div>
                    <form onSubmit={handleCreateCustomField} className="border-t border-slate-200 pt-2 space-y-2">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Create a field</p>
                      <div>
                        <label className="text-[10px] text-slate-500 block mb-1">Field Name</label>
                        <input required value={newCFName} onChange={e => setNewCFName(e.target.value)} placeholder="e.g. Effort, Estimate" className="w-full border border-slate-300 rounded px-2 py-1.5 text-xs outline-none focus:border-blue-500 text-slate-700" />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 block mb-1">Field Type</label>
                        <select value={newCFType} onChange={e => setNewCFType(e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1.5 text-xs outline-none focus:border-blue-500 text-slate-700 bg-white">
                          <option value="text">Text</option>
                          <option value="number">Number</option>
                          <option value="checkbox">Checkbox</option>
                          <option value="date">Date</option>
                        </select>
                      </div>
                      <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-4 py-1.5 rounded w-full font-medium">Create</button>
                    </form>
                  </div>
                  <div className="fixed inset-0 z-20" onClick={() => setShowCFManager(false)} />
                </>
              )}
            </div>
          </div>
        </div>

        {/* 2-Column Details Layout */}
        <div className="flex flex-col md:flex-row gap-6 p-6 pt-4">
          {/* Left Column */}
          <div className="md:w-[62%] space-y-6">
            {((card.members && card.members.length > 0) || (card.labels && card.labels.length > 0) || card.dueDate) && (
              <div className="ml-9 flex flex-wrap gap-4">
                {card.members && card.members.length > 0 && (
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Members</p>
                    <div className="flex gap-1">
                      {card.members.map(cm => (
                        <div key={cm.member.id} title={cm.member.name} style={{ backgroundColor: cm.member.avatarColor }} className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                          {cm.member.initials}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {card.labels && card.labels.length > 0 && (
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Labels</p>
                    <div className="flex flex-wrap gap-1">
                      {card.labels.map(cl => (
                        <span key={cl.label.id} className="px-2.5 py-0.5 rounded text-[11px] font-semibold text-white shadow-sm" style={{ backgroundColor: cl.label.color }}>
                          {cl.label.name || '\u00A0'}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {card.dueDate && (
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Due Date</p>
                    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded shadow-sm ${new Date(card.dueDate) < new Date() ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
                      <Clock size={11} /> {format(new Date(card.dueDate), 'MMM d, h:mm a')}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            <div className="flex items-start gap-3">
              <AlignLeft size={20} className="text-slate-500 mt-0.5 shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-slate-800 mb-2">Description</h3>
                {editingDesc ? (
                  <div>
                    <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={4} autoFocus className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm outline-none focus:border-blue-500 resize-y text-slate-700" placeholder="Add a more detailed description..." />
                    <div className="flex gap-2 mt-2">
                      <button onClick={saveDesc} className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-4 py-1.5 rounded font-semibold">Save</button>
                      <button onClick={() => { setEditingDesc(false); setDesc(card.description || ''); }} className="text-slate-600 hover:bg-slate-200 text-xs px-3 py-1.5 rounded font-semibold">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div onClick={() => setEditingDesc(true)} className="text-sm rounded border border-slate-300 bg-white hover:bg-slate-50 px-3 py-2 cursor-pointer min-h-[56px] transition-colors text-slate-700">
                    {card.description || <span className="text-slate-400">Add a more detailed description...</span>}
                  </div>
                )}
              </div>
            </div>

            {/* Custom Fields */}
            {board.customFields && board.customFields.length > 0 && (
              <div className="flex items-start gap-3">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-500 mt-1 shrink-0">
                  <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-slate-800">Custom Fields</h3>
                    <button onClick={() => setShowCFManager(!showCFManager)} className="border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded transition-colors">Manage</button>
                  </div>
                  <div className="space-y-4">
                    {board.customFields.map(cf => (
                      <div key={cf.id} className="flex flex-col gap-1 max-w-xs">
                        <label className="text-xs font-medium text-slate-600">{cf.name}</label>
                        <input
                          type="text"
                          value={customFieldValues[cf.id] || ''}
                          onChange={e => handleCustomFieldChange(cf.id, e.target.value)}
                          onBlur={e => handleCustomFieldBlur(cf.id, e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); }}
                          placeholder={`Add ${cf.name.replace('# ', '')}...`}
                          className="w-full bg-white border border-slate-300 hover:border-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all rounded px-3 py-1.5 text-sm outline-none text-slate-700"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Attachments */}
            {attachments && attachments.length > 0 && (
              <div className="flex items-start gap-3">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-500 mt-1 shrink-0">
                  <path d="M15.172 7l-6.586 6.586a3 3 0 104.243 4.243l6.586-6.586a5 5 0 10-7.072-7.072L5.758 10.758a7 7 0 109.9 9.9l6.586-6.586" />
                </svg>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-slate-800 mb-2">Attachments</h3>
                  <div className="space-y-2">
                    {attachments.map(att => (
                      <div key={att.id} className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-lg group hover:bg-slate-50/80 transition-colors">
                        <div className="min-w-0 flex-1">
                          <a href={att.url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-blue-600 hover:underline truncate block">{att.name}</a>
                          <span className="text-[11px] text-slate-400 block truncate mt-0.5">{att.url}</span>
                        </div>
                        <button onClick={() => handleDeleteAttachment(att.id)} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 p-1.5 transition-opacity" title="Delete attachment">
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Checklists */}
            {card.checklists?.map(cl => {
              const checked = cl.items.filter(i => i.isChecked).length;
              const total = cl.items.length;
              const pct = total > 0 ? Math.round((checked / total) * 100) : 0;
              return (
                <div key={cl.id} className="flex items-start gap-3">
                  <CheckSquare size={20} className="text-slate-500 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-slate-800">{cl.title}</h3>
                      <button onClick={() => handleDeleteChecklist(cl.id)} className="text-xs text-slate-500 hover:bg-slate-200 px-2 py-1 rounded">Delete</button>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-slate-500 w-7 font-semibold">{pct}%</span>
                      <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${pct === 100 ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      {cl.items.map(item => (
                        <div key={item.id} className="flex items-center gap-2 group hover:bg-slate-100/80 rounded px-1 py-0.5">
                          <input type="checkbox" checked={item.isChecked} onChange={() => handleToggleItem(item.id, item.isChecked)} className="w-4 h-4 rounded border-slate-300 accent-blue-600 cursor-pointer" />
                          <span className={`flex-1 text-sm ${item.isChecked ? 'line-through text-slate-400' : 'text-slate-700'}`}>{item.text}</span>
                          <button onClick={() => handleDeleteItem(item.id)} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 p-0.5"><X size={14} /></button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <input value={newItemTexts[cl.id] || ''} onChange={e => setNewItemTexts(t => ({ ...t, [cl.id]: e.target.value }))} onKeyDown={e => e.key === 'Enter' && handleAddItem(cl.id)} placeholder="Add an item..." className="flex-1 bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-sm outline-none focus:border-blue-500 text-slate-700" />
                      <button onClick={() => handleAddItem(cl.id)} className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1.5 rounded-md font-semibold">Add</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column */}
          <div className="md:w-[38%] space-y-6 border-t md:border-t-0 md:border-l border-slate-200 pt-6 md:pt-0 md:pl-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <MessageSquare size={20} className="text-slate-500 shrink-0" />
                <h3 className="text-sm font-semibold text-slate-800">Comments and activity</h3>
              </div>

              {/* Add comment */}
              <form onSubmit={handleAddComment} className="mb-4">
                <input
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="w-full bg-white border border-slate-300 hover:border-slate-400 focus:border-blue-500 transition-colors rounded-lg px-3 py-2 text-sm outline-none text-slate-700"
                />
                {commentText && (
                  <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-4 py-1.5 rounded-md mt-2 font-semibold">Save</button>
                )}
              </form>

              {/* Comments & Activity */}
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                {(() => {
                  const items = [];
                  card.comments?.forEach(c => {
                    items.push({ type: 'comment', id: `comment-${c.id}`, dbId: c.id, date: new Date(c.createdAt), member: c.member, text: c.text });
                  });
                  card.activities?.forEach(a => {
                    items.push({ type: 'activity', id: `activity-${a.id}`, date: new Date(a.createdAt), member: a.member, text: a.details });
                  });
                  items.sort((a, b) => b.date - a.date);

                  if (items.length === 0) return <p className="text-xs text-slate-400 italic">No activity yet.</p>;

                  return items.map(item => {
                    const relativeTime = formatRelativeTime(item.date);
                    if (item.type === 'comment') {
                      const isEditing = editingCommentId === item.dbId;
                      return (
                        <div key={item.id} className="flex gap-3 group">
                          <div style={{ backgroundColor: item.member?.avatarColor || '#0079BF' }} className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-sm">
                            {item.member?.initials || '??'}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-baseline gap-2">
                              <span className="text-sm font-semibold text-slate-800">{item.member?.name}</span>
                              <span className="text-[10px] text-slate-400">{format(item.date, 'MMM d, h:mm a')}</span>
                            </div>
                            {isEditing ? (
                              <div className="mt-1">
                                <textarea value={editingCommentText} onChange={e => setEditingCommentText(e.target.value)} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 resize-y text-slate-700 shadow-inner" rows={2} autoFocus />
                                <div className="flex gap-2 mt-1.5">
                                  <button onClick={() => handleSaveEditComment(item.dbId)} className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1.5 rounded font-semibold transition-colors">Save</button>
                                  <button onClick={handleCancelEditComment} className="text-slate-600 hover:bg-slate-200 text-xs px-3 py-1.5 rounded font-semibold transition-colors">Cancel</button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <p className="text-sm text-slate-700 bg-white rounded-lg px-3 py-2 mt-1 shadow-sm border border-slate-200">{item.text}</p>
                                {item.member?.id === 1 && (
                                  <div className="flex gap-2 mt-1">
                                    <button onClick={() => handleStartEditComment(item.dbId, item.text)} className="text-[10px] text-slate-500 hover:underline opacity-0 group-hover:opacity-100 transition-opacity">Edit</button>
                                    <span className="text-[10px] text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">•</span>
                                    <button onClick={() => handleDeleteComment(item.dbId)} className="text-[10px] text-red-500 hover:underline opacity-0 group-hover:opacity-100 transition-opacity">Delete</button>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <div key={item.id} className="flex gap-3 items-start">
                          <div style={{ backgroundColor: item.member?.avatarColor || '#666' }} className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-sm">
                            {item.member?.initials || '??'}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-slate-600 leading-snug">
                              <span className="font-semibold text-slate-800">{item.member?.name}</span> {item.text}
                            </p>
                            <span className="text-[10px] text-slate-400 mt-0.5 inline-block">{relativeTime}</span>
                          </div>
                        </div>
                      );
                    }
                  });
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}