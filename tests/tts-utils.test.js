const test = require('node:test');
const assert = require('node:assert');
const { sanitizeTTS } = require('../tts-utils.js');

test('TTS Sanitization', async (t) => {
    await t.test('removes emojis from the original range', () => {
        assert.strictEqual(sanitizeTTS('Hallo 🦙'), 'Hallo');
        assert.strictEqual(sanitizeTTS('🐱 Mia sagt hallo'), 'Mia sagt hallo');
        assert.strictEqual(sanitizeTTS('Zähneputzen ist toll! 🦷'), 'Zähneputzen ist toll!');
    });

    await t.test('handles text without emojis', () => {
        assert.strictEqual(sanitizeTTS('Hallo Welt'), 'Hallo Welt');
        assert.strictEqual(sanitizeTTS('123'), '123');
    });

    await t.test('trims whitespace', () => {
        assert.strictEqual(sanitizeTTS('  Hallo  '), 'Hallo');
        assert.strictEqual(sanitizeTTS('🦙  Test  🦙'), 'Test');
    });

    await t.test('handles empty or non-string input', () => {
        assert.strictEqual(sanitizeTTS(''), '');
        assert.strictEqual(sanitizeTTS(null), '');
        assert.strictEqual(sanitizeTTS(undefined), '');
        assert.strictEqual(sanitizeTTS(123), '');
    });

    await t.test('removes symbols like stars and sparkles', () => {
        assert.strictEqual(sanitizeTTS('Super! ⭐'), 'Super!');
        assert.strictEqual(sanitizeTTS('Glitzer ✨'), 'Glitzer');
    });

    await t.test('removes newer emojis (higher code points)', () => {
        assert.strictEqual(sanitizeTTS('Feder 🪶'), 'Feder');
        assert.strictEqual(sanitizeTTS('Hände 🤝'), 'Hände');
    });

    await t.test('removes multiple mixed emojis and symbols', () => {
        assert.strictEqual(sanitizeTTS('✨ 🦙 ⭐ 🦷 🪶'), '');
        assert.strictEqual(sanitizeTTS('Profis ⭐ putzen 🦷 gründlich ✨'), 'Profis putzen gründlich');
    });
});
