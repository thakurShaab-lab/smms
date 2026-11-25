import { randomUUID, createHmac, timingSafeEqual } from 'crypto';
import path from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import { env } from '../config/env.js';

// Local disk equivalent of an S3/R2 bucket. Keys keep the exact same
// folder layout the app used with R2 (e.g. "students/3/faces/<uuid>.jpg",
// "media/photo/<uuid>.jpg") so nothing above this module needs to change.
export const UPLOAD_ROOT = path.resolve(process.cwd(), env.localStorage.uploadDir);

function resolveSafePath(key) {
  const resolved = path.resolve(UPLOAD_ROOT, key);
  if (!resolved.startsWith(UPLOAD_ROOT + path.sep) && resolved !== UPLOAD_ROOT) {
    throw new Error(`Refusing to access path outside upload root: ${key}`);
  }
  return resolved;
}

export function buildStorageKey({ prefix, originalFilename }) {
  const ext = path.extname(originalFilename || '').toLowerCase();
  const uniqueName = `${randomUUID()}${ext}`;
  return `${prefix}/${uniqueName}`;
}

export async function uploadBuffer({ key, buffer }) {
  const filePath = resolveSafePath(key);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, buffer);
  return key;
}

export async function deleteObject(key) {
  const filePath = resolveSafePath(key);
  await fs.unlink(filePath).catch((error) => {
    if (error.code !== 'ENOENT') throw error;
  });
}

export async function objectExists(key) {
  try {
    await fs.access(resolveSafePath(key));
    return true;
  } catch {
    return false;
  }
}

function sign(key, expiresAt) {
  return createHmac('sha256', env.localStorage.signingSecret).update(`${key}:${expiresAt}`).digest('hex');
}

export async function getSignedDownloadUrl(key, expiresIn = env.localStorage.signedUrlExpiresIn) {
  const expiresAt = Math.floor(Date.now() / 1000) + expiresIn;
  const signature = sign(key, expiresAt);
  const base = env.localStorage.publicBaseUrl.replace(/\/$/, '');
  return `${base}${env.apiBasePath}/files/${key}?expires=${expiresAt}&sig=${signature}`;
}

const HEX_64_PATTERN = /^[0-9a-f]{64}$/;

export function verifyFileSignature({ key, expires, sig }) {
  if (!key || !expires || !sig) return false;
  // Buffer.from(str, 'hex') silently ignores trailing/invalid characters
  // instead of rejecting them, so a signature must be validated as an exact
  // 64-char hex string BEFORE being parsed - otherwise "<validsig>anything"
  // would decode to the same bytes as "<validsig>" and pass the compare.
  if (!HEX_64_PATTERN.test(String(sig))) return false;

  const expiresAt = Number(expires);
  if (!Number.isFinite(expiresAt) || expiresAt < Math.floor(Date.now() / 1000)) return false;

  const expectedSignature = sign(key, expiresAt);
  const expectedBuffer = Buffer.from(expectedSignature, 'hex');
  const actualBuffer = Buffer.from(String(sig), 'hex');
  return timingSafeEqual(expectedBuffer, actualBuffer);
}

export function resolveFilePath(key) {
  const filePath = resolveSafePath(key);
  return existsSync(filePath) ? filePath : null;
}

export function ensureUploadRoot() {
  if (!existsSync(UPLOAD_ROOT)) {
    return fs.mkdir(UPLOAD_ROOT, { recursive: true });
  }
  return Promise.resolve();
}
