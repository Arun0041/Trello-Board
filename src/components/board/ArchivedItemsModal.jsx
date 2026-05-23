import { useEffect, useState } from 'react';
import { X, RotateCcw, Trash2, Search, Archive } from 'lucide-react';
import * as api from '../../api/api.js';
import { useBoard } from '../../context/BoardContext';

export default function ArchivedItemsModal({ boardId, onClose }) {
  const { loadBoard } = useBoard();
  const [activeTab, setActiveTab] = useState('cards'); // 'cards' | 'lists'
  const [searchQuery, setSearchQuery] = useState('');
  const [archivedCards, setArchivedCards] = useState([]);
  const [archivedLists, setArchivedLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch archived items
  const fetchArchived = async () => {
    setLoading(true);
    try {
      const data = await api.getArchivedItems(boardId);
      setArchivedCards(data.cards || []);
      setArchivedLists(data.lists || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch archived items:', err);
      setError('Failed to load archived items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchived();
  }, [boardId]);

  // Handle restore card
  const handleRestoreCard = async (cardId) => {
    try {
      await api.updateCard(cardId, { isArchived: false });
      await loadBoard(boardId);
      fetchArchived();
    } catch (err) {
      console.error('Failed to restore card:', err);
      alert('Failed to restore card');
    }
  };

  // Handle permanent delete card
  const handleDeleteCard = async (cardId, title) => {
    if (window.confirm(`Are you sure you want to permanently delete the card "${title}"? This cannot be undone.`)) {
      try {
        await api.deleteCard(cardId);
        fetchArchived();
      } catch (err) {
        console.error('Failed to delete card:', err);
        alert('Failed to delete card');
      }
    }
  };

  // Handle restore list
  const handleRestoreList = async (listId) => {
    try {
      await api.updateList(listId, { isArchived: false });
      await loadBoard(boardId);
      fetchArchived();
    } catch (err) {
      console.error('Failed to restore list:', err);
      alert('Failed to restore list');
    }
  };

  // Handle permanent delete list
  const handleDeleteList = async (listId, title) => {
    if (window.confirm(`Are you sure you want to permanently delete the list "${title}" and all its cards? This cannot be undone.`)) {
      try {
        await api.deleteList(listId);
        await loadBoard(boardId);
        fetchArchived();
      } catch (err) {
        console.error('Failed to delete list:', err);
        alert('Failed to delete list');
      }
    }
  };

  // Filter lists & cards based on query
  const filteredCards = archivedCards.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLists = archivedLists.filter(l =>
    l.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-800">
            <Archive size={18} className="text-slate-500" />
            <h2 className="text-lg font-semibold">Archived Items</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search Bar & Tabs */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex flex-col gap-3">
          {/* Tab Switcher */}
          <div className="flex bg-slate-200/60 p-0.5 rounded-lg">
            <button
              onClick={() => { setActiveTab('cards'); setSearchQuery(''); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                activeTab === 'cards'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Archived Cards
            </button>
            <button
              onClick={() => { setActiveTab('lists'); setSearchQuery(''); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                activeTab === 'lists'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Archived Lists
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={`Search archived ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Modal Body / Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3 min-h-[200px]">
          {loading ? (
            <div className="h-full flex items-center justify-center py-10">
              <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-10 text-sm">{error}</div>
          ) : activeTab === 'cards' ? (
            filteredCards.length === 0 ? (
              <div className="text-center text-slate-400 py-10 text-sm">
                No archived cards found
              </div>
            ) : (
              filteredCards.map((card) => (
                <div
                  key={card.id}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-4 group hover:bg-slate-100/50 transition-colors"
                >
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-slate-800 truncate">
                      {card.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      in list: <span className="font-medium">{card.listTitle}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleRestoreCard(card.id)}
                      title="Send to board"
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-white hover:bg-slate-200 border border-slate-200 rounded-md text-slate-700 transition-colors"
                    >
                      <RotateCcw size={12} />
                      Send to board
                    </button>
                    <button
                      onClick={() => handleDeleteCard(card.id, card.title)}
                      title="Delete permanently"
                      className="p-1 hover:bg-red-50 hover:text-red-600 rounded text-slate-400 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )
          ) : (
            filteredLists.length === 0 ? (
              <div className="text-center text-slate-400 py-10 text-sm">
                No archived lists found
              </div>
            ) : (
              filteredLists.map((list) => (
                <div
                  key={list.id}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-4 group hover:bg-slate-100/50 transition-colors"
                >
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-slate-800 truncate">
                      {list.title}
                    </h4>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleRestoreList(list.id)}
                      title="Send to board"
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-white hover:bg-slate-200 border border-slate-200 rounded-md text-slate-700 transition-colors"
                    >
                      <RotateCcw size={12} />
                      Send to board
                    </button>
                    <button
                      onClick={() => handleDeleteList(list.id, list.title)}
                      title="Delete permanently"
                      className="p-1 hover:bg-red-50 hover:text-red-600 rounded text-slate-400 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )
          )}
        </div>
      </div>
    </div>
  );
}
