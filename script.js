/* =============================================
   ZAHNPAKA – script.js
   Kindgerechte Zahnputz-App mit Alpi dem Alpaka
   ============================================= */

'use strict';

/* ---- APP-ZUSTAND ---- */
const state = {
    name: 'Held',
    timer: 180,
    interval: null,
    currentPhaseIndex: -1,
    soundEnabled: localStorage.getItem('zahnpaka-sound') !== 'muted',
    introStep: 0,
};

/* ---- ZAHNPUTZ-PHASEN ---- */
const phases = [
    {
        startAt: 180,
        endAt:   121,
        text:    'Jetzt die Kauflächen! Hin und her!',
        zone:    'zone-unten',
        zoneLabel: 'Kauflächen (unten)',
        tips: [
            'Wie ein kleiner Zug: Tschu-tschu! 🚂',
            'Hin und her, hin und her...',
            'Die Zahnteufel laufen weg! 👿💨',
            'Nicht zu fest – sanft ist besser!',
        ],
        expression: 'encouraging',
    },
    {
        startAt: 120,
        endAt:   61,
        text:    'Jetzt die Außenflächen! Schöne Kreise!',
        zone:    'zone-oben',
        zoneLabel: 'Außenflächen (oben)',
        tips: [
            'Ganz sanft – wie eine Feder! 🪶',
            'Schöne, runde Kreise machen!',
            'Du putzt wie ein Profi! 🏆',
            'Wir verjagen noch mehr Teufel!',
        ],
        expression: 'happy',
    },
    {
        startAt: 60,
        endAt:   11,
        text:    'Jetzt die Innenflächen! Fast fertig!',
        zone:    'zone-unten',
        zoneLabel: 'Innenflächen (unten)',
        tips: [
            'Noch fast fertig! Du schaffst das! 💪',
            'Die Innenseiten vergessen wir nicht!',
            'Alle Zahnteufel werden besiegt! 🎉',
            'Sanft und gründlich – toll so!',
        ],
        expression: 'proud',
    },
    {
        startAt: 10,
        endAt:   0,
        text:    'Letzter Glanz! Noch einmal strahlen!',
        zone:    'zone-oben',
        zoneLabel: 'Letzter Schliff!',
        tips: [
            'Spuck den Schaum jetzt aus! 🫧',
            'Gleich fertig – du bist toll!',
            'Noch ein paar Sekunden... 🌟',
        ],
        expression: 'happy',
    },
];

/* ---- ERMUTIGUNGS-PHRASEN ---- */
const encouragementMessages = {
    general: [
        'Das machst du richtig toll! ⭐',
        'Wow, wie das schon glänzt! ✨',
        'Du bist ein echter Zahnputz-Profi! 🏆',
        'Deine Zähne freuen sich so sehr! 🦷',
        'Super Putzmeister! 🌟',
        'Die Zahnteufel fliehen schon! 👿💨',
        'Glanz und Glimmer, weiter so! 💎',
        'Du machst das wunderschön! 🎉',
        'Alpi ist so stolz auf dich! 🦙',
        'Strahlende Zähne kommen! ✨🦷',
        'Was für ein Putztalent! 🥇',
        'Die anderen Kinder wären neidisch! 😄',
    ],
    phaseSpecific: {
        0: ['Die Kauflächen werden blitzsauber!', 'Tschu-tschu, gutes Putzen! 🚂'],
        1: ['Schöne Kreise – perfekt!', 'Die Außenseiten glänzen schon! ✨'],
        2: ['Innenseiten? Kein Problem! 💪', 'Sehr gründlich, super!'],
        3: ['Letzter Glanz! Fast geschafft! 🌟', 'Noch ein bisschen... gleich fertig!'],
    },
    byName: (name) => [
        `${name}, du bist fantastisch! 🎉`,
        `${name}, so saubere Zähne! ⭐`,
        `${name}, Alpi ist so stolz! 🦙`,
    ],
};

/* ---- ZAHNTEUFEL-INTRO-TEXTE ---- */
const introTexts = [
    {
        text: 'Die Zahnteufel wollen auf deinen Zähnen feiern! 😱\nAber wir lassen sie nicht rein!',
        dot:  0,
    },
    {
        text: '🦙 Alpi erklärt: „Wir putzen, damit die Zahnteufel keine Party machen können!"',
        dot:  1,
    },
    {
        text: 'Mit deiner Zahnbürste besiegen wir alle Zahnteufel! 🦷✨\nBereit?',
        dot:  2,
    },
];

/* ============================================
   SOUND-MANAGER
   ============================================ */
