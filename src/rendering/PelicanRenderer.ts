import { PelicanBike } from '../entities/PelicanBike';
import { PHYSICS, COLORS } from '../utils/constants';

export class PelicanRenderer {
  draw(ctx: CanvasRenderingContext2D, pb: PelicanBike) {
    const body = pb.pelican.body;
    const bike = pb.bike;
    const dir = pb.facingRight ? 1 : -1;

    // Head position: computed or physics-driven
    let hx: number, hy: number, ha: number;
    if (pb.pelican.headReleased) {
      hx = pb.pelican.head.position.x;
      hy = pb.pelican.head.position.y;
      ha = pb.pelican.head.angle;
    } else {
      hx = pb.pelican.headX;
      hy = pb.pelican.headY;
      ha = pb.pelican.headAngle;
    }

    // --- Legs ---
    this.drawLegs(ctx, body, bike, dir);

    // --- Body ---
    ctx.save();
    ctx.translate(body.position.x, body.position.y);
    ctx.rotate(body.angle);

    ctx.beginPath();
    ctx.ellipse(0, 0, PHYSICS.PELICAN_BODY_RX, PHYSICS.PELICAN_BODY_RY, 0, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.PELICAN_BODY;
    ctx.fill();
    ctx.strokeStyle = COLORS.PELICAN_STROKE;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(-5 * dir, 2, PHYSICS.PELICAN_BODY_RX * 0.55, PHYSICS.PELICAN_BODY_RY * 0.6, -0.15 * dir, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.PELICAN_WING;
    ctx.fill();
    ctx.strokeStyle = COLORS.PELICAN_STROKE;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();

    // --- Neck ---
    const neckStartX = pb.pelican.neckBaseX;
    const neckStartY = pb.pelican.neckBaseY;
    let neckEndX = hx;
    let neckEndY = hy + PHYSICS.PELICAN_HEAD_RADIUS * 0.4;

    // Clamp neck visual length to avoid absurd stretching during crash
    const maxNeckLen = PHYSICS.NECK_LENGTH * 1.5;
    const dx = neckEndX - neckStartX;
    const dy = neckEndY - neckStartY;
    const neckDist = Math.sqrt(dx * dx + dy * dy);
    if (neckDist > maxNeckLen) {
      const scale = maxNeckLen / neckDist;
      neckEndX = neckStartX + dx * scale;
      neckEndY = neckStartY + dy * scale;
    }

    // Slight curve for the neck using a control point
    const neckMidX = (neckStartX + neckEndX) / 2 + 4 * dir;
    const neckMidY = (neckStartY + neckEndY) / 2;

    // Neck outline (darker, thicker)
    ctx.beginPath();
    ctx.moveTo(neckStartX, neckStartY);
    ctx.quadraticCurveTo(neckMidX, neckMidY, neckEndX, neckEndY);
    ctx.strokeStyle = COLORS.PELICAN_STROKE;
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Neck fill (lighter, thinner — gives a bordered look)
    ctx.beginPath();
    ctx.moveTo(neckStartX, neckStartY);
    ctx.quadraticCurveTo(neckMidX, neckMidY, neckEndX, neckEndY);
    ctx.strokeStyle = COLORS.PELICAN_BODY;
    ctx.lineWidth = 5;
    ctx.stroke();

    // --- Head ---
    ctx.save();
    ctx.translate(hx, hy);
    ctx.rotate(ha);

    ctx.beginPath();
    ctx.arc(0, 0, PHYSICS.PELICAN_HEAD_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.PELICAN_HEAD;
    ctx.fill();
    ctx.strokeStyle = COLORS.PELICAN_STROKE;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Eye
    const eyeX = 5 * dir;
    const eyeY = -4;
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, 6, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.EYE_WHITE;
    ctx.fill();
    ctx.strokeStyle = COLORS.PELICAN_STROKE;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(eyeX + 2 * dir, eyeY, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.EYE_PUPIL;
    ctx.fill();

    // Beak
    const beakLen = 25;
    ctx.beginPath();
    ctx.moveTo(PHYSICS.PELICAN_HEAD_RADIUS * 0.7 * dir, -4);
    ctx.lineTo((PHYSICS.PELICAN_HEAD_RADIUS + beakLen) * dir, 2);
    ctx.lineTo(PHYSICS.PELICAN_HEAD_RADIUS * 0.7 * dir, 6);
    ctx.closePath();
    ctx.fillStyle = COLORS.BEAK;
    ctx.fill();
    ctx.strokeStyle = '#CC6600';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  }

  private drawLegs(ctx: CanvasRenderingContext2D, body: Matter.Body, bike: any, dir: number) {
    const bodyX = body.position.x;
    const bodyY = body.position.y + PHYSICS.PELICAN_BODY_RY - 5;

    const midX = (bike.rearWheel.position.x + bike.frontWheel.position.x) / 2;
    const midY = (bike.rearWheel.position.y + bike.frontWheel.position.y) / 2;
    const angle = bike.frame.angle;

    const bbX = midX - Math.cos(angle) * 3;
    const bbY = midY - Math.sin(angle) * 3;

    const crankR = 6;
    const ca = bike.crankAngle;
    const p1x = bbX + Math.cos(ca) * crankR;
    const p1y = bbY + Math.sin(ca) * crankR;
    const p2x = bbX + Math.cos(ca + Math.PI) * crankR;
    const p2y = bbY + Math.sin(ca + Math.PI) * crankR;

    ctx.strokeStyle = COLORS.LEGS;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(bodyX - 3 * dir, bodyY);
    ctx.lineTo(p1x, p1y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(bodyX + 3 * dir, bodyY);
    ctx.lineTo(p2x, p2y);
    ctx.stroke();
  }
}
