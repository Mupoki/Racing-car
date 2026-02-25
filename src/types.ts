export interface PlayerState {
  id: string;
  x: number;
  y: number;
  rotation: number;
  color: string;
  name: string;
  speed: number;
}

export const GAME_CONFIG = {
  WIDTH: 1200,
  HEIGHT: 800,
  CAR_WIDTH: 40,
  CAR_HEIGHT: 20,
  ACCELERATION: 0.2,
  FRICTION: 0.98,
  STEER_SPEED: 3,
  MAX_SPEED: 8,
};

export type GameMode = 'menu' | 'multiplayer' | 'couch';
