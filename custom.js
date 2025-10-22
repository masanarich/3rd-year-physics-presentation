/* ==========================================================
   PHASE 1 — CORE ANIMATIONS
   ========================================================== */

/*-----------------------------------------------------------
  1️⃣  PIPELINE ANIMATION  — Classical → Quantum
  -----------------------------------------------------------*/
function initPipelineAnimation() {
  const c = document.getElementById("pipeline-canvas");
  if (!c) return;
  const ctx = c.getContext("2d");
  let mode = "classical";

  const boxes = [
    { label: "Inputs", x: 80, y: 100, w: 120 },
    { label: "Algorithm", x: 280, y: 100, w: 160 },
    { label: "Outputs", x: 520, y: 100, w: 120 },
  ];

  function draw() {
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.strokeRect(0, 0, c.width, c.height);

    boxes.forEach((b, i) => {
      const color =
        i === 1 && mode === "quantum" ? "#29b2b2" : "rgba(255,255,255,0.8)";
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.strokeRect(b.x, b.y, b.w, 80);
      ctx.font = "16px sans-serif";
      ctx.fillStyle = color;
      ctx.textAlign = "center";
      ctx.fillText(b.label, b.x + b.w / 2, b.y + 45);
    });

    // Arrows
    ctx.strokeStyle = "rgba(255,255,255,0.7)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(200, 140);
    ctx.lineTo(280, 140);
    ctx.moveTo(440, 140);
    ctx.lineTo(520, 140);
    ctx.stroke();

    if (mode === "quantum") {
      // Add interference / superposition glow
      ctx.fillStyle = "rgba(41,178,178,0.2)";
      ctx.beginPath();
      ctx.arc(360, 140, 45, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillStyle = "#29b2b2";
      ctx.font = "14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Superposition", 360, 220);
      ctx.fillText("Interference", 360, 240);
    }
  }

  draw();

  document.getElementById("pipeline-toggle").onclick = () => {
    mode = mode === "classical" ? "quantum" : "classical";
    draw();
  };
}
initPipelineAnimation();

/*-----------------------------------------------------------
  2️⃣  BIT vs QUBIT TOGGLE  (already scaffolded)
  -----------------------------------------------------------*/
let bit = 0;
window.toggleBit = () => {
  bit ^= 1;
  const el = document.getElementById("bit-box");
  if (!el) return;
  el.textContent = bit;
  el.classList.toggle("on", bit === 1);
  el.style.transform = "scale(1.06)";
  setTimeout(() => (el.style.transform = "scale(1)"), 160);
};

let qstate = 0; // 0: |0>, 1: |1>, 2: superposition
window.cycleQubit = () => {
  qstate = (qstate + 1) % 3;
  const el = document.getElementById("qubit-box");
  if (!el) return;
  if (qstate === 0) {
    el.textContent = "|0⟩";
    el.classList.remove("super");
  }
  if (qstate === 1) {
    el.textContent = "|1⟩";
    el.classList.remove("super");
  }
  if (qstate === 2) {
    el.textContent = "(|0⟩+|1⟩)/√2";
    el.classList.add("super");
  }
  el.style.transform = "rotateY(180deg)";
  setTimeout(() => (el.style.transform = "rotateY(0deg)"), 220);
};

/*----------------------------------------------------------- 
  3️⃣  BLOCH SPHERE  (updated for visibility + correct poles)
  -----------------------------------------------------------*/
