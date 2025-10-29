const express = require('express');
const cors = require('cors');
require('dotenv').config();

const tagsRouter = require('./routes/tags');
const authRouter = require('./routes/auth');
const { authMiddleware } = require('./middleware/auth');

const app = express();
app.use(cors());
app.use(express.json());

// health check
app.get('/health', (_req, res) =>
  res.json({ ok: true, ts: new Date().toISOString() })
);

// auth routes (signup/login/me)
app.use('/api/auth', authRouter);

// protect all tag routes
app.use('/api/tags', authMiddleware, tagsRouter);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`✅ RFID backend listening on http://localhost:${port}`);
});
