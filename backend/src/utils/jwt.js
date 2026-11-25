import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env.js';

export function signAccessToken(payload) {
  return jwt.sign(payload, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpiresIn,
    issuer: 'smms-backend',
    audience: 'smms-client'
  });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.jwt.accessSecret, {
    issuer: 'smms-backend',
    audience: 'smms-client'
  });
}

export function generateRefreshToken() {
  const raw = crypto.randomBytes(64).toString('hex');
  const tokenHash = hashRefreshToken(raw);
  return { raw, tokenHash };
}

export function hashRefreshToken(rawToken) {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}