function initBlochSphere() {
  const el = document.getElementById("bloch-container");
  if (!el) return;

  // --- Scene / camera / renderer ---
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    35,
    el.clientWidth / el.clientHeight,
    0.1,
    100
  );
  camera.position.set(0, 0, 4);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setSize(el.clientWidth, el.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  // Darker, slightly bluish background to make the sphere stand out
  renderer.setClearColor(0x0b0f17, 1);
  el.appendChild(renderer.domElement);

  // --- Lights (cooler, higher contrast) ---
  scene.add(new THREE.AmbientLight(0xcad6ff, 0.35));
  const hemi = new THREE.HemisphereLight(0x9bc9ff, 0x0a0c10, 0.85);
  scene.add(hemi);
  const dir = new THREE.DirectionalLight(0xffffff, 0.75);
  dir.position.set(2.5, 2, 3.2);
  scene.add(dir);

  // --- Solid sphere (rich color + gentle emissive) ---
  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(1, 64, 64),
    new THREE.MeshPhongMaterial({
      color: 0x113a66,      // deep blue
      emissive: 0x0a2033,   // subtle self-light
      shininess: 40,
      specular: 0x9ec9ff
    })
  );
  scene.add(sphere);

  // --- Wireframe (brighter teal and more opaque) ---
  const wire = new THREE.LineSegments(
    new THREE.WireframeGeometry(new THREE.SphereGeometry(1.001, 24, 18)),
    new THREE.LineBasicMaterial({
      color: 0x57e5e0,
      opacity: 0.55,
      transparent: true
    })
  );
  scene.add(wire);

  // --- Equator ring (very visible) ---
  const equator = new THREE.LineLoop(
    new THREE.CircleGeometry(1.002, 128),
    new THREE.LineBasicMaterial({
      color: 0x9be8ff,
      linewidth: 2,
      opacity: 0.85,
      transparent: true
    })
  );
  equator.rotation.x = Math.PI / 2; // lie in the XZ-plane
  scene.add(equator);

  // --- Pole markers (small bright caps) ---
  const poleMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const poleGeo = new THREE.SphereGeometry(0.03, 16, 16);
  const north = new THREE.Mesh(poleGeo, poleMat);
  const south = new THREE.Mesh(poleGeo, poleMat);
  north.position.set(0, 1.0, 0);
  south.position.set(0, -1.0, 0);
  scene.add(north, south);

  // --- Subtle rim glow (slightly larger transparent sphere) ---
  const rim = new THREE.Mesh(
    new THREE.SphereGeometry(1.04, 64, 64),
    new THREE.MeshBasicMaterial({
      color: 0x7fe8ff,
      transparent: true,
      opacity: 0.06
    })
  );
  scene.add(rim);

  // --- State vector arrow (white) ---
  const arrowMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const shaft = new THREE.CylinderGeometry(0.012, 0.012, 1.0, 20);
  const head = new THREE.ConeGeometry(0.06, 0.16, 28);
  const shaftMesh = new THREE.Mesh(shaft, arrowMat);
  const headMesh = new THREE.Mesh(head, arrowMat);
  const arrow = new THREE.Group();
  shaftMesh.position.y = 0.5;
  headMesh.position.y = 1.08;
  arrow.add(shaftMesh);
  arrow.add(headMesh);
  scene.add(arrow);

  // --- Mapping: θ measured from +Y (up), φ around +Y (right-handed)
  // So: |0> (north) => θ=0  -> v = (0, +1, 0)   (top)
  //     |1> (south) => θ=π  -> v = (0, -1, 0)   (bottom)
  //     |+> (super) => θ=π/2, φ=0 -> v = (+1, 0, 0) (right)
  function setArrow(theta, phi) {
    const x = Math.sin(theta) * Math.cos(phi);
    const y = Math.cos(theta);
    const z = Math.sin(theta) * Math.sin(phi);
    const v = new THREE.Vector3(x, y, z).normalize();
    // rotate arrow from default +Y to v
    arrow.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), v);
  }

  // Default state = |0>
  let theta = 0, phi = 0;
  setArrow(theta, phi);

  // --- Animate (slow rotation for parallax) ---
  function animate() {
    requestAnimationFrame(animate);
    sphere.rotation.y += 0.002;
    wire.rotation.y += 0.002;
    equator.rotation.y += 0.002;
    rim.rotation.y += 0.002;
    renderer.render(scene, camera);
  }
  animate();

  // --- Handle resize ---
  function onResize() {
    const { clientWidth, clientHeight } = el;
    camera.aspect = clientWidth / clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(clientWidth, clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  }
  window.addEventListener("resize", onResize);

  // --- Public API for your buttons ---
  window.setState = (k) => {
    if (k === "zero") setArrow(0, 0);                 // |0⟩  (north/top)
    if (k === "one") setArrow(Math.PI, 0);            // |1⟩  (south/bottom)
    if (k === "super") setArrow(Math.PI / 2, 0);      // (|0⟩+|1⟩)/√2 along +X
  };
}
initBlochSphere();


/*-----------------------------------------------------------
  4️⃣  QFT SLIDER (already scaffolded)
  -----------------------------------------------------------*/
(function initQFTSlider() {
  const c = document.getElementById("qft-canvas");
  if (!c) return;
  const ctx = c.getContext("2d");
  let r = 5,
    N = 128;

  function draw() {
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.strokeRect(0, 0, c.width, c.height);

    const width = 740,
      left = 40,
      baseY = 220;
    ctx.fillStyle = "rgba(41,178,178,0.9)";
    for (let m = 0; m <= r; m++) {
      const k = Math.round((m * N) / r);
      const x0 = left + (k / N) * width;
      const peakH = m === 0 || m === r ? 40 : 160;
      for (let dx = -40; dx <= 40; dx++) {
        const x = x0 + dx;
        const t = dx / 22;
        const y = baseY - peakH * Math.exp(-t * t);
        ctx.fillRect(x, y, 1, baseY - y);
      }
    }
  }
  draw();
  window.updateR = (val) => {
    r = Math.max(3, Math.min(40, parseInt(val)));
    document.getElementById("r-label").textContent = r;
    draw();
  };
})();

/*-----------------------------------------------------------
  5️⃣  PERIODIC FUNCTION f(x)=a^x mod N
  -----------------------------------------------------------*/
function initPeriodicFunction() {
  const c = document.getElementById("period-canvas");
  if (!c) return;
  const ctx = c.getContext("2d");
  let a = 3,
    N = 15;

  function f(x) {
    return Math.pow(a, x) % N;
  }

  function draw() {
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.strokeRect(0, 0, c.width, c.height);
    ctx.font = "14px sans-serif";
    ctx.fillStyle = "#29b2b2";
    ctx.fillText(`f(x)=a^x mod N   (a=${a}, N=${N})`, 20, 20);

    const w = 740,
      h = 180,
      left = 40,
      bottom = 220;
    const scaleX = (x) => left + (x / 20) * w;
    const scaleY = (y) => bottom - (y / N) * h;

    ctx.strokeStyle = "#29b2b2";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = 0; x <= 20; x++) {
      const y = f(x);
      ctx.lineTo(scaleX(x), scaleY(y));
    }
    ctx.stroke();

    // vertical lines to show period visually
    const seen = new Map();
    for (let x = 0; x <= 20; x++) {
      const y = f(x);
      if (seen.has(y)) {
        const x0 = seen.get(y),
          x1 = x;
        ctx.strokeStyle = "rgba(41,178,178,0.3)";
        ctx.beginPath();
        ctx.moveTo(scaleX(x0), scaleY(y) - 5);
        ctx.lineTo(scaleX(x1), scaleY(y) + 5);
        ctx.stroke();
      } else {
        seen.set(y, x);
      }
    }
  }
  draw();
  document.getElementById("a-slider").oninput = (e) => {
    a = parseInt(e.target.value);
    draw();
  };
}
initPeriodicFunction();

