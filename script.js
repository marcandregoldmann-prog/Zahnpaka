const state = {
    name: "Held",
    timer: 180, // 3 Minuten
    currentPhase: 0,
    interval: null
};

const phases = [
    { time: 180, text: "Zuerst die Kauflächen! Hin und her...", zone: "zone-unten", tip: "Wie ein kleiner Zug: Tschu-tschu!" },
    { time: 120, text: "Jetzt die Außenflächen. Schöne Kreise machen!", zone: "zone-oben", tip: "Ganz sanft, wie eine Feder." },
    { time: 60, text: "Und nun die Innenseiten. Fast geschafft!", zone: "zone-unten", tip: "Wir verjagen die Zahnteufel!" },
    { time: 10, text: "Gleich fertig! Noch einmal strahlen!", zone: "zone-oben", tip: "Spuck den Schaum jetzt aus." }
];

const encouragingPhrases = [
    "Das machst du toll!",
    "Wow, wie das funkelt!",
    "Du bist ein echter Profi!",
    "Deine Zähne freuen sich sehr!"
];

// Screen Navigation
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

// Start-Logik
document.getElementById('btn-start').addEventListener('click', () => {
    const nameInput = document.getElementById('child-name').value;
    if (nameInput) state.name = nameInput;

    showScreen('screen-timer');
    startBrushing();
});

function startBrushing() {
    state.timer = 180;
    updateDisplay();

    state.interval = setInterval(() => {
        state.timer--;
        updateDisplay();

        if (state.timer % 25 === 0 && state.timer > 10) {
            saySomethingRandom();
        }

        if (state.timer <= 0) {
            clearInterval(state.interval);
            finish();
        }
    }, 1000);
}

function updateDisplay() {
    const mins = Math.floor(state.timer / 60);
    const secs = state.timer % 60;
    document.getElementById('timer-display').innerText =
        `${mins}:${secs.toString().padStart(2, '0')}`;

    // Phasen-Update
    const phase = phases.find(p => state.timer >= p.time - 60 && state.timer <= p.time) || phases[0];
    document.getElementById('instruction-text').innerText = phase.text;
    document.getElementById('speech-bubble').innerText = phase.tip;

    // Visueller Guide
    document.querySelectorAll('path').forEach(p => p.classList.remove('active-zone'));
    const activePath = document.getElementById(phase.zone);
    if (activePath) activePath.classList.add('active-zone');
}

function saySomethingRandom() {
    const phrase = encouragingPhrases[Math.floor(Math.random() * encouragingPhrases.length)];
    document.getElementById('speech-bubble').innerText = phrase;
}

function finish() {
    document.querySelectorAll('.user-name').forEach(el => el.innerText = state.name);
    showScreen('screen-finish');
}

document.getElementById('btn-restart').addEventListener('click', () => {
    location.reload();
});

// PWA Service Worker Registrierung (Platzhalter)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // navigator.serviceWorker.register('/sw.js');
    });
}
