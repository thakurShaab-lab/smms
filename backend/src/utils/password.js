import argon2 from 'argon2';
import { env } from '../config/env.js';

export async function hashPassword(plainPassword) {
  return argon2.hash(plainPassword, {
    type: argon2.argon2id,
    memoryCost: env.argon2.memoryCost,
    timeCost: env.argon2.timeCost,
    parallelism: env.argon2.parallelism
  });
}

export async function verifyPassword(hash, plainPassword) {
  try {
    return await argon2.verify(hash, plainPassword);
  } catch {
    return false;
  }
}
