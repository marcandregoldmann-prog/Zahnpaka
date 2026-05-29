const test = require('node:test');
const assert = require('node:assert');
const {
    brushingPlan,
    TOTAL_TIME,
    segmentBoundaries,
    getSegmentIndexForElapsed,
    getSegmentIndexForRemaining,
    getElapsedInSegment,
    getSegmentProgress,
    getCueForSegment,
    getJawLabel,
} = require('../phase-utils.js');

test('Putz-Plan – Struktur & Invarianten', async (t) => {
    await t.test('8 Segmente, Gesamtdauer 180 s', () => {
        assert.strictEqual(brushingPlan.length, 8);
        assert.strictEqual(TOTAL_TIME, 180);
        assert.strictEqual(brushingPlan.reduce((s, x) => s + x.duration, 0), TOTAL_TIME);
    });

    await t.test('Jedes Segment ist vollständig & konsistent', () => {
        const validJaw = ['oben', 'unten', 'beide'];
        const validTech = ['scrub', 'circle', 'sweep', 'spit'];
        brushingPlan.forEach((seg) => {
            assert.ok(validJaw.includes(seg.jaw), `${seg.id}: gültiger Kiefer`);
            assert.ok(validTech.includes(seg.technique), `${seg.id}: gültige Technik`);
            assert.ok(seg.title && seg.title.length > 0, `${seg.id}: Titel`);
            assert.ok(Array.isArray(seg.cues) && seg.cues.length > 0, `${seg.id}: Tipps`);
        });
    });

    await t.test('KAI: Fläche und Technik passen immer zusammen', () => {
        // Genau das verhindert den gemeldeten Mismatch (Anweisung != Bewegung).
        const map = { kauflaeche: 'scrub', aussen: 'circle', innen: 'sweep', spucken: 'spit' };
        brushingPlan.forEach((seg) => {
            if (map[seg.surface]) {
                assert.strictEqual(seg.technique, map[seg.surface],
                    `${seg.id}: Fläche ${seg.surface} muss Technik ${map[seg.surface]} haben`);
            }
        });
    });
});

test('Segment-Index aus verstrichener Zeit', async (t) => {
    await t.test('Grenzen liegen exakt richtig', () => {
        assert.strictEqual(getSegmentIndexForElapsed(0), 0);
        assert.strictEqual(getSegmentIndexForElapsed(24), 0);
        assert.strictEqual(getSegmentIndexForElapsed(25), 1, '25 s -> Segment 1');
        assert.strictEqual(getSegmentIndexForElapsed(149), 5);
        assert.strictEqual(getSegmentIndexForElapsed(150), 6, '150 s -> Jagd');
        assert.strictEqual(getSegmentIndexForElapsed(170), 7, '170 s -> Ausspucken');
        assert.strictEqual(getSegmentIndexForElapsed(180), 7);
    });

    await t.test('Randfälle clampen auf gültigen Bereich', () => {
        assert.strictEqual(getSegmentIndexForElapsed(-5), 0);
        assert.strictEqual(getSegmentIndexForElapsed(9999), brushingPlan.length - 1);
    });

    await t.test('Grenzen entsprechen den kumulierten Dauern', () => {
        assert.deepStrictEqual(segmentBoundaries(), [25, 50, 75, 100, 125, 150, 170, 180]);
    });
});

test('Uhr & Segment bleiben synchron (remaining <-> elapsed)', async (t) => {
    await t.test('verbleibende Zeit ergibt dasselbe Segment wie verstrichene', () => {
        for (let elapsed = 0; elapsed <= TOTAL_TIME; elapsed++) {
            const remaining = TOTAL_TIME - elapsed;
            assert.strictEqual(
                getSegmentIndexForRemaining(remaining),
                getSegmentIndexForElapsed(elapsed),
                `Desync bei elapsed=${elapsed}`
            );
        }
    });

    await t.test('Beispiele am Timer (verbleibende Sekunden)', () => {
        assert.strictEqual(getSegmentIndexForRemaining(180), 0, 'Start');
        assert.strictEqual(getSegmentIndexForRemaining(155), 1);
        assert.strictEqual(getSegmentIndexForRemaining(11), 6, '11 s übrig -> noch Jagd');
        assert.strictEqual(getSegmentIndexForRemaining(10), 7, '10 s übrig -> Ausspucken');
        assert.strictEqual(getSegmentIndexForRemaining(0), 7, 'Ende');
    });
});

test('Segment-Fortschritt', async (t) => {
    await t.test('0 am Segmentanfang, 1 am Segmentende', () => {
        assert.strictEqual(getSegmentProgress(0), 0);
        assert.strictEqual(getSegmentProgress(25), 0, 'Anfang Segment 1');
        assert.strictEqual(getElapsedInSegment(37), 12, '37 s -> 12 s in Segment 1');
        assert.ok(Math.abs(getSegmentProgress(37) - 12 / 25) < 1e-9);
        assert.strictEqual(getSegmentProgress(180), 1, 'Ende = voll');
    });
});

test('Bewegungs-Tipps rotieren, bleiben aber on-message', async (t) => {
    await t.test('Rotation alle 8 s durch die Tipps des Segments', () => {
        const seg0 = brushingPlan[0];
        assert.strictEqual(getCueForSegment(0, 0), seg0.cues[0]);
        assert.strictEqual(getCueForSegment(0, 7), seg0.cues[0]);
        assert.strictEqual(getCueForSegment(0, 8), seg0.cues[1]);
        assert.strictEqual(getCueForSegment(0, 16), seg0.cues[0], 'wrap-around');
    });

    await t.test('leere/ungültige Eingaben liefern leeren String', () => {
        assert.strictEqual(getCueForSegment(999, 0), '');
    });
});

test('Kiefer-Beschriftung passt zum Kiefer', async (t) => {
    await t.test('oben / unten / beide', () => {
        assert.strictEqual(getJawLabel('oben'), 'Obere Zähne');
        assert.strictEqual(getJawLabel('unten'), 'Untere Zähne');
        assert.strictEqual(getJawLabel('beide'), 'Alle Zähne');
    });
});
