-- Clean up existing data (optional, since schema.sql already drops tables)
TRUNCATE TABLE members, boards, lists, cards, labels, card_labels, checklists, checklist_items, board_members, card_members, comments, activities RESTART IDENTITY CASCADE;

-- Insert Members
INSERT INTO members (id, name, email, avatar_color, initials) VALUES
(1, 'Arun Sharma', 'arun@example.com', '#0079BF', 'AG'),
(2, 'Priya Sharma', 'priya@example.com', '#D29034', 'PS'),
(3, 'Rahul Kumar', 'rahul@example.com', '#519839', 'RK'),
(4, 'Sneha Mishra', 'sneha@example.com', '#B04632', 'SM'),
(5, 'Vikram Reddy', 'vikram@example.com', '#89609E', 'VR');

-- Insert Boards
INSERT INTO boards (id, title, background) VALUES
(1, 'Sprint Planning', 'gradient-purple'),
(2, 'Product Roadmap', 'gradient-blue');

-- Assign Board Members
INSERT INTO board_members (board_id, member_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5),
(2, 1), (2, 2), (2, 3);

-- Insert Labels (Board 1)
INSERT INTO labels (id, name, color, board_id) VALUES
(1, 'Bug', '#ef4444', 1),
(2, 'Feature', '#22c55e', 1),
(3, 'Enhancement', '#3b82f6', 1),
(4, 'Urgent', '#f97316', 1),
(5, 'Design', '#a855f7', 1),
(6, 'Documentation', '#06b6d4', 1),
(7, 'Backend', '#eab308', 1),
(8, 'Frontend', '#ec4899', 1),
(9, 'Testing', '#84cc16', 1),
(10, '', '#1d1d1d', 1);

-- Insert Labels (Board 2)
INSERT INTO labels (id, name, color, board_id) VALUES
(11, 'Q1', '#22c55e', 2),
(12, 'Q2', '#3b82f6', 2),
(13, 'Q3', '#f97316', 2),
(14, 'Q4', '#ef4444', 2),
(15, 'MVP', '#a855f7', 2),
(16, 'Nice-to-have', '#06b6d4', 2);

-- Insert Lists (Board 1)
INSERT INTO lists (id, title, position, color, board_id) VALUES
(1, 'Today', 0, '#fdf2b5', 1),
(2, 'This Week', 1, '#dcfce7', 1),
(3, 'Later', 2, '#f1f2f4', 1),
(4, 'Review', 3, NULL, 1),
(5, 'Done', 4, NULL, 1);

-- Insert Lists (Board 2)
INSERT INTO lists (id, title, position, color, board_id) VALUES
(6, 'Ideas', 0, NULL, 2),
(7, 'Planned', 1, NULL, 2),
(8, 'In Development', 2, NULL, 2),
(9, 'Shipped', 3, NULL, 2);

-- Insert Cards (Board 1)
-- Backlog cards
INSERT INTO cards (id, title, description, position, cover_color, due_date, is_completed, list_id) VALUES
(1, 'Set up CI/CD pipeline', 'Configure GitHub Actions for automated testing and deployment.\n\n## Requirements\n- Run tests on every PR\n- Deploy to staging on merge to develop\n- Deploy to production on merge to main', 0, NULL, NOW() + INTERVAL '7 days', FALSE, 1),
(2, 'Write API documentation', 'Document all REST API endpoints using Swagger/OpenAPI specification.', 1, NULL, NULL, FALSE, 1),
(3, 'Database performance optimization', 'Review and optimize slow database queries. Add proper indexing.', 2, '#fef3c7', NULL, FALSE, 1);

-- To Do cards
INSERT INTO cards (id, title, description, position, cover_color, due_date, is_completed, list_id) VALUES
(4, 'Design user profile page', 'Create wireframes and high-fidelity mockups for the user profile page.', 0, '#dbeafe', NOW() + INTERVAL '1 day', FALSE, 2),
(5, 'Implement authentication flow', 'Set up JWT-based authentication with login, register, and password reset.', 1, NULL, NOW() + INTERVAL '7 days', FALSE, 2),
(6, 'Fix navigation bug on mobile', 'The hamburger menu does not close after selecting a menu item on mobile devices.', 2, NULL, NOW() - INTERVAL '1 day', FALSE, 2);

-- In Progress cards
INSERT INTO cards (id, title, description, position, cover_color, due_date, is_completed, list_id) VALUES
(7, 'Build drag-and-drop board', 'Implement the Kanban board with drag-and-drop functionality using @hello-pangea/dnd.', 0, '#dcfce7', NULL, FALSE, 3),
(8, 'Create REST API endpoints', 'Build CRUD endpoints for boards, lists, and cards.', 1, NULL, NULL, FALSE, 3);

-- Review cards
INSERT INTO cards (id, title, description, position, cover_color, due_date, is_completed, list_id) VALUES
(9, 'Setup project structure', 'Initialize React + Vite frontend and Express backend with proper folder structure.', 0, NULL, NULL, FALSE, 4);

