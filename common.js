// =============================================================================
// Loader — Manages image asset loading with Promises
// =============================================================================

class Loader {
  #images = {};

  loadImage(key, src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.#images[key] = img;
        resolve(img);
      };
      img.onerror = () => reject(new Error(`Could not load image: ${src}`));
      img.src = src;
    });
  }

  getImage(key) {
    return this.#images[key] ?? null;
  }
}

// =============================================================================
// Keyboard — Tracks key states using a Set
// =============================================================================

class Keyboard {
  static LEFT  = 'ArrowLeft';
  static RIGHT = 'ArrowRight';
  static UP    = 'ArrowUp';
  static DOWN  = 'ArrowDown';

  #held = new Set();

  constructor() {
    window.addEventListener('keydown', (e) => {
      if (Object.values(Keyboard).includes(e.key)) {
        e.preventDefault();
        this.#held.add(e.key);
      }
    });
    window.addEventListener('keyup', (e) => {
      this.#held.delete(e.key);
    });
  }

  isDown(key) {
    return this.#held.has(key);
  }
}

// =============================================================================
// Game — Core game loop using requestAnimationFrame
// =============================================================================

class Game {
  #ctx;
  #previousElapsed = 0;

  async start(canvasId) {
    const canvas = document.getElementById(canvasId);
    this.#ctx = canvas.getContext('2d');

    await Promise.all(this.load());
    this.init();

    const tick = (elapsed) => {
      window.requestAnimationFrame(tick);
      this.#ctx.clearRect(0, 0, canvas.width, canvas.height);

      const delta = Math.min((elapsed - this.#previousElapsed) / 1000, 0.25);
      this.#previousElapsed = elapsed;

      this.update(delta);
      this.render(this.#ctx);
    };

    window.requestAnimationFrame(tick);
  }

  // Override these in your game
  load()             { return []; }
  init()             {}
  update(_delta)     {}
  render(_ctx)       {}
}

// Make available globally
const loader   = new Loader();
const keyboard = new Keyboard();
