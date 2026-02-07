// Simplex-style Perlin noise (single octave)
const GRAD = [[1,1],[-1,1],[1,-1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]];
const perm = new Uint8Array(512);

function initPerm(seed: number) {
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  for (let i = 255; i > 0; i--) {
    seed = (seed * 16807 + 0) % 2147483647;
    const j = seed % (i + 1);
    [p[i], p[j]] = [p[j], p[i]];
  }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
}
initPerm(42);

function fade(t: number) { return t * t * t * (t * (t * 6 - 15) + 10); }
function lerp(a: number, b: number, t: number) { return a + t * (b - a); }

function grad1d(hash: number, x: number): number {
  const g = GRAD[hash & 7];
  return g[0] * x;
}

export function noise1D(x: number): number {
  const xi = Math.floor(x);
  const xf = x - xi;
  const u = fade(xf);
  const a = perm[xi & 255];
  const b = perm[(xi + 1) & 255];
  return lerp(grad1d(a, xf), grad1d(b, xf - 1), u);
}

export function fbm(x: number, octaves: number = 4, lacunarity: number = 2.0, gain: number = 0.5): number {
  let sum = 0;
  let amp = 1;
  let freq = 1;
  let maxAmp = 0;
  for (let i = 0; i < octaves; i++) {
    sum += noise1D(x * freq) * amp;
    maxAmp += amp;
    amp *= gain;
    freq *= lacunarity;
  }
  return sum / maxAmp;
}

export function clamp(v: number, min: number, max: number): number {
  return v < min ? min : v > max ? max : v;
}

export function lerpNum(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
