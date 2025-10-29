const crypto = require('crypto');

const AUTH_SECRET = process.env.AUTH_SECRET || 'dev-insecure-secret-change-me';

function base64url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function sign(data) {
  return base64url(
    crypto.createHmac('sha256', AUTH_SECRET).update(data).digest()
  );
}

function createToken(payload, expiresInSeconds = 60 * 60 * 8) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const fullPayload = { ...payload, exp };
  const headerB64 = base64url(JSON.stringify(header));
  const payloadB64 = base64url(JSON.stringify(fullPayload));
  const sig = sign(`${headerB64}.${payloadB64}`);
  return `${headerB64}.${payloadB64}.${sig}`;
}

function fromBase64Url(b64url) {
  const pad = '==='.slice((b64url.length + 3) % 4);
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/') + pad;
  return Buffer.from(b64, 'base64');
}

function verifyToken(token) {
  if (!token || typeof token !== 'string' || token.split('.').length !== 3) {
    return null;
  }
  const [h, p, s] = token.split('.');
  const expected = sign(`${h}.${p}`);
  if (!crypto.timingSafeEqual(Buffer.from(s), Buffer.from(expected))) {
    return null;
  }
  try {
    const payload = JSON.parse(fromBase64Url(p).toString('utf8'));
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

function authMiddleware(req, res, next) {
  try {
    const h = req.headers['authorization'] || '';
    const parts = h.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }
    const payload = verifyToken(parts[1]);
    if (!payload) return res.status(401).json({ error: 'Invalid or expired token' });
    req.user = payload;
    next();
  } catch (err) {
    console.error('auth error', err);
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

module.exports = { authMiddleware, createToken, verifyToken };
