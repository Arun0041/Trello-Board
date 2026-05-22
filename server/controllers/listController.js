import { query } from '../database/db.js';

// POST /api/lists/boards/:boardId/lists — create a new list
export async function createList(req, res) {
  try {
    const { boardId } = req.params;
    const { title } = req.body;

    // Get the next position (max + 1)
    const posResult = await query(
      'SELECT COALESCE(MAX(position), -1) + 1 as next_pos FROM lists WHERE board_id = $1',
      [boardId]
    );
    const position = posResult.rows[0].next_pos;

    const result = await query(
      'INSERT INTO lists (title, position, board_id) VALUES ($1, $2, $3) RETURNING *',
      [title, position, boardId]
    );

    // Return the new list with empty cards array
    const list = result.rows[0];
    res.status(201).json({
      id: list.id,
      title: list.title,
      position: list.position,
      boardId: list.board_id,
      cards: [],
    });
  } catch (err) {
    console.error('createList error:', err.message);
    res.status(500).json({ error: 'Failed to create list' });
  }
}

// PUT /api/lists/:id — update list title
export async function updateList(req, res) {
  try {
    const { id } = req.params;
    const { title } = req.body;

    const result = await query(
      'UPDATE lists SET title = $1 WHERE id = $2 RETURNING *',
      [title, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'List not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('updateList error:', err.message);
    res.status(500).json({ error: 'Failed to update list' });
  }
}

// DELETE /api/lists/:id — delete a list
export async function deleteList(req, res) {
  try {
    const { id } = req.params;
    await query('DELETE FROM lists WHERE id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    console.error('deleteList error:', err.message);
    res.status(500).json({ error: 'Failed to delete list' });
  }
}

// PUT /api/lists/reorder/batch — reorder multiple lists
export async function reorderLists(req, res) {
  try {
    const { lists } = req.body; // Array of { id, position }

    // Update each list's position one by one
    for (const item of lists) {
      await query(
        'UPDATE lists SET position = $1 WHERE id = $2',
        [item.position, item.id]
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error('reorderLists error:', err.message);
    res.status(500).json({ error: 'Failed to reorder lists' });
  }
}