/*-----------------------------------------------------------
  6️⃣  GCD from r → factors
  -----------------------------------------------------------*/
function initGCDFromR() {
  const el = document.getElementById("gcd-demo");
  if (!el) return;
  const out = document.getElementById("gcd-output");
  el.onclick = () => {
    out.innerHTML = `
      <div style="margin-top:10px;">
        <span style="color:#29b2b2;">a<sup>r/2</sup> ± 1</span> →
        <b>gcd</b>(a<sup>r/2</sup>−1, N),
        <b>gcd</b>(a<sup>r/2</sup>+1, N)
      </div>
      <div style="margin-top:8px;">⇓</div>
      <div style="color:#fff;">Found factors: <span style="color:#29b2b2;">p</span>, <span style="color:#29b2b2;">q</span></div>`;
  };
}
initGCDFromR();




/* ==========================================================
   (PHASE 2 & 3 placeholders go below later)
   ========================================================== */


   /*----------------------------------------------------------- 
  7️⃣  ENTANGLEMENT CORRELATION DEMO (fit + colors + responsive)
  -----------------------------------------------------------*/
function initEntanglementDemo() {
  const canvas = document.getElementById("entangle-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  // ---- Color themes ----
  const COLORS = {
    sepFill:  "rgba(200,210,220,0.10)",
    sepEdge:  "rgba(255,255,255,0.55)",
    entFill:  "rgba(120,250,245,0.15)",
    entEdge:  "rgba(120,250,245,0.95)",
    text:     "rgba(255,255,255,0.95)",
    subtext:  "rgba(155,232,255,0.90)",
    panelBg:  "rgba(255,255,255,0.06)",
    panelEdge:"rgba(255,255,255,0.10)",
    link:     "#57e5e0",
    linkDash: "rgba(159,249,255,0.9)"
  };

  // ---- Responsive + HiDPI scaling (uses CSS size) ----
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    const cssW = (rect.width  || canvas.width  || 720);
    const cssH = (rect.height || canvas.height || 260);
    canvas.width  = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener("resize", resize);

  // ---- State ----
  let entangled = false;
  let outcomes = [];
  let corrSum = 0, corrCount = 0;
  let lastA = null, lastB = null;
  let t0 = performance.now();
  const pulses = [];

  // ---- Layout computed from current canvas size ----
  function layout() {
    const rect = canvas.getBoundingClientRect();
    const W = rect.width  || 720;
    const H = rect.height || 260;

    let R = Math.min(W, H) * 0.16;
    R = Math.max(40, Math.min(64, R));

    const sideMargin = R + 24;
    const ax = Math.max(sideMargin, W * 0.28);
    const bx = Math.min(W - sideMargin, W * 0.72);

    const topMargin = 40, bottomMargin = 64;
    let centerY = Math.round(H * 0.46);
    centerY = Math.max(topMargin + R, Math.min(centerY, H - (bottomMargin + R)));

    const logX = 24;
    let logY = Math.round(H * 0.68);
    logY = Math.min(logY, H - 28);

    return { W, H, ax, bx, centerY, R, logX, logY, margin: sideMargin };
  }

  // ---- Helpers ----
  function roundedPanel(x, y, w, h, r, fill, stroke, alpha=1) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.moveTo(x+r, y);
    ctx.arcTo(x+w, y, x+w, y+h, r);
    ctx.arcTo(x+w, y+h, x, y+h, r);
    ctx.arcTo(x, y+h, x, y, r);
    ctx.arcTo(x, y, x+w, y, r);
    ctx.closePath();
    ctx.fillStyle = fill; ctx.fill();
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.stroke(); }
    ctx.restore();
  }

  function drawQubit(x, y, R, value, ent) {
    const fill = ent ? COLORS.entFill : COLORS.sepFill;
    const edge = ent ? COLORS.entEdge : COLORS.sepEdge;

    const g = ctx.createRadialGradient(x, y, 8, x, y, R);
    g.addColorStop(0, fill);
    g.addColorStop(1, "rgba(180,220,255,0.04)");
    ctx.fillStyle = g;
    ctx.strokeStyle = edge;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI*2); ctx.fill(); ctx.stroke();

    ctx.font = "600 22px ui-sans-serif, system-ui, Segoe UI";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = COLORS.text;
    const label = value === null ? "?" : (value > 0 ? "+1" : "−1");
    ctx.fillText(label, x, y);

    ctx.font = "12px ui-monospace, SFMono-Regular, Menlo, monospace";
    ctx.fillStyle = COLORS.subtext;
    ctx.fillText("σz", x, y - R - 12);
  }

  function drawLink(ax, ay, bx, by, timeMs) {
    const pulseW = 3 + 3 * Math.sin((timeMs % 2000) / 2000 * Math.PI * 2);

    ctx.save();
    ctx.shadowColor = "rgba(87,229,224,0.9)";
    ctx.shadowBlur = 10;
    ctx.lineWidth = pulseW;
    ctx.strokeStyle = COLORS.link;
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
    ctx.restore();

    ctx.setLineDash([10, 10]);
    ctx.lineDashOffset = -timeMs * 0.06;
    ctx.lineWidth = 2;
    ctx.strokeStyle = COLORS.linkDash;
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
    ctx.setLineDash([]);

    ctx.font = "600 14px ui-sans-serif, system-ui";
    ctx.fillStyle = COLORS.subtext;
    const midX = (ax + bx) / 2, midY = (ay + by) / 2 + 18;
    ctx.textAlign = "center";
    ctx.fillText("Entangled (|Φ⁺⟩)", midX, midY);
  }

  function addPulse(x, y) { pulses.push({ x, y, t: 0 }); }
  function drawPulses(dt) {
    for (let i = pulses.length - 1; i >= 0; i--) {
      const p = pulses[i];
      p.t += dt;
      const r = 60 + 120 * p.t;
      const a = Math.max(0, 0.35 * (1 - p.t));
      ctx.strokeStyle = `rgba(159, 249, 255, ${a})`;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI*2); ctx.stroke();
      if (p.t > 1) pulses.splice(i, 1);
    }
  }

  function drawOutcomesPanel(L) {
    const w = Math.min(420, L.W - 48), h = 128;
    roundedPanel(16, L.logY - 22, w, h, 12, COLORS.panelBg, COLORS.panelEdge, 1);

    ctx.font = "700 14px ui-sans-serif, system-ui";
    ctx.textAlign = "left";
    ctx.fillStyle = COLORS.text;
    ctx.fillText("Runs (Z-basis):", 28, L.logY);

    ctx.font = "13px ui-monospace, SFMono-Regular, Menlo, monospace";
    const corr = corrCount ? (corrSum / corrCount).toFixed(2) : "—";
    ctx.fillStyle = COLORS.subtext;
    ctx.fillText(`⟨σz⊗σz⟩ ≈ ${corr}`, 28, L.logY + 20);

    ctx.fillStyle = "rgba(255,255,255,0.85)";
    outcomes.slice(-6).forEach((s, i) => ctx.fillText(s, 28, L.logY + 40 + 16*i));
  }

  // ---- Measurement in Z ----
  function measureZ() {
    let a, b;
    if (entangled) { a = Math.random() < 0.5 ? +1 : -1; b = a; }
    else { a = Math.random() < 0.5 ? +1 : -1; b = Math.random() < 0.5 ? +1 : -1; }
    lastA = a; lastB = b;
    corrSum += a * b; corrCount += 1;
    outcomes.push(`A: ${a>0?"+1":"-1"}   B: ${b>0?"+1":"-1"}   ${entangled?"(corr)":"(indep)"}`);

    const L = layout();
    addPulse(L.ax, L.centerY); addPulse(L.bx, L.centerY);
  }

  function hardReset(){ outcomes=[]; corrSum=0; corrCount=0; lastA=null; lastB=null; }
  function softReset(){ lastA=null; lastB=null; }

  // ---- Render loop ----
  function render(now) {
    const L = layout();
    const dt = Math.min(0.05, (now - t0) / 1000); t0 = now;

    ctx.clearRect(0, 0, L.W, L.H);
    roundedPanel(8, 8, L.W - 16, L.H - 16, 20, "rgba(0,0,0,0.18)", null, 1);

    // state title
    ctx.font = "600 14px ui-sans-serif, system-ui";
    ctx.textAlign = "center";
    ctx.fillStyle = entangled ? COLORS.subtext : "rgba(255,255,255,0.75)";
    const stateText = entangled
      ? "State: |Φ⁺⟩ = (|00⟩ + |11⟩)/√2  →  perfectly correlated in Z"
      : "State: separable (independent)  →  no enforced correlation";
    ctx.fillText(stateText, L.W/2, 24);

    // qubits (tint changes with entangled flag)
    drawQubit(L.ax, L.centerY, L.R, lastA, entangled);
    drawQubit(L.bx, L.centerY, L.R, lastB, entangled);

    // animated link if entangled
    if (entangled) drawLink(L.ax + L.R, L.centerY, L.bx - L.R, L.centerY, now);

    drawPulses(dt);
    drawOutcomesPanel(L);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);

  // ---- Buttons (IDs unchanged) ----
  const btnEnt = document.getElementById("btn-entangle");
  const btnSep = document.getElementById("btn-separable");
  const btnMeas = document.getElementById("btn-measureZ");
  const btnReset = document.getElementById("btn-reset-ent");

  if (btnEnt)  btnEnt.onclick  = () => { entangled = true;  softReset(); };
  if (btnSep)  btnSep.onclick  = () => { entangled = false; softReset(); };
  if (btnMeas) btnMeas.onclick = () => measureZ();
  if (btnReset)btnReset.onclick = () => { hardReset(); softReset(); };
}
initEntanglementDemo();



