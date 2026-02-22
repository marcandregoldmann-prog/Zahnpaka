/**
 * Zahnputz-Phasen Definitionen und Hilfsfunktionen
 */

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

// Export für Node.js Tests
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { phases, getPhaseIndexForTime };
}
