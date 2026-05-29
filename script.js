/* =============================================
   ZAHNPAKA – script.js
   Kindgerechte Zahnputz-App mit Alpi dem Alpaka
   ============================================= */

'use strict';

/* ---- APP-ZUSTAND ---- */
const state = {
    name: 'Held',
    buddy: localStorage.getItem('zahnpaka-buddy') || 'alpaka',
    timer: (typeof TOTAL_TIME === 'number') ? TOTAL_TIME : 180,
    interval: null,
    currentSegmentIndex: -1,
    isPaused: false,
    soundEnabled: localStorage.getItem('zahnpaka-sound') !== 'muted',
    introStep: 0,
    rewards: (typeof loadRewardData === 'function') ? loadRewardData() : null,
};

// Bildschirm, zu dem das Album beim Schließen zurückkehrt
let albumReturnScreen = 'screen-start';

let cachedAlpacaBrushEl = null;
let cachedMouthEl = null;
let cachedBuddyContainerBrushing = null;

/* ---- ZAHNPUTZ-PHASEN ---- */
// (Phasen sind jetzt in phase-utils.js definiert)

/* ---- LOB ----
   Lob ist jetzt rein visuell/akustisch (Buddy tanzt + Klang + Funkeln)
   und überschreibt NICHT mehr die eigentliche Anweisung in der Blase.
   Die Anweisung bleibt darum dauerhaft sichtbar. */

/* ---- ZAHNTEUFEL-INTRO-TEXTE ---- */
const introTexts = [
    {
        text: 'Die Zahnteufel wollen auf deinen Zähnen feiern! 😱\nAber wir lassen sie nicht rein!',
        dot:  0,
    },
    {
        text: '[BUDDY] erklärt: „Wir putzen, damit die Zahnteufel keine Party machen können!"',
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
    noiseBuffer: null,

    _ensureCtx() {
        if (!this.ctx) {
            try {
                this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {
                // Ignore
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
        }
    },

    _createNoiseBuffer() {
        if (!this.ctx) return null;
        const bufferSize = this.ctx.sampleRate * 2; // 2 Sekunden Puffer
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        return buffer;
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
        } catch (e) {
            console.warn('SoundManager Error:', e);
        }
    },

    scrub() {
        // Schrubb-Geräusch: Gefiltertes Rauschen
        if (!state.soundEnabled) return;
        this._ensureCtx();
        if (!this.ctx) return;

        if (!this.noiseBuffer) this.noiseBuffer = this._createNoiseBuffer();

        try {
            const src = this.ctx.createBufferSource();
            src.buffer = this.noiseBuffer;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = 1200;
            filter.Q.value = 1;

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

            src.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);

            src.start();
            src.stop(this.ctx.currentTime + 0.2);
        } catch(e) {
            console.warn('SoundManager Error:', e);
        }
    },

    fireworkBoom() {
        // Explosions-Geräusch
        if (!state.soundEnabled) return;
        this._ensureCtx();
        if (!this.ctx) return;

        if (!this.noiseBuffer) this.noiseBuffer = this._createNoiseBuffer();

        try {
            // Rauschen (Explosion)
            const src = this.ctx.createBufferSource();
            src.buffer = this.noiseBuffer;
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(600, this.ctx.currentTime);
            filter.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 1.0);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.0);

            src.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);
            src.start();
            src.stop(this.ctx.currentTime + 1.2);

            // Tiefer Sinus-Kick
            this._playTone(80, 0.5, 'sine', 0.2);
        } catch(e) {
            console.warn('SoundManager Error:', e);
        }
    },

    phaseStart() {
        this._playTone(523, 0.25);
        setTimeout(() => this._playTone(659, 0.3), 180);
    },

    praise() {
        [523, 587, 659, 784].forEach((f, i) =>
            setTimeout(() => this._playTone(f, 0.2, 'sine', 0.14), i * 100)
        );
    },

    celebration() {
        // Großes Fanfare für das Ende
        const melody = [
            523, 523, 523, 659, 784, 1047, // C E G C
            880, 1047, 1175, 1047          // A C D C
        ];
        const timing = [
            0, 150, 300, 500, 700, 900,
            1200, 1400, 1600, 2000
        ];

        melody.forEach((f, i) =>
            setTimeout(() => this._playTone(f, 0.2, 'triangle', 0.2), timing[i])
        );
    },

    giggle() {
        const notes = [800, 1000, 1200, 900];
        notes.forEach((f, i) =>
            setTimeout(() => this._playTone(f, 0.1, 'sine', 0.15), i * 80)
        );
    },

    tick() {
        this._playTone(440, 0.05, 'square', 0.04);
    },

    uiSelect() {
        this._playTone(600, 0.1, 'sine', 0.15);
    },
};

/* ============================================
   TEXT-TO-SPEECH MANAGER (Coqui/Piper WASM)
   Lokale Sprachsynthese im Browser - funktioniert
   offline und zuverlässig auf mobilen Geräten!
   ============================================ */