-- Done cards
INSERT INTO cards (id, title, description, position, cover_color, due_date, is_completed, list_id) VALUES
(10, 'Initialize GitHub repository', 'Create repo, add .gitignore, set up branch protection rules.', 0, NULL, NULL, TRUE, 5),
(11, 'Define database schema', 'Design and implement the database schema with all required tables and relationships.', 1, NULL, NULL, TRUE, 5);

-- Card Labels association
INSERT INTO card_labels (card_id, label_id) VALUES
(1, 3), (1, 7),
(2, 6),
(3, 7), (3, 4),
(4, 5), (4, 8),
(5, 2), (5, 7),
(6, 1), (6, 4),
(7, 2), (7, 8),
(8, 2), (8, 7),
(9, 3),
(10, 3),
(11, 7);

-- Card Members association
INSERT INTO card_members (card_id, member_id) VALUES
(1, 1), (1, 3),
(4, 2),
(5, 1), (5, 4),
(6, 5),
(7, 1),
(8, 3),
(9, 1),
(10, 1),
(11, 1), (11, 3);

-- Insert Custom Fields Definitions
INSERT INTO custom_fields (id, name, type, board_id) VALUES
(1, '# Effort', 'text', 1);

-- Insert Card Custom Field Values
INSERT INTO card_custom_fields (card_id, custom_field_id, value) VALUES
(1, 1, '8'),
(4, 1, '5');

-- Insert Checklists
INSERT INTO checklists (id, title, card_id) VALUES
(1, 'CI/CD Steps', 1),
(2, 'Auth Requirements', 5),
(3, 'Board Features', 7);

-- Insert Checklist Items
INSERT INTO checklist_items (id, text, is_checked, position, checklist_id) VALUES
(1, 'Configure GitHub Actions workflow', TRUE, 0, 1),
(2, 'Add unit test runner', FALSE, 1, 1),
(3, 'Set up staging deployment', FALSE, 2, 1),
(4, 'Configure production deployment', FALSE, 3, 1),

(5, 'Login endpoint', TRUE, 0, 2),
(6, 'Register endpoint', TRUE, 1, 2),
(7, 'JWT token generation', FALSE, 2, 2),
(8, 'Password reset flow', FALSE, 3, 2),
(9, 'Email verification', FALSE, 4, 2),

(10, 'Drag cards between lists', TRUE, 0, 3),
(11, 'Reorder cards within list', TRUE, 1, 3),
(12, 'Reorder lists', TRUE, 2, 3),
(13, 'Add new card', FALSE, 3, 3),
(14, 'Card detail modal', FALSE, 4, 3);

-- Insert Comments
INSERT INTO comments (id, text, card_id, member_id, created_at) VALUES
(1, 'I''ve started working on the GitHub Actions config. Should we use the standard Node.js template?', 1, 1, NOW() - INTERVAL '1 hour'),
(2, 'Yes, use the Node.js template and add PostgreSQL service container for integration tests.', 1, 3, NOW() - INTERVAL '30 minutes'),
(3, 'The mockups are ready in Figma. Please review when you get a chance.', 4, 2, NOW() - INTERVAL '2 hours'),
(4, 'This is a critical bug affecting all mobile users. Please prioritize.', 6, 4, NOW() - INTERVAL '1 day'),
(5, 'Fixed in the latest PR. Ready for testing.', 6, 5, NOW() - INTERVAL '12 hours');

-- Insert Activities
INSERT INTO activities (id, action, details, card_id, member_id, created_at) VALUES
(1, 'created', 'Created this card', 7, 1, NOW() - INTERVAL '2 days'),
(2, 'moved', 'Moved from To Do to In Progress', 7, 1, NOW() - INTERVAL '1 day'),
(3, 'added_label', 'Added label Feature', 7, 1, NOW() - INTERVAL '1 day'),
(4, 'created', 'Created this card', 9, 1, NOW() - INTERVAL '3 days'),
(5, 'moved', 'Moved from In Progress to Review', 9, 1, NOW() - INTERVAL '1 day');

-- Reset sequences so next auto-generated IDs start correctly
SELECT setval('members_id_seq', COALESCE((SELECT MAX(id) FROM members), 1));
SELECT setval('boards_id_seq', COALESCE((SELECT MAX(id) FROM boards), 1));
SELECT setval('lists_id_seq', COALESCE((SELECT MAX(id) FROM lists), 1));
SELECT setval('cards_id_seq', COALESCE((SELECT MAX(id) FROM cards), 1));
SELECT setval('labels_id_seq', COALESCE((SELECT MAX(id) FROM labels), 1));
SELECT setval('custom_fields_id_seq', COALESCE((SELECT MAX(id) FROM custom_fields), 1));
SELECT setval('checklists_id_seq', COALESCE((SELECT MAX(id) FROM checklists), 1));
SELECT setval('checklist_items_id_seq', COALESCE((SELECT MAX(id) FROM checklist_items), 1));
SELECT setval('comments_id_seq', COALESCE((SELECT MAX(id) FROM comments), 1));
SELECT setval('activities_id_seq', COALESCE((SELECT MAX(id) FROM activities), 1));
