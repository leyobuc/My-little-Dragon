(() => {
'use strict';
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, r = document) => r.querySelector(s);
const rand = (a, b) => a + Math.random() * (b - a);
const pick = a => a[Math.random() * a.length | 0];
const wait = ms => new Promise(r => setTimeout(r, RM ? Math.min(ms, 150) : ms));

/* ---------- DATA ---------- */
const GIFTS = [
  { t: 'Open when you miss me', ph: 'assets/Miss me.png', msg: 'Come here, baby. Sending you the biggest hug!',
    c1: '#e58fa8', c2: '#f0a9bd', rib: '#fff3e6', gl: '#ffe9b8', sbg: '#f7cfc7', fx: 'hug', lid: 'a1' },
  { t: "Open when you're sad", ph: 'assets/When sad.png', msg: "It's okay not to be okay. I'm always here for you.",
    c1: '#b9a4de', c2: '#cdbbea', rib: '#fff6ee', gl: '#efe4ff', sbg: '#d9cdef', fx: 'sad', lid: 'a2' },
  { t: 'Open when you need a kiss', ph: 'assets/Need a kiss.png', msg: "Mwah! Here's a thousand kisses just for you!",
    c1: '#d86a88', c2: '#e684a0', rib: '#f6dfa8', gl: '#ffd6e0', sbg: '#f6bfd0', fx: 'kiss', lid: 'a3' },
  { t: 'Open when you want to smile', ph: 'assets/Make me smile.png', msg: 'There! I hope I made you smile, my favorite person!',
    c1: '#f1cf8f', c2: '#f7dda9', rib: '#d96d8a', gl: '#fff4c2', sbg: '#fde9c9', fx: 'smile', lid: 'a4' },
  { t: "Open when you can't sleep", ph: 'assets/Cant Sleep.png', msg: 'Close your eyes, baby. Imagine I\'m beside you.',
    c1: '#5a3d7a', c2: '#70509a', rib: '#e8cf9f', gl: '#cdb8ff', sbg: '#1f1638', fx: 'sleep', lid: 'a5' },
  { t: 'Open when you need reassurance', ph: 'assets/Need Reassurance.png', msg: 'In case you forget, I choose you. Always.',
    c1: '#f7e6d8', c2: '#fff3ea', rib: '#c4566f', gl: '#ffc2d2', sbg: '#3b1631', fx: 'promise', lid: 'a6' }
];
const PINK = ['#f4a6bb', '#e58fa8', '#cbbbe8', '#e8cf9f', '#fbd3dc'];
const NIGHT = ['#ffb3c7', '#ff8fab', '#e8cf9f', '#fbd3dc'];
const CONF = ['#f4a6bb', '#e8cf9f', '#cbbbe8', '#c76b86', '#ffffff', '#ffd27a'];

/* ---------- STATE ---------- */
const opened = new Set();
let busy = false, completed = false, mode = 'soft', fxTimer = null;
/* ---------- ELEMENTS ---------- */
const amb = $('#amb'), fx = $('#fx'), stage = $('#stage'), sbox = $('#sbox'), card = $('#card');
const grid = $('#grid'), prog = $('#prog'), bar = $('#bar');
const pickBtn = $('#pickBtn'), lastBtn = $('#lastBtn'), lastBtn2 = $('#lastBtn2'), closeBtn = $('#closeBtn');

/* ---------- PARTICLES ---------- */
function spawn(layer, kind, o = {}) {
  if (RM || layer.childElementCount > 70) return;
  const el = document.createElement('i');
  el.className = `p ${kind} ${o.anim || 'rise'}`;
  el.style.cssText = `left:${o.x ?? rand(0, 100)}%;--s:${o.s ?? rand(10, 22)}px;--dx:${o.dx ?? rand(-60, 60)}px;--r:${rand(-90, 90)}deg;color:${o.col || pick(mode === 'final' ? NIGHT : PINK)};animation-duration:${o.d ?? rand(6, 10)}s;`;
  if (o.top != null) el.style.top = o.top + '%';
  if (kind === 'k') el.textContent = '💋';
  layer.appendChild(el);
  el.addEventListener('animationend', () => el.remove());
}
setInterval(() => {
  if (document.hidden || stage.classList.contains('on')) return;
  if (mode === 'final') {
    const r = Math.random();
    if (r < .55) spawn(amb, 'pt', { anim: 'fall', d: rand(8, 13), s: rand(12, 22), dx: rand(-120, 120) });
    else spawn(amb, 'h', { d: rand(7, 11) });
  } else spawn(amb, Math.random() < .7 ? 'h' : 's', { d: rand(8, 12) });
}, 650);

const FX = {
  hug:   () => { spawn(fx, 'h', { col: pick(['#f08aa5', '#ff9f7a', '#ffc2a0']), d: rand(5, 8), s: rand(14, 30) }); spawn(fx, 'g', { s: rand(40, 80), col: '#ffd08a', d: rand(6, 9) }); },
  sad:   () => { spawn(fx, 'h', { col: pick(['#ffffff', '#cbbbe8', '#f4a6bb']), d: rand(8, 12), s: rand(12, 24) }); spawn(fx, 's', { col: '#ffffff', d: rand(7, 10), s: rand(8, 14) }); },
  kiss:  () => { spawn(fx, 'k', { s: rand(24, 42), dx: rand(-240, 240), d: rand(3.5, 5.5) }); spawn(fx, 'h', { col: '#d84a70', d: rand(4, 7), s: rand(14, 26) }); },
  smile: () => { spawn(fx, 'c', { anim: 'fall', col: pick(CONF), d: rand(3, 5), s: rand(8, 14), dx: rand(-80, 80) }); if (Math.random() < .35) spawn(fx, 'h', { anim: 'bounce', col: pick(['#e0607f', '#ff9db9']), s: rand(22, 34), d: .9 }); },
  sleep: () => { spawn(fx, 's', { anim: 'twinkle', top: rand(2, 75), col: '#f6e7b4', d: rand(2.5, 4), s: rand(8, 16) }); if (Math.random() < .3) spawn(fx, 'g', { s: rand(20, 40), col: '#cdb8ff', d: rand(9, 13) }); },
  promise: () => { spawn(fx, 's', { col: '#ffd27a', d: rand(5, 8), s: rand(10, 20) }); spawn(fx, 'h', { col: '#ff9db9', d: rand(6, 9), s: rand(12, 22) }); }
};
function fxStart(name) {
  fxStop();
  if (name === 'sleep') fx.insertAdjacentHTML('beforeend', '<div class="moon"></div>');
  if (name === 'promise') fx.insertAdjacentHTML('beforeend', '<i class="bigh"></i>');
  for (let i = 0; i < 24; i++) spawn(fx, 's', { x: rand(30, 70), col: '#ffe9b8', d: rand(2, 4), dx: rand(-140, 140), s: rand(8, 16) });
  fxTimer = setInterval(FX[name], name === 'hug' ? 200 : 260);
}
function fxStop() { clearInterval(fxTimer); fxTimer = null; fx.innerHTML = ''; }

/* ---------- NAVIGATION ---------- */
function show(id) {
  $('.screen.on')?.classList.remove('on');
  $('#' + id).classList.add('on');
  scrollTo(0, 0);
  mode = id === 'final' ? 'final' : 'soft';
  document.body.classList.toggle('night', id === 'final');
  if (id === 'done') {
    for (let i = 0; i < 40; i++) spawn(amb, 'c', { anim: 'fall', col: pick(CONF), d: rand(3, 6), s: rand(8, 14), dx: rand(-100, 100) });
    setTimeout(() => { lastBtn.hidden = false; lastBtn.classList.add('pop'); }, RM ? 0 : 1800);
  }
  if (id === 'final') {
    $('#baby').innerHTML = [...'BABYYYYYY!!'].map((c, i) => `<span aria-hidden="true" style="--i:${i}">${c}</span>`).join('');
  }
}

/* 01 → 02 */
$('#openBtn').addEventListener('click', async e => {
  e.currentTarget.disabled = true;
  $('#env').classList.add('open');
  await wait(2200);
  show('letter');
});
$('#discoverBtn').addEventListener('click', () => { render(); show('gifts'); });
lastBtn.addEventListener('click', () => show('final'));
lastBtn2.addEventListener('click', () => show('final'));

/* ---------- GIFTS ---------- */
const box = (g, big) => `<div class="box ${g.lid}" style="--c1:${g.c1};--c2:${g.c2};--rib:${g.rib};--gl:${g.gl}"><i class="glow"></i><i class="base"></i><i class="lid"><i class="bow"><b></b><b></b><u></u></i></i></div>`;

function render() {
  grid.innerHTML = GIFTS.map((g, i) => {
    const d = opened.has(i);
    return `<button class="gift${d ? ' done' : ''}" data-i="${i}" aria-label="${g.t}${d ? ' (opened)' : ''}">${box(g)}<span class="lab">${g.t}</span>${d ? '<em class="ck">♡ Opened</em>' : ''}</button>`;
  }).join('');
  prog.textContent = `${opened.size} / 6 Gifts Opened`;
  bar.style.setProperty('--w', (opened.size / 6 * 100) + '%');
  const all = opened.size === GIFTS.length;
  pickBtn.hidden = all; pickBtn.disabled = false;
  lastBtn2.hidden = !(all && completed);
}

grid.addEventListener('click', e => {
  const b = e.target.closest('.gift');
  if (!b || busy) return;
  busy = true; pickBtn.disabled = true;
  openGift(+b.dataset.i);
});

/* randomized rolling selection */
pickBtn.addEventListener('click', async () => {
  if (busy) return;
  const un = GIFTS.map((_, i) => i).filter(i => !opened.has(i));
  if (!un.length) return;
  busy = true; pickBtn.disabled = true;
  const target = un[Math.random() * un.length | 0];
  const n = un.length, tPos = un.indexOf(target), sPos = Math.random() * n | 0;
  const steps = n * 3 + ((tPos - sPos + n) % n);
  const els = [...grid.children];
  let pos = sPos, prev = null;
  for (let k = 0; k <= steps; k++) {
    const el = els[un[pos]];
    prev && prev.classList.remove('hl');
    el.classList.add('hl'); prev = el;
    await wait(70 + 430 * Math.pow(k / steps, 3));
    pos = (pos + 1) % n;
  }
  prev.classList.remove('hl'); prev.classList.add('win');
  await wait(1000);
  openGift(target);
});

/* gift opening sequence */
async function openGift(i) {
  const g = GIFTS[i], first = !opened.has(i);
  stage.style.setProperty('--sbg', g.sbg);
  sbox.innerHTML = box(g, true);
  sbox.classList.remove('jump'); void sbox.offsetWidth;
  card.className = 'card f' + (i + 1);
  const img = $('#cImg');
  img.onerror = () => { img.onerror = null; img.src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 430"><rect width="400" height="430" fill="#f9d9e2"/><path d="M200 300s-80-52-80-110a45 45 0 0 1 80-28 45 45 0 0 1 80 28c0 58-80 110-80 110z" fill="#c76b86"/></svg>'); };
  img.src = g.ph; img.alt = 'Us — ' + g.t.toLowerCase();
  $('#cTtl').textContent = g.t;
  $('#cMsg').textContent = g.msg;
  const finishing = first && opened.size === GIFTS.length - 1;
  closeBtn.textContent = 'CONTINUE ♡';
  stage.classList.remove('reveal'); stage.classList.add('on');
  sbox.classList.add('jump');
  const b = $('.box', sbox);
  await wait(1000);
  b.classList.add('open');
  fxStart(g.fx);
  if (first) opened.add(i);
  await wait(1600);
  stage.classList.add('reveal');
  closeBtn.focus({ preventScroll: true });
}

function closeGift() {
  if (!stage.classList.contains('reveal')) return;
  stage.classList.remove('on', 'reveal');
  fxStop();
  render();
  busy = false;
  if (opened.size === GIFTS.length && !completed) { completed = true; setTimeout(() => show('done'), 300); }
}
closeBtn.addEventListener('click', closeGift);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeGift(); });

render();
})();