const soundManager = {
    ctx: null,

    _ensureCtx() {
        if (!this.ctx) {
            try {
                this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) { /* kein Audio-Support */ }
        }
        // Autoplay-Sperre aufheben
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
        }
    },

    _playTone(freq, duration, type = 'sine', gainVal = 0.18) {
        if (!state.soundEnabled) return;
        this._ensureCtx();
        if (!this.ctx) return;
        try {
            const osc  = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.type = type;
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        } catch (e) {}
    },

    phaseStart() {
        // Sanfter Glocken-Akzent: zwei Töne
        this._playTone(523, 0.25);
        setTimeout(() => this._playTone(659, 0.3), 180);
    },

    praise() {
        // Fröhliches Chime
        [523, 587, 659, 784].forEach((f, i) =>
            setTimeout(() => this._playTone(f, 0.2, 'sine', 0.14), i * 100)
        );
    },

    celebration() {
        // Kleiner Jubel-Fanfare
        const melody = [523, 659, 784, 1047, 784, 1047];
        melody.forEach((f, i) =>
            setTimeout(() => this._playTone(f, 0.25, 'triangle', 0.2), i * 130)
        );
    },

    tick() {
        this._playTone(440, 0.05, 'square', 0.04);
    },
};

/* ============================================
   TEXT-TO-SPEECH MANAGER (ResponsiveVoice)
   ============================================ */
const ttsManager = {
    voice: 'German Female',
    enabled: false,

    init() {
        // Check if ResponsiveVoice is loaded
        if (typeof responsiveVoice !== 'undefined') {
            this.enabled = true;
            // Ensure audio context is ready (iOS requirement)
            soundManager._ensureCtx();
        }
    },

    speak(text) {
        // Filter emoji for cleaner speech
        const textToSpeak = text.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim();
        if (!textToSpeak || !this.enabled || !state.soundEnabled) return;

        // Cancel any previous speech
        try {
            if (typeof responsiveVoice !== 'undefined') {
                responsiveVoice.cancel();
            }
        } catch (e) {}

        // Speak with German female voice
        try {
            if (typeof responsiveVoice !== 'undefined') {
                responsiveVoice.speak(textToSpeak, this.voice, {
                    rate: 0.9,
                    pitch: 1.0,
                });
            }
        } catch (e) {
            console.warn('TTS error:', e);
        }
    },

    cancel() {
        if (this.enabled && typeof responsiveVoice !== 'undefined') {
            try {
                responsiveVoice.cancel();
            } catch (e) {}
        }
    }
};

/* ============================================
   ALPAKA-EXPRESSION-SYSTEM
   ============================================ */
const expressions = {
    happy: {
        mouth: 'M 90 98 Q 100 110 110 98',
        eyeScale: '1',
    },
    encouraging: {
        mouth: 'M 88 98 Q 100 107 112 98',
        eyeScale: '1',
    },
    proud: {
        mouth: 'M 86 97 Q 100 112 114 97',
        eyeScale: '1',
    },
    surprised: {
        mouth: 'M 94 98 Q 100 104 106 98',
        eyeScale: '1.1',
    },
    neutral: {
        mouth: 'M 90 100 Q 100 102 110 100',
        eyeScale: '1',
    },
};

function setExpression(expressionName) {
    const expr = expressions[expressionName] || expressions.neutral;
    const mouth = document.getElementById('mouth-brushing');
    if (mouth) {
        mouth.setAttribute('d', expr.mouth);
    }
}

function triggerAlpacaReaction(type) {
    const el = document.getElementById('alpaka-brushing');
    if (!el) return;

    // Klassen entfernen für Neustart
    el.classList.remove('alpaka-dance', 'alpaka-proud', 'alpaka-excited');

    // Re-flow erzwingen
    void el.offsetWidth;

    if (type === 'phaseChange') {
        el.classList.add('alpaka-dance');
        setExpression('surprised');
        setTimeout(() => setExpression('encouraging'), 800);
    } else if (type === 'praise') {
        el.classList.add('alpaka-proud');
        setExpression('proud');
        soundManager.praise();
        setTimeout(() => setExpression('happy'), 1200);
    } else if (type === 'encouragement') {
        el.classList.add('alpaka-excited');
        setExpression('happy');
    }

    el.addEventListener('animationend', () => {
        el.classList.remove('alpaka-dance', 'alpaka-proud', 'alpaka-excited');
    }, { once: true });
}

/* ============================================
   SPRECHBLASE
   ============================================ */
function setSpeechBubble(text) {
    const el = document.getElementById('speech-bubble');
    if (!el) return;
    el.classList.remove('bubble-new');
    void el.offsetWidth;
    el.innerText = text;
    el.classList.add('bubble-new');

    // Speak the text with TTS
    ttsManager.speak(text);
}

/* ============================================
   SCREEN-NAVIGATION
   ============================================ */
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(id);
    if (target) {
        target.classList.add('active');
        // Fokus auf ersten Button (Accessibility)
        const btn = target.querySelector('button, input');
        if (btn) btn.focus();
    }
}

