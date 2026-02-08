/// <reference types="./wx-types" />

import { installPolyfills } from './utils/wx-polyfills';
import { Game } from './Game';

// Get system info
const info = wx.getSystemInfoSync();

// Landscape mode: ensure width > height
let screenWidth = info.screenWidth;
let screenHeight = info.screenHeight;
if (screenWidth < screenHeight) {
  const tmp = screenWidth;
  screenWidth = screenHeight;
  screenHeight = tmp;
}

// Create main canvas (first wx.createCanvas call = on-screen)
const canvas = wx.createCanvas();
canvas.width = screenWidth;
canvas.height = screenHeight;

// Get context
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

// Install polyfills
installPolyfills(ctx);

// Create game
const game = new Game(canvas, screenWidth, screenHeight);

// Game loop
function loop(time: number) {
  game.update(time);
  game.draw();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
