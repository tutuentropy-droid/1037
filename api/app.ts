import express from 'express';
import cors from 'cors';
import gameRoutes from './routes/game.js';
import authRoutes from './routes/auth.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/game', gameRoutes);
app.use('/api/auth', authRoutes);

app.get('/api/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok' } });
});

export default app;
