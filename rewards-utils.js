/* =============================================
   ZAHNPAKA – rewards-utils.js
   Belohnungswelt: Putz-Serien (Streaks) &
   Sticker-Sammlung. Motiviert Kinder, jeden
   Tag wiederzukommen.

   Reine Logik – läuft im Browser UND in Node
   (für Tests). Kein DOM-Zugriff hier!
   ============================================= */

'use strict';

const REWARDS_STORAGE_KEY = 'zahnpaka-rewards';

/* ---- SAMMEL-STICKER ----
   Werden nach jedem abgeschlossenen Putzen zufällig
   vergeben (bevorzugt noch nicht gesammelte). */
const COLLECT_STICKERS = [
    { id: 'rainbow',  emoji: '🌈', name: 'Regenbogen'      },
    { id: 'unicorn',  emoji: '🦄', name: 'Einhorn'         },
    { id: 'butterfly',emoji: '🦋', name: 'Schmetterling'   },
    { id: 'blossom',  emoji: '🌸', name: 'Kirschblüte'     },
    { id: 'sunflower',emoji: '🌻', name: 'Sonnenblume'     },
    { id: 'balloon',  emoji: '🎈', name: 'Luftballon'      },
    { id: 'dolphin',  emoji: '🐬', name: 'Delfin'          },
    { id: 'turtle',   emoji: '🐢', name: 'Schildkröte'     },
    { id: 'whale',    emoji: '🐳', name: 'Wal'             },
    { id: 'panda',    emoji: '🐼', name: 'Panda'           },
    { id: 'lion',     emoji: '🦁', name: 'Löwe'            },
    { id: 'owl',      emoji: '🦉', name: 'Eule'            },
    { id: 'fox',      emoji: '🦊', name: 'Fuchs'           },
    { id: 'penguin',  emoji: '🐧', name: 'Pinguin'         },
    { id: 'bee',      emoji: '🐝', name: 'Biene'           },
    { id: 'ladybug',  emoji: '🐞', name: 'Marienkäfer'     },
    { id: 'frog',     emoji: '🐸', name: 'Frosch'          },
    { id: 'octopus',  emoji: '🐙', name: 'Krake'           },
];

/* ---- MEILENSTEIN-STICKER ----
   Werden an Bedingungen geknüpft freigeschaltet.
   kind: 'streak' = Tage in Folge, 'total' = Putz-Einheiten gesamt. */
const MILESTONES = [
    { id: 'streak3',  emoji: '🔥', name: 'Drei-Tage-Flamme',  kind: 'streak', value: 3,  hint: '3 Tage in Folge putzen' },
    { id: 'streak7',  emoji: '🏅', name: 'Wochen-Held',       kind: 'streak', value: 7,  hint: '7 Tage in Folge putzen' },
    { id: 'streak14', emoji: '🏆', name: 'Zwei-Wochen-Pokal', kind: 'streak', value: 14, hint: '14 Tage in Folge putzen' },
    { id: 'streak30', emoji: '👑', name: 'Putz-König',        kind: 'streak', value: 30, hint: '30 Tage in Folge putzen' },
    { id: 'total5',   emoji: '🦷', name: 'Glanz-Sammler',     kind: 'total',  value: 5,  hint: '5-mal Zähne putzen' },
    { id: 'total10',  emoji: '💎', name: 'Diamant-Zahn',      kind: 'total',  value: 10, hint: '10-mal Zähne putzen' },
    { id: 'total25',  emoji: '🌟', name: 'Super-Sammler',     kind: 'total',  value: 25, hint: '25-mal Zähne putzen' },
    { id: 'total50',  emoji: '🚀', name: 'Putz-Rakete',       kind: 'total',  value: 50, hint: '50-mal Zähne putzen' },
];

/* ---- DATEN-GRUNDGERÜST ---- */
function defaultRewardData() {
    return {
        lastBrushDate: null,   // 'YYYY-MM-DD' des letzten Putzens
        currentStreak: 0,      // aktuelle Serie in Tagen
        longestStreak: 0,      // beste je erreichte Serie
        totalSessions: 0,      // Anzahl abgeschlossener Putz-Einheiten
        stickers: [],          // Liste gesammelter Sticker-IDs (eindeutig)
        history: [],           // Liste der Tage (für Wochenkalender)
    };
}

/* Stellt sicher, dass ein (evtl. unvollständiges) Objekt das volle
   Schema hat – schützt vor manipuliertem/altem LocalStorage. */
function normalizeRewardData(data) {
    const base = defaultRewardData();
    if (!data || typeof data !== 'object') return base;
    return {
        lastBrushDate: typeof data.lastBrushDate === 'string' ? data.lastBrushDate : null,
        currentStreak: Number.isFinite(data.currentStreak) ? data.currentStreak : 0,
        longestStreak: Number.isFinite(data.longestStreak) ? data.longestStreak : 0,
        totalSessions: Number.isFinite(data.totalSessions) ? data.totalSessions : 0,
        stickers: Array.isArray(data.stickers) ? [...new Set(data.stickers)] : [],
        history: Array.isArray(data.history) ? [...new Set(data.history)].sort() : [],
    };
}

