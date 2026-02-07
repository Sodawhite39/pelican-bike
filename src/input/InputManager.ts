export class InputManager {
  private keys = new Set<string>();
  private justPressed = new Set<string>();

  constructor() {
    window.addEventListener('keydown', (e) => {
      if (!this.keys.has(e.code)) {
        this.justPressed.add(e.code);
      }
      this.keys.add(e.code);
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','KeyZ'].includes(e.code)) {
        e.preventDefault();
      }
    });
    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
    });
  }

  isDown(code: string): boolean {
    return this.keys.has(code);
  }

  wasPressed(code: string): boolean {
    return this.justPressed.has(code);
  }

  endFrame() {
    this.justPressed.clear();
  }
}
