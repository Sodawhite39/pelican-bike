import { Bicycle } from '../entities/Bicycle';
import { PHYSICS, COLORS } from '../utils/constants';

export class BikeRenderer {
  draw(ctx: CanvasRenderingContext2D, bike: Bicycle, facingRight: boolean) {
    const rw = bike.rearWheel.position;
    const fw = bike.frontWheel.position;
    const fr = bike.frame.position;
    const angle = bike.frame.angle;
    const wr = PHYSICS.WHEEL_RADIUS;

    ctx.strokeStyle = COLORS.BIKE;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Wheels
    this.drawWheel(ctx, rw.x, rw.y, wr, bike.rearWheel.angle);
    this.drawWheel(ctx, fw.x, fw.y, wr, bike.frontWheel.angle);

    // Frame lines - simplified BMX frame
    const midX = (rw.x + fw.x) / 2;
    const midY = (rw.y + fw.y) / 2;
    const seatX = midX + Math.cos(angle - Math.PI / 2) * 8;
    const seatY = midY + Math.sin(angle - Math.PI / 2) * 8;

    // Rear stays (rear wheel to seat)
    ctx.beginPath();
    ctx.moveTo(rw.x, rw.y);
    ctx.lineTo(seatX, seatY);
    ctx.stroke();

    // Down tube (seat to front wheel)
    ctx.beginPath();
    ctx.moveTo(seatX, seatY);
    ctx.lineTo(fw.x, fw.y);
    ctx.stroke();

    // Chain stays (rear wheel to bottom bracket)
    const bbX = midX - Math.cos(angle) * 3;
    const bbY = midY - Math.sin(angle) * 3;
    ctx.beginPath();
    ctx.moveTo(rw.x, rw.y);
    ctx.lineTo(bbX, bbY);
    ctx.stroke();

    // Seat tube (bottom bracket to seat)
    ctx.beginPath();
    ctx.moveTo(bbX, bbY);
    ctx.lineTo(seatX, seatY);
    ctx.stroke();

    // Handlebar
    const hbX = fw.x + Math.cos(angle - Math.PI / 2) * 12;
    const hbY = fw.y + Math.sin(angle - Math.PI / 2) * 12;
    ctx.beginPath();
    ctx.moveTo(fw.x, fw.y);
    ctx.lineTo(hbX, hbY);
    ctx.stroke();

    // Handlebar cross
    const perpX = Math.cos(angle) * 5;
    const perpY = Math.sin(angle) * 5;
    ctx.beginPath();
    ctx.moveTo(hbX - perpX, hbY - perpY);
    ctx.lineTo(hbX + perpX, hbY + perpY);
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.lineWidth = 2.5;

    // Crank / Pedals
    const crankR = 6;
    const ca = bike.crankAngle;
    const p1x = bbX + Math.cos(ca) * crankR;
    const p1y = bbY + Math.sin(ca) * crankR;
    const p2x = bbX + Math.cos(ca + Math.PI) * crankR;
    const p2y = bbY + Math.sin(ca + Math.PI) * crankR;

    ctx.beginPath();
    ctx.moveTo(p1x, p1y);
    ctx.lineTo(p2x, p2y);
    ctx.stroke();

    // Pedal platforms
    ctx.lineWidth = 3;
    for (const [px, py] of [[p1x, p1y], [p2x, p2y]]) {
      ctx.beginPath();
      ctx.moveTo(px - 3, py);
      ctx.lineTo(px + 3, py);
      ctx.stroke();
    }
  }

  private drawWheel(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, angle: number) {
    // Tire
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();

    // Hub
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.BIKE;
    ctx.fill();

    // Spokes
    ctx.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
      const a = angle + (i * Math.PI) / 3;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(a) * 3, y + Math.sin(a) * 3);
      ctx.lineTo(x + Math.cos(a) * (r - 1), y + Math.sin(a) * (r - 1));
      ctx.stroke();
    }
  }
}
