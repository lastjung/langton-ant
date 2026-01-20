import { DIRECTIONS } from './Constants.js';

export class AntEngine {
  constructor(size, rules = 'RL') {
    this.size = size;
    this.rules = rules;
    this.grid = new Uint8Array(size * size); // Default 0 (Black Background)
    
    this.antPos = {
      x: Math.floor(size / 2),
      y: Math.floor(size / 2)
    };
    this.antDir = DIRECTIONS.UP;
    this.steps = 0;
    this.elapsedTime = 0; // ms
    this.isPaused = true;
    this.history = []; // Max 3 steps for back function
  }

  setRules(newRules) {
    this.rules = newRules;
    this.reset();
  }

  // Pure logic for one step (Expanded for N-states)
  step() {
    const index = this.antPos.y * this.size + this.antPos.x;
    const currentState = this.grid[index];
    const currentRule = this.rules[currentState];

    // Save history before moving (Limited to 3)
    this.history.push({
        antPos: { ...this.antPos },
        antDir: this.antDir,
        cellIndex: index,
        cellState: currentState,
        steps: this.steps
    });
    if (this.history.length > 3) this.history.shift();

    // L: Turn Left, R: Turn Right
    if (currentRule === 'R') {
      this.antDir = (this.antDir + 1) % 4;
    } else {
      this.antDir = (this.antDir + 3) % 4;
    }

    // Move to next state (wrap around number of rules/colors)
    this.grid[index] = (currentState + 1) % this.rules.length;

    this.moveForward();
    this.steps++;
  }

  stepBack() {
    if (this.history.length === 0) return false;

    const prevState = this.history.pop();
    
    // Restore Ant
    this.antPos = prevState.antPos;
    this.antDir = prevState.antDir;
    this.steps = prevState.steps;
    
    // Restore Cell Color
    this.grid[prevState.cellIndex] = prevState.cellState;
    
    return true;
  }

  moveForward() {
    switch (this.antDir) {
      case DIRECTIONS.UP:    this.antPos.y--; break;
      case DIRECTIONS.RIGHT: this.antPos.x++; break;
      case DIRECTIONS.DOWN:  this.antPos.y++; break;
      case DIRECTIONS.LEFT:  this.antPos.x--; break;
    }

    // Wrap around or stop at boundaries (here we wrap)
    this.antPos.x = (this.antPos.x + this.size) % this.size;
    this.antPos.y = (this.antPos.y + this.size) % this.size;
  }

  reset() {
    this.grid.fill(0); // Reset to 0 (Black Background)
    this.antPos = {
      x: Math.floor(this.size / 2),
      y: Math.floor(this.size / 2)
    };
    this.antDir = DIRECTIONS.UP;
    this.steps = 0;
    this.elapsedTime = 0;
    this.history = [];
  }
}