/*----------------------------------------------------------- 
  8️⃣  H + CNOT → BELL STATE  (animated, clear flow)
  -----------------------------------------------------------*/
function initBellCircuit() {
  const svg = document.getElementById("bell-circuit");
  if (!svg) return;

  // Existing SVG bits
  const gateH    = document.getElementById("gateH");
  const gateCNOT = document.getElementById("gateCNOT");
  const lblRight = document.getElementById("bell-state-label"); // we reposition this near CNOT

  const btnNext = document.getElementById("bell-next");
  const btnPrev = document.getElementById("bell-prev");

  // Geometry from your SVG (tuned to your coordinates)
  const x0   = 90;                   // start x
  const xHc  = 230;                  // H gate center (200 + 60/2)
  const xMid = 300;                  // midpoint between H and CNOT
  const xC   = 420;                  // CNOT column
  const xOut = 470;                  // output label just to the right of CNOT

  const yTop = 70;
  const yBot = 150;

  // Style
  const ACCENT = "#57e5e0";
  const EDGE   = "rgba(255,255,255,0.7)";
  const FILL   = "rgba(255,255,255,0.06)";
  const TEXT   = "#ffffff";

  // Utility: token factory (rounded chip)
  function makeToken(x, y, text) {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");

    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", x - 22);
    rect.setAttribute("y", y - 14);
    rect.setAttribute("width", 44);
    rect.setAttribute("height", 28);
    rect.setAttribute("rx", 14);
    rect.setAttribute("fill", FILL);
    rect.setAttribute("stroke", EDGE);
    rect.setAttribute("stroke-width", "2");

    const t = document.createElementNS("http://www.w3.org/2000/svg", "text");
    t.setAttribute("x", x);
    t.setAttribute("y", y + 6);
    t.setAttribute("text-anchor", "middle");
    t.setAttribute("font-family", "ui-sans-serif, Segoe UI, sans-serif");
    t.setAttribute("font-size", "16");
    t.setAttribute("fill", TEXT);
    t.textContent = text;

    g.appendChild(rect); g.appendChild(t);
    svg.appendChild(g);
    return { rect, t };
  }
  function setTokenPos(tok, x, y) {
    tok.rect.setAttribute("x", x - 22);
    tok.rect.setAttribute("y", y - 14);
    tok.t.setAttribute("x", x);
    tok.t.setAttribute("y", y + 6);
  }
  function setTokenText(tok, txt, glow=false) {
    tok.t.textContent = txt;
    tok.rect.setAttribute("stroke", glow ? ACCENT : EDGE);
    tok.rect.setAttribute("fill", glow ? "rgba(120,250,245,0.12)" : FILL);
  }

  // Easing & tween
  const ease = u => (u < 0.5 ? 2*u*u : -1 + (4 - 2*u)*u); // easeInOutQuad
  function tweenPos(tok, x0, y0, x1, y1, ms=450) {
    return new Promise(res => {
      const t0 = performance.now();
      (function step(t){
        const u = Math.min(1, (t - t0)/ms);
        const e = ease(u);
        setTokenPos(tok, x0 + (x1-x0)*e, y0 + (y1-y0)*e);
        if (u < 1) requestAnimationFrame(step); else res();
      })(performance.now());
    });
  }

  // Visual emphasis of the CNOT vertical coupling
  function flashVertical() {
    const v = document.createElementNS("http://www.w3.org/2000/svg", "line");
    v.setAttribute("x1", xC); v.setAttribute("x2", xC);
    v.setAttribute("y1", yTop); v.setAttribute("y2", yBot);
    v.setAttribute("stroke", ACCENT); v.setAttribute("stroke-width", "3");
    v.setAttribute("stroke-linecap", "round");
    svg.appendChild(v);
    let a = 1;
    (function fade(){
      a -= 0.04; v.setAttribute("opacity", String(Math.max(0,a)));
      if (a > 0) requestAnimationFrame(fade); else svg.removeChild(v);
    })();
  }

  // Tokens
  const tokTop = makeToken(x0, yTop, "|0⟩");
  const tokBot = makeToken(x0, yBot, "|0⟩");

  // Gate highlighting + dim far-right |ψ⟩ after CNOT
  function highlight(step) {
    if (gateH)    gateH.setAttribute("opacity", step === 1 ? "1" : "0.35");
    if (gateCNOT) gateCNOT.setAttribute("opacity", step === 2 ? "1" : "0.35");
    const psi = Array.from(svg.querySelectorAll("text")).find(t => t.textContent.trim() === "|ψ⟩");
    if (psi) psi.setAttribute("opacity", step === 2 ? "0.25" : "1");
  }

  // Output label right after CNOT (between wires)
  function setOutputLabel(txt) {
    if (!lblRight) return;
    lblRight.setAttribute("x", xOut);
    lblRight.setAttribute("y", (yTop + yBot) / 2 + 6);
    lblRight.setAttribute("text-anchor", "start");
    lblRight.textContent = txt;
  }

  // Steps
  async function toStep0() {
    highlight(0);
    setTokenText(tokTop, "|0⟩"); setTokenText(tokBot, "|0⟩");
    setTokenPos(tokTop, x0, yTop); setTokenPos(tokBot, x0, yBot);
    setOutputLabel("|00⟩");
  }

  // Top qubit enters H → |+⟩, bottom stays |0⟩
  async function toStep1() {
    await toStep0();
    highlight(1);
    await tweenPos(tokTop, x0, yTop, xHc - 6, yTop, 420);  // into H
    setTokenText(tokTop, "|+⟩", true);
    await tweenPos(tokTop, xHc - 6, yTop, xMid, yTop, 360); // out of H
    setOutputLabel("|+0⟩ = (|00⟩ + |10⟩)/√2");
  }

  // Both qubits go to CNOT; show interaction; show Bell state near the gate
  async function toStep2() {
    await toStep1();
    highlight(2);

    // Move both tokens horizontally to the CNOT column
    await Promise.all([
      tweenPos(tokTop, xMid, yTop, xC - 10, yTop, 420),
      tweenPos(tokBot, x0,  yBot, xC - 10, yBot, 500)
    ]);

    // Flash the vertical wire to indicate the two-qubit operation
    flashVertical();

    // Tiny tick on each token (no vertical hop) to suggest “action”
    await Promise.all([
      tweenPos(tokTop, xC - 10, yTop, xC - 4,  yTop, 140),
      tweenPos(tokBot, xC - 10, yBot, xC - 16, yBot, 140)
    ]);

    // After CNOT → entangled; show output label right after the gate
    setTokenText(tokTop, "↯", true);
    setTokenText(tokBot, "↯", true);
    setOutputLabel("( |00⟩ + |11⟩ )/√2");

    // Drift a short distance to the right (still near CNOT so the story is clear)
    await Promise.all([
      tweenPos(tokTop, xC - 4,  yTop, xOut, yTop, 320),
      tweenPos(tokBot, xC - 16, yBot, xOut, yBot, 320)
    ]);
  }

  // Controller (rebuild deterministically to avoid stale positions)
  let step = 0;
  async function goTo(n) {
    if (n <= 0) { step = 0; await toStep0(); return; }
    if (n === 1) { step = 1; await toStep1(); return; }
    if (n >= 2) { step = 2; await toStep2(); return; }
  }

  if (btnNext) btnNext.onclick = () => goTo(Math.min(2, step + 1));
  if (btnPrev) btnPrev.onclick = () => goTo(Math.max(0, step - 1));

  // Init
  toStep0();
}
initBellCircuit();


