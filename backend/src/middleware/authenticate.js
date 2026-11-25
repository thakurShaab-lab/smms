import { verifyAccessToken } from '../utils/jwt.js';
import { UnauthorizedError } from '../utils/errors.js';

export function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedError('Missing or malformed authorization header');
    }

    const payload = verifyAccessToken(token);
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      permissions: payload.permissions || [],
      profileId: payload.profileId ?? null
    };
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      next(new UnauthorizedError('Access token expired'));
      return;
    }
    if (error.name === 'JsonWebTokenError') {
      next(new UnauthorizedError('Invalid access token'));
      return;
    }
    next(error);
  }
}
