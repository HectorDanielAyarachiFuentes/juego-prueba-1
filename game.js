// =============================================================================
// Map — 20×16 maze tilemap
// =============================================================================
const CANVAS_W = 640;
const CANVAS_H = 480;

const map = {
  cols: 20, rows: 16, tsize: 64,
  SOLID_TILES: new Set([3, 4, 5]),

  // Wall clusters are always at least 2×2 — no floating solo trees
  layers: [
    [
      // row 0
      3,3,4,4,3,3,3,3,3,3,3,3,3,3,4,4,3,3,3,3,
      // row 1
      3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,3,
      // row 2
      4,1,1,3,3,1,1,1,1,4,4,1,1,1,1,3,3,1,1,4,
      // row 3
      4,1,1,3,3,1,1,1,1,4,4,1,1,1,1,3,3,1,1,4,
      // row 4
      3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,3,
      // row 5
      3,1,1,1,1,4,4,1,1,1,1,1,1,4,4,1,1,1,1,3,
      // row 6
      3,1,1,1,1,4,4,1,1,1,1,1,1,4,4,1,1,1,1,3,
      // row 7
      3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,3,
      // row 8
      4,1,1,3,3,1,1,1,1,3,3,3,3,1,1,1,1,4,4,4,
      // row 9
      4,1,1,3,3,1,1,1,1,3,3,3,3,1,1,1,1,4,4,4,
      // row 10
      3,1,1,1,1,1,1,4,4,1,1,1,1,1,1,3,3,1,1,3,
      // row 11
      3,1,1,1,1,1,1,4,4,1,1,1,1,1,1,3,3,1,1,3,
      // row 12
      3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,3,
      // row 13
      3,1,1,4,4,1,1,1,1,1,1,1,1,1,1,1,1,3,3,3,
      // row 14
      3,1,1,4,4,1,1,1,1,1,1,1,1,1,1,1,1,3,3,3,
      // row 15
      3,3,3,3,3,3,3,3,4,4,3,3,3,3,3,3,3,3,3,3,
    ],
    [
      4,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,4,
      4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,
      4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,
      4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,
      4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,
      4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,
      4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,
      4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,
      4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,
      4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,
      4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,
      4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,
      4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,
      4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,
      4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,
      4,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,4,
    ],
  ],

  getTile(layer, col, row) {
    if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) return 3;
    return this.layers[layer]?.[row * this.cols + col] ?? 0;
  },
  isSolidAt(x, y) {
    const col = Math.floor(x / this.tsize);
    const row = Math.floor(y / this.tsize);
    return this.layers.some((_, i) => this.SOLID_TILES.has(this.getTile(i, col, row)));
  },
  colAt(x)  { return Math.floor(x / this.tsize); },
  rowAt(y)  { return Math.floor(y / this.tsize); },
  xAt(col)  { return col * this.tsize; },
  yAt(row)  { return row * this.tsize; },
};

