import { query } from '../database/db.js';

// GET /api/cards/:cardId/attachments — get all attachments for a card
export async function getAttachments(req, res) {
  try {
    const { cardId } = req.params;
    const result = await query(
      'SELECT * FROM attachments WHERE card_id = $1 ORDER BY created_at DESC',
      [cardId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('getAttachments error:', err.message);
    res.status(500).json({ error: 'Failed to fetch attachments' });
  }
}

// POST /api/cards/:cardId/attachments — add a new attachment to a card
export async function addAttachment(req, res) {
  try {
    const { cardId } = req.params;
    const { name, url } = req.body;

    if (!name || !url) {
      return res.status(400).json({ error: 'Name and URL are required' });
    }

    const result = await query(
      'INSERT INTO attachments (card_id, name, url) VALUES ($1, $2, $3) RETURNING *',
      [cardId, name, url]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('addAttachment error:', err.message);
    res.status(500).json({ error: 'Failed to add attachment' });
  }
}

// DELETE /api/attachments/:id — permanently delete an attachment
export async function deleteAttachment(req, res) {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM attachments WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Attachment not found' });
    }

    res.status(204).send();
  } catch (err) {
    console.error('deleteAttachment error:', err.message);
    res.status(500).json({ error: 'Failed to delete attachment' });
  }
}
