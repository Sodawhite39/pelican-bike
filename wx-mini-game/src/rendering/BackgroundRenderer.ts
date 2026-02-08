import { fbm, noise1D } from '../utils/math';

interface Cloud {
  x: number;
  y: number;
  w: number;
  h: number;
  speed: number;
}

interface Bird {
  x: number;
  y: number;
  phase: number;
  speed: number;
}

interface Tree {
  x: number;
  h: number;
}

export class BackgroundRenderer {
  private clouds: Cloud[] = [];
  private birds: Bird[] = [];
  private trees: Tree[] = [];
  private time = 0;
  private lastSeed = 0;

  constructor() {
    this.generateDecorations();
  }

  private generateDecorations() {
    // Clouds: spread across a wide range
    for (let i = 0; i < 20; i++) {
      this.clouds.push({
        x: (i - 5) * 600 + Math.random() * 400,
        y: 50 + Math.random() * 150,
        w: 40 + Math.random() * 80,
        h: 15 + Math.random() * 20,
        speed: 0.1 + Math.random() * 0.15,
      });
    }

    // Birds: small flocks
    for (let i = 0; i < 8; i++) {
      this.birds.push({
        x: (i - 2) * 1500 + Math.random() * 1000,
        y: 80 + Math.random() * 120,
        phase: Math.random() * Math.PI * 2,
        speed: 0.3 + Math.random() * 0.4,
      });
    }

    // Trees: along the terrain
    for (let i = 0; i < 40; i++) {
      this.trees.push({
        x: i * 300 + Math.random() * 200,
        h: 20 + Math.random() * 35,
      });
    }
  }

  draw(
    ctx: CanvasRenderingContext2D,
    cameraX: number,
    cameraY: number,
    screenW: number,
    screenH: number,
    baseY: number,
  ) {
    this.time += 0.016; // ~60fps

    // Ensure enough decorations exist ahead
    this.ensureDecorations(cameraX, screenW);

    // Layer 0: Sky gradient (screen space, before camera transform)
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const grad = ctx.createLinearGradient(0, 0, 0, screenH * 0.7);
    grad.addColorStop(0, '#EEF2F7');
    grad.addColorStop(1, '#FFFFFF');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, screenW, screenH);
    ctx.restore();

    // Layer 1: Far mountains (parallax 0.1)
    this.drawMountains(ctx, cameraX, cameraY, screenW, screenH, baseY, 0.1, '#E0E0E0', 60, 0.0003);

    // Layer 2: Near hills (parallax 0.25)
    this.drawMountains(ctx, cameraX, cameraY, screenW, screenH, baseY, 0.25, '#D0D0D0', 40, 0.0008);

    // Layer 3: Clouds (parallax 0.15)
    this.drawClouds(ctx, cameraX, cameraY, screenW, screenH, baseY);

    // Layer 4: Trees (parallax 0.4)
    this.drawTrees(ctx, cameraX, cameraY, screenW, baseY);

