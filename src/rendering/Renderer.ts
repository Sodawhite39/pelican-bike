import { Camera } from './Camera';
import { TerrainRenderer } from './TerrainRenderer';
import { BikeRenderer } from './BikeRenderer';
import { PelicanRenderer } from './PelicanRenderer';
import { COLORS } from '../utils/constants';

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  camera: Camera;
  terrain = new TerrainRenderer();
  bike = new BikeRenderer();
  pelican = new PelicanRenderer();

  constructor(private canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!;
    this.camera = new Camera(canvas.width, canvas.height);
  }

  get context(): CanvasRenderingContext2D {
    return this.ctx;
  }

  clear() {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.fillStyle = COLORS.BG;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  beginWorld() {
    this.ctx.save();
    this.camera.apply(this.ctx);
  }

  endWorld() {
    this.ctx.restore();
  }

  resize(w: number, h: number) {
    this.canvas.width = w;
    this.canvas.height = h;
    this.camera.resize(w, h);
  }
}
