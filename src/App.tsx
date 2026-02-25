import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Menu } from './components/Menu';
import { GameCanvas } from './components/GameCanvas';
import { PlayerState, GameMode } from './types';
import { ArrowLeft } from 'lucide-react';

export default function App() {
  const [mode, setMode] = useState<GameMode>('menu');
  const [players, setPlayers] = useState<PlayerState[]>([]);
  const [localId, setLocalId] = useState<string>('');
  const socketRef = useRef<WebSocket | null>(null);

  const connectWebSocket = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socket = new WebSocket(`${protocol}//${window.location.host}`);
    socketRef.current = socket;

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      switch (message.type) {
        case 'init':
          setLocalId(message.id);
          setPlayers(Object.values(message.players));
          break;
        case 'player_joined':
          setPlayers(prev => [...prev, message.player]);
          break;
        case 'player_updated':
          setPlayers(prev => prev.map(p => p.id === message.id ? { ...p, ...message.data } : p));
          break;
        case 'player_left':
          setPlayers(prev => prev.filter(p => p.id !== message.id));
          break;
      }
    };

    return () => socket.close();
  }, []);

  useEffect(() => {
    if (mode === 'multiplayer') {
      return connectWebSocket();
    } else if (mode === 'couch') {
      const p1: PlayerState = {
        id: 'couch_p1',
        x: 300,
        y: 400,
        rotation: 0,
        color: '#10b981',
        name: 'Player 1',
        speed: 0
      };
      const p2: PlayerState = {
        id: 'couch_p2',
        x: 500,
        y: 400,
        rotation: 0,
        color: '#3b82f6',
        name: 'Player 2',
        speed: 0
      };
      setLocalId('couch_p1');
      setPlayers([p1, p2]);
    } else {
      setPlayers([]);
      setLocalId('');
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    }
  }, [mode, connectWebSocket]);

  const handleUpdate = useCallback((id: string, data: Partial<PlayerState>) => {
    setPlayers(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
    
    if (mode === 'multiplayer' && id === localId && socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'update', data }));
    }
  }, [mode, localId]);

  if (mode === 'menu') {
    return <Menu onSelectMode={setMode} />;
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <button
        onClick={() => setMode('menu')}
        className="absolute top-6 left-6 z-50 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white p-3 rounded-full transition-all border border-white/10 group"
      >
        <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
      </button>

      <div className="absolute top-6 right-6 z-50 flex flex-col items-end gap-2">
        <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-white font-mono text-xs uppercase tracking-widest">
          {mode === 'multiplayer' ? 'Online Mode' : 'Couch Mode'}
        </div>
        <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-white font-mono text-xs">
          {players.length} Players Racing
        </div>
      </div>

      <GameCanvas
        players={players}
        localPlayerId={localId}
        onUpdate={handleUpdate}
        isCouchMode={mode === 'couch'}
      />
    </div>
  );
}