let piperReady = false;
let piperModule = null;
let currentAudio = null;

const ttsManager = {
    voiceId: 'de_DE-thorsten-medium',
    useFallback: false,

    // Initialisierung: Model herunterladen + Piper laden
    async init() {
        if (piperReady) return true;

        try {
            // Dynamischer Import von Piper TTS Web
            piperModule = await import('@mintplex-labs/piper-tts-web');

            // Model herunterladen/cachen
            await piperModule.downloadModelIfNeeded(this.voiceId);

            piperReady = true;
            return true;
        } catch (e) {
            console.warn('[Piper] Switching to Native TTS Fallback');
            this.useFallback = true;
            return false;
        }
    },

    // Sprachausgabe: Lokale Synthese + Playback
    async speak(text) {
        // Verwende sanitizeTTS aus tts-utils.js wenn verfügbar, sonst Fallback-Regex
        const clean = (typeof sanitizeTTS === 'function')
            ? sanitizeTTS(text)
            : text.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim();

        if (!clean || !state.soundEnabled) return;

        // Fallback-Check
        if (this.useFallback) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(clean);
            utterance.lang = 'de-DE';

            // Versuche eine deutsche Stimme zu finden
            const voices = window.speechSynthesis.getVoices();
            const deVoice = voices.find(v => v.lang.startsWith('de'));
            if (deVoice) utterance.voice = deVoice;

            window.speechSynthesis.speak(utterance);
            return;
        }

        if (!piperReady) {
            const initSuccess = await this.init();
            if (!initSuccess) {
                // Wenn Init fehlgeschlagen, ist useFallback jetzt wahr -> Rekursiver Aufruf
                if (this.useFallback) {
                    this.speak(text);
                    return;
                }
                return;
            }
        }

        // Vorherige Wiedergabe stoppen
        if (currentAudio) {
            currentAudio.pause();
            currentAudio = null;
        }

        try {
            // WASM-Synthese: Text → WAV-Audioformat
            const wav = await piperModule.predict({
                text: clean,
                voiceId: this.voiceId
            });

            // Blob → Audio-URL → Playback
            const audioUrl = URL.createObjectURL(wav);
            currentAudio = new Audio(audioUrl);
            currentAudio.play();

            // Cleanup nach Wiedergabe
            currentAudio.onended = () => {
                URL.revokeObjectURL(audioUrl);
                currentAudio = null;
            };

        } catch (e) {
            // Fallback bei Runtime-Fehler
            this.useFallback = true;
            this.speak(text);
        }
    },

    cancel() {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio = null;
        }
    },

    getStatus() {
        return {
            ready: piperReady,
            voiceId: this.voiceId,
            currentlyPlaying: currentAudio && !currentAudio.paused
        };
    }
};

// Exposieren für DevTools-Debugging
window.getTTSStatus = () => ttsManager.getStatus();

/* ============================================
   BUDDY-SYSTEM: Charakter-Auswahl
   ============================================ */

/* Rendert den gewählten Buddy in alle Screen-Container */
function renderBuddy() {
    cachedAlpacaBrushEl = null;

    // Fallback falls state.buddy ungültig ist (z.B. durch manipuliertes LocalStorage)
    if (!buddyInfo[state.buddy]) {
        state.buddy = 'alpaka';
    }

    const buddy = state.buddy;
    const info  = buddyInfo[buddy];

    const startEl  = document.getElementById('buddy-container-start');
    const brushEl  = document.getElementById('buddy-container-brushing');
    const finishEl = document.getElementById('buddy-container-finish');

    if (startEl)  startEl.innerHTML  = buddySvgs[buddy].idle;
    if (brushEl)  brushEl.innerHTML  = buddySvgs[buddy].brushing;
    if (finishEl) finishEl.innerHTML = buddySvgs[buddy].celebrate;

    // Begrüßungstext aktualisieren
    const greetEl = document.getElementById('buddy-greeting');
    if (greetEl) greetEl.textContent = info.greeting;

    // Kitzel-Interaktion hinzufügen
    if (brushEl) {
        // Entferne alte Listener (durch Klonen oder explizites Entfernen, hier Klonen einfacher)
        const newBrushEl = brushEl.cloneNode(true);
        brushEl.parentNode.replaceChild(newBrushEl, brushEl);
        cachedBuddyContainerBrushing = newBrushEl;

        // Listener hinzufügen
        newBrushEl.addEventListener('click', () => {
            triggerAlpacaReaction('giggle');
        });
    }

    // Buddy-Vorschau-Karten (Auswahl-Screen) befüllen
    ['alpaka', 'katze', 'huhn'].forEach(id => {
        const previewEl = document.getElementById('preview-' + id);
        if (previewEl) previewEl.innerHTML = buddySvgs[id].idle;
    });
}

/**
 * Aktualisiert die UI der Buddy-Auswahl-Karten basierend auf dem aktuellen Zustand.
 */
