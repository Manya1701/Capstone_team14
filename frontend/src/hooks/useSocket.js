import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

export function useSocket() {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState(null);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL, { transports: ['websocket', 'polling'] });

    socketRef.current.on('connect', () => setConnected(true));
    socketRef.current.on('disconnect', () => setConnected(false));

    const events = ['scan:started', 'scan:completed', 'scan:failed', 'alert:new', 'port:blocked', 'port:allowed'];
    events.forEach((evt) => {
      socketRef.current.on(evt, (data) => setLastEvent({ type: evt, data, ts: Date.now() }));
    });

    return () => socketRef.current?.disconnect();
  }, []);

  return { socket: socketRef.current, connected, lastEvent };
}
