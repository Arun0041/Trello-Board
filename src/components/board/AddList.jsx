import { useState, useRef, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { useBoard } from '../../context/BoardContext';

export default function AddList({ boardId }) {
  const { addList } = useBoard();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    await addList(boardId, title.trim());
    setTitle('');
    inputRef.current?.focus();
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="min-w-[272px] bg-white/20 hover:bg-white/30 text-white font-medium p-3 rounded-xl flex items-center gap-2 transition-colors shrink-0 backdrop-blur-sm"
      >
        <Plus size={16} /> Add another list
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="min-w-[272px] bg-[#f1f2f4] rounded-xl p-2 shrink-0 shadow-sm">
      <input
        ref={inputRef}
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Enter list title..."
        className="w-full px-3 py-2 text-sm border-2 border-blue-500 rounded-lg outline-none bg-white"
      />
      <div className="flex items-center gap-2 mt-2">
        <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-1.5 rounded-md transition-colors">
          Add list
        </button>
        <button type="button" onClick={() => { setIsOpen(false); setTitle(''); }} className="text-slate-500 hover:text-slate-700 p-1">
          <X size={20} />
        </button>
      </div>
    </form>
  );
}
