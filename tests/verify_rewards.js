/* End-to-End-Verifikation der Belohnungswelt + Screenshots.
   Startet die App in echtem Chromium (file://), spielt den
   kompletten Putz-Flow durch, prüft die Sticker-Vergabe und
   macht Screenshots von Start-Badge, Sticker-Enthüllung & Album. */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const OUT = process.env.SHOT_DIR || '/tmp/zahnpaka';
fs.mkdirSync(OUT, { recursive: true });

const ymd = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

function fail(msg) { console.error('❌ ' + msg); process.exitCode = 1; }
function ok(msg)   { console.log('✅ ' + msg); }

(async () => {
    const browser = await chromium.launch();
    const ctx = await browser.newContext({ viewport: { width: 414, height: 820 }, deviceScaleFactor: 2 });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });

    const file = 'file://' + path.join(process.cwd(), 'index.html');

    /* ---------- 1) ECHTER END-TO-END-FLOW ---------- */
    await page.goto(file);
    await page.waitForFunction(() => typeof finish === 'function' && typeof state === 'object');

    await page.fill('#child-name', 'Mia');
    await page.click('#btn-start');
    await page.waitForSelector('#screen-buddy.active', { timeout: 10000 });
    await page.click('.buddy-card[data-buddy="katze"]');
    await page.click('#btn-buddy-confirm');
    await page.waitForSelector('#screen-intro.active', { timeout: 5000 });
    await page.click('#btn-intro-skip');
    await page.waitForSelector('#screen-timer.active', { timeout: 5000 });
    ok('Flow bis Timer-Screen erreicht');

    // Putzen ohne 3 Minuten Wartezeit abschließen
    await page.evaluate(() => { state.timer = 0; finish(); });
    await page.waitForSelector('#screen-finish.active', { timeout: 5000 });

    const reveal = await page.evaluate(() => {
        const el = document.getElementById('reward-reveal');
        return {
            hasStreakLine: !!el.querySelector('.reward-streak-line'),
            stickerCards: el.querySelectorAll('.reward-sticker-card').length,
            streakText: el.querySelector('.reward-streak-line')?.textContent || '',
            stored: JSON.parse(localStorage.getItem('zahnpaka-rewards') || '{}'),
        };
    });
    if (reveal.hasStreakLine) ok('Finish: Serien-Zeile sichtbar ("' + reveal.streakText.trim() + '")');
    else fail('Finish: Serien-Zeile fehlt');
    if (reveal.stickerCards >= 1) ok('Finish: ' + reveal.stickerCards + ' neue(r) Sticker enthüllt');
    else fail('Finish: kein Sticker enthüllt');
    if (reveal.stored.totalSessions === 1 && reveal.stored.currentStreak === 1) ok('LocalStorage korrekt verbucht (1 Einheit, Serie 1)');
    else fail('LocalStorage falsch: ' + JSON.stringify(reveal.stored));

    /* ---------- 2) HÜBSCHE SCREENSHOTS MIT REICHEN DATEN ---------- */
    const today = new Date();

    // (a) Finish-Screen mit Meilenstein-Enthüllung: 24 → 25 Einheiten, Serie 6 → 7
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    const milestoneSeed = {
        lastBrushDate: ymd(yesterday),
        currentStreak: 6,
        longestStreak: 6,
        totalSessions: 24,
        stickers: ['rainbow', 'unicorn', 'butterfly', 'dolphin', 'panda', 'fox', 'streak3', 'total5', 'total10'],
        history: [4, 3, 2, 1].map(n => { const d = new Date(today); d.setDate(today.getDate() - n); return ymd(d); }),
    };
    await page.evaluate((seed) => {
        localStorage.setItem('zahnpaka-rewards', JSON.stringify(seed));
    }, milestoneSeed);
    await page.reload();
    await page.waitForFunction(() => typeof finish === 'function');
    await page.evaluate(() => { state.name = 'Mia'; finish(); });
    await page.waitForSelector('#screen-finish.active');
    await page.waitForTimeout(1100); // Flip-Animation abwarten
    const milestoneReveal = await page.evaluate(() => ({
        streak: document.querySelector('.reward-streak-line')?.textContent || '',
        cards: [...document.querySelectorAll('.reward-sticker-card .reward-sticker-name')].map(n => n.textContent),
    }));
    ok('Meilenstein-Enthüllung: "' + milestoneReveal.streak.trim() + '" → ' + JSON.stringify(milestoneReveal.cards));
    await page.locator('#app-container').screenshot({ path: path.join(OUT, 'finish_reveal.png') });

    // (b) Album mit voller Sammlung
    await page.evaluate(() => {
        const c = document.getElementById('app-container');
        c.style.maxHeight = 'none';
        c.style.height = 'auto';
        const s = document.getElementById('screen-album');
        if (s) s.style.height = 'auto';
        openAlbum('screen-finish');
    });
    await page.waitForTimeout(500);
    await page.locator('#app-container').screenshot({ path: path.join(OUT, 'album.png') });
    const albumCounts = await page.evaluate(() => ({
        stickers: document.querySelectorAll('#album-stickers .album-sticker').length,
        owned: document.querySelectorAll('#album-stickers .album-sticker.owned').length,
        days: document.querySelectorAll('#album-week .album-day').length,
    }));
    if (albumCounts.stickers === 26 && albumCounts.days === 7) ok('Album: ' + albumCounts.owned + '/26 Sticker, 7 Wochentage');
    else fail('Album-Struktur unerwartet: ' + JSON.stringify(albumCounts));

    // (c) Start-Screen mit Streak-Badge
    await page.evaluate(() => {
        const c = document.getElementById('app-container');
        c.style.maxHeight = '';
        c.style.height = '';
        showScreen('screen-start');
        renderStreakBadge();
    });
    await page.waitForTimeout(400);
    await page.locator('#app-container').screenshot({ path: path.join(OUT, 'start_badge.png') });

    if (errors.length) { console.error('Browser-Fehler:\n' + errors.join('\n')); process.exitCode = 1; }
    else ok('Keine kritischen Browser-Fehler');

    await browser.close();
    console.log('\n📸 Screenshots in ' + OUT);
})().catch(e => { console.error(e); process.exit(1); });