function updateBuddySelectionUI() {
    document.querySelectorAll('.buddy-card').forEach(card => {
        const isSelected = card.dataset.buddy === state.buddy;
        card.classList.toggle('selected', isSelected);
        card.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
    });
}

/* ============================================
   ALPAKA-EXPRESSION-SYSTEM
   ============================================ */
const expressions = {
    happy: {
        mouth: 'M 90 105 Q 100 120 110 105',
        eyeScale: '1',
    },
    encouraging: {
        mouth: 'M 92 108 Q 100 115 108 108',
        eyeScale: '1',
    },
    proud: {
        mouth: 'M 90 102 Q 100 118 110 102',
        eyeScale: '1',
    },
    surprised: {
        mouth: 'M 95 108 Q 100 116 105 108',
        eyeScale: '1.1',
    },
    neutral: {
        mouth: 'M 92 110 Q 100 112 108 110',
        eyeScale: '1',
    },
};

function setExpression(expressionName) {
    const expr = expressions[expressionName] || expressions.neutral;
    if (!cachedMouthEl || !cachedMouthEl.isConnected) {
        cachedMouthEl = document.getElementById('mouth-brushing');
    }
    const mouth = cachedMouthEl;
    if (!mouth) return;

    mouth.style.transition = 'opacity 0.08s ease';
    mouth.style.opacity = '0';
    setTimeout(() => {
        mouth.setAttribute('d', expr.mouth);
        mouth.style.opacity = '1';
    }, 80);
}

function triggerAlpacaReaction(type) {
    if (!cachedAlpacaBrushEl || !cachedAlpacaBrushEl.isConnected) {
        cachedAlpacaBrushEl = document.getElementById('alpaka-brushing');
    }
    const el = cachedAlpacaBrushEl;

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
    } else if (type === 'giggle') {
        el.classList.add('alpaka-giggle');
        soundManager.giggle();
        setExpression('happy');
    }

    el.addEventListener('animationend', () => {
        el.classList.remove('alpaka-dance', 'alpaka-proud', 'alpaka-excited', 'alpaka-giggle');
    }, { once: true });
}

/* ============================================
   SPRECHBLASE
   ============================================ */
let cachedSpeechBubble = null;
let cachedSpeechText   = null;

function setSpeechBubble(text) {
    if (!cachedSpeechBubble) cachedSpeechBubble = document.getElementById('speech-bubble');
    if (!cachedSpeechText)   cachedSpeechText   = document.getElementById('speech-text');

    const el     = cachedSpeechBubble;
    const textEl = cachedSpeechText;

    if (!el) return;
    el.classList.remove('bubble-new');
    void el.offsetWidth;
    if (textEl) {
        textEl.innerText = text;
    } else {
        el.innerText = text;
    }
    el.classList.add('bubble-new');
}

/* ============================================
   SCREEN-NAVIGATION
   ============================================ */
function showScreen(id) {
    const current = document.querySelector('.screen.active');

    // Konfetti aufräumen wenn Finish-Screen verlassen wird
    if (current && current.id === 'screen-finish') {
        const confettiContainer = document.getElementById('confetti-container');
        if (confettiContainer) confettiContainer.innerHTML = '';
    }

    const activate = () => {
        document.querySelectorAll('.screen').forEach(s => {
            s.classList.remove('active', 'screen-exit');
        });
        const target = document.getElementById(id);
        if (target) {
            target.classList.add('active');
            const btn = target.querySelector('button, input');
            if (btn) btn.focus();
        }
    };

    if (current && current.id !== id) {
        let done = false;
        const once = () => { if (!done) { done = true; activate(); } };
        current.classList.add('screen-exit');
        current.addEventListener('animationend', once, { once: true });
        // Fallback falls Animation nicht feuert (prefers-reduced-motion o.ä.)
        setTimeout(once, 300);
    } else {
        activate();
    }
}

/* ============================================
   FORTSCHRITTS-DOTS
   ============================================ */
// Ein Punkt je Putz-Schritt – aus dem Plan abgeleitet.
const TOTAL_DOTS = (typeof brushingPlan !== 'undefined') ? brushingPlan.length : 8;
let cachedProgressDots = [];

function initProgressDots() {
    cachedProgressDots = [];
    const container = document.getElementById('progress-dots');
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < TOTAL_DOTS; i++) {
        const dot = document.createElement('div');
        dot.className = 'progress-dot';
        dot.id = `dot-${i}`;
        container.appendChild(dot);
        cachedProgressDots.push(dot);
    }
    container.setAttribute('aria-valuemin', '0');
    container.setAttribute('aria-valuemax', String(TOTAL_DOTS));
    container.setAttribute('aria-valuenow', '0');
}

