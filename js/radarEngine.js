/**
 * ARUNA STATION: Radar & Acoustic Simulation Engine
 * Real-time top-down sonar propagation, collision, entity AI, and interactive objects.
 */

class RadarEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.isRunning = false;

    // Player State
    this.player = {
      x: 140,
      y: 300,
      radius: 8,
      speed: 3.2,
      vx: 0,
      vy: 0,
      footstepTimer: 0
    };

    // Active Sonar Acoustic Pings
    this.pings = [];

    // Entity State
    this.entity = {
      x: 720,
      y: 440,
      radius: 18,
      speed: 1.4,
      targetX: 720,
      targetY: 440,
      phase: 0,
      alertness: 0, // 0 to 1
      isVisible: false
    };

    // Station Corridors and Rooms (Walls)
    this.walls = [
      // Outer Boundary
      { x1: 50, y1: 50, x2: 850, y2: 50 },
      { x1: 850, y1: 50, x2: 850, y2: 550 },
      { x1: 850, y1: 550, x2: 50, y2: 550 },
      { x1: 50, y1: 550, x2: 50, y2: 50 },

      // Airlock 3 Module (West)
      { x1: 50, y1: 240, x2: 220, y2: 240 },
      { x1: 50, y1: 360, x2: 220, y2: 360 },
      { x1: 220, y1: 240, x2: 220, y2: 280 }, // Door gap
      { x1: 220, y1: 320, x2: 220, y2: 360 },

      // Command Center (Center-North)
      { x1: 320, y1: 50, x2: 320, y2: 240 },
      { x1: 580, y1: 50, x2: 580, y2: 240 },
      { x1: 320, y1: 240, x2: 410, y2: 240 },
      { x1: 490, y1: 240, x2: 580, y2: 240 },

      // Stasis Deck B (Center-South)
      { x1: 340, y1: 320, x2: 560, y2: 320 },
      { x1: 340, y1: 320, x2: 340, y2: 480 },
      { x1: 560, y1: 320, x2: 560, y2: 480 },
      { x1: 340, y1: 480, x2: 410, y2: 480 },
      { x1: 490, y1: 480, x2: 560, y2: 480 },

      // Medical Bay (South-West)
      { x1: 100, y1: 420, x2: 280, y2: 420 },
      { x1: 280, y1: 420, x2: 280, y2: 550 },

      // Deep Research Lab (East-North)
      { x1: 640, y1: 50, x2: 640, y2: 270 },
      { x1: 640, y1: 270, x2: 740, y2: 270 },
      { x1: 780, y1: 270, x2: 850, y2: 270 },

      // Tokamak Reactor Core (South-East)
      { x1: 620, y1: 350, x2: 850, y2: 350 },
      { x1: 620, y1: 350, x2: 620, y2: 440 },
      { x1: 620, y1: 480, x2: 620, y2: 550 }
    ];

    // Station Interactive Nodes
    this.nodes = [
      { id: 'chen', type: 'crew', name: 'Captain Sarah Chen', x: 450, y: 150, color: '#ffb703', rescued: false, desc: 'Sarah is clutching a motion sensor. "Okafor! Don\'t use loud pings! The entity is in the core!"' },
      { id: 'murthy', type: 'crew', name: 'Dr. James Murthy', x: 740, y: 140, color: '#00f0ff', rescued: false, desc: 'Murthy hands you the glowing optical drive: "The Meridian Signal is secured! Take it to Earth!"' },
      { id: 'patel', type: 'crew', name: 'Dr. Kavya Patel', x: 190, y: 480, color: '#ff3344', rescued: false, desc: 'Kavya is inside Pod B. You patch her secondary oxygen seal. She breathes steadily.' },
      { id: 'stasis', type: 'crew', name: 'Stasis Pods (Vance & Rostova)', x: 450, y: 400, color: '#00ffaa', rescued: false, desc: 'Cryo-stasis auxiliary power restored. Marcus Vance and Elena Rostova stabilized.' },
      { id: 'tanaka', type: 'crew', name: 'Engineer Yuki Tanaka', x: 670, y: 500, color: '#e0f2fe', rescued: false, desc: 'Yuki is by the coolant loops: "The entity is nesting right on the core! Choose your confrontation!"' },
      { id: 'reactor', type: 'reactor', name: 'Tokamak Reactor Core', x: 760, y: 470, color: '#bf5af2', confronted: false, desc: 'Primary magnetic torus. The Entity is floating directly above.' }
    ];

    // Input listeners
    this.keys = {};
    window.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;
      if (e.code === 'Space') {
        e.preventDefault();
        this.triggerPing();
      }
      if (e.key.toLowerCase() === 'e') {
        this.interactNearest();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });

    // Spectrogram canvas
    this.spectroCanvas = document.getElementById('spectrogram-canvas');
    this.spectroCtx = this.spectroCanvas ? this.spectroCanvas.getContext('2d') : null;
    this.spectroWave = new Array(50).fill(0);
  }

  start() {
    this.isRunning = true;
    
    // Spawn player according to entry choice
    if (window.gameState && window.gameState.strategy.entry === 'A') {
      this.player.x = 450;
      this.player.y = 80;
    } else {
      this.player.x = 120;
      this.player.y = 300;
    }

    this.loop();
  }

  stop() {
    this.isRunning = false;
  }

  triggerPing() {
    if (!window.gameState.survival.pingReady) return;
    
    const isInterference = (window.gameState.strategy.entry === 'A');
    window.soundEngine.playPing(isInterference);

    this.pings.push({
      x: this.player.x,
      y: this.player.y,
      radius: 5,
      maxRadius: isInterference ? 260 : 380,
      opacity: 1,
      speed: 4.8
    });

    // PING attracts the Entity
    const distToEntity = Math.hypot(this.entity.x - this.player.x, this.entity.y - this.player.y);
    if (distToEntity < 450) {
      this.entity.alertness = Math.min(1, this.entity.alertness + 0.35);
      this.entity.targetX = this.player.x + (Math.random() * 40 - 20);
      this.entity.targetY = this.player.y + (Math.random() * 40 - 20);
      
      const banner = document.getElementById('entity-warning');
      if (banner) banner.classList.remove('hidden');
    }

    // Cooldown
    window.gameState.survival.pingReady = false;
    const pingStatus = document.getElementById('ping-status');
    const pingBar = document.getElementById('ping-bar');
    if (pingStatus) pingStatus.innerText = "RECHARGING";
    if (pingBar) pingBar.style.width = "0%";

    let charge = 0;
    const interval = setInterval(() => {
      charge += 20;
      if (pingBar) pingBar.style.width = charge + "%";
      if (charge >= 100) {
        clearInterval(interval);
        window.gameState.survival.pingReady = true;
        if (pingStatus) pingStatus.innerText = "READY";
      }
    }, 200);
  }

  interactNearest() {
    const p = this.player;
    for (let node of this.nodes) {
      const dist = Math.hypot(node.x - p.x, node.y - p.y);
      if (dist < 50) {
        window.soundEngine.playTerminalBeep();
        
        if (node.id === 'reactor') {
          // Trigger Climax Confrontation
          this.triggerConfrontation();
          return;
        }

        // Rescue/Interact with node
        node.rescued = true;
        if (node.id === 'chen') window.gameState.survival.crew.chen = true;
        if (node.id === 'murthy') {
          window.gameState.survival.crew.murthy = true;
          window.gameState.survival.dataSecured = true;
        }
        if (node.id === 'patel') window.gameState.survival.crew.patel = true;
        if (node.id === 'stasis') window.gameState.survival.crew.stasis = true;
        if (node.id === 'tanaka') window.gameState.survival.crew.tanaka = true;

        this.showTerminalModal(node.name, node.desc);
        this.updateHUDChecklist();
        return;
      }
    }
  }

  showTerminalModal(title, text) {
    const modal = document.getElementById('terminal-interaction-modal');
    const titleEl = document.getElementById('interact-title');
    const descEl = document.getElementById('interact-desc');
    if (modal && titleEl && descEl) {
      titleEl.innerText = title;
      descEl.innerText = text;
      modal.classList.remove('hidden');
    }
  }

  triggerConfrontation() {
    const modal = document.getElementById('modal-confrontation');
    if (modal) {
      modal.classList.remove('hidden');
      window.soundEngine.playEntityHarmonic(true);
    }
  }

  updateHUDChecklist() {
    const s = window.gameState.survival;
    if (s.crew.chen) {
      const item = document.getElementById('task-sarah');
      const row = document.getElementById('crew-chen');
      if (item) item.classList.add('done');
      if (row) {
        row.querySelector('.crew-status').innerText = "RESCUED";
        row.querySelector('.crew-status').className = "crew-status saved";
      }
    }
    if (s.dataSecured) {
      const item = document.getElementById('task-data');
      const row = document.getElementById('crew-murthy');
      if (item) item.classList.add('done');
      if (row) {
        row.querySelector('.crew-status').innerText = "DATA EXTRACTED";
        row.querySelector('.crew-status').className = "crew-status saved";
      }
    }
    if (s.crew.stasis) {
      const item = document.getElementById('task-stasis');
      const row = document.getElementById('crew-stasis');
      if (item) item.classList.add('done');
      if (row) {
        row.querySelector('.crew-status').innerText = "STABILIZED";
        row.querySelector('.crew-status').className = "crew-status saved";
      }
    }
    if (s.crew.patel) {
      const row = document.getElementById('crew-patel');
      if (row) {
        row.querySelector('.crew-status').innerText = "STABILIZED";
        row.querySelector('.crew-status').className = "crew-status saved";
      }
    }
  }

  update() {
    // Player Movement
    let vx = 0;
    let vy = 0;
    if (this.keys['w'] || this.keys['arrowup']) vy -= 1;
    if (this.keys['s'] || this.keys['arrowdown']) vy += 1;
    if (this.keys['a'] || this.keys['arrowleft']) vx -= 1;
    if (this.keys['d'] || this.keys['arrowright']) vx += 1;

    if (vx !== 0 && vy !== 0) {
      vx *= 0.7071;
      vy *= 0.7071;
    }

    const nextX = this.player.x + vx * this.player.speed;
    const nextY = this.player.y + vy * this.player.speed;

    // Basic Bounds check
    if (nextX > 60 && nextX < 840) this.player.x = nextX;
    if (nextY > 60 && nextY < 540) this.player.y = nextY;

    // Update Pings
    for (let i = this.pings.length - 1; i >= 0; i--) {
      const p = this.pings[i];
      p.radius += p.speed;
      p.opacity -= 0.012;
      if (p.opacity <= 0 || p.radius >= p.maxRadius) {
        this.pings.splice(i, 1);
      }
    }

    // Entity Movement & Behavior
    const edx = this.entity.targetX - this.entity.x;
    const edy = this.entity.targetY - this.entity.y;
    const edist = Math.hypot(edx, edy);
    if (edist > 10) {
      this.entity.x += (edx / edist) * this.entity.speed;
      this.entity.y += (edy / edist) * this.entity.speed;
    } else {
      // Pick random patrol point in Sector 6/7
      this.entity.targetX = 640 + Math.random() * 160;
      this.entity.targetY = 360 + Math.random() * 160;
    }

    this.entity.phase += 0.05;

    // Check distance between player and entity
    const distToPlayer = Math.hypot(this.entity.x - this.player.x, this.entity.y - this.player.y);
    const banner = document.getElementById('entity-warning');
    const specState = document.getElementById('spec-state');

    if (distToPlayer < 120) {
      if (banner) banner.classList.remove('hidden');
      if (specState) {
        specState.innerText = "AGGRESSIVE // 432 Hz";
        specState.className = "red-text";
      }
      if (Math.random() < 0.04) window.soundEngine.playGeiger();
    } else if (distToPlayer < 280) {
      if (banner) banner.classList.remove('hidden');
      if (specState) {
        specState.innerText = "TRACKING // HARMONIC";
        specState.className = "yellow-text";
      }
    } else {
      if (banner) banner.classList.add('hidden');
      if (specState) {
        specState.innerText = "DORMANT";
        specState.className = "cyan-text";
      }
    }

    // Check Sector Name
    this.updateSectorName();
  }

  updateSectorName() {
    const el = document.getElementById('current-sector-name');
    if (!el) return;
    const x = this.player.x;
    const y = this.player.y;

    if (x < 240 && y < 380) el.innerText = "SECTOR: AIRLOCK 3 (WEST ENTRY)";
    else if (x < 300 && y >= 380) el.innerText = "SECTOR: MEDICAL BAY";
    else if (x >= 320 && x <= 580 && y < 250) el.innerText = "SECTOR: COMMAND CENTER";
    else if (x >= 320 && x <= 580 && y >= 300) el.innerText = "SECTOR: CRYO-STASIS DECK B";
    else if (x > 620 && y < 300) el.innerText = "SECTOR: DEEP RESEARCH LAB";
    else if (x > 600 && y >= 320) el.innerText = "SECTOR: TOKAMAK REACTOR CORE";
    else el.innerText = "SECTOR: CENTRAL CORRIDORS";
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Deep Dark Space Background
    ctx.fillStyle = "#03060a";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Grid Lines (faint)
    ctx.strokeStyle = "rgba(0, 240, 255, 0.04)";
    ctx.lineWidth = 1;
    for (let x = 0; x < this.canvas.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < this.canvas.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.canvas.width, y);
      ctx.stroke();
    }

    // Draw Acoustic Waves (Pings)
    for (let p of this.pings) {
      ctx.save();
      ctx.strokeStyle = `rgba(0, 240, 255, ${p.opacity})`;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.stroke();

      // Inner faint secondary wave
      if (p.radius > 30) {
        ctx.strokeStyle = `rgba(191, 90, 242, ${p.opacity * 0.4})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius - 20, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Determine illumination level for elements based on distance to any ping wavefront
    const getIllumination = (x, y) => {
      let maxIllum = 0.06; // ambient dark level
      // Distance to player
      const dPlayer = Math.hypot(this.player.x - x, this.player.y - y);
      if (dPlayer < 65) maxIllum = Math.max(maxIllum, 1 - dPlayer / 65);

      // Distance to ping wavefronts
      for (let p of this.pings) {
        const dPing = Math.hypot(p.x - x, p.y - y);
        const waveDist = Math.abs(dPing - p.radius);
        if (waveDist < 35) {
          const illum = (1 - waveDist / 35) * p.opacity;
          if (illum > maxIllum) maxIllum = illum;
        }
      }
      return Math.min(1, maxIllum);
    };

    // Draw Walls
    for (let w of this.walls) {
      const midX = (w.x1 + w.x2) / 2;
      const midY = (w.y1 + w.y2) / 2;
      const illum = getIllumination(midX, midY);

      if (illum > 0.05) {
        ctx.save();
        ctx.strokeStyle = `rgba(0, 240, 255, ${illum * 0.85})`;
        ctx.lineWidth = 3;
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = illum * 12;
        ctx.beginPath();
        ctx.moveTo(w.x1, w.y1);
        ctx.lineTo(w.x2, w.y2);
        ctx.stroke();
        ctx.restore();
      }
    }

    // Draw Interactive Nodes (Crew / Terminals)
    for (let n of this.nodes) {
      const illum = getIllumination(n.x, n.y);
      if (illum > 0.1) {
        ctx.save();
        ctx.fillStyle = n.rescued ? '#4ade80' : n.color;
        ctx.globalAlpha = illum;
        ctx.shadowColor = n.color;
        ctx.shadowBlur = 10;
        
        ctx.beginPath();
        ctx.arc(n.x, n.y, 7, 0, Math.PI * 2);
        ctx.fill();

        // Label
        ctx.fillStyle = "#ffffff";
        ctx.font = "10px 'Share Tech Mono'";
        ctx.fillText(n.name, n.x - 20, n.y - 12);
        ctx.restore();
      }
    }

    // Draw The Entity (Crystalline resonance cloud)
    const entityIllum = getIllumination(this.entity.x, this.entity.y);
    if (entityIllum > 0.15) {
      ctx.save();
      const r = this.entity.radius + Math.sin(this.entity.phase) * 4;
      const grad = ctx.createRadialGradient(this.entity.x, this.entity.y, 2, this.entity.x, this.entity.y, r * 2);
      grad.addColorStop(0, "rgba(255, 255, 255, 0.9)");
      grad.addColorStop(0.4, "rgba(191, 90, 242, 0.8)");
      grad.addColorStop(1, "rgba(58, 12, 163, 0)");

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(this.entity.x, this.entity.y, r * 2, 0, Math.PI * 2);
      ctx.fill();

      // Resonant spikes
      ctx.strokeStyle = `rgba(191, 90, 242, ${entityIllum})`;
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 6; i++) {
        const ang = this.entity.phase + (i * Math.PI / 3);
        ctx.beginPath();
        ctx.moveTo(this.entity.x, this.entity.y);
        ctx.lineTo(this.entity.x + Math.cos(ang) * (r + 14), this.entity.y + Math.sin(ang) * (r + 14));
        ctx.stroke();
      }
      ctx.restore();
    }

    // Draw Player (Spacesuit Avatar)
    ctx.save();
    ctx.fillStyle = "#00f0ff";
    ctx.shadowColor = "#00f0ff";
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(this.player.x, this.player.y, this.player.radius, 0, Math.PI * 2);
    ctx.fill();

    // Direction indicator
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(this.player.x, this.player.y, this.player.radius + 3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Render Mini Spectrogram
    this.renderSpectrogram();
  }

  renderSpectrogram() {
    if (!this.spectroCtx) return;
    const sCtx = this.spectroCtx;
    const w = this.spectroCanvas.width;
    const h = this.spectroCanvas.height;

    sCtx.fillStyle = "rgba(3, 7, 18, 0.3)";
    sCtx.fillRect(0, 0, w, h);

    // Shift waves
    this.spectroWave.shift();
    const distToEntity = Math.hypot(this.entity.x - this.player.x, this.entity.y - this.player.y);
    const amp = Math.max(2, 35 * (1 - Math.min(1, distToEntity / 400)));
    this.spectroWave.push(Math.sin(Date.now() * 0.015) * amp);

    sCtx.strokeStyle = distToEntity < 150 ? "#ff3344" : "#00f0ff";
    sCtx.lineWidth = 1.5;
    sCtx.beginPath();
    const step = w / this.spectroWave.length;
    for (let i = 0; i < this.spectroWave.length; i++) {
      const y = (h / 2) + this.spectroWave[i];
      if (i === 0) sCtx.moveTo(0, y);
      else sCtx.lineTo(i * step, y);
    }
    sCtx.stroke();
  }

  loop() {
    if (!this.isRunning) return;
    this.update();
    this.render();
    requestAnimationFrame(() => this.loop());
  }
}

window.radarEngine = null;
