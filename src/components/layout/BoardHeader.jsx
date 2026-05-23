import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreHorizontal, Filter, X, Archive } from 'lucide-react';
import { useBoard } from '../../context/BoardContext';
import * as api from '../../api/api.js';
import { BACKGROUNDS, getBgClass } from '../../pages/BoardsHome';

export default function BoardHeader({ board, filters, onFilterChange, onShowArchived }) {
  const navigate = useNavigate();
  const { dispatch } = useBoard();
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState(board.title);
  const [showFilter, setShowFilter] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const titleRef = useRef(null);

  useEffect(() => { setTitle(board.title); }, [board.title]);

  const saveTitle = async () => {
    setEditingTitle(false);
    if (title.trim() && title.trim() !== board.title) {
      await api.updateBoard(board.id, { title: title.trim() });
      dispatch({ type: 'UPDATE_BOARD_META', payload: { title: title.trim() } });
    } else {
      setTitle(board.title);
    }
  };

  const handleBgChange = async (bgId) => {
    await api.updateBoard(board.id, { background: bgId });
    dispatch({ type: 'UPDATE_BOARD_META', payload: { background: bgId } });
  };

  const handleDeleteBoard = async () => {
    if (confirm('Delete this board? This cannot be undone.')) {
      await api.deleteBoard(board.id);
      navigate('/');
    }
  };

  const hasActiveFilters = filters.label || filters.member || filters.due;

  return (
    <div className="h-14 px-3 flex items-center justify-between text-white shrink-0 bg-black/20 backdrop-blur-sm relative z-50">
      
      {/* Left: board title */}
      <div className="flex items-center min-w-0 flex-1 mr-2">
        {editingTitle ? (
          <input
            ref={titleRef}
            autoFocus
            value={title}
            onChange={e => setTitle(e.target.value)}
            onBlur={saveTitle}
            onKeyDown={e => e.key === 'Enter' && saveTitle()}
            className="text-lg font-bold bg-white/20 rounded-md px-2 py-0.5 text-white outline-none border border-white/40 w-full max-w-[200px]"
          />
        ) : (
          <h1
            onClick={() => setEditingTitle(true)}
            className="text-lg font-bold cursor-pointer hover:bg-white/20 rounded-md px-2 py-0.5 transition-colors truncate"
          >
            {board.title}
          </h1>
        )}
      </div>

      {/* Right: avatars + filter + menu — all shrink-0 so they never get pushed off */}
      <div className="flex items-center gap-1.5 shrink-0">
        
        {/* Member avatars — hidden on very small screens to protect the menu */}
        <div className="hidden sm:flex -space-x-1.5 mr-1">
          {board.members?.slice(0, 5).map(bm => (
            <div
              key={bm.memberId}
              title={bm.member.name}
              style={{ backgroundColor: bm.member.avatarColor }}
              className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white ring-2 ring-white/20"
            >
              {bm.member.initials}
            </div>
          ))}
        </div>

        {/* Filter button */}
        <div className="relative">
          <button
            onClick={() => setShowFilter(!showFilter)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
              hasActiveFilters ? 'bg-blue-600 text-white' : 'bg-white/20 hover:bg-white/30 text-white'
            }`}
          >
            <Filter size={14} />
            <span className="hidden xs:inline">Filter</span>
            {hasActiveFilters && (
              <button
                onClick={(e) => { e.stopPropagation(); onFilterChange({ label: '', member: '', due: '' }); }}
                className="ml-0.5 hover:bg-white/20 rounded-full p-0.5"
              >
                <X size={12} />
              </button>
            )}
          </button>

          {showFilter && (
            <div
              className="absolute right-0 top-full mt-2 bg-[#282e33] border border-white/10 rounded-xl shadow-2xl w-72 p-4 z-50"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-sm font-semibold mb-3">Filter Cards</h3>

              <div className="mb-3">
                <label className="text-xs text-white/50 font-medium mb-1.5 block">Label</label>
                <select
                  value={filters.label}
                  onChange={e => onFilterChange({ ...filters, label: e.target.value })}
                  className="w-full bg-[#22272b] border border-white/20 rounded-md px-2 py-1.5 text-sm text-white outline-none"
                >
                  <option value="">All labels</option>
                  {board.labels?.map(l => (
                    <option key={l.id} value={l.id}>{l.name || l.color}</option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="text-xs text-white/50 font-medium mb-1.5 block">Member</label>
                <select
                  value={filters.member}
                  onChange={e => onFilterChange({ ...filters, member: e.target.value })}
                  className="w-full bg-[#22272b] border border-white/20 rounded-md px-2 py-1.5 text-sm text-white outline-none"
                >
                  <option value="">All members</option>
                  {board.members?.map(bm => (
                    <option key={bm.memberId} value={bm.memberId}>{bm.member.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-white/50 font-medium mb-1.5 block">Due Date</label>
                <select
                  value={filters.due}
                  onChange={e => onFilterChange({ ...filters, due: e.target.value })}
                  className="w-full bg-[#22272b] border border-white/20 rounded-md px-2 py-1.5 text-sm text-white outline-none"
                >
                  <option value="">Any</option>
                  <option value="overdue">Overdue</option>
                  <option value="today">Due today</option>
                  <option value="week">Due this week</option>
                  <option value="none">No due date</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Three-dot menu — shrink-0 ensures it's always visible */}
        <div className="relative shrink-0">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="hover:bg-white/20 p-1.5 rounded transition-colors"
          >
            <MoreHorizontal size={18} />
          </button>

          {showMenu && (
            <div
              className="absolute right-0 top-full mt-2 bg-[#282e33] border border-white/10 rounded-xl shadow-2xl w-72 z-50"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-3 border-b border-white/10">
                <h3 className="text-sm font-semibold text-center">Board Menu</h3>
              </div>

              <div className="p-3">
                <p className="text-xs text-white/50 font-medium mb-2 uppercase tracking-wide">Background</p>
                <div className="flex gap-2 flex-wrap mb-4">
                  {BACKGROUNDS.map(bg => (
                    <button
                      key={bg.id}
                      onClick={() => handleBgChange(bg.id)}
                      className={`w-10 h-7 rounded ${bg.style} ${board.background === bg.id ? 'ring-2 ring-white' : 'hover:opacity-80'} transition-all`}
                    />
                  ))}
                </div>

                <button
                  onClick={() => { setShowMenu(false); onShowArchived(); }}
                  className="w-full text-left text-sm text-white/80 hover:bg-white/10 px-3 py-2 rounded-md transition-colors flex items-center gap-2 mb-2"
                >
                  <Archive size={16} />
                  Archived items
                </button>

                <button
                  onClick={handleDeleteBoard}
                  className="w-full text-left text-sm text-red-400 hover:bg-red-500/10 px-3 py-2 rounded-md transition-colors flex items-center gap-2"
                >
                  Delete board
                </button>
              </div>

              <button
                onClick={() => setShowMenu(false)}
                className="absolute top-2.5 right-2.5 text-white/50 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {(showFilter || showMenu) && (
        <div className="fixed inset-0 z-40" onClick={() => { setShowFilter(false); setShowMenu(false); }} />
      )}
    </div>
  );
}