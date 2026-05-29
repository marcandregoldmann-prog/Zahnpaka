/* =============================================
   ZAHNPAKA – buddy-svgs.js
   Charakter-Definitionen und SVG-Daten

   Designprinzip (für 4-Jährige): Chibi-Proportionen
   (großer Kopf), große Augen mit Glanzlichtern, rosige
   Wangen, weiche Farbverläufe und runde, freundliche Formen.

   Riggbar: die "brushing"-Variante behält id="alpaka-brushing"
   (Reaktionen) und <path id="mouth-brushing"> (Mimik via setExpression).
   Augen liegen in <g class="buddy-eye"> für die Blinzel-Animation.
   Gradient-IDs sind je Variante eindeutig, um Kollisionen zu
   vermeiden (mehrere Buddy-SVGs sind gleichzeitig im DOM).
   ============================================= */

const buddyInfo = {
    alpaka: { name: 'Alpi',  greeting: 'Hallo! Ich bin Alpi! 🦙' },
    katze:  { name: 'Mia',   greeting: 'Hallo! Ich bin Mia! 🐱'  },
    huhn:   { name: 'Hanna', greeting: 'Hallo! Ich bin Hanna! 🐔' },
};

/* Wiederverwendbare Bausteine ---------------------------------- */

/* Großes, glänzendes Augenpaar (offen). cx-Werte ~83/117, cy ~80. */
function eyesOpen() {
    return `
<g class="buddy-eye"><ellipse cx="83" cy="80" rx="8.6" ry="10.6" fill="#fff"/><circle cx="84" cy="82.5" r="6.4" fill="#3A2E2E"/><circle cx="86.4" cy="79" r="2.6" fill="#fff"/><circle cx="81.3" cy="85" r="1.3" fill="#fff" opacity=".85"/></g>
<g class="buddy-eye"><ellipse cx="117" cy="80" rx="8.6" ry="10.6" fill="#fff"/><circle cx="116" cy="82.5" r="6.4" fill="#3A2E2E"/><circle cx="118.4" cy="79" r="2.6" fill="#fff"/><circle cx="113.3" cy="85" r="1.3" fill="#fff" opacity=".85"/></g>`;
}

/* Glückliche, geschlossene Bogenaugen (für Jubel). */
function eyesHappy() {
    return `
<path d="M 75 80 Q 83 72 91 80" fill="none" stroke="#3A2E2E" stroke-width="3" stroke-linecap="round"/>
<path d="M 109 80 Q 117 72 125 80" fill="none" stroke="#3A2E2E" stroke-width="3" stroke-linecap="round"/>`;
}

/* ============================================
   ALLE 9 CHARAKTER-SVGs (3 Charaktere × 3 Varianten)
   ============================================ */
