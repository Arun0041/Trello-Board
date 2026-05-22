import { query } from '../database/db.js';

// POST /api/checklists/cards/:cardId/checklists — create a checklist
export async function createChecklist(req, res) {
  try {
    const { cardId } = req.params;
    const { title } = req.body;
    const result = await query(
      'INSERT INTO checklists (title, card_id) VALUES ($1, $2) RETURNING *',
      [title || 'Checklist', cardId]
    );
    const cl = result.rows[0];
    res.status(201).json({
      id: cl.id,
      title: cl.title,
      cardId: cl.card_id,
      items: [],
    });
  } catch (err) {
    console.error('createChecklist error:', err.message);
    res.status(500).json({ error: 'Failed to create checklist' });
  }
}

// DELETE /api/checklists/:id — delete a checklist
export async function deleteChecklist(req, res) {
  try {
    const { id } = req.params;
    await query('DELETE FROM checklists WHERE id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    console.error('deleteChecklist error:', err.message);
    res.status(500).json({ error: 'Failed to delete checklist' });
  }
}

// POST /api/checklists/:checklistId/items — add an item to a checklist
export async function addItem(req, res) {
  try {
    const { checklistId } = req.params;
    const { text } = req.body;

    // Get next position
    const posResult = await query(
      'SELECT COALESCE(MAX(position), -1) + 1 as next_pos FROM checklist_items WHERE checklist_id = $1',
      [checklistId]
    );
    const position = posResult.rows[0].next_pos;

    const result = await query(
      'INSERT INTO checklist_items (text, position, checklist_id) VALUES ($1, $2, $3) RETURNING *',
      [text, position, checklistId]
    );

    const item = result.rows[0];
    res.status(201).json({
      id: item.id,
      text: item.text,
      isChecked: item.is_checked,
      position: item.position,
    });
  } catch (err) {
    console.error('addItem error:', err.message);
    res.status(500).json({ error: 'Failed to add checklist item' });
  }
}

// PUT /api/checklists/items/:itemId — update a checklist item
export async function updateItem(req, res) {
  try {
    const { itemId } = req.params;
    const { text, isChecked } = req.body;

    const result = await query(
      `UPDATE checklist_items 
       SET text = COALESCE($1, text), 
           is_checked = COALESCE($2, is_checked) 
       WHERE id = $3 
       RETURNING *`,
      [text, isChecked, itemId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const item = result.rows[0];
    res.json({
      id: item.id,
      text: item.text,
      isChecked: item.is_checked,
      position: item.position,
    });
  } catch (err) {
    console.error('updateItem error:', err.message);
    res.status(500).json({ error: 'Failed to update checklist item' });
  }
}

// DELETE /api/checklists/items/:itemId — delete a checklist item
export async function deleteItem(req, res) {
  try {
    const { itemId } = req.params;
    await query('DELETE FROM checklist_items WHERE id = $1', [itemId]);
    res.status(204).send();
  } catch (err) {
    console.error('deleteItem error:', err.message);
    res.status(500).json({ error: 'Failed to delete checklist item' });
  }
}
