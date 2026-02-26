const test = require('node:test');
const assert = require('node:assert');
const { buddyInfo, buddySvgs } = require('../buddy-svgs.js');

test('Buddy Data Structure', async (t) => {
    await t.test('buddyInfo contains all characters', () => {
        const expectedBuddies = ['alpaka', 'katze', 'huhn'];
        expectedBuddies.forEach(buddy => {
            assert.ok(buddyInfo[buddy], `Missing info for ${buddy}`);
            assert.ok(buddyInfo[buddy].name, `Missing name for ${buddy}`);
            assert.ok(buddyInfo[buddy].greeting, `Missing greeting for ${buddy}`);
        });
    });

    await t.test('buddySvgs contains all characters and variants', () => {
        const expectedBuddies = ['alpaka', 'katze', 'huhn'];
        const variants = ['idle', 'brushing', 'celebrate'];

        expectedBuddies.forEach(buddy => {
            assert.ok(buddySvgs[buddy], `Missing SVGs for ${buddy}`);
            variants.forEach(variant => {
                const svg = buddySvgs[buddy][variant];
                assert.ok(svg, `Missing ${variant} SVG for ${buddy}`);
                assert.ok(typeof svg === 'string', `${variant} SVG for ${buddy} should be a string`);
                assert.ok(svg.length > 0, `${variant} SVG for ${buddy} should not be empty`);
                assert.match(svg, /<svg/, `${variant} SVG for ${buddy} should contain <svg tag`);
            });
        });
    });
});
