import { COLORS, PHYSICS } from '../utils/constants';
import { t } from '../utils/i18n';

export class HUD {
  /** Returns the bounding rect of the language switch button */
  langBtnRect = { x: 0, y: 0, w: 0, h: 0 };

  draw(ctx: CanvasRenderingContext2D, width: number, height: number, distance: number, bikeAngle: number) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const txt = t();

    // Top bar
    ctx.fillStyle = COLORS.UI_BAR;
    ctx.fillRect(0, 0, width, 32);

    // Bottom bar
    ctx.fillStyle = COLORS.UI_BAR;
    ctx.fillRect(0, height - 36, width, 36);

    // Distance counter (top right)
    ctx.font = 'bold 36px "Courier New", monospace';
    ctx.fillStyle = COLORS.TEXT;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText(txt.distance(distance), width - 20, 44);

    // --- Balance Indicator ---
    this.drawBalanceIndicator(ctx, width / 2, 62, bikeAngle);

    // Bottom controls hint
    ctx.font = '14px "Courier New", monospace';
    ctx.fillStyle = '#999';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(txt.controls, width / 2, height - 10);

    // Bottom left credit
    ctx.textAlign = 'left';
    ctx.fillStyle = '#AAA';
    ctx.font = '12px "Courier New", monospace';
    ctx.fillText(txt.creditLeft, 12, height - 10);

    // Bottom right credit
    ctx.textAlign = 'right';
    ctx.fillText(txt.creditRight, width - 12, height - 10);

    // Language switch button (top-left)
    this.drawLangButton(ctx, 12, 40);
  }

  private drawBalanceIndicator(ctx: CanvasRenderingContext2D, cx: number, cy: number, angle: number) {
    const txt = t();
    const maxAngle = PHYSICS.CRASH_ANGLE;
    const ratio = angle / maxAngle; // -1 to 1
    const clamped = Math.max(-1, Math.min(1, ratio));

    const barW = 160;
    const barH = 8;
    const x = cx - barW / 2;

    // Label
    ctx.font = '11px "Courier New", monospace';
    ctx.fillStyle = '#999';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(txt.balance, cx, cy - 6);

    // Background bar
    ctx.fillStyle = '#E8E8E8';
    ctx.beginPath();
    ctx.roundRect(x, cy, barW, barH, 4);
    ctx.fill();

    // Danger zones (red edges)
    const dangerW = barW * 0.15;
    ctx.fillStyle = 'rgba(255, 80, 80, 0.3)';
    ctx.beginPath();
    ctx.roundRect(x, cy, dangerW, barH, [4, 0, 0, 4]);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(x + barW - dangerW, cy, dangerW, barH, [0, 4, 4, 0]);
    ctx.fill();

    // Center mark
    ctx.fillStyle = '#CCC';
    ctx.fillRect(cx - 1, cy, 2, barH);

    // Indicator dot
    const dotX = cx + clamped * (barW / 2 - 6);
    const absClamped = Math.abs(clamped);

    // Color: green → yellow → red
    let dotColor: string;
    if (absClamped < 0.4) {
      dotColor = '#4CAF50';
    } else if (absClamped < 0.7) {
      dotColor = '#FF9800';
    } else {
      dotColor = '#F44336';
    }

    ctx.beginPath();
    ctx.arc(dotX, cy + barH / 2, 6, 0, Math.PI * 2);
    ctx.fillStyle = dotColor;
    ctx.fill();
    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  private drawLangButton(ctx: CanvasRenderingContext2D, x: number, y: number) {
    const txt = t();
    const label = txt.langSwitch;
    ctx.font = 'bold 13px "Courier New", monospace';
    const m = ctx.measureText(label);
    const pad = 8;
    const w = m.width + pad * 2;
    const h = 22;

    this.langBtnRect = { x, y, w, h };

    ctx.strokeStyle = '#AAA';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 4);
    ctx.stroke();
    ctx.fillStyle = '#FFF';
    ctx.fill();

    ctx.fillStyle = '#555';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x + w / 2, y + h / 2);
  }
}
