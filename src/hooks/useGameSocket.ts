import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useGameStore } from '@/store/gameStore';
import type { GameState } from '@shared/index';

export function useGameSocket() {
  const socketRef = useRef<Socket | null>(null);
  const setState = useGameStore(state => state.setState);
  const setConnected = useGameStore(state => state.setConnected);
  const setError = useGameStore(state => state.setError);

  useEffect(() => {
    const socket = io('http://localhost:3001', {
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;
    (window as any).gameSocket = socket;

    socket.on('connect', () => {
      console.log('Connected to game server');
      setConnected(true);
      setError(null);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from game server');
      setConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error('Connection error:', err);
      setError('连接服务器失败，请检查后端是否启动');
      setConnected(false);
    });

    socket.on('game:state', (state: GameState) => {
      setState(state);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      delete (window as any).gameSocket;
    };
  }, [setState, setConnected, setError]);

  return socketRef;
}
