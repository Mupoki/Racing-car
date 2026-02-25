import React, { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Rect, Line } from 'react-konva';
import { Car } from './Car';
import { PlayerState, GAME_CONFIG } from '../types';

interface GameCanvasProps {
  players: PlayerState[];
  localPlayerId: string;
  onUpdate: (id: string, data: Partial<PlayerState>) => void;
  isCouchMode?: boolean;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  players,
  localPlayerId,
  onUpdate,
  isCouchMode = false,
}) => {
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  const keysPressed = useRef<Set<string>>(new Set());

  useEffect(() => {
    const handleResize = () => setDimensions({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    
    const handleKeyDown = (e: KeyboardEvent) => keysPressed.current.add(e.code);
    const handleKeyUp = (e: KeyboardEvent) => keysPressed.current.delete(e.code);
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Game Loop
  useEffect(() => {
    let animationFrameId: number;

    const update = () => {
      // Update Local Player 1
      const p1 = players.find(p => p.id === localPlayerId);
      if (p1) {
        let { x, y, rotation, speed } = p1;
        if (keysPressed.current.has('KeyW')) speed += GAME_CONFIG.ACCELERATION;
        if (keysPressed.current.has('KeyS')) speed -= GAME_CONFIG.ACCELERATION;
        if (keysPressed.current.has('KeyA')) rotation -= GAME_CONFIG.STEER_SPEED;
        if (keysPressed.current.has('KeyD')) rotation += GAME_CONFIG.STEER_SPEED;
        
        const result = calculatePhysics(x, y, rotation, speed);
        onUpdate(localPlayerId, result);
      }

      // Update Local Player 2 (Couch Mode)
      if (isCouchMode) {
        const p2 = players.find(p => p.id === 'couch_p2');
        if (p2) {
          let { x, y, rotation, speed } = p2;
          if (keysPressed.current.has('ArrowUp')) speed += GAME_CONFIG.ACCELERATION;
          if (keysPressed.current.has('ArrowDown')) speed -= GAME_CONFIG.ACCELERATION;
          if (keysPressed.current.has('ArrowLeft')) rotation -= GAME_CONFIG.STEER_SPEED;
          if (keysPressed.current.has('ArrowRight')) rotation += GAME_CONFIG.STEER_SPEED;
          
          const result = calculatePhysics(x, y, rotation, speed);
          onUpdate('couch_p2', result);
        }
      }

      animationFrameId = requestAnimationFrame(update);
    };

    const calculatePhysics = (x: number, y: number, rotation: number, speed: number) => {
      speed *= GAME_CONFIG.FRICTION;
      if (speed > GAME_CONFIG.MAX_SPEED) speed = GAME_CONFIG.MAX_SPEED;
      if (speed < -GAME_CONFIG.MAX_SPEED / 2) speed = -GAME_CONFIG.MAX_SPEED / 2;
      if (Math.abs(speed) < 0.05) speed = 0;

      const rad = (rotation * Math.PI) / 180;
      x += Math.cos(rad) * speed;
      y += Math.sin(rad) * speed;

      if (x < 0) x = GAME_CONFIG.WIDTH;
      if (x > GAME_CONFIG.WIDTH) x = 0;
      if (y < 0) y = GAME_CONFIG.HEIGHT;
      if (y > GAME_CONFIG.HEIGHT) y = 0;

      return { x, y, rotation, speed };
    };

    animationFrameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationFrameId);
  }, [localPlayerId, players, onUpdate]);

  return (
    <div className="w-full h-full bg-[#1a1a1a] overflow-hidden">
      <Stage width={dimensions.width} height={dimensions.height}>
        <Layer>
          {/* Track Background */}
          <Rect
            width={GAME_CONFIG.WIDTH}
            height={GAME_CONFIG.HEIGHT}
            fill="#111"
          />
          
          {/* Outer Track Boundary */}
          <Rect
            x={50}
            y={50}
            width={GAME_CONFIG.WIDTH - 100}
            height={GAME_CONFIG.HEIGHT - 100}
            stroke="#333"
            strokeWidth={80}
            cornerRadius={100}
          />

          {/* Inner Track Boundary */}
          <Rect
            x={250}
            y={250}
            width={GAME_CONFIG.WIDTH - 500}
            height={GAME_CONFIG.HEIGHT - 500}
            fill="#111"
            stroke="#333"
            strokeWidth={20}
            cornerRadius={50}
          />

          {/* Finish Line */}
          <Rect
            x={GAME_CONFIG.WIDTH / 2 - 5}
            y={50}
            width={10}
            height={200}
            fill="#fff"
            opacity={0.5}
          />
          
          {/* Grid Lines (Subtle) */}
          {[...Array(24)].map((_, i) => (
            <Line
              key={`v-${i}`}
              points={[i * 50, 0, i * 50, GAME_CONFIG.HEIGHT]}
              stroke="#222"
              strokeWidth={1}
            />
          ))}
          {[...Array(16)].map((_, i) => (
            <Line
              key={`h-${i}`}
              points={[0, i * 50, GAME_CONFIG.WIDTH, i * 50]}
              stroke="#222"
              strokeWidth={1}
            />
          ))}

          {/* Players */}
          {players.map(player => (
            <Car 
              key={player.id} 
              player={player} 
              isLocal={player.id === localPlayerId} 
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
};
