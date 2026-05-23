import { query } from '../database/db.js';

// GET /api/boards — get all boards
export async function getAllBoards(req, res) {
  try {
    const result = await query('SELECT * FROM boards ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('getAllBoards error:', err.message);
    res.status(500).json({ error: 'Failed to fetch boards' });
  }
}

// POST /api/boards — create a new board
export async function createBoard(req, res) {
  try {
    const { title, background } = req.body;
    const result = await query(
      'INSERT INTO boards (title, background) VALUES ($1, $2) RETURNING *',
      [title, background || 'gradient-purple']
    );
    const board = result.rows[0];

    // Auto-create default labels for the new board
    const defaultLabels = [
      { name: 'Bug', color: '#ef4444' },
      { name: 'Feature', color: '#22c55e' },
      { name: 'Enhancement', color: '#3b82f6' },
      { name: 'Urgent', color: '#f97316' },
      { name: 'Design', color: '#a855f7' },
      { name: 'Documentation', color: '#06b6d4' },
      { name: 'Backend', color: '#eab308' },
      { name: 'Frontend', color: '#ec4899' },
      { name: 'Testing', color: '#84cc16' },
      { name: '', color: '#1d1d1d' },
    ];
    for (const label of defaultLabels) {
      await query(
        'INSERT INTO labels (name, color, board_id) VALUES ($1, $2, $3)',
        [label.name, label.color, board.id]
      );
    }

    // Auto-add all existing members to the new board
    const membersResult = await query('SELECT id FROM members ORDER BY id');
    for (const member of membersResult.rows) {
      await query(
        'INSERT INTO board_members (board_id, member_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [board.id, member.id]
      );
    }

    res.status(201).json(board);
  } catch (err) {
    console.error('createBoard error:', err.message);
    res.status(500).json({ error: 'Failed to create board' });
  }
}

// GET /api/boards/:id — get a single board with all nested data
export async function getBoardById(req, res) {
  try {
    const { id } = req.params;

    // 1. Get the board itself
    const boardResult = await query('SELECT * FROM boards WHERE id = $1', [id]);
    if (boardResult.rows.length === 0) {
      return res.status(404).json({ error: 'Board not found' });
    }
    const board = boardResult.rows[0];

    // 2. Get board labels
    const labelsResult = await query(
      'SELECT * FROM labels WHERE board_id = $1 ORDER BY id',
      [id]
    );

    // 3. Get board members
    const membersResult = await query(
      `SELECT bm.board_id, bm.member_id, m.id, m.name, m.email, m.avatar_color, m.initials
       FROM board_members bm
       JOIN members m ON m.id = bm.member_id
       WHERE bm.board_id = $1
       ORDER BY m.id`,
      [id]
    );

    // 4. Get all lists for this board
    const listsResult = await query(
      'SELECT * FROM lists WHERE board_id = $1 AND is_archived = false ORDER BY position',
      [id]
    );

    // 5. Get all cards for these lists (non-archived)
    const listIds = listsResult.rows.map(l => l.id);
    let cards = [];
    if (listIds.length > 0) {
      const cardsResult = await query(
        `SELECT * FROM cards 
         WHERE list_id = ANY($1) AND is_archived = false 
         ORDER BY position`,
        [listIds]
      );
      cards = cardsResult.rows;
    }

    // 6. Get labels for all cards
    const cardIds = cards.map(c => c.id);
    let cardLabels = [];
    if (cardIds.length > 0) {
      const clResult = await query(
        `SELECT cl.card_id, l.id, l.name, l.color
         FROM card_labels cl
         JOIN labels l ON l.id = cl.label_id
         WHERE cl.card_id = ANY($1)`,
        [cardIds]
      );
      cardLabels = clResult.rows;
    }

    // 7. Get members for all cards
    let cardMembers = [];
    if (cardIds.length > 0) {
      const cmResult = await query(
        `SELECT cm.card_id, m.id, m.name, m.avatar_color, m.initials
         FROM card_members cm
         JOIN members m ON m.id = cm.member_id
         WHERE cm.card_id = ANY($1)`,
        [cardIds]
      );
      cardMembers = cmResult.rows;
    }

    // 8. Get checklists and their items for all cards
    let checklists = [];
    let checklistItems = [];
    if (cardIds.length > 0) {
      const checkResult = await query(
        'SELECT * FROM checklists WHERE card_id = ANY($1) ORDER BY id',
        [cardIds]
      );
      checklists = checkResult.rows;

      const checklistIds = checklists.map(c => c.id);
      if (checklistIds.length > 0) {
        const itemsResult = await query(
          'SELECT * FROM checklist_items WHERE checklist_id = ANY($1) ORDER BY position',
          [checklistIds]
        );
        checklistItems = itemsResult.rows;
      }
    }

    // 9. Get comment counts for all cards
    let commentCounts = [];
    if (cardIds.length > 0) {
      const countResult = await query(
        'SELECT card_id, COUNT(*) as count FROM comments WHERE card_id = ANY($1) GROUP BY card_id',
        [cardIds]
      );
      commentCounts = countResult.rows;
    }

    // 10. Get custom field definitions for the board
    const customFieldsResult = await query(
      'SELECT * FROM custom_fields WHERE board_id = $1 ORDER BY id',
      [id]
    );

    // --- Assemble the nested response ---

    // Build checklist items map: checklistId -> items[]
    const itemsByChecklist = {};
    for (const item of checklistItems) {
      if (!itemsByChecklist[item.checklist_id]) {
        itemsByChecklist[item.checklist_id] = [];
      }
      itemsByChecklist[item.checklist_id].push({
        id: item.id,
        text: item.text,
        isChecked: item.is_checked,
        position: item.position,
      });
    }

    // Build checklists map: cardId -> checklists[]
    const checklistsByCard = {};
    for (const cl of checklists) {
      if (!checklistsByCard[cl.card_id]) {
        checklistsByCard[cl.card_id] = [];
      }
      checklistsByCard[cl.card_id].push({
        id: cl.id,
        title: cl.title,
        items: itemsByChecklist[cl.id] || [],
      });
    }

    // Build card labels map: cardId -> labels[]
    const labelsByCard = {};
    for (const cl of cardLabels) {
      if (!labelsByCard[cl.card_id]) {
        labelsByCard[cl.card_id] = [];
      }
      labelsByCard[cl.card_id].push({
        label: { id: cl.id, name: cl.name, color: cl.color },
      });
    }

    // Build card members map: cardId -> members[]
    const membersByCard = {};
    for (const cm of cardMembers) {
      if (!membersByCard[cm.card_id]) {
        membersByCard[cm.card_id] = [];
      }
      membersByCard[cm.card_id].push({
        member: {
          id: cm.id,
          name: cm.name,
          avatarColor: cm.avatar_color,
          initials: cm.initials,
        },
      });
    }

    // Build comment count map: cardId -> count
    const commentCountMap = {};
    for (const cc of commentCounts) {
      commentCountMap[cc.card_id] = parseInt(cc.count);
    }

    // Build cards map: listId -> cards[]
    const cardsByList = {};
    for (const card of cards) {
      if (!cardsByList[card.list_id]) {
        cardsByList[card.list_id] = [];
      }
      cardsByList[card.list_id].push({
        id: card.id,
        title: card.title,
        description: card.description,
        position: card.position,
        coverColor: card.cover_color,
        dueDate: card.due_date,
        isArchived: card.is_archived,
        isCompleted: card.is_completed,
        labels: labelsByCard[card.id] || [],
        members: membersByCard[card.id] || [],
        checklists: checklistsByCard[card.id] || [],
        _count: { comments: commentCountMap[card.id] || 0 },
      });
    }

    // Build final response
    const response = {
      id: board.id,
      title: board.title,
      background: board.background,
      createdAt: board.created_at,
      updatedAt: board.updated_at,
      labels: labelsResult.rows.map(l => ({
        id: l.id,
        name: l.name,
        color: l.color,
        boardId: l.board_id,
      })),
      members: membersResult.rows.map(bm => ({
        memberId: bm.member_id,
        member: {
          id: bm.id,
          name: bm.name,
          email: bm.email,
          avatarColor: bm.avatar_color,
          initials: bm.initials,
        },
      })),
      lists: listsResult.rows.map(list => ({
        id: list.id,
        title: list.title,
        position: list.position,
        color: list.color,
        isArchived: list.is_archived,
        boardId: list.board_id,
        cards: cardsByList[list.id] || [],
      })),
      customFields: customFieldsResult.rows.map(cf => ({
        id: cf.id,
        name: cf.name,
        type: cf.type,
        boardId: cf.board_id,
      })),
    };

    res.json(response);
  } catch (err) {
    console.error('getBoardById error:', err.message);
    res.status(500).json({ error: 'Failed to fetch board' });
  }
}

// PUT /api/boards/:id — update board title or background
export async function updateBoard(req, res) {
  try {
    const { id } = req.params;
    const { title, background } = req.body;
    const result = await query(
      `UPDATE boards 
       SET title = COALESCE($1, title), 
           background = COALESCE($2, background),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 
       RETURNING *`,
      [title, background, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Board not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('updateBoard error:', err.message);
    res.status(500).json({ error: 'Failed to update board' });
  }
}

// DELETE /api/boards/:id — delete a board
export async function deleteBoard(req, res) {
  try {
    const { id } = req.params;
    await query('DELETE FROM boards WHERE id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    console.error('deleteBoard error:', err.message);
    res.status(500).json({ error: 'Failed to delete board' });
  }
}

// GET /api/boards/:id/archived — get archived cards and lists for this board
export async function getArchivedItems(req, res) {
  try {
    const { id } = req.params;

    // 1. Get archived lists for this board
    const listsResult = await query(
      'SELECT * FROM lists WHERE board_id = $1 AND is_archived = true ORDER BY position',
      [id]
    );

    // 2. Get archived cards for this board
    const cardsResult = await query(
      `SELECT c.*, l.title as list_title
       FROM cards c
       JOIN lists l ON l.id = c.list_id
       WHERE l.board_id = $1 AND c.is_archived = true
       ORDER BY c.updated_at DESC`,
      [id]
    );

    res.json({
      lists: listsResult.rows.map(list => ({
        id: list.id,
        title: list.title,
        position: list.position,
        color: list.color,
        isArchived: list.is_archived,
        boardId: list.board_id,
      })),
      cards: cardsResult.rows.map(card => ({
        id: card.id,
        title: card.title,
        description: card.description,
        position: card.position,
        coverColor: card.cover_color,
        dueDate: card.due_date,
        isArchived: card.is_archived,
        isCompleted: card.is_completed,
        listId: card.list_id,
        listTitle: card.list_title,
      })),
    });
  } catch (err) {
    console.error('getArchivedItems error:', err.message);
    res.status(500).json({ error: 'Failed to fetch archived items' });
  }
}