/* ============================================
   FORTSCHRITTS-DOTS
   ============================================ */
const TOTAL_DOTS = 12;

function initProgressDots() {
    const container = document.getElementById('progress-dots');
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < TOTAL_DOTS; i++) {
        const dot = document.createElement('div');
        dot.className = 'progress-dot';
        dot.id = `dot-${i}`;
        container.appendChild(dot);
    }
    container.setAttribute('aria-valuenow', '0');
}

function updateProgressDots() {
    const elapsed = 180 - state.timer;
    const completed = Math.floor(elapsed / (180 / TOTAL_DOTS));
    const container = document.getElementById('progress-dots');
    if (container) container.setAttribute('aria-valuenow', completed);

    for (let i = 0; i < TOTAL_DOTS; i++) {
        const dot = document.getElementById(`dot-${i}`);
        if (!dot) continue;
        if (i < completed) {
            dot.className = 'progress-dot done';
            dot.textContent = '⭐';
        } else if (i === completed) {
            dot.className = 'progress-dot active';
            dot.textContent = '';
        } else {
            dot.className = 'progress-dot';
            dot.textContent = '';
        }
    }
}

/* ============================================
   ZAHN-ZONEN
   ============================================ */
function highlightZone(zoneId) {
    ['zone-oben', 'zone-unten'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('active-zone', 'done-zone');
    });
    const active = document.getElementById(zoneId);
    if (active) active.classList.add('active-zone');

    const zoneLabel = document.getElementById('zone-label');
    const phase = phases.find(p => p.zone === zoneId);
    if (zoneLabel && phase) zoneLabel.textContent = phase.zoneLabel;
}

/* ============================================
   PHASEN-MANAGEMENT
   ============================================ */
function getCurrentPhaseIndex() {
    for (let i = 0; i < phases.length; i++) {
        const p = phases[i];
        if (state.timer <= p.startAt && state.timer > p.endAt) return i;
    }
    return phases.length - 1;
}

function onPhaseChange(newIndex) {
    const phase = phases[newIndex];
    document.getElementById('instruction-text').textContent = phase.text;
    setSpeechBubble(phase.tips[0]);
    highlightZone(phase.zone);
    setExpression(phase.expression || 'encouraging');
    triggerAlpacaReaction('phaseChange');
    soundManager.phaseStart();
}

/* ============================================
   ZUFÄLLIGE ERMUTIGUNG
   ============================================ */
function getSpeechForTimer() {
    const phaseIdx = getCurrentPhaseIndex();
    const phase    = phases[phaseIdx];

    // Jede 20 Sekunden innerhalb der Phase einen Tipp rotieren
    const tipElapsed = phase.startAt - state.timer;
    const tipIndex   = Math.floor(tipElapsed / 10) % phase.tips.length;
    return phase.tips[tipIndex];
}

function saySomethingRandom() {
    const phaseIdx = getCurrentPhaseIndex();
    const msgs     = encouragementMessages;
    const pool     = [
        ...msgs.general,
        ...(msgs.phaseSpecific[phaseIdx] || []),
        ...(state.name !== 'Held' ? msgs.byName(state.name) : []),
    ];
    const text = pool[Math.floor(Math.random() * pool.length)];
    setSpeechBubble(text);
    triggerAlpacaReaction('encouragement');
}

/* ============================================
   DISPLAY-UPDATE
   ============================================ */
function updateDisplay() {
    // Timer
    const mins = Math.floor(state.timer / 60);
    const secs = state.timer % 60;
    document.getElementById('timer-display').textContent =
        `${mins}:${secs.toString().padStart(2, '0')}`;

    // Fortschritts-Dots
    updateProgressDots();

    // Phase prüfen
    const newPhaseIdx = getCurrentPhaseIndex();
    if (newPhaseIdx !== state.currentPhaseIndex) {
        state.currentPhaseIndex = newPhaseIdx;
        onPhaseChange(newPhaseIdx);
    }

    // Alle 25s Ermutigung
    if (state.timer % 25 === 0 && state.timer > 10 && state.timer < 175) {
        saySomethingRandom();
    }

    // Alle 30s sanfter Tick
    if (state.timer % 30 === 0 && state.timer > 0) {
        soundManager.tick();
    }
}

/* ============================================
   ZAHNPUTZEN STARTEN
   ============================================ */
function startBrushing() {
    state.timer = 180;
    state.currentPhaseIndex = -1;
    initProgressDots();
    setExpression('encouraging');
    setSpeechBubble('Schnapp dir deine Bürste! 🪥');
    document.getElementById('instruction-text').textContent = 'Bist du bereit?';
    highlightZone('zone-unten');

    // Erster Aufruf sofort
    updateDisplay();

    state.interval = setInterval(() => {
        state.timer--;
        updateDisplay();

        if (state.timer <= 0) {
            clearInterval(state.interval);
            state.interval = null;
            finish();
        }
    }, 1000);
}