function updateProgressDots() {
    const elapsed = TOTAL_TIME - state.timer;
    const current = getSegmentIndexForElapsed(elapsed);
    const allDone = state.timer <= 0;
    const doneCount = allDone ? TOTAL_DOTS : current;

    const container = document.getElementById('progress-dots');
    if (container) container.setAttribute('aria-valuenow', String(doneCount));

    // Fallback falls Array leer ist (sollte via initProgressDots gefüllt sein)
    if (cachedProgressDots.length === 0) {
        for (let i = 0; i < TOTAL_DOTS; i++) {
            const dot = document.getElementById(`dot-${i}`);
            if (dot) cachedProgressDots.push(dot);
        }
    }

    for (let i = 0; i < TOTAL_DOTS; i++) {
        const dot = cachedProgressDots[i];
        if (!dot) continue;
        if (i < doneCount) {
            dot.className = 'progress-dot done';
            dot.textContent = '⭐';
        } else if (i === current && !allDone) {
            dot.className = 'progress-dot active';
            dot.textContent = '';
        } else {
            dot.className = 'progress-dot';
            dot.textContent = '';
        }
    }
}

/* ============================================
   ZAHN-SCHEMA: KIEFER MARKIEREN
   Markiert die zum Segment passende Reihe (oben/unten/beide).
   Das Label wird direkt aus dem Kiefer abgeleitet – nie mehr
   der alte Bug, bei dem phases.find() das falsche Label lieferte.
   ============================================ */
function highlightJaw(jaw) {
    const oben  = document.getElementById('zone-oben');
    const unten = document.getElementById('zone-unten');
    [oben, unten].forEach(el => { if (el) el.classList.remove('active-zone', 'done-zone'); });

    if ((jaw === 'oben'  || jaw === 'beide') && oben)  oben.classList.add('active-zone');
    if ((jaw === 'unten' || jaw === 'beide') && unten) unten.classList.add('active-zone');

    const zoneLabel = document.getElementById('zone-label');
    if (zoneLabel) zoneLabel.textContent = getJawLabel(jaw);
}

/* Bürsten-Animation auf den passenden Technik-/Flächen-Modus setzen. */
let cachedDemoBrush = null;
function setBrushMode(segment) {
    if (!cachedDemoBrush || !cachedDemoBrush.isConnected) {
        cachedDemoBrush = document.getElementById('demo-brush');
    }
    if (!cachedDemoBrush) return;
    cachedDemoBrush.className = 'demo-brush surf-' + segment.surface + ' tech-' + segment.technique;
}

/* ============================================
   SEGMENT-MANAGEMENT
   ============================================ */
function getCurrentSegmentIndex() {
    return getSegmentIndexForRemaining(state.timer);
}

/* Wendet ein Segment vollständig an: Überschrift (WAS+WO),
   Bewegungs-Tipp (WIE), Kiefer-Markierung, Bürsten-Bewegung,
   Mimik und Klang – alles aus EINER Quelle, also immer synchron. */
function applySegment(index) {
    const seg = brushingPlan[index];
    if (!seg) return;

    const instrEl = document.getElementById('instruction-text');
    if (instrEl) instrEl.textContent = seg.title;

    setSpeechBubble(getCueForSegment(index, 0));

    highlightJaw(seg.jaw);
    setBrushMode(seg);
    setExpression(seg.expression || 'encouraging');
    triggerAlpacaReaction('phaseChange');
    soundManager.phaseStart();
}

/* ============================================
   LOB – rein visuell/akustisch, ohne Text-Überschreiben
   ============================================ */
function cheer() {
    triggerAlpacaReaction('praise');  // Buddy ist stolz + Lob-Klang
    createSparkle();
    setTimeout(createSparkle, 120);
}

/* ============================================
   DISPLAY-UPDATE
   ============================================ */
function updateDisplay() {
    // Timer (zählt runter)
    const mins = Math.floor(state.timer / 60);
    const secs = state.timer % 60;
    const timerEl = document.getElementById('timer-display');
    if (timerEl) timerEl.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;

    const elapsed = TOTAL_TIME - state.timer;
    const segIdx = getSegmentIndexForElapsed(elapsed);

    // Segment-Wechsel? -> Überschrift, Tipp, Schema, Bürste, Mimik synchron neu setzen
    if (segIdx !== state.currentSegmentIndex) {
        state.currentSegmentIndex = segIdx;
        applySegment(segIdx);
    } else {
        // Innerhalb des Segments: nur den Bewegungs-Tipp sanft rotieren (bleibt on-message)
        const cue = getCueForSegment(segIdx, getElapsedInSegment(elapsed));
        const speechEl = document.getElementById('speech-text');
        if (speechEl && cue && speechEl.textContent !== cue) {
            setSpeechBubble(cue);
        }
    }

    // Fortschritts-Dots (ein Punkt je Segment)
    updateProgressDots();

    // Zahn sauber putzen – segment-/fortschrittsbasiert, keine magischen Zahlen
    updateToothCleanliness(elapsed, segIdx);

    // Lob alle 20 s – rein visuell, überschreibt die Anweisung nicht
    if (state.timer > 5 && state.timer < TOTAL_TIME && state.timer % 20 === 0) {
        cheer();
    }
    // Sanfter Tick alle 30 s
    if (state.timer % 30 === 0 && state.timer > 0) {
        soundManager.tick();
    }
}