/*----------------------------------------------------------- 
  8️⃣  H + CNOT → BELL STATE  (animated, clear UP motion at CNOT)
  -----------------------------------------------------------*/
function initBellCircuit() {
  const svg = document.getElementById("bell-circuit");
  if (!svg) return;

  // Existing SVG bits
  const gateH    = document.getElementById("gateH");
  const gateCNOT = document.getElementById("gateCNOT");
  const lblRight = document.getElementById("bell-state-label"); // we reposition this near CNOT

  const btnNext = document.getElementById("bell-next");
  const btnPrev = document.getElementById("bell-prev");

  // Geometry from your SVG
  const x0   = 90;                   // start x
  const xHc  = 230;                  // H gate center (200 + 60/2)
  const xMid = 300;                  // between H and CNOT
  const xC   = 420;                  // CNOT column
  const xOut = 470;                  // output label just to the right of CNOT

  const yTop = 70;
  const yBot = 150;

  // Style
  const ACCENT = "#57e5e0";
  const EDGE   = "rgba(255,255,255,0.7)";
  const FILL   = "rgba(255,255,255,0.06)";
  const TEXT   = "#ffffff";

  // Token factory (rounded chips)
  function makeToken(x, y, text) {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");

    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", x - 22);
    rect.setAttribute("y", y - 14);
    rect.setAttribute("width", 44);
    rect.setAttribute("height", 28);
    rect.setAttribute("rx", 14);
    rect.setAttribute("fill", FILL);
    rect.setAttribute("stroke", EDGE);
    rect.setAttribute("stroke-width", "2");

    const t = document.createElementNS("http://www.w3.org/2000/svg", "text");
    t.setAttribute("x", x);
    t.setAttribute("y", y + 6);
    t.setAttribute("text-anchor", "middle");
    t.setAttribute("font-family", "ui-sans-serif, Segoe UI, sans-serif");
    t.setAttribute("font-size", "16");
    t.setAttribute("fill", TEXT);
    t.textContent = text;

    g.appendChild(rect); g.appendChild(t);
    svg.appendChild(g);
    return { rect, t };
  }
  function setTokenPos(tok, x, y) {
    tok.rect.setAttribute("x", x - 22);
    tok.rect.setAttribute("y", y - 14);
    tok.t.setAttribute("x", x);
    tok.t.setAttribute("y", y + 6);
  }
  function setTokenText(tok, txt, glow=false) {
    tok.t.textContent = txt;
    tok.rect.setAttribute("stroke", glow ? ACCENT : EDGE);
    tok.rect.setAttribute("fill", glow ? "rgba(120,250,245,0.12)" : FILL);
  }

  // Easing & tweens
  const ease = u => (u < 0.5 ? 2*u*u : -1 + (4 - 2*u)*u); // easeInOutQuad
  function tweenPos(tok, x0, y0, x1, y1, ms=450) {
    return new Promise(res => {
      const t0 = performance.now();
      (function step(t){
        const u = Math.min(1, (t - t0)/ms);
        const e = ease(u);
        setTokenPos(tok, x0 + (x1-x0)*e, y0 + (y1-y0)*e);
        if (u < 1) requestAnimationFrame(step); else res();
      })(performance.now());
    });
  }
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  // Flash the vertical CNOT link (clear “interaction” cue)
  function flashVertical() {
    const v = document.createElementNS("http://www.w3.org/2000/svg", "line");
    v.setAttribute("x1", xC); v.setAttribute("x2", xC);
    v.setAttribute("y1", yTop); v.setAttribute("y2", yBot);
    v.setAttribute("stroke", ACCENT); v.setAttribute("stroke-width", "3");
    v.setAttribute("stroke-linecap", "round");
    svg.appendChild(v);
    let a = 1;
    (function fade(){
      a -= 0.04; v.setAttribute("opacity", String(Math.max(0,a)));
      if (a > 0) requestAnimationFrame(fade); else svg.removeChild(v);
    })();
  }

  // Tokens
  const tokTop = makeToken(x0, yTop, "|0⟩");
  const tokBot = makeToken(x0, yBot, "|0⟩");

  // Gate highlighting + dim far-right |ψ⟩ after CNOT
  function highlight(step) {
    if (gateH)    gateH.setAttribute("opacity", step === 1 ? "1" : "0.35");
    if (gateCNOT) gateCNOT.setAttribute("opacity", step === 2 ? "1" : "0.35");
    const psi = Array.from(svg.querySelectorAll("text")).find(t => t.textContent.trim() === "|ψ⟩");
    if (psi) psi.setAttribute("opacity", step === 2 ? "0.25" : "1");
  }

  // Output label: position **right after CNOT**, centered between wires
  function setOutputLabel(txt) {
    if (!lblRight) return;
    lblRight.setAttribute("x", xOut);
    lblRight.setAttribute("y", (yTop + yBot) / 2 + 6);
    lblRight.setAttribute("text-anchor", "start");
    lblRight.textContent = txt;
  }

  // Steps
  async function toStep0() {
    highlight(0);
    setTokenText(tokTop, "|0⟩"); setTokenText(tokBot, "|0⟩");
    setTokenPos(tokTop, x0, yTop); setTokenPos(tokBot, x0, yBot);
    setOutputLabel("|00⟩");
  }

  // Top qubit enters H → |+⟩, bottom stays |0⟩
  async function toStep1() {
    await toStep0();
    highlight(1);
    await tweenPos(tokTop, x0, yTop, xHc - 6, yTop, 420);     // into H
    setTokenText(tokTop, "|+⟩", true);
    await tweenPos(tokTop, xHc - 6, yTop, xMid, yTop, 360);   // out of H
    setOutputLabel("|+0⟩ = (|00⟩ + |10⟩)/√2");
  }

  // Both qubits to CNOT; bottom visibly GOES UP, holds, then down → entangled
  async function toStep2() {
    await toStep1();
    highlight(2);

    // Slide both horizontally to the CNOT column first
    await Promise.all([
      tweenPos(tokTop, xMid, yTop, xC - 10, yTop, 420),
      tweenPos(tokBot, x0,  yBot, xC - 10, yBot, 500)
    ]);

    // *** KEY PART: bottom token goes UP the vertical wire and HOLDS there ***
    await tweenPos(tokBot, xC - 10, yBot, xC - 10, yTop + 2, 280); // go up
    flashVertical();                       // emphasize the interaction
    await sleep(260);                      // hold at the top briefly
    await tweenPos(tokBot, xC - 10, yTop + 2, xC - 10, yBot, 280); // go back down

    // After CNOT → entangled; show output label right after the gate
    setTokenText(tokTop, "↯", true);
    setTokenText(tokBot, "↯", true);
    setOutputLabel("( |00⟩ + |11⟩ )/√2");

    // Drift both a short distance to the right (still near CNOT)
    await Promise.all([
      tweenPos(tokTop, xC - 10, yTop, xOut, yTop, 300),
      tweenPos(tokBot, xC - 10, yBot, xOut, yBot, 300)
    ]);
  }

  // Controller
  let step = 0;
  async function goTo(n) {
    if (n <= 0) { step = 0; await toStep0(); return; }
    if (n === 1) { step = 1; await toStep1(); return; }
    if (n >= 2) { step = 2; await toStep2(); return; }
  }

  if (btnNext) btnNext.onclick = () => goTo(Math.min(2, step + 1));
  if (btnPrev) btnPrev.onclick = () => goTo(Math.max(0, step - 1));

  // Init
  toStep0();
}
initBellCircuit();





