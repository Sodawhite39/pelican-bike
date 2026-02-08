/**
 * Polyfills for WeChat Mini Game Canvas 2D context.
 * Call once before any rendering.
 */
export function installPolyfills(ctx: any) {
  // roundRect polyfill
  if (!ctx.roundRect) {
    ctx.roundRect = function (
      x: number, y: number, w: number, h: number,
      radii?: number | number[]
    ) {
      let tl: number, tr: number, br: number, bl: number;
      if (radii == null) {
        tl = tr = br = bl = 0;
      } else if (typeof radii === 'number') {
        tl = tr = br = bl = radii;
      } else if (Array.isArray(radii)) {
        tl = radii[0] ?? 0;
        tr = radii[1] ?? tl;
        br = radii[2] ?? tl;
        bl = radii[3] ?? tr;
      } else {
        tl = tr = br = bl = 0;
      }

      this.moveTo(x + tl, y);
      this.lineTo(x + w - tr, y);
      if (tr) this.arcTo(x + w, y, x + w, y + tr, tr);
      else this.lineTo(x + w, y);
      this.lineTo(x + w, y + h - br);
      if (br) this.arcTo(x + w, y + h, x + w - br, y + h, br);
      else this.lineTo(x + w, y + h);
      this.lineTo(x + bl, y + h);
      if (bl) this.arcTo(x, y + h, x, y + h - bl, bl);
      else this.lineTo(x, y + h);
      this.lineTo(x, y + tl);
      if (tl) this.arcTo(x, y, x + tl, y, tl);
      else this.lineTo(x, y);
      this.closePath();
    };
  }

  // ellipse polyfill
  if (!ctx.ellipse) {
    ctx.ellipse = function (
      cx: number, cy: number, rx: number, ry: number,
      rotation: number, startAngle: number, endAngle: number, ccw?: boolean
    ) {
      this.save();
      this.translate(cx, cy);
      this.rotate(rotation);
      this.scale(rx, ry);
      this.arc(0, 0, 1, startAngle, endAngle, ccw);
      this.restore();
    };
  }
}
