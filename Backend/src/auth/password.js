const crypto = require('crypto');

function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
  return `${salt.toString('hex')}$${hash.toString('hex')}`;
}

function verifyPassword(password, stored) {
  if (!stored || !stored.includes('$')) return false;
  const [saltHex, hashHex] = stored.split('$');
  const salt = Buffer.from(saltHex, 'hex');
  const hash = Buffer.from(hashHex, 'hex');
  const test = crypto.pbkdf2Sync(password, salt, 100000, hash.length, 'sha256');
  return crypto.timingSafeEqual(hash, test);
}

module.exports = { hashPassword, verifyPassword };

