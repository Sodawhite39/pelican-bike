import Matter from 'matter-js';
import { PHYSICS } from '../utils/constants';
import { PhysicsWorld } from '../physics/PhysicsWorld';

export class Pelican {
  head: Matter.Body;
  body: Matter.Body;
  neck!: Matter.Constraint;
  private physics: PhysicsWorld;
  private _headReleased = false;

  /** Computed head position (used while head is NOT a physics body) */
  headX = 0;
  headY = 0;
  headAngle = 0;

  /** Neck attach point on body (world coords), for rendering */
  neckBaseX = 0;
  neckBaseY = 0;

  constructor(physics: PhysicsWorld, x: number, y: number) {
    this.physics = physics;

    this.body = Matter.Bodies.circle(x, y, PHYSICS.PELICAN_BODY_RY, {
      mass: PHYSICS.PELICAN_BODY_MASS,
      friction: 0.3,
      frictionAir: 0.002,
      label: 'pelicanBody',
      collisionFilter: { group: -1 },
    });

    this.head = Matter.Bodies.circle(x + 10, y - 80, PHYSICS.PELICAN_HEAD_RADIUS, {
      mass: PHYSICS.PELICAN_HEAD_MASS,
      friction: 0.3,
      frictionAir: 0.04,
      label: 'pelicanHead',
      collisionFilter: { group: -1 },
    });

    physics.add(this.body);
    this.computeHeadPosition(1);
  }

  get headReleased(): boolean {
    return this._headReleased;
  }

  /** Update neckBase from current body position (call during crash too) */
  updateNeckBase(facingDir: number) {
    const bx = this.body.position.x;
    const by = this.body.position.y;
    const ba = this.body.angle;

    const localNeckX = 12 * facingDir;
    const localNeckY = -PHYSICS.PELICAN_BODY_RY + 3;

    this.neckBaseX = bx + Math.cos(ba) * localNeckX - Math.sin(ba) * localNeckY;
    this.neckBaseY = by + Math.sin(ba) * localNeckX + Math.cos(ba) * localNeckY;
  }

  /** Call every frame while riding — head tracks body with zero jitter */
  computeHeadPosition(facingDir: number) {
    this.updateNeckBase(facingDir);

    // Head position: neck extends upward and slightly forward
    const ba = this.body.angle;
    const neckLen = PHYSICS.NECK_LENGTH;
    const neckAngle = ba - Math.PI / 2 + 0.35 * facingDir; // slightly tilted forward
    this.headX = this.neckBaseX + Math.cos(neckAngle) * neckLen;
    this.headY = this.neckBaseY + Math.sin(neckAngle) * neckLen;
    this.headAngle = ba * 0.2;
  }

  /** Release head into physics world (call once on crash) */
  releaseHead() {
    if (this._headReleased) return;
    this._headReleased = true;

    Matter.Body.setPosition(this.head, { x: this.headX, y: this.headY });
    Matter.Body.setAngle(this.head, this.headAngle);
    Matter.Body.setVelocity(this.head, this.body.velocity);

    this.physics.add(this.head);

    this.neck = Matter.Constraint.create({
      bodyA: this.body,
      pointA: { x: 12, y: -PHYSICS.PELICAN_BODY_RY + 3 },
      bodyB: this.head,
      pointB: { x: 0, y: PHYSICS.PELICAN_HEAD_RADIUS * 0.5 },
      stiffness: 0.6,
      damping: 0.3,
      length: PHYSICS.NECK_LENGTH * 0.6,
    });

    this.physics.add(this.neck);
  }
}
