import { CAMERA } from '../utils/constants';

export class Camera {
  x = 0;
  y = 0;
  width: number;
  height: number;

  constructor(w: number, h: number) {
    this.width = w;
    this.height = h;
  }

  follow(targetX: number, targetY: number) {
    const tx = targetX - this.width * CAMERA.OFFSET_X;
    const ty = targetY - this.height * CAMERA.OFFSET_Y;
    this.x += (tx - this.x) * CAMERA.SMOOTHING;
    this.y += (ty - this.y) * CAMERA.SMOOTHING;
  }

  apply(ctx: CanvasRenderingContext2D) {
    ctx.translate(-this.x, -this.y);
  }

  resize(w: number, h: number) {
    this.width = w;
    this.height = h;
  }
}
