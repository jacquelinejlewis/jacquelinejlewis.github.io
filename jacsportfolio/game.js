// ------------------------------------------------------
// Utility: footer year + C++ copy button (if present)
// ------------------------------------------------------
(function initUtility() {
  const y = document.getElementById('y');
  if (y) y.textContent = new Date().getFullYear();

  const copyBtn = document.getElementById('copyBtn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const el = document.getElementById('cppCode');
      if (!el) return;
      const text = el.textContent.replace(/^\n/, '');
      navigator.clipboard.writeText(text).then(() => {
        const prev = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        setTimeout(() => (copyBtn.textContent = prev), 1200);
      });
    });
  }
})();

// ------------------------------------------------------
// Baja’s Snack Attack — sprite version (fish vs hooks)
// ------------------------------------------------------
(function game() {
  const cvs = document.getElementById('gameCanvas');
  if (!cvs) return; // If there’s no game on this page, do nothing.
  const ctx = cvs.getContext('2d');

  // UI elements
  const scoreEl = document.getElementById('gScore');
  const timeEl  = document.getElementById('gTime');
  const livesEl = document.getElementById('gLives');
  const bestEl  = document.getElementById('gBest');

  const btnStart = document.getElementById('btnStart');
  const btnPause = document.getElementById('btnPause');
  const btnReset = document.getElementById('btnReset');

  const BEST_KEY = 'baja_best';

  // ---- Asset loading helper
  function makeImg(src){ const i = new Image(); i.src = src; return i; }

  // ---- Assets (make sure filenames match exactly)
  const bajaImg  = makeImg("baja.png");
  const fishImgs = [makeImg("fish1.png"), makeImg("fish2.png"), makeImg("fish3.png")];
  const hookImgs = [makeImg("fishhook1.png"), makeImg("fishhook2.png"), makeImg("fishhook3.png")];

  // ---- Game state
  let state = 'idle'; // 'idle' | 'running' | 'paused' | 'ended'
  let items = [];     // falling sprite objects
  let score = 0;
  let timeLeft = 60;
  let lives = 3;
  let spawnTimer = 0;

  let baja = { x: cvs.width/2, y: cvs.height-70, w:60, h:60, speed:260 };
  let keys = { left:false, right:false };

  bestEl.textContent = localStorage.getItem(BEST_KEY) || 0;

  // ---- Core helpers
  function clampBaja(){ baja.x = Math.max(30, Math.min(cvs.width-30, baja.x)); }

  function reset(){
    state='idle';
    items.length = 0;
    score = 0;
    timeLeft = 60;
    lives = 3;
    spawnTimer = 0;
    scoreEl.textContent = score;
    timeEl.textContent = timeLeft;
    livesEl.textContent = lives;
    if (btnPause) btnPause.textContent = 'Pause';
    drawSplash();
  }

  // Spawn a fish or a hook, with type flag
  function spawn(){
    const x = 30 + Math.random()*(cvs.width-60);
    const vy = 2 + Math.random()*1.5;
    const size = 44; // draw size for sprite
    const type = Math.random() < 0.28 ? 'hook' : 'fish'; // ~28% hooks
    const img  = (type === 'hook')
      ? hookImgs[(Math.random()*hookImgs.length)|0]
      : fishImgs[(Math.random()*fishImgs.length)|0];

    items.push({ x, y:-30, vy, size, img, type });
  }

  function update(dt){
    if(state!=='running') return;

    // Baja movement (keyboard)
    if(keys.left)  baja.x -= baja.speed*dt;
    if(keys.right) baja.x += baja.speed*dt;
    clampBaja();

    // Spawn — gets a little faster with score
    spawnTimer += dt;
    const spawnEvery = Math.max(0.4, 0.9 - score*0.01);
    if(spawnTimer > spawnEvery){ spawn(); spawnTimer = 0; }

    // Move items
    items.forEach(it => it.y += it.vy*60*dt);

    // Collisions with Baja
    for(let i=items.length-1; i>=0; i--){
      const it = items[i];
      const withinX = Math.abs(it.x - baja.x) < (baja.w * 0.55);
      const withinY = (it.y + it.size/2) > (baja.y - 8) && it.y < (baja.y + 20);
      if(withinX && withinY){
        items.splice(i, 1);
        if (it.type === 'hook') {
          lives = Math.max(0, lives - 1);
          livesEl.textContent = lives;
          flash('#ffebee'); // light red feedback
          if (lives === 0) { endGame(); return; }
        } else {
          score++;
          scoreEl.textContent = score;
        }
      }
    }

    // Remove offscreen items
    items = items.filter(it => it.y < cvs.height + 60);

    // Clock
    timeLeft -= dt;
    if(timeLeft <= 0 || lives <= 0) { endGame(); return; }
    timeEl.textContent = Math.max(0, timeLeft|0);
  }
function draw(){
  // Blue gradient background (sky → water)
  const gradient = ctx.createLinearGradient(0, 0, 0, cvs.height);
  gradient.addColorStop(0, '#b3e5fc'); // light sky blue
  gradient.addColorStop(1, '#4fc3f7'); // deeper water blue
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, cvs.width, cvs.height);

  // (Optional) dotted overlay — comment out if you want smooth water only
  // ctx.fillStyle='rgba(0,0,0,0.03)';
  // for(let y=0;y<cvs.height;y+=20) {
  //   for(let x=0;x<cvs.width;x+=20) {
  //     ctx.fillRect(x,y,2,2);
  //   }
  // }

  // Draw falling items (fish & hooks)
  items.forEach(it=>{
    if(it.img.complete && it.img.naturalWidth){
      ctx.drawImage(it.img, it.x - it.size/2, it.y - it.size/2, it.size, it.size);
    } else {
      // fallback shape if image not loaded
      ctx.fillStyle = (it.type === 'hook') ? '#ba68c8' : '#4fc3f7';
      ctx.beginPath(); ctx.arc(it.x, it.y, it.size*0.45, 0, Math.PI*2); ctx.fill();
    }

    // halo ring
    ctx.beginPath();
    ctx.arc(it.x, it.y, it.size*0.58, 0, Math.PI*2);
    ctx.strokeStyle = (it.type === 'hook') ? '#ba68c8' : '#4fc3f7';
    ctx.lineWidth = 2;
    ctx.stroke();
  });

  // Draw Baja (pelican sprite)
  if(bajaImg.complete && bajaImg.naturalWidth){
    ctx.drawImage(bajaImg, baja.x-30, baja.y-30, baja.w, baja.h);
  } else {
    // fallback circle if baja.png missing
    ctx.fillStyle='#ff7043';
    ctx.beginPath(); ctx.arc(baja.x, baja.y, 30, 0, Math.PI*2); ctx.fill();
  }

  // Splash overlays (idle / game over)
  if(state==='idle' || state==='ended') drawSplash();
}

  }

  function drawSplash(){
    ctx.save();
    ctx.textAlign='center'; ctx.fillStyle='#2c2c2c';
    ctx.font='24px Poppins, system-ui, sans-serif';
    ctx.fillText('Baja’s Snack's', cvs.width/2, 260);
    ctx.font='16px Poppins, system-ui, sans-serif';
    ctx.fillText('Catch fish, avoid hooks', cvs.width/2, 290);
    ctx.fillText('Press Start', cvs.width/2, 320);
    ctx.restore();
  }

  function flash(color){
    // quick overlay flash for feedback (e.g., on hook hit)
    ctx.save();
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.35;
    ctx.fillRect(0, 0, cvs.width, cvs.height);
    ctx.restore();
  }

  function endGame(){
    state='ended';
    const best = Math.max(Number(localStorage.getItem(BEST_KEY)||0), score);
    localStorage.setItem(BEST_KEY, best);
    bestEl.textContent = best;

    // Game over overlay
    ctx.save();
    ctx.fillStyle='rgba(0,0,0,0.4)'; ctx.fillRect(0,0,cvs.width,cvs.height);
    ctx.fillStyle='#fff'; ctx.fillRect(40,220,cvs.width-80,140);
    ctx.strokeStyle='#ff7043'; ctx.lineWidth=3; ctx.strokeRect(40,220,cvs.width-80,140);
    ctx.fillStyle='#2c2c2c'; ctx.textAlign='center';
    ctx.font='22px Poppins, system-ui'; ctx.fillText('Game Over',cvs.width/2,248);
    ctx.font='16px Poppins, system-ui'; ctx.fillText(`Score: ${score}  •  Best: ${best}`,cvs.width/2,282);
    ctx.font='14px Poppins, system-ui'; ctx.fillText('Press Reset to play again',cvs.width/2,314);
    ctx.restore();
  }

  // ---- Controls
  // Buttons
  if (btnStart) btnStart.addEventListener('click', ()=>{
    if(state==='ended') reset();
    state='running';
  });
  if (btnPause) btnPause.addEventListener('click', ()=>{
    if(state==='running'){ state='paused'; btnPause.textContent='Resume'; }
    else if(state==='paused'){ state='running'; btnPause.textContent='Pause'; }
  });
  if (btnReset) btnReset.addEventListener('click', ()=>{
    reset();
  });

  // Keyboard
  document.addEventListener('keydown', e=>{
    if(state!=='running') return;
    if(e.key==='ArrowLeft') keys.left = true;
    if(e.key==='ArrowRight') keys.right = true;
  });
  document.addEventListener('keyup', e=>{
    if(e.key==='ArrowLeft') keys.left = false;
    if(e.key==='ArrowRight') keys.right = false;
  });

  // Touch (left/right halves)
  cvs.addEventListener('touchstart', e=>{
    if(state!=='running') return;
    e.preventDefault(); e.stopPropagation();
    const r = cvs.getBoundingClientRect();
    const x = e.touches[0].clientX - r.left;
    if(x < cvs.width/2) keys.left = true; else keys.right = true;
  }, {passive:false});
  cvs.addEventListener('touchend', ()=>{
    keys.left = false; keys.right = false;
  }, {passive:true});

  // Click nudge (desktop) — doesn’t bubble or trigger links
  cvs.addEventListener('click', e=>{
    if(state!=='running') return;
    e.preventDefault(); e.stopPropagation();
    const r = cvs.getBoundingClientRect();
    const x = e.clientX - r.left;
    if(x < cvs.width/2) baja.x -= 40; else baja.x += 40;
    clampBaja();
  });

  // ---- Main loop
  let last = performance.now();
  function loop(now){
    const dt = Math.min(0.05, (now-last)/1000); last = now;
    if(state==='running') update(dt);
    draw();
    requestAnimationFrame(loop);
  }
  reset();
  requestAnimationFrame(loop);
})();

