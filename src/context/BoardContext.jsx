import { createContext, useContext, useReducer, useCallback } from 'react';
import * as api from '../api/api.js';

const BoardContext = createContext(null);

const initialState = {
  board: null,
  loading: true,
  error: null,
};

function boardReducer(state, action) {
  switch (action.type) {
    case 'SET_BOARD':
      return { ...state, board: action.payload, loading: false, error: null };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'UPDATE_LISTS':
      return { ...state, board: { ...state.board, lists: action.payload } };
    case 'ADD_LIST':
      return { ...state, board: { ...state.board, lists: [...state.board.lists, action.payload] } };
    case 'DELETE_LIST':
      return { ...state, board: { ...state.board, lists: state.board.lists.filter(l => l.id !== action.payload) } };
    case 'UPDATE_LIST_TITLE': {
      const lists = state.board.lists.map(l => l.id === action.payload.id ? { ...l, title: action.payload.title } : l);
      return { ...state, board: { ...state.board, lists } };
    }
    case 'ADD_CARD': {
      const lists = state.board.lists.map(l =>
        l.id === action.payload.listId ? { ...l, cards: [...l.cards, action.payload.card] } : l
      );
      return { ...state, board: { ...state.board, lists } };
    }
    case 'UPDATE_CARD': {
      const lists = state.board.lists.map(l => ({
        ...l,
        cards: l.cards.map(c => c.id === action.payload.id ? { ...c, ...action.payload } : c),
      }));
      return { ...state, board: { ...state.board, lists } };
    }
    case 'DELETE_CARD': {
      const lists = state.board.lists.map(l => ({
        ...l,
        cards: l.cards.filter(c => c.id !== action.payload),
      }));
      return { ...state, board: { ...state.board, lists } };
    }
    case 'UPDATE_BOARD_META':
      return { ...state, board: { ...state.board, ...action.payload } };
    default:
      return state;
  }
}

export function BoardProvider({ children }) {
  const [state, dispatch] = useReducer(boardReducer, initialState);

  const loadBoard = useCallback(async (id) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const board = await api.getBoard(id);
      dispatch({ type: 'SET_BOARD', payload: board });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    }
  }, []);

  const addList = useCallback(async (boardId, title) => {
    const list = await api.createList(boardId, { title });
    dispatch({ type: 'ADD_LIST', payload: { ...list, cards: list.cards || [] } });
    return list;
  }, []);

  const editListTitle = useCallback(async (listId, title) => {
    dispatch({ type: 'UPDATE_LIST_TITLE', payload: { id: listId, title } });
    await api.updateList(listId, { title });
  }, []);

  const removeList = useCallback(async (listId) => {
    dispatch({ type: 'DELETE_LIST', payload: listId });
    await api.deleteList(listId);
  }, []);

  const addCard = useCallback(async (listId, title) => {
    const card = await api.createCard(listId, { title });
    dispatch({ type: 'ADD_CARD', payload: { listId, card } });
    return card;
  }, []);

  const editCard = useCallback(async (cardId, data) => {
    const card = await api.updateCard(cardId, data);
    dispatch({ type: 'UPDATE_CARD', payload: card });
    return card;
  }, []);

  const removeCard = useCallback(async (cardId) => {
    dispatch({ type: 'DELETE_CARD', payload: cardId });
    await api.deleteCard(cardId);
  }, []);

  const moveCards = useCallback(async (newLists, cardsToUpdate) => {
    dispatch({ type: 'UPDATE_LISTS', payload: newLists });
    await api.reorderCards(cardsToUpdate);
  }, []);

  const moveLists = useCallback(async (newLists) => {
    dispatch({ type: 'UPDATE_LISTS', payload: newLists });
    const listsToUpdate = newLists.map((l, i) => ({ id: l.id, position: i }));
    await api.reorderLists(listsToUpdate);
  }, []);

  const toggleCardLabel = useCallback(async (cardId, labelId, hasLabel) => {
    if (hasLabel) {
      await api.removeCardLabel(cardId, labelId);
    } else {
      await api.addCardLabel(cardId, labelId);
    }
  }, []);

  const toggleCardMember = useCallback(async (cardId, memberId, hasMember) => {
    if (hasMember) {
      await api.removeCardMember(cardId, memberId);
    } else {
      await api.addCardMember(cardId, memberId);
    }
  }, []);

  const value = {
    ...state,
    dispatch,
    loadBoard,
    addList,
    editListTitle,
    removeList,
    addCard,
    editCard,
    removeCard,
    moveCards,
    moveLists,
    toggleCardLabel,
    toggleCardMember,
  };

  return <BoardContext.Provider value={value}>{children}</BoardContext.Provider>;
}

export function useBoard() {
  const ctx = useContext(BoardContext);
  if (!ctx) throw new Error('useBoard must be used within BoardProvider');
  return ctx;
}
