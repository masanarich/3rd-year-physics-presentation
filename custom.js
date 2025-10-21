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
  3️⃣  BLOCH SPHERE  (already scaffolded)
  -----------------------------------------------------------*/
function initBlochSphere() {
  const el = document.getElementById("bloch-container");
  if (!el) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    35,
    el.clientWidth / el.clientHeight,
    0.1,
    100
  );
  camera.position.set(0, 0, 4);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(el.clientWidth, el.clientHeight);
  el.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 0.8));
  const dir = new THREE.DirectionalLight(0xffffff, 0.6);
  dir.position.set(2, 2, 3);
  scene.add(dir);

  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(1, 48, 48),
    new THREE.MeshPhongMaterial({
      color: 0x0a0f14,
      transparent: true,
      opacity: 0.85,
    })
  );
  scene.add(sphere);

  const wire = new THREE.LineSegments(
    new THREE.WireframeGeometry(new THREE.SphereGeometry(1.001, 16, 12)),
    new THREE.LineBasicMaterial({
      color: 0x29b2b2,
      opacity: 0.25,
      transparent: true,
    })
  );
  scene.add(wire);

  // State vector arrow
  const arrowMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const shaft = new THREE.CylinderGeometry(0.012, 0.012, 1.0, 16);
  const head = new THREE.ConeGeometry(0.06, 0.16, 24);
  const shaftMesh = new THREE.Mesh(shaft, arrowMat);
  const headMesh = new THREE.Mesh(head, arrowMat);
  const arrow = new THREE.Group();
  shaftMesh.position.y = 0.5;
  headMesh.position.y = 1.08;
  arrow.add(shaftMesh);
  arrow.add(headMesh);
  scene.add(arrow);

  function setArrow(theta, phi) {
    const x = Math.sin(theta) * Math.cos(phi);
    const y = Math.sin(theta) * Math.sin(phi);
    const z = Math.cos(theta);
    const v = new THREE.Vector3(x, y, z).normalize();
    arrow.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), v);
  }

  let theta = 0,
    phi = 0;
  setArrow(theta, phi);

  function animate() {
    requestAnimationFrame(animate);
    sphere.rotation.y += 0.0025;
    wire.rotation.y += 0.0025;
    renderer.render(scene, camera);
  }
  animate();

  window.setState = (k) => {
    if (k === "zero") setArrow(0, 0);
    if (k === "one") setArrow(Math.PI, 0);
    if (k === "super") setArrow(Math.PI / 2, 0);
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
  7️⃣  ENTANGLEMENT CORRELATION DEMO
  -----------------------------------------------------------*/
function initEntanglementDemo() {
  const canvas = document.getElementById("entangle-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let entangled = false;
  let measured = false;
  let outcomes = [];

  function drawCircles(aState = null, bState = null) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // A circle
    drawQubit(160, 90, aState);
    // B circle
    drawQubit(540, 90, bState);

    // Link line if entangled
    if (entangled) {
      ctx.strokeStyle = "rgba(41,178,178,0.6)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(260, 90);
      ctx.lineTo(440, 90);
      ctx.stroke();
      ctx.font = "14px sans-serif";
      ctx.fillStyle = "#29b2b2";
      ctx.fillText("Entangled", 332, 112);
    }

    // Outcomes log
    ctx.font = "13px monospace";
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    const startY = 200;
    ctx.fillText("Runs (Z-basis):", 40, startY);
    outcomes.slice(-8).forEach((o, i) => {
      const y = startY + 18 + i * 16;
      ctx.fillText(`${o}`, 40, y);
    });
  }

  function drawQubit(x, y, state) {
    // circle
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 60, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // label
    ctx.font = "16px sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.textAlign = "center";
    ctx.fillText(state === null ? "?" : state > 0 ? "+1" : "−1", x, y + 6);
  }

  function measureZ() {
    let a, b;
    if (entangled) {
      a = Math.random() < 0.5 ? +1 : -1;
      b = a; // perfect correlation in Z (Bell-like toy)
    } else {
      a = Math.random() < 0.5 ? +1 : -1;
      b = Math.random() < 0.5 ? +1 : -1;
    }
    measured = true;
    outcomes.push(`A: ${a > 0 ? "+1" : "-1"}   B: ${b > 0 ? "+1" : "-1"}   ${entangled ? "(corr)" : ""}`);
    drawCircles(a, b);
  }

  function reset() {
    measured = false;
    drawCircles(null, null);
  }

  drawCircles();

  const btnEnt = document.getElementById("btn-entangle");
  const btnSep = document.getElementById("btn-separable");
  const btnMeas = document.getElementById("btn-measureZ");
  const btnReset = document.getElementById("btn-reset-ent");

  if (btnEnt) btnEnt.onclick = () => { entangled = true; reset(); };
  if (btnSep) btnSep.onclick = () => { entangled = false; reset(); };
  if (btnMeas) btnMeas.onclick = () => measureZ();
  if (btnReset) btnReset.onclick = () => { outcomes = []; reset(); };
}
initEntanglementDemo();

/*-----------------------------------------------------------
  8️⃣  H + CNOT → BELL STATE  (circuit stepper)
  -----------------------------------------------------------*/
function initBellCircuit() {
  const svg = document.getElementById("bell-circuit");
  if (!svg) return;

  let step = 0; // 0: |00>, 1: after H, 2: after CNOT
  const lbl = document.getElementById("bell-state-label");
  const btnNext = document.getElementById("bell-next");
  const btnPrev = document.getElementById("bell-prev");

  function setStateText() {
    if (!lbl) return;
    if (step === 0) lbl.innerHTML = "|00⟩";
    if (step === 1) lbl.innerHTML = "(|00⟩ + |10⟩)/√2";
    if (step === 2) lbl.innerHTML = "(|00⟩ + |11⟩)/√2";
  }

  function highlightGate() {
    // reset
    for (const id of ["gateH", "gateCNOT"]) {
      const el = document.getElementById(id);
      if (el) el.setAttribute("opacity", "0.35");
    }
    if (step === 1) {
      const g = document.getElementById("gateH");
      if (g) g.setAttribute("opacity", "1");
    }
    if (step === 2) {
      const g = document.getElementById("gateCNOT");
      if (g) g.setAttribute("opacity", "1");
    }
  }

  function draw() {
    setStateText();
    highlightGate();
  }

  if (btnNext) btnNext.onclick = () => { step = Math.min(2, step + 1); draw(); };
  if (btnPrev) btnPrev.onclick = () => { step = Math.max(0, step - 1); draw(); };

  draw();
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
