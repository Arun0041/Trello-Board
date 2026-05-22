import { query } from '../database/db.js';

// GET /api/comments/cards/:cardId/comments — get comments for a card
export async function getCardComments(req, res) {
  try {
    const { cardId } = req.params;
    const result = await query(
      `SELECT c.id, c.text, c.created_at, c.member_id,
              m.name, m.avatar_color, m.initials
       FROM comments c
       JOIN members m ON m.id = c.member_id
       WHERE c.card_id = $1
       ORDER BY c.created_at DESC`,
      [cardId]
    );

    res.json(result.rows.map(c => ({
      id: c.id,
      text: c.text,
      createdAt: c.created_at,
      member: {
        id: c.member_id,
        name: c.name,
        avatarColor: c.avatar_color,
        initials: c.initials,
      },
    })));
  } catch (err) {
    console.error('getCardComments error:', err.message);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
}

// POST /api/comments/cards/:cardId/comments — create a comment
export async function createComment(req, res) {
  try {
    const { cardId } = req.params;
    const { text } = req.body;

    // Default user is member_id = 1 (no auth system)
    const memberId = 1;

    const result = await query(
      'INSERT INTO comments (text, card_id, member_id) VALUES ($1, $2, $3) RETURNING *',
      [text, cardId, memberId]
    );

    // Get member info for the response
    const memberResult = await query(
      'SELECT name, avatar_color, initials FROM members WHERE id = $1',
      [memberId]
    );
    const member = memberResult.rows[0];

    const comment = result.rows[0];
    res.status(201).json({
      id: comment.id,
      text: comment.text,
      createdAt: comment.created_at,
      member: {
        id: memberId,
        name: member.name,
        avatarColor: member.avatar_color,
        initials: member.initials,
      },
    });
  } catch (err) {
    console.error('createComment error:', err.message);
    res.status(500).json({ error: 'Failed to create comment' });
  }
}

// DELETE /api/comments/:id — delete a comment
export async function deleteComment(req, res) {
  try {
    const { id } = req.params;
    await query('DELETE FROM comments WHERE id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    console.error('deleteComment error:', err.message);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
}
