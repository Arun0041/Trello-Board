# 📋 Trello Clone — Full-Stack Kanban Project Management Tool

A highly responsive, premium Kanban-style project management web application built as a feature-rich Trello Clone. Organize, prioritize, and track your tasks using boards, lists, and cards with smooth drag-and-drop mechanics.

🔗 **Live Frontend URL:** [https://trelloboard-ebon.vercel.app/](https://trelloboard-ebon.vercel.app/)  
🔗 **GitHub Repository:** [https://github.com/Arun0041/Trello-Board](https://github.com/Arun0041/Trello-Board)

---

## 🚀 Key Features

### 🛠️ Core Kanban Engine
* **Board Management** — Create custom boards with titles and beautiful curated background gradients/colors.
* **Lists / Columns** — Easily add, edit, archive, and drag-and-drop to reorder lists across the board.
* **Cards / Tasks** — Move tasks fluidly within a list or drag them to different lists with seamless state sync.

### 📝 Comprehensive Card Details
* **Rich Task Details** — Add titles, dynamic descriptions, cover colors, and due dates.
* **Interactive Checklists** — Track progress with checklists and progress bars.
* **Collaborative Comments** — Add, edit, and delete comments on cards with inline saving and author restrictions.
* **Search & Filter** — Instant searching by task title and filtering by labels, assignees, or due dates.
* **Attachments** — Attach URLs and external resources to cards with dynamic previews.
* **Custom Fields** — Create and manage custom metadata fields (e.g. Effort, Estimate) per board.
* **Activity log** — Track the card's action history (Show/Hide details).

---

## 💻 Tech Stack

* **Frontend:** React 19, Vite, Tailwind CSS (Vanilla responsive utility layer)
* **State Management & Client:** React Context API & native fetch client with environment configuration
* **Drag & Drop:** `@hello-pangea/dnd`
* **Backend:** Node.js, Express.js (Modular routes and controllers)
* **Database:** PostgreSQL (raw SQL queries with index optimizations and no heavy ORM)
* **Deployment:**
  * **Frontend:** Vercel (Auto-deployments)
  * **Backend:** Render (Web Service)
  * **Database:** Neon Serverless PostgreSQL (Free-forever tier)

---

## 📊 Database Architecture

The system database consists of optimized tables with robust cascading actions and functional indexes:

* `members` — User pool with custom initials and random color assignments.
* `boards` — Project boards configured with custom title and backgrounds.
* `lists` — Task columns mapped to specific boards, ordered by relative positions.
* `cards` — Tasks configured with complete status, archive indicators, and list mappings.
* `labels` — Colored tags bound to specific boards for filtering and categorizing.
* `card_labels` — Many-to-many join mapping tags to tasks.
* `card_members` — Many-to-many join mapping assignees to cards.
* `board_members` — Many-to-many join mapping members who have access to boards.
* `checklists` — Checklist lists containing tasks.
* `checklist_items` — Custom checklists details and verification status.
* `comments` — Time-stamped comment records with inline edit capability.
* `activities` — Chronological action/event logging.
* `attachments` — External links attached to cards.

---

## 🛠️ Setup Instructions

### Prerequisites
Ensure you have the following installed locally:
* **Node.js** (v18+)
* **PostgreSQL** (v14+) or a **Neon.tech** cloud database account

### 1. Clone & Install
```bash
# Clone the repository
git clone https://github.com/Arun0041/Trello-Board.git
cd Trello-Board

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
```

### 2. Configure Environment Variables

Create your local `.env` files based on the provided examples:

* **In root directory (`.env`):**
  ```text
  VITE_API_BASE=http://localhost:3001/api
  ```

* **In server directory (`server/.env`):**
  ```text
  DATABASE_URL=postgresql://your_user:your_password@localhost:5432/trello_clone
  PORT=3001
  ```

### 3. Initialize & Seed Database
You can easily create the tables and seed sample test data (5 users, 2 boards, various cards, checklists, and comments) by running:
```bash
cd server
node database/init-db.js
```
*(Alternative: Execute the `schema.sql` and `seed.sql` files directly in your PostgreSQL client).*

### 4. Running Locally
Launch both servers to start developing:

* **Start Backend Server:**
  ```bash
  cd server
  npm run dev
  ```
  *(Runs on [http://localhost:3001](http://localhost:3001))*

* **Start Frontend Server (in another terminal):**
  ```bash
  npm run dev
  ```
  *(Runs on [http://localhost:5173](http://localhost:5173))*

---

## 💡 Key Design Assumptions

1. **Seamless Guest Authentication** — There is no signup system. The application automatically logs you in as `Arun Sharma` (default `member_id = 1`) to provide frictionless board management.
2. **Board Access** — In accordance with Agile board setups, all registered platform members are accessible and automatically included in new boards to facilitate immediate task delegation.
3. **No-ORM Philosophy** — Hand-crafted raw SQL queries are used via the `pg` client to guarantee superior performance, lightning-fast database responses, and clean control over join actions.
4. **Environment Portability** — API endpoints and ports are completely dynamic and fetched directly from standard environment setups for instant production hosting adjustments.
