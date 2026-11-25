import { env } from '../config/env.js';

export const REFRESH_COOKIE_NAME = 'smms_refresh_token';
const REFRESH_COOKIE_PATH = `${env.apiBasePath}/auth`;

export function setRefreshCookie(res, token) {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.isProduction ? 'strict' : 'lax',
    path: REFRESH_COOKIE_PATH,
    maxAge: 30 * 24 * 60 * 60 * 1000
  });
}

export function clearRefreshCookie(res) {
  res.clearCookie(REFRESH_COOKIE_NAME, { path: REFRESH_COOKIE_PATH });
}