    // Layer 5: Birds (parallax 0.2)
    this.drawBirds(ctx, cameraX, cameraY, screenW, baseY);
  }

  private drawMountains(
    ctx: CanvasRenderingContext2D,
    camX: number, camY: number,
    screenW: number, screenH: number,
    baseY: number,
    parallax: number,
    color: string,
    amplitude: number,
    frequency: number,
  ) {
    const offsetX = camX * parallax;
    const offsetY = camY * parallax;
    const startX = Math.floor((camX - 100) / 20) * 20;
    const endX = startX + screenW + 200;

    ctx.beginPath();
    let first = true;
    for (let x = startX; x <= endX; x += 20) {
      const wx = x - offsetX;
      const noiseVal = fbm(x * frequency + 100, 3);
      const my = baseY - amplitude - noiseVal * amplitude * 1.5 - offsetY;
      if (first) { ctx.moveTo(wx - camX, my - camY); first = false; }
      else ctx.lineTo(wx - camX, my - camY);
    }
    // Close below
    ctx.lineTo(endX - offsetX - camX, baseY + 500 - offsetY - camY);
    ctx.lineTo(startX - offsetX - camX, baseY + 500 - offsetY - camY);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }

  private drawClouds(
    ctx: CanvasRenderingContext2D,
    camX: number, camY: number,
    screenW: number, screenH: number,
    baseY: number,
  ) {
    const parallax = 0.15;
    const left = camX - 200;
    const right = camX + screenW + 200;

    for (const cloud of this.clouds) {
      const cx = cloud.x + this.time * cloud.speed * 10;
      const worldX = cx;
      const screenX = worldX - camX * parallax;

      if (screenX < -200 || screenX > screenW + 200) continue;

      const screenY = cloud.y - camY * parallax * 0.3;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      // Draw cloud as overlapping ellipses
      ctx.beginPath();
      ctx.ellipse(screenX - camX * (1 - parallax), screenY - camY * (1 - parallax),
        cloud.w * 0.5, cloud.h, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(screenX - camX * (1 - parallax) + cloud.w * 0.25,
        screenY - camY * (1 - parallax) - cloud.h * 0.3,
        cloud.w * 0.4, cloud.h * 0.8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(screenX - camX * (1 - parallax) - cloud.w * 0.2,
        screenY - camY * (1 - parallax) - cloud.h * 0.2,
        cloud.w * 0.35, cloud.h * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawTrees(
    ctx: CanvasRenderingContext2D,
    camX: number, camY: number,
    screenW: number,
    baseY: number,
  ) {
    const parallax = 0.4;
    for (const tree of this.trees) {
      const wx = tree.x * (1 - parallax) + camX * parallax;
      const screenX = tree.x - camX * parallax;
      if (screenX < -50 || screenX > screenW + 50) continue;

      const treeBaseY = baseY - 15;
      const th = tree.h;

      // Trunk
      ctx.fillStyle = '#C0C0C0';
      ctx.fillRect(screenX - 2 - camX * (1 - parallax), treeBaseY - th * 0.3 - camY * (1 - parallax), 4, th * 0.3);

      // Canopy (triangle)
      ctx.beginPath();
      ctx.moveTo(screenX - camX * (1 - parallax), treeBaseY - th - camY * (1 - parallax));
      ctx.lineTo(screenX - th * 0.4 - camX * (1 - parallax), treeBaseY - th * 0.3 - camY * (1 - parallax));
      ctx.lineTo(screenX + th * 0.4 - camX * (1 - parallax), treeBaseY - th * 0.3 - camY * (1 - parallax));
      ctx.closePath();
      ctx.fillStyle = '#CACACA';
      ctx.fill();
    }
  }

  private drawBirds(
    ctx: CanvasRenderingContext2D,
    camX: number, camY: number,
    screenW: number,
    baseY: number,
  ) {
    const parallax = 0.2;
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';

    for (const bird of this.birds) {
      const bx = bird.x + this.time * bird.speed * 20;
      const screenX = bx - camX * parallax;
      if (screenX < -50 || screenX > screenW + 50) continue;

      const screenY = bird.y - camY * parallax * 0.3;
      const wingFlap = Math.sin(this.time * 8 + bird.phase) * 4;

      const dx = screenX - camX * (1 - parallax);
      const dy = screenY - camY * (1 - parallax);

      // V-shape bird
      ctx.beginPath();
      ctx.moveTo(dx - 6, dy + wingFlap);
      ctx.lineTo(dx, dy);
      ctx.lineTo(dx + 6, dy + wingFlap);
      ctx.stroke();
    }
  }

  private ensureDecorations(camX: number, screenW: number) {
    const rightEdge = camX + screenW + 2000;

    // Add more clouds ahead
    const lastCloud = this.clouds[this.clouds.length - 1];
    if (lastCloud && lastCloud.x < rightEdge) {
      for (let i = 0; i < 5; i++) {
        this.clouds.push({
          x: lastCloud.x + 300 + i * 600 + Math.random() * 400,
          y: 50 + Math.random() * 150,
          w: 40 + Math.random() * 80,
          h: 15 + Math.random() * 20,
          speed: 0.1 + Math.random() * 0.15,
        });
      }
    }

    // Add more trees ahead
    const lastTree = this.trees[this.trees.length - 1];
    if (lastTree && lastTree.x < rightEdge) {
      for (let i = 0; i < 10; i++) {
        this.trees.push({
          x: lastTree.x + 100 + i * 300 + Math.random() * 200,
          h: 20 + Math.random() * 35,
        });
      }
    }

    // Add more birds
    const lastBird = this.birds[this.birds.length - 1];
    if (lastBird && lastBird.x < rightEdge) {
      for (let i = 0; i < 3; i++) {
        this.birds.push({
          x: lastBird.x + 500 + i * 1500 + Math.random() * 1000,
          y: 80 + Math.random() * 120,
          phase: Math.random() * Math.PI * 2,
          speed: 0.3 + Math.random() * 0.4,
        });
      }
    }

    // Trim far-left decorations to save memory
    const leftEdge = camX - 3000;
    this.clouds = this.clouds.filter(c => c.x > leftEdge);
    this.trees = this.trees.filter(t => t.x > leftEdge);
    this.birds = this.birds.filter(b => b.x > leftEdge);
  }
}