/* ---- DATUM-HILFEN (lokale Zeit, nicht UTC) ---- */
function getDateString(date = new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

/* Ganze Tage zwischen zwei 'YYYY-MM-DD'-Strings (b minus a). */
function daysBetween(dateStrA, dateStrB) {
    const a = new Date(dateStrA + 'T00:00:00');
    const b = new Date(dateStrB + 'T00:00:00');
    return Math.round((b - a) / 86400000);
}

/* ---- STICKER-AUSWAHL ---- */
/* Wählt einen Sammel-Sticker. Bevorzugt noch nicht gesammelte,
   damit die Sammlung wächst. rng ist injizierbar (für Tests). */
function pickRandomSticker(ownedIds = [], rng = Math.random) {
    const owned = new Set(ownedIds);
    const unowned = COLLECT_STICKERS.filter(s => !owned.has(s.id));
    const pool = unowned.length > 0 ? unowned : COLLECT_STICKERS;
    if (pool.length === 0) return null;
    return pool[Math.floor(rng() * pool.length)];
}

/* Liefert alle aktuell erfüllten Meilensteine (egal ob schon besessen). */
function checkMilestones(data) {
    return MILESTONES.filter(m => {
        if (m.kind === 'streak') return data.currentStreak >= m.value;
        if (m.kind === 'total')  return data.totalSessions >= m.value;
        return false;
    });
}

/* ---- KERN: EIN PUTZEN VERBUCHEN ----
   Aktualisiert Serie, Gesamtzahl, Verlauf und vergibt Sticker.
   Gibt das neue Daten-Objekt + die NEU gewonnenen Sticker zurück. */
function recordBrushing(data, todayStr = getDateString(), rng = Math.random) {
    const result = normalizeRewardData(data);
    const newStickers = [];
    const alreadyBrushedToday = result.lastBrushDate === todayStr;

    /* --- Serie (Streak) --- */
    if (!result.lastBrushDate) {
        result.currentStreak = 1;
    } else {
        const gap = daysBetween(result.lastBrushDate, todayStr);
        if (gap === 1) {
            result.currentStreak += 1;          // genau am Folgetag → +1
        } else if (gap > 1) {
            result.currentStreak = 1;           // Lücke → Serie beginnt neu
        }
        // gap === 0 (selber Tag) oder gap < 0 (Uhr verstellt): Serie bleibt
    }
    result.longestStreak = Math.max(result.longestStreak, result.currentStreak);

    /* --- Gesamtzahl: jede abgeschlossene Einheit zählt --- */
    result.totalSessions += 1;

    /* --- Verlauf: ein Eintrag pro Tag --- */
    if (!result.history.includes(todayStr)) {
        result.history.push(todayStr);
        result.history.sort();
        if (result.history.length > 60) result.history = result.history.slice(-60);
    }
    result.lastBrushDate = todayStr;

    /* --- Sammel-Sticker (einer pro Einheit, falls noch neu) --- */
    const collected = pickRandomSticker(result.stickers, rng);
    if (collected && !result.stickers.includes(collected.id)) {
        result.stickers.push(collected.id);
        newStickers.push({ ...collected, type: 'collect' });
    }

    /* --- Meilenstein-Sticker (alle neu erreichten) --- */
    checkMilestones(result).forEach(m => {
        if (!result.stickers.includes(m.id)) {
            result.stickers.push(m.id);
            newStickers.push({ ...m, type: 'milestone' });
        }
    });

    return {
        data: result,
        newStickers,
        streakInfo: {
            streak: result.currentStreak,
            longest: result.longestStreak,
            total: result.totalSessions,
            increasedToday: !alreadyBrushedToday,
            isNewRecord: !alreadyBrushedToday &&
                         result.currentStreak === result.longestStreak &&
                         result.currentStreak > 1,
        },
    };
}

/* ---- AKTIVE SERIE ----
   Die gespeicherte Serie ist erst beim nächsten Putzen "gebrochen".
   Für die Anzeige rechnen wir ehrlich: Wurde gestern/heute geputzt,
   lebt die Serie noch – sonst ist sie (für die Anzeige) bei 0. */
function getActiveStreak(data, todayStr = getDateString()) {
    const d = normalizeRewardData(data);
    if (!d.lastBrushDate) return 0;
    const gap = daysBetween(d.lastBrushDate, todayStr);
    if (gap <= 1) return d.currentStreak; // heute, gestern oder Uhr verstellt → lebt
    return 0;                             // zwei+ Tage Lücke → Serie ruht
}

/* ---- KATALOG-ZUGRIFF (für das Sammel-Album) ---- */
function getStickerCatalog() {
    return [
        ...COLLECT_STICKERS.map(s => ({ ...s, type: 'collect' })),
        ...MILESTONES.map(s => ({ ...s, type: 'milestone' })),
    ];
}

function getStickerById(id) {
    return getStickerCatalog().find(s => s.id === id) || null;
}

/* ---- WOCHENKALENDER ----
   Liefert die letzten 7 Tage (vor 6 Tagen … heute) mit Putz-Status. */
function getWeekStatus(history = [], todayStr = getDateString()) {
    const owned = new Set(history);
    const labels = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
    const today = new Date(todayStr + 'T00:00:00');
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const ds = getDateString(d);
        days.push({
            date: ds,
            label: labels[d.getDay()],
            done: owned.has(ds),
            isToday: ds === todayStr,
        });
    }
    return days;
}

/* ---- LOCALSTORAGE-ANBINDUNG (nur Browser) ---- */
function loadRewardData() {
    try {
        const raw = localStorage.getItem(REWARDS_STORAGE_KEY);
        return raw ? normalizeRewardData(JSON.parse(raw)) : defaultRewardData();
    } catch (e) {
        return defaultRewardData();
    }
}

function saveRewardData(data) {
    try {
        localStorage.setItem(REWARDS_STORAGE_KEY, JSON.stringify(normalizeRewardData(data)));
        return true;
    } catch (e) {
        return false;
    }
}

/* ---- Export für Node.js-Tests ---- */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        REWARDS_STORAGE_KEY,
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
    };
}
