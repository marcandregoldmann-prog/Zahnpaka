# Zahnpaka TTS Debugging & Testing Guide

## Quick Status Check (Works on All Browsers)

1. **Open the app** in any browser
2. **Open Developer Console:**
   - Chrome/Firefox/Edge: Press `F12` → Console tab
   - Safari: Settings → Advanced → Enable Web Inspector
3. **Type this in the console:**
   ```javascript
   getTTSStatus()
   ```
4. **You should see output like:**
   ```javascript
   {
     status: "ready",
     enabled: true,
     voice: "German Female",
     attempts: 1,
     cdnError: null,
     rvDefined: true
   }
   ```

### Status Values Explained:
- ✅ **status: "ready"** = TTS is ready to speak
- ✅ **enabled: true** = TTS is enabled (not muted)
- ✅ **voice: "German Female"** = Using German Female voice
- ✅ **rvDefined: true** = ResponsiveVoice library loaded
- ❌ **status: "failed"** = CDN failed to load or voice unavailable
- ❌ **cdnError: "CDN timeout"** = Library took too long to load

---

## Step-by-Step Testing (All Browsers)

### Test 1: App Startup
1. Open app
2. Click any button (triggers voice unlock on mobile)
3. Check `getTTSStatus()` → status should be "ready"

### Test 2: Speech on Name Input
1. At startup screen, type a name
2. Click "Zähne putzen!" button
3. **You should hear** a German voice say intro text

### Test 3: Speech During Brushing
1. Start brushing timer
2. Wait for random encouragement (every ~25 seconds)
3. **You should hear** phrases like "Das machst du toll!"
4. Check zone changes trigger speech

### Test 4: Speech at Completion
1. Let brushing timer finish (or restart to test)
2. At finish screen, **you should hear** congratulations message with your name

### Test 5: Mute Button Works
1. Click 🔊 mute button (becomes 🔇)
2. Trigger a speech action (finish screen, new phase)
3. **No audio should play**
4. Click again to unmute, verify audio returns

---

## Mobile Testing (Android & iOS)

### Android Chrome:
1. Open app on Android phone
2. **Important:** Press screen once to unlock audio (mobile requirement)
3. Check DevTools: `getTTSStatus()`
4. **You should hear** German narration

**If No Audio:**
- Check phone volume is up
- Check Chrome permissions: Settings → Apps → Chrome → Permissions → Microphone/Audio
- Try muting/unmuting sound toggle
- Try hard refresh: Pull down → reload

### iOS Safari:
1. Open app on iPhone/iPad
2. **Important:** Tap screen once (iOS unlocks audio on user interaction)
3. Check Developer tab: `getTTSStatus()`
4. Listen for German female voice
5. Verify mute button controls audio

**If No Audio:**
- Check device volume isn't muted (physical switch on side)
- Try muting speaker in control center, then unmute
- Try hard refresh: Settings → Safari → Clear History and Website Data

---

## Browser-Specific Notes

### Chrome / Edge (Windows, Mac, Android)
- ✅ German Female voice available
- ✅ Fastest CDN loading
- ✅ Best audio quality
- **Works best after 1st user tap**

### Firefox (Windows, Mac, Android)
- ✅ German Female voice available
- ⚠️ Slower CDN loading (app retries up to 5 times)
- ✅ Audio quality good
- **May need full page reload if TTS doesn't start**

### Safari (Mac, iOS)
- ✅ German Female voice available
- ⚠️ Requires explicit user interaction to enable audio
- ✅ Works after first tap
- **iOS: Volume must not be muted (check physical switch)**

### Samsung Internet (Android)
- ✅ German Female voice available
- ✅ Good compatibility
- **Works after 1st tap**

---

## Advanced Diagnostics

### Check ResponsiveVoice Load State:
```javascript
window.RV_LOAD_STATE
```
Returns:
```javascript
{
  loaded: true,           // CDN loaded
  loadTime: 1234567890,   // When it loaded (ms timestamp)
  error: null,            // Any errors
  CDN_TIMEOUT: 8000       // Timeout setting (ms)
}
```

### Manually Test TTS:
```javascript
// Initialize TTS manually
await ttsManager.init()

// Speak a test phrase
ttsManager.speak('Test Text')

// Cancel any speaking
ttsManager.cancel()

// Check current voice
ttsManager.state.voice

// Force retry init
ttsManager.state.initAttempts = 0
ttsManager.state.status = 'pending'
ttsManager.init()
```

---

## Expected Behavior Timeline

### On First App Load:
```
0ms    → HTML parsed, RV_LOAD_STATE created
50-100ms → ResponsiveVoice CDN script starts loading
500ms  → window.load event fires
1000ms → CDN finishes loading (or fails)
1100ms → Triggers: responsivevoiceready event
1200ms → ttsManager.init() called
1300ms → Voice availability checked
1400ms → ttsManager.state = "ready"
READY  → App speaks first intro text
```

### On First User Click:
```
Click event → Triggers 3rd init hook
            → ttsManager.init() (if not ready yet)
            → Audio context unlocked (mobile)
            → Subsequent TTS works perfectly
```

---

## If TTS Still Doesn't Work

### Step 1: Verify Basic Setup
```javascript
// Check these in console:
typeof responsiveVoice !== 'undefined'  // Must be true
window.RV_LOAD_STATE.loaded             // Must be true
ttsManager.state.enabled                 // Must be true
```

### Step 2: Check Network
1. Press F12 → Network tab
2. Reload page
3. Look for: `responsivevoice.js`
4. Check status: Should be **200** (not 404 or timeout)
5. Check size: Should be **~50-100 KB**

### Step 3: Test Voice Directly
```javascript
// If responsiveVoice is loaded, test it:
responsiveVoice.speak(
  'Hallo! Das ist ein Test.',
  'German Female'
)
```
If you hear "Hallo! Das ist ein Test." → ResponsiveVoice works

### Step 4: Force Fresh Start
1. **Clear all site data:**
   - Chrome: Settings → Privacy → Clear browsing data → Clear data
   - Firefox: Settings → Privacy → Clear data
   - Safari: Settings → Privacy → Manage Website Data → Remove All
2. **Hard refresh:** Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
3. **Reload page**
4. Check `getTTSStatus()` again

### Step 5: Report Issue
If still not working, collect and share:
1. `getTTSStatus()` output
2. Browser name & version
4. Device type (desktop/mobile)
5. Network tab screenshot showing responsivevoice.js

---

## Success Criteria

You'll know TTS is working when:
- ✅ `getTTSStatus()` returns `status: "ready"`, `enabled: true`
- ✅ You hear German narration for intro, phases, encouragement, and finish
- ✅ Mute button (🔊/🔇) controls whether audio plays
- ✅ Works on both desktop and mobile browsers
- ✅ Works across Chrome, Firefox, Safari, Edge

---

## Tips for Best Results

1. **Use Chrome/Edge for fastest loading** - 200-500ms
2. **Mobile: Always tap screen first** - Unlocks audio on iOS/Android
3. **Keep mute button unmuted** - Default is unmuted (🔊)
4. **Use hard refresh if unclear** - Clears old cached version
