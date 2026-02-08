import { t } from '../utils/i18n';

declare const wx: any;

export class GameOverScreen {
  private playAgainRect = { x: 0, y: 0, w: 0, h: 0 };
  private shareRect = { x: 0, y: 0, w: 0, h: 0 };
  private reviveRect = { x: 0, y: 0, w: 0, h: 0 };
  private doubleRect = { x: 0, y: 0, w: 0, h: 0 };

  draw(
    ctx: CanvasRenderingContext2D,
    width: number, height: number,
    distance: number, bestDistance: number,
    alpha: number,
  ) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const txt = t();

    // Semi-transparent overlay
    ctx.fillStyle = `rgba(255, 255, 255, ${0.85 * alpha})`;
    ctx.fillRect(0, 0, width, height);

    if (alpha < 0.5) return;

    const cx = width / 2;
    const cy = height / 2 - 40;

    // GAME OVER title
    ctx.font = 'bold 40px sans-serif';
    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(txt.gameOver, cx, cy - 70);

    // Distance
    ctx.font = '22px sans-serif';
    ctx.fillText(txt.traveled(distance), cx, cy - 25);

    // Best distance
    ctx.font = '16px sans-serif';
    ctx.fillStyle = '#888';
    ctx.fillText(txt.bestRecord(bestDistance), cx, cy + 5);

    // New record indicator
    if (distance >= bestDistance && distance > 0) {
      ctx.font = 'bold 14px sans-serif';
      ctx.fillStyle = '#FF6B00';
      ctx.fillText(txt.newRecord, cx, cy + 28);
    }

    // Buttons layout
    const btnW = 170;
    const btnH = 40;
    const btnGap = 12;
    const row1Y = cy + 55;
    const row2Y = row1Y + btnH + btnGap;

    // Row 1: Revive + Double Score
    const revX = cx - btnW - btnGap / 2;
    this.reviveRect = { x: revX, y: row1Y, w: btnW, h: btnH };
    this.drawButton(ctx, revX, row1Y, btnW, btnH, txt.reviveAd, '#FF6B00');

    const dblX = cx + btnGap / 2;
    this.doubleRect = { x: dblX, y: row1Y, w: btnW, h: btnH };
    this.drawButton(ctx, dblX, row1Y, btnW, btnH, txt.doubleAd, '#FF6B00');

    // Row 2: Play Again + Share
    const paX = cx - btnW - btnGap / 2;
    this.playAgainRect = { x: paX, y: row2Y, w: btnW, h: btnH };
    this.drawButton(ctx, paX, row2Y, btnW, btnH, txt.playAgain, '#000');

    const shX = cx + btnGap / 2;
    this.shareRect = { x: shX, y: row2Y, w: btnW, h: btnH };
    this.drawButton(ctx, shX, row2Y, btnW, btnH, txt.shareWx, '#000');
  }

  private drawButton(
    ctx: CanvasRenderingContext2D,
    x: number, y: number, w: number, h: number,
    text: string, color: string,
  ) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);
    ctx.fillStyle = '#FFF';
    ctx.fillRect(x + 1, y + 1, w - 2, h - 2);

    ctx.font = '14px sans-serif';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + w / 2, y + h / 2);
  }

  handleClick(
    x: number, y: number,
    distance: number, bestDistance: number,
    deathCount: number,
  ): 'playAgain' | 'share' | 'revive' | 'double' | null {
    if (this.hitTest(x, y, this.reviveRect)) {
      return 'revive';
    }
    if (this.hitTest(x, y, this.doubleRect)) {
      return 'double';
    }
    if (this.hitTest(x, y, this.playAgainRect)) return 'playAgain';
    if (this.hitTest(x, y, this.shareRect)) {
      const txt = t();
      try {
        wx.shareAppMessage({
          title: txt.shareText(Math.max(distance, bestDistance)),
        });
      } catch (_e) {}
      return 'share';
    }
    return null;
  }

  private hitTest(x: number, y: number, rect: { x: number; y: number; w: number; h: number }): boolean {
    return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
  }
}
