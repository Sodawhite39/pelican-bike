import { PhysicsWorld } from './physics/PhysicsWorld';
import { TerrainManager } from './terrain/TerrainChunk';
import { PelicanBike } from './entities/PelicanBike';
import { Renderer } from './rendering/Renderer';
import { TouchInputManager } from './input/TouchInputManager';
import { SoundManager } from './audio/SoundManager';
import { AdManager } from './ads/AdManager';
import { HUD } from './ui/HUD';
import { GameOverScreen } from './ui/GameOverScreen';
import { t } from './utils/i18n';

enum GameState {
  READY,
  PLAYING,
  CRASHING,
  GAME_OVER,
}

export class Game {
  private renderer: Renderer;
  private physics: PhysicsWorld;
  private terrain: TerrainManager;
  private pelicanBike!: PelicanBike;
  private input: TouchInputManager;
  private sound: SoundManager;
  private ads: AdManager;
  private hud: HUD;
  private gameOver: GameOverScreen;
  private state: GameState = GameState.READY;
  private gameOverAlpha = 0;
  private baseY: number;
  private lastTime = 0;
  private screenW: number;
  private screenH: number;
  private bestDistance = 0;
  private gameOverSoundPlayed = false;
  private deathCount = 0;
  private hasRevived = false;
  private interstitialInterval = 3;

  constructor(canvas: any, screenW: number, screenH: number) {
    this.screenW = screenW;
    this.screenH = screenH;
    this.renderer = new Renderer(canvas, screenW, screenH);
    this.physics = new PhysicsWorld();
    this.input = new TouchInputManager(screenW, screenH);
    this.sound = new SoundManager();
    this.ads = new AdManager();
    this.hud = new HUD();
    this.gameOver = new GameOverScreen();

    // Load best distance from storage
    try {
      const saved = (wx as any).getStorageSync('bestDistance');
      if (saved) this.bestDistance = Number(saved);
    } catch (_e) {}

    this.baseY = screenH * 0.6;
    this.terrain = new TerrainManager(this.physics, this.baseY);

    this.setupCollision();
    this.reset();

    // Enable WeChat share menu
    try {
      (wx as any).showShareMenu({
        withShareTicket: true,
        menus: ['shareAppMessage', 'shareTimeline'],
      });
      (wx as any).onShareAppMessage(() => ({
        title: '鹈鹕骑自行车 - 物理平衡小游戏',
      }));
    } catch (_e) {
      // Ignore if wx API not available
    }
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
    this.physics = new PhysicsWorld();
    this.setupCollision();

    this.baseY = this.screenH * 0.6;
    this.terrain = new TerrainManager(this.physics, this.baseY);

    const startX = 150;
    this.terrain.update(0, this.screenW);
    const actualGroundY = this.terrain.getHeightAt(startX) || this.baseY;

    this.pelicanBike = new PelicanBike(this.physics, startX, actualGroundY);
    this.state = GameState.READY;
    this.gameOverAlpha = 0;
    this.hasRevived = false;

    this.renderer.camera.x = this.pelicanBike.position.x - this.screenW * 0.35;
    this.renderer.camera.y = this.pelicanBike.position.y - this.screenH * 0.4;
  }

  private startCrash() {
    if (this.state !== GameState.PLAYING) return;
    this.state = GameState.CRASHING;
    this.pelicanBike.triggerCrash();
    this.sound.playCrash();
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
        this.sound.playPedal();
      }
      if (this.input.isDown('ArrowDown')) {
        this.pelicanBike.brake();
        this.sound.playBrake();
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

      // Update wind sound based on speed
      this.sound.updateWind(this.pelicanBike.speed);

      if (this.pelicanBike.shouldCrash()) {
        this.startCrash();
      }
    }

