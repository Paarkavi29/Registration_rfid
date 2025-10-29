const express = require('express');
const pool = require('../db/pool');
const { hashPassword, verifyPassword } = require('../auth/password');
const { createToken, authMiddleware } = require('../middleware/auth');
const { ensureUsersTable } = require('../auth/ensureUsersTable');

const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    await ensureUsersTable();
    const { email, password, fullName } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });

    const lowerEmail = String(email).trim().toLowerCase();
    const { rows: existing } = await pool.query('SELECT id FROM users WHERE email = $1', [lowerEmail]);
    if (existing.length > 0) return res.status(409).json({ error: 'Email already registered' });

    const password_hash = hashPassword(password);
    const insert = await pool.query(
      'INSERT INTO users (email, password_hash, full_name) VALUES ($1, $2, $3) RETURNING id, email, full_name, role, created_at',
      [lowerEmail, password_hash, fullName || null]
    );
    const user = insert.rows[0];
    const token = createToken({ sub: user.id, email: user.email, role: user.role });
    return res.json({ token, user });
  } catch (err) {
    console.error('signup error', err);
    const debug = process.env.NODE_ENV === 'production' ? {} : { detail: err.message, code: err.code };
    return res.status(500).json({ error: 'Failed to sign up', ...debug });
  }
});

router.post('/login', async (req, res) => {
  try {
    await ensureUsersTable();
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });
    const lowerEmail = String(email).trim().toLowerCase();
    const { rows } = await pool.query('SELECT id, email, password_hash, full_name, role, created_at FROM users WHERE email = $1', [lowerEmail]);
    if (rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
    const user = rows[0];
    if (!verifyPassword(password, user.password_hash)) return res.status(401).json({ error: 'Invalid credentials' });
    const token = createToken({ sub: user.id, email: user.email, role: user.role });
    delete user.password_hash;
    return res.json({ token, user });
  } catch (err) {
    console.error('login error', err);
    const debug = process.env.NODE_ENV === 'production' ? {} : { detail: err.message, code: err.code };
    return res.status(500).json({ error: 'Failed to login', ...debug });
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const { sub } = req.user;
    const { rows } = await pool.query('SELECT id, email, full_name, role, created_at FROM users WHERE id = $1', [sub]);
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    return res.json({ user: rows[0] });
  } catch (err) {
    console.error('me error', err);
    return res.status(500).json({ error: 'Failed to fetch user' });
  }
});

module.exports = router;
