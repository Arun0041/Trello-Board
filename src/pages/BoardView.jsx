import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { DragDropContext } from '@hello-pangea/dnd';
import { useBoard } from '../context/BoardContext';
import Navbar from '../components/layout/Navbar';
import BoardHeader from '../components/layout/BoardHeader';
import Board from '../components/board/Board';
import CardModal from '../components/card/CardModal';
import ArchivedItemsModal from '../components/board/ArchivedItemsModal';
import { getBgClass } from './BoardsHome';
import * as api from '../api/api.js';

export default function BoardView() {
  const { boardId } = useParams();
  const { board, loading, error, loadBoard, moveCards, moveLists } = useBoard();

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ label: '', member: '', due: '' });

  const hasSearch = searchQuery.trim().length > 0;
  const hasFilters = filters.label || filters.member || filters.due;

  const isCardMatch = (card) => {
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      if (!card.title.toLowerCase().includes(query)) return false;
    }
    if (filters.label) {
      const labelId = parseInt(filters.label);
      if (!card.labels?.some(l => l.id === labelId)) return false;
    }
    if (filters.member) {
      const memberId = parseInt(filters.member);
      if (!card.members?.some(m => m.id === memberId)) return false;
    }
    if (filters.due) {
      if (!card.dueDate) {
        if (filters.due !== 'none') return false;
      } else {
        const dueDate = new Date(card.dueDate);
        const now = new Date();
        if (filters.due === 'overdue') {
          if (dueDate >= now || card.isCompleted) return false;
        } else if (filters.due === 'today') {
          const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
          if (dueDate < startOfToday || dueDate > endOfToday) return false;
        } else if (filters.due === 'week') {
          const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const endOfWeek = new Date(startOfToday.getTime() + 7 * 24 * 60 * 60 * 1000);
          if (dueDate < startOfToday || dueDate > endOfWeek) return false;
        } else if (filters.due === 'none') {
          return false;
        }
      }
    }
    return true;
  };

  const isListMatch = (list) => {
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      if (list.title.toLowerCase().includes(query)) return true;
    }
    return false;
  };

  const displayLists = board && (hasSearch || hasFilters)
    ? board.lists
        .map(list => {
          const listMatches = isListMatch(list);
          const matchingCards = list.cards.filter(isCardMatch);
          if (listMatches || matchingCards.length > 0) {
            return { ...list, cards: listMatches && !hasFilters ? list.cards : matchingCards };
          }
          return null;
        })
        .filter(Boolean)
    : board?.lists || [];

  const [selectedCardId, setSelectedCardId] = useState(null);
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    loadBoard(boardId);
  }, [boardId, loadBoard]);

  const handleDragEnd = useCallback((result) => {
    if (hasSearch || hasFilters) return;
    const { source, destination, type } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    if (type === 'list') {
      const newLists = [...board.lists];
      const [movedList] = newLists.splice(source.index, 1);
      newLists.splice(destination.index, 0, movedList);
      moveLists(newLists);
      return;
    }

    const sourceListId = parseInt(source.droppableId);
    const destListId = parseInt(destination.droppableId);

    const newLists = board.lists.map(list => ({ ...list, cards: [...list.cards] }));
    const sourceList = newLists.find(l => l.id === sourceListId);
    const destList = newLists.find(l => l.id === destListId);

    if (!sourceList || !destList) return;

    const [movedCard] = sourceList.cards.splice(source.index, 1);
    destList.cards.splice(destination.index, 0, movedCard);

    const cardsToUpdate = [];
    if (sourceListId === destListId) {
      destList.cards.forEach((card, index) => {
        cardsToUpdate.push({ id: card.id, position: index, listId: destListId });
      });
    } else {
      sourceList.cards.forEach((card, index) => {
        cardsToUpdate.push({ id: card.id, position: index, listId: sourceListId });
      });
      destList.cards.forEach((card, index) => {
        cardsToUpdate.push({ id: card.id, position: index, listId: destListId });
      });
    }

    moveCards(newLists, cardsToUpdate);
  }, [board, moveCards, moveLists, hasSearch, hasFilters]);

  const handleCardClick = useCallback((cardId) => setSelectedCardId(cardId), []);
  const handleCloseModal = useCallback(() => setSelectedCardId(null), []);

  if (loading) {
    return (
      <div className="h-screen w-screen bg-[#1d2125] flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-screen bg-[#1d2125] flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-2">Failed to load board</p>
          <p className="text-white/50">{error}</p>
        </div>
      </div>
    );
  }

  if (!board) return null;

  return (
    <div className={`h-screen w-screen overflow-hidden flex flex-col ${getBgClass(board.background)}`}>
      <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <BoardHeader
        board={board}
        filters={filters}
        onFilterChange={setFilters}
        onShowArchived={() => setShowArchived(true)}
      />

      <div className="flex-1 overflow-hidden">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Board
            lists={displayLists}
            boardId={board.id}
            onCardClick={handleCardClick}
          />
        </DragDropContext>
      </div>

      {selectedCardId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
          <div className="absolute inset-0 bg-black/60" onClick={handleCloseModal} />
          <div className="relative z-10 w-full max-w-2xl max-h-full overflow-y-auto rounded-lg">
            <CardModal
              cardId={selectedCardId}
              boardId={board.id}
              onClose={handleCloseModal}
            />
          </div>
        </div>
      )}

      {showArchived && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowArchived(false)} />
          <div className="relative z-10 w-full max-w-2xl max-h-full overflow-y-auto rounded-lg">
            <ArchivedItemsModal
              boardId={board.id}
              onClose={() => setShowArchived(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}