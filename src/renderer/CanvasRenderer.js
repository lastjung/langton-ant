import { CONFIG } from '../engine/Constants.js';

export class CanvasRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  draw(engine) {
    const { ctx, canvas } = this;
    
    // Maintain square aspect ratio centered in the screen
    const size = Math.min(canvas.width, canvas.height);
    const cellSize = size / engine.size;
    const offsetX = (canvas.width - size) / 2;
    const offsetY = (canvas.height - size) / 2;

    // 1. 0번 공간 채우기 (검정색)
    ctx.fillStyle = CONFIG.COLOR_PALETTES[0];
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. 다른 상태 그리기 (1번, 2번...)
    for (let y = 0; y < engine.size; y++) {
      for (let x = 0; x < engine.size; x++) {
        const state = engine.grid[y * engine.size + x];
        if (state !== 0) {
          ctx.fillStyle = CONFIG.COLOR_PALETTES[state % CONFIG.COLOR_PALETTES.length];
          ctx.fillRect(offsetX + x * cellSize, offsetY + y * cellSize, cellSize, cellSize);
        }
      }
    }

    // Draw Grid Lines in Discovery mode for clarity
    if (engine.size < 50) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= engine.size; i++) {
            // Vertical
            ctx.beginPath();
            ctx.moveTo(offsetX + i * cellSize, offsetY);
            ctx.lineTo(offsetX + i * cellSize, offsetY + size);
            ctx.stroke();
            // Horizontal
            ctx.beginPath();
            ctx.moveTo(offsetX, offsetY + i * cellSize);
            ctx.lineTo(offsetX + size, offsetY + i * cellSize);
            ctx.stroke();
        }
    }

    // Draw Ant (Hollow Arrow shape so cells are visible underneath)
    const centerX = offsetX + engine.antPos.x * cellSize + cellSize / 2;
    const centerY = offsetY + engine.antPos.y * cellSize + cellSize / 2;
    const arrowSize = cellSize * 0.9;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate((engine.antDir * Math.PI) / 2);

    ctx.strokeStyle = CONFIG.COLORS.ANT;
    ctx.lineWidth = engine.size < 50 ? 2 : 1;
    ctx.lineJoin = 'round';
    
    // Ant Glow
    ctx.shadowBlur = engine.size < 50 ? 8 : 0;
    ctx.shadowColor = CONFIG.COLORS.ANT;

    // Draw triangle outline (Hollow)
    ctx.beginPath();
    ctx.moveTo(0, -arrowSize / 2); 
    ctx.lineTo(arrowSize / 2.5, arrowSize / 2); 
    ctx.lineTo(-arrowSize / 2.5, arrowSize / 2); 
    ctx.closePath();
    ctx.stroke();

    // Very subtle semi-transparent fill so it's still clickable/visible
    ctx.fillStyle = CONFIG.COLORS.ANT;
    ctx.globalAlpha = 0.2;
    ctx.fill();

    ctx.restore();
  }
}
