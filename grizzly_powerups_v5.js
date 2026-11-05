/* Grizzly Rapids V5 — Bear Rescue & Wolf Pack extension.
   Add AFTER the existing game script; preserves the original vocabulary, game
   state machine, achievements, scoring keys, and artwork. */
(() => {
  'use strict';
  if (window.__grizzlyPowerupsV5Installed) return;
  if (typeof isRiver === 'undefined' || !isRiver || typeof startGame !== 'function' ||
      typeof removeTarget !== 'function' || !document.getElementById('arena')) return;
  window.__grizzlyPowerupsV5Installed = true;

  const VERSION = '5.0';
  const BEAR_MAX = 3, WOLVES_MAX = 2;
  let supplies = null;
  let effectTimers = new Set();
  let effects = new Set();

  const bearSVG = `<svg viewBox="0 0 150 92" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="71" cy="82" rx="59" ry="7" fill="#0a2634" opacity=".28"/>
    <path d="M18 59Q10 35 30 22Q50 5 100 16Q126 19 129 38L139 47 133 67 109 70 103 84 86 84 83 68 54 68 49 84 33 84 30 62Z" fill="#855438" stroke="#503524" stroke-width="3"/>
    <circle cx="112" cy="25" r="13" fill="#83513a" stroke="#493528" stroke-width="3"/>
    <circle cx="115" cy="25" r="6" fill="#b99169"/>
    <path d="M98 25Q126 12 135 38Q141 50 128 57L114 54" fill="#aa784d" stroke="#503524" stroke-width="3"/>
    <ellipse cx="136" cy="47" rx="13" ry="9" fill="#d0ae86"/><circle cx="143" cy="43" r="4" fill="#352a25"/>
    <circle cx="123" cy="34" r="3" fill="#1d2a26"/><path d="M128 55Q132 62 139 55" fill="none" stroke="#472d27" stroke-width="2"/>
    <path d="M36 71v12M52 70v13M90 70v13M106 68v15" stroke="#493528" stroke-width="7" stroke-linecap="round"/>
  </svg>`;
  const wolfSVG = `<svg viewBox="0 0 142 80" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <ellipse cx="72" cy="72" rx="55" ry="5" fill="#072837" opacity=".24"/>
    <path d="M16 37L3 18 7 49 17 56 18 67 29 67 34 53 80 56 82 69 94 69 100 54 116 49 134 40 122 30 120 9 108 22 98 11 93 27 68 28 42 23Z" fill="#98abb1" stroke="#465c67" stroke-width="3"/>
    <path d="M14 35Q55 31 85 40L116 36 130 40 116 48 94 49 50 43 26 51Z" fill="#627d88"/>
    <path d="M123 39L140 42 125 47Z" fill="#e0d7c8"/><circle cx="116" cy="31" r="3" fill="#f2dc88"/>
    <path d="M21 62L17 72M34 60L30 72M86 63L81 72M101 57L102 71" stroke="#425968" stroke-width="7" stroke-linecap="round"/>
  </svg>`;

  const style = document.createElement('style');
  style.id = 'grizzly-v5-style';
  style.textContent = `
    .grizzly-abilities{display:flex;gap:10px;flex-wrap:wrap;align-items:stretch;margin:9px 3px 10px}
    .grizzly-power{flex:1 1 210px;min-width:155px;text-align:left;display:flex;gap:10px;align-items:center;
      border:2px solid #759e84;border-radius:13px;background:linear-gradient(130deg,#274e4a,#173c52);
      padding:10px 12px;color:#eef7ec;cursor:pointer;transition:filter .15s,transform .15s}
    .grizzly-power:hover:not(:disabled){filter:brightness(1.18);transform:translateY(-1px)}
    .grizzly-power:disabled{opacity:.52;cursor:not-allowed}
    .grizzly-power-icon{font-size:30px;line-height:1}
    .grizzly-power strong,.grizzly-power small{display:block}
    .grizzly-power strong{font-size:14px}.grizzly-power small{font-size:12px;color:#d4e7dc}
    .grizzly-power-count{margin-left:auto;font-size:21px;font-weight:900;color:#ffe09e}
    .grizzly-power-tip{flex:1 1 100%;font-size:12px;color:#c6e3d9;margin:0 2px}
    .grizzly-power-actor{position:absolute;z-index:11;width:135px;height:94px;left:0;top:0;pointer-events:none;
      filter:drop-shadow(0 8px 4px #082b38a8);will-change:transform}
    .grizzly-power-actor svg{width:100%;height:100%}
    .grizzly-power-actor.wolf{width:115px;height:76px;z-index:12}
    .grizzly-splash{position:absolute;z-index:13;pointer-events:none;transform:translate(-50%,-50%);font-size:43px;
      filter:drop-shadow(0 1px 3px #073146);animation:grizzly-splash .6s ease-out forwards}
    .grizzly-splash span{display:block;white-space:nowrap;color:#fff8c6;text-shadow:0 2px 6px #124a4b;
      font-weight:900;font-size:13px;position:absolute;top:-19px;left:50%;transform:translateX(-50%)}
    .grizzly-pack-banner{position:absolute;left:50%;top:37%;transform:translate(-50%,-50%);
      z-index:12;background:#173b42d9;border:2px solid #bdebd7;border-radius:12px;padding:7px 15px;
      font-size:21px;font-weight:1000;letter-spacing:.05em;color:#ffe4a6;pointer-events:none;
      animation:grizzly-banner .78s ease-out both;white-space:nowrap}
    @keyframes grizzly-splash{0%{opacity:0;scale:.5}22%{opacity:1;scale:1.1}100%{opacity:0;scale:1.7}}
    @keyframes grizzly-banner{0%{opacity:0;scale:.65}25%{opacity:1;scale:1.06}85%{opacity:1}100%{opacity:0;scale:1.15}}
    .river .bank .arcade-ship{height:85px;width:86px;flex:none;display:block;animation:none;filter:drop-shadow(0 4px 5px #183a23aa)}
    .river .bank .arcade-ship svg{height:85px;width:86px}
    .river .customize-grid label:nth-child(-n+2){display:none}
    .river .customize-grid{grid-template-columns:repeat(2,minmax(145px,1fr))}
    @media(max-width:550px){.grizzly-power{flex-basis:150px;padding:8px}.grizzly-power-icon{font-size:23px}}
    @media(prefers-reduced-motion:reduce){.grizzly-splash,.grizzly-pack-banner{animation:none;opacity:.9}}
  `;
  document.head.appendChild(style);

  const buttonRow = document.createElement('div');
  buttonRow.className = 'grizzly-abilities';
  buttonRow.setAttribute('aria-label', 'River power-ups');
  buttonRow.innerHTML = `
    <button class="grizzly-power" id="grizzlyBearPower" type="button" title="Tab — bear catches one selected fish" disabled>
      <span class="grizzly-power-icon" aria-hidden="true">🐻</span><span><strong>Bear Rescue · Tab</strong><small>Catch one fish</small></span><span class="grizzly-power-count" id="grizzlyBearCount">0</span>
    </button>
    <button class="grizzly-power" id="grizzlyWolvesPower" type="button" title="Enter — a pack of wolves catches all visible fish" disabled>
      <span class="grizzly-power-icon" aria-hidden="true">🐺</span><span><strong>Wolf Pack · Enter</strong><small>Clear all visible fish</small></span><span class="grizzly-power-count" id="grizzlyWolvesCount">0</span>
    </button>
    <p class="grizzly-power-tip" id="grizzlyPowerHelp">Earn one Bear Rescue every 5 correctly typed words and one Wolf Pack every 12. Power-up catches count toward the river goal but not typing WPM or accuracy.</p>`;
  const zone = document.querySelector('.type-zone');
  if (zone) zone.insertAdjacentElement('beforebegin', buttonRow);

  const $p = id => document.getElementById(id);
  function freshRun() {
    if (!state || !running || state.ended) { supplies = null; updateButtons(); return; }
    const lvl = state.level;
    supplies = { state, bears: lvl <= 2 ? 1 : 2, wolves: lvl <= 2 ? 0 : 1,
      typed: 0, chars: state.correctChars, busy: false };
    updateButtons();
  }
  function current() { return supplies && supplies.state === state && state && running && !paused && !state.ended; }
  function updateButtons() {
    const enabled = !!current() && state.targets.length > 0 && !supplies.busy;
    $p('grizzlyBearCount').textContent = String(supplies?.bears ?? 0);
    $p('grizzlyWolvesCount').textContent = String(supplies?.wolves ?? 0);
    $p('grizzlyBearPower').disabled = !enabled || supplies.bears < 1;
    $p('grizzlyWolvesPower').disabled = !enabled || supplies.wolves < 1;
    $p('grizzlyWolvesPower').title = supplies && state && state.level <= 2 ?
      'Wolf Pack unlocks at River 3' : 'Enter — catch all visible fish';
  }
  function later(fn, ms) {
    const id = setTimeout(() => { effectTimers.delete(id); fn(); }, ms);
    effectTimers.add(id); return id;
  }
  function addFx(node, parent = $p('arena')) {
    if (!parent) return null;
    parent.appendChild(node); effects.add(node);
    return node;
  }
  function expireFx(node, ms) { later(() => {node.remove();effects.delete(node);}, ms); }
  function stopEffects() {
    for (const id of effectTimers) clearTimeout(id);
    effectTimers.clear();
    for (const el of effects) el.remove();
    effects.clear();
    if (supplies) supplies.busy = false;
  }
  function audioCue(which) {
    if (typeof cosmetics !== 'undefined' && cosmetics.effects !== 'on') return;
    if (typeof tone !== 'function') return;
    try {
      if (which === 'bear') {
        tone(165,.20,'sawtooth',.055);tone(122,.26,'triangle',.048,.07);
        tone(385,.09,'sine',.034,.31);tone(230,.15,'triangle',.028,.36);
      } else {
        [240,205,175,146].forEach((f,i)=>tone(f,.17,'sawtooth',.031,i*.10));
        tone(430,.10,'triangle',.038,.37);tone(280,.21,'triangle',.038,.44);
      }
    } catch (_e) { /* Audio is optional. */ }
  }
  function splash(t, text) {
    const node = document.createElement('div');
    node.className = 'grizzly-splash';
    node.style.left = `${t.x*100}%`;
    node.style.top = `${t.y+32}px`;
    node.innerHTML = `💦<span>${text}</span>`;
    addFx(node); expireFx(node, 720);
  }
  function actor(svg, kind, frames, duration) {
    const node = document.createElement('div');
    node.className = 'grizzly-power-actor' + (kind === 'wolf' ? ' wolf' : '');
    node.innerHTML = svg;
    addFx(node);
    if (node.animate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const motion = node.animate(frames, {duration, easing:'cubic-bezier(.24,.72,.22,1)',fill:'forwards'});
      motion.onfinish = () => { node.remove(); effects.delete(node); };
      expireFx(node, duration + 150);
    } else {
      node.style.transform = frames[frames.length-1].transform;
      expireFx(node, 620);
    }
    return node;
  }
  function catchTargets(targets, kind) {
    if (!current()) return 0;
    let taken = 0;
    for (const t of targets) {
      if (!state.targets.includes(t)) continue;
      removeTarget(t);
      ++taken;
      state.caught += 1; // River objective; not credited as typed words/characters.
      state.score += kind === 'bear' ? 40 : 22;
      splash(t, kind === 'bear' ? 'BEAR CATCH!' : 'WOLF CATCH!');
    }
    if (taken > 0) {
      refreshHud();
      if (state.caught >= state.goal) endGame(true);
    }
    return taken;
  }
  function rescueBear() {
    if (!current() || supplies.busy || supplies.bears < 1 || !state.targets.length) return;
    const target = activeTarget && state.targets.includes(activeTarget) ? activeTarget :
      [...state.targets].sort((a,b) => b.y - a.y)[0];
    if (!target) return;
    supplies.bears--; supplies.busy = true; updateButtons();$p('typeInput').focus();
    const run = supplies, arena = $p('arena'), x = target.x*arena.clientWidth - 73, y = target.y - 23;
    const previousSpeed = target.speed;
    target.speed = 0; // The intended fish stays in place for the bear animation.
    actor(bearSVG,'bear',[
      {transform:`translate(${-155}px,${y+14}px) scale(.86)`,opacity:.9},
      {transform:`translate(${Math.max(-20,x-40)}px,${y-8}px) scale(1)`,opacity:1,offset:.72},
      {transform:`translate(${x}px,${y}px) scale(1.07)`,opacity:1}
    ], 630);
    audioCue('bear');
    status('Bear Rescue! A grizzly is charging into the river.');
    later(() => {
      if (state === run.state && running && !state.ended && !paused) {
        catchTargets([target], 'bear');
        if (state === run.state && !state.ended) status('Bear Rescue caught one fish! Keep typing to earn another.');
      }
      if (state === run.state && state.targets.includes(target)) target.speed = previousSpeed;
      if (supplies === run) { supplies.busy = false; updateButtons(); }
    }, 560);
  }
  function wolfPack() {
    if (!current() || supplies.busy || supplies.wolves < 1 || !state.targets.length) return;
    const victims = [...state.targets];
    supplies.wolves--; supplies.busy = true; updateButtons();$p('typeInput').focus();
    const run = supplies, arena = $p('arena'), width = arena.clientWidth, height = arena.clientHeight;
    const previousSpeeds = new Map(victims.map(t => [t,t.speed]));
    for (const t of victims) t.speed = 0;
    const banner = document.createElement('div');
    banner.className = 'grizzly-pack-banner'; banner.textContent = 'WOLF PACK!';
    addFx(banner); expireFx(banner, 900);
    for (let i = 0; i < 6; i++) {
      const fromLeft = i % 2 === 0;
      const y = Math.max(25,Math.min(height-150,90+(i*89)%(Math.max(180,height-155))));
      const startX = fromLeft ? -135 : width+135;
      const endX = fromLeft ? width+140 : -140;
      actor(wolfSVG, 'wolf', [
        {transform:`translate(${startX}px,${y}px) scaleX(${fromLeft?1:-1}) scale(.9)`, opacity:.8},
        {transform:`translate(${(startX+endX)/2}px,${y-10}px) scaleX(${fromLeft?1:-1}) scale(1.08)`,opacity:1},
        {transform:`translate(${endX}px,${y}px) scaleX(${fromLeft?1:-1}) scale(.9)`,opacity:.88}
      ],690+i*50);
    }
    audioCue('wolves');
    status(`Wolf Pack! Wolves are clearing ${victims.length} fish from the river!`);
    later(() => {
      if (state === run.state && running && !state.ended && !paused) {
        const count = catchTargets(victims, 'wolves');
        if (state === run.state && !state.ended) status(`Wolf Pack caught ${count} fish! Keep typing to earn another.`);
      }
      if (state === run.state) for (const [t,speed] of previousSpeeds) if (state.targets.includes(t)) t.speed=speed;
      if (supplies === run) { supplies.busy = false; updateButtons(); }
    }, 590);
  }

  // Attach once, after the existing input handler. The existing game's accepted-word
  // counter rises only for actual typing; assists never increment correctChars.
  $p('typeInput').addEventListener('input', () => {
    if (!supplies || supplies.state !== state || !state) return;
    if (state.correctChars > supplies.chars) {
      supplies.typed++;
      supplies.chars = state.correctChars;
      if (supplies.typed % 5 === 0) supplies.bears = Math.min(BEAR_MAX, supplies.bears+1);
      if (state.level >= 3 && supplies.typed % 12 === 0)
        supplies.wolves = Math.min(WOLVES_MAX,supplies.wolves+1);
      if (supplies.typed % 5 === 0 || supplies.typed % 12 === 0)
        status(`Power-up earned! ${supplies.bears} bear rescues and ${supplies.wolves} wolf packs available.`);
    }
    updateButtons();
  });
  document.addEventListener('keydown', e => {
    if (!current() || e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) return;
    // Always prevent browser Tab focus jumps and Enter form submission during a run.
    if (e.key === 'Tab') {e.preventDefault();e.stopImmediatePropagation();rescueBear();}
    else if (e.key === 'Enter') {e.preventDefault();e.stopImmediatePropagation();wolfPack();}
  }, true);
  $p('grizzlyBearPower').addEventListener('click', rescueBear);
  $p('grizzlyWolvesPower').addEventListener('click', wolfPack);
  $p('pause')?.addEventListener('click', updateButtons);

  // Wrap rather than replace existing gameplay; original functions retain all
  // scoring, saved progress, vocabulary rotation, and level logic.
  const oldStartGame = startGame;
  startGame = function(...args) {stopEffects();const r=oldStartGame(...args);freshRun();return r;};
  const oldClearPlayfield = clearPlayfield;
  clearPlayfield = function(...args) {stopEffects();supplies=null;const r=oldClearPlayfield(...args);updateButtons();return r;};
  const oldEndGame = endGame;
  endGame = function(...args) {const r=oldEndGame(...args);stopEffects();updateButtons();return r;};
  const oldTogglePause = togglePause;
  togglePause = function(...args) {const r=oldTogglePause(...args);updateButtons();return r;};
  const oldSpawn = spawn;
  spawn = function(...args) {const r=oldSpawn(...args);updateButtons();return r;};

  // Fix leftover Space Type Defender labels without changing its save data.
  const mark = document.querySelector('header .mark');
  if (mark) mark.textContent = '🐻';
  const custom = document.querySelector('.customize');
  if (custom) {
    const title = custom.querySelector('.eyebrow,h2,h3');
    if (title) title.textContent = 'River sound settings';
    const helper = custom.querySelector('small');
    if (helper) helper.textContent = 'Choose your music and sound effects. All river animations work with sound off.';
  }
  const labelStats = document.querySelectorAll('.stats-rail .stat > span');
  if (labelStats[2]) labelStats[2].textContent='Fish caught';
  if (labelStats[3]) labelStats[3].textContent='Missed fish';
  const statTotal = $p('totalWords')?.parentElement;
  if (statTotal) {for(const node of statTotal.childNodes) if(node.nodeType===Node.TEXT_NODE && /defended/.test(node.textContent))node.textContent=' total fish caught';}
  const startOverlay = $p('startScreen')?.querySelector('p');
  if(startOverlay)startOverlay.textContent='Choose your grade and press Start River. Complete each of the six rivers to unlock the next.';
  const sideTitle = document.querySelector('.sidebar h3');
  if (sideTitle) sideTitle.textContent = 'Your river bears';
  const helpDialog = $p('helpDialog');
  if (helpDialog) {
    for (const p of helpDialog.querySelectorAll('p')) {
      if (/no bears or category-switching controls/i.test(p.textContent)) {
        p.textContent = 'Each river unlocks more bear categories. Choose bears with Shift+1–4, or simply type any visible fish word. Tab calls a bear to catch one selected fish; Enter calls the wolves to catch every visible fish. Wolf Packs unlock in River 3. Bear Rescues replenish every 5 correctly typed words, and Wolf Packs every 12. Assists count toward the river goal but do not increase your typing speed or accuracy.';
      }
    }
  }
  // Replace the accidental spaceship in the riverbank with the existing bear artwork.
  const bankArt=document.querySelector('.river .bank .arcade-ship');
  function refreshRiverbankBear(){
    if(!bankArt || typeof bearArtwork !== 'function') return;
    const i=Math.max(0,bearNames.findIndex(b=>b.id===(state?.cat||'daily')));
    bankArt.innerHTML=bearArtwork(i);
    bankArt.setAttribute('aria-label', 'Grizzly bear');
  }
  const oldShowBears=showBears;
  showBears=function(...args){const r=oldShowBears(...args);refreshRiverbankBear();return r;};
  refreshRiverbankBear();
  const oldLoadLevels=loadLevels;
  loadLevels=function(...args){const r=oldLoadLevels(...args);const description=$p('entryDescription');if(description)description.textContent=description.textContent.replaceAll('missions','rivers').replaceAll('mission','river');return r;};
  const originalEnd= endGame;
  endGame=function(...args){const r=originalEnd(...args);if(state?.ended && state.mode==='arcade' && !args[0]){const message=$p('endDescription');if(message)message.textContent='Try this river again to unlock the next stream.';}return r;};
  const entryDescription = $p('entryDescription');
  if(entryDescription)entryDescription.textContent=entryDescription.textContent.replaceAll('missions','rivers').replaceAll('mission','river');
  const versionNote = document.createElement('span');
  versionNote.className = 'hint';
  versionNote.textContent = ` · River power-ups V${VERSION}`;
  document.querySelector('header .eyebrow')?.appendChild(versionNote);
  updateButtons();
})();
