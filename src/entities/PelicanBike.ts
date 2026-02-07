import Matter from 'matter-js';
import { PHYSICS } from '../utils/constants';
import { PhysicsWorld } from '../physics/PhysicsWorld';
import { Bicycle } from './Bicycle';
import { Pelican } from './Pelican';

export class PelicanBike {
  bike: Bicycle;
  pelican: Pelican;
  seatConstraint: Matter.Constraint;
  private physics: PhysicsWorld;
  private isCrashing = false;
  private crashStartTime = 0;
  facingRight = true;
  startX = 0;

  constructor(physics: PhysicsWorld, x: number, groundY: number) {
    this.physics = physics;
    this.startX = x;

    const bikeY = groundY - PHYSICS.WHEEL_RADIUS;
    this.bike = new Bicycle(physics, x, bikeY);

    const bodyY = this.bike.frame.position.y - PHYSICS.FRAME_HEIGHT / 2 - PHYSICS.PELICAN_BODY_RY - 5;
    this.pelican = new Pelican(physics, x, bodyY);

    this.seatConstraint = Matter.Constraint.create({
      bodyA: this.pelican.body,
      pointA: { x: 0, y: PHYSICS.PELICAN_BODY_RY - 5 },
      bodyB: this.bike.frame,
      pointB: { x: 0, y: -PHYSICS.FRAME_HEIGHT / 2 },
      stiffness: PHYSICS.SEAT_STIFFNESS,
      damping: 0.15,
      length: 5,
    });

    physics.add(this.seatConstraint);
  }

  get position(): Matter.Vector {
    return this.bike.position;
  }

  get distance(): number {
    return Math.max(0, Math.abs(this.bike.position.x - this.startX) / 10);
  }

  get angle(): number {
    return this.bike.angle;
  }

  get speed(): number {
    return this.bike.speed;
  }

  get crashed(): boolean {
    return this.isCrashing;
  }

  update(dt: number) {
    if (this.isCrashing) {
      const elapsed = Date.now() - this.crashStartTime;
      const progress = Math.min(1, elapsed / PHYSICS.CRASH_STIFFNESS_DURATION);

      this.seatConstraint.stiffness = PHYSICS.SEAT_STIFFNESS * (1 - progress * 0.9);
      if (this.pelican.neck) {
        this.pelican.neck.stiffness = 0.4 * (1 - progress * 0.85);
      }

      // Keep neckBase updated from body position during crash (for rendering)
      this.pelican.updateNeckBase(this.facingRight ? 1 : -1);
      return;
    }

    // Normal riding — compute head position from body (no physics, zero jitter)
    this.pelican.computeHeadPosition(this.facingRight ? 1 : -1);

    // Gyroscopic stabilization
    const speed = this.speed;
    if (speed > 1) {
      const stabilize = -this.bike.angle * PHYSICS.GYRO_FACTOR * speed;
      this.bike.frame.torque += stabilize;
    }
  }

  pedal() {
    if (this.isCrashing) return;
    const dir = this.facingRight ? 1 : -1;
    this.bike.pedal(dir);
  }

  brake() {
    if (this.isCrashing) return;
    this.bike.brake();
  }

  leanLeft() {
    if (this.isCrashing) return;
    this.bike.lean(-1);
    Matter.Body.applyForce(this.pelican.body, this.pelican.body.position, { x: -PHYSICS.LEAN_FORCE * 0.5, y: 0 });
  }

  leanRight() {
    if (this.isCrashing) return;
    this.bike.lean(1);
    Matter.Body.applyForce(this.pelican.body, this.pelican.body.position, { x: PHYSICS.LEAN_FORCE * 0.5, y: 0 });
  }

  turnAround() {
    if (this.isCrashing) return;
    this.facingRight = !this.facingRight;
  }

  triggerCrash() {
    if (this.isCrashing) return;
    this.isCrashing = true;
    this.crashStartTime = Date.now();

    // Release head into physics world for ragdoll
    this.pelican.releaseHead();

    this.pelican.head.collisionFilter.group = 0;
    this.pelican.body.collisionFilter.group = 0;
    this.bike.frame.collisionFilter.group = 0;
  }

  shouldCrash(): boolean {
    if (this.isCrashing) return false;
    return Math.abs(this.bike.angle) > PHYSICS.CRASH_ANGLE;
  }

  isSettled(): boolean {
    if (!this.isCrashing) return false;
    const elapsed = Date.now() - this.crashStartTime;
    if (elapsed < 1000) return false;
    const v = this.bike.frame.velocity;
    const speed = Math.sqrt(v.x * v.x + v.y * v.y);
    return speed < 0.5 || elapsed > 3000;
  }
}
