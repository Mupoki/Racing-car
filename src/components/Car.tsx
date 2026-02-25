import React from 'react';
import { Rect, Group, Text } from 'react-konva';
import { PlayerState, GAME_CONFIG } from '../types';

interface CarProps {
  player: PlayerState;
  isLocal?: boolean;
}

export const Car: React.FC<CarProps> = ({ player, isLocal }) => {
  return (
    <Group x={player.x} y={player.y} rotation={player.rotation}>
      {/* Car Body */}
      <Rect
        width={GAME_CONFIG.CAR_WIDTH}
        height={GAME_CONFIG.CAR_HEIGHT}
        fill={player.color}
        cornerRadius={4}
        offsetX={GAME_CONFIG.CAR_WIDTH / 2}
        offsetY={GAME_CONFIG.CAR_HEIGHT / 2}
        stroke="#000"
        strokeWidth={2}
      />
      {/* Windshield */}
      <Rect
        width={10}
        height={16}
        x={10}
        y={-8}
        fill="rgba(255, 255, 255, 0.5)"
        cornerRadius={2}
      />
      {/* Player Name */}
      <Text
        text={player.name + (isLocal ? ' (You)' : '')}
        fontSize={12}
        fill="#000"
        y={-30}
        align="center"
        width={100}
        offsetX={50}
      />
    </Group>
  );
};
