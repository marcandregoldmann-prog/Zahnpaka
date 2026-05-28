const test = require('node:test');
const assert = require('node:assert');
const {
    COLLECT_STICKERS,
    MILESTONES,
    defaultRewardData,
    normalizeRewardData,
    getDateString,
    daysBetween,
    pickRandomSticker,
    checkMilestones,
    recordBrushing,
    getActiveStreak,
    getStickerCatalog,
    getStickerById,
    getWeekStatus,
} = require('../rewards-utils.js');

test('Sticker-Katalog Integrität', async (t) => {
    await t.test('IDs sind eindeutig', () => {
        const ids = getStickerCatalog().map(s => s.id);
        assert.strictEqual(ids.length, new Set(ids).size, 'Keine doppelten Sticker-IDs erlaubt');
    });

    await t.test('Jeder Sticker hat emoji und name', () => {
        getStickerCatalog().forEach(s => {
            assert.ok(s.emoji, `Sticker ${s.id} braucht ein emoji`);
            assert.ok(s.name, `Sticker ${s.id} braucht einen Namen`);
        });
    });

    await t.test('getStickerById findet bekannte und unbekannte IDs', () => {
        assert.ok(getStickerById(COLLECT_STICKERS[0].id), 'Bekannte ID sollte gefunden werden');
        assert.strictEqual(getStickerById('gibt-es-nicht'), null, 'Unbekannte ID liefert null');
    });
});

test('Datum-Hilfen', async (t) => {
    await t.test('getDateString formatiert YYYY-MM-DD mit führenden Nullen', () => {
        const d = new Date(2026, 0, 5); // 5. Januar 2026 (lokal)
        assert.strictEqual(getDateString(d), '2026-01-05');
    });

    await t.test('daysBetween rechnet ganze Tage', () => {
        assert.strictEqual(daysBetween('2026-01-01', '2026-01-02'), 1);
        assert.strictEqual(daysBetween('2026-01-01', '2026-01-01'), 0);
        assert.strictEqual(daysBetween('2026-01-01', '2026-01-08'), 7);
        assert.strictEqual(daysBetween('2026-01-02', '2026-01-01'), -1);
    });

    await t.test('daysBetween über Monatsgrenze', () => {
        assert.strictEqual(daysBetween('2026-01-31', '2026-02-01'), 1);
    });
});

test('normalizeRewardData härtet kaputte Eingaben ab', async (t) => {
    await t.test('null/undefined ergibt Default', () => {
        assert.deepStrictEqual(normalizeRewardData(null), defaultRewardData());
        assert.deepStrictEqual(normalizeRewardData(undefined), defaultRewardData());
    });

    await t.test('falsche Typen werden korrigiert', () => {
        const dirty = { currentStreak: 'fünf', stickers: 'nope', history: 42, totalSessions: NaN };
        const clean = normalizeRewardData(dirty);
        assert.strictEqual(clean.currentStreak, 0);
        assert.deepStrictEqual(clean.stickers, []);
        assert.deepStrictEqual(clean.history, []);
        assert.strictEqual(clean.totalSessions, 0);
    });

    await t.test('doppelte Sticker/History werden dedupliziert', () => {
        const clean = normalizeRewardData({ stickers: ['a', 'a', 'b'], history: ['2026-01-02', '2026-01-01', '2026-01-01'] });
        assert.deepStrictEqual(clean.stickers, ['a', 'b']);
        assert.deepStrictEqual(clean.history, ['2026-01-01', '2026-01-02']);
    });
});

test('pickRandomSticker bevorzugt noch nicht gesammelte', async (t) => {
    await t.test('liefert ungesammelten Sticker', () => {
        const ownedAllButOne = COLLECT_STICKERS.slice(1).map(s => s.id);
        const pick = pickRandomSticker(ownedAllButOne, () => 0);
        assert.strictEqual(pick.id, COLLECT_STICKERS[0].id, 'Sollte den einzig fehlenden wählen');
    });

    await t.test('greift auf Gesamtpool zurück, wenn alles gesammelt ist', () => {
        const ownedAll = COLLECT_STICKERS.map(s => s.id);
        const pick = pickRandomSticker(ownedAll, () => 0);
        assert.ok(pick, 'Auch bei voller Sammlung kommt ein Sticker zurück');
        assert.strictEqual(pick.id, COLLECT_STICKERS[0].id);
    });
});

