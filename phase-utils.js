/**
 * Zahnputz-Plan: EINE Wahrheitsquelle für den ganzen Putz-Ablauf.
 *
 * Aus diesem Plan werden Uhr, Zahnschema-Markierung, Anweisungstext
 * UND die Bürsten-Animation abgeleitet – darum können sie nicht mehr
 * auseinanderlaufen.
 *
 * Pädagogik: KAI-Methode (Kauflächen → Außenflächen → Innenflächen),
 * jeweils unten und oben getrennt, plus eine Teufel-Jagd und Ausspucken.
 *
 * Jedes Segment hat:
 *   duration   – Sekunden
 *   jaw        – 'oben' | 'unten' | 'beide'  → welche Reihe im Schema leuchtet
 *   surface    – Fläche (steuert Bürsten-Position)
 *   technique  – 'scrub' | 'circle' | 'sweep' | 'spit' → Bürsten-Bewegung
 *   title      – kurze, eindeutige Überschrift (WAS + WO)
 *   cues       – Bewegungs-Tipps (WIE); rotieren, bleiben aber on-message
 *   expression – Mimik des Buddys
 */
const brushingPlan = [
    {
        id: 'kau-unten', duration: 25, jaw: 'unten', surface: 'kauflaeche', technique: 'scrub',
        title: 'Untere Kauflächen',
        cues: ['Vor und zurück – wie ein kleiner Zug! 🚂', 'Hin und her auf den unteren Kauflächen!'],
        expression: 'encouraging',
    },
    {
        id: 'kau-oben', duration: 25, jaw: 'oben', surface: 'kauflaeche', technique: 'scrub',
        title: 'Obere Kauflächen',
        cues: ['Jetzt oben – vor und zurück! 🚂', 'Schrubb die oberen Kauflächen, hin und her!'],
        expression: 'encouraging',
    },
    {
        id: 'aussen-unten', duration: 25, jaw: 'unten', surface: 'aussen', technique: 'circle',
        title: 'Untere Außenseiten',
        cues: ['Kleine Kreise malen! 🎡', 'Runde Kreise außen unten – wie ein Karussell!'],
        expression: 'happy',
    },
    {
        id: 'aussen-oben', duration: 25, jaw: 'oben', surface: 'aussen', technique: 'circle',
        title: 'Obere Außenseiten',
        cues: ['Kreise oben außen! 🎡', 'Schöne Kreise – immer schön rundherum!'],
        expression: 'happy',
    },
    {
        id: 'innen-unten', duration: 25, jaw: 'unten', surface: 'innen', technique: 'sweep',
        title: 'Untere Innenseiten',
        cues: ['Von Rot nach Weiß fegen! 🧹', 'Innen unten – vom Zahnfleisch wegfegen!'],
        expression: 'proud',
    },
    {
        id: 'innen-oben', duration: 25, jaw: 'oben', surface: 'innen', technique: 'sweep',
        title: 'Obere Innenseiten',
        cues: ['Oben innen – nach unten fegen! 🧹', 'Fege die oberen Innenseiten sauber!'],
        expression: 'proud',
    },
    {
        id: 'jagd', duration: 20, jaw: 'beide', surface: 'jagd', technique: 'circle',
        title: 'Zahnteufel-Jagd!',
        cues: ['Jag die letzten Zahnteufel! 🦸', 'Überall noch mal drüber – schwupp!'],
        expression: 'surprised',
    },
    {
        id: 'spucken', duration: 10, jaw: 'beide', surface: 'spucken', technique: 'spit',
        title: 'Ausspucken!',
        cues: ['Spuck den Schaum aus – wie ein Drache! 🐉', 'Bürste auswaschen – fast fertig!'],
        expression: 'happy',
    },
];

/** Gesamtdauer in Sekunden – abgeleitet, kein magisches 180 mehr. */
const TOTAL_TIME = brushingPlan.reduce((sum, seg) => sum + seg.duration, 0);

/** Kumulative End-Zeitpunkte (verstrichene Sekunden) je Segment. */
function segmentBoundaries() {
    let acc = 0;
    return brushingPlan.map((seg) => (acc += seg.duration));
}

/** Segment-Index für verstrichene Sekunden (0 … TOTAL_TIME). */
function getSegmentIndexForElapsed(elapsed) {
    const e = Math.max(0, elapsed);
    const bounds = segmentBoundaries();
    for (let i = 0; i < bounds.length; i++) {
        if (e < bounds[i]) return i;
    }
    return brushingPlan.length - 1;
}

/** Segment-Index für die VERBLEIBENDE Zeit (so tickt der Timer). */
function getSegmentIndexForRemaining(remaining) {
    return getSegmentIndexForElapsed(TOTAL_TIME - remaining);
}

/** Verstrichene Sekunden INNERHALB des aktuellen Segments. */
function getElapsedInSegment(elapsed) {
    const e = Math.max(0, Math.min(TOTAL_TIME, elapsed));
    const i = getSegmentIndexForElapsed(e);
    const bounds = segmentBoundaries();
    const start = i === 0 ? 0 : bounds[i - 1];
    return e - start;
}

/** Fortschritt 0..1 innerhalb des aktuellen Segments. */
function getSegmentProgress(elapsed) {
    const i = getSegmentIndexForElapsed(elapsed);
    return Math.min(1, getElapsedInSegment(elapsed) / brushingPlan[i].duration);
}

/**
 * Bewegungs-Tipp für ein Segment. Rotiert alle 8 s durch die cues,
 * bleibt dabei aber immer beim selben Bewegungs-Thema (kein Zufallslob,
 * das die Anweisung überschreibt).
 */
function getCueForSegment(segmentIndex, elapsedInSegment) {
    const seg = brushingPlan[segmentIndex];
    if (!seg || !seg.cues || seg.cues.length === 0) return '';
    const idx = Math.floor(Math.max(0, elapsedInSegment) / 8) % seg.cues.length;
    return seg.cues[idx];
}

/** Schema-Beschriftung passend zum Kiefer. */
function getJawLabel(jaw) {
    if (jaw === 'oben') return 'Obere Zähne';
    if (jaw === 'unten') return 'Untere Zähne';
    return 'Alle Zähne';
}

// Export für Node.js-Tests
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        brushingPlan,
        TOTAL_TIME,
        segmentBoundaries,
        getSegmentIndexForElapsed,
        getSegmentIndexForRemaining,
        getElapsedInSegment,
        getSegmentProgress,
        getCueForSegment,
        getJawLabel,
    };
}
