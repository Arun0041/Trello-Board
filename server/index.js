import express from 'express';
import cors from 'cors';
import boardRoutes from './routes/boards.js';
import listRoutes from './routes/lists.js';
import cardRoutes from './routes/cards.js';
import labelRoutes from './routes/labels.js';
import checklistRoutes from './routes/checklists.js';
import memberRoutes from './routes/members.js';
import commentRoutes from './routes/comments.js';
import searchRoutes from './routes/search.js';

const app = express();
// Port configuration
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/boards', boardRoutes);
app.use('/api/lists', listRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/labels', labelRoutes);
app.use('/api/checklists', checklistRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/search', searchRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
