import { query } from '../database/db.js';

// Helper to log card activities
async function logActivity(cardId, memberId, action, details) {
  try {
    await query(
      'INSERT INTO activities (card_id, member_id, action, details) VALUES ($1, $2, $3, $4)',
      [cardId, memberId, action, details]
    );
  } catch (err) {
    console.error('Failed to log activity:', err.message);
  }
}

// POST /api/cards/lists/:listId/cards — create a new card
export async function createCard(req, res) {
  try {
    const { listId } = req.params;
    const { title } = req.body;

    // Get next position
    const posResult = await query(
      'SELECT COALESCE(MAX(position), -1) + 1 as next_pos FROM cards WHERE list_id = $1',
      [listId]
    );
    const position = posResult.rows[0].next_pos;

    const result = await query(
      'INSERT INTO cards (title, position, list_id) VALUES ($1, $2, $3) RETURNING *',
      [title, position, listId]
    );

    const card = result.rows[0];
    
    // Log activity
    await logActivity(card.id, 1, 'created', 'created this card');
    res.status(201).json({
      id: card.id,
      title: card.title,
      description: card.description,
      position: card.position,
      coverColor: card.cover_color,
      dueDate: card.due_date,
      isArchived: card.is_archived,
      listId: card.list_id,
      labels: [],
      members: [],
      checklists: [],
      _count: { comments: 0 },
    });
  } catch (err) {
    console.error('createCard error:', err.message);
    res.status(500).json({ error: 'Failed to create card' });
  }
}

// GET /api/cards/:id — get card with all details
export async function getCardById(req, res) {
  try {
    const { id } = req.params;

    // 1. Get the card
    const cardResult = await query(
      `SELECT c.*, l.title as list_title 
       FROM cards c 
       JOIN lists l ON l.id = c.list_id 
       WHERE c.id = $1`,
      [id]
    );
    if (cardResult.rows.length === 0) {
      return res.status(404).json({ error: 'Card not found' });
    }
    const card = cardResult.rows[0];

    // 2. Get card labels
    const labelsResult = await query(
      `SELECT l.id, l.name, l.color
       FROM card_labels cl
       JOIN labels l ON l.id = cl.label_id
       WHERE cl.card_id = $1
       ORDER BY l.id`,
      [id]
    );

    // 3. Get card members
    const membersResult = await query(
      `SELECT m.id, m.name, m.avatar_color, m.initials
       FROM card_members cm
       JOIN members m ON m.id = cm.member_id
       WHERE cm.card_id = $1
       ORDER BY m.id`,
      [id]
    );

    // 4. Get checklists with items
    const checklistsResult = await query(
      'SELECT * FROM checklists WHERE card_id = $1 ORDER BY id',
      [id]
    );

    const checklistIds = checklistsResult.rows.map(c => c.id);
    let checklistItems = [];
    if (checklistIds.length > 0) {
      const itemsResult = await query(
        'SELECT * FROM checklist_items WHERE checklist_id = ANY($1) ORDER BY position',
        [checklistIds]
      );
      checklistItems = itemsResult.rows;
    }

    // Build checklist items by checklist id
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

    // 5. Get comments with member info
    const commentsResult = await query(
      `SELECT c.id, c.text, c.created_at, c.member_id,
              m.name, m.avatar_color, m.initials
       FROM comments c
       JOIN members m ON m.id = c.member_id
       WHERE c.card_id = $1
       ORDER BY c.created_at DESC`,
      [id]
    );

    // 6. Get activities with member info
    const activitiesResult = await query(
      `SELECT a.id, a.action, a.details, a.created_at, a.member_id,
              m.name, m.avatar_color, m.initials
       FROM activities a
       JOIN members m ON m.id = a.member_id
       WHERE a.card_id = $1
       ORDER BY a.created_at DESC`,
      [id]
    );

    // 7. Get custom field values for the card
    const customFieldsResult = await query(
      `SELECT ccf.custom_field_id, ccf.value, cf.name, cf.type
       FROM card_custom_fields ccf
       JOIN custom_fields cf ON cf.id = ccf.custom_field_id
       WHERE ccf.card_id = $1`,
      [id]
    );

    // Build response
    const response = {
      id: card.id,
      title: card.title,
      description: card.description,
      position: card.position,
      coverColor: card.cover_color,
      dueDate: card.due_date,
      isArchived: card.is_archived,
      isCompleted: card.is_completed,
      listId: card.list_id,
      list: { title: card.list_title },
      labels: labelsResult.rows.map(l => ({
        label: { id: l.id, name: l.name, color: l.color },
      })),
      members: membersResult.rows.map(m => ({
        member: {
          id: m.id,
          name: m.name,
          avatarColor: m.avatar_color,
          initials: m.initials,
        },
      })),
      checklists: checklistsResult.rows.map(cl => ({
        id: cl.id,
        title: cl.title,
        items: itemsByChecklist[cl.id] || [],
      })),
      comments: commentsResult.rows.map(c => ({
        id: c.id,
        text: c.text,
        createdAt: c.created_at,
        member: {
          id: c.member_id,
          name: c.name,
          avatarColor: c.avatar_color,
          initials: c.initials,
        },
      })),
      activities: activitiesResult.rows.map(a => ({
        id: a.id,
        action: a.action,
        details: a.details,
        createdAt: a.created_at,
        member: {
          id: a.member_id,
          name: a.name,
          avatarColor: a.avatar_color,
          initials: a.initials,
        },
      })),
      customFieldValues: customFieldsResult.rows.map(cf => ({
        customFieldId: cf.custom_field_id,
        value: cf.value,
        name: cf.name,
        type: cf.type,
      })),
    };

    res.json(response);
  } catch (err) {
    console.error('getCardById error:', err.message);
    res.status(500).json({ error: 'Failed to fetch card' });
  }
}

