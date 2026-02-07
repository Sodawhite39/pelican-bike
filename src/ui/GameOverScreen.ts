import { t } from '../utils/i18n';

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
    const cy = height / 2 - 30;

    // GAME OVER title
    ctx.font = 'bold 52px "Courier New", monospace';
    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`🦩  ${txt.gameOver}  🦩`, cx, cy - 60);

    // Distance
    ctx.font = '28px "Courier New", monospace';
    ctx.fillText(txt.traveled(distance), cx, cy);

    // Buttons
    const btnW = 230;
    const btnH = 50;
    const btnGap = 20;
    const btnY = cy + 60;

    const paX = cx - btnW - btnGap / 2;
    this.playAgainRect = { x: paX, y: btnY, w: btnW, h: btnH };
    this.drawButton(ctx, paX, btnY, btnW, btnH, txt.playAgain);

    const shX = cx + btnGap / 2;
    this.shareRect = { x: shX, y: btnY, w: btnW, h: btnH };
    this.drawButton(ctx, shX, btnY, btnW, btnH, `🐦 ${txt.shareX}`);
  }

  private drawButton(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, text: string) {
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);
    ctx.fillStyle = '#FFF';
    ctx.fillRect(x + 1, y + 1, w - 2, h - 2);

    ctx.font = '18px "Courier New", monospace';
    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + w / 2, y + h / 2);
  }

  handleClick(x: number, y: number, distance: number): 'playAgain' | 'share' | null {
    if (this.hitTest(x, y, this.playAgainRect)) return 'playAgain';
    if (this.hitTest(x, y, this.shareRect)) {
      const txt = t();
      const text = encodeURIComponent(txt.shareText(distance));
      window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
      return 'share';
    }
    return null;
  }

  private hitTest(x: number, y: number, rect: { x: number; y: number; w: number; h: number }): boolean {
    return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
  }
}
