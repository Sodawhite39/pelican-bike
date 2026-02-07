import { Game } from './Game';

const canvas = document.getElementById('game') as HTMLCanvasElement;

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  game.resize(canvas.width, canvas.height);
}

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const game = new Game(canvas);

window.addEventListener('resize', resize);

function loop(time: number) {
  game.update(time);
  game.draw();
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
