import { TerrainPoint } from '../terrain/TerrainGenerator';
import { TERRAIN, COLORS } from '../utils/constants';

export class TerrainRenderer {
  draw(ctx: CanvasRenderingContext2D, points: TerrainPoint[], cameraX: number, cameraWidth: number) {
    if (points.length < 2) return;

    const left = cameraX - 200;
    const right = cameraX + cameraWidth + 200;
    const visible = points.filter(p => p.x >= left && p.x <= right);

    if (visible.length < 3) return;

    // Build a smooth path using quadratic curves through midpoints
    const buildSmoothPath = () => {
      ctx.moveTo(visible[0].x, visible[0].y);
      for (let i = 0; i < visible.length - 1; i++) {
        const curr = visible[i];
        const next = visible[i + 1];
        const mx = (curr.x + next.x) / 2;
        const my = (curr.y + next.y) / 2;
        ctx.quadraticCurveTo(curr.x, curr.y, mx, my);
      }
      const last = visible[visible.length - 1];
      ctx.lineTo(last.x, last.y);
    };

    // Fill below terrain (white, covers anything below)
    ctx.beginPath();
    buildSmoothPath();
    const last = visible[visible.length - 1];
    const first = visible[0];
    ctx.lineTo(last.x, last.y + 2000);
    ctx.lineTo(first.x, first.y + 2000);
    ctx.closePath();
    ctx.fillStyle = COLORS.BG;
    ctx.fill();

    // Draw the smooth terrain line
    ctx.beginPath();
    buildSmoothPath();
    ctx.strokeStyle = COLORS.TERRAIN;
    ctx.lineWidth = TERRAIN.LINE_WIDTH;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  }
}
