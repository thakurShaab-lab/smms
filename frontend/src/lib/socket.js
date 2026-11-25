import { io } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';

let socket = null;

export function connectSocket(accessToken) {
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    auth: { token: accessToken },
    withCredentials: true,
    transports: ['websocket', 'polling']
  });

  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
