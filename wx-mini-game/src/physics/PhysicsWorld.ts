import Matter from 'matter-js';
import { PHYSICS } from '../utils/constants';

export class PhysicsWorld {
  engine: Matter.Engine;
  world: Matter.World;

  constructor() {
    this.engine = Matter.Engine.create({
      gravity: PHYSICS.GRAVITY,
    });
    this.world = this.engine.world;
  }

  update(delta: number) {
    Matter.Engine.update(this.engine, delta);
  }

  add(...bodies: (Matter.Body | Matter.Composite | Matter.Constraint)[]) {
    Matter.Composite.add(this.world, bodies);
  }

  remove(...bodies: (Matter.Body | Matter.Composite | Matter.Constraint)[]) {
    for (const b of bodies) {
      Matter.Composite.remove(this.world, b);
    }
  }

  onCollision(callback: (pairs: Matter.Pair[]) => void) {
    Matter.Events.on(this.engine, 'collisionStart', (event: any) => {
      callback(event.pairs);
    });
  }

  clear() {
    Matter.Composite.clear(this.world, false);
  }
}
