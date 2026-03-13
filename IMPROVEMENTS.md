# Zahnpaka – Recommended Improvements

This document outlines recommended areas for improvement across testing, code quality, performance, documentation, and UX.

---

## High Priority

### 1. Integrate the Test Suite into `package.json`

There are 4 test files under `tests/` but no `test` script in `package.json`. Tests cannot be run without knowing the exact file paths.

**Fix:** Add a test script:
```json
"scripts": {
  "test": "node --test tests/*.test.js"
}
```

### 2. Expand Test Coverage for `script.js`

The main application file (`script.js`, 1 123 lines) has zero unit tests. Critical logic is untested:
- Timer countdown and phase transitions
- State management (start, pause, resume, finish)
- localStorage read/write for buddy selection and mute state
- Encouragement message rotation
- `updateDisplay()` rendering logic

**Fix:** Extract pure functions from `script.js` (e.g. `getCurrentPhase()`, `formatTime()`) and unit-test them.

### 3. Add a Timeout for Piper TTS Initialisation

`ttsManager.init()` downloads a ~50 MB model file. If the download stalls, the app can hang on the "Lade Zahnpaka..." screen indefinitely with no user feedback and no recovery path.

**Fix:** Wrap the init call in a `Promise.race` with a timeout, then fall back to Web Speech API:
```js
const TTS_TIMEOUT_MS = 30_000;
await Promise.race([
  ttsManager.init(),
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error('TTS timeout')), TTS_TIMEOUT_MS)
  ),
]);
```

### 4. Update the TTS Debugging Guide

`TTS-DEBUGGING-GUIDE.md` references `ResponsiveVoice` and functions like `getTTSStatus()` / `RV_LOAD_STATE` that no longer exist. The app now uses Piper TTS (`@mintplex-labs/piper-tts-web`). The guide should document:
- The Piper initialisation flow
- How `useFallback` and `piperReady` flags work
- Which browser console commands are actually useful today

---

## Medium Priority

### 5. Split `script.js` into Focused Modules

At 1 123 lines, `script.js` handles timers, animations, DOM rendering, state, and UI navigation in a single file. Suggested split:

| Module | Responsibility |
|---|---|
| `timer.js` | Countdown logic, phase sequencing |
| `ui.js` | DOM updates, screen transitions |
| `animation.js` | Sparkles, confetti, buddy animations |
| `state.js` | Central state object, localStorage helpers |
| `messages.js` | Encouragement text arrays |

### 6. Add Input Validation for the Name Field

The `<input maxlength="20">` limit can be bypassed by pasting. The displayed name is inserted via `textContent` (safe), but the value is also stored in `localStorage` and fed to the TTS engine without sanitisation.

**Fix:** Trim and validate length on form submit:
```js
const name = nameInput.value.trim().slice(0, 20);
if (!name) return;
```

### 7. Validate `localStorage` Values on Read

Buddy selection is read directly from `localStorage`. A corrupted or manually edited value (e.g. `buddy = "'; alert(1); '"`  ) would cause a silent failure when looking up `buddySvgs[buddy]`.

**Fix:** Allowlist the valid values:
```js
const VALID_BUDDIES = ['alpi', 'mia', 'hanna'];
const saved = localStorage.getItem('selectedBuddy');
state.selectedBuddy = VALID_BUDDIES.includes(saved) ? saved : 'alpi';
```

### 8. Guard Against Infinite TTS Recursion

In `speak()` (tts-utils related logic), when `piperReady` is false and `useFallback` is not yet set, the function calls itself recursively. Under slow networks this could cause a stack overflow.

**Fix:** Add a `retryCount` guard or convert the retry logic to an iterative approach.

### 9. Debounce `updateDisplay()`

`updateDisplay()` is called every second by `setInterval`. If the function is also triggered by other events (pause/resume), it can run multiple times per tick unnecessarily.

**Fix:** Ensure there is only one active interval at a time and clear it on pause.

### 10. Remove Unused CSS

Several CSS classes defined in `style.css` (e.g. `.mouth-happy`, `.mouth-big-smile`) are not referenced in `index.html` or `script.js`. Removing dead CSS reduces file size and maintenance burden.

---

## Low Priority / Nice-to-Have

### 11. Add a `README.md`

There is no top-level README. A minimal one should cover:
- What the app does and who it is for
- How to run locally (`npx serve .` or similar)
- How to run tests
- PWA install instructions
- Brief architecture notes

### 12. Consolidate Hardcoded Colours into CSS Custom Properties

Some colours (e.g. `#f5a623`, `#4CAF50`) appear both in `style.css` and inline in `script.js` canvas/audio visualisation code. Moving all colour values into CSS custom properties (`--color-accent`, `--color-success`, etc.) makes theming easier.

### 13. Use `requestAnimationFrame` for Sparkle Animations

Sparkles are created with `setTimeout` in a loop, which can accumulate and cause frame drops on lower-end mobile devices. Converting to `requestAnimationFrame` gives the browser control over scheduling.

### 14. Add Haptic Feedback on Phase Change

Mobile browsers support `navigator.vibrate()`. A short vibration (e.g. `navigator.vibrate(100)`) on each phase change provides tactile feedback for young children who may not be watching the screen.

### 15. Add `aria-label` to Progress Dots

The 12 star progress indicators update `aria-valuenow` but have no `aria-label`, so screen readers announce only a number with no context.

**Fix:**
```js
dot.setAttribute('aria-label', `Schritt ${i + 1} von 12`);
```

### 16. Add an ESLint Configuration

The project has no linter. Adding ESLint with a simple ruleset (`eslint:recommended`) would catch common errors and enforce consistent style without requiring significant refactoring.

---

## Summary Table

| Priority | Area | Effort |
|---|---|---|
| High | Add npm test script | XS |
| High | Test coverage for `script.js` | L |
| High | TTS initialisation timeout | S |
| High | Update TTS debugging guide | S |
| Medium | Split `script.js` into modules | XL |
| Medium | Name input validation | XS |
| Medium | `localStorage` allowlist | XS |
| Medium | Fix TTS recursion guard | S |
| Medium | Debounce `updateDisplay()` | XS |
| Medium | Remove unused CSS | S |
| Low | Add `README.md` | M |
| Low | CSS custom properties | M |
| Low | `requestAnimationFrame` for sparkles | S |
| Low | Haptic feedback | XS |
| Low | ARIA labels on progress dots | XS |
| Low | ESLint configuration | S |