/* Belag & Funkeln aus Gesamtfortschritt und aktuellem Segment ableiten. */
function updateToothCleanliness(elapsed, segIdx) {
    const overall = elapsed / TOTAL_TIME; // 0..1
    const seg = brushingPlan[segIdx];
    const dirtGeneral  = document.getElementById('tooth-dirt-general');
    const dirtStubborn = document.getElementById('tooth-dirt-stubborn');
    const sparklesEl   = document.getElementById('tooth-sparkles');

    // Allgemeiner Belag: gleichmäßig ausblenden, bei ~85% komplett sauber
    if (dirtGeneral) {
        dirtGeneral.style.opacity = Math.max(0, 1 - overall / 0.85);
    }

    // Hartnäckige Teufel: sitzen bis zur Jagd, werden DORT bejagt, sind beim Ausspucken weg
    if (dirtStubborn) {
        if (seg && seg.id === 'jagd') {
            dirtStubborn.style.opacity = Math.max(0, 0.8 * (1 - getSegmentProgress(elapsed)));
            dirtStubborn.classList.add('dirt-pulse');
        } else if (seg && seg.id === 'spucken') {
            dirtStubborn.style.opacity = 0;
            dirtStubborn.classList.remove('dirt-pulse');
        } else {
            dirtStubborn.style.opacity = 0.8;
            dirtStubborn.classList.remove('dirt-pulse');
        }
    }

    // Funkeln im Endspurt (Ausspucken)
    if (sparklesEl) {
        sparklesEl.style.opacity = (seg && seg.id === 'spucken') ? 1 : 0;
    }
}

/* ============================================
   ZAHNPUTZEN STARTEN
   ============================================ */
function startTimerLoop() {
    if (state.interval) clearInterval(state.interval);

    const loopStartTime  = Date.now();
    const loopStartTimer = state.timer;
    let lastSecond = loopStartTimer;

    // Alle 200ms prüfen – vermeidet Drift durch setInterval-Ungenauigkeit
    state.interval = setInterval(() => {
        if (state.isPaused) return;

        const elapsed = Math.floor((Date.now() - loopStartTime) / 1000);
        const remaining = loopStartTimer - elapsed;

        if (remaining === lastSecond) return; // Noch keine neue Sekunde
        lastSecond = remaining;
        state.timer = Math.max(remaining, 0);

        updateDisplay();

        if (state.timer > 0) {
            setTimeout(() => createSparkle(), 100);
            setTimeout(() => createSparkle(), 400);
            setTimeout(() => createSparkle(), 700);
        }

        if (state.timer <= 0) {
            clearInterval(state.interval);
            state.interval = null;
            finish();
        }
    }, 200);
}

function togglePause() {
    state.isPaused = !state.isPaused;
    const btn = document.getElementById('btn-pause');

    if (state.isPaused) {
        // PAUSE
        if (state.interval) clearInterval(state.interval);
        ttsManager.cancel();
        document.body.classList.add('is-paused');
        if (btn) {
            btn.textContent = '▶️';
            btn.setAttribute('aria-label', 'Weiter');
            btn.classList.add('active');
        }
    } else {
        // WEITER
        document.body.classList.remove('is-paused');
        startTimerLoop();
        if (btn) {
            btn.textContent = '⏸️';
            btn.setAttribute('aria-label', 'Pause');
            btn.classList.remove('active');
        }
    }
}

function startBrushing() {
    state.timer = TOTAL_TIME;
    state.currentSegmentIndex = -1;
    state.isPaused = false;
    document.body.classList.remove('is-paused'); // Sicherstellen, dass Pause weg ist

    // Pause-Button anzeigen
    const btnPause = document.getElementById('btn-pause');
    if (btnPause) {
        btnPause.style.display = 'flex';
        btnPause.textContent = '⏸️';
        btnPause.setAttribute('aria-label', 'Pause');
        btnPause.classList.remove('active');
    }

    initProgressDots();
    setExpression('encouraging');

    // Erster Aufruf setzt Segment 0 (updateDisplay erkennt den Wechsel von -1)
    // und füllt Überschrift, Sprechblase, Schema und Bürste synchron.
    updateDisplay();
    startTimerLoop();
}

/* ============================================
   ABSCHLUSS
   ============================================ */
function finish() {
    // Pause-Button verstecken
    const btnPause = document.getElementById('btn-pause');
    if (btnPause) btnPause.style.display = 'none';

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

    // Belohnung verbuchen: Serie aktualisieren, Sticker vergeben, speichern
    if (typeof recordBrushing === 'function' && state.rewards) {
        const { data, newStickers, streakInfo } = recordBrushing(state.rewards);
        state.rewards = data;
        saveRewardData(data);
        renderRewardReveal(newStickers, streakInfo);
        renderStreakBadge();
    }

    showScreen('screen-finish');
    soundManager.celebration();
    spawnConfetti();
}

