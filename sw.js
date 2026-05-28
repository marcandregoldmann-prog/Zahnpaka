/* =============================================
   ZAHNPAKA – Service Worker
   Offline-Support & Caching

   Zwei getrennte Caches:
   - SHELL (versioniert): die App selbst. Bei jedem Update neu
     befüllt; alte Shell-Versionen werden aufgeräumt.
   - RUNTIME (persistent): große Fremd-Assets wie das Piper-TTS-
     Modell von CDN/HuggingFace. Überlebt App-Updates, damit das
     Modell NICHT bei jeder neuen Version neu geladen werden muss.
   ============================================= */

const VERSION = 'v4';
const SHELL_CACHE = 'zahnpaka-shell-' + VERSION;
const RUNTIME_CACHE = 'zahnpaka-runtime';

const SHELL_ASSETS = [
    './',
    './index.html',
    './style.css',
    './buddy-svgs.js',
    './phase-utils.js',
    './tts-utils.js',
    './rewards-utils.js',
    './script.js',
    './manifest.json',
    './icon-192.png',
    './icon-512.png',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_ASSETS))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => {
            // Nur ALTE Shell-Caches löschen. Runtime-Cache (TTS-Modell!) behalten.
            if (k.startsWith('zahnpaka-shell-') && k !== SHELL_CACHE) {
                return caches.delete(k);
            }
            // Sehr alte, einteilige Caches (zahnpaka-v2/v3) ebenfalls entfernen.
            if (/^zahnpaka-v\d+$/.test(k)) {
                return caches.delete(k);
            }
            return Promise.resolve();
        }));
        await self.clients.claim();
    })());
});

self.addEventListener('fetch', (event) => {
    const req = event.request;

    // Nur GET behandeln; andere Methoden direkt durchlassen.
    if (req.method !== 'GET') return;

    const url = new URL(req.url);
    // Nicht-http(s)-Schemata (chrome-extension:, data:, …) ignorieren.
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

    if (url.origin === self.location.origin) {
        event.respondWith(shellStrategy(req));
    } else {
        event.respondWith(runtimeStrategy(req));
    }
});

/* App-Shell: Cache-first → Netz → Offline-Fallback auf index.html. */
async function shellStrategy(req) {
    const cached = await caches.match(req);
    if (cached) return cached;
    try {
        const res = await fetch(req);
        // Nur eigene, gültige Responses nachcachen.
        if (res && res.status === 200 && res.type === 'basic') {
            const copy = res.clone();
            caches.open(SHELL_CACHE).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
    } catch (e) {
        if (req.mode === 'navigate') {
            const fallback = await caches.match('./index.html');
            if (fallback) return fallback;
        }
        return Response.error();
    }
}

/* Fremd-Origin (CDN / Modell): Cache-first in persistenten Runtime-Cache.
   Diese URLs sind versioniert/unveränderlich → einmal laden, dann offline. */
async function runtimeStrategy(req) {
    const cached = await caches.match(req);
    if (cached) return cached;
    try {
        const res = await fetch(req);
        // 200 (cors/basic) und opaque (no-cors) speichern, damit TTS offline läuft.
        if (res && (res.status === 200 || res.type === 'opaque')) {
            const copy = res.clone();
            caches.open(RUNTIME_CACHE).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
    } catch (e) {
        return Response.error();
    }
}
