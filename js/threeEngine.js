/**
 * ARUNA STATION: Real-Time 3D Lunar Acoustic Simulation Engine
 * Built with Three.js. Features realistic 3D lunar base modules, dynamic lighting,
 * astronaut helmet visor HUD, 3D acoustic sonar ping shockwaves, procedural textures,
 * interactive 3D crew & consoles, and the reactive 3D Alien Entity.
 */

class Station3DEngine {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.isRunning = false;
    this.viewMode = '3D'; // '3D' or '2D'
    this.cameraMode = 'FIRST_PERSON'; // 'FIRST_PERSON' or 'THIRD_PERSON'
    this.flashlightOn = true;

    // Movement & Controls
    this.keys = {};
    this.mouse = { x: 0, y: 0, isDown: false, prevX: 0, prevY: 0 };
    this.yaw = 0;
    this.pitch = 0;
    this.targetYaw = 0;
    this.targetPitch = 0;

    // Player 3D Position (maps to 2D radar: (x-450)*0.1, (y-300)*0.1)
    this.player = {
      x: -33, // Default Airlock 3 start
      y: 1.4, // Eye level
      z: 0,
      vx: 0,
      vz: 0,
      speed: 0.16,
      walkBob: 0
    };

    // 3D Sonar Ping Shockwaves
    this.pingWaves = [];

    // Entity 3D State
    this.entity = {
      mesh: null,
      light: null,
      core: null,
      shards: [],
      particles: null,
      x: 27,
      y: 1.6,
      z: 14,
      targetX: 27,
      targetZ: 14,
      alertness: 0,
      phase: 0
    };

    // Interactive 3D Nodes
    this.interactables = [];
    this.activeInteractable = null;

    // Animated objects
    this.animatedObjects = [];