    if (this.state === GameState.CRASHING) {
      this.pelicanBike.update(dt);
      this.sound.stopWind();
      if (this.pelicanBike.isSettled()) {
        this.state = GameState.GAME_OVER;
        this.gameOverSoundPlayed = false;
        this.deathCount++;

        // Save best distance
        const dist = this.pelicanBike.distance;
        if (dist > this.bestDistance) {
          this.bestDistance = dist;
          try { (wx as any).setStorageSync('bestDistance', this.bestDistance); } catch (_e) {}
        }
      }
    }

    if (this.state === GameState.GAME_OVER) {
      this.gameOverAlpha = Math.min(1, this.gameOverAlpha + 0.03);

      if (!this.gameOverSoundPlayed && this.gameOverAlpha > 0.3) {
        this.sound.playGameOver();
        this.gameOverSoundPlayed = true;
      }

      // Handle tap for game over UI
      const tap = this.input.lastTap;
      if (tap && !tap.consumed) {
        const result = this.gameOver.handleClick(
          tap.x, tap.y,
          this.pelicanBike.distance,
          this.bestDistance,
          this.deathCount,
        );
        tap.consumed = true;
        if (result === 'playAgain') {
          // Show interstitial every N deaths
          if (this.deathCount % this.interstitialInterval === 0) {
            this.ads.showInterstitial();
          }
          this.reset();
        } else if (result === 'revive' && !this.hasRevived) {
          this.ads.showRewardedAd().then((success) => {
            if (success) {
              this.hasRevived = true;
              // Revive: go back to PLAYING state
              this.state = GameState.PLAYING;
              this.gameOverAlpha = 0;
            }
          });
        } else if (result === 'double') {
          this.ads.showRewardedAd().then((success) => {
            if (success) {
              const doubled = this.pelicanBike.distance * 2;
              if (doubled > this.bestDistance) {
                this.bestDistance = doubled;
                try { (wx as any).setStorageSync('bestDistance', this.bestDistance); } catch (_e) {}
              }
            }
          });
        }
      } else if (this.input.wasPressed('Space') && !tap) {
        this.reset();
      }
    }

    // Physics step
    if (this.state !== GameState.GAME_OVER) {
      this.physics.update(dt);
      this.pelicanBike.update(dt);
    }

    // Update terrain
    this.terrain.update(this.renderer.camera.x, this.screenW);

    // Camera follow
    this.renderer.camera.follow(this.pelicanBike.position.x, this.pelicanBike.position.y);

    this.input.endFrame();
  }

  draw() {
    // Background draws in mixed space (sky in screen space, parallax in world space)
    this.renderer.background.draw(
      this.renderer.context,
      this.renderer.camera.x,
      this.renderer.camera.y,
      this.screenW,
      this.screenH,
      this.baseY,
    );

    // World space drawing
    this.renderer.beginWorld();

    this.renderer.terrain.draw(
      this.renderer.context,
      this.terrain.allPoints,
      this.renderer.camera.x,
      this.screenW,
    );

    this.renderer.bike.draw(
      this.renderer.context,
      this.pelicanBike.bike,
      this.pelicanBike.facingRight,
    );

    this.renderer.pelican.draw(this.renderer.context, this.pelicanBike);

    this.renderer.endWorld();

    // Screen space UI
    this.hud.draw(
      this.renderer.context,
      this.screenW,
      this.screenH,
      this.pelicanBike.distance,
      this.pelicanBike.angle,
      this.state === GameState.PLAYING ? this.input.getZones() : undefined,
    );

    // Ready state hint
    if (this.state === GameState.READY) {
      const ctx = this.renderer.context;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.font = '20px sans-serif';
      ctx.fillStyle = '#666';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(t().startHint, this.screenW / 2, this.screenH * 0.2);
    }

    // Game over overlay
    if (this.state === GameState.GAME_OVER) {
      this.gameOver.draw(
        this.renderer.context,
        this.screenW,
        this.screenH,
        this.pelicanBike.distance,
        this.bestDistance,
        this.gameOverAlpha,
      );
    }
  }

  resize(w: number, h: number) {
    this.screenW = w;
    this.screenH = h;
    this.renderer.resize(w, h);
    this.input.resize(w, h);
    this.baseY = h * 0.6;
  }
}
