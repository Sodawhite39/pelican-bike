import Matter from 'matter-js';
import { PHYSICS } from '../utils/constants';
import { PhysicsWorld } from '../physics/PhysicsWorld';

export class Bicycle {
  rearWheel: Matter.Body;
  frontWheel: Matter.Body;
  frame: Matter.Body;
  rearAxle: Matter.Constraint;
  frontAxle: Matter.Constraint;
  crankAngle = 0;

  constructor(physics: PhysicsWorld, x: number, y: number) {
    const halfBase = PHYSICS.WHEELBASE / 2;
    const wr = PHYSICS.WHEEL_RADIUS;

    this.rearWheel = Matter.Bodies.circle(x - halfBase, y, wr, {
      mass: PHYSICS.WHEEL_MASS,
      friction: PHYSICS.WHEEL_FRICTION,
      restitution: PHYSICS.WHEEL_RESTITUTION,
      frictionAir: PHYSICS.WHEEL_FRICTION_AIR,
      label: 'rearWheel',
    });

    this.frontWheel = Matter.Bodies.circle(x + halfBase, y, wr, {
      mass: PHYSICS.WHEEL_MASS,
      friction: PHYSICS.WHEEL_FRICTION,
      restitution: PHYSICS.WHEEL_RESTITUTION,
      frictionAir: PHYSICS.WHEEL_FRICTION_AIR,
      label: 'frontWheel',
    });

    this.frame = Matter.Bodies.rectangle(x, y - wr - 4, PHYSICS.FRAME_WIDTH, PHYSICS.FRAME_HEIGHT, {
      mass: PHYSICS.FRAME_MASS,
      friction: 0.3,
      label: 'bikeFrame',
      collisionFilter: { group: -1 },
    });

    this.rearAxle = Matter.Constraint.create({
      bodyA: this.frame,
      pointA: { x: -halfBase + 2, y: wr + 4 },
      bodyB: this.rearWheel,
      pointB: { x: 0, y: 0 },
      stiffness: 0.9,
      damping: 0.05,
      length: 0,
    });

    this.frontAxle = Matter.Constraint.create({
      bodyA: this.frame,
      pointA: { x: halfBase - 2, y: wr + 4 },
      bodyB: this.frontWheel,
      pointB: { x: 0, y: 0 },
      stiffness: 0.9,
      damping: 0.05,
      length: 0,
    });

    physics.add(this.rearWheel, this.frontWheel, this.frame, this.rearAxle, this.frontAxle);
  }

  get position(): Matter.Vector {
    return this.frame.position;
  }

  get angle(): number {
    return this.frame.angle;
  }

  get speed(): number {
    const v = this.frame.velocity;
    return Math.sqrt(v.x * v.x + v.y * v.y);
  }

  pedal(direction: number) {
    // Limit top speed
    if (this.speed < PHYSICS.MAX_SPEED) {
      const torque = PHYSICS.PEDAL_TORQUE * direction;
      this.rearWheel.torque += torque;
    }
    this.crankAngle += 0.15 * direction;
  }

  brake() {
    Matter.Body.setAngularVelocity(
      this.rearWheel,
      this.rearWheel.angularVelocity * PHYSICS.BRAKE_FACTOR
    );
    Matter.Body.setAngularVelocity(
      this.frontWheel,
      this.frontWheel.angularVelocity * PHYSICS.BRAKE_FACTOR
    );
  }

  lean(direction: number) {
    // Direct torque on frame for responsive balance control
    this.frame.torque += PHYSICS.LEAN_FORCE * direction * 0.8;
    // Slight horizontal push on pelican body (handled in PelicanBike)
  }
}
