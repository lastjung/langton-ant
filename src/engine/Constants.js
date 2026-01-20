export const CONFIG = {
  GRID_MODES: {
    DISCOVERY: 15,
    SIMULATION: 200
  },
  DEFAULT_GRID: 200,
  SPEED_MULTIPLIER: 1,
  
  COLOR_PALETTES: [
    '#0B0E14', // 0: 검정색 (시작 색상 / R규칙)
    '#32D74B', // 1: 녹색 (L규칙)
    '#FF375F', // 2: Neon Pink
    '#FFD60A', // 3: Neon Yellow
    '#0A84FF', // 4: Neon Blue
    '#BF5AF2', // 5: Neon Purple
    '#FF9F0A', // 6: Neon Orange
    '#64D2FF', // 7: Cyan
  ],

  PRESETS: [
    { name: 'Classic (Standard)', rules: 'RL' },
    { name: 'Square', rules: 'RLR' },
    { name: 'Symmetrical', rules: 'LRRRRRLLR' },
    { name: 'Tower', rules: 'LLRR' },
    { name: 'Chaos Edge', rules: 'RLLR' }
  ],

  COLORS: {
    BACKGROUND: '#0B0E14', // 0번 색상과 동일
    ANT: '#FF375F', // 핑크색 개미 화살표
    TEXT: '#E0E0E0'
  },

  // Steps for Highway reveal (approximate)
  HIGHWAY_STEP_THRESHOLD: 10000,
};

export const DIRECTIONS = {
  UP: 0,
  RIGHT: 1,
  DOWN: 2,
  LEFT: 3,
};