test('checkMilestones', async (t) => {
    await t.test('Streak-Meilensteine schalten ab Schwelle frei', () => {
        const met = checkMilestones({ currentStreak: 7, totalSessions: 0 }).map(m => m.id);
        assert.ok(met.includes('streak3'));
        assert.ok(met.includes('streak7'));
        assert.ok(!met.includes('streak14'));
    });

    await t.test('Total-Meilensteine schalten ab Schwelle frei', () => {
        const met = checkMilestones({ currentStreak: 0, totalSessions: 10 }).map(m => m.id);
        assert.ok(met.includes('total5'));
        assert.ok(met.includes('total10'));
        assert.ok(!met.includes('total25'));
    });
});

test('recordBrushing – Serien-Logik', async (t) => {
    await t.test('Erstes Putzen startet Serie bei 1', () => {
        const { data, streakInfo } = recordBrushing(defaultRewardData(), '2026-01-01', () => 0);
        assert.strictEqual(data.currentStreak, 1);
        assert.strictEqual(data.totalSessions, 1);
        assert.strictEqual(data.lastBrushDate, '2026-01-01');
        assert.strictEqual(streakInfo.increasedToday, true);
    });

    await t.test('Putzen am Folgetag erhöht Serie', () => {
        let { data } = recordBrushing(defaultRewardData(), '2026-01-01', () => 0);
        ({ data } = recordBrushing(data, '2026-01-02', () => 0));
        assert.strictEqual(data.currentStreak, 2);
        assert.strictEqual(data.totalSessions, 2);
    });

    await t.test('Zweites Putzen am selben Tag erhöht Serie NICHT, aber Gesamtzahl', () => {
        let { data } = recordBrushing(defaultRewardData(), '2026-01-01', () => 0);
        let res = recordBrushing(data, '2026-01-01', () => 0);
        assert.strictEqual(res.data.currentStreak, 1, 'Serie bleibt bei 1');
        assert.strictEqual(res.data.totalSessions, 2, 'Gesamtzahl steigt trotzdem');
        assert.strictEqual(res.streakInfo.increasedToday, false);
    });

    await t.test('Lücke von mehr als einem Tag setzt Serie zurück', () => {
        let { data } = recordBrushing(defaultRewardData(), '2026-01-01', () => 0);
        ({ data } = recordBrushing(data, '2026-01-02', () => 0)); // streak 2
        ({ data } = recordBrushing(data, '2026-01-05', () => 0)); // Lücke → reset
        assert.strictEqual(data.currentStreak, 1, 'Serie startet nach Lücke neu');
        assert.strictEqual(data.totalSessions, 3, 'Gesamtzahl bleibt korrekt');
    });

    await t.test('longestStreak merkt sich den Rekord auch nach Reset', () => {
        let data = defaultRewardData();
        ['2026-01-01', '2026-01-02', '2026-01-03'].forEach(d => {
            ({ data } = recordBrushing(data, d, () => 0));
        });
        assert.strictEqual(data.currentStreak, 3);
        ({ data } = recordBrushing(data, '2026-01-10', () => 0)); // Lücke
        assert.strictEqual(data.currentStreak, 1, 'aktuelle Serie zurückgesetzt');
        assert.strictEqual(data.longestStreak, 3, 'Rekord bleibt erhalten');
    });

    await t.test('Verlauf bekommt pro Tag genau einen Eintrag', () => {
        let { data } = recordBrushing(defaultRewardData(), '2026-01-01', () => 0);
        ({ data } = recordBrushing(data, '2026-01-01', () => 0)); // selber Tag nochmal
        ({ data } = recordBrushing(data, '2026-01-02', () => 0));
        assert.deepStrictEqual(data.history, ['2026-01-01', '2026-01-02']);
    });
});

