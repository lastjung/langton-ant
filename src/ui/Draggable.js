export class Draggable {
  constructor(element, handle) {
    this.element = element;
    this.handle = handle || element;
    
    this.offsetX = 0;
    this.offsetY = 0;
    this.isDragging = false;

    this.handle.style.cursor = 'grab';
    this.init();
  }

  init() {
    this.handle.addEventListener('mousedown', (e) => this.dragStart(e));
    window.addEventListener('mousemove', (e) => this.drag(e));
    window.addEventListener('mouseup', () => this.dragEnd());

    // Touch support
    this.handle.addEventListener('touchstart', (e) => this.dragStart(e.touches[0]));
    window.addEventListener('touchmove', (e) => this.drag(e.touches[0]));
    window.addEventListener('touchend', () => this.dragEnd());
  }

  dragStart(e) {
    if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
    
    this.isDragging = true;
    this.handle.style.cursor = 'grabbing';
    
    const rect = this.element.getBoundingClientRect();
    this.offsetX = e.clientX - rect.left;
    this.offsetY = e.clientY - rect.top;
  }

  drag(e) {
    if (!this.isDragging) return;

    let x = e.clientX - this.offsetX;
    let y = e.clientY - this.offsetY;

    // Boundary check so it doesn't leave the screen
    x = Math.max(0, Math.min(x, window.innerWidth - this.element.offsetWidth));
    y = Math.max(0, Math.min(y, window.innerHeight - this.element.offsetHeight));

    this.element.style.left = `${x}px`;
    this.element.style.top = `${y}px`;
    this.element.style.bottom = 'auto'; // Disable fixed bottom
    this.element.style.transform = 'none'; // Disable center transform
  }

  dragEnd() {
    this.isDragging = false;
    this.handle.style.cursor = 'grab';
  }
}