const buddySvgs = {

    /* ---------------- ALPAKA (Alpi) ---------------- */
    alpaka: {
        idle: `<svg viewBox="0 0 200 220" class="alpaka-svg" aria-label="Alpaka Alpi" role="img">
<defs><radialGradient id="aI_body" cx="50%" cy="26%" r="84%"><stop offset="0%" stop-color="#FFFDF7"/><stop offset="100%" stop-color="#ECDCB7"/></radialGradient><radialGradient id="aI_head" cx="50%" cy="30%" r="80%"><stop offset="0%" stop-color="#FFFEFA"/><stop offset="100%" stop-color="#F1E3C6"/></radialGradient></defs>
<rect x="84" y="190" width="13" height="26" rx="6.5" fill="#EFDFBC" stroke="#E2CDA2" stroke-width="2"/>
<rect x="103" y="190" width="13" height="26" rx="6.5" fill="#EFDFBC" stroke="#E2CDA2" stroke-width="2"/>
<ellipse cx="90.5" cy="214" rx="8" ry="4.5" fill="#C49A5E"/>
<ellipse cx="109.5" cy="214" rx="8" ry="4.5" fill="#C49A5E"/>
<path d="M 134 168 Q 142.5 150.4 124 144 Q 117.6 125.5 100 134 Q 82.4 125.5 76 144 Q 57.5 150.4 66 168 Q 57.5 185.6 76 192 Q 82.4 210.5 100 202 Q 117.6 210.5 124 192 Q 142.5 185.6 134 168 Z" fill="url(#aI_body)" stroke="#E2CDA2" stroke-width="2.5"/>
<ellipse cx="100" cy="174" rx="21" ry="19" fill="#FFFEFB" opacity="0.8"/>
<g fill="none" stroke="#E7D5AE" stroke-width="1.6" stroke-linecap="round" opacity="0.6"><path d="M 66 162 Q 74 169 83 162"/><path d="M 117 162 Q 125 169 134 162"/><path d="M 70 182 Q 78 189 87 182"/><path d="M 113 182 Q 121 189 130 182"/></g>
<path d="M 87 118 Q 83 142 93 150 L 107 150 Q 117 142 113 118 Z" fill="url(#aI_body)" stroke="#E2CDA2" stroke-width="2.5"/>
<ellipse cx="100" cy="80" rx="44" ry="42" fill="url(#aI_head)" stroke="#E2CDA2" stroke-width="2.5"/>
<path d="M 70 56 Q 60 16 77 17 Q 85 35 80 58 Z" fill="url(#aI_head)" stroke="#E2CDA2" stroke-width="2"/>
<path d="M 130 56 Q 140 16 123 17 Q 115 35 120 58 Z" fill="url(#aI_head)" stroke="#E2CDA2" stroke-width="2"/>
<path d="M 73 52 Q 67 27 77 25 Q 81 39 78 53 Z" fill="#F3CBAE"/>
<path d="M 127 52 Q 133 27 123 25 Q 119 39 122 53 Z" fill="#F3CBAE"/>
<path d="M 60 72 Q 55 47 74 54 Q 78 33 92 44 Q 100 33 108 44 Q 122 33 126 54 Q 145 47 140 72 Q 100 88 60 72 Z" fill="url(#aI_head)" stroke="#E2CDA2" stroke-width="2"/>
<path d="M 86 40 Q 88 24 97 32 Q 100 20 105 32 Q 114 26 116 42 Q 100 50 86 40 Z" fill="url(#aI_head)" stroke="#E2CDA2" stroke-width="2"/>
<ellipse cx="100" cy="99" rx="20" ry="15" fill="#FFF8EC"/>
<ellipse cx="71" cy="94" rx="10" ry="7" fill="#FFB3C7" opacity="0.55"/>
<ellipse cx="129" cy="94" rx="10" ry="7" fill="#FFB3C7" opacity="0.55"/>
${eyesOpen()}
<ellipse cx="96" cy="92.5" rx="1.7" ry="1.2" fill="#B77E5E"/><ellipse cx="104" cy="92.5" rx="1.7" ry="1.2" fill="#B77E5E"/>
<path d="M 92 101 Q 100 108 108 101" fill="none" stroke="#6B4F3A" stroke-width="2.2" stroke-linecap="round"/>
</svg>`,

        brushing: `<svg id="alpaka-brushing" viewBox="0 0 200 220" class="alpaka-svg alpaka-large" aria-label="Alpi motiviert dich" role="img">
<defs><radialGradient id="aB_body" cx="50%" cy="26%" r="84%"><stop offset="0%" stop-color="#FFFDF7"/><stop offset="100%" stop-color="#ECDCB7"/></radialGradient><radialGradient id="aB_head" cx="50%" cy="30%" r="80%"><stop offset="0%" stop-color="#FFFEFA"/><stop offset="100%" stop-color="#F1E3C6"/></radialGradient></defs>
<rect x="84" y="190" width="13" height="26" rx="6.5" fill="#EFDFBC" stroke="#E2CDA2" stroke-width="2"/>
<rect x="103" y="190" width="13" height="26" rx="6.5" fill="#EFDFBC" stroke="#E2CDA2" stroke-width="2"/>
<ellipse cx="90.5" cy="214" rx="8" ry="4.5" fill="#C49A5E"/>
<ellipse cx="109.5" cy="214" rx="8" ry="4.5" fill="#C49A5E"/>
<path d="M 134 168 Q 142.5 150.4 124 144 Q 117.6 125.5 100 134 Q 82.4 125.5 76 144 Q 57.5 150.4 66 168 Q 57.5 185.6 76 192 Q 82.4 210.5 100 202 Q 117.6 210.5 124 192 Q 142.5 185.6 134 168 Z" fill="url(#aB_body)" stroke="#E2CDA2" stroke-width="2.5"/>
<ellipse cx="100" cy="174" rx="21" ry="19" fill="#FFFEFB" opacity="0.8"/>
<g fill="none" stroke="#E7D5AE" stroke-width="1.6" stroke-linecap="round" opacity="0.6"><path d="M 66 162 Q 74 169 83 162"/><path d="M 117 162 Q 125 169 134 162"/><path d="M 70 182 Q 78 189 87 182"/><path d="M 113 182 Q 121 189 130 182"/></g>
<path d="M 118 150 Q 138 142 143 122" fill="none" stroke="url(#aB_body)" stroke-width="13" stroke-linecap="round"/>
<circle cx="143" cy="121" r="7.5" fill="url(#aB_body)" stroke="#E2CDA2" stroke-width="2"/>
<path d="M 87 118 Q 83 142 93 150 L 107 150 Q 117 142 113 118 Z" fill="url(#aB_body)" stroke="#E2CDA2" stroke-width="2.5"/>
<ellipse cx="100" cy="80" rx="44" ry="42" fill="url(#aB_head)" stroke="#E2CDA2" stroke-width="2.5"/>
<path d="M 70 56 Q 60 16 77 17 Q 85 35 80 58 Z" fill="url(#aB_head)" stroke="#E2CDA2" stroke-width="2"/>
<path d="M 130 56 Q 140 16 123 17 Q 115 35 120 58 Z" fill="url(#aB_head)" stroke="#E2CDA2" stroke-width="2"/>
<path d="M 73 52 Q 67 27 77 25 Q 81 39 78 53 Z" fill="#F3CBAE"/>
<path d="M 127 52 Q 133 27 123 25 Q 119 39 122 53 Z" fill="#F3CBAE"/>
<path d="M 60 72 Q 55 47 74 54 Q 78 33 92 44 Q 100 33 108 44 Q 122 33 126 54 Q 145 47 140 72 Q 100 88 60 72 Z" fill="url(#aB_head)" stroke="#E2CDA2" stroke-width="2"/>
<path d="M 86 40 Q 88 24 97 32 Q 100 20 105 32 Q 114 26 116 42 Q 100 50 86 40 Z" fill="url(#aB_head)" stroke="#E2CDA2" stroke-width="2"/>
<ellipse cx="100" cy="99" rx="20" ry="15" fill="#FFF8EC"/>
<ellipse cx="71" cy="94" rx="10" ry="7" fill="#FFB3C7" opacity="0.55"/>
<ellipse cx="129" cy="94" rx="10" ry="7" fill="#FFB3C7" opacity="0.55"/>
${eyesOpen()}
<ellipse cx="96" cy="92.5" rx="1.7" ry="1.2" fill="#B77E5E"/><ellipse cx="104" cy="92.5" rx="1.7" ry="1.2" fill="#B77E5E"/>
<path id="mouth-brushing" d="M 90 105 Q 100 115 110 105" fill="none" stroke="#6B4F3A" stroke-width="2.6" stroke-linecap="round"/>
<g transform="rotate(18 150 120)"><rect x="146" y="84" width="9" height="70" rx="4.5" fill="#7EC8F0"/><rect x="142" y="74" width="17" height="18" rx="4" fill="#fff" stroke="#D8E8F2" stroke-width="1.5"/><g stroke="#BFE0F2" stroke-width="2.2" stroke-linecap="round"><line x1="145" y1="74" x2="145" y2="66"/><line x1="150.5" y1="74" x2="150.5" y2="65"/><line x1="156" y1="74" x2="156" y2="66"/></g></g>
</svg>`,

        celebrate: `<svg viewBox="0 0 200 220" class="alpaka-svg alpaka-celebrate" aria-label="Alpi feiert!" role="img">
<defs><radialGradient id="aC_body" cx="50%" cy="26%" r="84%"><stop offset="0%" stop-color="#FFFDF7"/><stop offset="100%" stop-color="#ECDCB7"/></radialGradient><radialGradient id="aC_head" cx="50%" cy="30%" r="80%"><stop offset="0%" stop-color="#FFFEFA"/><stop offset="100%" stop-color="#F1E3C6"/></radialGradient></defs>
<rect x="84" y="190" width="13" height="26" rx="6.5" fill="#EFDFBC" stroke="#E2CDA2" stroke-width="2"/>
<rect x="103" y="190" width="13" height="26" rx="6.5" fill="#EFDFBC" stroke="#E2CDA2" stroke-width="2"/>
<ellipse cx="90.5" cy="214" rx="8" ry="4.5" fill="#C49A5E"/>
<ellipse cx="109.5" cy="214" rx="8" ry="4.5" fill="#C49A5E"/>
<path d="M 70 150 Q 44 124 52 100" fill="none" stroke="url(#aC_body)" stroke-width="14" stroke-linecap="round"/>
<path d="M 130 150 Q 156 124 148 100" fill="none" stroke="url(#aC_body)" stroke-width="14" stroke-linecap="round"/>
<circle cx="52" cy="100" r="8" fill="url(#aC_body)" stroke="#E2CDA2" stroke-width="2"/>
<circle cx="148" cy="100" r="8" fill="url(#aC_body)" stroke="#E2CDA2" stroke-width="2"/>
<path d="M 134 168 Q 142.5 150.4 124 144 Q 117.6 125.5 100 134 Q 82.4 125.5 76 144 Q 57.5 150.4 66 168 Q 57.5 185.6 76 192 Q 82.4 210.5 100 202 Q 117.6 210.5 124 192 Q 142.5 185.6 134 168 Z" fill="url(#aC_body)" stroke="#E2CDA2" stroke-width="2.5"/>
<ellipse cx="100" cy="174" rx="21" ry="19" fill="#FFFEFB" opacity="0.8"/>
<g fill="none" stroke="#E7D5AE" stroke-width="1.6" stroke-linecap="round" opacity="0.6"><path d="M 66 162 Q 74 169 83 162"/><path d="M 117 162 Q 125 169 134 162"/><path d="M 70 182 Q 78 189 87 182"/><path d="M 113 182 Q 121 189 130 182"/></g>
<path d="M 87 118 Q 83 142 93 150 L 107 150 Q 117 142 113 118 Z" fill="url(#aC_body)" stroke="#E2CDA2" stroke-width="2.5"/>
<ellipse cx="100" cy="80" rx="44" ry="42" fill="url(#aC_head)" stroke="#E2CDA2" stroke-width="2.5"/>
<path d="M 70 56 Q 60 16 77 17 Q 85 35 80 58 Z" fill="url(#aC_head)" stroke="#E2CDA2" stroke-width="2"/>
<path d="M 130 56 Q 140 16 123 17 Q 115 35 120 58 Z" fill="url(#aC_head)" stroke="#E2CDA2" stroke-width="2"/>
<path d="M 73 52 Q 67 27 77 25 Q 81 39 78 53 Z" fill="#F3CBAE"/>
<path d="M 127 52 Q 133 27 123 25 Q 119 39 122 53 Z" fill="#F3CBAE"/>
<path d="M 60 72 Q 55 47 74 54 Q 78 33 92 44 Q 100 33 108 44 Q 122 33 126 54 Q 145 47 140 72 Q 100 88 60 72 Z" fill="url(#aC_head)" stroke="#E2CDA2" stroke-width="2"/>
<path d="M 86 40 Q 88 24 97 32 Q 100 20 105 32 Q 114 26 116 42 Q 100 50 86 40 Z" fill="url(#aC_head)" stroke="#E2CDA2" stroke-width="2"/>
<ellipse cx="100" cy="99" rx="20" ry="15" fill="#FFF8EC"/>
<ellipse cx="71" cy="94" rx="10" ry="7" fill="#FFB3C7" opacity="0.6"/>
<ellipse cx="129" cy="94" rx="10" ry="7" fill="#FFB3C7" opacity="0.6"/>
${eyesHappy()}
<path d="M 90 100 Q 100 112 110 100" fill="none" stroke="#6B4F3A" stroke-width="2.6" stroke-linecap="round"/>
<text x="24" y="58" font-size="26">✨</text><text x="150" y="58" font-size="26">✨</text>
</svg>`,
    },

    /* ---------------- KATZE (Mia) ---------------- */
    katze: {
        idle: `<svg viewBox="0 0 200 220" class="alpaka-svg" aria-label="Katze Mia" role="img">
<defs><radialGradient id="kI_b" cx="50%" cy="32%" r="78%"><stop offset="0%" stop-color="#FFE0AE"/><stop offset="100%" stop-color="#F4B062"/></radialGradient></defs>
<path d="M 70 150 Q 150 150 150 175 Q 150 205 110 205 L 90 205 Q 50 205 50 175 Q 50 150 70 150 Z" fill="url(#kI_b)" stroke="#E2954A" stroke-width="2.5"/>
<ellipse cx="100" cy="182" rx="26" ry="22" fill="#FFF3E0"/>
<path d="M 146 168 Q 182 158 176 120" fill="none" stroke="#F4B062" stroke-width="13" stroke-linecap="round"/>
<path d="M 146 168 Q 178 160 174 134" fill="none" stroke="#E2954A" stroke-width="4" stroke-linecap="round" opacity="0.5"/>
<path d="M 60 62 L 50 24 L 86 50 Z" fill="url(#kI_b)" stroke="#E2954A" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M 140 62 L 150 24 L 114 50 Z" fill="url(#kI_b)" stroke="#E2954A" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M 62 54 L 57 35 L 78 50 Z" fill="#F58BA0"/>
<path d="M 138 54 L 143 35 L 122 50 Z" fill="#F58BA0"/>
<ellipse cx="100" cy="84" rx="54" ry="48" fill="url(#kI_b)" stroke="#E2954A" stroke-width="2.5"/>
<g stroke="#E2954A" stroke-width="3" stroke-linecap="round" opacity="0.7"><path d="M 100 44 L 100 58"/><path d="M 90 47 L 92 59"/><path d="M 110 47 L 108 59"/></g>
<ellipse cx="100" cy="104" rx="22" ry="16" fill="#FFF3E0"/>
<ellipse cx="70" cy="100" rx="10" ry="7" fill="#FF9BB3" opacity="0.55"/>
<ellipse cx="130" cy="100" rx="10" ry="7" fill="#FF9BB3" opacity="0.55"/>
${eyesOpen()}
<path d="M 95 100 L 105 100 L 100 106 Z" fill="#F58BA0"/>
<path d="M 100 106 Q 94 112 88 108" fill="none" stroke="#6B4F3A" stroke-width="2" stroke-linecap="round"/>
<path d="M 100 106 Q 106 112 112 108" fill="none" stroke="#6B4F3A" stroke-width="2" stroke-linecap="round"/>
<g stroke="#fff" stroke-width="1.8" opacity="0.85" stroke-linecap="round"><line x1="58" y1="104" x2="84" y2="106"/><line x1="58" y1="112" x2="84" y2="111"/><line x1="142" y1="104" x2="116" y2="106"/><line x1="142" y1="112" x2="116" y2="111"/></g>
</svg>`,

        brushing: `<svg id="alpaka-brushing" viewBox="0 0 200 220" class="alpaka-svg alpaka-large" aria-label="Mia putzt Zähne" role="img">
<defs><radialGradient id="kB_b" cx="50%" cy="32%" r="78%"><stop offset="0%" stop-color="#FFE0AE"/><stop offset="100%" stop-color="#F4B062"/></radialGradient></defs>
<path d="M 70 150 Q 150 150 150 175 Q 150 205 110 205 L 90 205 Q 50 205 50 175 Q 50 150 70 150 Z" fill="url(#kB_b)" stroke="#E2954A" stroke-width="2.5"/>
<ellipse cx="100" cy="182" rx="26" ry="22" fill="#FFF3E0"/>
<path d="M 146 168 Q 182 158 176 120" fill="none" stroke="#F4B062" stroke-width="13" stroke-linecap="round"/>
<path d="M 60 62 L 50 24 L 86 50 Z" fill="url(#kB_b)" stroke="#E2954A" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M 140 62 L 150 24 L 114 50 Z" fill="url(#kB_b)" stroke="#E2954A" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M 62 54 L 57 35 L 78 50 Z" fill="#F58BA0"/>
<path d="M 138 54 L 143 35 L 122 50 Z" fill="#F58BA0"/>
<ellipse cx="100" cy="84" rx="54" ry="48" fill="url(#kB_b)" stroke="#E2954A" stroke-width="2.5"/>
<g stroke="#E2954A" stroke-width="3" stroke-linecap="round" opacity="0.7"><path d="M 100 44 L 100 58"/><path d="M 90 47 L 92 59"/><path d="M 110 47 L 108 59"/></g>
<ellipse cx="100" cy="106" rx="22" ry="16" fill="#FFF3E0"/>
<ellipse cx="70" cy="100" rx="10" ry="7" fill="#FF9BB3" opacity="0.55"/>
<ellipse cx="130" cy="100" rx="10" ry="7" fill="#FF9BB3" opacity="0.55"/>
${eyesOpen()}
<path d="M 95 99 L 105 99 L 100 105 Z" fill="#F58BA0"/>
<path id="mouth-brushing" d="M 90 105 Q 100 115 110 105" fill="none" stroke="#6B4F3A" stroke-width="2.6" stroke-linecap="round"/>
<g stroke="#fff" stroke-width="1.8" opacity="0.85" stroke-linecap="round"><line x1="58" y1="104" x2="84" y2="106"/><line x1="58" y1="112" x2="84" y2="111"/></g>
<g transform="rotate(18 150 120)"><rect x="146" y="84" width="9" height="70" rx="4.5" fill="#7EC8F0"/><rect x="142" y="74" width="17" height="18" rx="4" fill="#fff" stroke="#D8E8F2" stroke-width="1.5"/><g stroke="#BFE0F2" stroke-width="2.2" stroke-linecap="round"><line x1="145" y1="74" x2="145" y2="66"/><line x1="150.5" y1="74" x2="150.5" y2="65"/><line x1="156" y1="74" x2="156" y2="66"/></g></g>
</svg>`,

        celebrate: `<svg viewBox="0 0 200 220" class="alpaka-svg alpaka-celebrate" aria-label="Mia feiert!" role="img">
<defs><radialGradient id="kC_b" cx="50%" cy="32%" r="78%"><stop offset="0%" stop-color="#FFE0AE"/><stop offset="100%" stop-color="#F4B062"/></radialGradient></defs>
<path d="M 70 150 Q 150 150 150 175 Q 150 205 110 205 L 90 205 Q 50 205 50 175 Q 50 150 70 150 Z" fill="url(#kC_b)" stroke="#E2954A" stroke-width="2.5"/>
<ellipse cx="100" cy="182" rx="26" ry="22" fill="#FFF3E0"/>
<path d="M 60 150 Q 36 120 48 100" fill="none" stroke="#F4B062" stroke-width="13" stroke-linecap="round"/>
<path d="M 140 150 Q 164 120 152 100" fill="none" stroke="#F4B062" stroke-width="13" stroke-linecap="round"/>
<path d="M 60 62 L 50 24 L 86 50 Z" fill="url(#kC_b)" stroke="#E2954A" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M 140 62 L 150 24 L 114 50 Z" fill="url(#kC_b)" stroke="#E2954A" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M 62 54 L 57 35 L 78 50 Z" fill="#F58BA0"/>
<path d="M 138 54 L 143 35 L 122 50 Z" fill="#F58BA0"/>
<ellipse cx="100" cy="84" rx="54" ry="48" fill="url(#kC_b)" stroke="#E2954A" stroke-width="2.5"/>
<ellipse cx="100" cy="104" rx="22" ry="16" fill="#FFF3E0"/>
<ellipse cx="70" cy="100" rx="10" ry="7" fill="#FF9BB3" opacity="0.6"/>
<ellipse cx="130" cy="100" rx="10" ry="7" fill="#FF9BB3" opacity="0.6"/>
${eyesHappy()}
<path d="M 95 99 L 105 99 L 100 105 Z" fill="#F58BA0"/>
<path d="M 90 104 Q 100 114 110 104" fill="none" stroke="#6B4F3A" stroke-width="2.6" stroke-linecap="round"/>
<text x="26" y="58" font-size="26">✨</text><text x="150" y="58" font-size="26">✨</text>
</svg>`,
    },

    /* ---------------- HUHN (Hanna) ---------------- */
    huhn: {
        idle: `<svg viewBox="0 0 200 220" class="alpaka-svg" aria-label="Huhn Hanna" role="img">
<defs><radialGradient id="hI_b" cx="50%" cy="30%" r="80%"><stop offset="0%" stop-color="#FFFBE0"/><stop offset="100%" stop-color="#FFE38F"/></radialGradient></defs>
<g fill="#FF8B5C" stroke="#EC7445" stroke-width="2" stroke-linejoin="round"><path d="M 150 150 Q 178 138 184 112 Q 168 120 160 130 Q 168 108 160 92 Q 146 116 146 140 Z"/></g>
<path d="M 76 196 L 70 214 M 76 196 L 62 210 M 76 196 L 76 216" stroke="#F2A03E" stroke-width="4" stroke-linecap="round"/>
<path d="M 124 196 L 130 214 M 124 196 L 138 210 M 124 196 L 124 216" stroke="#F2A03E" stroke-width="4" stroke-linecap="round"/>
<ellipse cx="100" cy="138" rx="56" ry="58" fill="url(#hI_b)" stroke="#EBC85F" stroke-width="2.5"/>
<ellipse cx="100" cy="150" rx="30" ry="34" fill="#FFFDF0" opacity="0.65"/>
<path d="M 52 120 Q 30 132 40 158 Q 54 150 58 132 Z" fill="#FFE38F" stroke="#EBC85F" stroke-width="2"/>
<path d="M 148 120 Q 170 132 160 158 Q 146 150 142 132 Z" fill="#FFE38F" stroke="#EBC85F" stroke-width="2"/>
<g fill="#FF6B6B" stroke="#EC5A5A" stroke-width="1.5"><circle cx="88" cy="46" r="9"/><circle cx="100" cy="40" r="10"/><circle cx="112" cy="46" r="9"/></g>
<ellipse cx="70" cy="98" rx="9" ry="6.5" fill="#FF9BB3" opacity="0.55"/>
<ellipse cx="130" cy="98" rx="9" ry="6.5" fill="#FF9BB3" opacity="0.55"/>
${eyesOpen()}
<path d="M 90 94 L 110 94 L 100 104 Z" fill="#FFB23E" stroke="#E8941F" stroke-width="1.5" stroke-linejoin="round"/>
<g fill="#FF6B6B" stroke="#EC5A5A" stroke-width="1"><ellipse cx="95" cy="108" rx="3.5" ry="5"/><ellipse cx="105" cy="108" rx="3.5" ry="5"/></g>
</svg>`,

        brushing: `<svg id="alpaka-brushing" viewBox="0 0 200 220" class="alpaka-svg alpaka-large" aria-label="Hanna putzt Zähne" role="img">
<defs><radialGradient id="hB_b" cx="50%" cy="30%" r="80%"><stop offset="0%" stop-color="#FFFBE0"/><stop offset="100%" stop-color="#FFE38F"/></radialGradient></defs>
<path d="M 76 196 L 70 214 M 76 196 L 62 210 M 76 196 L 76 216" stroke="#F2A03E" stroke-width="4" stroke-linecap="round"/>
<path d="M 124 196 L 130 214 M 124 196 L 138 210 M 124 196 L 124 216" stroke="#F2A03E" stroke-width="4" stroke-linecap="round"/>
<ellipse cx="100" cy="138" rx="56" ry="58" fill="url(#hB_b)" stroke="#EBC85F" stroke-width="2.5"/>
<ellipse cx="100" cy="150" rx="30" ry="34" fill="#FFFDF0" opacity="0.65"/>
<path d="M 52 120 Q 30 132 40 158 Q 54 150 58 132 Z" fill="#FFE38F" stroke="#EBC85F" stroke-width="2"/>
<g fill="#FF6B6B" stroke="#EC5A5A" stroke-width="1.5"><circle cx="88" cy="46" r="9"/><circle cx="100" cy="40" r="10"/><circle cx="112" cy="46" r="9"/></g>
<ellipse cx="70" cy="98" rx="9" ry="6.5" fill="#FF9BB3" opacity="0.55"/>
<ellipse cx="130" cy="98" rx="9" ry="6.5" fill="#FF9BB3" opacity="0.55"/>
${eyesOpen()}
<path d="M 90 92 L 110 92 L 100 102 Z" fill="#FFB23E" stroke="#E8941F" stroke-width="1.5" stroke-linejoin="round"/>
<path id="mouth-brushing" d="M 90 105 Q 100 115 110 105" fill="none" stroke="#C97A1E" stroke-width="2.6" stroke-linecap="round"/>
<path d="M 148 130 Q 170 140 158 162" fill="none" stroke="#FFE38F" stroke-width="14" stroke-linecap="round"/>
<g transform="rotate(18 150 120)"><rect x="146" y="84" width="9" height="70" rx="4.5" fill="#7EC8F0"/><rect x="142" y="74" width="17" height="18" rx="4" fill="#fff" stroke="#D8E8F2" stroke-width="1.5"/><g stroke="#BFE0F2" stroke-width="2.2" stroke-linecap="round"><line x1="145" y1="74" x2="145" y2="66"/><line x1="150.5" y1="74" x2="150.5" y2="65"/><line x1="156" y1="74" x2="156" y2="66"/></g></g>
</svg>`,

        celebrate: `<svg viewBox="0 0 200 220" class="alpaka-svg alpaka-celebrate" aria-label="Hanna feiert!" role="img">
<defs><radialGradient id="hC_b" cx="50%" cy="30%" r="80%"><stop offset="0%" stop-color="#FFFBE0"/><stop offset="100%" stop-color="#FFE38F"/></radialGradient></defs>
<path d="M 76 196 L 70 214 M 76 196 L 62 210 M 76 196 L 76 216" stroke="#F2A03E" stroke-width="4" stroke-linecap="round"/>
<path d="M 124 196 L 130 214 M 124 196 L 138 210 M 124 196 L 124 216" stroke="#F2A03E" stroke-width="4" stroke-linecap="round"/>
<ellipse cx="100" cy="138" rx="56" ry="58" fill="url(#hC_b)" stroke="#EBC85F" stroke-width="2.5"/>
<ellipse cx="100" cy="150" rx="30" ry="34" fill="#FFFDF0" opacity="0.65"/>
<path d="M 50 118 Q 22 104 36 80 Q 48 96 58 112 Z" fill="#FFE38F" stroke="#EBC85F" stroke-width="2"/>
<path d="M 150 118 Q 178 104 164 80 Q 152 96 142 112 Z" fill="#FFE38F" stroke="#EBC85F" stroke-width="2"/>
<g fill="#FF6B6B" stroke="#EC5A5A" stroke-width="1.5"><circle cx="88" cy="46" r="9"/><circle cx="100" cy="40" r="10"/><circle cx="112" cy="46" r="9"/></g>
<ellipse cx="70" cy="98" rx="9" ry="6.5" fill="#FF9BB3" opacity="0.6"/>
<ellipse cx="130" cy="98" rx="9" ry="6.5" fill="#FF9BB3" opacity="0.6"/>
${eyesHappy()}
<path d="M 90 92 L 110 92 L 100 102 Z" fill="#FFB23E" stroke="#E8941F" stroke-width="1.5" stroke-linejoin="round"/>
<g fill="#FF6B6B" stroke="#EC5A5A" stroke-width="1"><ellipse cx="95" cy="106" rx="3.5" ry="5"/><ellipse cx="105" cy="106" rx="3.5" ry="5"/></g>
<text x="22" y="56" font-size="26">✨</text><text x="152" y="56" font-size="26">✨</text>
</svg>`,
    },
};

// Export für Node.js Tests
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { buddyInfo, buddySvgs };
}