// =============================================================================
// Camera
// =============================================================================
class Camera {
  #x = 0; #y = 0;
  constructor(mapRef, w, h) {
    this.width  = w; this.height = h;
    this.maxX   = mapRef.cols * mapRef.tsize - w;
    this.maxY   = mapRef.rows * mapRef.tsize - h;
    this.target = null;
  }
  get x() { return this.#x; }
  get y() { return this.#y; }
  follow(t) { this.target = t; t.screenX = this.width / 2; t.screenY = this.height / 2; }
  update() {
    if (!this.target) return;
    this.#x = Math.max(0, Math.min(this.target.x - this.width  / 2, this.maxX));
    this.#y = Math.max(0, Math.min(this.target.y - this.height / 2, this.maxY));
    this.target.screenX = (this.target.x < this.width / 2 || this.target.x > this.maxX + this.width / 2)
      ? this.target.x - this.#x : this.width  / 2;
    this.target.screenY = (this.target.y < this.height / 2 || this.target.y > this.maxY + this.height / 2)
      ? this.target.y - this.#y : this.height / 2;
  }
}

// =============================================================================
// Hero
// =============================================================================
class Hero {
  static HIT = 40;
  width = 64;
  height = 64;

  constructor(map, x, y) {
    this.map = map;
    this.x = x;
    this.y = y;
    this.screenX = 0;
    this.screenY = 0;
    this.speed = 256; // px per second
    this.image = loader.getImage('hero');
  }

  move(delta, dirx, diry) {
    // move hero
    this.x += dirx * this.speed * delta;
    this.y += diry * this.speed * delta;
    this.#resolveCollision(dirx, diry);
    this.x = Math.max(0, Math.min(this.x, this.map.cols * this.map.tsize));
    this.y = Math.max(0, Math.min(this.y, this.map.rows * this.map.tsize));
  }
  #resolveCollision(dirx, diry) {
    const h   = Hero.HIT / 2;
    const pad = 2; // inset perpendicular edges to allow corner sliding

    // Resolve X axis independently
    if (dirx !== 0) {
      const cx_l = this.x - h,   cx_r = this.x + h - 1;
      const cy_t = this.y - h + pad, cy_b = this.y + h - 1 - pad;
      if (dirx > 0 && (this.map.isSolidAt(cx_r, cy_t) || this.map.isSolidAt(cx_r, cy_b))) {
        this.x = -h + this.map.xAt(this.map.colAt(cx_r));
      } else if (dirx < 0 && (this.map.isSolidAt(cx_l, cy_t) || this.map.isSolidAt(cx_l, cy_b))) {
        this.x = h + this.map.xAt(this.map.colAt(cx_l) + 1);
      }
    }

    // Resolve Y axis independently
    if (diry !== 0) {
      const cy_t = this.y - h,   cy_b = this.y + h - 1;
      const cx_l = this.x - h + pad, cx_r = this.x + h - 1 - pad;
      if (diry > 0 && (this.map.isSolidAt(cx_l, cy_b) || this.map.isSolidAt(cx_r, cy_b))) {
        this.y = -h + this.map.yAt(this.map.rowAt(cy_b));
      } else if (diry < 0 && (this.map.isSolidAt(cx_l, cy_t) || this.map.isSolidAt(cx_r, cy_t))) {
        this.y = h + this.map.yAt(this.map.rowAt(cy_t) + 1);
      }
    }
  }
}

// =============================================================================
// Coin
// =============================================================================
class Coin {
  static RADIUS = 10;
  #phase;
  constructor(col, row) {
    this.x = col * map.tsize + map.tsize / 2;
    this.y = row * map.tsize + map.tsize / 2;
    this.collected = false;
    this.#phase = Math.random() * Math.PI * 2;
  }
  draw(ctx, camX, camY, elapsed) {
    if (this.collected) return;
    const sx = this.x - camX;
    const sy = this.y - camY + Math.sin(elapsed * 3 + this.#phase) * 4;
    // Glow
    const grd = ctx.createRadialGradient(sx, sy, 0, sx, sy, Coin.RADIUS * 2.5);
    grd.addColorStop(0, 'rgba(255,220,0,0.5)');
    grd.addColorStop(1, 'rgba(255,220,0,0)');
    ctx.beginPath(); ctx.arc(sx, sy, Coin.RADIUS * 2.5, 0, Math.PI * 2);
    ctx.fillStyle = grd; ctx.fill();
    // Body
    ctx.beginPath(); ctx.arc(sx, sy, Coin.RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = '#FFD700'; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = '#B8860B'; ctx.stroke();
    // Shine
    ctx.beginPath(); ctx.arc(sx - 3, sy - 3, 3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.fill();
  }
  overlaps(hero) {
    return Math.hypot(hero.x - this.x, hero.y - this.y) < map.tsize / 2 + Coin.RADIUS;
  }
}

// =============================================================================
// CoinCollectorGame
// =============================================================================
class CoinCollectorGame extends Game {
  #hero; #camera; #coins; #score = 0; #elapsed = 0;
  #tileAtlas; #lightCanvas; #scoreEl; #winEl;
  #sprites = [];

  // Coin positions — verified floor tiles in 2×2-cluster maze
  static COIN_POSITIONS = [
    [ 1, 1],[17, 1],  // top corners
    [ 1,13],[17,12],  // bottom corners
    [ 7, 1],[11, 1],  // top corridor
    [ 7,14],[11,14],  // bottom corridor
    [ 1, 7],[17, 7],  // mid sides
    [ 9, 4],[9,12],   // center vertical
  ];

  load() {
    return [
      loader.loadImage('tiles', 'assets/tiles.png'),
      loader.loadImage('hero',  'assets/character.png'),
    ];
  }

  init() {
    this.#tileAtlas = loader.getImage('tiles');
    
    // Randomize floor tiles to mix in dirt (tile 2) with grass (tile 1)
    const floorLayer = map.layers[0];
    for (let i = 0; i < floorLayer.length; i++) {
      // 18% chance for a grass tile to become a dirt tile
      if (floorLayer[i] === 1 && Math.random() < 0.18) {
        floorLayer[i] = 2;
      }
    }

    // Spawn at center of tile (1,1): 1*64+32=96
    this.#hero      = new Hero(map, 96, 96);
    this.#camera    = new Camera(map, CANVAS_W, CANVAS_H);
    this.#camera.follow(this.#hero);
    this.#coins     = CoinCollectorGame.COIN_POSITIONS.map(([c,r]) => new Coin(c, r));
    this.#scoreEl   = document.getElementById('score-display');
    this.#winEl     = document.getElementById('victory-overlay');

    // Mode 7 Toggle Logic
    const mode7Btn = document.getElementById('mode7-toggle');
    const worldPlane = document.getElementById('world-plane');
    if (mode7Btn && worldPlane) {
      mode7Btn.addEventListener('click', () => {
        worldPlane.classList.toggle('mode-7');
        const isMode7 = worldPlane.classList.contains('mode-7');
        mode7Btn.textContent = `Mode 7: ${isMode7 ? 'ON' : 'OFF'}`;
        mode7Btn.classList.toggle('active', isMode7);
        // Important: prevent spacebar from triggering button after click
        mode7Btn.blur();
      });
    }

    // Setup Sprite DOM layer for Billboarding
    const spriteLayer = document.getElementById('sprite-layer');
    spriteLayer.innerHTML = '';
    this.#sprites = [];
    
    // Add trees to DOM
    for (let layer = 0; layer < 1; layer++) {
      for (let c = 0; c < map.cols; c++) {
        for (let r = 0; r < map.rows; r++) {
          const tile = map.getTile(layer, c, r);
          if (map.SOLID_TILES.has(tile)) {
            const el = document.createElement('div');
            el.className = 'sprite tree-sprite';
            el.style.backgroundPosition = `-${(tile-1)*64}px 0`;
            spriteLayer.appendChild(el);
            this.#sprites.push({ el, x: c * 64, y: r * 64 });
          }
        }
      }
    }

    // Add hero to DOM
    this.#hero.el = document.createElement('div');
    this.#hero.el.className = 'sprite hero-sprite';
    spriteLayer.appendChild(this.#hero.el);

    // Off-screen light canvas
    this.#lightCanvas        = document.createElement('canvas');
    this.#lightCanvas.width  = CANVAS_W;
    this.#lightCanvas.height = CANVAS_H;
    this.#updateScore();
  }

  update(delta) {
    this.#elapsed += delta;
    const dirx = keyboard.isDown(Keyboard.RIGHT) ? 1 : keyboard.isDown(Keyboard.LEFT) ? -1 : 0;
    const diry = keyboard.isDown(Keyboard.DOWN)  ? 1 : keyboard.isDown(Keyboard.UP)   ? -1 : 0;
    this.#hero.move(delta, dirx, diry);
    this.#camera.update();
    for (const coin of this.#coins) {
      if (!coin.collected && coin.overlaps(this.#hero)) {
        coin.collected = true; this.#score++; this.#updateScore();
      }
    }
    
    this.#updateSprites();
  }

  #updateSprites() {
    const cx = this.#camera.x;
    const cy = this.#camera.y;

    for (const s of this.#sprites) {
      const screenX = s.x - cx;
      const screenY = s.y - cy;
      s.el.style.transform = `translate(${screenX}px, ${screenY}px) var(--sprite-rot)`;
      s.el.style.zIndex = Math.floor(s.y);
    }

    const hx = this.#hero.screenX;
    const hy = this.#hero.screenY;
    this.#hero.el.style.transform = `translate(${hx}px, ${hy}px) var(--sprite-rot)`;
    this.#hero.el.style.zIndex = Math.floor(this.#hero.y);
  }

  render(ctx) {
    this.#drawLayer(ctx, 0);
    this.#coins.forEach(c => c.draw(ctx, this.#camera.x, this.#camera.y, this.#elapsed));
    // Sprites are no longer drawn on canvas!
    this.#drawLayer(ctx, 1);
    this.#drawLighting(ctx);
  }

  // ── Tile layer ──────────────────────────────────────────────────────────────
  #drawLayer(ctx, layer) {
    const { x: cx, y: cy } = this.#camera;
    const ts = map.tsize;
    const sc = Math.floor(cx / ts), sr = Math.floor(cy / ts);
    const ec = sc + Math.ceil(CANVAS_W / ts) + 1;
    const er = sr + Math.ceil(CANVAS_H / ts) + 1;
    const ox = -cx + sc * ts, oy = -cy + sr * ts;

    for (let c = sc; c <= ec; c++) {
      for (let r = sr; r <= er; r++) {
        const tile = map.getTile(layer, c, r);
        if (!tile || map.SOLID_TILES.has(tile)) continue;

        const bx = Math.round((c - sc) * ts + ox);
        const by = Math.round((r - sr) * ts + oy);

        ctx.drawImage(this.#tileAtlas,
          (tile - 1) * ts, 0, ts, ts,
          bx, by, ts, ts,
        );
      }
    }
  }

  // ── Wall shadows removed for 3D assets ───────────────────────────────────────

  // ── Dynamic lighting (flashlight + coin glow) ────────────────────────────────
  #drawLighting(ctx) {
    const lc  = this.#lightCanvas;
    const lctx = lc.getContext('2d');
    const px  = this.#hero.screenX;
    const py  = this.#hero.screenY;
    const { x: camX, y: camY } = this.#camera;

    // Dark fog of war
    lctx.globalCompositeOperation = 'source-over';
    lctx.fillStyle = 'rgba(0, 5, 18, 0.87)';
    lctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    lctx.globalCompositeOperation = 'destination-out';

    // Player flashlight
    const pg = lctx.createRadialGradient(px, py, 5, px, py, 220);
    pg.addColorStop(0,   'rgba(255,255,255,1)');
    pg.addColorStop(0.45,'rgba(255,255,255,0.7)');
    pg.addColorStop(1,   'rgba(255,255,255,0)');
    lctx.fillStyle = pg;
    lctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Coin ambient lights
    for (const coin of this.#coins) {
      if (coin.collected) continue;
      const sx = coin.x - camX, sy = coin.y - camY;
      const cg = lctx.createRadialGradient(sx, sy, 0, sx, sy, 60);
      cg.addColorStop(0, 'rgba(255,230,80,0.65)');
      cg.addColorStop(1, 'rgba(0,0,0,0)');
      lctx.fillStyle = cg;
      lctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    }

    // Overlay the light canvas on the scene
    lctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(lc, 0, 0);
  }

  // ── Hero sprite ──────────────────────────────────────────────────────────────
  // Hero is now drawn using DOM Billboarding, canvas rendering removed.

  #updateScore() {
    this.#scoreEl.innerHTML = `<span class="coin-icon">💰</span> ${this.#score} / ${CoinCollectorGame.COIN_POSITIONS.length}`;
    if (this.#score >= CoinCollectorGame.COIN_POSITIONS.length && !this.#winEl) {
      // Mark as won
      this.#winEl = true;
      
      // Show modern overlay
      const overlay = document.getElementById('victory-overlay');
      if (overlay) overlay.style.display = 'flex';
      
      // Trigger Confetti
      if (typeof confetti === 'function') {
        const duration = 3000;
        const end = Date.now() + duration;

        (function frame() {
          confetti({
            particleCount: 5,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#FFD700', '#4CAF50', '#FF5722']
          });
          confetti({
            particleCount: 5,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#FFD700', '#4CAF50', '#FF5722']
          });

          if (Date.now() < end) {
            requestAnimationFrame(frame);
          }
        }());
      }
    }
  }
}

// =============================================================================
// Bootstrap
// =============================================================================
window.addEventListener('load', () => new CoinCollectorGame().start('demo'));