    this.initScene();
  }

  // Generate Procedural Sci-Fi Textures
  generateTextures() {
    // 1. Metal Panel Wall Texture
    const wallCanvas = document.createElement('canvas');
    wallCanvas.width = 512;
    wallCanvas.height = 512;
    const wctx = wallCanvas.getContext('2d');
    wctx.fillStyle = '#0f172a';
    wctx.fillRect(0, 0, 512, 512);

    // Metal panel bevels
    wctx.strokeStyle = '#1e293b';
    wctx.lineWidth = 6;
    wctx.strokeRect(10, 10, 492, 492);
    wctx.strokeStyle = '#334155';
    wctx.lineWidth = 2;
    wctx.strokeRect(20, 20, 472, 472);

    // Hazard bottom stripe
    const stripeGrad = wctx.createLinearGradient(0, 450, 0, 512);
    stripeGrad.addColorStop(0, '#eab308');
    stripeGrad.addColorStop(1, '#ca8a04');
    wctx.fillStyle = stripeGrad;
    wctx.fillRect(0, 450, 512, 62);
    wctx.fillStyle = '#0f172a';
    for (let i = -50; i < 600; i += 40) {
      wctx.beginPath();
      wctx.moveTo(i, 512);
      wctx.lineTo(i + 30, 450);
      wctx.lineTo(i + 50, 450);
      wctx.lineTo(i + 20, 512);
      wctx.closePath();
      wctx.fill();
    }

    // Cyan conduit line
    wctx.strokeStyle = '#00f0ff';
    wctx.lineWidth = 4;
    wctx.shadowColor = '#00f0ff';
    wctx.shadowBlur = 10;
    wctx.beginPath();
    wctx.moveTo(0, 120);
    wctx.lineTo(512, 120);
    wctx.stroke();
    wctx.shadowBlur = 0;

    // 2. Grated Steel Floor Texture
    const floorCanvas = document.createElement('canvas');
    floorCanvas.width = 256;
    floorCanvas.height = 256;
    const fctx = floorCanvas.getContext('2d');
    fctx.fillStyle = '#0b0f19';
    fctx.fillRect(0, 0, 256, 256);
    fctx.strokeStyle = '#1e293b';
    fctx.lineWidth = 2;
    for (let x = 0; x <= 256; x += 16) {
      fctx.beginPath();
      fctx.moveTo(x, 0); fctx.lineTo(x, 256);
      fctx.stroke();
    }
    for (let y = 0; y <= 256; y += 16) {
      fctx.beginPath();
      fctx.moveTo(0, y); fctx.lineTo(256, y);
      fctx.stroke();
    }

    // 3. Screen / Hologram Texture
    const screenCanvas = document.createElement('canvas');
    screenCanvas.width = 512;
    screenCanvas.height = 256;
    const sctx = screenCanvas.getContext('2d');
    sctx.fillStyle = '#020617';
    sctx.fillRect(0, 0, 512, 256);
    sctx.strokeStyle = '#00f0ff';
    sctx.lineWidth = 3;
    sctx.strokeRect(6, 6, 500, 244);
    sctx.fillStyle = '#00f0ff';
    sctx.font = 'bold 22px Orbitron, monospace';
    sctx.fillText('ARUNA LUNAR BASE // SYS-44', 24, 40);
    sctx.fillStyle = '#94a3b8';
    sctx.font = '16px monospace';
    sctx.fillText('O2 BUFFER: 88.4% [STABLE]', 24, 75);
    sctx.fillText('RESONANCE: 432.09 Hz [DETECTED]', 24, 105);
    sctx.fillText('SECTOR 4: SEVERED BUSBAR', 24, 135);
    
    // Waveform graphic
    sctx.strokeStyle = '#22c55e';
    sctx.lineWidth = 2;
    sctx.beginPath();
    for (let x = 24; x < 480; x += 6) {
      const y = 200 + Math.sin(x * 0.08) * 25 + (Math.random() * 8 - 4);
      if (x === 24) sctx.moveTo(x, y);
      else sctx.lineTo(x, y);
    }
    sctx.stroke();

    return {
      wall: new THREE.CanvasTexture(wallCanvas),
      floor: new THREE.CanvasTexture(floorCanvas),
      screen: new THREE.CanvasTexture(screenCanvas)
    };
  }

  initScene() {
    if (!window.THREE) {
      console.warn("Three.js not yet loaded. Will retry.");
      return;
    }

    // 1. Scene & Fog
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x020408);
    this.scene.fog = new THREE.FogExp2(0x020408, 0.038); // Dense atmospheric lunar dust fog

    // 2. Camera
    const aspect = this.container.clientWidth / this.container.clientHeight || 900 / 600;
    this.camera = new THREE.PerspectiveCamera(72, aspect, 0.1, 150);
    this.camera.position.set(this.player.x, this.player.y, this.player.z);

    // 3. WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.domElement.id = 'three-canvas';
    this.container.appendChild(this.renderer.domElement);

    // Textures
    this.textures = this.generateTextures();
    this.textures.floor.wrapS = THREE.RepeatWrapping;
    this.textures.floor.wrapT = THREE.RepeatWrapping;
    this.textures.floor.repeat.set(24, 24);

    this.textures.wall.wrapS = THREE.RepeatWrapping;
    this.textures.wall.wrapT = THREE.RepeatWrapping;
    this.textures.wall.repeat.set(1, 1);

    // 4. Lighting System
    this.initLighting();

    // 5. Build 3D Lunar Base Architecture
    this.buildStationArchitecture();

    // 6. Spawn 3D Crew & Terminals
    this.buildCrewAndTerminals();

    // 7. Spawn The 3D Alien Entity
    this.buildEntity3D();

    // 8. Player 3D Character (Visible in 3rd person)
    this.buildPlayerCharacter();

    // 9. Input & Event Listeners
    this.initInputListeners();

    // Resize Handler
    window.addEventListener('resize', () => this.onWindowResize());
  }

  initLighting() {
    // Dim ambient space glow
    this.ambientLight = new THREE.AmbientLight(0x0c1524, 0.8);
    this.scene.add(this.ambientLight);

    // Astronaut Shoulder Flashlight (Attached to Camera)
    this.flashlight = new THREE.SpotLight(0xe0f2fe, 3.2, 38, Math.PI / 5, 0.35, 1.2);
    this.flashlight.position.set(0, 0, 0);
    this.flashlight.castShadow = true;
    this.flashlight.shadow.mapSize.width = 1024;
    this.flashlight.shadow.mapSize.height = 1024;
    this.flashlight.shadow.bias = -0.001;
    this.camera.add(this.flashlight);
    this.camera.add(this.flashlight.target);
    this.flashlight.target.position.set(0, 0, -5);
    this.scene.add(this.camera);

    // Station Emergency Beacons
    this.emergencyLights = [];
    const beaconPositions = [
      { x: -33, y: 3.4, z: 0, col: 0xef4444 }, // Airlock Red Strobe
      { x: 0, y: 3.4, z: -15, col: 0x00f0ff }, // Command Deck Cyan
      { x: 29, y: 3.4, z: -16, col: 0x38bdf8 }, // Lab Ice Blue
      { x: 0, y: 3.4, z: 10, col: 0x10b981 },  // Cryo Green
      { x: 31, y: 4.2, z: 17, col: 0xa855f7 }  // Reactor Magenta
    ];

    beaconPositions.forEach(b => {
      const pLight = new THREE.PointLight(b.col, 1.8, 18, 1.8);
      pLight.position.set(b.x, b.y, b.z);
      this.scene.add(pLight);
      this.emergencyLights.push(pLight);

      // Light fixture mesh
      const fixGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 8);
      const fixMat = new THREE.MeshBasicMaterial({ color: b.col });
      const fixMesh = new THREE.Mesh(fixGeo, fixMat);
      fixMesh.position.set(b.x, b.y + 0.1, b.z);
      this.scene.add(fixMesh);
    });
  }

  // Procedural 3D Station Rooms & Corridors
  buildStationArchitecture() {
    const wallMat = new THREE.MeshStandardMaterial({
      map: this.textures.wall,
      roughness: 0.6,
      metalness: 0.5
    });

    const floorMat = new THREE.MeshStandardMaterial({
      map: this.textures.floor,
      roughness: 0.7,
      metalness: 0.6
    });

    const ceilingMat = new THREE.MeshStandardMaterial({
      color: 0x070b14,
      roughness: 0.8,
      metalness: 0.4
    });

    // Main Station Floor (80m x 55m)
    const floorGeo = new THREE.PlaneGeometry(84, 56);
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0, 0);
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Ceiling with Conduit Beams
    const ceilingGeo = new THREE.PlaneGeometry(84, 56);
    const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(0, 4.4, 0);
    this.scene.add(ceiling);

    // Outer Perimeter Walls
    this.createWall(0, 2.2, -28, 84, 4.4, 0.8, wallMat); // North
    this.createWall(0, 2.2, 28, 84, 4.4, 0.8, wallMat);  // South
    this.createWall(-42, 2.2, 0, 0.8, 4.4, 56, wallMat); // West
    this.createWall(42, 2.2, 0, 0.8, 4.4, 56, wallMat);  // East

    // Inner Partition Walls (Translating 2D radar layout into 3D)
    // Airlock 3 Module Corridors (West)
    this.createWall(-30, 2.2, -6, 24, 4.4, 0.6, wallMat);
    this.createWall(-30, 2.2, 6, 24, 4.4, 0.6, wallMat);
    this.createWall(-18, 2.2, -3.5, 0.6, 4.4, 5, wallMat);
    this.createWall(-18, 2.2, 3.5, 0.6, 4.4, 5, wallMat); // Door gap in center

    // Command Center Walls (Center-North: x from -13 to 13, z from -28 to -6)
    this.createWall(-13, 2.2, -17, 0.6, 4.4, 22, wallMat);
    this.createWall(13, 2.2, -17, 0.6, 4.4, 22, wallMat);
    this.createWall(-8, 2.2, -6, 10, 4.4, 0.6, wallMat);
    this.createWall(8, 2.2, -6, 10, 4.4, 0.6, wallMat); // Doorway into Command

    // Stasis Deck B (Center-South: x from -11 to 11, z from 2 to 18)
    this.createWall(-11, 2.2, 10, 0.6, 4.4, 16, wallMat);
    this.createWall(11, 2.2, 10, 0.6, 4.4, 16, wallMat);
    this.createWall(0, 2.2, 2, 22, 4.4, 0.6, wallMat);
    this.createWall(-6, 2.2, 18, 10, 4.4, 0.6, wallMat);
    this.createWall(6, 2.2, 18, 10, 4.4, 0.6, wallMat);

    // Deep Lab (North-East: x from 19 to 42, z from -28 to -3)
    this.createWall(19, 2.2, -15.5, 0.6, 4.4, 25, wallMat);
    this.createWall(27, 2.2, -3, 16, 4.4, 0.6, wallMat); // Doorway

    // Tokamak Reactor Chamber (South-East: x from 17 to 42, z from 5 to 28)
    this.createWall(17, 2.2, 16.5, 0.6, 4.4, 23, wallMat);
    this.createWall(26, 2.2, 5, 18, 4.4, 0.6, wallMat); // Doorway

    // Medical Bay (South-West: x from -35 to -17, z from 12 to 28)
    this.createWall(-17, 2.2, 20, 0.6, 4.4, 16, wallMat);
    this.createWall(-26, 2.2, 12, 18, 4.4, 0.6, wallMat);

    // Overhead Structural Arches (Sci-fi feel)
    for (let x = -36; x <= 36; x += 12) {
      const archGeo = new THREE.BoxGeometry(0.8, 0.4, 20);
      const archMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 });
      const arch = new THREE.Mesh(archGeo, archMat);
      arch.position.set(x, 4.2, 0);
      this.scene.add(arch);
    }
  }

  createWall(x, y, z, w, h, d, mat) {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.scene.add(mesh);
  }

  // Build Interactive 3D Nodes: Crew Models, Consoles, Meridian Artifact & Reactor
  buildCrewAndTerminals() {
    // 1. COMMAND DECK: Captain Sarah Chen & Hologram Table
    this.buildHoloTable(0, 0, -16);
    this.buildCrewAstronaut('chen', 'Captain Sarah Chen', 0, 0, -13, 0xffb703, 'Locate Sarah Chen', 'Sarah clutches her motion sensor. "Okafor, sound attracts it! The entity nests in the reactor!"');

    // 2. DEEP LAB: Dr. James Murthy & The Meridian Signal Artifact (432 Hz)
    this.buildAlienArtifact(29, 1.6, -16);
    this.buildCrewAstronaut('murthy', 'Dr. James Murthy', 26, 0, -16, 0x00f0ff, 'Recover Meridian Data', 'Murthy hands you the glowing optical drive: "The 432 Hz signal is alien. Take it to Earth!"');

    // 3. MEDICAL BAY: Dr. Kavya Patel in Medical Pod
    this.buildMedicalPod(-26, 0, 20);
    this.buildCrewAstronaut('patel', 'Dr. Kavya Patel', -26, 0, 20, 0xef4444, 'Stabilize Dr. Patel', 'You patch her EVA secondary oxygen seal. Heart telemetry stabilizes.');

    // 4. CRYO-STASIS DECK B: Specialists Vance & Rostova Cryo Tubes
    this.buildCryoBay(0, 0, 10);
    this.buildInteractiveNode('stasis', 'Cryo-Stasis Bay (Vance & Rostova)', 0, 1.2, 10, 0x10b981, 'Reboot Cryo-Stasis', 'Cryo-stasis auxiliary power restored. Marcus Vance and Elena Rostova stabilized.');

    // 5. ENGINEERING: Yuki Tanaka & Coolant Loops
    this.buildCoolantStation(22, 0, 20);
    this.buildCrewAstronaut('tanaka', 'Engineer Yuki Tanaka', 22, 0, 20, 0xe0f2fe, 'Consult Yuki Tanaka', 'Yuki by the coolant loops: "The entity is in the Tokamak core! Choose how to confront it!"');

    // 6. TOKAMAK FUSION REACTOR CORE (Grand Climax)
    this.buildTokamakReactor(31, 0, 17);
  }

  buildHoloTable(x, y, z) {
    const baseGeo = new THREE.CylinderGeometry(2, 2.2, 0.9, 16);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.set(x, y + 0.45, z);
    this.scene.add(base);

    // Rotating Wireframe Hologram Moon
    const holoGeo = new THREE.SphereGeometry(1.2, 16, 16);
    const holoMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, wireframe: true, transparent: true, opacity: 0.65 });
    const holoMoon = new THREE.Mesh(holoGeo, holoMat);
    holoMoon.position.set(x, y + 2.2, z);
    this.scene.add(holoMoon);
    this.animatedObjects.push({ mesh: holoMoon, rotY: 0.015 });

    // Hologram pedestal light
    const holoLight = new THREE.PointLight(0x00f0ff, 2, 8);
    holoLight.position.set(x, y + 1.8, z);
    this.scene.add(holoLight);
  }

  // The 432 Hz Obsidian Alien Artifact
  buildAlienArtifact(x, y, z) {
    const pedGeo = new THREE.CylinderGeometry(0.8, 1, 1, 8);
    const pedMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9 });
    const ped = new THREE.Mesh(pedGeo, pedMat);
    ped.position.set(x, 0.5, z);
    this.scene.add(ped);

    // Floating Geometric Dodecahedron Artifact
    const artGeo = new THREE.DodecahedronGeometry(0.65, 0);
    const artMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      roughness: 0.1,
      metalness: 0.9,
      emissive: 0x007799,
      emissiveIntensity: 0.8
    });
    const artifact = new THREE.Mesh(artGeo, artMat);
    artifact.position.set(x, y, z);
    this.scene.add(artifact);

    // Surrounding rotating crystal shards
    const shardsGroup = new THREE.Group();
    shardsGroup.position.set(x, y, z);
    for (let i = 0; i < 6; i++) {
      const sGeo = new THREE.ConeGeometry(0.12, 0.4, 4);
      const sMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true });
      const shard = new THREE.Mesh(sGeo, sMat);
      const angle = (i / 6) * Math.PI * 2;
      shard.position.set(Math.cos(angle) * 1.1, Math.sin(angle * 2) * 0.25, Math.sin(angle) * 1.1);
      shardsGroup.add(shard);
    }
    this.scene.add(shardsGroup);

    this.animatedObjects.push({ mesh: artifact, rotY: 0.02, rotX: 0.01, bob: true, baseY: y });
    this.animatedObjects.push({ mesh: shardsGroup, rotY: -0.03 });

    const artLight = new THREE.PointLight(0x00f0ff, 3, 10);
    artLight.position.set(x, y, z);
    this.scene.add(artLight);
  }

  buildMedicalPod(x, y, z) {
    const podGeo = new THREE.BoxGeometry(2.4, 1.2, 1.4);
    const podMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7 });
    const pod = new THREE.Mesh(podGeo, podMat);
    pod.position.set(x, y + 0.6, z);
    this.scene.add(pod);

    // Glowing glass dome
    const glassGeo = new THREE.CylinderGeometry(0.6, 0.6, 2.2, 12, 1, false, 0, Math.PI);
    const glassMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.4, wireframe: true });
    const glass = new THREE.Mesh(glassGeo, glassMat);
    glass.rotation.z = Math.PI / 2;
    glass.position.set(x, y + 1.2, z);
    this.scene.add(glass);
  }

  buildCryoBay(x, y, z) {
    for (let i = -1; i <= 1; i += 2) {
      const tubeGeo = new THREE.CylinderGeometry(0.7, 0.7, 2.8, 12);
      const tubeMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 });
      const tube = new THREE.Mesh(tubeGeo, tubeMat);
      tube.position.set(x + i * 2.2, 1.4, z);
      this.scene.add(tube);

      const glowGeo = new THREE.CylinderGeometry(0.55, 0.55, 2, 8);
      const glowMat = new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.5 });
      const glow = new THREE.Mesh(glowGeo, glowMat);
      glow.position.set(x + i * 2.2, 1.4, z);
      this.scene.add(glow);
    }
  }

  buildCoolantStation(x, y, z) {
    const tankGeo = new THREE.CylinderGeometry(1.2, 1.2, 3.6, 12);
    const tankMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 });
    const tank = new THREE.Mesh(tankGeo, tankMat);
    tank.position.set(x, 1.8, z);
    this.scene.add(tank);
  }

  // Giant Tokamak Fusion Reactor
  buildTokamakReactor(x, y, z) {
    const group = new THREE.Group();
    group.position.set(x, 2, z);

    // Magnetic Torus Ring
    const torusGeo = new THREE.TorusGeometry(3.8, 1.1, 16, 32);
    const torusMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.3,
      metalness: 0.9
    });
    const torus = new THREE.Mesh(torusGeo, torusMat);
    torus.rotation.x = Math.PI / 2;
    group.add(torus);

    // Glowing Plasma Core Ring
    const plasmaGeo = new THREE.TorusGeometry(3.8, 0.45, 12, 32);
    const plasmaMat = new THREE.MeshBasicMaterial({
      color: 0xc084fc,
      wireframe: true,
      transparent: true,
      opacity: 0.85
    });
    const plasma = new THREE.Mesh(plasmaGeo, plasmaMat);
    plasma.rotation.x = Math.PI / 2;
    group.add(plasma);
    this.animatedObjects.push({ mesh: plasma, rotZ: 0.04 });

    // Central Energy Sphere
    const coreGeo = new THREE.SphereGeometry(1.4, 16, 16);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0xa855f7, wireframe: true });
    const core = new THREE.Mesh(coreGeo, coreMat);
    group.add(core);
    this.animatedObjects.push({ mesh: core, rotY: 0.03, rotX: 0.02 });

    // Reactor Chamber Violet Light
    const reactorLight = new THREE.PointLight(0xa855f7, 4.5, 22, 1.5);
    group.add(reactorLight);
    this.animatedObjects.push({ light: reactorLight, pulse: true });

    this.scene.add(group);

    // Interactive Trigger for Climax Confrontation
    this.buildInteractiveNode('reactor', 'Tokamak Reactor Core', x, 1.5, z, 0xa855f7, 'Confront The Entity', 'Confrontation sequence initiated.');
  }

  // 3D Astronaut Crew Member Model
  buildCrewAstronaut(id, name, x, y, z, colorHex, taskName, desc) {
    const group = new THREE.Group();
    group.position.set(x, y, z);

    // Legs
    const legGeo = new THREE.CylinderGeometry(0.18, 0.22, 1, 8);
    const suitMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.6, metalness: 0.3 });
    const legL = new THREE.Mesh(legGeo, suitMat); legL.position.set(-0.25, 0.5, 0);
    const legR = new THREE.Mesh(legGeo, suitMat); legR.position.set(0.25, 0.5, 0);
    group.add(legL); group.add(legR);

    // Torso
    const torsoGeo = new THREE.BoxGeometry(0.8, 0.9, 0.5);
    const torso = new THREE.Mesh(torsoGeo, suitMat);
    torso.position.set(0, 1.35, 0);
    group.add(torso);

    // Life Support Backpack
    const packGeo = new THREE.BoxGeometry(0.65, 0.8, 0.35);
    const packMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7 });
    const pack = new THREE.Mesh(packGeo, packMat);
    pack.position.set(0, 1.35, -0.38);
    group.add(pack);

    // Helmet & Gold Visor
    const helmGeo = new THREE.SphereGeometry(0.36, 12, 12);
    const helm = new THREE.Mesh(helmGeo, suitMat);
    helm.position.set(0, 2.05, 0);
    group.add(helm);

    const visorGeo = new THREE.SphereGeometry(0.3, 10, 10, 0, Math.PI, 0, Math.PI);
    const visorMat = new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.1, metalness: 0.95 });
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.rotation.y = Math.PI / 2;
    visor.position.set(0, 2.05, 0.12);
    group.add(visor);

    // Role Indicator Beacon Light on Shoulder
    const beaconLight = new THREE.PointLight(colorHex, 1.2, 5);
    beaconLight.position.set(0.35, 1.8, 0);
    group.add(beaconLight);

    this.scene.add(group);

    this.buildInteractiveNode(id, name, x, 1.5, z, colorHex, taskName, desc);
  }

  buildInteractiveNode(id, name, x, y, z, colorHex, taskName, desc) {
    // 3D Floating Target Reticle Bracket
    const ringGeo = new THREE.RingGeometry(0.4, 0.5, 16);
    const ringMat = new THREE.MeshBasicMaterial({ color: colorHex, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.set(x, y + 0.8, z);
    this.scene.add(ring);

    this.animatedObjects.push({ mesh: ring, rotZ: 0.03, bob: true, baseY: y + 0.8 });

    this.interactables.push({
      id: id,
      name: name,
      x: x,
      y: y,
      z: z,
      taskName: taskName,
      desc: desc,
      color: colorHex,
      mesh: ring,
      rescued: false
    });
  }

  // Build The 3D Alien Entity (Fractal Consciousness)
  buildEntity3D() {
    this.entityGroup = new THREE.Group();
    this.entityGroup.position.set(this.entity.x, this.entity.y, this.entity.z);

    // 1. Pulsing Crystalline Core
    const coreGeo = new THREE.IcosahedronGeometry(0.85, 1);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6,
      emissive: 0x4c1d95,
      emissiveIntensity: 1.2,
      wireframe: true,
      roughness: 0.2,
      metalness: 0.8
    });
    this.entity.core = new THREE.Mesh(coreGeo, coreMat);
    this.entityGroup.add(this.entity.core);

    // 2. Orbiting Geometric Shards
    for (let i = 0; i < 12; i++) {
      const sGeo = new THREE.ConeGeometry(0.18, 0.7, 4);
      const sMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, wireframe: true, transparent: true, opacity: 0.8 });
      const shard = new THREE.Mesh(sGeo, sMat);
      const phi = Math.acos(-1 + (2 * i) / 12);
      const theta = Math.sqrt(12 * Math.PI) * phi;
      shard.position.set(Math.cos(theta) * Math.sin(phi) * 1.5, Math.cos(phi) * 1.5, Math.sin(theta) * Math.sin(phi) * 1.5);
      this.entity.shards.push(shard);
      this.entityGroup.add(shard);
    }

    // 3. Floating Luminescent Particle Aura (300 particles)
    const partCount = 280;
    const partGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(partCount * 3);
    for (let i = 0; i < partCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 4.5;
      positions[i + 1] = (Math.random() - 0.5) * 4.5;
      positions[i + 2] = (Math.random() - 0.5) * 4.5;
    }
    partGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const partMat = new THREE.PointsMaterial({ color: 0xc084fc, size: 0.08, transparent: true, opacity: 0.75 });
    this.entity.particles = new THREE.Points(partGeo, partMat);
    this.entityGroup.add(this.entity.particles);

    // 4. Entity Light Emission
    this.entity.light = new THREE.PointLight(0xa855f7, 3.5, 18, 1.4);
    this.entityGroup.add(this.entity.light);

    this.scene.add(this.entityGroup);
  }

  // Build Player 3D Character (Visible in 3rd person)
  buildPlayerCharacter() {
    this.playerGroup = new THREE.Group();
    const suitMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5, metalness: 0.4 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 });

    // Torso
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.9, 0.5), suitMat);
    torso.position.y = 1.25;
    this.playerGroup.add(torso);

    // Legs
    const legL = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.9, 8), darkMat);
    legL.position.set(-0.25, 0.45, 0);
    const legR = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.9, 8), darkMat);
    legR.position.set(0.25, 0.45, 0);
    this.playerGroup.add(legL);
    this.playerGroup.add(legR);

    // Backpack with Sonar Dish
    const pack = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.8, 0.35), darkMat);
    pack.position.set(0, 1.25, -0.38);
    this.playerGroup.add(pack);

    // Helmet & Visor
    const helm = new THREE.Mesh(new THREE.SphereGeometry(0.36, 12, 12), suitMat);
    helm.position.y = 1.95;
    this.playerGroup.add(helm);

    const visor = new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 10, 0, Math.PI, 0, Math.PI), new THREE.MeshStandardMaterial({ color: 0x00f0ff, roughness: 0.1, metalness: 0.9 }));
    visor.rotation.y = Math.PI / 2;
    visor.position.set(0, 1.95, 0.12);
    this.playerGroup.add(visor);

    this.playerGroup.visible = false; // Hidden in 1st person
    this.scene.add(this.playerGroup);
  }

  // 3D Sonar Acoustic Shockwave
  triggerSonarPing3D() {
    if (!window.gameState || !window.gameState.survival.pingReady) return;

    const isInterference = (window.gameState.strategy.entry === 'A');
    window.soundEngine.playPing(isInterference);

    // Create Expanding 3D Spherical Shockwave
    const pingGeo = new THREE.SphereGeometry(1, 24, 24);
    const pingMat = new THREE.MeshBasicMaterial({
      color: isInterference ? 0xf59e0b : 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.9
    });
    const pingMesh = new THREE.Mesh(pingGeo, pingMat);
    pingMesh.position.set(this.player.x, 1.4, this.player.z);
    this.scene.add(pingMesh);

    this.pingWaves.push({
      mesh: pingMesh,
      radius: 1,
      maxRadius: isInterference ? 26 : 42,
      speed: 0.65,
      opacity: 0.9
    });

    // Sound attracts the Entity in 3D
    const dist = Math.hypot(this.entity.x - this.player.x, this.entity.z - this.player.z);
    if (dist < 45) {
      this.entity.alertness = Math.min(1, this.entity.alertness + 0.4);
      this.entity.targetX = this.player.x + (Math.random() * 4 - 2);
      this.entity.targetZ = this.player.z + (Math.random() * 4 - 2);

      const banner = document.getElementById('entity-warning');
      if (banner) banner.classList.remove('hidden');

      // Turn entity light agitated red/magenta
      if (this.entity.light) this.entity.light.color.setHex(0xef4444);
    }

    // Cooldown UI
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

  // Handle 3D Node Interactions (E key)
  interactNearest3D() {
    if (!this.activeInteractable) return;

    const node = this.activeInteractable;
    window.soundEngine.playTerminalBeep();

    if (node.id === 'reactor') {
      const modal = document.getElementById('modal-confrontation');
      if (modal) {
        modal.classList.remove('hidden');
        window.soundEngine.playEntityHarmonic(true);
      }
      return;
    }

    node.rescued = true;
    if (node.id === 'chen') window.gameState.survival.crew.chen = true;
    if (node.id === 'murthy') {
      window.gameState.survival.crew.murthy = true;
      window.gameState.survival.dataSecured = true;
    }
    if (node.id === 'patel') window.gameState.survival.crew.patel = true;
    if (node.id === 'stasis') window.gameState.survival.crew.stasis = true;
    if (node.id === 'tanaka') window.gameState.survival.crew.tanaka = true;

    // Show in-game terminal modal
    const modal = document.getElementById('terminal-interaction-modal');
    const titleEl = document.getElementById('interact-title');
    const descEl = document.getElementById('interact-desc');
    if (modal && titleEl && descEl) {
      titleEl.innerText = node.name;
      descEl.innerText = node.desc;
      modal.classList.remove('hidden');
    }

    // Update 2D radar checklist if available
    if (window.radarEngine) {
      window.radarEngine.updateHUDChecklist();
    }
  }

  initInputListeners() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;
      if (e.code === 'Space') {
        e.preventDefault();
        this.triggerSonarPing3D();
      }
      if (e.key.toLowerCase() === 'e') {
        this.interactNearest3D();
      }
      if (e.key.toLowerCase() === 'f') {
        this.toggleFlashlight();
      }
      if (e.key.toLowerCase() === 'v' || e.key.toLowerCase() === 'c') {
        this.toggleCameraMode();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });

    // Mouse Look (Drag to look or pointer lock)
    this.renderer.domElement.addEventListener('mousedown', (e) => {
      this.mouse.isDown = true;
      this.mouse.prevX = e.clientX;
      this.mouse.prevY = e.clientY;
    });

    window.addEventListener('mouseup', () => {
      this.mouse.isDown = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.mouse.isDown) return;
      const dx = e.clientX - this.mouse.prevX;
      const dy = e.clientY - this.mouse.prevY;
      this.mouse.prevX = e.clientX;
      this.mouse.prevY = e.clientY;

      this.targetYaw -= dx * 0.0035;
      this.targetPitch = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, this.targetPitch - dy * 0.0035));
    });
  }

  toggleCameraMode() {
    this.cameraMode = (this.cameraMode === 'FIRST_PERSON') ? 'THIRD_PERSON' : 'FIRST_PERSON';
    this.playerGroup.visible = (this.cameraMode === 'THIRD_PERSON');
    const txt = document.getElementById('cam-mode-text');
    if (txt) txt.innerText = (this.cameraMode === 'FIRST_PERSON') ? '1ST PERSON' : '3RD PERSON';
  }

  toggleFlashlight() {
    this.flashlightOn = !this.flashlightOn;
    this.flashlight.intensity = this.flashlightOn ? 3.2 : 0;
    const txt = document.getElementById('light-mode-text');
    if (txt) txt.innerText = this.flashlightOn ? 'LIGHT: ON' : 'LIGHT: OFF';
    window.soundEngine.playTerminalBeep();
  }

  start() {
    if (!this.scene && window.THREE) {
      this.initScene();
    }
    if (!this.scene) {
      console.warn("3D scene not ready yet.");
      return;
    }
    this.isRunning = true;

    // Spawn player according to entry choice
    if (window.gameState && window.gameState.strategy.entry === 'A') {
      this.player.x = 0;
      this.player.z = -22; // Main Dock North
      this.targetYaw = Math.PI;
    } else {
      this.player.x = -33;
      this.player.z = 0; // Airlock 3 West
      this.targetYaw = -Math.PI / 2;
    }

    this.animate();
  }

  stop() {
    this.isRunning = false;
  }

  animate() {
    if (!this.isRunning) return;
    requestAnimationFrame(() => this.animate());

    this.updatePlayerMovement();
    this.updateEntityAI();
    this.updateSonarPings();
    this.updateInteractables();
    this.updateAnimatedObjects();
    this.updateVisorHUD();

    this.renderer.render(this.scene, this.camera);
  }

  updatePlayerMovement() {
    // Smooth camera rotation damping
    this.yaw += (this.targetYaw - this.yaw) * 0.2;
    this.pitch += (this.targetPitch - this.pitch) * 0.2;

    let moveX = 0;
    let moveZ = 0;

    if (this.keys['w'] || this.keys['arrowup']) moveZ -= 1;
    if (this.keys['s'] || this.keys['arrowdown']) moveZ += 1;
    if (this.keys['a'] || this.keys['arrowleft']) moveX -= 1;
    if (this.keys['d'] || this.keys['arrowright']) moveX += 1;

    // Arrow keys pan camera if mouse not dragged
    if (this.keys['q']) this.targetYaw += 0.03;
    if (this.keys['e'] && !this.activeInteractable) this.targetYaw -= 0.03;

    if (moveX !== 0 || moveZ !== 0) {
      const len = Math.hypot(moveX, moveZ);
      moveX /= len; moveZ /= len;

      const cos = Math.cos(this.yaw);
      const sin = Math.sin(this.yaw);

      const dx = (moveX * cos + moveZ * sin) * this.player.speed;
      const dz = (-moveX * sin + moveZ * cos) * this.player.speed;

      // Bound within station walls (-40 to 40 in X, -26 to 26 in Z)
      this.player.x = Math.max(-39, Math.min(39, this.player.x + dx));
      this.player.z = Math.max(-25, Math.min(25, this.player.z + dz));

      // Head bobbing
      this.player.walkBob += 0.14;
      this.player.y = 1.4 + Math.sin(this.player.walkBob) * 0.04;

      // Sync with 2D radar coordinates
      if (window.radarEngine) {
        window.radarEngine.player.x = this.player.x * 10 + 450;
        window.radarEngine.player.y = this.player.z * 10 + 300;
      }
    }

    // Camera Placement
    if (this.cameraMode === 'FIRST_PERSON') {
      this.camera.position.set(this.player.x, this.player.y, this.player.z);
      this.camera.rotation.set(this.pitch, this.yaw, 0, 'YXZ');
    } else {
      // 3rd Person Over-the-Shoulder
      const offsetDist = 3.2;
      const camX = this.player.x - Math.sin(this.yaw) * offsetDist;
      const camZ = this.player.z - Math.cos(this.yaw) * offsetDist;
      this.camera.position.set(camX, this.player.y + 1.2, camZ);
      this.camera.lookAt(this.player.x, this.player.y + 0.6, this.player.z);

      this.playerGroup.position.set(this.player.x, 0, this.player.z);
      this.playerGroup.rotation.y = this.yaw;
    }
  }

  updateEntityAI() {
    if (!this.entityGroup) return;

    this.entity.phase += 0.025;

    // Entity roams towards target
    const dx = this.entity.targetX - this.entity.x;
    const dz = this.entity.targetZ - this.entity.z;
    const dist = Math.hypot(dx, dz);

    if (dist > 0.5) {
      const spd = 0.04 + this.entity.alertness * 0.06;
      this.entity.x += (dx / dist) * spd;
      this.entity.z += (dz / dist) * spd;
    } else {
      // Idle wander around station rooms
      if (Math.random() < 0.015) {
        this.entity.targetX = (Math.random() - 0.5) * 60;
        this.entity.targetZ = (Math.random() - 0.5) * 36;
      }
    }

    this.entityGroup.position.set(this.entity.x, 1.8 + Math.sin(this.entity.phase * 2) * 0.25, this.entity.z);

    // Rotate core & orbiting shards
    if (this.entity.core) {
      this.entity.core.rotation.y += 0.02;
      this.entity.core.rotation.x += 0.015;
    }
    if (this.entity.particles) {
      this.entity.particles.rotation.y -= 0.008;
    }

    // Sync with 2D radar entity
    if (window.radarEngine) {
      window.radarEngine.entity.x = this.entity.x * 10 + 450;
      window.radarEngine.entity.y = this.entity.z * 10 + 300;
    }
  }

  updateSonarPings() {
    for (let i = this.pingWaves.length - 1; i >= 0; i--) {
      const p = this.pingWaves[i];
      p.radius += p.speed;
      p.opacity -= 0.014;
      p.mesh.scale.set(p.radius, p.radius, p.radius);
      p.mesh.material.opacity = Math.max(0, p.opacity);

      if (p.radius >= p.maxRadius || p.opacity <= 0) {
        this.scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        p.mesh.material.dispose();
        this.pingWaves.splice(i, 1);
      }
    }
  }

  updateInteractables() {
    let nearest = null;
    let minDist = 4.2;

    for (let node of this.interactables) {
      const dist = Math.hypot(node.x - this.player.x, node.z - this.player.z);
      if (dist < minDist) {
        minDist = dist;
        nearest = node;
      }
    }

    this.activeInteractable = nearest;
    const prompt = document.getElementById('interaction-prompt-3d');
    const promptText = document.getElementById('prompt-3d-text');

    if (nearest && prompt && promptText) {
      promptText.innerText = `${nearest.name} [E]`;
      prompt.classList.remove('hidden');
    } else if (prompt) {
      prompt.classList.add('hidden');
    }
  }

  updateAnimatedObjects() {
    this.animatedObjects.forEach(obj => {
      if (obj.mesh) {
        if (obj.rotY) obj.mesh.rotation.y += obj.rotY;
        if (obj.rotX) obj.mesh.rotation.x += obj.rotX;
        if (obj.rotZ) obj.mesh.rotation.z += obj.rotZ;
        if (obj.bob) {
          obj.mesh.position.y = obj.baseY + Math.sin(Date.now() * 0.003) * 0.12;
        }
      }
      if (obj.light && obj.pulse) {
        obj.light.intensity = 3.5 + Math.sin(Date.now() * 0.005) * 1.5;
      }
    });
  }

  updateVisorHUD() {
    const compassEl = document.getElementById('compass-bearing');
    if (compassEl) {
      const deg = Math.round(((this.yaw % (Math.PI * 2)) + Math.PI * 2) * (180 / Math.PI)) % 360;
      compassEl.innerText = `BEARING: ${deg.toString().padStart(3, '0')}°`;
    }
  }

  onWindowResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }
}

window.Station3DEngine = Station3DEngine;
