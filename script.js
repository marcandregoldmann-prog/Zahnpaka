/* =============================================
   ZAHNPAKA – script.js
   Kindgerechte Zahnputz-App mit Alpi dem Alpaka
   ============================================= */

'use strict';

/* ---- APP-ZUSTAND ---- */
const state = {
    name: 'Held',
    buddy: localStorage.getItem('zahnpaka-buddy') || 'alpaka',
    timer: 180,
    interval: null,
    currentPhaseIndex: -1,
    soundEnabled: localStorage.getItem('zahnpaka-sound') !== 'muted',
    introStep: 0,
};

let cachedAlpacaBrushEl = null;
let cachedMouthEl = null;

/* ---- ZAHNPUTZ-PHASEN ---- */
// (Phasen sind jetzt in phase-utils.js definiert)

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
        `${name}, dein Freund ist so stolz! ❤️`,
    ],
};

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
        } catch (e) {}
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
        } catch(e) {}
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
        } catch(e) {}
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
            console.log('[TTS-Native] Speaking:', clean);
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

const buddyInfo = {
    alpaka: { name: 'Alpi',  greeting: 'Hallo! Ich bin Alpi! 🦙' },
    katze:  { name: 'Mia',   greeting: 'Hallo! Ich bin Mia! 🐱'  },
    huhn:   { name: 'Hanna', greeting: 'Hallo! Ich bin Hanna! 🐔' },
};

