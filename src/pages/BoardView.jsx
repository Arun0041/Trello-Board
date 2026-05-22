import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { DragDropContext } from '@hello-pangea/dnd';
import { useBoard } from '../context/BoardContext';
import Navbar from '../components/layout/Navbar';
import BoardHeader from '../components/layout/BoardHeader';
import Board from '../components/board/Board';
import CardModal from '../components/card/CardModal';
import { getBgClass } from './BoardsHome';
import * as api from '../api/api.js';

export default function BoardView() {
  const { boardId } = useParams();
  const { board, loading, error, loadBoard, moveCards, moveLists } = useBoard();

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ label: '', member: '', due: '' });
  const [filteredCardIds, setFilteredCardIds] = useState(null);

  // Card modal state
  const [selectedCardId, setSelectedCardId] = useState(null);

  // Load board data on mount
  useEffect(() => {
    loadBoard(boardId);
  }, [boardId, loadBoard]);

  // Run search/filter whenever search or filters change
  useEffect(() => {
    const hasSearch = searchQuery.trim().length > 0;
    const hasFilters = filters.label || filters.member || filters.due;

    if (!hasSearch && !hasFilters) {
      // No filters active — show all cards
      setFilteredCardIds(null);
      return;
    }

    // Debounce search requests
    const timer = setTimeout(async () => {
      try {
        const params = {};
        if (searchQuery.trim()) params.q = searchQuery.trim();
        if (filters.label) params.label = filters.label;
        if (filters.member) params.member = filters.member;
        if (filters.due) params.due = filters.due;

        const ids = await api.searchCards(boardId, params);
        setFilteredCardIds(new Set(ids));
      } catch (err) {
        console.error('Search error:', err);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, filters, boardId]);

  // Handle drag end — this is the core drag-and-drop logic
  const handleDragEnd = useCallback((result) => {
    const { source, destination, type } = result;

    // Dropped outside a droppable area
    if (!destination) return;

    // Dropped in the same position
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    if (type === 'list') {
      // --- Reordering lists ---
      const newLists = [...board.lists];
      const [movedList] = newLists.splice(source.index, 1);
      newLists.splice(destination.index, 0, movedList);
      moveLists(newLists);
      return;
    }

    // --- Moving/reordering cards ---
    const sourceListId = parseInt(source.droppableId);
    const destListId = parseInt(destination.droppableId);

    // Make a deep copy of lists
    const newLists = board.lists.map(list => ({
      ...list,
      cards: [...list.cards],
    }));

    // Find source and destination lists
    const sourceList = newLists.find(l => l.id === sourceListId);
    const destList = newLists.find(l => l.id === destListId);

    if (!sourceList || !destList) return;

    // Remove the card from the source list
    const [movedCard] = sourceList.cards.splice(source.index, 1);

    // Insert it into the destination list at the right position
    destList.cards.splice(destination.index, 0, movedCard);

    // Build the list of cards that need position/list updates
    const cardsToUpdate = [];

    if (sourceListId === destListId) {
      // Same list — only update positions in this list
      destList.cards.forEach((card, index) => {
        cardsToUpdate.push({
          id: card.id,
          position: index,
          listId: destListId,
        });
      });
    } else {
      // Different lists — update positions in both lists
      sourceList.cards.forEach((card, index) => {
        cardsToUpdate.push({
          id: card.id,
          position: index,
          listId: sourceListId,
        });
      });
      destList.cards.forEach((card, index) => {
        cardsToUpdate.push({
          id: card.id,
          position: index,
          listId: destListId,
        });
      });
    }

    moveCards(newLists, cardsToUpdate);
  }, [board, moveCards, moveLists]);

  // Handle card click — open card modal
  const handleCardClick = useCallback((cardId) => {
    setSelectedCardId(cardId);
  }, []);

  // Close card modal and refresh board data
  const handleCloseModal = useCallback(() => {
    setSelectedCardId(null);
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#1d2125] flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#1d2125] flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-2">Failed to load board</p>
          <p className="text-white/50">{error}</p>
        </div>
      </div>
    );
  }

  if (!board) return null;

  return (
    <div className={`min-h-screen flex flex-col ${getBgClass(board.background)}`}>
      {/* Top navbar */}
      <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      {/* Board header with title, filters, menu */}
      <BoardHeader
        board={board}
        filters={filters}
        onFilterChange={setFilters}
      />

      {/* Board content with drag and drop */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Board
          lists={board.lists}
          boardId={board.id}
          onCardClick={handleCardClick}
          filteredCardIds={filteredCardIds}
        />
      </DragDropContext>

      {/* Card detail modal */}
      {selectedCardId && (
        <CardModal
          cardId={selectedCardId}
          boardId={board.id}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
