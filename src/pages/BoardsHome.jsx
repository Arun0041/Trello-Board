import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, LayoutDashboard, X, Star, Clock } from 'lucide-react';
import * as api from '../api/api.js';

const BACKGROUNDS = [
  { id: 'gradient-purple', style: 'bg-gradient-to-br from-purple-600 to-pink-500' },
  { id: 'gradient-blue', style: 'bg-gradient-to-br from-blue-600 to-cyan-500' },
  { id: 'gradient-green', style: 'bg-gradient-to-br from-emerald-600 to-teal-500' },
  { id: 'gradient-orange', style: 'bg-gradient-to-br from-orange-500 to-red-500' },
  { id: 'gradient-slate', style: 'bg-gradient-to-br from-slate-700 to-slate-900' },
  { id: 'gradient-rose', style: 'bg-gradient-to-br from-rose-500 to-purple-600' },
  { id: 'solid-blue', style: 'bg-blue-600' },
  { id: 'solid-green', style: 'bg-emerald-600' },
  { id: 'solid-purple', style: 'bg-purple-700' },
];

export function getBgClass(bgId) {
  return BACKGROUNDS.find(b => b.id === bgId)?.style || BACKGROUNDS[0].style;
}

export { BACKGROUNDS };

export default function BoardsHome() {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBg, setNewBg] = useState('gradient-purple');

  useEffect(() => {
    api.getBoards().then(b => { setBoards(b); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const board = await api.createBoard({ title: newTitle.trim(), background: newBg });
    setBoards([board, ...boards]);
    setNewTitle('');
    setNewBg('gradient-purple');
    setShowCreate(false);
  };

  return (
    <div className="min-h-screen bg-[#1d2125] text-white">
      {/* Navbar */}
      <header className="h-12 bg-[#1d2125] border-b border-white/10 flex items-center px-4 gap-4">
        <div className="flex items-center gap-1.5 font-bold text-lg">
          <div className="flex gap-[2px]">
            <div className="w-1.5 h-3.5 bg-white/90 rounded-sm"></div>
            <div className="w-1.5 h-2.5 bg-white/90 rounded-sm"></div>
          </div>
          Trello
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Section Header */}
        <div className="flex items-center gap-3 mb-6">
          <LayoutDashboard size={24} className="text-white/70" />
          <h1 className="text-xl font-bold">Your Boards</h1>
        </div>

        {loading ? (
          <div className="flex gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-[200px] h-[100px] bg-white/5 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {boards.map(board => (
              <Link
                key={board.id}
                to={`/b/${board.id}`}
                className={`relative h-24 rounded-lg p-3 font-bold text-white text-sm overflow-hidden group hover:opacity-90 transition-opacity ${getBgClass(board.background)}`}
              >
                <span className="relative z-10 drop-shadow-sm">{board.title}</span>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </Link>
            ))}

            {/* Create New Board */}
            <button
              onClick={() => setShowCreate(true)}
              className="h-24 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-sm text-white/70 hover:text-white transition-colors gap-1.5"
            >
              <Plus size={16} /> Create new board
            </button>
          </div>
        )}
      </div>

      {/* Create Board Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowCreate(false)}>
          <div className="bg-[#282e33] rounded-xl p-0 w-full max-w-[340px] shadow-2xl" onClick={e => e.stopPropagation()}>
            {/* Preview */}
            <div className={`h-28 rounded-t-xl relative flex items-center justify-center ${getBgClass(newBg)}`}>
              <div className="w-[140px] space-y-1.5 opacity-70">
                <div className="h-2 bg-white/40 rounded w-3/4" />
                <div className="h-2 bg-white/40 rounded w-1/2" />
                <div className="h-2 bg-white/40 rounded w-2/3" />
              </div>
              <button onClick={() => setShowCreate(false)} className="absolute top-2 right-2 text-white/70 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-4 space-y-4">
              {/* Background Picker */}
              <div>
                <label className="text-xs font-semibold text-white/60 uppercase tracking-wide mb-2 block">Background</label>
                <div className="flex gap-2 flex-wrap">
                  {BACKGROUNDS.map(bg => (
                    <button
                      key={bg.id}
                      type="button"
                      onClick={() => setNewBg(bg.id)}
                      className={`w-10 h-8 rounded ${bg.style} ${newBg === bg.id ? 'ring-2 ring-white ring-offset-2 ring-offset-[#282e33]' : 'hover:opacity-80'} transition-all`}
                    />
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="text-xs font-semibold text-white/60 uppercase tracking-wide mb-1.5 block">Board title <span className="text-red-400">*</span></label>
                <input
                  autoFocus
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full bg-[#22272b] border border-white/20 rounded-md px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                  placeholder="Enter board title..."
                />
              </div>

              <button
                type="submit"
                disabled={!newTitle.trim()}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-white/10 disabled:text-white/30 text-white text-sm font-medium py-2 rounded-md transition-colors"
              >
                Create
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
