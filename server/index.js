import 'dotenv/config';
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
import attachmentRoutes from './routes/attachments.js';
import customFieldRoutes from './routes/customFields.js';

const app = express();
const PORT = process.env.PORT;

const allowedOrigins = [
  'https://trelloboard-ebon.vercel.app',
  'http://localhost:5173'
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
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
app.use('/api/attachments', attachmentRoutes);
app.use('/api/custom-fields', customFieldRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