/* ============================================
   SPARKLES (PUTZ-EFFEKT)
   ============================================ */
function createSparkle() {
    let container = cachedBuddyContainerBrushing;
    if (!container || !container.isConnected) {
        container = document.getElementById('buddy-container-brushing');
        cachedBuddyContainerBrushing = container;
    }

    if (!container) return;

    // Sound
    soundManager.scrub();

    // Sparkle relativ zum Mund-Bereich
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';

    // Zufällige Position um den Mund herum (zentral im SVG)
    // SVG ist ca 200x220, Mund ist bei ~100,100
    // Wir positionieren absolut im Container
    // Container ist relative, Größe passt sich an.
    // Wir nutzen % für grobe Positionierung
    const offsetX = 50 + (Math.random() * 20 - 10);
    const offsetY = 45 + (Math.random() * 15 - 7);

    sparkle.style.left = `${offsetX}%`;
    sparkle.style.top  = `${offsetY}%`;

    // Zufällige Farbe (Gold, Weiß, Hellblau)
    const colors = ['#FFD700', '#FFFFFF', '#A3D8F4'];
    sparkle.style.background = `radial-gradient(circle, #fff 0%, ${colors[Math.floor(Math.random()*colors.length)]} 80%)`;

    container.appendChild(sparkle);

    // Cleanup
    setTimeout(() => {
        if (sparkle.parentNode) sparkle.parentNode.removeChild(sparkle);
    }, 1000);
}

/* ============================================
   KONFETTI & FEUERWERK
   ============================================ */
function spawnFirework(delay = 0) {
    setTimeout(() => {
        const container = document.getElementById('confetti-container');
        if (!container) return;

        soundManager.fireworkBoom();

        const centerX = 20 + Math.random() * 60; // 20-80% Breite
        const centerY = 15 + Math.random() * 40; // 15-55% Höhe
        const color = ['#FFD700', '#FF6B6B', '#4A90E2', '#90EE90', '#DDA0DD'][Math.floor(Math.random() * 5)];

        const fragment = document.createDocumentFragment();
        for (let i = 0; i < 24; i++) {
            const p = document.createElement('div');
            p.className = 'firework-particle';
            p.style.left = centerX + '%';
            p.style.top = centerY + '%';
            p.style.backgroundColor = color;

            // Zufalls-Richtung
            const angle = Math.random() * Math.PI * 2;
            const velocity = 60 + Math.random() * 100; // Pixel Distanz

            p.style.setProperty('--tx', Math.cos(angle) * velocity + 'px');
            p.style.setProperty('--ty', Math.sin(angle) * velocity + 'px');

            fragment.appendChild(p);

            // Cleanup pro Partikel
            setTimeout(() => p.remove(), 1200);
        }
        container.appendChild(fragment);
    }, delay);
}

function spawnConfetti() {
    const container = document.getElementById('confetti-container');
    if (!container) return;
    container.innerHTML = '';

    // 1. Konfetti Regen
    const colors  = ['#A3D8F4', '#FFB6C1', '#FFD700', '#90EE90', '#DDA0DD', '#FFA07A'];
    const count   = 50;
    const fragment = document.createDocumentFragment();

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
        fragment.appendChild(piece);
    }
    container.appendChild(fragment);

    // 2. Feuerwerk-Sequenz
    spawnFirework(200);
    spawnFirework(800);
    spawnFirework(1500);
    spawnFirework(2200);
    spawnFirework(3000);

    // Cleanup alles
    setTimeout(() => { container.innerHTML = ''; }, 5000);
}

/* ============================================
   ZAHNTEUFEL-INTRO
   ============================================ */
