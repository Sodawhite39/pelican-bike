import { t } from '../utils/i18n';

declare const wx: any;

export class GameOverScreen {
  private playAgainRect = { x: 0, y: 0, w: 0, h: 0 };
  private shareRect = { x: 0, y: 0, w: 0, h: 0 };

  draw(ctx: CanvasRenderingContext2D, width: number, height: number, distance: number, alpha: number) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const txt = t();

    // Semi-transparent overlay
    ctx.fillStyle = `rgba(255, 255, 255, ${0.85 * alpha})`;
    ctx.fillRect(0, 0, width, height);

    if (alpha < 0.5) return;

    const cx = width / 2;
    const cy = height / 2 - 20;

    // GAME OVER title
    ctx.font = 'bold 40px sans-serif';
    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(txt.gameOver, cx, cy - 50);

    // Distance
    ctx.font = '22px sans-serif';
    ctx.fillText(txt.traveled(distance), cx, cy);

    // Buttons
    const btnW = 180;
    const btnH = 44;
    const btnGap = 16;
    const btnY = cy + 50;

    const paX = cx - btnW - btnGap / 2;
    this.playAgainRect = { x: paX, y: btnY, w: btnW, h: btnH };
    this.drawButton(ctx, paX, btnY, btnW, btnH, txt.playAgain);

    const shX = cx + btnGap / 2;
    this.shareRect = { x: shX, y: btnY, w: btnW, h: btnH };
    this.drawButton(ctx, shX, btnY, btnW, btnH, txt.shareWx);
  }

  private drawButton(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, text: string) {
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);
    ctx.fillStyle = '#FFF';
    ctx.fillRect(x + 1, y + 1, w - 2, h - 2);

    ctx.font = '16px sans-serif';
    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + w / 2, y + h / 2);
  }

  handleClick(x: number, y: number, distance: number): 'playAgain' | 'share' | null {
    if (this.hitTest(x, y, this.playAgainRect)) return 'playAgain';
    if (this.hitTest(x, y, this.shareRect)) {
      const txt = t();
      try {
        wx.shareAppMessage({
          title: txt.shareText(distance),
        });
      } catch (_e) {
        // Ignore if share API not available
      }
      return 'share';
    }
    return null;
  }

  private hitTest(x: number, y: number, rect: { x: number; y: number; w: number; h: number }): boolean {
    return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
  }
}
