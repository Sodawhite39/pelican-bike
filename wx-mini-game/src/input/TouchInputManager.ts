/**
 * Touch-based input for WeChat Mini Game.
 * Implements the same interface as the web InputManager.
 *
 * Screen layout (landscape):
 * +------------------------------------------------------------------+
 * |                                                                    |
 * |  +--------+                                        +--------+     |
 * |  | LEAN L |        center tap = turn around        | LEAN R |     |
 * |  +--------+                                        +--------+     |
 * |  +--------+                                        +--------+     |
 * |  | BRAKE  |                                        | PEDAL  |     |
 * |  +--------+                                        +--------+     |
 * +------------------------------------------------------------------+
 */

interface TouchZone {
  action: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

interface TapInfo {
  x: number;
  y: number;
  consumed: boolean;
}

export class TouchInputManager {
  private actions = new Set<string>();
  private justPressed = new Set<string>();
  private screenW: number;
  private screenH: number;
  private zones: TouchZone[] = [];

  /** Most recent tap position (for UI click handling) */
  lastTap: TapInfo | null = null;

  /** Track touch start positions for tap detection */
  private touchStarts = new Map<number, { x: number; y: number; time: number }>();

  constructor(screenW: number, screenH: number) {
    this.screenW = screenW;
    this.screenH = screenH;
    this.buildZones();

    wx.onTouchStart((e: any) => this.handleTouchStart(e));
    wx.onTouchMove((e: any) => this.handleTouchMove(e));
    wx.onTouchEnd((e: any) => this.handleTouchEnd(e));
    wx.onTouchCancel((e: any) => this.handleTouchEnd(e));
  }

  private buildZones() {
    const w = this.screenW;
    const h = this.screenH;
    const zoneW = w * 0.2;    // 20% of screen width
    const zoneH = h * 0.25;   // 25% of screen height
    const margin = 0;

    this.zones = [
      // Right bottom = Pedal (ArrowUp)
      { action: 'ArrowUp', x: w - zoneW - margin, y: h - zoneH - margin, w: zoneW, h: zoneH },
      // Left bottom = Brake (ArrowDown)
      { action: 'ArrowDown', x: margin, y: h - zoneH - margin, w: zoneW, h: zoneH },
      // Right middle = Lean Right (ArrowRight)
      { action: 'ArrowRight', x: w - zoneW - margin, y: h - zoneH * 2 - margin, w: zoneW, h: zoneH },
      // Left middle = Lean Left (ArrowLeft)
      { action: 'ArrowLeft', x: margin, y: h - zoneH * 2 - margin, w: zoneW, h: zoneH },
    ];
  }

  private getActionForTouch(x: number, y: number): string | null {
    for (const zone of this.zones) {
      if (x >= zone.x && x <= zone.x + zone.w &&
          y >= zone.y && y <= zone.y + zone.h) {
        return zone.action;
      }
    }
    return null;
  }

  private handleTouchStart(e: any) {
    const touches = e.changedTouches || [];
    for (const touch of touches) {
      const x = touch.clientX;
      const y = touch.clientY;

      this.touchStarts.set(touch.identifier, { x, y, time: Date.now() });

      const action = this.getActionForTouch(x, y);
      if (action) {
        if (!this.actions.has(action)) {
          this.justPressed.add(action);
        }
        this.actions.add(action);
      }
    }
  }

  private handleTouchMove(e: any) {
    // Recompute active actions based on all current touches
    this.actions.clear();

    const touches = e.touches || [];
    for (const touch of touches) {
      const action = this.getActionForTouch(touch.clientX, touch.clientY);
      if (action) {
        this.actions.add(action);
      }
    }
  }

  private handleTouchEnd(e: any) {
    const changed = e.changedTouches || [];

    for (const touch of changed) {
      const startInfo = this.touchStarts.get(touch.identifier);
      this.touchStarts.delete(touch.identifier);

      // Remove actions for ended touches
      const action = this.getActionForTouch(touch.clientX, touch.clientY);
      // We'll recompute from remaining touches below

      // Tap detection: short duration + small movement
      if (startInfo) {
        const dt = Date.now() - startInfo.time;
        const dx = touch.clientX - startInfo.x;
        const dy = touch.clientY - startInfo.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dt < 300 && dist < 15) {
          const tapX = touch.clientX;
          const tapY = touch.clientY;

          // Check if tap is in center region (turn around)
          const centerLeft = this.screenW * 0.2;
          const centerRight = this.screenW * 0.8;
          if (tapX > centerLeft && tapX < centerRight) {
            this.justPressed.add('KeyZ');
          }

          // Also record tap for UI click handling (Space = any tap for start/restart)
          this.justPressed.add('Space');
          this.lastTap = { x: tapX, y: tapY, consumed: false };
        }
      }
    }

    // Recompute active actions from remaining touches
    this.actions.clear();
    const remaining = e.touches || [];
    for (const touch of remaining) {
      const a = this.getActionForTouch(touch.clientX, touch.clientY);
      if (a) this.actions.add(a);
    }
  }

  isDown(code: string): boolean {
    return this.actions.has(code);
  }

  wasPressed(code: string): boolean {
    return this.justPressed.has(code);
  }

  endFrame() {
    this.justPressed.clear();
    if (this.lastTap && this.lastTap.consumed) {
      this.lastTap = null;
    }
  }

  /** Get touch zone definitions for HUD rendering */
  getZones(): readonly TouchZone[] {
    return this.zones;
  }

  resize(w: number, h: number) {
    this.screenW = w;
    this.screenH = h;
    this.buildZones();
  }
}
