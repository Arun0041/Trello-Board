-- Drop existing tables if they exist (ordered by dependencies)
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS card_members CASCADE;
DROP TABLE IF EXISTS board_members CASCADE;
DROP TABLE IF EXISTS checklist_items CASCADE;
DROP TABLE IF EXISTS checklists CASCADE;
DROP TABLE IF EXISTS card_labels CASCADE;
DROP TABLE IF EXISTS labels CASCADE;
DROP TABLE IF EXISTS cards CASCADE;
DROP TABLE IF EXISTS lists CASCADE;
DROP TABLE IF EXISTS boards CASCADE;
DROP TABLE IF EXISTS members CASCADE;

-- Create Members Table
CREATE TABLE members (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  avatar_color VARCHAR(50) DEFAULT '#0079BF',
  initials VARCHAR(10) NOT NULL
);

-- Create Boards Table
CREATE TABLE boards (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  background VARCHAR(100) DEFAULT 'gradient-purple',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Lists Table
CREATE TABLE lists (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  position INT NOT NULL,
  board_id INT NOT NULL REFERENCES boards(id) ON DELETE CASCADE
);

-- Create Cards Table
CREATE TABLE cards (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT DEFAULT '',
  position INT NOT NULL,
  cover_color VARCHAR(50),
  due_date TIMESTAMP WITH TIME ZONE,
  is_archived BOOLEAN DEFAULT FALSE,
  list_id INT NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Labels Table
CREATE TABLE labels (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) DEFAULT '',
  color VARCHAR(50) NOT NULL,
  board_id INT NOT NULL REFERENCES boards(id) ON DELETE CASCADE
);

-- Create CardLabels Join Table
CREATE TABLE card_labels (
  card_id INT NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  label_id INT NOT NULL REFERENCES labels(id) ON DELETE CASCADE,
  PRIMARY KEY (card_id, label_id)
);

-- Create Checklists Table
CREATE TABLE checklists (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) DEFAULT 'Checklist',
  card_id INT NOT NULL REFERENCES cards(id) ON DELETE CASCADE
);

-- Create Checklist Items Table
CREATE TABLE checklist_items (
  id SERIAL PRIMARY KEY,
  text VARCHAR(255) NOT NULL,
  is_checked BOOLEAN DEFAULT FALSE,
  position INT DEFAULT 0,
  checklist_id INT NOT NULL REFERENCES checklists(id) ON DELETE CASCADE
);

-- Create BoardMembers Join Table
CREATE TABLE board_members (
  board_id INT NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  member_id INT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  PRIMARY KEY (board_id, member_id)
);

-- Create CardMembers Join Table
CREATE TABLE card_members (
  card_id INT NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  member_id INT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  PRIMARY KEY (card_id, member_id)
);

-- Create Comments Table
CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  text TEXT NOT NULL,
  card_id INT NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  member_id INT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Activities Table
CREATE TABLE activities (
  id SERIAL PRIMARY KEY,
  action VARCHAR(255) NOT NULL,
  details TEXT DEFAULT '',
  card_id INT NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  member_id INT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes for performance
CREATE INDEX idx_lists_board_id ON lists(board_id);
CREATE INDEX idx_cards_list_id ON cards(list_id);
CREATE INDEX idx_labels_board_id ON labels(board_id);
CREATE INDEX idx_checklists_card_id ON checklists(card_id);
CREATE INDEX idx_checklist_items_checklist_id ON checklist_items(checklist_id);
CREATE INDEX idx_comments_card_id ON comments(card_id);
CREATE INDEX idx_activities_card_id ON activities(card_id);
