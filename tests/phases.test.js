const test = require('node:test');
const assert = require('node:assert');
const { getPhaseIndexForTime, phases } = require('../phase-utils.js');

test('Phase Transitions (KAI Method - 6 Phases)', async (t) => {
    // Phases:
    // 0: 180-151 (Kauflächen unten)
    // 1: 150-121 (Kauflächen oben)
    // 2: 120-91 (Außenflächen)
    // 3: 90-41 (Innenflächen)
    // 4: 40-11 (Zahnteufel-Jagd)
    // 5: 10-0 (Endspurt)

    await t.test('Phase 0 boundaries (180 to 151)', () => {
        assert.strictEqual(getPhaseIndexForTime(180), 0, '180 should be Phase 0');
        assert.strictEqual(getPhaseIndexForTime(160), 0, '160 should be Phase 0');
        assert.strictEqual(getPhaseIndexForTime(151), 0, '151 should be Phase 0');
    });

    await t.test('Phase 1 boundaries (150 to 121)', () => {
        assert.strictEqual(getPhaseIndexForTime(150), 1, '150 should be Phase 1');
        assert.strictEqual(getPhaseIndexForTime(135), 1, '135 should be Phase 1');
        assert.strictEqual(getPhaseIndexForTime(121), 1, '121 should be Phase 1');
    });

    await t.test('Phase 2 boundaries (120 to 91)', () => {
        assert.strictEqual(getPhaseIndexForTime(120), 2, '120 should be Phase 2');
        assert.strictEqual(getPhaseIndexForTime(100), 2, '100 should be Phase 2');
        assert.strictEqual(getPhaseIndexForTime(91), 2, '91 should be Phase 2');
    });

    await t.test('Phase 3 boundaries (90 to 41)', () => {
        assert.strictEqual(getPhaseIndexForTime(90), 3, '90 should be Phase 3');
        assert.strictEqual(getPhaseIndexForTime(60), 3, '60 should be Phase 3');
        assert.strictEqual(getPhaseIndexForTime(41), 3, '41 should be Phase 3');
    });

    await t.test('Phase 4 boundaries (40 to 11)', () => {
        assert.strictEqual(getPhaseIndexForTime(40), 4, '40 should be Phase 4');
        assert.strictEqual(getPhaseIndexForTime(20), 4, '20 should be Phase 4');
        assert.strictEqual(getPhaseIndexForTime(11), 4, '11 should be Phase 4');
    });

    await t.test('Phase 5 boundaries (10 to 0)', () => {
        assert.strictEqual(getPhaseIndexForTime(10), 5, '10 should be Phase 5');
        assert.strictEqual(getPhaseIndexForTime(5), 5, '5 should be Phase 5');
        assert.strictEqual(getPhaseIndexForTime(0), 5, '0 should be Phase 5');
    });

    await t.test('Check phase count', () => {
        assert.strictEqual(phases.length, 6, 'Should have 6 phases defined');
    });

    await t.test('Edge cases', () => {
        // Values > 180 or < 0 default to last phase in implementation (usually)
        // Implementation:
        // for loop checks if (timer <= p.startAt && timer >= p.endAt)
        // If not found, returns phases.length - 1 (Phase 5)

        // 200 is not in any range (max is 180), so it falls through to default (5)
        assert.strictEqual(getPhaseIndexForTime(200), 5, 'Values above 180 default to last phase');

        // -1 is not in any range (min is 0), so it falls through to default (5)
        assert.strictEqual(getPhaseIndexForTime(-1), 5, 'Negative values default to last phase');
    });
});
