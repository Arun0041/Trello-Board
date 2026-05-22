import { query } from '../database/db.js';

// GET /api/search/boards/:boardId — search and filter cards
export async function searchCards(req, res) {
  try {
    const { boardId } = req.params;
    const { q, label, member, due } = req.query;

    // Start building the query
    let sql = `
      SELECT DISTINCT c.id, c.title, c.list_id, c.position
      FROM cards c
      JOIN lists l ON l.id = c.list_id
    `;

    const conditions = ['l.board_id = $1', 'c.is_archived = false'];
    const values = [boardId];
    let paramCount = 1;

    // Join card_labels if filtering by label
    if (label) {
      sql += ' JOIN card_labels cl ON cl.card_id = c.id';
      paramCount++;
      conditions.push(`cl.label_id = $${paramCount}`);
      values.push(label);
    }

    // Join card_members if filtering by member
    if (member) {
      sql += ' JOIN card_members cm ON cm.card_id = c.id';
      paramCount++;
      conditions.push(`cm.member_id = $${paramCount}`);
      values.push(member);
    }

    // Search by title (case-insensitive)
    if (q) {
      paramCount++;
      conditions.push(`c.title ILIKE $${paramCount}`);
      values.push(`%${q}%`);
    }

    // Filter by due date
    if (due === 'overdue') {
      conditions.push('c.due_date IS NOT NULL');
      conditions.push('c.due_date < CURRENT_TIMESTAMP');
    } else if (due === 'today') {
      conditions.push('c.due_date IS NOT NULL');
      conditions.push("c.due_date >= CURRENT_DATE");
      conditions.push("c.due_date < CURRENT_DATE + INTERVAL '1 day'");
    } else if (due === 'week') {
      conditions.push('c.due_date IS NOT NULL');
      conditions.push("c.due_date >= CURRENT_DATE");
      conditions.push("c.due_date < CURRENT_DATE + INTERVAL '7 days'");
    } else if (due === 'none') {
      conditions.push('c.due_date IS NULL');
    }

    // Add WHERE clause
    sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY c.position';

    const result = await query(sql, values);

    // Return just the card IDs — the frontend uses these to filter/highlight
    res.json(result.rows.map(r => r.id));
  } catch (err) {
    console.error('searchCards error:', err.message);
    res.status(500).json({ error: 'Failed to search cards' });
  }
}