/* ============================================
   ABSCHLUSS
   ============================================ */
function finish() {
    document.querySelectorAll('.user-name').forEach(el => {
        el.textContent = state.name;
    });

    // Zonen zurücksetzen
    ['zone-oben', 'zone-unten'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.classList.remove('active-zone');
            el.classList.add('done-zone');
        }
    });

    // Announce completion with personalized message
    const congratsText = `Super gemacht, ${state.name}! Deine Zähne funkeln wie Sterne!`;
    ttsManager.speak(congratsText);

    showScreen('screen-finish');
    soundManager.celebration();
    spawnConfetti();
}

/* ============================================
   KONFETTI
   ============================================ */
function spawnConfetti() {
    const container = document.getElementById('confetti-container');
    if (!container) return;
    container.innerHTML = '';

    const colors  = ['#A3D8F4', '#FFB6C1', '#FFD700', '#90EE90', '#DDA0DD', '#FFA07A'];
    const count   = 60;

    for (let i = 0; i < count; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.style.left        = `${Math.random() * 100}%`;
        piece.style.width       = `${6 + Math.random() * 8}px`;
        piece.style.height      = `${6 + Math.random() * 8}px`;
        piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
        piece.style.background  = colors[Math.floor(Math.random() * colors.length)];
        piece.style.animationDuration  = `${1.5 + Math.random() * 2}s`;
        piece.style.animationDelay     = `${Math.random() * 0.8}s`;
        container.appendChild(piece);
    }

    // Konfetti nach 4s aufräumen
    setTimeout(() => { container.innerHTML = ''; }, 4500);
}

/* ============================================
   ZAHNTEUFEL-INTRO
   ============================================ */
function showIntroStep(step) {
    const data = introTexts[step];
    if (!data) return;

    document.getElementById('intro-text').textContent = data.text;

    // Speak intro text with TTS
    ttsManager.speak(data.text);

    // Punkte aktualisieren
    document.querySelectorAll('.intro-dot').forEach((dot, i) => {
        dot.classList.remove('active', 'done');
        if (i < step)    dot.classList.add('done');
        if (i === step)  dot.classList.add('active');
    });

    // Letzter Schritt: Button umbenennen
    const btn = document.getElementById('btn-intro-next');
    if (btn) {
        btn.textContent = step === introTexts.length - 1
            ? '🦷 Los geht\'s!'
            : 'Weiter ➜';
    }
}

/* ============================================
   MUTE-TOGGLE
   ============================================ */
function updateMuteButton() {
    const btn = document.getElementById('btn-mute');
    if (!btn) return;
    btn.textContent = state.soundEnabled ? '🔊' : '🔇';
    btn.classList.toggle('muted', !state.soundEnabled);
    btn.setAttribute('aria-label', state.soundEnabled ? 'Ton ausschalten' : 'Ton einschalten');
}

/* ============================================
   EVENT-LISTENER
   ============================================ */

// Mute-Button
document.getElementById('btn-mute').addEventListener('click', () => {
    state.soundEnabled = !state.soundEnabled;
    localStorage.setItem('zahnpaka-sound', state.soundEnabled ? 'on' : 'muted');
    updateMuteButton();
    // AudioContext initialisieren (User-Geste erforderlich)
    soundManager._ensureCtx();
});

// Start-Button
document.getElementById('btn-start').addEventListener('click', () => {
    const nameInput = document.getElementById('child-name').value.trim();
    if (nameInput) state.name = nameInput;
    soundManager._ensureCtx();
    showScreen('screen-intro');
    state.introStep = 0;
    showIntroStep(0);
});

// Enter im Name-Feld
document.getElementById('child-name').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('btn-start').click();
});

// Intro: Weiter
document.getElementById('btn-intro-next').addEventListener('click', () => {
    state.introStep++;
    if (state.introStep >= introTexts.length) {
        showScreen('screen-timer');
        startBrushing();
    } else {
        showIntroStep(state.introStep);
    }
});

// Intro: Überspringen
document.getElementById('btn-intro-skip').addEventListener('click', () => {
    showScreen('screen-timer');
    startBrushing();
});

// Neustart
document.getElementById('btn-restart').addEventListener('click', () => {
    if (state.interval) {
        clearInterval(state.interval);
        state.interval = null;
    }
    location.reload();
});

/* ============================================
   INIT
   ============================================ */
updateMuteButton();

// PWA Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(() => {
            // Service Worker optional – kein Fehler anzeigen
        });
    });
}

// Initialize Text-to-Speech (ResponsiveVoice)
window.addEventListener('load', () => {
    ttsManager.init();
});

// Ensure TTS is ready on first user interaction (iOS requirement)
document.addEventListener('click', () => {
    ttsManager.init();
}, { once: true });