/* Alle 9 Charakter-SVGs (3 Charaktere × 3 Varianten) */
const buddySvgs = {
    alpaka: {
        idle: `<svg viewBox="0 0 200 220" class="alpaka-svg" aria-label="Alpaka Alpi" role="img">
<ellipse cx="100" cy="85" rx="55" ry="50" fill="#FFF5E1"/>
<path d="M 60 220 Q 50 160 70 140 L 80 100 Q 80 80 80 80" fill="none" stroke="#FFF5E1" stroke-width="40" stroke-linecap="round"/>
<path d="M 140 220 Q 150 160 130 140 L 120 100 Q 120 80 120 80" fill="none" stroke="#FFF5E1" stroke-width="40" stroke-linecap="round"/>
<rect x="70" y="130" width="60" height="90" fill="#FFF5E1"/>
<ellipse cx="65" cy="50" rx="12" ry="20" fill="#FFF5E1" transform="rotate(-20 65 50)"/>
<ellipse cx="135" cy="50" rx="12" ry="20" fill="#FFF5E1" transform="rotate(20 135 50)"/>
<path d="M 90 40 Q 100 25 110 40" fill="#FFF5E1" stroke="#E6DCC8" stroke-width="2"/>
<circle cx="70" cy="95" r="8" fill="#FFB6C1" opacity="0.6"/>
<circle cx="130" cy="95" r="8" fill="#FFB6C1" opacity="0.6"/>
<g class="buddy-eye">
<circle cx="80" cy="80" r="6" fill="#333"/>
<circle cx="82" cy="78" r="2" fill="#fff"/>
</g>
<g class="buddy-eye">
<circle cx="120" cy="80" r="6" fill="#333"/>
<circle cx="118" cy="78" r="2" fill="#fff"/>
</g>
<ellipse cx="100" cy="100" rx="18" ry="12" fill="#FFF0D5"/>
<path d="M 96 97 Q 100 100 104 97" fill="none" stroke="#D4A86A" stroke-width="2" stroke-linecap="round"/>
<path d="M 94 105 Q 100 110 106 105" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round"/>
</svg>`,
        brushing: `<svg id="alpaka-brushing" viewBox="0 0 200 220" class="alpaka-svg alpaka-large" aria-label="Alpi motiviert dich" role="img">
<ellipse cx="100" cy="85" rx="55" ry="50" fill="#FFF5E1"/>
<path d="M 60 220 Q 50 160 70 140 L 80 100" fill="none" stroke="#FFF5E1" stroke-width="40" stroke-linecap="round"/>
<path d="M 140 220 Q 150 160 130 140 L 120 100" fill="none" stroke="#FFF5E1" stroke-width="40" stroke-linecap="round"/>
<rect x="70" y="130" width="60" height="90" fill="#FFF5E1"/>
<ellipse cx="65" cy="50" rx="12" ry="20" fill="#FFF5E1" transform="rotate(-20 65 50)"/>
<ellipse cx="135" cy="50" rx="12" ry="20" fill="#FFF5E1" transform="rotate(20 135 50)"/>
<path d="M 90 40 Q 100 25 110 40" fill="#FFF5E1" stroke="#E6DCC8" stroke-width="2"/>
<circle cx="70" cy="95" r="8" fill="#FFB6C1" opacity="0.6"/>
<circle cx="130" cy="95" r="8" fill="#FFB6C1" opacity="0.6"/>
<g class="buddy-eye">
<circle cx="80" cy="80" r="6" fill="#333"/>
<circle cx="82" cy="78" r="2" fill="#fff"/>
</g>
<g class="buddy-eye">
<circle cx="120" cy="80" r="6" fill="#333"/>
<circle cx="118" cy="78" r="2" fill="#fff"/>
</g>
<ellipse cx="100" cy="100" rx="18" ry="12" fill="#FFF0D5"/>
<path d="M 96 97 Q 100 100 104 97" fill="none" stroke="#D4A86A" stroke-width="2" stroke-linecap="round"/>
<path id="mouth-brushing" d="M 90 105 Q 100 115 110 105" fill="none" stroke="#333" stroke-width="2.5" stroke-linecap="round"/>
<rect x="145" y="90" width="10" height="80" rx="5" fill="#A3D8F4" transform="rotate(15 150 130)"/>
<rect x="142" y="80" width="16" height="25" rx="4" fill="#FFF" transform="rotate(15 150 130)"/>
<rect x="144" y="82" width="12" height="10" rx="2" fill="#4A90E2" opacity="0.3" transform="rotate(15 150 130)"/>
</svg>`,
        celebrate: `<svg viewBox="0 0 200 220" class="alpaka-svg alpaka-celebrate" aria-label="Alpi feiert!" role="img">
<ellipse cx="100" cy="85" rx="55" ry="50" fill="#FFF5E1"/>
<path d="M 60 220 Q 50 160 70 140 L 80 100" fill="none" stroke="#FFF5E1" stroke-width="40" stroke-linecap="round"/>
<path d="M 140 220 Q 150 160 130 140 L 120 100" fill="none" stroke="#FFF5E1" stroke-width="40" stroke-linecap="round"/>
<rect x="70" y="130" width="60" height="90" fill="#FFF5E1"/>
<ellipse cx="65" cy="50" rx="12" ry="20" fill="#FFF5E1" transform="rotate(-20 65 50)"/>
<ellipse cx="135" cy="50" rx="12" ry="20" fill="#FFF5E1" transform="rotate(20 135 50)"/>
<path d="M 90 40 Q 100 25 110 40" fill="#FFF5E1" stroke="#E6DCC8" stroke-width="2"/>
<circle cx="70" cy="95" r="8" fill="#FFB6C1" opacity="0.6"/>
<circle cx="130" cy="95" r="8" fill="#FFB6C1" opacity="0.6"/>
<g class="buddy-eye">
<path d="M 74 80 Q 80 75 86 80" fill="none" stroke="#333" stroke-width="2.5" stroke-linecap="round"/>
</g>
<g class="buddy-eye">
<path d="M 114 80 Q 120 75 126 80" fill="none" stroke="#333" stroke-width="2.5" stroke-linecap="round"/>
</g>
<path d="M 90 100 Q 100 115 110 100" fill="none" stroke="#333" stroke-width="2.5" stroke-linecap="round"/>
<text x="30" y="60" font-size="28">✨</text>
<text x="145" y="60" font-size="28">✨</text>
</svg>`,
    },

    katze: {
        idle: `<svg viewBox="0 0 200 220" class="alpaka-svg" aria-label="Katze Mia" role="img">
<ellipse cx="100" cy="150" rx="50" ry="60" fill="#FFCC80"/>
<path d="M 60 70 L 60 40 L 90 60" fill="#FFCC80" stroke="#E6B870" stroke-width="2" stroke-linejoin="round"/>
<path d="M 140 70 L 140 40 L 110 60" fill="#FFCC80" stroke="#E6B870" stroke-width="2" stroke-linejoin="round"/>
<ellipse cx="100" cy="85" rx="55" ry="48" fill="#FFCC80"/>
<path d="M 68 50 L 72 65 L 82 60" fill="#FFB6C1"/>
<path d="M 132 50 L 128 65 L 118 60" fill="#FFB6C1"/>
<g class="buddy-eye">
<ellipse cx="80" cy="80" rx="8" ry="10" fill="#FFF"/>
<circle cx="80" cy="80" r="3" fill="#333"/>
</g>
<g class="buddy-eye">
<ellipse cx="120" cy="80" rx="8" ry="10" fill="#FFF"/>
<circle cx="120" cy="80" r="3" fill="#333"/>
</g>
<circle cx="100" cy="95" r="4" fill="#FFB6C1"/>
<line x1="60" y1="90" x2="85" y2="92" stroke="#FFF" stroke-width="2" opacity="0.6"/>
<line x1="60" y1="98" x2="85" y2="96" stroke="#FFF" stroke-width="2" opacity="0.6"/>
<line x1="140" y1="90" x2="115" y2="92" stroke="#FFF" stroke-width="2" opacity="0.6"/>
<line x1="140" y1="98" x2="115" y2="96" stroke="#FFF" stroke-width="2" opacity="0.6"/>
<path d="M 94 105 Q 100 110 106 105" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round"/>
<ellipse cx="100" cy="170" rx="30" ry="25" fill="#FFE0B2"/>
</svg>`,
        brushing: `<svg id="alpaka-brushing" viewBox="0 0 200 220" class="alpaka-svg alpaka-large" aria-label="Mia putzt Zähne" role="img">
<ellipse cx="100" cy="150" rx="50" ry="60" fill="#FFCC80"/>
<path d="M 60 70 L 60 40 L 90 60" fill="#FFCC80" stroke="#E6B870" stroke-width="2" stroke-linejoin="round"/>
<path d="M 140 70 L 140 40 L 110 60" fill="#FFCC80" stroke="#E6B870" stroke-width="2" stroke-linejoin="round"/>
<ellipse cx="100" cy="85" rx="55" ry="48" fill="#FFCC80"/>
<path d="M 68 50 L 72 65 L 82 60" fill="#FFB6C1"/>
<path d="M 132 50 L 128 65 L 118 60" fill="#FFB6C1"/>
<g class="buddy-eye">
<ellipse cx="80" cy="80" rx="8" ry="10" fill="#FFF"/>
<circle cx="80" cy="80" r="3" fill="#333"/>
</g>
<g class="buddy-eye">
<ellipse cx="120" cy="80" rx="8" ry="10" fill="#FFF"/>
<circle cx="120" cy="80" r="3" fill="#333"/>
</g>
<circle cx="100" cy="95" r="4" fill="#FFB6C1"/>
<line x1="60" y1="90" x2="85" y2="92" stroke="#FFF" stroke-width="2" opacity="0.6"/>
<line x1="60" y1="98" x2="85" y2="96" stroke="#FFF" stroke-width="2" opacity="0.6"/>
<line x1="140" y1="90" x2="115" y2="92" stroke="#FFF" stroke-width="2" opacity="0.6"/>
<line x1="140" y1="98" x2="115" y2="96" stroke="#FFF" stroke-width="2" opacity="0.6"/>
<path id="mouth-brushing" d="M 90 105 Q 100 115 110 105" fill="none" stroke="#333" stroke-width="2.5" stroke-linecap="round"/>
<rect x="145" y="90" width="10" height="80" rx="5" fill="#A3D8F4" transform="rotate(15 150 130)"/>
<rect x="142" y="80" width="16" height="25" rx="4" fill="#FFF" transform="rotate(15 150 130)"/>
<rect x="144" y="82" width="12" height="10" rx="2" fill="#4A90E2" opacity="0.3" transform="rotate(15 150 130)"/>
</svg>`,
        celebrate: `<svg viewBox="0 0 200 220" class="alpaka-svg alpaka-celebrate" aria-label="Mia feiert!" role="img">
<ellipse cx="100" cy="150" rx="50" ry="60" fill="#FFCC80"/>
<path d="M 60 70 L 60 40 L 90 60" fill="#FFCC80" stroke="#E6B870" stroke-width="2" stroke-linejoin="round"/>
<path d="M 140 70 L 140 40 L 110 60" fill="#FFCC80" stroke="#E6B870" stroke-width="2" stroke-linejoin="round"/>
<ellipse cx="100" cy="85" rx="55" ry="48" fill="#FFCC80"/>
<path d="M 68 50 L 72 65 L 82 60" fill="#FFB6C1"/>
<path d="M 132 50 L 128 65 L 118 60" fill="#FFB6C1"/>
<g class="buddy-eye">
<path d="M 74 80 Q 80 75 86 80" fill="none" stroke="#333" stroke-width="2.5" stroke-linecap="round"/>
</g>
<g class="buddy-eye">
<path d="M 114 80 Q 120 75 126 80" fill="none" stroke="#333" stroke-width="2.5" stroke-linecap="round"/>
</g>
<circle cx="100" cy="95" r="4" fill="#FFB6C1"/>
<path d="M 90 100 Q 100 115 110 100" fill="none" stroke="#333" stroke-width="2.5" stroke-linecap="round"/>
<path d="M 50 150 L 30 130" fill="none" stroke="#FFCC80" stroke-width="12" stroke-linecap="round"/>
<path d="M 150 150 L 170 130" fill="none" stroke="#FFCC80" stroke-width="12" stroke-linecap="round"/>
<text x="30" y="60" font-size="28">✨</text>
<text x="145" y="60" font-size="28">✨</text>
</svg>`,
    },

    huhn: {
        idle: `<svg viewBox="0 0 200 220" class="alpaka-svg" aria-label="Huhn Hanna" role="img">
<circle cx="100" cy="110" r="60" fill="#FFFACD"/>
<circle cx="100" cy="50" r="10" fill="#FF6B6B"/>
<circle cx="85" cy="55" r="8" fill="#FF6B6B"/>
<circle cx="115" cy="55" r="8" fill="#FF6B6B"/>
<g class="buddy-eye">
<circle cx="80" cy="80" r="5" fill="#333"/>
<circle cx="82" cy="78" r="2" fill="#fff"/>
</g>
<g class="buddy-eye">
<circle cx="120" cy="80" r="5" fill="#333"/>
<circle cx="118" cy="78" r="2" fill="#fff"/>
</g>
<path d="M 92 92 L 100 104 L 108 92" fill="#FFA500" stroke="#E69500" stroke-width="1" stroke-linejoin="round"/>
<circle cx="70" cy="95" r="6" fill="#FFB6C1" opacity="0.6"/>
<circle cx="130" cy="95" r="6" fill="#FFB6C1" opacity="0.6"/>
<path d="M 94 108 Q 100 112 106 108" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round"/>
<path d="M 80 160 L 70 180" fill="none" stroke="#FFA500" stroke-width="4" stroke-linecap="round"/>
<path d="M 70 180 L 60 185" fill="none" stroke="#FFA500" stroke-width="4" stroke-linecap="round"/>
<path d="M 70 180 L 70 188" fill="none" stroke="#FFA500" stroke-width="4" stroke-linecap="round"/>
<path d="M 70 180 L 80 185" fill="none" stroke="#FFA500" stroke-width="4" stroke-linecap="round"/>
<path d="M 120 160 L 130 180" fill="none" stroke="#FFA500" stroke-width="4" stroke-linecap="round"/>
<path d="M 130 180 L 120 185" fill="none" stroke="#FFA500" stroke-width="4" stroke-linecap="round"/>
<path d="M 130 180 L 130 188" fill="none" stroke="#FFA500" stroke-width="4" stroke-linecap="round"/>
<path d="M 130 180 L 140 185" fill="none" stroke="#FFA500" stroke-width="4" stroke-linecap="round"/>
</svg>`,
        brushing: `<svg id="alpaka-brushing" viewBox="0 0 200 220" class="alpaka-svg alpaka-large" aria-label="Hanna putzt Zähne" role="img">
<circle cx="100" cy="110" r="60" fill="#FFFACD"/>
<circle cx="100" cy="50" r="10" fill="#FF6B6B"/>
<circle cx="85" cy="55" r="8" fill="#FF6B6B"/>
<circle cx="115" cy="55" r="8" fill="#FF6B6B"/>
<g class="buddy-eye">
<circle cx="80" cy="80" r="5" fill="#333"/>
<circle cx="82" cy="78" r="2" fill="#fff"/>
</g>
<g class="buddy-eye">
<circle cx="120" cy="80" r="5" fill="#333"/>
<circle cx="118" cy="78" r="2" fill="#fff"/>
</g>
<path d="M 92 92 L 100 104 L 108 92" fill="#FFA500" stroke="#E69500" stroke-width="1" stroke-linejoin="round"/>
<circle cx="70" cy="95" r="6" fill="#FFB6C1" opacity="0.6"/>
<circle cx="130" cy="95" r="6" fill="#FFB6C1" opacity="0.6"/>
<path id="mouth-brushing" d="M 90 105 Q 100 115 110 105" fill="none" stroke="#333" stroke-width="2.5" stroke-linecap="round"/>
<path d="M 150 110 Q 160 120 145 130" fill="none" stroke="#FFFACD" stroke-width="15" stroke-linecap="round"/>
<rect x="145" y="90" width="10" height="80" rx="5" fill="#A3D8F4" transform="rotate(15 150 130)"/>
<rect x="142" y="80" width="16" height="25" rx="4" fill="#FFF" transform="rotate(15 150 130)"/>
<rect x="144" y="82" width="12" height="10" rx="2" fill="#4A90E2" opacity="0.3" transform="rotate(15 150 130)"/>
</svg>`,
        celebrate: `<svg viewBox="0 0 200 220" class="alpaka-svg alpaka-celebrate" aria-label="Hanna feiert!" role="img">
<circle cx="100" cy="110" r="60" fill="#FFFACD"/>
<circle cx="100" cy="50" r="10" fill="#FF6B6B"/>
<circle cx="85" cy="55" r="8" fill="#FF6B6B"/>
<circle cx="115" cy="55" r="8" fill="#FF6B6B"/>
<g class="buddy-eye">
<path d="M 74 80 Q 80 75 86 80" fill="none" stroke="#333" stroke-width="2.5" stroke-linecap="round"/>
</g>
<g class="buddy-eye">
<path d="M 114 80 Q 120 75 126 80" fill="none" stroke="#333" stroke-width="2.5" stroke-linecap="round"/>
</g>
<path d="M 92 92 L 100 104 L 108 92" fill="#FFA500" stroke="#E69500" stroke-width="1" stroke-linejoin="round"/>
<path d="M 90 108 Q 100 120 110 108" fill="none" stroke="#333" stroke-width="2.5" stroke-linecap="round"/>
<path d="M 40 110 Q 20 90 40 70" fill="none" stroke="#FFFACD" stroke-width="15" stroke-linecap="round"/>
<path d="M 160 110 Q 180 90 160 70" fill="none" stroke="#FFFACD" stroke-width="15" stroke-linecap="round"/>
<text x="30" y="60" font-size="28">✨</text>
<text x="170" y="60" font-size="28">✨</text>
</svg>`,
    },
};

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
    if (mouth) {
        mouth.setAttribute('d', expr.mouth);
    }
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
    return getPhaseIndexForTime(state.timer);
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

    // Zahn-Fortschritt (Dreck ausblenden)
    const totalTime = 180;
    const progress = (totalTime - state.timer) / totalTime; // 0..1
    const dirtEl = document.getElementById('tooth-dirt');
    const sparklesEl = document.getElementById('tooth-sparkles');

    if (dirtEl) {
        // Opazität von 1 (dreckig) auf 0 (sauber)
        // Wir lassen es etwas früher sauber aussehen (bei 90%)
        let opacity = 1 - (progress * 1.1);
        if (opacity < 0) opacity = 0;
        dirtEl.style.opacity = opacity;
    }

    if (sparklesEl) {
        // Sparkles erst am Ende einblenden
        if (progress > 0.95) {
            sparklesEl.style.opacity = 1;
        } else {
            sparklesEl.style.opacity = 0;
        }
    }

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

        // Sparkles erzeugen (alle 1s ein paar)
        if (state.timer > 0) {
            // 2-3 Sparkles pro Sekunde verteilt
            setTimeout(() => createSparkle(), 100);
            setTimeout(() => createSparkle(), 400);
            setTimeout(() => createSparkle(), 700);
        }

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

    showScreen('screen-finish');
    soundManager.celebration();
    spawnConfetti();
}

/* ============================================
   SPARKLES (PUTZ-EFFEKT)
   ============================================ */
function createSparkle() {
    const container = document.getElementById('buddy-container-brushing');
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
