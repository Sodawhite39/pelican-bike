/// <reference types="./wx-types" />

import { installPolyfills } from './utils/wx-polyfills';
import { Game } from './Game';

// Get system info
const info = wx.getSystemInfoSync();
const screenWidth = info.screenWidth;
const screenHeight = info.screenHeight;
const dpr = info.pixelRatio;

// Create main canvas (first wx.createCanvas call = on-screen)
const canvas = wx.createCanvas();
canvas.width = screenWidth * dpr;
canvas.height = screenHeight * dpr;

// Get context and scale for retina
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
ctx.scale(dpr, dpr);

// Install polyfills
installPolyfills(ctx);

// Create game with logical screen dimensions
const game = new Game(canvas, screenWidth, screenHeight);

// Game loop
let lastTime = 0;
function loop(time: number) {
  game.update(time);
  game.draw();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
