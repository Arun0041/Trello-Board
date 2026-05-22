import { query } from '../database/db.js';

// GET /api/members — get all members
export async function getAllMembers(req, res) {
  try {
    const result = await query('SELECT * FROM members ORDER BY id');
    res.json(result.rows.map(m => ({
      id: m.id,
      name: m.name,
      email: m.email,
      avatarColor: m.avatar_color,
      initials: m.initials,
    })));
  } catch (err) {
    console.error('getAllMembers error:', err.message);
    res.status(500).json({ error: 'Failed to fetch members' });
  }
}