// ------------------------------------------------------
// Binary ↔ Decimal Calculator (C++-aligned rules)
// ------------------------------------------------------
(function converter(){
  const $ = (id) => document.getElementById(id);
  const input = $('calcInput');
  const btn   = $('calcBtn');
  const clr   = $('calcClear');
  const outS  = $('calcStatus');
  const outB  = $('calcAsBin');
  const outD  = $('calcAsDec');
  const copyB = $('copyBin');
  const copyD = $('copyDec');

  if (!input || !btn) return; // calculator not on this page

  // C++-matching validators
  function binaryQ(x){
    if (!x || x.length === 0) return false;
    if (x[0] !== '0') return false;
    if (x.length > 9) return false;
    for (let i=0; i<x.length; i++){
      if (x[i] !== '0' && x[i] !== '1') return false;
    }
    return true;
  }

  function decimalQ(x){
    if (!x || x.length === 0) return false;
    // no leading zero unless exactly "0"
    if (x.length > 1 && x[0] === '0') return false;
    // digits only
    for (let i=0; i<x.length; i++){
      if (x[i] < '0' || x[i] > '9') return false;
    }
    // range 0..255
    const num = Number.parseInt(x, 10);
    if (!Number.isFinite(num)) return false;
    if (num < 0 || num > 255) return false;
    return true;
  }

  function toBinary(dec){
    // produce standard binary without forcing a leading 0
    return Number(dec).toString(2);
  }

  function toDecimal(bin){
    return parseInt(bin, 2).toString(10);
  }

  function setOutputs(status, bin, dec){
    outS.textContent = status;
    outB.textContent = bin ?? '–';
    outD.textContent = dec ?? '–';
  }

  function handleConvert(){
    const raw = input.value.trim();
    if (!raw){
      setOutputs('Please enter a value.', '–', '–');
      return;
    }

    if (binaryQ(raw)){
      // valid binary -> show decimal
      const dec = toDecimal(raw);
      setOutputs('Valid BINARY ✔', raw, dec);
    } else if (decimalQ(raw)){
      // valid decimal -> show binary
      const bin = toBinary(raw);
      // Note: your C++ binary rule requires leading '0' to be considered binary input,
      // but for conversion display we keep standard binary (no forced leading 0).
      setOutputs('Valid DECIMAL ✔', bin, String(Number(raw)));
    } else {
      setOutputs('Invalid input ✖', '–', '–');
    }
  }

  btn.addEventListener('click', handleConvert);
  input.addEventListener('keydown', (e)=>{ if(e.key === 'Enter') handleConvert(); });

  clr.addEventListener('click', ()=>{
    input.value = '';
    setOutputs('–', '–', '–');
    input.focus();
  });

  function attachCopy(button, getText){
    button.addEventListener('click', ()=>{
      const text = getText();
      if (!text || text === '–') return;
      navigator.clipboard.writeText(text).then(()=>{
        const prev = button.textContent;
        button.textContent = 'Copied!';
        setTimeout(()=> button.textContent = prev, 1000);
      });
    });
  }
  attachCopy(copyB, ()=> outB.textContent);
  attachCopy(copyD, ()=> outD.textContent);
})();
