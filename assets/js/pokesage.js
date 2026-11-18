/* Pokesage 3.0 — Modular Client Engine (Zero-Backend) */
(function () {
  'use strict';

  const POKEDEX = {
    pikachu:    { num: 25,  name: 'Pikachu',    type: 'Elétrico',       role: 'Mensageiro',  charm: 98, quote: 'Usa Cute Charm com 100% de precisão quando quer chamar alguém especial para sair.', cry: [659, 784, 1046] },
    clefairy:   { num: 35,  name: 'Clefairy',   type: 'Fada',           role: 'Guia',        charm: 94, quote: 'Escolhe cenários sob a luz da lua onde a conversa rende horas sem perceber.',       cry: [587, 740, 880] },
    vaporeon:   { num: 134, name: 'Vaporeon',   type: 'Água',           role: 'Região',      charm: 91, quote: 'Especialista em encontros à beira-mar com brisa leve e pôr do sol tranquilo.',      cry: [440, 554, 659] },
    flareon:    { num: 136, name: 'Flareon',    type: 'Fogo',           role: 'Região',      charm: 90, quote: 'Garante clima acolhedor e risadas quentes desde o primeiro minuto.',                cry: [494, 622, 740] },
    jolteon:    { num: 135, name: 'Jolteon',    type: 'Elétrico',       role: 'Região',      charm: 88, quote: 'Adora mirantes altos, vento no rosto e energia lá em cima.',                        cry: [740, 932, 1174] },
    leafeon:    { num: 470, name: 'Leafeon',    type: 'Planta',         role: 'Região',      charm: 92, quote: 'Transforma qualquer caminhada ao ar livre no melhor passeio da semana.',            cry: [523, 659, 784] },
    magikarp:   { num: 129, name: 'Magikarp',   type: 'Água',           role: 'Cardápio',    charm: 82, quote: 'Splash estratégico direto na melhor barca de sushi da região.',                     cry: [330, 392, 330] },
    slowpoke:   { num: 79,  name: 'Slowpoke',   type: 'Água / Psíquico', role: 'Cardápio',   charm: 89, quote: 'Acredita que pizza artesanal deve ser aproveitada devagar e sem pressa.',           cry: [294, 330, 370] },
    jigglypuff: { num: 39,  name: 'Jigglypuff', type: 'Normal / Fada',  role: 'Cardápio',    charm: 96, quote: 'Sabe exatamente onde fica o café mais aconchegante para conversar.',                cry: [523, 659, 587, 784] },
    snover:     { num: 459, name: 'Snover',     type: 'Planta / Gelo',  role: 'Cardápio',    charm: 87, quote: 'Traz gelato artesanal refrescante para fechar o passeio com chave de ouro.',        cry: [466, 587, 698] },
    raichu:     { num: 26,  name: 'Raichu',     type: 'Elétrico',       role: 'Data',        charm: 93, quote: 'Usa Ataque Rápido: quando a vontade bate, o encontro já acontece hoje.',            cry: [698, 880, 1174] },
    eevee:      { num: 133, name: 'Eevee',      type: 'Normal',         role: 'Data',        charm: 99, quote: 'Cheio de possibilidades — perfeito para um fim de semana inesquecível.',            cry: [587, 698, 880] },
    sylveon:    { num: 700, name: 'Sylveon',    type: 'Fada',           role: 'Data',        charm: 100, quote: 'Laços de fita conectados: planeja cada detalhe com carinho.',                      cry: [659, 831, 988, 1318] },
    gyarados:   { num: 130, name: 'Gyarados',   type: 'Água / Voador',  role: 'Data',        charm: 86, quote: 'Prova de que boas histórias evoluem rápido quando a companhia é certa.',            cry: [220, 277, 330, 440] },
    togekiss:   { num: 468, name: 'Togekiss',   type: 'Fada / Voador',  role: 'Confirmação', charm: 100, quote: 'Só aparece onde existe sintonia real — selo oficial de encontro Nv. 100.',          cry: [587, 784, 988, 1174] }
  };

  const MESSENGERS = ['pikachu', 'eevee', 'jigglypuff', 'togekiss', 'sylveon', 'clefairy'];
  const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function getToken(name, fallback) {
    const val = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return val || fallback;
  }

  function formatDex(num) {
    return '#' + String(num).padStart(3, '0');
  }

  /* =========================================================================
     1. STATE & URL-SAFE ZERO-BACKEND ENCODER (?m=...)
     ========================================================================= */
  const state = {
    screen: 's0',
    shiny: false,
    sound: true,
    noCount: 0,
    selectedDexKey: 'pikachu',
    studioMessenger: 'pikachu',
    studioShiny: false,
    custom: {
      from: '',
      to: '',
      headline: 'Ei, você aí!',
      message: 'Pikachu usou Cute Charm em você. Quer ser meu par nessa jornada?',
      messenger: 'pikachu',
      whatsapp: ''
    },
    choices: {
      local: 'Cidade Cerúlea',
      localPoke: 'vaporeon',
      comida: 'Sushi de Magikarp',
      comidaPoke: 'magikarp',
      data: 'Fim de semana',
      dataPoke: 'eevee',
      nota: ''
    }
  };

  const UrlCodec = {
    encode(payload) {
      const json = JSON.stringify(payload);
      const bytes = new TextEncoder().encode(json);
      let bin = '';
      bytes.forEach(b => { bin += String.fromCharCode(b); });
      return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    },
    decode(str) {
      if (!str || str.length > 1800) return null;
      const b64 = str.replace(/-/g, '+').replace(/_/g, '/');
      const pad = b64 + '==='.slice((b64.length + 3) % 4);
      const bin = atob(pad);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      const json = new TextDecoder().decode(bytes);
      return JSON.parse(json);
    }
  };

  function spriteSrc(key, forceShiny) {
    const isShiny = typeof forceShiny === 'boolean' ? forceShiny : state.shiny;
    const safeKey = POKEDEX[key] ? key : 'pikachu';
    return isShiny ? `./assets/sprites/shiny/${safeKey}.png` : `./assets/sprites/${safeKey}.png`;
  }

  /* =========================================================================
     2. WEB AUDIO 8-BIT SYNTHESIZER
     ========================================================================= */
  const AudioEngine = {
    ctx: null,
    getCtx() {
      if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    },
    playSequence(freqs, stepMs = 70, type = 'triangle', vol = 0.055) {
      if (!state.sound) return;
      try {
        const ctx = this.getCtx();
        if (!ctx) return;
        const base = ctx.currentTime;
        freqs.forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const t0 = base + idx * (stepMs / 1000);
          const t1 = t0 + (stepMs / 1000) * 1.15;
          osc.type = type;
          osc.frequency.setValueAtTime(f, t0);
          gain.gain.setValueAtTime(0.001, t0);
          gain.gain.linearRampToValueAtTime(vol, t0 + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.0008, t1);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t0);
          osc.stop(t1 + 0.02);
        });
      } catch (_) {}
    },
    select() { this.playSequence([440, 659.25], 55, 'triangle', 0.055); },
    back() { this.playSequence([523.25, 392], 50, 'triangle', 0.045); },
    evade() { this.playSequence([320, 215], 55, 'sawtooth', 0.045); },
    wobble() { this.playSequence([196, 246.94], 75, 'sine', 0.065); },
    shinySparkle() { this.playSequence([880, 1174.66, 1396.91, 1760, 2093], 55, 'sine', 0.055); },
    captureFanfare() {
      this.playSequence([523.25, 659.25, 783.99, 1046.5], 95, 'triangle', 0.065);
      this.playSequence([261.63, 329.63, 392.0, 523.25], 95, 'sine', 0.045);
    },
    cry(key) {
      const p = POKEDEX[key] || POKEDEX.pikachu;
      this.playSequence(p.cry, 68, 'triangle', 0.06);
    },
    typeTick() {
      this.playSequence([720], 18, 'sine', 0.014);
    }
  };

  /* =========================================================================
     3. AMBIENT PARTICLE & CONFETTI CANVAS
     ========================================================================= */
  const AmbientEngine = {
    canvas: null,
    ctx: null,
    w: 0,
    h: 0,
    ambient: [],
    bursts: [],
    rafId: null,
    init() {
      this.canvas = document.getElementById('ambientCanvas');
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      this.resize();
      window.addEventListener('resize', () => this.resize());
      if (REDUCED_MOTION) return;

      for (let i = 0; i < 22; i++) {
        this.ambient.push({
          x: Math.random() * this.w,
          y: Math.random() * this.h,
          r: 2 + Math.random() * 3.2,
          vy: -(0.18 + Math.random() * 0.35),
          vx: (Math.random() - 0.5) * 0.25,
          alpha: 0.14 + Math.random() * 0.26,
          kind: i % 4 === 0 ? 'diamond' : 'dot'
        });
      }
      this.loop();
    },
    resize() {
      if (!this.canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.w = window.innerWidth;
      this.h = window.innerHeight;
      this.canvas.width = Math.floor(this.w * dpr);
      this.canvas.height = Math.floor(this.h * dpr);
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    },
    stepAccentColor() {
      if (state.shiny) return getToken('--color-shiny-accent', '#ca8a04');
      if (state.screen === 's1') return getToken('--color-step-1-accent', '#15966d');
      if (state.screen === 's2') return getToken('--color-step-2-accent', '#c27810');
      if (state.screen === 's3') return getToken('--color-step-3-accent', '#1967b2');
      return getToken('--color-primary', '#d44070');
    },
    burst(cx, cy, mode = 'confetti') {
      if (REDUCED_MOTION || !this.ctx) return;
      const palette = mode === 'shiny'
        ? [getToken('--color-shiny-accent', '#facc15'), getToken('--color-shiny-border', '#fde68a'), getToken('--color-primary', '#d44070')]
        : [
            getToken('--color-primary', '#d44070'),
            getToken('--color-step-1-accent', '#15966d'),
            getToken('--color-step-2-accent', '#c27810'),
            getToken('--color-step-3-accent', '#1967b2'),
            getToken('--color-shiny-accent', '#facc15')
          ];
      const count = mode === 'shiny' ? 24 : 52;
      for (let i = 0; i < count; i++) {
        const ang = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
        const speed = (mode === 'shiny' ? 2.4 : 3.2) + Math.random() * 4.5;
        this.bursts.push({
          x: cx,
          y: cy,
          vx: Math.cos(ang) * speed,
          vy: Math.sin(ang) * speed - (mode === 'confetti' ? 2.6 : 0.4),
          size: 3 + Math.random() * 4,
          color: palette[i % palette.length],
          life: 1,
          decay: 0.015 + Math.random() * 0.015,
          rot: Math.random() * Math.PI,
          vrot: (Math.random() - 0.5) * 0.2,
          shape: mode === 'shiny' ? 'star' : (i % 2 === 0 ? 'rect' : 'dot')
        });
      }
    },
    drawStar(ctx, x, y, r) {
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 2;
        ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
        ctx.lineTo(x + Math.cos(a + Math.PI / 4) * (r * 0.35), y + Math.sin(a + Math.PI / 4) * (r * 0.35));
      }
      ctx.closePath();
      ctx.fill();
    },
    loop() {
      this.rafId = requestAnimationFrame(() => this.loop());
      if (document.hidden || !this.ctx) return;
      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.w, this.h);

      const accent = this.stepAccentColor();
      for (const p of this.ambient) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -10) { p.y = this.h + 10; p.x = Math.random() * this.w; }
        if (p.x < -10) p.x = this.w + 10;
        if (p.x > this.w + 10) p.x = -10;
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = accent;
        if (p.kind === 'diamond') {
          this.drawStar(ctx, p.x, p.y, p.r * 1.45);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      for (let i = this.bursts.length - 1; i >= 0; i--) {
        const b = this.bursts[i];
        b.x += b.vx;
        b.y += b.vy;
        b.vy += 0.09;
        b.vx *= 0.985;
        b.rot += b.vrot;
        b.life -= b.decay;
        if (b.life <= 0) {
          this.bursts.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.globalAlpha = Math.max(0, b.life);
        ctx.fillStyle = b.color;
        ctx.translate(b.x, b.y);
        ctx.rotate(b.rot);
        if (b.shape === 'star') {
          this.drawStar(ctx, 0, 0, b.size * 1.4);
        } else if (b.shape === 'rect') {
          ctx.fillRect(-b.size, -b.size * 0.55, b.size * 2, b.size * 1.1);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, b.size * 0.75, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    }
  };

  /* =========================================================================
     4. UI HELPERS: LED PULSE, TYPEWRITER, SHINY, TOAST
     ========================================================================= */
  let ledTimer = null;
  function pulseLed() {
    const lens = document.getElementById('ledLens');
    if (!lens) return;
    lens.classList.add('is-active');
    clearTimeout(ledTimer);
    ledTimer = setTimeout(() => lens.classList.remove('is-active'), 260);
  }

  let toastTimer = null;
  function showToast(message) {
    const toast = document.getElementById('toast');
    const msgEl = document.getElementById('toastMsg');
    if (!toast || !msgEl) return;
    msgEl.textContent = message;
    toast.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.add('hidden'), 2700);
  }

  let typeTimer = null;
  function runTypewriter(text) {
    const el = document.getElementById('dialogueText');
    if (!el) return;
    clearInterval(typeTimer);
    if (REDUCED_MOTION) {
      el.textContent = text;
      return;
    }
    el.textContent = '';
    const caret = document.createElement('span');
    caret.className = 'dialogue-caret';
    caret.setAttribute('aria-hidden', 'true');
    let idx = 0;
    typeTimer = setInterval(() => {
      idx++;
      el.textContent = text.slice(0, idx);
      el.appendChild(caret);
      if (idx % 5 === 0) pulseLed();
      if (idx >= text.length) {
        clearInterval(typeTimer);
      }
    }, 16);
  }

  function refreshAllSprites() {
    document.querySelectorAll('img[data-poke]').forEach(img => {
      const key = img.getAttribute('data-poke');
      if (key && POKEDEX[key]) {
        img.src = spriteSrc(key);
        img.alt = POKEDEX[key].name + (state.shiny ? ' (Shiny)' : '');
      }
    });
    document.querySelectorAll('.shiny-star-tag').forEach(el => {
      el.classList.toggle('hidden', !state.shiny);
    });
    document.documentElement.classList.toggle('is-shiny', state.shiny);
    const btn = document.getElementById('btnShiny');
    if (btn) btn.setAttribute('aria-pressed', String(state.shiny));
    renderDexModal();
  }

  function toggleShiny(forceVal) {
    state.shiny = typeof forceVal === 'boolean' ? forceVal : !state.shiny;
    refreshAllSprites();
    pulseLed();
    if (state.shiny) {
      AudioEngine.shinySparkle();
      const stage = document.querySelector('.screen:not(.hidden) .sprite-wrap');
      if (stage) {
        const r = stage.getBoundingClientRect();
        AmbientEngine.burst(r.left + r.width / 2, r.top + r.height / 2, 'shiny');
      }
      showToast('Modo ★ Shiny ativado! Todos os sprites brilharam!');
    } else {
      AudioEngine.back();
      showToast('Sprites clássicos restaurados.');
    }
  }

  /* =========================================================================
     5. NAVIGATION, EVASIVE "NÃO", CAPTURE SEQUENCE & TRAINER PASS
     ========================================================================= */
  const NO_MSGS = [
    'Esse botão está com defeito...',
    'Eita, escapou pela grama alta!',
    'Pikachu bloqueou a saída!',
    'Pokédex informa: opção inválida.',
    'Botão Não fugiu da batalha!',
    'É destino, aceita logo vai!',
    'Ok, só restou o Sim!'
  ];

  function runaway() {
    const btn = document.getElementById('btnNo');
    const msg = document.getElementById('noMsg');
    const arena = document.getElementById('evadeArena');
    if (!btn || !msg) return;

    state.noCount++;
    AudioEngine.evade();
    pulseLed();
    msg.textContent = NO_MSGS[Math.min(state.noCount - 1, NO_MSGS.length - 1)];

    const maxX = arena ? Math.max(24, Math.min(76, (arena.clientWidth - btn.offsetWidth) / 2.4)) : 48;
    const rx = (state.noCount % 2 === 0 ? 1 : -1) * Math.floor(20 + Math.random() * maxX);
    const ry = (Math.random() > 0.5 ? 1 : -1) * Math.floor(4 + Math.random() * 14);

    btn.style.setProperty('--tx', rx + 'px');
    btn.style.setProperty('--ty', ry + 'px');
    btn.style.transform = `translate(${rx}px, ${ry}px)`;
    btn.style.animation = 'shake 0.3s';
    setTimeout(() => { btn.style.animation = ''; }, 320);

    if (state.noCount >= 3) {
      btn.style.opacity = String(Math.max(0.12, 1 - (state.noCount - 2) * 0.22));
    }
    if (state.noCount >= 7) {
      btn.style.opacity = '0';
      btn.style.pointerEvents = 'none';
      btn.setAttribute('aria-hidden', 'true');
      btn.tabIndex = -1;
    }
  }

  function goTo(id, silent) {
    const prev = state.screen;
    state.screen = id;
    if (!silent) {
      if ((prev === 's1' && id === 's0') || (prev === 's2' && id === 's1') || (prev === 's3' && id === 's2') || (prev === 's4' && id === 's3')) {
        AudioEngine.back();
      } else {
        AudioEngine.select();
      }
    }
    pulseLed();
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    const target = document.getElementById(id);
    if (target) target.classList.remove('hidden');
    if (id === 's4') syncTrainerPass();
  }

  function runCaptureSequence() {
    if (REDUCED_MOTION) {
      goTo('s4', true);
      AudioEngine.captureFanfare();
      return;
    }
    goTo('sCapture', true);
    const ball = document.getElementById('captureBall');
    const status = document.getElementById('captureStatus');
    const stars = document.getElementById('captureStars');
    if (!ball || !status || !stars) { goTo('s4', true); return; }

    ball.classList.remove('is-caught');
    ball.classList.add('is-wobbling');
    stars.classList.remove('is-visible');
    status.textContent = 'Jogando Love Ball...';
    AudioEngine.wobble();

    setTimeout(() => {
      status.textContent = 'Balançou... 1... 2...';
      AudioEngine.wobble();
      pulseLed();
    }, 520);

    setTimeout(() => {
      status.textContent = 'Quase lá... 3!';
      AudioEngine.wobble();
      pulseLed();
    }, 1050);

    setTimeout(() => {
      ball.classList.remove('is-wobbling');
      ball.classList.add('is-caught');
      stars.classList.add('is-visible');
      status.textContent = 'Gotcha! Date confirmado!';
      AudioEngine.captureFanfare();
      const rect = ball.getBoundingClientRect();
      AmbientEngine.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 'confetti');
    }, 1550);

    setTimeout(() => {
      goTo('s4', true);
    }, 2400);
  }

  function pick(key, val, pokeKey, next, btnEl) {
    state.choices[key] = val;
    state.choices[key + 'Poke'] = pokeKey;
    if (btnEl && btnEl.parentElement) {
      btnEl.parentElement.querySelectorAll('.opt').forEach(b => b.setAttribute('aria-pressed', 'false'));
      btnEl.setAttribute('aria-pressed', 'true');
    }
    if (next === 's4') {
      runCaptureSequence();
    } else {
      goTo(next);
    }
  }

  function syncTrainerPass() {
    const c = state.choices;
    document.getElementById('r-local').textContent = c.local;
    document.getElementById('r-comida').textContent = c.comida;
    document.getElementById('r-data').textContent = c.data;
    document.getElementById('r-nota').textContent = c.nota || 'Combinado!';

    const titleEl = document.getElementById('s4Title');
    if (titleEl) {
      titleEl.textContent = state.custom.to ? `Perfeito, ${state.custom.to}!` : 'Perfeito, treinador(a)!';
    }

    const teamMap = [
      { imgId: 'teamLocalImg', nameId: 'teamLocalName', key: c.localPoke },
      { imgId: 'teamComidaImg', nameId: 'teamComidaName', key: c.comidaPoke },
      { imgId: 'teamDataImg', nameId: 'teamDataName', key: c.dataPoke }
    ];
    teamMap.forEach(item => {
      const img = document.getElementById(item.imgId);
      const lbl = document.getElementById(item.nameId);
      const data = POKEDEX[item.key] || POKEDEX.pikachu;
      if (img) {
        img.setAttribute('data-poke', item.key);
        img.src = spriteSrc(item.key);
        img.alt = data.name;
      }
      if (lbl) lbl.textContent = data.name;
    });
  }

  function updateNote(val) {
    state.choices.nota = val.trim();
    const el = document.getElementById('r-nota');
    if (el) el.textContent = state.choices.nota || 'Combinado!';
  }

  function buildSummaryText() {
    const header = state.custom.to
      ? `Passaporte Pokesage — ${state.custom.to}${state.custom.from ? ' & ' + state.custom.from : ''} (Nv. 100)!`
      : 'Passaporte Pokesage Confirmado (Nv. 100)!';
    const lines = [
      header,
      `Local: ${state.choices.local} (${POKEDEX[state.choices.localPoke]?.name || ''})`,
      `Cardápio: ${state.choices.comida} (${POKEDEX[state.choices.comidaPoke]?.name || ''})`,
      `Quando: ${state.choices.data} (${POKEDEX[state.choices.dataPoke]?.name || ''})`
    ];
    if (state.choices.nota) lines.push(`Recado: ${state.choices.nota}`);
    if (state.shiny) lines.push('Edição Especial: ★ Shiny');
    return lines.join('\n');
  }

  function copyInvite() {
    const text = buildSummaryText();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => showToast('Bilhete copiado para a área de transferência!')).catch(() => showToast('Bilhete pronto!'));
    } else {
      showToast('Bilhete pronto!');
    }
    AudioEngine.select();
  }

  function shareWhatsApp() {
    const text = encodeURIComponent(buildSummaryText());
    const phone = (state.custom.whatsapp || '').replace(/\D/g, '');
    const base = phone ? `https://wa.me/${phone}?text=` : 'https://wa.me/?text=';
    window.open(base + text, '_blank', 'noopener,noreferrer');
  }

  function downloadCalendar() {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 19, 30, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 22, 0, 0);
    const fmt = d => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const desc = `Pokesage — Local: ${state.choices.local} | Comida: ${state.choices.comida} | Quando: ${state.choices.data}${state.choices.nota ? ' | Recado: ' + state.choices.nota : ''}`;
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Pokesage//PT-BR',
      'BEGIN:VEVENT',
      `DTSTART:${fmt(start)}`,
      `DTEND:${fmt(end)}`,
      `SUMMARY:Pokesage: ${state.choices.local} (${state.choices.comida})`,
      `DESCRIPTION:${desc}`,
      `LOCATION:${state.choices.local}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pokesage-encontro.ics';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    AudioEngine.select();
    showToast('Evento salvo para sua agenda!');
  }

  /* =========================================================================
     6. HIGH-RES 1080x1350 COLLECTIBLE PNG TICKET GENERATOR (CANVAS 2D)
     ========================================================================= */
  function loadImg(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  async function downloadTicketPNG() {
    showToast('Gerando bilhete PNG em alta resolução...');
    AudioEngine.select();

    const W = 1080;
    const H = 1350;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    const cBg = getToken('--color-background', '#fff5f8');
    const cCard = getToken('--color-card', '#ffffff');
    const cMuted = getToken('--color-muted', '#faf3f6');
    const cFg = getToken('--color-foreground', '#28151f');
    const cMutedFg = getToken('--color-muted-foreground', '#734b5e');
    const cPrimary = getToken('--color-primary', '#d44070');
    const cAccent = getToken('--color-accent', '#fde8ef');
    const cAccentFg = getToken('--color-accent-foreground', '#781d3c');
    const cBorder = getToken('--color-border', '#e6ced9');
    const cShiny = getToken('--color-shiny-accent', '#ca8a04');
    const cStep1 = getToken('--color-step-1-accent', '#15966d');
    const cStep2 = getToken('--color-step-2-accent', '#c27810');
    const cStep3 = getToken('--color-step-3-accent', '#1967b2');

    // Background + subtle dot grid
    ctx.fillStyle = cBg;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = cPrimary;
    ctx.globalAlpha = 0.08;
    for (let x = 36; x < W; x += 48) {
      for (let y = 36; y < H; y += 48) {
        ctx.beginPath();
        ctx.arc(x, y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;

    // Outer Ticket Shell
    const pad = 72;
    const cardW = W - pad * 2;
    const cardH = H - pad * 2;
    ctx.save();
    roundRect(ctx, pad, pad, cardW, cardH, 44);
    ctx.fillStyle = cCard;
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = state.shiny ? cShiny : cBorder;
    ctx.stroke();
    ctx.clip();

    // Top Spectrum Bar
    const grad = ctx.createLinearGradient(pad, pad, pad + cardW, pad);
    grad.addColorStop(0, cPrimary);
    grad.addColorStop(0.35, cStep2);
    grad.addColorStop(0.7, cStep1);
    grad.addColorStop(1, cStep3);
    ctx.fillStyle = grad;
    ctx.fillRect(pad, pad, cardW, 12);

    // Header Row
    ctx.fillStyle = cPrimary;
    ctx.font = '700 28px "JetBrains Mono", monospace';
    ctx.fillText('POKESAGE #012', pad + 56, pad + 88);

    // LVL 100 Pill
    roundRect(ctx, pad + cardW - 220, pad + 52, 164, 50, 25);
    ctx.fillStyle = cAccent;
    ctx.fill();
    ctx.fillStyle = cAccentFg;
    ctx.font = '700 24px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(state.shiny ? '★ NV. 100' : 'NV. 100', pad + cardW - 138, pad + 86);
    ctx.textAlign = 'left';

    // Divider
    ctx.strokeStyle = cBorder;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pad + 56, pad + 128);
    ctx.lineTo(pad + cardW - 56, pad + 128);
    ctx.stroke();

    // Hero Partner Circle + Togekiss Sprite
    const cx = W / 2;
    const heroY = pad + 260;
    ctx.beginPath();
    ctx.arc(cx, heroY, 96, 0, Math.PI * 2);
    ctx.fillStyle = cAccent;
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = state.shiny ? cShiny : cPrimary;
    ctx.stroke();

    const [heroImg, imgLocal, imgComida, imgData] = await Promise.all([
      loadImg(spriteSrc('togekiss')),
      loadImg(spriteSrc(state.choices.localPoke)),
      loadImg(spriteSrc(state.choices.comidaPoke)),
      loadImg(spriteSrc(state.choices.dataPoke))
    ]);

    ctx.imageSmoothingEnabled = false;
    if (heroImg) ctx.drawImage(heroImg, cx - 76, heroY - 76, 152, 152);

    // Headline
    ctx.textAlign = 'center';
    ctx.fillStyle = cFg;
    ctx.font = '700 50px "Fredoka", "Plus Jakarta Sans", sans-serif';
    const titleStr = state.custom.to ? `Date Confirmado, ${state.custom.to}!` : 'Date Confirmado!';
    ctx.fillText(titleStr, cx, heroY + 158);

    ctx.fillStyle = cMutedFg;
    ctx.font = '600 26px "Plus Jakarta Sans", sans-serif';
    const pairLine = state.custom.from
      ? `Convite oficial de ${state.custom.from} • Love Ball Nv. 100`
      : 'Passaporte oficial • Capturado com Love Ball Nv. 100';
    ctx.fillText(pairLine, cx, heroY + 204);

    // Team Strip Box
    const stripX = pad + 56;
    const stripY = heroY + 244;
    const stripW = cardW - 112;
    const stripH = 196;
    roundRect(ctx, stripX, stripY, stripW, stripH, 28);
    ctx.fillStyle = cMuted;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = cBorder;
    ctx.stroke();

    const members = [
      { img: imgLocal, role: 'REGIÃO', name: POKEDEX[state.choices.localPoke]?.name || '' },
      { img: imgComida, role: 'CARDÁPIO', name: POKEDEX[state.choices.comidaPoke]?.name || '' },
      { img: imgData, role: 'DATA', name: POKEDEX[state.choices.dataPoke]?.name || '' }
    ];
    members.forEach((m, idx) => {
      const colW = stripW / 3;
      const mx = stripX + colW * idx + colW / 2;
      if (m.img) ctx.drawImage(m.img, mx - 52, stripY + 14, 104, 104);
      ctx.fillStyle = cMutedFg;
      ctx.font = '700 18px "JetBrains Mono", monospace';
      ctx.fillText(m.role, mx, stripY + 142);
      ctx.fillStyle = cFg;
      ctx.font = '700 24px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(m.name, mx, stripY + 174);
    });

    // Details Card
    const detY = stripY + stripH + 34;
    const detH = 336;
    roundRect(ctx, stripX, detY, stripW, detH, 28);
    ctx.fillStyle = cMuted;
    ctx.fill();
    ctx.strokeStyle = cBorder;
    ctx.stroke();

    const rows = [
      ['LOCAL', state.choices.local],
      ['CARDÁPIO', state.choices.comida],
      ['QUANDO', state.choices.data],
      ['RECADO', state.choices.nota || 'Combinado!']
    ];
    rows.forEach(([k, v], i) => {
      const ry = detY + 62 + i * 76;
      ctx.textAlign = 'left';
      ctx.fillStyle = cMutedFg;
      ctx.font = '700 21px "JetBrains Mono", monospace';
      ctx.fillText(k, stripX + 36, ry);

      ctx.textAlign = 'right';
      ctx.fillStyle = cFg;
      ctx.font = '700 26px "Plus Jakarta Sans", sans-serif';
      const clipped = v.length > 30 ? v.slice(0, 29) + '…' : v;
      ctx.fillText(clipped, stripX + stripW - 36, ry);

      if (i < rows.length - 1) {
        ctx.strokeStyle = cBorder;
        ctx.beginPath();
        ctx.moveTo(stripX + 36, ry + 26);
        ctx.lineTo(stripX + stripW - 36, ry + 26);
        ctx.stroke();
      }
    });

    // Footer Signature
    ctx.textAlign = 'center';
    ctx.fillStyle = cMutedFg;
    ctx.font = '600 22px "JetBrains Mono", monospace';
    ctx.fillText('POKESAGE • miqueias-henrique.github.io/Dia_12', cx, pad + cardH - 42);
    ctx.restore();

    const link = document.createElement('a');
    link.download = 'pokesage-bilhete.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    showToast('Bilhete PNG salvo! Pronto para postar ou enviar.');
  }

  /* =========================================================================
     7. INTERACTIVE POKÉDEX MODAL (INSPECTOR + SHINY TABS)
     ========================================================================= */
  let dexViewShiny = false;

  function renderDexInspector(key) {
    state.selectedDexKey = POKEDEX[key] ? key : 'pikachu';
    const p = POKEDEX[state.selectedDexKey];
    const spriteEl = document.getElementById('dexInspSprite');
    const nameEl = document.getElementById('dexInspName');
    const typeEl = document.getElementById('dexInspType');
    const descEl = document.getElementById('dexInspDesc');
    const fillEl = document.getElementById('dexInspFill');
    const valEl = document.getElementById('dexInspVal');

    if (spriteEl) {
      spriteEl.src = spriteSrc(state.selectedDexKey, dexViewShiny);
      spriteEl.alt = p.name;
    }
    if (nameEl) nameEl.textContent = `${formatDex(p.num)} ${p.name}`;
    if (typeEl) typeEl.textContent = p.type;
    if (descEl) descEl.textContent = `${p.role} • ${p.quote}`;
    if (fillEl) fillEl.style.width = `${p.charm}%`;
    if (valEl) valEl.textContent = `${p.charm}/100`;

    document.querySelectorAll('#dexGrid .dex-item').forEach(btn => {
      btn.setAttribute('aria-selected', String(btn.dataset.key === state.selectedDexKey));
    });
  }

  function renderDexModal() {
    const grid = document.getElementById('dexGrid');
    if (!grid) return;
    grid.innerHTML = '';
    Object.entries(POKEDEX).forEach(([key, p]) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'dex-item';
      btn.dataset.key = key;
      btn.setAttribute('aria-selected', String(key === state.selectedDexKey));
      btn.innerHTML = `
        <span class="dex-item-num">${formatDex(p.num)}</span>
        <img src="${spriteSrc(key, dexViewShiny)}" alt="${p.name}" loading="lazy" />
        <span class="dex-item-name">${p.name}</span>
      `;
      btn.addEventListener('click', () => {
        renderDexInspector(key);
        AudioEngine.cry(key);
      });
      grid.appendChild(btn);
    });
    renderDexInspector(state.selectedDexKey);
  }

  function toggleDexModal(open) {
    const modal = document.getElementById('dexModal');
    const btn = document.getElementById('btnDex');
    if (!modal || !btn) return;
    const shouldOpen = typeof open === 'boolean' ? open : modal.classList.contains('hidden');
    if (shouldOpen) {
      dexViewShiny = state.shiny;
      document.getElementById('tabDexNormal')?.setAttribute('aria-selected', String(!dexViewShiny));
      document.getElementById('tabDexShiny')?.setAttribute('aria-selected', String(dexViewShiny));
      renderDexModal();
    }
    modal.classList.toggle('hidden', !shouldOpen);
    btn.setAttribute('aria-expanded', String(shouldOpen));
    shouldOpen ? AudioEngine.select() : AudioEngine.back();
  }

  /* =========================================================================
     8. POKESAGE STUDIO (CUSTOM SHAREABLE INVITE GENERATOR)
     ========================================================================= */
  function buildStudioUrl() {
    const from = (document.getElementById('stFrom')?.value || '').trim();
    const to = (document.getElementById('stTo')?.value || '').trim();
    const headline = (document.getElementById('stHeadline')?.value || '').trim();
    const message = (document.getElementById('stMessage')?.value || '').trim();
    const whatsapp = (document.getElementById('stWhatsApp')?.value || '').replace(/\D/g, '');

    const payload = {};
    if (from) payload.f = from;
    if (to) payload.t = to;
    if (headline) payload.h = headline;
    if (message) payload.m = message;
    if (state.studioMessenger && state.studioMessenger !== 'pikachu') payload.p = state.studioMessenger;
    if (whatsapp) payload.w = whatsapp;
    if (state.studioShiny) payload.s = 1;

    const base = window.location.origin + window.location.pathname;
    if (Object.keys(payload).length === 0) return base;
    return `${base}?m=${UrlCodec.encode(payload)}`;
  }

  function updateStudioLinkPreview() {
    const box = document.getElementById('studioLinkOut');
    if (box) box.textContent = buildStudioUrl();
  }

  function applyCustomConfig(cfg) {
    const pokeKey = POKEDEX[cfg.p] ? cfg.p : 'pikachu';
    const pData = POKEDEX[pokeKey];

    state.custom.from = cfg.f || '';
    state.custom.to = cfg.t || '';
    state.custom.messenger = pokeKey;
    state.custom.whatsapp = cfg.w || '';
    state.custom.headline = cfg.h || (state.custom.to ? `Ei, ${state.custom.to}!` : 'Ei, você aí!');
    state.custom.message = cfg.m || `${pData.name} usou Cute Charm em você. Quer ser meu par nessa jornada?`;

    // Update Hero DOM
    const heroImg = document.getElementById('heroSpriteImg');
    if (heroImg) {
      heroImg.setAttribute('data-poke', pokeKey);
      heroImg.src = spriteSrc(pokeKey);
      heroImg.alt = pData.name;
    }
    const heroStage = document.getElementById('sw0');
    if (heroStage) heroStage.setAttribute('aria-label', `${pData.name} — clique para interagir`);

    const pillNum = document.getElementById('pill0Text');
    if (pillNum) pillNum.textContent = `${formatDex(pData.num)} ${pData.name.toUpperCase()}`;

    const speaker = document.getElementById('dialogueSpeaker');
    if (speaker) speaker.textContent = `${pData.name.toUpperCase()} PARCEIRO`;

    const titleEl = document.getElementById('heroTitle');
    if (titleEl) titleEl.textContent = state.custom.headline;

    const ribbon = document.getElementById('customRibbon');
    if (ribbon) {
      if (state.custom.from || state.custom.to) {
        const parts = [];
        if (state.custom.from) parts.push(`De <strong>${escapeHtml(state.custom.from)}</strong>`);
        if (state.custom.to) parts.push(`para <strong>${escapeHtml(state.custom.to)}</strong>`);
        ribbon.innerHTML = parts.join(' • ');
        ribbon.classList.remove('hidden');
      } else {
        ribbon.classList.add('hidden');
      }
    }

    if (cfg.s) {
      state.shiny = true;
      refreshAllSprites();
    }

    runTypewriter(state.custom.message);
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  }

  function renderStudioPicker() {
    const picker = document.getElementById('messengerPicker');
    if (!picker) return;
    picker.innerHTML = '';
    MESSENGERS.forEach(key => {
      const p = POKEDEX[key];
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'messenger-opt';
      btn.title = p.name;
      btn.setAttribute('aria-label', `Escolher ${p.name}`);
      btn.setAttribute('aria-pressed', String(key === state.studioMessenger));
      btn.innerHTML = `<img src="${spriteSrc(key, state.studioShiny)}" alt="${p.name}" />`;
      btn.addEventListener('click', () => {
        state.studioMessenger = key;
        AudioEngine.cry(key);
        renderStudioPicker();
        updateStudioLinkPreview();
      });
      picker.appendChild(btn);
    });
  }

  function toggleStudioModal(open) {
    const modal = document.getElementById('studioModal');
    const btn = document.getElementById('btnStudio');
    if (!modal) return;
    const shouldOpen = typeof open === 'boolean' ? open : modal.classList.contains('hidden');
    if (shouldOpen) {
      document.getElementById('stFrom').value = state.custom.from;
      document.getElementById('stTo').value = state.custom.to;
      document.getElementById('stHeadline').value = state.custom.headline === 'Ei, você aí!' ? '' : state.custom.headline;
      document.getElementById('stMessage').value = state.custom.message.includes('usou Cute Charm') ? '' : state.custom.message;
      document.getElementById('stWhatsApp').value = state.custom.whatsapp;
      state.studioMessenger = state.custom.messenger;
      state.studioShiny = state.shiny;
      document.getElementById('stShinySwitch')?.setAttribute('aria-checked', String(state.studioShiny));
      renderStudioPicker();
      updateStudioLinkPreview();
    }
    modal.classList.toggle('hidden', !shouldOpen);
    if (btn) btn.setAttribute('aria-expanded', String(shouldOpen));
    shouldOpen ? AudioEngine.select() : AudioEngine.back();
  }

  function copyStudioLink() {
    const url = buildStudioUrl();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => showToast('Link da sua Pokesage copiado!')).catch(() => showToast('Link gerado!'));
    } else {
      showToast('Link gerado!');
    }
    AudioEngine.select();
  }

  function previewStudioNow() {
    const url = new URL(buildStudioUrl());
    const encoded = url.searchParams.get('m');
    try {
      window.history.replaceState({}, '', url.pathname + url.search);
    } catch (_) {}
    const cfg = encoded ? (UrlCodec.decode(encoded) || {}) : {};
    state.shiny = Boolean(cfg.s);
    applyCustomConfig(cfg);
    refreshAllSprites();
    toggleStudioModal(false);
    goTo('s0', true);
    showToast('Pokesage personalizada carregada!');
  }

  /* =========================================================================
     9. THEME & BOOTSTRAP
     ========================================================================= */
  function setDarkTheme(isDark) {
    document.documentElement.classList.toggle('dark', isDark);
    const btn = document.getElementById('btnTheme');
    const moon = document.getElementById('iconMoon');
    const sun = document.getElementById('iconSun');
    if (btn) btn.setAttribute('aria-pressed', String(isDark));
    if (moon) moon.classList.toggle('hidden', isDark);
    if (sun) sun.classList.toggle('hidden', !isDark);
    try { localStorage.setItem('pokesage-theme', isDark ? 'dark' : 'light'); } catch (_) {}
  }

  function pokeCry(key) {
    const resolved = key === 'hero' ? state.custom.messenger : key;
    AudioEngine.cry(resolved);
    pulseLed();
    const stage = document.querySelector('.screen:not(.hidden) .sprite-wrap');
    if (stage) {
      const r = stage.getBoundingClientRect();
      AmbientEngine.burst(r.left + r.width / 2, r.top + r.height / 2, state.shiny ? 'shiny' : 'confetti');
    }
    const p = POKEDEX[resolved] || POKEDEX.pikachu;
    showToast(`${p.name} está torcendo pelo nosso date!`);
  }

  function initHolofoil() {
    const pass = document.getElementById('trainerPass');
    if (!pass || REDUCED_MOTION) return;
    pass.addEventListener('pointermove', (e) => {
      const rect = pass.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      pass.style.setProperty('--foil-x', `${x.toFixed(1)}%`);
      pass.style.setProperty('--foil-y', `${y.toFixed(1)}%`);
    });
  }

  function boot() {
    AmbientEngine.init();
    initHolofoil();

    try {
      const saved = localStorage.getItem('pokesage-theme');
      if (saved === 'dark') setDarkTheme(true);
    } catch (_) {}

    // Decode custom URL payload if present (?m=...)
    const params = new URLSearchParams(window.location.search);
    const rawM = params.get('m');
    if (rawM) {
      try {
        const decoded = UrlCodec.decode(rawM);
        if (decoded && typeof decoded === 'object') {
          applyCustomConfig(decoded);
        } else {
          runTypewriter(state.custom.message);
        }
      } catch (_) {
        runTypewriter(state.custom.message);
      }
    } else {
      runTypewriter(state.custom.message);
    }

    // Topbar listeners
    document.getElementById('btnTheme')?.addEventListener('click', () => {
      setDarkTheme(!document.documentElement.classList.contains('dark'));
      AudioEngine.select();
    });

    document.getElementById('btnSound')?.addEventListener('click', (e) => {
      state.sound = !state.sound;
      e.currentTarget.setAttribute('aria-pressed', String(state.sound));
      document.getElementById('iconSoundOn')?.classList.toggle('hidden', !state.sound);
      document.getElementById('iconSoundOff')?.classList.toggle('hidden', state.sound);
      if (state.sound) AudioEngine.select();
    });

    document.getElementById('btnShiny')?.addEventListener('click', () => toggleShiny());
    document.getElementById('btnDex')?.addEventListener('click', () => toggleDexModal());
    document.getElementById('btnStudio')?.addEventListener('click', () => toggleStudioModal());

    // Pokédex segmented tabs
    document.getElementById('tabDexNormal')?.addEventListener('click', () => {
      dexViewShiny = false;
      document.getElementById('tabDexNormal').setAttribute('aria-selected', 'true');
      document.getElementById('tabDexShiny').setAttribute('aria-selected', 'false');
      renderDexModal();
      AudioEngine.back();
    });
    document.getElementById('tabDexShiny')?.addEventListener('click', () => {
      dexViewShiny = true;
      document.getElementById('tabDexNormal').setAttribute('aria-selected', 'false');
      document.getElementById('tabDexShiny').setAttribute('aria-selected', 'true');
      renderDexModal();
      AudioEngine.shinySparkle();
    });
    document.getElementById('dexInspSpriteBtn')?.addEventListener('click', () => {
      AudioEngine.cry(state.selectedDexKey);
    });

    // Studio form bindings
    ['stFrom', 'stTo', 'stHeadline', 'stMessage', 'stWhatsApp'].forEach(id => {
      document.getElementById(id)?.addEventListener('input', updateStudioLinkPreview);
    });
    document.getElementById('stShinySwitch')?.addEventListener('click', (e) => {
      state.studioShiny = !state.studioShiny;
      e.currentTarget.setAttribute('aria-checked', String(state.studioShiny));
      renderStudioPicker();
      updateStudioLinkPreview();
      state.studioShiny ? AudioEngine.shinySparkle() : AudioEngine.back();
    });

    // Keyboard activation for sprite stages & Escape for dialogs
    document.querySelectorAll('.sprite-wrap[role="button"]').forEach(el => {
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          el.click();
        }
      });
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        toggleDexModal(false);
        toggleStudioModal(false);
      }
    });
  }

  window.Pokesage = {
    goTo,
    pick,
    runaway,
    pokeCry,
    updateNote,
    copyInvite,
    shareWhatsApp,
    downloadCalendar,
    downloadTicketPNG,
    toggleDexModal,
    toggleStudioModal,
    copyStudioLink,
    previewStudioNow,
    setDarkTheme,
    toggleShiny
  };

  window.addEventListener('DOMContentLoaded', boot);
})();
