// Game constants
export const GAME_WIDTH = 900;
export const GAME_HEIGHT = 400;
export const GROUND_HEIGHT = 50;
export const GROUND_Y = GAME_HEIGHT - GROUND_HEIGHT;

// Knight constants
export const KNIGHT_WIDTH = 30;
export const KNIGHT_HEIGHT = 40;
export const KNIGHT_X = 100;
export const JUMP_VELOCITY = -12;
export const GRAVITY = 0.6;
export const DUCK_HEIGHT = 25;

// Obstacle constants
export const BAR_WIDTH = 20;
export const BAR_HEIGHT = 50;
export const BAR_MIN_GAP = 80;
export const BAR_MAX_GAP = 150;

export const DRAGON_WIDTH = 50;
export const DRAGON_HEIGHT = 30;
export const DRAGON_Y = GROUND_Y - 80;
export const DRAGON_MIN_GAP = 100;
export const DRAGON_MAX_GAP = 180;

// Speed settings
export const INITIAL_SPEED = 6;
export const SPEED_INCREMENT = 0.0005;
export const MAX_SPEED = 12;

// Colors - Cyberpunk theme
export const COLORS = {
  purple: '#9D4EDD',
  purpleLight: '#C77DFF',
  pink: '#FF006E',
  cyan: '#00F5FF',
  dark: '#0A0A0F',
  darker: '#1A1A2E',
  grid: '#4A148C',
};