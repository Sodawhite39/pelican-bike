import { PhysicsWorld } from './physics/PhysicsWorld';
import { TerrainManager } from './terrain/TerrainChunk';
import { PelicanBike } from './entities/PelicanBike';
import { Renderer } from './rendering/Renderer';
import { InputManager } from './input/InputManager';
import { HUD } from './ui/HUD';
import { GameOverScreen } from './ui/GameOverScreen';
import { PHYSICS } from './utils/constants';
import { t, toggleLang } from './utils/i18n';

enum GameState {
  READY,
  PLAYING,
  CRASHING,
  GAME_OVER,
}

export class Game {
  private canvas: HTMLCanvasElement;
  private renderer: Renderer;
  private physics: PhysicsWorld;
  private terrain: TerrainManager;
  private pelicanBike!: PelicanBike;
  private input: InputManager;
  private hud: HUD;
  private gameOver: GameOverScreen;
  private state: GameState = GameState.READY;
  private gameOverAlpha = 0;
  private baseY: number;
  private lastTime = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.renderer = new Renderer(canvas);
    this.physics = new PhysicsWorld();
    this.input = new InputManager();
    this.hud = new HUD();
    this.gameOver = new GameOverScreen();

    this.baseY = canvas.height * 0.6;
    this.terrain = new TerrainManager(this.physics, this.baseY);

    this.setupCollision();
    this.reset();

    // Click handler
    canvas.addEventListener('click', (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (canvas.width / rect.width);
      const y = (e.clientY - rect.top) * (canvas.height / rect.height);

      // Language switch button
      const lb = this.hud.langBtnRect;
      if (x >= lb.x && x <= lb.x + lb.w && y >= lb.y && y <= lb.y + lb.h) {
        toggleLang();
        return;
      }

      // Game over buttons
      if (this.state === GameState.GAME_OVER) {
        const result = this.gameOver.handleClick(x, y, this.pelicanBike.distance);
        if (result === 'playAgain') {
          this.reset();
        }
      }
    });
  }

  private setupCollision() {
    this.physics.onCollision((pairs) => {
      if (this.state !== GameState.PLAYING) return;

      for (const pair of pairs) {
        const labels = [pair.bodyA.label, pair.bodyB.label];
        const hasTerrain = labels.some(l => l === 'terrain');
        const hasPelican = labels.some(l => l === 'pelicanHead' || l === 'pelicanBody');

        if (hasTerrain && hasPelican) {
          this.startCrash();
          return;
        }
      }
    });
  }

  reset() {
    // Create fresh physics world to avoid stale event listeners
    this.physics = new PhysicsWorld();
    this.setupCollision();

    this.baseY = this.canvas.height * 0.6;
    this.terrain = new TerrainManager(this.physics, this.baseY);

    const startX = 150;
    this.terrain.update(0, this.canvas.width);
    const actualGroundY = this.terrain.getHeightAt(startX) || this.baseY;

    this.pelicanBike = new PelicanBike(this.physics, startX, actualGroundY);
    this.state = GameState.READY;
    this.gameOverAlpha = 0;

    // Position camera immediately
    this.renderer.camera.x = this.pelicanBike.position.x - this.canvas.width * 0.35;
    this.renderer.camera.y = this.pelicanBike.position.y - this.canvas.height * 0.4;
  }

  private startCrash() {
    if (this.state !== GameState.PLAYING) return;
    this.state = GameState.CRASHING;
    this.pelicanBike.triggerCrash();
  }

  update(time: number) {
    const dt = Math.min(time - this.lastTime, 33);
    this.lastTime = time;

    // Input handling
    if (this.state === GameState.READY) {
      if (this.input.isDown('ArrowUp') || this.input.wasPressed('Space')) {
        this.state = GameState.PLAYING;
      }
    }

    if (this.state === GameState.PLAYING) {
      if (this.input.isDown('ArrowUp')) {
        this.pelicanBike.pedal();
      }
      if (this.input.isDown('ArrowDown')) {
        this.pelicanBike.brake();
      }
      if (this.input.isDown('ArrowLeft')) {
        this.pelicanBike.leanLeft();
      }
      if (this.input.isDown('ArrowRight')) {
        this.pelicanBike.leanRight();
      }
      if (this.input.wasPressed('KeyZ')) {
        this.pelicanBike.turnAround();
      }

      // Check crash by angle
      if (this.pelicanBike.shouldCrash()) {
        this.startCrash();
      }
    }

    if (this.state === GameState.CRASHING) {
      this.pelicanBike.update(dt);
      if (this.pelicanBike.isSettled()) {
        this.state = GameState.GAME_OVER;
      }
    }

    if (this.state === GameState.GAME_OVER) {
      this.gameOverAlpha = Math.min(1, this.gameOverAlpha + 0.03);
      if (this.input.wasPressed('Space')) {
        this.reset();
      }
    }

    // Physics step
    if (this.state !== GameState.GAME_OVER) {
      this.physics.update(dt);
      this.pelicanBike.update(dt);
    }

    // Update terrain chunks
    this.terrain.update(this.renderer.camera.x, this.canvas.width);

    // Camera follow
    this.renderer.camera.follow(this.pelicanBike.position.x, this.pelicanBike.position.y);

    this.input.endFrame();
  }

  draw() {
    this.renderer.clear();

    // World space drawing
    this.renderer.beginWorld();

    this.renderer.terrain.draw(
      this.renderer.context,
      this.terrain.allPoints,
      this.renderer.camera.x,
      this.canvas.width
    );

    this.renderer.bike.draw(
      this.renderer.context,
      this.pelicanBike.bike,
      this.pelicanBike.facingRight
    );

    this.renderer.pelican.draw(this.renderer.context, this.pelicanBike);

    this.renderer.endWorld();

    // Screen space UI
    this.hud.draw(this.renderer.context, this.canvas.width, this.canvas.height, this.pelicanBike.distance, this.pelicanBike.angle);

    // Ready state hint
    if (this.state === GameState.READY) {
      const ctx = this.renderer.context;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.font = '24px "Courier New", monospace';
      ctx.fillStyle = '#666';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(t().startHint, this.canvas.width / 2, this.canvas.height * 0.2);
    }

    // Game over overlay
    if (this.state === GameState.GAME_OVER) {
      this.gameOver.draw(this.renderer.context, this.canvas.width, this.canvas.height, this.pelicanBike.distance, this.gameOverAlpha);
    }
  }

  resize(w: number, h: number) {
    this.renderer.resize(w, h);
    this.baseY = h * 0.6;
  }
}