function showIntroStep(step) {
    const data = introTexts[step];
    if (!data) return;

    document.getElementById('intro-text').textContent = data.text.replace('[BUDDY]', buddyInfo[state.buddy].name);

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
   BELOHNUNGSWELT: STREAK & STICKER
   ============================================ */

function setRewardText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

/* Streak-Badge auf dem Start-Screen aktualisieren (zeigt aktive Serie + Sticker). */
function renderStreakBadge() {
    const badge = document.getElementById('streak-badge');
    if (!badge || !state.rewards) return;

    const hasProgress = state.rewards.totalSessions > 0;
    badge.style.display = hasProgress ? 'inline-flex' : 'none';
    if (!hasProgress) return;

    const streak = getActiveStreak(state.rewards);
    const stickers = state.rewards.stickers.length;
    setRewardText('streak-count', streak);
    setRewardText('sticker-count', stickers);
    // Aussagekräftiger Name für Screenreader; enthält den sichtbaren Text ("Tage")
    badge.setAttribute('aria-label',
        `Meine Sammlung ansehen: ${streak} Tage in Folge, ${stickers} Sticker`);
}

/* Das komplette Sammel-Album rendern. */
function renderAlbum() {
    if (!state.rewards) return;
    const r = state.rewards;
    const today = getDateString();

    setRewardText('album-streak',  getActiveStreak(r, today));
    setRewardText('album-longest', r.longestStreak);
    setRewardText('album-total',   r.totalSessions);

    // Wochenkalender
    const weekEl = document.getElementById('album-week');
    if (weekEl) {
        weekEl.innerHTML = '';
        getWeekStatus(r.history, today).forEach(day => {
            const cell = document.createElement('div');
            cell.className = 'album-day' + (day.done ? ' done' : '') + (day.isToday ? ' today' : '');
            const label = document.createElement('span');
            label.className = 'album-day-label';
            label.textContent = day.label;
            const dot = document.createElement('span');
            dot.className = 'album-day-dot';
            dot.setAttribute('aria-hidden', 'true');
            dot.textContent = day.done ? '⭐' : '';
            cell.appendChild(label);
            cell.appendChild(dot);
            weekEl.appendChild(cell);
        });
    }

    // Sticker-Sammlung
    const catalog = getStickerCatalog();
    const owned = new Set(r.stickers);
    setRewardText('album-collected', r.stickers.length);
    setRewardText('album-total-stickers', catalog.length);

    const grid = document.getElementById('album-stickers');
    if (grid) {
        grid.innerHTML = '';
        catalog.forEach(s => {
            const isOwned = owned.has(s.id);
            const cell = document.createElement('div');
            cell.className = 'album-sticker ' +
                (isOwned ? 'owned' : 'locked') +
                (s.type === 'milestone' ? ' milestone' : '');
            cell.setAttribute('role', 'img');

            let ariaLabel;
            if (isOwned) {
                ariaLabel = `${s.name} – gesammelt`;
            } else if (s.type === 'milestone') {
                ariaLabel = `${s.name} – noch gesperrt. So schaltest du ihn frei: ${s.hint}`;
            } else {
                ariaLabel = `${s.name} – noch nicht gesammelt`;
            }
            cell.setAttribute('aria-label', ariaLabel);
            cell.title = ariaLabel;

            const emoji = document.createElement('span');
            emoji.className = 'album-sticker-emoji';
            emoji.setAttribute('aria-hidden', 'true');
            emoji.textContent = s.emoji;

            const name = document.createElement('span');
            name.className = 'album-sticker-name';
            name.textContent = s.name;

            cell.appendChild(emoji);
            cell.appendChild(name);
            grid.appendChild(cell);
        });
    }
}

function openAlbum(fromId) {
    albumReturnScreen = fromId || 'screen-start';

    // Primär-Button kontextabhängig beschriften
    const backBtn = document.getElementById('btn-album-back');
    if (backBtn) {
        backBtn.textContent = (albumReturnScreen === 'screen-finish')
            ? '🔄 Nochmal putzen!'
            : '⬅️ Zurück';
    }

    renderAlbum();
    showScreen('screen-album');
    soundManager.uiSelect();
}

function closeAlbum() {
    if (albumReturnScreen === 'screen-finish') {
        // Vom Finish aus: frischer Durchgang
        if (state.interval) { clearInterval(state.interval); state.interval = null; }
        location.reload();
        return;
    }
    renderStreakBadge();
    showScreen(albumReturnScreen);
}

/* Sticker-Enthüllung auf dem Finish-Screen aufbauen. */
function renderRewardReveal(newStickers, streakInfo) {
    const el = document.getElementById('reward-reveal');
    if (!el) return;
    el.innerHTML = '';

    // Serien-Zeile
    const streakLine = document.createElement('div');
    streakLine.className = 'reward-streak-line';
    const dayWord = streakInfo.streak === 1 ? 'Tag' : 'Tage';
    streakLine.append(`🔥 ${streakInfo.streak} ${dayWord} in Folge!`);
    if (streakInfo.isNewRecord) {
        const rec = document.createElement('span');
        rec.className = 'reward-record';
        rec.textContent = '🏆 Neuer Rekord!';
        streakLine.appendChild(rec);
    }
    el.appendChild(streakLine);

    // Neue Sticker (max. 4 Karten, damit nichts überläuft)
    if (newStickers && newStickers.length > 0) {
        const wrap = document.createElement('div');
        wrap.className = 'reward-new-stickers';

        newStickers.slice(0, 4).forEach(s => {
            const isMilestone = s.type === 'milestone';
            const card = document.createElement('div');
            card.className = 'reward-sticker-card' + (isMilestone ? ' milestone' : '');
            card.setAttribute('aria-label',
                `${isMilestone ? 'Neue Trophäe' : 'Neuer Sticker'}: ${s.name}`);

            const badge = document.createElement('span');
            badge.className = 'reward-sticker-badge';
            badge.textContent = isMilestone ? 'Trophäe!' : 'Neu!';

            const emoji = document.createElement('span');
            emoji.className = 'reward-sticker-emoji';
            emoji.setAttribute('aria-hidden', 'true');
            emoji.textContent = s.emoji;

            const name = document.createElement('span');
            name.className = 'reward-sticker-name';
            name.textContent = s.name;

            card.appendChild(badge);
            card.appendChild(emoji);
            card.appendChild(name);
            wrap.appendChild(card);
        });
        el.appendChild(wrap);

        // Fröhlicher Sticker-Sound nach der Fanfare
        setTimeout(() => soundManager.giggle(), 700);
    }
}

/* ============================================
   EVENT-LISTENER
   ============================================ */

// Pause-Button
const btnPause = document.getElementById('btn-pause');
if (btnPause) {
    btnPause.addEventListener('click', () => {
        if (state.timer > 0) togglePause();
    });
}

// Mute-Button
document.getElementById('btn-mute').addEventListener('click', () => {
    state.soundEnabled = !state.soundEnabled;
    localStorage.setItem('zahnpaka-sound', state.soundEnabled ? 'on' : 'muted');
    updateMuteButton();
    // AudioContext initialisieren (User-Geste erforderlich)
    soundManager._ensureCtx();
});

// Download-Screen anzeigen und Model laden
async function showDownloadScreen() {
    showScreen('screen-download');

    // Versuche Piper zu initialisieren
    try {
        const success = await ttsManager.init();
        if (success) {
            // Model geladen - zu Buddy-Auswahl
            setTimeout(() => {
                updateBuddySelectionUI();
                showScreen('screen-buddy');
            }, 500);
        } else {
            // Fehler - aber trotzdem weiter (Fallback)
            setTimeout(() => {
                updateBuddySelectionUI();
                showScreen('screen-buddy');
            }, 2000);
        }
    } catch (e) {
        // Fallback: Trotzdem weiter
        setTimeout(() => {
            updateBuddySelectionUI();
            showScreen('screen-buddy');
        }, 2000);
    }
}

// Start-Button → Model-Download-Screen
document.getElementById('btn-start').addEventListener('click', async () => {
    const nameInput = document.getElementById('child-name').value.trim();
    if (nameInput) state.name = nameInput;
    soundManager._ensureCtx();

    // Zeige Download-Screen und lade Model
    await showDownloadScreen();
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

// Belohnungswelt: Album öffnen/schließen
const streakBadge = document.getElementById('streak-badge');
if (streakBadge) streakBadge.addEventListener('click', () => openAlbum('screen-start'));

const btnAlbumClose = document.getElementById('btn-album-close');
if (btnAlbumClose) btnAlbumClose.addEventListener('click', closeAlbum);

const btnAlbumBack = document.getElementById('btn-album-back');
if (btnAlbumBack) btnAlbumBack.addEventListener('click', closeAlbum);

const btnFinishAlbum = document.getElementById('btn-finish-album');
if (btnFinishAlbum) btnFinishAlbum.addEventListener('click', () => openAlbum('screen-finish'));

/* ============================================
   INIT
   ============================================ */
updateMuteButton();

// PWA Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(() => {});
    });
}

