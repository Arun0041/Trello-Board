# Trello Clone — Kanban Project Management Tool

A full-stack Kanban-style project management web application built as a Trello clone. Organize tasks with boards, lists, and cards using drag-and-drop.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Tailwind CSS v4 (CDN) |
| Drag & Drop | @hello-pangea/dnd |
| Backend | Node.js, Express.js |
| Database | PostgreSQL (raw SQL via `pg` driver) |

## Features

### Core Features
- **Board Management** — Create boards with title and background color
- **Lists** — Create, edit, delete, and drag-to-reorder lists
- **Cards** — Create, edit, delete cards with drag-and-drop between lists and within lists
- **Card Details** — Title, description, colored labels, due dates, checklists, member assignment
- **Search & Filter** — Search cards by title, filter by label, member, or due date
- **Comments** — Add and delete comments on cards
- **Activity Log** — Track card activity history

### Bonus Features
- Responsive design (mobile, tablet, desktop)
- Multiple boards support
- Card covers (colors)
- Board background customization

## Database Schema

The database has 9 tables with proper relationships:

- `members` — Sample users (no auth required)
- `boards` — Project boards with title and background
- `lists` — Columns within a board, ordered by position
- `cards` — Tasks within lists, ordered by position
- `labels` — Colored tags per board
- `card_labels` — Many-to-many: cards ↔ labels
- `card_members` — Many-to-many: cards ↔ members
- `checklists` — Checklists on cards
- `checklist_items` — Items within checklists
- `comments` — Comments on cards with member info
- `activities` — Activity log for cards
- `board_members` — Many-to-many: boards ↔ members

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v14+)

### 1. Clone the repository
```bash
git clone <repo-url>
cd scaler-trello
```

### 2. Set up the database
Create a PostgreSQL database:
```sql
CREATE DATABASE trello_clone;
```

Update the connection string in `server/.env`:
```
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/trello_clone
```

### 3. Install dependencies
```bash
# Frontend
npm install

# Backend
cd server
npm install
```

### 4. Initialize the database (creates tables + seeds sample data)
```bash
cd server
node database/init-db.js
```

### 5. Start the application
```bash
# Terminal 1 — Start the backend (port 3001)
cd server
npm run dev

# Terminal 2 — Start the frontend (port 5173)
npm run dev
```

Open http://localhost:5173 in your browser.

## Project Structure

```
scaler-trello/
├── src/                          # Frontend (React + Vite)
│   ├── api/api.js                # API client (all backend calls)
│   ├── context/BoardContext.jsx  # Global board state management
│   ├── pages/
│   │   ├── BoardsHome.jsx        # Home page — list of boards
│   │   └── BoardView.jsx         # Board page — lists, cards, DnD
│   ├── components/
│   │   ├── board/
│   │   │   ├── Board.jsx         # Board layout (droppable for lists)
│   │   │   ├── List.jsx          # Single list (draggable + droppable)
│   │   │   ├── TaskCard.jsx      # Card in a list (draggable)
│   │   │   ├── AddCard.jsx       # Add card form
│   │   │   └── AddList.jsx       # Add list form
│   │   ├── card/
│   │   │   └── CardModal.jsx     # Card detail modal
│   │   └── layout/
│   │       ├── Navbar.jsx        # Top navigation bar
│   │       └── BoardHeader.jsx   # Board title, filters, menu
│   └── main.jsx                  # App entry point
├── server/                       # Backend (Express + PostgreSQL)
│   ├── index.js                  # Express server setup
│   ├── database/
│   │   ├── db.js                 # PostgreSQL connection pool
│   │   ├── init-db.js            # Database initialization script
│   │   ├── schema.sql            # Table definitions
│   │   └── seed.sql              # Sample data
│   ├── controllers/              # Route handlers (raw SQL)
│   │   ├── boardController.js
│   │   ├── listController.js
│   │   ├── cardController.js
│   │   ├── labelController.js
│   │   ├── checklistController.js
│   │   ├── memberController.js
│   │   ├── commentController.js
│   │   └── searchController.js
│   └── routes/                   # Express route definitions
│       ├── boards.js
│       ├── lists.js
│       ├── cards.js
│       ├── labels.js
│       ├── checklists.js
│       ├── members.js
│       ├── comments.js
│       └── search.js
└── index.html                    # Vite entry HTML
```

## Assumptions

1. **No authentication** — A default user (Arun Sharma, member_id=1) is assumed to be logged in
2. **Sample members** — 5 sample members are seeded in the database for assignment functionality
3. **Raw SQL** — All database queries use raw SQL via the `pg` driver (no ORM)
4. **Local PostgreSQL** — The app connects to a local PostgreSQL instance

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/boards | List all boards |
| POST | /api/boards | Create a board |
| GET | /api/boards/:id | Get board with all data |
| PUT | /api/boards/:id | Update board |
| DELETE | /api/boards/:id | Delete board |
| POST | /api/lists/boards/:boardId/lists | Create a list |
| PUT | /api/lists/:id | Update list title |
| DELETE | /api/lists/:id | Delete list |
| PUT | /api/lists/reorder/batch | Reorder lists |
| POST | /api/cards/lists/:listId/cards | Create a card |
| GET | /api/cards/:id | Get card details |
| PUT | /api/cards/:id | Update card |
| DELETE | /api/cards/:id | Delete card |
| PUT | /api/cards/reorder/batch | Reorder/move cards |
| POST | /api/cards/:cardId/labels/:labelId | Add label |
| DELETE | /api/cards/:cardId/labels/:labelId | Remove label |
| POST | /api/cards/:cardId/members/:memberId | Add member |
| DELETE | /api/cards/:cardId/members/:memberId | Remove member |
| GET | /api/labels/boards/:boardId/labels | Get board labels |
| POST | /api/labels/boards/:boardId/labels | Create label |
| PUT | /api/labels/:id | Update label |
| DELETE | /api/labels/:id | Delete label |
| POST | /api/checklists/cards/:cardId/checklists | Create checklist |
| DELETE | /api/checklists/:id | Delete checklist |
| POST | /api/checklists/:checklistId/items | Add item |
| PUT | /api/checklists/items/:itemId | Update item |
| DELETE | /api/checklists/items/:itemId | Delete item |
| GET | /api/comments/cards/:cardId/comments | Get comments |
| POST | /api/comments/cards/:cardId/comments | Add comment |
| DELETE | /api/comments/:id | Delete comment |
| GET | /api/members | List all members |
| GET | /api/search/boards/:boardId | Search/filter cards |