/*-----------------------------------------------------------
  9️⃣  RSA STORY — multiply easy, factor hard
  -----------------------------------------------------------*/
function initRSAStory() {
  const cont = document.getElementById("rsa-scene");
  if (!cont) return;

  const btnMul = document.getElementById("rsa-mul");
  const btnFac = document.getElementById("rsa-fac");
  const out = document.getElementById("rsa-output");

  function multiply() {
    out.innerHTML = `
      <div style="display:flex;gap:12px;align-items:center;justify-content:center;">
        <div class="primeBox">p</div>
        <div style="opacity:.7;">×</div>
        <div class="primeBox">q</div>
        <div style="opacity:.7;">→</div>
        <div class="lockBox">N = p·q 🔒</div>
      </div>
      <div class="caption" style="margin-top:10px;">Easy: multiply small primes to get large N.</div>`;
  }

  function factorTry() {
    out.innerHTML = `
      <div style="display:flex;gap:12px;align-items:center;justify-content:center;">
        <div class="lockBox shake">N 🔒</div>
        <div style="opacity:.7;">→</div>
        <div class="primeBox">p ?</div>
        <div class="primeBox">q ?</div>
      </div>
      <div class="caption" style="margin-top:10px;">Hard (classically): given N, recover p and q.</div>`;
    // stop shake after a moment
    setTimeout(() => {
      const lock = out.querySelector(".lockBox");
      if (lock) lock.classList.remove("shake");
    }, 900);
  }

  if (btnMul) btnMul.onclick = multiply;
  if (btnFac) btnFac.onclick = factorTry;

  // default
  multiply();
}
initRSAStory();




