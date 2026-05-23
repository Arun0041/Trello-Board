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

// POST /api/members — create a new member
export async function createMember(req, res) {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    // Generate initials from name
    const parts = name.trim().split(/\s+/);
    const initials = parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : name.trim().substring(0, 2).toUpperCase();

    // Random avatar color
    const colors = ['#0079BF', '#D29034', '#519839', '#B04632', '#89609E', '#00AECC', '#838C91', '#51E898', '#FF78CB', '#344563'];
    const avatarColor = colors[Math.floor(Math.random() * colors.length)];

    const result = await query(
      'INSERT INTO members (name, email, avatar_color, initials) VALUES ($1, $2, $3, $4) RETURNING *',
      [name.trim(), email.trim(), avatarColor, initials]
    );
    const m = result.rows[0];
    res.status(201).json({
      id: m.id,
      name: m.name,
      email: m.email,
      avatarColor: m.avatar_color,
      initials: m.initials,
    });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'A member with this email already exists' });
    }
    console.error('createMember error:', err.message);
    res.status(500).json({ error: 'Failed to create member' });
  }
}

// POST /api/members/boards/:boardId — add a member to a board
export async function addBoardMember(req, res) {
  try {
    const { boardId } = req.params;
    const { memberId } = req.body;
    await query(
      'INSERT INTO board_members (board_id, member_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [boardId, memberId]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    console.error('addBoardMember error:', err.message);
    res.status(500).json({ error: 'Failed to add member to board' });
  }
}

