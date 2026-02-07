import { fbm } from '../utils/math';
import { TERRAIN } from '../utils/constants';

export interface TerrainPoint {
  x: number;
  y: number;
}

export class TerrainGenerator {
  private baseY: number;

  constructor(baseY: number) {
    this.baseY = baseY;
  }

  generate(startX: number, endX: number): TerrainPoint[] {
    const points: TerrainPoint[] = [];
    const step = TERRAIN.SAMPLE_INTERVAL;

    for (let x = startX; x <= endX; x += step) {
      const distance = Math.max(0, x);
      const difficulty = Math.min(
        TERRAIN.MAX_DIFFICULTY,
        distance * TERRAIN.DIFFICULTY_RAMP
      );

      let y: number;

      if (x < TERRAIN.FLAT_ZONE) {
        // Flat starting zone
        y = this.baseY;
      } else {
        const t = (x - TERRAIN.FLAT_ZONE) / 200;
        const blend = Math.min(1, t);

        const base = fbm(x * 0.0015, 3) * TERRAIN.BASE_AMPLITUDE;
        const detail = fbm(x * 0.006 + 500, 2) * TERRAIN.DETAIL_AMPLITUDE;
        const hills = fbm(x * 0.0004 + 1000, 2) * 80 * (1 + difficulty);

        const terrainY = this.baseY + (base + detail + hills) * blend;
        y = terrainY;
      }

      points.push({ x, y });
    }
    return points;
  }
}
