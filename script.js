/* ==========================================================================
   ETERNA.CSS — o nascimento de um girassol
   Uma única tela, uma história contada por etapas: escuridão > caule nasce
   > folhas brotam > botão fechado > grande florescimento > desperta
   > o sol nasce > contemplação > a frase.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  const scene        = document.getElementById('scene');
  const bottomUI      = document.getElementById('bottomUI');
  const bloomBtn      = document.getElementById('bloomBtn');
  const progressFill  = document.getElementById('progressFill');
  const particlesEl   = document.getElementById('particles');
  const petalLayersEl = document.getElementById('petalLayers');
  const seedSpiralEl  = document.getElementById('seedSpiral');
  const stemPath      = document.getElementById('stemPath');
  const leafLeft      = document.getElementById('leafLeft');
  const leafRight     = document.getElementById('leafRight');

  /* ------------------------------------------------------------------
     Tempos da jornada (em ms). Cada etapa começa depois que a anterior
     termina — ajuste aqui para acelerar ou desacelerar a história.
     ------------------------------------------------------------------ */
  const STEP = {
    dissolve:        1200,  // interface desaparece
    darkness:        1000,  // silêncio na escuridão antes de tudo começar
    stemGrowth:      2200,  // caule "desenhando-se" de baixo para cima
    leavesAtPercent: 0.7,   // folhas brotam quando o caule chega a 70%
    budBreathe:      1800,  // botão fechado respirando antes de florescer
    bloomDuration:   2800,  // pétalas internas > intermediárias > externas
    awake:           1300,  // o girassol gira em direção ao observador
    sunrise:         2800,  // o halo dourado nasce lentamente
    contemplation:   3000,  // pausa observando a flor viva
  };

  /* ==================================================================
     PÉTALAS — 3 camadas: internas, intermediárias e externas.
     A ORDEM DE ABERTURA segue essa sequência (delays crescentes),
     como um florescimento real, de dentro para fora.
     ================================================================== */
  const PETAL_LAYERS = [
    { count: 10, baseW: 16, baseH: 42, cls: 'layer-inner',  delayBase: 0.00, delayStep: 0.045 },
    { count: 12, baseW: 22, baseH: 58, cls: 'layer-middle', delayBase: 0.62, delayStep: 0.040 },
    { count: 14, baseW: 29, baseH: 78, cls: 'layer-outer',  delayBase: 1.28, delayStep: 0.035 },
  ];

  function createPetals() {
    PETAL_LAYERS.forEach((layer, li) => {
      const angleStep = 360 / layer.count;
      const rotationOffset = li * 6 + (Math.random() - 0.5) * 4;

      for (let i = 0; i < layer.count; i++) {
        const angle       = rotationOffset + i * angleStep + (Math.random() - 0.5) * 4;
        const sizeFactor   = 0.82 + Math.random() * 0.34;
        const jitter       = 0.94 + Math.random() * 0.1;
        const brightness   = 0.94 + Math.random() * 0.14;
        const delay        = layer.delayBase + i * layer.delayStep + Math.random() * 0.05;
        const breatheDelay = Math.random() * 4.5;

        const anchor = document.createElement('div');
        anchor.className = `petal-anchor ${layer.cls}`;
        anchor.style.setProperty('--angle', `${angle}deg`);

        const shape = document.createElement('div');
        shape.className = 'petal-shape';
        shape.style.width = `${layer.baseW * sizeFactor}px`;
        shape.style.height = `${layer.baseH * sizeFactor}px`;
        shape.style.setProperty('--jitter', jitter);
        shape.style.setProperty('--bright', brightness);
        shape.style.setProperty('--breathe-delay', `${breatheDelay}s`);
        shape.style.transitionDelay = `${delay}s`;

        anchor.appendChild(shape);
        petalLayersEl.appendChild(anchor);
      }
    });
  }

  function createSeeds() {
    const total = 100;
    const goldenAngle = 137.508;
    const diameter = 60;
    const maxR = diameter / 2;

    for (let i = 0; i < total; i++) {
      const seed = document.createElement('div');
      seed.className = 'seed-dot';

      const theta = i * goldenAngle;
      const r = maxR * Math.sqrt(i / total);
      const x = maxR + r * Math.cos(theta * Math.PI / 180);
      const y = maxR + r * Math.sin(theta * Math.PI / 180);
      const size = 3.4 + Math.random() * 1.2;

      seed.style.left = `${x}px`;
      seed.style.top = `${y}px`;
      seed.style.width = `${size}px`;
      seed.style.height = `${size}px`;

      seedSpiralEl.appendChild(seed);
    }
  }

  /* ==================================================================
     PARTÍCULAS
     ================================================================== */
  const PARTICLE_TYPES = ['spark--dust', 'spark--dust', 'spark--firefly', 'spark--soft'];

  function spawnParticle(type) {
    const p = document.createElement('div');
    const kind = type || PARTICLE_TYPES[Math.floor(Math.random() * PARTICLE_TYPES.length)];
    p.className = `spark ${kind}`;

    const left = Math.random() * 100;
    const duration = kind === 'spark--soft' ? 6 + Math.random() * 3 : 4.5 + Math.random() * 4;
    const drift = (Math.random() - 0.5) * 80;
    const size = kind === 'spark--soft' ? 7 + Math.random() * 4
               : kind === 'spark--firefly' ? 3.5 + Math.random() * 1.5
               : 2 + Math.random() * 2;

    p.style.left = `${left}%`;
    p.style.width = `${size}px`;
    p.style.height = `${size}px`;
    p.style.animationDuration = kind === 'spark--firefly'
      ? `${duration}s, ${1.2 + Math.random() * 1.2}s`
      : `${duration}s`;
    p.style.setProperty('--drift', `${drift}px`);

    particlesEl.appendChild(p);
    setTimeout(() => p.remove(), duration * 1000);
  }

  // fluxo contínuo de partículas, discreto mesmo na escuridão inicial
  setInterval(() => spawnParticle(), 650);

  function burstParticles(count, spread) {
    for (let i = 0; i < count; i++) {
      setTimeout(() => spawnParticle(Math.random() > 0.5 ? 'spark--flash' : 'spark--firefly'), i * spread);
    }
  }

  // brasas douradas saindo de dentro da flor — só depois que ela vira luz
  let emberInterval = null;
  function startEmbers() {
    if (emberInterval) return;
    emberInterval = setInterval(() => {
      const p = document.createElement('div');
      const kind = Math.random() > 0.5 ? 'spark--dust' : 'spark--firefly';
      p.className = `spark ${kind}`;

      const left = 50 + (Math.random() - 0.5) * 22;
      const bottom = 46 + (Math.random() - 0.5) * 10;
      const duration = 5 + Math.random() * 3;
      const drift = (Math.random() - 0.5) * 50;
      const size = 2 + Math.random() * 2;

      p.style.left = `${left}%`;
      p.style.bottom = `${bottom}%`;
      p.style.width = `${size}px`;
      p.style.height = `${size}px`;
      p.style.animationDuration = kind === 'spark--firefly'
        ? `${duration}s, ${1.4 + Math.random()}s`
        : `${duration}s`;
      p.style.setProperty('--drift', `${drift}px`);

      particlesEl.appendChild(p);
      setTimeout(() => p.remove(), duration * 1000);
    }, 600);
  }

  /* ==================================================================
     CAULE — traçado SVG revelado progressivamente (não é scale!)
     ================================================================== */
  let stemLength = 0;
  function prepareStem() {
    stemLength = stemPath.getTotalLength();
    stemPath.style.strokeDasharray = `${stemLength}`;
    stemPath.style.strokeDashoffset = `${stemLength}`;
  }

  function growStem(durationMs) {
    stemPath.style.transition = `stroke-dashoffset ${durationMs}ms cubic-bezier(.16,1,.3,1)`;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        stemPath.style.strokeDashoffset = '0';
      });
    });
  }

  /* ==================================================================
     ETAPA 0 — barra de progresso automática ("tempo da natureza")
     ================================================================== */
  function runIntroProgress(duration) {
    requestAnimationFrame(() => {
      setTimeout(() => {
        progressFill.style.transitionDuration = `${duration}ms`;
        progressFill.style.width = '100%';
      }, 200);
    });

    setTimeout(() => {
      bottomUI.classList.add('ready');
      bloomBtn.disabled = false;
      bloomBtn.textContent = '🌻 FLORESCER';
    }, duration + 200);
  }

  /* ==================================================================
     A JORNADA — cada etapa liga a próxima no tempo certo
     ================================================================== */
  function beginJourney() {
    if (scene.classList.contains('dissolving')) return;
    bloomBtn.disabled = true;

    let t = 0;

    // 1. Escuridão — interface se dissolve, tudo silencia por um instante
    scene.classList.add('dissolving');
    t += STEP.dissolve + STEP.darkness;

    // 2. O caule nasce — cresce de baixo para cima, revelando o traçado
    setTimeout(() => {
      scene.classList.add('journey');
      growStem(STEP.stemGrowth);
    }, t);

    // 3. As folhas aparecem quando o caule atinge ~70% da altura,
    //    cada uma com um pequeno atraso entre si (nada sincronizado)
    setTimeout(() => {
      leafLeft.classList.add('grow');
    }, t + STEP.stemGrowth * STEP.leavesAtPercent);

    setTimeout(() => {
      leafRight.classList.add('grow');
    }, t + STEP.stemGrowth * STEP.leavesAtPercent + 320);

    t += STEP.stemGrowth;

    // 4. O botão da flor nasce na ponta do caule e respira suavemente
    setTimeout(() => {
      scene.classList.add('bud-grown');
    }, t);
    t += STEP.budBreathe;

    // 5. O grande florescimento — pétalas internas > intermediárias > externas
    setTimeout(() => {
      scene.classList.add('blooming');
      burstParticles(14, 90);
    }, t);
    t += STEP.bloomDuration;

    // 6. O girassol desperta — gira em direção ao observador, miolo ganha vida
    setTimeout(() => {
      scene.classList.add('awake');
    }, t + 250);
    t += STEP.awake;

    // 7. O sol nasce — o halo dourado cresce lentamente, mais partículas
    setTimeout(() => {
      scene.classList.add('lit');
      startEmbers();
      burstParticles(8, 200);
    }, t);
    t += STEP.sunrise;

    // 8. Contemplação — alguns segundos só observando a flor viva
    t += STEP.contemplation;

    // 9. A frase surge, como uma lembrança
    setTimeout(() => {
      scene.classList.add('finale-shown');
    }, t);
  }

  bloomBtn.addEventListener('click', beginJourney);

  /* ==================================================================
     PLAYER DE MÚSICA — independente da jornada, toca desde o início
     ================================================================== */
  function initMusicPlayer() {
    const audio = document.getElementById('audio');
    const playBtn = document.getElementById('playBtn');

    const updateBtn = () => {
      playBtn.textContent = audio.paused ? '▶' : '❚❚';
    };

    audio.play()
      .then(updateBtn)
      .catch(() => {
        // autoplay bloqueado pelo navegador: inicia no primeiro toque/clique
        updateBtn();

        const startOnInteraction = () => {
          audio.play().then(updateBtn);
          document.removeEventListener('click', startOnInteraction);
          document.removeEventListener('touchstart', startOnInteraction);
        };

        document.addEventListener('click', startOnInteraction);
        document.addEventListener('touchstart', startOnInteraction);
      });

    playBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      audio.paused ? audio.play() : audio.pause();
      updateBtn();
    });
  }

  /* ==================================================================
     INÍCIO
     ================================================================== */
  createPetals();
  createSeeds();
  prepareStem();
  runIntroProgress(5000);
  initMusicPlayer();
});