test('recordBrushing – Sticker-Vergabe', async (t) => {
    await t.test('Jede Einheit vergibt einen neuen Sammel-Sticker (solange Vorrat)', () => {
        const { newStickers } = recordBrushing(defaultRewardData(), '2026-01-01', () => 0);
        assert.ok(newStickers.length >= 1, 'Mindestens ein neuer Sticker');
        assert.strictEqual(newStickers[0].type, 'collect');
    });

    await t.test('Meilenstein wird zusammen mit Sammel-Sticker vergeben', () => {
        // 4 Tage in Folge → 'streak3' sollte beim 3. Tag erscheinen
        let data = defaultRewardData();
        let res;
        ['2026-01-01', '2026-01-02', '2026-01-03'].forEach(d => {
            res = recordBrushing(data, d, () => 0);
            data = res.data;
        });
        const ids = res.newStickers.map(s => s.id);
        assert.ok(ids.includes('streak3'), 'streak3 sollte am 3. Tag freigeschaltet werden');
        assert.ok(data.stickers.includes('streak3'));
    });

    await t.test('isNewRecord nur bei echtem neuen Rekord (>1, nicht selber Tag)', () => {
        let { data } = recordBrushing(defaultRewardData(), '2026-01-01', () => 0); // streak 1 → kein Rekord-Flag
        const res = recordBrushing(data, '2026-01-02', () => 0); // streak 2 → Rekord
        assert.strictEqual(res.streakInfo.isNewRecord, true);
    });

    await t.test('Sammel-Sticker werden nicht doppelt gespeichert', () => {
        // rng immer 0 → würde immer den ersten ungesammelten nehmen; nie Duplikat
        let data = defaultRewardData();
        for (let i = 0; i < 5; i++) {
            ({ data } = recordBrushing(data, `2026-02-0${i + 1}`, () => 0));
        }
        assert.strictEqual(data.stickers.length, new Set(data.stickers).size, 'Keine Duplikate in der Sammlung');
    });
});

test('getActiveStreak – ruht nach verpassten Tagen', async (t) => {
    await t.test('ohne Verlauf ist die Serie 0', () => {
        assert.strictEqual(getActiveStreak(defaultRewardData(), '2026-01-10'), 0);
    });

    await t.test('heute geputzt → Serie lebt', () => {
        const d = { lastBrushDate: '2026-01-10', currentStreak: 4 };
        assert.strictEqual(getActiveStreak(d, '2026-01-10'), 4);
    });

    await t.test('gestern geputzt → Serie lebt noch', () => {
        const d = { lastBrushDate: '2026-01-09', currentStreak: 4 };
        assert.strictEqual(getActiveStreak(d, '2026-01-10'), 4);
    });

    await t.test('zwei Tage Lücke → Serie ruht (0)', () => {
        const d = { lastBrushDate: '2026-01-08', currentStreak: 4 };
        assert.strictEqual(getActiveStreak(d, '2026-01-10'), 0);
    });
});

test('getWeekStatus', async (t) => {
    await t.test('liefert 7 Tage, heute als letzten', () => {
        const week = getWeekStatus([], '2026-01-08');
        assert.strictEqual(week.length, 7);
        assert.strictEqual(week[6].date, '2026-01-08');
        assert.strictEqual(week[6].isToday, true);
        assert.strictEqual(week[0].date, '2026-01-02');
    });

    await t.test('markiert geputzte Tage als done', () => {
        const week = getWeekStatus(['2026-01-08', '2026-01-06', '2025-12-01'], '2026-01-08');
        const byDate = Object.fromEntries(week.map(d => [d.date, d.done]));
        assert.strictEqual(byDate['2026-01-08'], true);
        assert.strictEqual(byDate['2026-01-06'], true);
        assert.strictEqual(byDate['2026-01-07'], false);
    });
});
