import { query } from '../database/db.js';

// POST /api/custom-fields/boards/:boardId — create a new custom field on a board
export async function createCustomField(req, res) {
  try {
    const { boardId } = req.params;
    const { name, type } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Field name is required' });
    }

    const result = await query(
      'INSERT INTO custom_fields (name, type, board_id) VALUES ($1, $2, $3) RETURNING *',
      [name, type || 'text', boardId]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('createCustomField error:', err.message);
    res.status(500).json({ error: 'Failed to create custom field' });
  }
}

// DELETE /api/custom-fields/:id — delete a custom field definition
export async function deleteCustomField(req, res) {
  try {
    const { id } = req.params;
    await query('DELETE FROM custom_fields WHERE id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    console.error('deleteCustomField error:', err.message);
    res.status(500).json({ error: 'Failed to delete custom field' });
  }
}
