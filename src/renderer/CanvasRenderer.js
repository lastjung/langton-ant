import { CONFIG } from '../engine/Constants.js';

export class CanvasRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.zoom = 1.0;
    this.cameraPos = { x: 0.5, y: 0.5 };
    this.boardColor = '#0B0E14';
    this.cellColor = '#32D74B';

    // Auto-resize canvas to window
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  setBoardColor(color) {
    this.boardColor = color;
  }

  setCellColor(color) {
    this.cellColor = color;
  }

  // Rainbow colors for step ranges
  getRainbowColor(stepNum) {
    const colors = ['#FFD93D', '#FF6B6B', '#00D4FF', '#C77DFF', '#FF8C42', '#32D74B'];
    const rangeSize = 1000; // Change color every 1000 steps
    const colorIndex = Math.floor((stepNum - 1) / rangeSize) % colors.length;
    return colors[colorIndex];
  }

  draw(engine) {
    const { ctx, canvas, zoom, cameraPos, boardColor, cellColor } = this;
    const isRainbow = (cellColor === 'rainbow');
    
    // 1. Clear Background
    ctx.fillStyle = boardColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Calculate cell size and offset
    const screenMin = Math.min(canvas.width, canvas.height);
    const gridRenderSize = screenMin * zoom;
    const cellSize = gridRenderSize / engine.size;
    
    // Center the camera position on screen
    const offsetX = (canvas.width / 2) - (cameraPos.x * gridRenderSize);
    const offsetY = (canvas.height / 2) - (cameraPos.y * gridRenderSize);

    // 3. Draw Cells
    for (let y = 0; y < engine.size; y++) {
      for (let x = 0; x < engine.size; x++) {
        const index = y * engine.size + x;
        const state = engine.grid[index];
        if (state !== 0) {
          if (isRainbow) {
            const stepNum = engine.cellStepMap[index];
            ctx.fillStyle = this.getRainbowColor(stepNum);
          } else {
            ctx.fillStyle = cellColor;
          }
          ctx.fillRect(
            offsetX + x * cellSize,
            offsetY + y * cellSize,
            cellSize + 0.5,
            cellSize + 0.5
          );
        }
      }
    }

    // 4. Draw Grid Lines (only when zoomed in)
    if (cellSize > 8) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= engine.size; i++) {
        const p = i * cellSize;
        ctx.beginPath();
        ctx.moveTo(offsetX + p, offsetY);
        ctx.lineTo(offsetX + p, offsetY + gridRenderSize);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(offsetX, offsetY + p);
        ctx.lineTo(offsetX + gridRenderSize, offsetY + p);
        ctx.stroke();
      }
    }

    // 5. Draw Ant
    const antX = offsetX + engine.antPos.x * cellSize + cellSize / 2;
    const antY = offsetY + engine.antPos.y * cellSize + cellSize / 2;
    const arrowSize = cellSize * 0.8;

    ctx.save();
    ctx.translate(antX, antY);
    ctx.rotate((engine.antDir * Math.PI) / 2);

    ctx.strokeStyle = CONFIG.COLORS.ANT;
    ctx.lineWidth = engine.size < 50 ? 2 : 1;
    ctx.shadowBlur = engine.size < 50 ? 8 : 0;
    ctx.shadowColor = CONFIG.COLORS.ANT;

    ctx.beginPath();
    ctx.moveTo(0, -arrowSize / 2);
    ctx.lineTo(arrowSize / 2.5, arrowSize / 2);
    ctx.lineTo(-arrowSize / 2.5, arrowSize / 2);
    ctx.closePath();
    ctx.stroke();

    ctx.fillStyle = CONFIG.COLORS.ANT;
    ctx.globalAlpha = 0.3;
    ctx.fill();
    ctx.restore();
  }
}