// PUT /api/cards/:id — update card fields
export async function updateCard(req, res) {
  try {
    const { id } = req.params;
    const { title, description, dueDate, coverColor, isArchived, listId, isCompleted } = req.body;

    // Fetch the current card to check what changed
    const currentCardResult = await query(
      `SELECT c.description, c.due_date, c.cover_color, c.is_archived, c.list_id, c.is_completed, l.title as list_title
       FROM cards c
       JOIN lists l ON l.id = c.list_id
       WHERE c.id = $1`,
      [id]
    );
    if (currentCardResult.rows.length === 0) {
      return res.status(404).json({ error: 'Card not found' });
    }
    const oldCard = currentCardResult.rows[0];

    // Build dynamic update query
    const fields = [];
    const values = [];
    let paramCount = 0;

    if (title !== undefined) {
      paramCount++;
      fields.push(`title = $${paramCount}`);
      values.push(title);
    }
    if (description !== undefined) {
      paramCount++;
      fields.push(`description = $${paramCount}`);
      values.push(description);
    }
    if (dueDate !== undefined) {
      paramCount++;
      fields.push(`due_date = $${paramCount}`);
      values.push(dueDate);
    }
    if (coverColor !== undefined) {
      paramCount++;
      fields.push(`cover_color = $${paramCount}`);
      values.push(coverColor);
    }
    if (isArchived !== undefined) {
      paramCount++;
      fields.push(`is_archived = $${paramCount}`);
      values.push(isArchived);
    }
    if (isCompleted !== undefined) {
      paramCount++;
      fields.push(`is_completed = $${paramCount}`);
      values.push(isCompleted);
    }
    if (listId !== undefined) {
      paramCount++;
      fields.push(`list_id = $${paramCount}`);
      values.push(listId);
    }

    // Always update updated_at
    fields.push('updated_at = CURRENT_TIMESTAMP');

    paramCount++;
    values.push(id);

    const result = await query(
      `UPDATE cards SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Card not found' });
    }

    const card = result.rows[0];

    // Log activities for the changes
    if (description !== undefined && description !== oldCard.description) {
      await logActivity(id, 1, 'updated_description', 'updated the description');
    }
    if (isArchived !== undefined && isArchived !== oldCard.is_archived) {
      await logActivity(id, 1, 'archived', isArchived ? 'archived this card' : 'sent this card to the board');
    }
    if (isCompleted !== undefined && isCompleted !== oldCard.is_completed) {
      await logActivity(id, 1, 'completed', isCompleted ? 'marked the due date complete' : 'marked the due date incomplete');
    }
    if (dueDate !== undefined) {
      const oldTime = oldCard.due_date ? new Date(oldCard.due_date).getTime() : null;
      const newTime = dueDate ? new Date(dueDate).getTime() : null;
      if (oldTime !== newTime) {
        if (dueDate) {
          await logActivity(id, 1, 'updated_due_date', 'changed the due date');
        } else {
          await logActivity(id, 1, 'removed_due_date', 'removed the due date');
        }
      }
    }
    if (coverColor !== undefined && coverColor !== oldCard.cover_color) {
      await logActivity(id, 1, 'updated_cover', coverColor ? 'changed the cover color' : 'removed the cover color');
    }
    if (listId !== undefined && Number(listId) !== oldCard.list_id) {
      const newListResult = await query('SELECT title FROM lists WHERE id = $1', [listId]);
      const newListTitle = newListResult.rows[0]?.title || 'another list';
      await logActivity(id, 1, 'moved', `moved this card from ${oldCard.list_title} to ${newListTitle}`);
    }

    res.json({
      id: card.id,
      title: card.title,
      description: card.description,
      position: card.position,
      coverColor: card.cover_color,
      dueDate: card.due_date,
      isArchived: card.is_archived,
      isCompleted: card.is_completed,
      listId: card.list_id,
    });
  } catch (err) {
    console.error('updateCard error:', err.message);
    res.status(500).json({ error: 'Failed to update card' });
  }
}

// DELETE /api/cards/:id — delete a card
export async function deleteCard(req, res) {
  try {
    const { id } = req.params;
    await query('DELETE FROM cards WHERE id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    console.error('deleteCard error:', err.message);
    res.status(500).json({ error: 'Failed to delete card' });
  }
}

// PUT /api/cards/reorder/batch — reorder cards (move between lists)
export async function reorderCards(req, res) {
  try {
    const { cards } = req.body; // Array of { id, position, listId }

    for (const card of cards) {
      await query(
        'UPDATE cards SET position = $1, list_id = $2 WHERE id = $3',
        [card.position, card.listId, card.id]
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error('reorderCards error:', err.message);
    res.status(500).json({ error: 'Failed to reorder cards' });
  }
}

// POST /api/cards/:cardId/labels/:labelId — add label to card
export async function addLabel(req, res) {
  try {
    const { cardId, labelId } = req.params;
    await query(
      'INSERT INTO card_labels (card_id, label_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [cardId, labelId]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    console.error('addLabel error:', err.message);
    res.status(500).json({ error: 'Failed to add label' });
  }
}

// DELETE /api/cards/:cardId/labels/:labelId — remove label from card
export async function removeLabel(req, res) {
  try {
    const { cardId, labelId } = req.params;
    await query(
      'DELETE FROM card_labels WHERE card_id = $1 AND label_id = $2',
      [cardId, labelId]
    );
    res.status(204).send();
  } catch (err) {
    console.error('removeLabel error:', err.message);
    res.status(500).json({ error: 'Failed to remove label' });
  }
}

// POST /api/cards/:cardId/members/:memberId — add member to card
export async function addMember(req, res) {
  try {
    const { cardId, memberId } = req.params;
    await query(
      'INSERT INTO card_members (card_id, member_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [cardId, memberId]
    );

    const memberResult = await query('SELECT name FROM members WHERE id = $1', [memberId]);
    const memberName = memberResult.rows[0]?.name || 'a member';
    await logActivity(cardId, 1, 'added_member', `added ${memberName} to this card`);

    res.status(201).json({ success: true });
  } catch (err) {
    console.error('addMember error:', err.message);
    res.status(500).json({ error: 'Failed to add member' });
  }
}

// DELETE /api/cards/:cardId/members/:memberId — remove member from card
export async function removeMember(req, res) {
  try {
    const { cardId, memberId } = req.params;
    await query(
      'DELETE FROM card_members WHERE card_id = $1 AND member_id = $2',
      [cardId, memberId]
    );

    const memberResult = await query('SELECT name FROM members WHERE id = $1', [memberId]);
    const memberName = memberResult.rows[0]?.name || 'a member';
    await logActivity(cardId, 1, 'removed_member', `removed ${memberName} from this card`);

    res.status(204).send();
  } catch (err) {
    console.error('removeMember error:', err.message);
    res.status(500).json({ error: 'Failed to remove member' });
  }
}

// POST /api/cards/:cardId/custom-fields/:fieldId — update custom field value
export async function updateCardCustomField(req, res) {
  try {
    const { cardId, fieldId } = req.params;
    const { value } = req.body;

    const result = await query(
      `INSERT INTO card_custom_fields (card_id, custom_field_id, value)
       VALUES ($1, $2, $3)
       ON CONFLICT (card_id, custom_field_id)
       DO UPDATE SET value = EXCLUDED.value
       RETURNING *`,
      [cardId, fieldId, value]
    );

    res.json({
      cardId: result.rows[0].card_id,
      customFieldId: result.rows[0].custom_field_id,
      value: result.rows[0].value,
    });
  } catch (err) {
    console.error('updateCardCustomField error:', err.message);
    res.status(500).json({ error: 'Failed to update custom field' });
  }
}