// Buddy-Karten: Klick-Handler
document.querySelectorAll('.buddy-card').forEach(card => {
    card.addEventListener('click', () => {
        state.buddy = card.dataset.buddy;
        updateBuddySelectionUI();
        soundManager.uiSelect();
    });
});

// Buddy-Bestätigung
document.getElementById('btn-buddy-confirm').addEventListener('click', () => {
    localStorage.setItem('zahnpaka-buddy', state.buddy);
    renderBuddy();
    showScreen('screen-intro');
    state.introStep = 0;
    showIntroStep(0);
});

// Click-to-Speak: Klick auf jede Sprechblase liest den Text vor
// Der Klick selbst entsperrt das Audio auf Mobile (Browser-Pflicht erfüllt)
function setupBubbleListeners() {
    document.querySelectorAll('.bubble').forEach(bubble => {
        bubble.style.cursor = 'pointer';
        bubble.addEventListener('click', () => {
            // Text aus Span-Elementen auslesen
            const textEl = bubble.querySelector('#speech-text') || bubble.querySelector('#intro-text');
            const text = textEl ? textEl.textContent : bubble.textContent;
            ttsManager.speak(text);
        });
    });
}

// Initial Setup
setupBubbleListeners();

// Initiales Rendering des gespeicherten Buddys
renderBuddy();

// Belohnungs-Badge auf dem Start-Screen anzeigen (falls schon geputzt wurde)
renderStreakBadge();

// Deep-Link aus dem App-Shortcut: ?go=album öffnet direkt die Sammlung
try {
    if (new URLSearchParams(location.search).get('go') === 'album') {
        openAlbum('screen-start');
    }
} catch (e) { /* URLSearchParams nicht verfügbar – ignorieren */ }
