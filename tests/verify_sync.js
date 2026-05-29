/* Beweist im echten DOM, dass Uhr, Zahnschema, Anweisung UND die
   Bürsten-Animation synchron zum selben Segment laufen – genau der
   Punkt, der vorher auseinanderlief. Macht außerdem einen Screenshot
   des Timer-Screens mitten im Putzen. */
const { chromium } = require('playwright');
const path = require('path');

const OUT = process.env.SHOT_DIR || '/tmp/zahnpaka';
require('fs').mkdirSync(OUT, { recursive: true });

const jawLabel = (jaw) => (jaw === 'oben' ? 'Obere Zähne' : jaw === 'unten' ? 'Untere Zähne' : 'Alle Zähne');
let failures = 0;
const ok = (m) => console.log('✅ ' + m);
const bad = (m) => { console.error('❌ ' + m); failures++; };

(async () => {
    const browser = await chromium.launch();
    const ctx = await browser.newContext({ viewport: { width: 414, height: 820 }, deviceScaleFactor: 2 });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => bad('PAGEERROR: ' + e.message));

    await page.goto('file://' + path.join(process.cwd(), 'index.html'));
    await page.waitForFunction(() => typeof updateDisplay === 'function' && typeof getSegmentIndexForRemaining === 'function');

    // Bis zum Timer-Screen klicken
    await page.fill('#child-name', 'Mia');
    await page.click('#btn-start');
    await page.waitForSelector('#screen-buddy.active', { timeout: 10000 });
    await page.click('#btn-buddy-confirm');
    await page.waitForSelector('#screen-intro.active', { timeout: 5000 });
    await page.click('#btn-intro-skip');
    await page.waitForSelector('#screen-timer.active', { timeout: 5000 });
    ok('Timer-Screen erreicht');

    // Für jede verbleibende Zeit: DOM gegen das Segment der Wahrheitsquelle prüfen
    const samples = [180, 155, 130, 100, 70, 45, 20, 8];
    for (const remaining of samples) {
        const snap = await page.evaluate((r) => {
            state.timer = r;
            updateDisplay();
            const i = getSegmentIndexForRemaining(r);
            const seg = brushingPlan[i];
            return {
                i, title: seg.title, jaw: seg.jaw, technique: seg.technique, surface: seg.surface, cues: seg.cues,
                instr: document.getElementById('instruction-text').textContent.trim(),
                obenActive: document.getElementById('zone-oben').classList.contains('active-zone'),
                untenActive: document.getElementById('zone-unten').classList.contains('active-zone'),
                zoneLabel: document.getElementById('zone-label').textContent.trim(),
                brushClass: document.getElementById('demo-brush').className,
                cue: document.getElementById('speech-text').textContent.trim(),
                timer: document.getElementById('timer-display').textContent.trim(),
            };
        }, remaining);

        const tag = `${remaining}s → Seg ${snap.i} (${snap.title})`;
        let good = true;

        if (snap.instr !== snap.title) { bad(`${tag}: Überschrift "${snap.instr}" != Segment-Titel`); good = false; }

        const jawOk = snap.jaw === 'oben' ? (snap.obenActive && !snap.untenActive)
            : snap.jaw === 'unten' ? (snap.untenActive && !snap.obenActive)
            : (snap.obenActive && snap.untenActive);
        if (!jawOk) { bad(`${tag}: Schema-Markierung passt nicht zu jaw=${snap.jaw} (oben=${snap.obenActive}, unten=${snap.untenActive})`); good = false; }

        if (snap.zoneLabel !== jawLabel(snap.jaw)) { bad(`${tag}: Label "${snap.zoneLabel}" != "${jawLabel(snap.jaw)}"`); good = false; }

        if (!snap.brushClass.includes('tech-' + snap.technique) || !snap.brushClass.includes('surf-' + snap.surface)) {
            bad(`${tag}: Bürste "${snap.brushClass}" passt nicht zu ${snap.surface}/${snap.technique}`); good = false;
        }

        if (!snap.cues.includes(snap.cue)) { bad(`${tag}: Tipp "${snap.cue}" gehört nicht zum Segment`); good = false; }

        const mm = Math.floor(remaining / 60), ss = String(remaining % 60).padStart(2, '0');
        if (snap.timer !== `${mm}:${ss}`) { bad(`${tag}: Uhr "${snap.timer}" != ${mm}:${ss}`); good = false; }

        if (good) ok(`${tag}: Uhr+Schema+Anweisung+Bürste synchron (${snap.jaw}, ${snap.technique})`);
    }

    // Screenshot mitten im Putzen: Außenseiten oben (Kreise).
    // Timer-Schleife anhalten, sonst überschreibt sie state.timer beim Warten.
    await page.evaluate(() => {
        if (state.interval) { clearInterval(state.interval); state.interval = null; }
        state.timer = 100;
        updateDisplay();
    });
    await page.waitForTimeout(500);
    await page.locator('#app-container').screenshot({ path: path.join(OUT, 'timer_sync.png') });
    ok('Screenshot timer_sync.png erzeugt');

    await browser.close();
    if (failures) { console.error(`\n${failures} Fehler`); process.exit(1); }
    console.log('\nAlle Synchronitäts-Checks bestanden.');
})().catch((e) => { console.error(e); process.exit(1); });
