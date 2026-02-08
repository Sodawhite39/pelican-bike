import { COLORS, PHYSICS } from '../utils/constants';
import { t } from '../utils/i18n';

interface TouchZone {
  action: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

const ACTION_LABELS: Record<string, string> = {
  ArrowUp: '蹬车',
  ArrowDown: '刹车',
  ArrowLeft: '左倾',
  ArrowRight: '右倾',
};

export class HUD {
  draw(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    distance: number,
    bikeAngle: number,
    touchZones?: readonly TouchZone[],
  ) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const txt = t();

    // Top bar
    ctx.fillStyle = COLORS.UI_BAR;
    ctx.fillRect(0, 0, width, 24);

    // Bottom bar
    ctx.fillStyle = COLORS.UI_BAR;
    ctx.fillRect(0, height - 28, width, 28);

    // Distance counter (top right)
    ctx.font = 'bold 28px sans-serif';
    ctx.fillStyle = COLORS.TEXT;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText(txt.distance(distance), width - 16, 32);

    // Balance indicator
    this.drawBalanceIndicator(ctx, width / 2, 48, bikeAngle);

    // Bottom credits
    ctx.font = '10px sans-serif';
    ctx.fillStyle = '#999';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText(txt.creditLeft, 10, height - 8);
    ctx.textAlign = 'right';
    ctx.fillText(txt.creditRight, width - 10, height - 8);

    // Virtual touch buttons overlay
    if (touchZones) {
      this.drawTouchZones(ctx, touchZones);
    }
  }

  private drawBalanceIndicator(ctx: CanvasRenderingContext2D, cx: number, cy: number, angle: number) {
    const txt = t();
    const maxAngle = PHYSICS.CRASH_ANGLE;
    const ratio = angle / maxAngle;
    const clamped = Math.max(-1, Math.min(1, ratio));

    const barW = 120;
    const barH = 6;
    const x = cx - barW / 2;

    // Label
    ctx.font = '10px sans-serif';
    ctx.fillStyle = '#999';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(txt.balance, cx, cy - 4);

    // Background bar (use fillRect instead of roundRect for safety)
    ctx.fillStyle = '#E8E8E8';
    ctx.fillRect(x, cy, barW, barH);

    // Danger zones
    const dangerW = barW * 0.15;
    ctx.fillStyle = 'rgba(255, 80, 80, 0.3)';
    ctx.fillRect(x, cy, dangerW, barH);
    ctx.fillRect(x + barW - dangerW, cy, dangerW, barH);

    // Center mark
    ctx.fillStyle = '#CCC';
    ctx.fillRect(cx - 1, cy, 2, barH);

    // Indicator dot
    const dotX = cx + clamped * (barW / 2 - 5);
    const absClamped = Math.abs(clamped);

    let dotColor: string;
    if (absClamped < 0.4) dotColor = '#4CAF50';
    else if (absClamped < 0.7) dotColor = '#FF9800';
    else dotColor = '#F44336';

    ctx.beginPath();
    ctx.arc(dotX, cy + barH / 2, 5, 0, Math.PI * 2);
    ctx.fillStyle = dotColor;
    ctx.fill();
    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  private drawTouchZones(ctx: CanvasRenderingContext2D, zones: readonly TouchZone[]) {
    for (const zone of zones) {
      const label = ACTION_LABELS[zone.action] || zone.action;

      // Semi-transparent zone background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
      ctx.fillRect(zone.x, zone.y, zone.w, zone.h);

      // Zone border
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.lineWidth = 1;
      ctx.strokeRect(zone.x, zone.y, zone.w, zone.h);

      // Label
      ctx.font = 'bold 14px sans-serif';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, zone.x + zone.w / 2, zone.y + zone.h / 2);
    }
  }
}
