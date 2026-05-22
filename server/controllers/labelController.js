import { query } from '../database/db.js';

// GET /api/labels/boards/:boardId/labels — get all labels for a board
export async function getBoardLabels(req, res) {
  try {
    const { boardId } = req.params;
    const result = await query(
      'SELECT * FROM labels WHERE board_id = $1 ORDER BY id',
      [boardId]
    );
    res.json(result.rows.map(l => ({
      id: l.id,
      name: l.name,
      color: l.color,
      boardId: l.board_id,
    })));
  } catch (err) {
    console.error('getBoardLabels error:', err.message);
    res.status(500).json({ error: 'Failed to fetch labels' });
  }
}

// POST /api/labels/boards/:boardId/labels — create a label
export async function createLabel(req, res) {
  try {
    const { boardId } = req.params;
    const { name, color } = req.body;
    const result = await query(
      'INSERT INTO labels (name, color, board_id) VALUES ($1, $2, $3) RETURNING *',
      [name || '', color, boardId]
    );
    const label = result.rows[0];
    res.status(201).json({
      id: label.id,
      name: label.name,
      color: label.color,
      boardId: label.board_id,
    });
  } catch (err) {
    console.error('createLabel error:', err.message);
    res.status(500).json({ error: 'Failed to create label' });
  }
}

// PUT /api/labels/:id — update a label
export async function updateLabel(req, res) {
  try {
    const { id } = req.params;
    const { name, color } = req.body;
    const result = await query(
      'UPDATE labels SET name = COALESCE($1, name), color = COALESCE($2, color) WHERE id = $3 RETURNING *',
      [name, color, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Label not found' });
    }
    const label = result.rows[0];
    res.json({
      id: label.id,
      name: label.name,
      color: label.color,
      boardId: label.board_id,
    });
  } catch (err) {
    console.error('updateLabel error:', err.message);
    res.status(500).json({ error: 'Failed to update label' });
  }
}

// DELETE /api/labels/:id — delete a label
export async function deleteLabel(req, res) {
  try {
    const { id } = req.params;
    await query('DELETE FROM labels WHERE id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    console.error('deleteLabel error:', err.message);
    res.status(500).json({ error: 'Failed to delete label' });
  }
}
