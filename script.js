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

    _ensureCtx() {
        if (!this.ctx) {
            try {
                this.ctx = new (window.AudioContext || window.webkitAudioContext)();
                console.log('[TTS] AudioContext created, state:', this.ctx.state);
            } catch (e) {
                console.error('[TTS] AudioContext creation failed:', e.message);
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            console.log('[TTS] AudioContext suspended, resuming...');
            this.ctx.resume()
                .then(() => console.log('[TTS] AudioContext resumed'))
                .catch(e => console.warn('[TTS] AudioContext resume failed:', e.message));
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

    giggle() {
        // Kichern: 3 kurze hohe Töne
        const notes = [800, 1000, 1200, 900];
        notes.forEach((f, i) =>
            setTimeout(() => this._playTone(f, 0.1, 'sine', 0.15), i * 80)
        );
    },

    tick() {
        this._playTone(440, 0.05, 'square', 0.04);
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
            console.log('[Piper] Starte Initialisierung...');

            // Dynamischer Import von Piper TTS Web
            piperModule = await import('@mintplex-labs/piper-tts-web');
            console.log('[Piper] Modul geladen');

            // Model herunterladen/cachen
            await piperModule.downloadModelIfNeeded(this.voiceId);
            console.log('[Piper] Model erfolgreich geladen');

            piperReady = true;
            return true;
        } catch (e) {
            console.error('[Piper] Init fehlgeschlagen:', e.message);
            console.warn('[Piper] Switching to Native TTS Fallback');
            this.useFallback = true;
            return false;
        }
    },

    // Sprachausgabe: Lokale Synthese + Playback
    async speak(text) {
        const clean = text.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim();

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
            console.warn('[Piper] TTS nicht initialisiert, versuche zu initialisieren...');
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
            console.log('[Piper] Spreche:', clean.substring(0, 60));

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
            console.error('[Piper] Sprachausgabe fehlgeschlagen:', e.message);
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
<ellipse cx="100" cy="28" rx="32" ry="18" fill="#FFF5E1"/>
<circle cx="78" cy="26" r="10" fill="#FFF5E1"/><circle cx="122" cy="26" r="10" fill="#FFF5E1"/><circle cx="100" cy="20" r="12" fill="#FFF5E1"/>
<rect x="68" y="22" width="14" height="28" rx="7" fill="#FFE4B5" transform="rotate(-18 68 22)"/>
<rect x="118" y="22" width="14" height="28" rx="7" fill="#FFE4B5" transform="rotate(18 118 22)"/>
<rect x="71" y="24" width="7" height="18" rx="4" fill="#FFB6C1" transform="rotate(-18 71 24)"/>
<rect x="122" y="24" width="7" height="18" rx="4" fill="#FFB6C1" transform="rotate(18 122 24)"/>
<ellipse cx="100" cy="78" rx="46" ry="44" fill="#FFF5E1"/>
<g class="buddy-eye"><ellipse cx="82" cy="68" rx="8" ry="9" fill="#fff" stroke="#333" stroke-width="1.5"/><circle cx="84" cy="70" r="4.5" fill="#333"/><circle cx="86" cy="68" r="1.5" fill="#fff"/></g>
<g class="buddy-eye"><ellipse cx="118" cy="68" rx="8" ry="9" fill="#fff" stroke="#333" stroke-width="1.5"/><circle cx="120" cy="70" r="4.5" fill="#333"/><circle cx="122" cy="68" r="1.5" fill="#fff"/></g>
<ellipse cx="100" cy="88" rx="14" ry="9" fill="#FFD4C2"/>
<circle cx="96" cy="88" r="3" fill="#E88E6A" opacity="0.6"/><circle cx="104" cy="88" r="3" fill="#E88E6A" opacity="0.6"/>
<path d="M 90 98 Q 100 108 110 98" fill="none" stroke="#E88E6A" stroke-width="3" stroke-linecap="round"/>
<ellipse cx="72" cy="82" rx="10" ry="6" fill="#FFB6C1" opacity="0.35"/>
<ellipse cx="128" cy="82" rx="10" ry="6" fill="#FFB6C1" opacity="0.35"/>
<ellipse cx="100" cy="165" rx="58" ry="52" fill="#FFF5E1"/>
<rect x="68" y="195" width="18" height="22" rx="9" fill="#FFE4B5"/>
<rect x="114" y="195" width="18" height="22" rx="9" fill="#FFE4B5"/>
<rect x="68" y="212" width="18" height="8" rx="4" fill="#D4A86A"/>
<rect x="114" y="212" width="18" height="8" rx="4" fill="#D4A86A"/>
</svg>`,

        brushing: `<svg id="alpaka-brushing" viewBox="0 0 200 220" class="alpaka-svg alpaka-large" aria-label="Alpi motiviert dich" role="img">
<ellipse cx="100" cy="28" rx="32" ry="18" fill="#FFF5E1"/>
<circle cx="78" cy="26" r="10" fill="#FFF5E1"/><circle cx="122" cy="26" r="10" fill="#FFF5E1"/><circle cx="100" cy="20" r="12" fill="#FFF5E1"/>
<rect x="68" y="22" width="14" height="28" rx="7" fill="#FFE4B5" transform="rotate(-18 68 22)"/>
<rect x="118" y="22" width="14" height="28" rx="7" fill="#FFE4B5" transform="rotate(18 118 22)"/>
<rect x="71" y="24" width="7" height="18" rx="4" fill="#FFB6C1" transform="rotate(-18 71 24)"/>
<rect x="122" y="24" width="7" height="18" rx="4" fill="#FFB6C1" transform="rotate(18 122 24)"/>
<ellipse cx="100" cy="78" rx="46" ry="44" fill="#FFF5E1"/>
<g class="buddy-eye"><ellipse cx="82" cy="68" rx="8" ry="9" fill="#fff" stroke="#333" stroke-width="1.5"/><circle cx="84" cy="70" r="4.5" fill="#333"/><circle cx="86" cy="68" r="1.5" fill="#fff"/></g>
<g class="buddy-eye"><ellipse cx="118" cy="68" rx="8" ry="9" fill="#fff" stroke="#333" stroke-width="1.5"/><circle cx="120" cy="70" r="4.5" fill="#333"/><circle cx="122" cy="68" r="1.5" fill="#fff"/></g>
<ellipse cx="100" cy="88" rx="14" ry="9" fill="#FFD4C2"/>
<circle cx="96" cy="88" r="3" fill="#E88E6A" opacity="0.6"/><circle cx="104" cy="88" r="3" fill="#E88E6A" opacity="0.6"/>
<path id="mouth-brushing" d="M 90 98 Q 100 108 110 98" fill="none" stroke="#E88E6A" stroke-width="3" stroke-linecap="round"/>
<ellipse cx="72" cy="82" rx="10" ry="6" fill="#FFB6C1" opacity="0.35"/>
<ellipse cx="128" cy="82" rx="10" ry="6" fill="#FFB6C1" opacity="0.35"/>
<ellipse cx="100" cy="165" rx="58" ry="52" fill="#FFF5E1"/>
<rect x="68" y="195" width="18" height="22" rx="9" fill="#FFE4B5"/>
<rect x="114" y="195" width="18" height="22" rx="9" fill="#FFE4B5"/>
<rect x="68" y="212" width="18" height="8" rx="4" fill="#D4A86A"/>
<rect x="114" y="212" width="18" height="8" rx="4" fill="#D4A86A"/>
<rect x="148" y="130" width="8" height="36" rx="4" fill="#A3D8F4"/>
<rect x="148" y="130" width="8" height="14" rx="4" fill="#fff" stroke="#A3D8F4" stroke-width="1"/>
<line x1="150" y1="133" x2="155" y2="140" stroke="#A3D8F4" stroke-width="1.5"/>
<line x1="154" y1="133" x2="150" y2="140" stroke="#A3D8F4" stroke-width="1.5"/>
</svg>`,

        celebrate: `<svg viewBox="0 0 200 220" class="alpaka-svg alpaka-celebrate" aria-label="Alpi feiert!" role="img">
<ellipse cx="100" cy="28" rx="32" ry="18" fill="#FFF5E1"/>
<circle cx="78" cy="26" r="10" fill="#FFF5E1"/><circle cx="122" cy="26" r="10" fill="#FFF5E1"/><circle cx="100" cy="20" r="12" fill="#FFF5E1"/>
<rect x="68" y="22" width="14" height="28" rx="7" fill="#FFE4B5" transform="rotate(-18 68 22)"/>
<rect x="118" y="22" width="14" height="28" rx="7" fill="#FFE4B5" transform="rotate(18 118 22)"/>
<rect x="71" y="24" width="7" height="18" rx="4" fill="#FFB6C1" transform="rotate(-18 71 24)"/>
<rect x="122" y="24" width="7" height="18" rx="4" fill="#FFB6C1" transform="rotate(18 122 24)"/>
<ellipse cx="100" cy="78" rx="46" ry="44" fill="#FFF5E1"/>
<path d="M 74 68 Q 82 60 90 68" fill="none" stroke="#333" stroke-width="3" stroke-linecap="round"/>
<path d="M 110 68 Q 118 60 126 68" fill="none" stroke="#333" stroke-width="3" stroke-linecap="round"/>
<ellipse cx="100" cy="88" rx="14" ry="9" fill="#FFD4C2"/>
<circle cx="96" cy="88" r="3" fill="#E88E6A" opacity="0.6"/><circle cx="104" cy="88" r="3" fill="#E88E6A" opacity="0.6"/>
<path d="M 84 98 Q 100 115 116 98" fill="none" stroke="#E88E6A" stroke-width="3.5" stroke-linecap="round"/>
<ellipse cx="72" cy="82" rx="12" ry="7" fill="#FFB6C1" opacity="0.55"/>
<ellipse cx="128" cy="82" rx="12" ry="7" fill="#FFB6C1" opacity="0.55"/>
<text x="42" y="40" font-size="14" aria-hidden="true">⭐</text>
<text x="145" y="40" font-size="14" aria-hidden="true">⭐</text>
<text x="93" y="18" font-size="12" aria-hidden="true">✨</text>
<ellipse cx="100" cy="165" rx="58" ry="52" fill="#FFF5E1"/>
<ellipse cx="50" cy="140" rx="10" ry="28" fill="#FFE4B5" transform="rotate(-40 50 140)"/>
<ellipse cx="150" cy="140" rx="10" ry="28" fill="#FFE4B5" transform="rotate(40 150 140)"/>
<rect x="68" y="195" width="18" height="22" rx="9" fill="#FFE4B5"/>
<rect x="114" y="195" width="18" height="22" rx="9" fill="#FFE4B5"/>
<rect x="68" y="212" width="18" height="8" rx="4" fill="#D4A86A"/>
<rect x="114" y="212" width="18" height="8" rx="4" fill="#D4A86A"/>
</svg>`,
    },

    katze: {
        idle: `<svg viewBox="0 0 200 220" class="alpaka-svg" aria-label="Katze Mia" role="img">
<path d="M 148 188 Q 176 172 172 148 Q 168 126 182 112" fill="none" stroke="#E8A000" stroke-width="12" stroke-linecap="round"/>
<polygon points="70,50 58,18 92,42" fill="#FFCD8A"/>
<polygon points="130,50 142,18 108,42" fill="#FFCD8A"/>
<polygon points="72,48 64,26 88,42" fill="#FFB6C1"/>
<polygon points="128,48 136,26 112,42" fill="#FFB6C1"/>
<ellipse cx="100" cy="78" rx="44" ry="42" fill="#FFCD8A"/>
<g class="buddy-eye"><ellipse cx="83" cy="68" rx="9" ry="10" fill="#98D8A3" stroke="#333" stroke-width="1.5"/><ellipse cx="83" cy="68" rx="3.5" ry="6.5" fill="#333"/><circle cx="86" cy="64" r="1.8" fill="#fff"/></g>
<g class="buddy-eye"><ellipse cx="117" cy="68" rx="9" ry="10" fill="#98D8A3" stroke="#333" stroke-width="1.5"/><ellipse cx="117" cy="68" rx="3.5" ry="6.5" fill="#333"/><circle cx="120" cy="64" r="1.8" fill="#fff"/></g>
<polygon points="100,85 95,91 105,91" fill="#FFB6C1"/>
<path d="M 95 91 Q 91 97 87 95" fill="none" stroke="#C06060" stroke-width="2" stroke-linecap="round"/>
<path d="M 105 91 Q 109 97 113 95" fill="none" stroke="#C06060" stroke-width="2" stroke-linecap="round"/>
<line x1="56" y1="82" x2="90" y2="87" stroke="#9988AA" stroke-width="1.5" stroke-linecap="round"/>
<line x1="54" y1="88" x2="90" y2="90" stroke="#9988AA" stroke-width="1.5" stroke-linecap="round"/>
<line x1="56" y1="94" x2="90" y2="93" stroke="#9988AA" stroke-width="1.5" stroke-linecap="round"/>
<line x1="144" y1="82" x2="110" y2="87" stroke="#9988AA" stroke-width="1.5" stroke-linecap="round"/>
<line x1="146" y1="88" x2="110" y2="90" stroke="#9988AA" stroke-width="1.5" stroke-linecap="round"/>
<line x1="144" y1="94" x2="110" y2="93" stroke="#9988AA" stroke-width="1.5" stroke-linecap="round"/>
<ellipse cx="70" cy="82" rx="10" ry="6" fill="#FFB6C1" opacity="0.35"/>
<ellipse cx="130" cy="82" rx="10" ry="6" fill="#FFB6C1" opacity="0.35"/>
<ellipse cx="100" cy="165" rx="55" ry="50" fill="#FFCD8A"/>
<ellipse cx="76" cy="213" rx="13" ry="9" fill="#E8A000"/>
<ellipse cx="124" cy="213" rx="13" ry="9" fill="#E8A000"/>
</svg>`,

        brushing: `<svg id="alpaka-brushing" viewBox="0 0 200 220" class="alpaka-svg alpaka-large" aria-label="Mia putzt Zähne" role="img">
<polygon points="70,50 58,18 92,42" fill="#FFCD8A"/>
<polygon points="130,50 142,18 108,42" fill="#FFCD8A"/>
<polygon points="72,48 64,26 88,42" fill="#FFB6C1"/>
<polygon points="128,48 136,26 112,42" fill="#FFB6C1"/>
<ellipse cx="100" cy="78" rx="44" ry="42" fill="#FFCD8A"/>
<g class="buddy-eye"><ellipse cx="83" cy="68" rx="9" ry="10" fill="#98D8A3" stroke="#333" stroke-width="1.5"/><ellipse cx="83" cy="68" rx="3.5" ry="6.5" fill="#333"/><circle cx="86" cy="64" r="1.8" fill="#fff"/></g>
<g class="buddy-eye"><ellipse cx="117" cy="68" rx="9" ry="10" fill="#98D8A3" stroke="#333" stroke-width="1.5"/><ellipse cx="117" cy="68" rx="3.5" ry="6.5" fill="#333"/><circle cx="120" cy="64" r="1.8" fill="#fff"/></g>
<polygon points="100,85 95,91 105,91" fill="#FFB6C1"/>
<path id="mouth-brushing" d="M 90 98 Q 100 108 110 98" fill="none" stroke="#C06060" stroke-width="3" stroke-linecap="round"/>
<line x1="56" y1="82" x2="90" y2="87" stroke="#9988AA" stroke-width="1.5" stroke-linecap="round"/>
<line x1="54" y1="88" x2="90" y2="90" stroke="#9988AA" stroke-width="1.5" stroke-linecap="round"/>
<line x1="56" y1="94" x2="90" y2="93" stroke="#9988AA" stroke-width="1.5" stroke-linecap="round"/>
<line x1="144" y1="82" x2="110" y2="87" stroke="#9988AA" stroke-width="1.5" stroke-linecap="round"/>
<line x1="146" y1="88" x2="110" y2="90" stroke="#9988AA" stroke-width="1.5" stroke-linecap="round"/>
<line x1="144" y1="94" x2="110" y2="93" stroke="#9988AA" stroke-width="1.5" stroke-linecap="round"/>
<ellipse cx="70" cy="82" rx="10" ry="6" fill="#FFB6C1" opacity="0.35"/>
<ellipse cx="130" cy="82" rx="10" ry="6" fill="#FFB6C1" opacity="0.35"/>
<ellipse cx="100" cy="165" rx="55" ry="50" fill="#FFCD8A"/>
<rect x="70" y="196" width="18" height="22" rx="9" fill="#E8A000"/>
<rect x="112" y="196" width="18" height="22" rx="9" fill="#E8A000"/>
<ellipse cx="79" cy="215" rx="11" ry="7" fill="#D09000"/>
<ellipse cx="121" cy="215" rx="11" ry="7" fill="#D09000"/>
<rect x="148" y="130" width="8" height="36" rx="4" fill="#A3D8F4"/>
<rect x="148" y="130" width="8" height="14" rx="4" fill="#fff" stroke="#A3D8F4" stroke-width="1"/>
<line x1="150" y1="133" x2="155" y2="140" stroke="#A3D8F4" stroke-width="1.5"/>
<line x1="154" y1="133" x2="150" y2="140" stroke="#A3D8F4" stroke-width="1.5"/>
</svg>`,

        celebrate: `<svg viewBox="0 0 200 220" class="alpaka-svg alpaka-celebrate" aria-label="Mia feiert!" role="img">
<polygon points="70,50 58,18 92,42" fill="#FFCD8A"/>
<polygon points="130,50 142,18 108,42" fill="#FFCD8A"/>
<polygon points="72,48 64,26 88,42" fill="#FFB6C1"/>
<polygon points="128,48 136,26 112,42" fill="#FFB6C1"/>
<ellipse cx="100" cy="78" rx="44" ry="42" fill="#FFCD8A"/>
<path d="M 74 68 Q 82 60 90 68" fill="none" stroke="#333" stroke-width="3" stroke-linecap="round"/>
<path d="M 110 68 Q 118 60 126 68" fill="none" stroke="#333" stroke-width="3" stroke-linecap="round"/>
<polygon points="100,85 95,91 105,91" fill="#FFB6C1"/>
<path d="M 84 98 Q 100 115 116 98" fill="none" stroke="#C06060" stroke-width="3.5" stroke-linecap="round"/>
<line x1="56" y1="82" x2="90" y2="87" stroke="#9988AA" stroke-width="1.5" stroke-linecap="round"/>
<line x1="54" y1="88" x2="90" y2="90" stroke="#9988AA" stroke-width="1.5" stroke-linecap="round"/>
<line x1="144" y1="82" x2="110" y2="87" stroke="#9988AA" stroke-width="1.5" stroke-linecap="round"/>
<line x1="146" y1="88" x2="110" y2="90" stroke="#9988AA" stroke-width="1.5" stroke-linecap="round"/>
<ellipse cx="70" cy="82" rx="12" ry="7" fill="#FFB6C1" opacity="0.55"/>
<ellipse cx="130" cy="82" rx="12" ry="7" fill="#FFB6C1" opacity="0.55"/>
<text x="42" y="40" font-size="14" aria-hidden="true">⭐</text>
<text x="145" y="40" font-size="14" aria-hidden="true">⭐</text>
<text x="93" y="18" font-size="12" aria-hidden="true">✨</text>
<ellipse cx="100" cy="165" rx="55" ry="50" fill="#FFCD8A"/>
<ellipse cx="48" cy="140" rx="12" ry="28" fill="#E8A000" transform="rotate(-40 48 140)"/>
<ellipse cx="152" cy="140" rx="12" ry="28" fill="#E8A000" transform="rotate(40 152 140)"/>
<ellipse cx="76" cy="213" rx="13" ry="9" fill="#E8A000"/>
<ellipse cx="124" cy="213" rx="13" ry="9" fill="#E8A000"/>
</svg>`,
    },

    huhn: {
        idle: `<svg viewBox="0 0 200 220" class="alpaka-svg" aria-label="Huhn Hanna" role="img">
<ellipse cx="84" cy="32" rx="11" ry="13" fill="#E63A2A"/>
<ellipse cx="100" cy="24" rx="12" ry="14" fill="#E63A2A"/>
<ellipse cx="116" cy="32" rx="11" ry="13" fill="#E63A2A"/>
<ellipse cx="100" cy="76" rx="40" ry="40" fill="#FFE566"/>
<g class="buddy-eye"><ellipse cx="84" cy="66" rx="8" ry="9" fill="#fff" stroke="#333" stroke-width="1.5"/><circle cx="86" cy="67" r="4.5" fill="#333"/><circle cx="88" cy="65" r="1.5" fill="#fff"/></g>
<g class="buddy-eye"><ellipse cx="116" cy="66" rx="8" ry="9" fill="#fff" stroke="#333" stroke-width="1.5"/><circle cx="118" cy="67" r="4.5" fill="#333"/><circle cx="120" cy="65" r="1.5" fill="#fff"/></g>
<polygon points="100,78 89,90 111,90" fill="#FF8C00"/>
<ellipse cx="100" cy="97" rx="8" ry="6" fill="#E63A2A"/>
<ellipse cx="71" cy="78" rx="10" ry="7" fill="#FFB6C1" opacity="0.35"/>
<ellipse cx="129" cy="78" rx="10" ry="7" fill="#FFB6C1" opacity="0.35"/>
<ellipse cx="100" cy="165" rx="56" ry="52" fill="#FFE566"/>
<ellipse cx="46" cy="158" rx="14" ry="28" fill="#F5D000" transform="rotate(15 46 158)"/>
<ellipse cx="154" cy="158" rx="14" ry="28" fill="#F5D000" transform="rotate(-15 154 158)"/>
<rect x="82" y="208" width="12" height="14" rx="4" fill="#FF8C00"/>
<rect x="106" y="208" width="12" height="14" rx="4" fill="#FF8C00"/>
<line x1="88" y1="218" x2="78" y2="223" stroke="#FF8C00" stroke-width="4" stroke-linecap="round"/>
<line x1="88" y1="218" x2="88" y2="224" stroke="#FF8C00" stroke-width="4" stroke-linecap="round"/>
<line x1="88" y1="218" x2="98" y2="223" stroke="#FF8C00" stroke-width="4" stroke-linecap="round"/>
<line x1="112" y1="218" x2="102" y2="223" stroke="#FF8C00" stroke-width="4" stroke-linecap="round"/>
<line x1="112" y1="218" x2="112" y2="224" stroke="#FF8C00" stroke-width="4" stroke-linecap="round"/>
<line x1="112" y1="218" x2="122" y2="223" stroke="#FF8C00" stroke-width="4" stroke-linecap="round"/>
</svg>`,

        brushing: `<svg id="alpaka-brushing" viewBox="0 0 200 220" class="alpaka-svg alpaka-large" aria-label="Hanna putzt Zähne" role="img">
<ellipse cx="84" cy="32" rx="11" ry="13" fill="#E63A2A"/>
<ellipse cx="100" cy="24" rx="12" ry="14" fill="#E63A2A"/>
<ellipse cx="116" cy="32" rx="11" ry="13" fill="#E63A2A"/>
<ellipse cx="100" cy="76" rx="40" ry="40" fill="#FFE566"/>
<g class="buddy-eye"><ellipse cx="84" cy="66" rx="8" ry="9" fill="#fff" stroke="#333" stroke-width="1.5"/><circle cx="86" cy="67" r="4.5" fill="#333"/><circle cx="88" cy="65" r="1.5" fill="#fff"/></g>
<g class="buddy-eye"><ellipse cx="116" cy="66" rx="8" ry="9" fill="#fff" stroke="#333" stroke-width="1.5"/><circle cx="118" cy="67" r="4.5" fill="#333"/><circle cx="120" cy="65" r="1.5" fill="#fff"/></g>
<polygon points="100,78 89,90 111,90" fill="#FF8C00"/>
<path id="mouth-brushing" d="M 90 98 Q 100 108 110 98" fill="none" stroke="#FF8C00" stroke-width="3" stroke-linecap="round"/>
<ellipse cx="100" cy="100" rx="7" ry="5" fill="#E63A2A"/>
<ellipse cx="71" cy="78" rx="10" ry="7" fill="#FFB6C1" opacity="0.35"/>
<ellipse cx="129" cy="78" rx="10" ry="7" fill="#FFB6C1" opacity="0.35"/>
<ellipse cx="100" cy="165" rx="56" ry="52" fill="#FFE566"/>
<ellipse cx="46" cy="158" rx="14" ry="28" fill="#F5D000" transform="rotate(15 46 158)"/>
<ellipse cx="154" cy="158" rx="14" ry="28" fill="#F5D000" transform="rotate(-15 154 158)"/>
<rect x="82" y="208" width="12" height="14" rx="4" fill="#FF8C00"/>
<rect x="106" y="208" width="12" height="14" rx="4" fill="#FF8C00"/>
<line x1="88" y1="218" x2="78" y2="223" stroke="#FF8C00" stroke-width="4" stroke-linecap="round"/>
<line x1="88" y1="218" x2="88" y2="224" stroke="#FF8C00" stroke-width="4" stroke-linecap="round"/>
<line x1="88" y1="218" x2="98" y2="223" stroke="#FF8C00" stroke-width="4" stroke-linecap="round"/>
<line x1="112" y1="218" x2="102" y2="223" stroke="#FF8C00" stroke-width="4" stroke-linecap="round"/>
<line x1="112" y1="218" x2="112" y2="224" stroke="#FF8C00" stroke-width="4" stroke-linecap="round"/>
<line x1="112" y1="218" x2="122" y2="223" stroke="#FF8C00" stroke-width="4" stroke-linecap="round"/>
<rect x="148" y="130" width="8" height="36" rx="4" fill="#A3D8F4"/>
<rect x="148" y="130" width="8" height="14" rx="4" fill="#fff" stroke="#A3D8F4" stroke-width="1"/>
<line x1="150" y1="133" x2="155" y2="140" stroke="#A3D8F4" stroke-width="1.5"/>
<line x1="154" y1="133" x2="150" y2="140" stroke="#A3D8F4" stroke-width="1.5"/>
</svg>`,

        celebrate: `<svg viewBox="0 0 200 220" class="alpaka-svg alpaka-celebrate" aria-label="Hanna feiert!" role="img">
<ellipse cx="84" cy="32" rx="11" ry="13" fill="#E63A2A"/>
<ellipse cx="100" cy="24" rx="12" ry="14" fill="#E63A2A"/>
<ellipse cx="116" cy="32" rx="11" ry="13" fill="#E63A2A"/>
<ellipse cx="100" cy="76" rx="40" ry="40" fill="#FFE566"/>
<path d="M 76 66 Q 84 58 92 66" fill="none" stroke="#333" stroke-width="3" stroke-linecap="round"/>
<path d="M 108 66 Q 116 58 124 66" fill="none" stroke="#333" stroke-width="3" stroke-linecap="round"/>
<polygon points="100,78 89,90 111,90" fill="#FF8C00"/>
<path d="M 84 98 Q 100 115 116 98" fill="none" stroke="#FF8C00" stroke-width="3.5" stroke-linecap="round"/>
<ellipse cx="100" cy="100" rx="7" ry="5" fill="#E63A2A"/>
<ellipse cx="71" cy="78" rx="12" ry="7" fill="#FFB6C1" opacity="0.55"/>
<ellipse cx="129" cy="78" rx="12" ry="7" fill="#FFB6C1" opacity="0.55"/>
<text x="42" y="40" font-size="14" aria-hidden="true">⭐</text>
<text x="145" y="40" font-size="14" aria-hidden="true">⭐</text>
<text x="93" y="18" font-size="12" aria-hidden="true">✨</text>
<ellipse cx="100" cy="165" rx="56" ry="52" fill="#FFE566"/>
<ellipse cx="44" cy="140" rx="14" ry="30" fill="#F5D000" transform="rotate(-40 44 140)"/>
<ellipse cx="156" cy="140" rx="14" ry="30" fill="#F5D000" transform="rotate(40 156 140)"/>
<rect x="82" y="208" width="12" height="14" rx="4" fill="#FF8C00"/>
<rect x="106" y="208" width="12" height="14" rx="4" fill="#FF8C00"/>
<line x1="88" y1="218" x2="78" y2="223" stroke="#FF8C00" stroke-width="4" stroke-linecap="round"/>
<line x1="88" y1="218" x2="88" y2="224" stroke="#FF8C00" stroke-width="4" stroke-linecap="round"/>
<line x1="88" y1="218" x2="98" y2="223" stroke="#FF8C00" stroke-width="4" stroke-linecap="round"/>
<line x1="112" y1="218" x2="102" y2="223" stroke="#FF8C00" stroke-width="4" stroke-linecap="round"/>
<line x1="112" y1="218" x2="112" y2="224" stroke="#FF8C00" stroke-width="4" stroke-linecap="round"/>
<line x1="112" y1="218" x2="122" y2="223" stroke="#FF8C00" stroke-width="4" stroke-linecap="round"/>
</svg>`,
    },
};

/* Rendert den gewählten Buddy in alle Screen-Container */
function renderBuddy() {
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
function setSpeechBubble(text) {
    const el     = document.getElementById('speech-bubble');
    const textEl = document.getElementById('speech-text');
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
                document.querySelectorAll('.buddy-card').forEach(card => {
                    card.classList.toggle('selected', card.dataset.buddy === state.buddy);
                });
                showScreen('screen-buddy');
            }, 500);
        } else {
            // Fehler - aber trotzdem weiter (Fallback)
            console.warn('[Download] Fehler beim Laden, nutze Native TTS Fallback');
            setTimeout(() => {
                document.querySelectorAll('.buddy-card').forEach(card => {
                    card.classList.toggle('selected', card.dataset.buddy === state.buddy);
                });
                showScreen('screen-buddy');
            }, 2000);
        }
    } catch (e) {
        console.error('[Download] Exception:', e);
        // Fallback: Trotzdem weiter
        setTimeout(() => {
            document.querySelectorAll('.buddy-card').forEach(card => {
                card.classList.toggle('selected', card.dataset.buddy === state.buddy);
            });
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
        document.querySelectorAll('.buddy-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        state.buddy = card.dataset.buddy;
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
