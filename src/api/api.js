const API_BASE = import.meta.env.VITE_API_BASE;

async function request(url, options = {}) {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (res.status === 204) return null;
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

// Boards
export const getBoards = () => request('/boards');
export const createBoard = (data) => request('/boards', { method: 'POST', body: JSON.stringify(data) });
export const getBoard = (id) => request(`/boards/${id}`);
export const updateBoard = (id, data) => request(`/boards/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteBoard = (id) => request(`/boards/${id}`, { method: 'DELETE' });

// Lists
export const createList = (boardId, data) => request(`/lists/boards/${boardId}/lists`, { method: 'POST', body: JSON.stringify(data) });
export const updateList = (id, data) => request(`/lists/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteList = (id) => request(`/lists/${id}`, { method: 'DELETE' });
export const reorderLists = (lists) => request('/lists/reorder/batch', { method: 'PUT', body: JSON.stringify({ lists }) });

// Cards
export const createCard = (listId, data) => request(`/cards/lists/${listId}/cards`, { method: 'POST', body: JSON.stringify(data) });
export const getCard = (id) => request(`/cards/${id}`);
export const updateCard = (id, data) => request(`/cards/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteCard = (id) => request(`/cards/${id}`, { method: 'DELETE' });
export const reorderCards = (cards) => request('/cards/reorder/batch', { method: 'PUT', body: JSON.stringify({ cards }) });
export const addCardLabel = (cardId, labelId) => request(`/cards/${cardId}/labels/${labelId}`, { method: 'POST' });
export const removeCardLabel = (cardId, labelId) => request(`/cards/${cardId}/labels/${labelId}`, { method: 'DELETE' });
export const addCardMember = (cardId, memberId) => request(`/cards/${cardId}/members/${memberId}`, { method: 'POST' });
export const removeCardMember = (cardId, memberId) => request(`/cards/${cardId}/members/${memberId}`, { method: 'DELETE' });
export const updateCardCustomField = (cardId, fieldId, value) => request(`/cards/${cardId}/custom-fields/${fieldId}`, { method: 'POST', body: JSON.stringify({ value }) });

// Labels
export const getBoardLabels = (boardId) => request(`/labels/boards/${boardId}/labels`);
export const createLabel = (boardId, data) => request(`/labels/boards/${boardId}/labels`, { method: 'POST', body: JSON.stringify(data) });
export const updateLabel = (id, data) => request(`/labels/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteLabelApi = (id) => request(`/labels/${id}`, { method: 'DELETE' });

// Checklists
export const createChecklist = (cardId, data) => request(`/checklists/cards/${cardId}/checklists`, { method: 'POST', body: JSON.stringify(data) });
export const deleteChecklist = (id) => request(`/checklists/${id}`, { method: 'DELETE' });
export const addChecklistItem = (checklistId, data) => request(`/checklists/${checklistId}/items`, { method: 'POST', body: JSON.stringify(data) });
export const updateChecklistItem = (itemId, data) => request(`/checklists/items/${itemId}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteChecklistItem = (itemId) => request(`/checklists/items/${itemId}`, { method: 'DELETE' });

// Members
export const getMembers = () => request('/members');
export const createMember = (data) => request('/members', { method: 'POST', body: JSON.stringify(data) });
export const addBoardMember = (boardId, memberId) => request(`/members/boards/${boardId}`, { method: 'POST', body: JSON.stringify({ memberId }) });

// Comments
export const getCardComments = (cardId) => request(`/comments/cards/${cardId}/comments`);
export const createComment = (cardId, data) => request(`/comments/cards/${cardId}/comments`, { method: 'POST', body: JSON.stringify(data) });
export const updateComment = (id, data) => request(`/comments/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteComment = (id) => request(`/comments/${id}`, { method: 'DELETE' });

// Search
export const searchCards = (boardId, params) => {
  const query = new URLSearchParams();
  if (params.q) query.set('q', params.q);
  if (params.label) query.set('label', params.label);
  if (params.member) query.set('member', params.member);
  if (params.due) query.set('due', params.due);
  return request(`/search/boards/${boardId}?${query.toString()}`);
};

// Archive
export const getArchivedItems = (boardId) => request(`/boards/${boardId}/archived`);

// Attachments
export const getCardAttachments = (cardId) => request(`/attachments/cards/${cardId}`);
export const addCardAttachment = (cardId, data) => request(`/attachments/cards/${cardId}`, { method: 'POST', body: JSON.stringify(data) });
export const deleteCardAttachment = (id) => request(`/attachments/${id}`, { method: 'DELETE' });

// Custom Fields
export const createCustomField = (boardId, data) => request(`/custom-fields/boards/${boardId}`, { method: 'POST', body: JSON.stringify(data) });
export const deleteCustomField = (id) => request(`/custom-fields/${id}`, { method: 'DELETE' });