/*-----------------------------------------------------------
  🔟  INTERFERENCE VISUALIZER — phase slider
  -----------------------------------------------------------*/
function initInterferenceDemo() {
  const c = document.getElementById("interf-canvas");
  if (!c) return;
  const ctx = c.getContext("2d");
  let phi = Math.PI / 3; // phase difference
  const A = 1.0, k = 2 * Math.PI / 120; // wavelength ~120px

  const slider = document.getElementById("interf-phase");
  const label  = document.getElementById("interf-label");
  if (slider) slider.oninput = (e) => {
    phi = (+e.target.value) * Math.PI;
    if (label) label.textContent = (phi/Math.PI).toFixed(2) + "π";
    draw();
  };

  function drawWave(y0, phase, color) {
    ctx.beginPath();
    for (let x = 20; x <= c.width - 20; x++) {
      const y = y0 - 35 * A * Math.sin(k * x + phase);
      if (x === 20) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function drawBars() {
    // Bars indicate combined intensity ~ |ψ1+ψ2|^2 time-averaged ⇒ 1 + cos(phi)
    const intensity = 1 + Math.cos(phi);
    const cx = c.width - 80, baseY = 190, maxH = 120;
    const h = (intensity / 2) * maxH; // normalize 0..2 → 0..maxH

    // background bar
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.fillRect(cx - 20, baseY - maxH, 40, maxH);
    // current intensity
    ctx.fillStyle = "rgba(41,178,178,0.85)";
    ctx.fillRect(cx - 20, baseY - h, 40, h);

    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.font = "13px sans-serif";
    ctx.fillText("Intensity", cx - 26, baseY + 18);
  }

  function drawAxes() {
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(20, 60);  ctx.lineTo(c.width - 120, 60);
    ctx.moveTo(20, 120); ctx.lineTo(c.width - 120, 120);
    ctx.moveTo(20, 180); ctx.lineTo(c.width - 120, 180);
    ctx.stroke();
  }

  function draw() {
    ctx.clearRect(0, 0, c.width, c.height);
    drawAxes();
    drawWave(60, 0, "rgba(255,255,255,0.9)");
    drawWave(120, phi, "rgba(41,178,178,0.9)");
    // Sum (same line as middle, but thicker and brighter)
    ctx.beginPath();
    for (let x = 20; x <= c.width - 120; x++) {
      const y = 180 - 35 * (Math.sin(k * x) + Math.sin(k * x + phi));
      if (x === 20) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = "#29b2b2";
    ctx.lineWidth = 3;
    ctx.stroke();
    drawBars();
  }

  draw();
}
initInterferenceDemo();

/*-----------------------------------------------------------
  1️⃣1️⃣  ERROR CORRECTION TEASER — repetition code (3-qubit)
  -----------------------------------------------------------*/
function initErrorCorrection() {
  const cont = document.getElementById("ecc-scene");
  if (!cont) return;
  const applyNoiseBtn = document.getElementById("ecc-noise");
  const decodeBtn     = document.getElementById("ecc-decode");
  const resetBtn      = document.getElementById("ecc-reset");
  const msg           = document.getElementById("ecc-msg");

  let qubits = [+1, +1, +1]; // encode logical |0⟩ as +1,+1,+1 (toy Z-basis)
  render();

  function render(highlightMajority = false) {
    cont.innerHTML = "";
    qubits.forEach((q, i) => {
      const box = document.createElement("div");
      box.className = "eccQ";
      box.textContent = q > 0 ? "+1" : "−1";
      if (highlightMajority) box.classList.add("eccMajor");
      cont.appendChild(box);
    });
  }

  function applyNoise() {
    // flip each qubit with small probability
    const p = 0.25;
    qubits = qubits.map(q => (Math.random() < p ? -q : q));
    msg.textContent = "Noise applied — check for flips.";
    render();
  }

  function majorityDecode() {
    const sum = qubits.reduce((a,b)=>a+b,0); // +3, +1, −1, or −3
    const logical = sum >= 1 ? "+1 (logical 0)" : "−1 (logical 1)";
    msg.textContent = "Majority vote ⇒ " + logical;
    render(true);
  }

  function reset() {
    qubits = [+1,+1,+1];
    msg.textContent = "Encoded logical 0 as (+1,+1,+1).";
    render();
  }

  if (applyNoiseBtn) applyNoiseBtn.onclick = applyNoise;
  if (decodeBtn)     decodeBtn.onclick     = majorityDecode;
  if (resetBtn)      resetBtn.onclick      = reset;
}
initErrorCorrection();

/*-----------------------------------------------------------
  1️⃣2️⃣  CONTINUED FRACTIONS INTUITION — recover r
  -----------------------------------------------------------*/
function initContinuedFractions() {
  const yIn   = document.getElementById("cf-y");
  const NIn   = document.getElementById("cf-N");
  const list  = document.getElementById("cf-list");
  if (!yIn || !NIn || !list) return;

  function gcd(a,b){ return b ? gcd(b, a%b) : Math.abs(a); }

  function contFrac(num, den, maxK=10){
    // Continued fraction expansion for num/den
    const a = [];
    let n = num, d = den;
    for (let k=0;k<maxK && d!==0;k++){
      const q = Math.floor(n/d);
      a.push(q);
      const t = n - q*d; n = d; d = t;
    }
    // convergents
    const conv = [];
    let h1=1, h0=0, k1=0, k0=1;
    for (let i=0;i<a.length;i++){
      const ai = a[i];
      const h = ai*h1 + h0;
      const k = ai*k1 + k0;
      conv.push({num:h, den:k});
      h0=h1; h1=h; k0=k1; k1=k;
    }
    return conv;
  }

  function update(){
    const y = Math.max(1, parseInt(yIn.value||"1"));
    const N = Math.max(2, parseInt(NIn.value||"128"));
    list.innerHTML = "";
    const fracs = contFrac(y, N, 12);
    fracs.forEach((c, idx) => {
      const r = c.den; // candidate r
      const li = document.createElement("li");
      li.textContent = `Convergent ${idx+1}: ${c.num}/${c.den}  → candidate r = ${r}`;
      list.appendChild(li);
    });
    const tip = document.createElement("li");
    tip.innerHTML = `<span style="color:#29b2b2">Hint:</span> test candidates r by checking if \(a^r ≡ 1 (mod N)\) (in Shor).`;
    list.appendChild(tip);
  }

  yIn.oninput = update;
  NIn.oninput = update;
  update();
}
initContinuedFractions();
