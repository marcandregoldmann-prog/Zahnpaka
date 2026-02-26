/**
 * Zahnputz-Phasen Definitionen und Hilfsfunktionen
 */

const phases = [
    {
        startAt: 180,
        endAt:   151,
        text:    'Mund weit auf wie ein Löwe! Jetzt schrubben wir unten!',
        zone:    'zone-unten',
        zoneLabel: 'Kauflächen (unten)',
        tips: [
            'Hin und her, wie ein kleiner Zug! Tschu-tschu! 🚂',
            'Oh, da ist ein Zahnteufel! Schnell weg damit!',
            'Bärenstark machst du das!',
        ],
        expression: 'encouraging',
    },
    {
        startAt: 150,
        endAt:   121,
        text:    'Mund weit auf wie ein Löwe! Jetzt schrubben wir oben!',
        zone:    'zone-oben',
        zoneLabel: 'Kauflächen (oben)',
        tips: [
            'Hin und her, wie ein kleiner Zug! Tschu-tschu! 🚂',
            'Oh, da ist ein Zahnteufel! Schnell weg damit!',
            'Bärenstark machst du das!',
        ],
        expression: 'encouraging',
    },
    {
        startAt: 120,
        endAt:   91,
        text:    'Zähne zusammenbeißen wie ein Tiger! Wir malen Kreise!',
        zone:    'zone-oben',
        zoneLabel: 'Außenflächen',
        tips: [
            'Runde Kreise malen, wie beim Karussell fahren! 🎡',
            'Ui, den Zahnteufeln wird schon ganz schwindelig!',
            'Super! Weiter so kreisen!',
        ],
        expression: 'happy',
    },
    {
        startAt: 90,
        endAt:   41,
        text:    'Jetzt fegen wir die Zahnteufel von drinnen nach draußen!',
        zone:    'zone-unten',
        zoneLabel: 'Innenflächen (unten & oben)',
        tips: [
            'Wir fegen mit dem Besen von Rot nach Weiß! 🧹',
            'Da hat sich noch ein Teufel versteckt! Schrubb ihn weg!',
            'Deine Zähne leuchten schon richtig!',
        ],
        expression: 'proud',
    },
    {
        startAt: 40,
        endAt:   11,
        text:    'Jetzt die Zahnteufel-Jagd! Putz dort, wo du noch Teufel siehst!',
        zone:    'zone-oben',
        zoneLabel: 'Zahnteufel-Jagd!',
        tips: [
            'Du bist der beste Zahnteufel-Jäger! 🦸‍♂️',
            'Alle Teufel flüchten jetzt!',
            'Gleich haben wir es geschafft!',
        ],
        expression: 'surprised',
    },
    {
        startAt: 10,
        endAt:   0,
        text:    'Gleich geschafft! Spuck den Schaum aus wie ein Drache! 🐉',
        zone:    'zone-unten',
        zoneLabel: 'Endspurt!',
        tips: [
            'Ausspucken! 🫧',
            'Zahnbürste auswaschen!',
            'Toll gemacht!',
        ],
        expression: 'happy',
    },
];

/**
 * Ermittelt den Index der aktuellen Phase basierend auf der Timer-Zeit.
 * @param {number} timer - Verbleibende Zeit in Sekunden.
 * @returns {number} - Index der Phase im phases-Array.
 */
function getPhaseIndexForTime(timer) {
    for (let i = 0; i < phases.length; i++) {
        const p = phases[i];
        // Fix: >= p.endAt statt > p.endAt, um Grenzwerte einzuschließen
        if (timer <= p.startAt && timer >= p.endAt) return i;
    }
    // Default zur letzten Phase (meistens 0 Sekunden erreicht)
    return phases.length - 1;
}

/**
 * Ermittelt den aktuellen Tipp/Spruch basierend auf der Zeit.
 * Rotiert alle 10 Sekunden durch die Tipps der aktuellen Phase.
 * @param {number} timer - Verbleibende Zeit in Sekunden.
 * @returns {string} - Der anzuzeigende Tipp.
 */
function getSpeechForTimer(timer) {
    const phaseIdx = getPhaseIndexForTime(timer);
    const phase = phases[phaseIdx];

    if (!phase || !phase.tips || phase.tips.length === 0) {
        return '';
    }

    // Zeit seit Beginn der Phase
    let tipElapsed = phase.startAt - timer;

    // Negative Zeit (z.B. minimaler Overshoot) abfangen
    if (tipElapsed < 0) {
        tipElapsed = 0;
    }

    // Jede 10 Sekunden rotieren
    // Beispiel: start=180, timer=175 -> elapsed=5 -> index=0
    //           start=180, timer=170 -> elapsed=10 -> index=1
    const tipIndex = Math.floor(tipElapsed / 10) % phase.tips.length;

    return phase.tips[tipIndex];
}

// Export für Node.js Tests
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { phases, getPhaseIndexForTime, getSpeechForTimer };
}
