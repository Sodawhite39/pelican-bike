import { Camera } from './Camera';
import { TerrainRenderer } from './TerrainRenderer';
import { BikeRenderer } from './BikeRenderer';
import { PelicanRenderer } from './PelicanRenderer';
import { BackgroundRenderer } from './BackgroundRenderer';
import { COLORS } from '../utils/constants';

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private canvasWidth: number;
  private canvasHeight: number;
  camera: Camera;
  terrain = new TerrainRenderer();
  bike = new BikeRenderer();
  pelican = new PelicanRenderer();
  background = new BackgroundRenderer();

  constructor(canvas: any, width: number, height: number) {
    this.ctx = canvas.getContext('2d');
    this.canvasWidth = width;
    this.canvasHeight = height;
    this.camera = new Camera(width, height);
  }

  get context(): CanvasRenderingContext2D {
    return this.ctx;
  }

  clear() {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.fillStyle = COLORS.BG;
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
  }

  beginWorld() {
    this.ctx.save();
    this.camera.apply(this.ctx);
  }

  endWorld() {
    this.ctx.restore();
  }

  resize(w: number, h: number) {
    this.canvasWidth = w;
    this.canvasHeight = h;
    this.camera.resize(w, h);
  }

  get width() { return this.canvasWidth; }
  get height() { return this.canvasHeight; }
}
