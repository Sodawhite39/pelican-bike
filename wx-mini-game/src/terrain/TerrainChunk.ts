import Matter from 'matter-js';
import { TerrainGenerator, TerrainPoint } from './TerrainGenerator';
import { TERRAIN } from '../utils/constants';
import { PhysicsWorld } from '../physics/PhysicsWorld';

export class TerrainManager {
  private generator: TerrainGenerator;
  private physics: PhysicsWorld;
  private chunks: Map<number, { points: TerrainPoint[]; bodies: Matter.Body[] }> = new Map();
  private chunkWidth = TERRAIN.CHUNK_WIDTH;

  allPoints: TerrainPoint[] = [];

  constructor(physics: PhysicsWorld, baseY: number) {
    this.generator = new TerrainGenerator(baseY);
    this.physics = physics;
  }

  update(cameraX: number, viewWidth: number) {
    const leftChunk = Math.floor((cameraX - this.chunkWidth) / this.chunkWidth);
    const rightChunk = Math.floor((cameraX + viewWidth + this.chunkWidth) / this.chunkWidth);

    // Add new chunks
    for (let i = leftChunk; i <= rightChunk; i++) {
      if (!this.chunks.has(i)) {
        this.createChunk(i);
      }
    }

    // Remove distant chunks
    for (const [idx] of this.chunks) {
      if (idx < leftChunk - 1 || idx > rightChunk + 1) {
        this.removeChunk(idx);
      }
    }

    // Rebuild allPoints for rendering
    this.rebuildPoints(leftChunk - 1, rightChunk + 1);
  }

  private createChunk(index: number) {
    const startX = index * this.chunkWidth;
    const endX = startX + this.chunkWidth;
    const points = this.generator.generate(startX, endX);
    const bodies = this.createBodies(points);
    bodies.forEach(b => this.physics.add(b));
    this.chunks.set(index, { points, bodies });
  }

  private removeChunk(index: number) {
    const chunk = this.chunks.get(index);
    if (chunk) {
      chunk.bodies.forEach(b => this.physics.remove(b));
      this.chunks.delete(index);
    }
  }

  private createBodies(points: TerrainPoint[]): Matter.Body[] {
    const bodies: Matter.Body[] = [];
    const depth = TERRAIN.DEPTH;

    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];

      const cx = (p1.x + p2.x) / 2;
      const cy = (p1.y + p2.y) / 2 + depth / 2;

      const verts = [
        { x: p1.x - cx, y: p1.y - cy },
        { x: p2.x - cx, y: p2.y - cy },
        { x: p2.x - cx, y: p2.y - cy + depth },
        { x: p1.x - cx, y: p1.y - cy + depth },
      ];

      const body = Matter.Bodies.fromVertices(cx, cy, [verts], {
        isStatic: true,
        friction: 0.8,
        restitution: 0.02,
        label: 'terrain',
        render: { visible: false },
      });

      if (body) {
        bodies.push(body);
      }
    }

    return bodies;
  }

  private rebuildPoints(fromIdx: number, toIdx: number) {
    this.allPoints = [];
    const indices = [...this.chunks.keys()].sort((a, b) => a - b);
    for (const idx of indices) {
      if (idx >= fromIdx && idx <= toIdx) {
        const chunk = this.chunks.get(idx)!;
        this.allPoints.push(...chunk.points);
      }
    }
  }

  getHeightAt(x: number): number {
    // Find the two points that bracket x
    for (let i = 0; i < this.allPoints.length - 1; i++) {
      const p1 = this.allPoints[i];
      const p2 = this.allPoints[i + 1];
      if (x >= p1.x && x <= p2.x) {
        const t = (x - p1.x) / (p2.x - p1.x);
        return p1.y + t * (p2.y - p1.y);
      }
    }
    return 400;
  }
}
