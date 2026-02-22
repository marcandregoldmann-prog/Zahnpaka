const test = require('node:test');
const assert = require('node:assert');
const { getPhaseIndexForTime } = require('../phase-utils.js');

test('Phase Transitions', async (t) => {
    await t.test('Phase 0 boundaries (180 to 121)', () => {
        assert.strictEqual(getPhaseIndexForTime(180), 0, '180 should be Phase 0');
        assert.strictEqual(getPhaseIndexForTime(150), 0, '150 should be Phase 0');
        // Boundary case: 121
        assert.strictEqual(getPhaseIndexForTime(121), 0, '121 should be Phase 0');
    });

    await t.test('Phase 1 boundaries (120 to 61)', () => {
        assert.strictEqual(getPhaseIndexForTime(120), 1, '120 should be Phase 1');
        assert.strictEqual(getPhaseIndexForTime(90), 1, '90 should be Phase 1');
        // Boundary case: 61
        assert.strictEqual(getPhaseIndexForTime(61), 1, '61 should be Phase 1');
    });

    await t.test('Phase 2 boundaries (60 to 11)', () => {
        assert.strictEqual(getPhaseIndexForTime(60), 2, '60 should be Phase 2');
        assert.strictEqual(getPhaseIndexForTime(30), 2, '30 should be Phase 2');
        // Boundary case: 11
        assert.strictEqual(getPhaseIndexForTime(11), 2, '11 should be Phase 2');
    });

    await t.test('Phase 3 boundaries (10 to 0)', () => {
        assert.strictEqual(getPhaseIndexForTime(10), 3, '10 should be Phase 3');
        assert.strictEqual(getPhaseIndexForTime(5), 3, '5 should be Phase 3');
        assert.strictEqual(getPhaseIndexForTime(0), 3, '0 should be Phase 3');
    });

    await t.test('Values between phases', () => {
        // These values currently fall through in the buggy version
        // 121, 61, 11
        // We already tested them above, but let's be explicit about what they should be.
    });

    await t.test('Edge cases', () => {
        assert.strictEqual(getPhaseIndexForTime(200), 3, 'Values above 180 default to last phase in current logic');
        assert.strictEqual(getPhaseIndexForTime(-1), 3, 'Negative values default to last phase');
    });
});
