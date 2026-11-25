let accessToken = null;
const listeners = new Set();

export function getAccessToken() {
  return accessToken;
}

export function setAccessToken(token) {
  accessToken = token;
  listeners.forEach((listener) => listener(token));
}

export function subscribeToken(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
