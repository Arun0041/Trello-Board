import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { useBoard } from '../../context/BoardContext';

export default function AddCard({ listId, onClose }) {
  const { addCard } = useBoard();
  const [title, setTitle] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    await addCard(listId, title.trim());
    setTitle('');
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
    if (e.key === 'Escape') onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="px-2 pb-2">
      <textarea
        ref={textareaRef}
        value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Enter a title for this card..."
        rows={3}
        className="w-full px-3 py-2 text-sm border-none rounded-lg shadow-sm resize-none outline-none bg-white"
      />
      <div className="flex items-center gap-2 mt-1">
        <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-1.5 rounded-md transition-colors">
          Add card
        </button>
        <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-700 p-1">
          <X size={20} />
        </button>
      </div>
    </form>
  );
}
