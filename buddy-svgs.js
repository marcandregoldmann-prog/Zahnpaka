/* =============================================
   ZAHNPAKA – buddy-svgs.js
   Charakter-Definitionen und SVG-Daten
   ============================================= */

/* ============================================
   BUDDY-SYSTEM: Charakter-Auswahl
   ============================================ */

const buddyInfo = {
    alpaka: { name: 'Alpi',  greeting: 'Hallo! Ich bin Alpi! 🦙' },
    katze:  { name: 'Mia',   greeting: 'Hallo! Ich bin Mia! 🐱'  },
    huhn:   { name: 'Hanna', greeting: 'Hallo! Ich bin Hanna! 🐔' },
};

/* Alle 9 Charakter-SVGs (3 Charaktere × 3 Varianten) */
const buddySvgs = {
    alpaka: {
        idle: `<svg viewBox="0 0 200 220" class="alpaka-svg" aria-label="Alpaka Alpi" role="img">
<ellipse cx="100" cy="85" rx="55" ry="50" fill="#FFF5E1"/>
<path d="M 60 220 Q 50 160 70 140 L 80 100 Q 80 80 80 80" fill="none" stroke="#FFF5E1" stroke-width="40" stroke-linecap="round"/>
<path d="M 140 220 Q 150 160 130 140 L 120 100 Q 120 80 120 80" fill="none" stroke="#FFF5E1" stroke-width="40" stroke-linecap="round"/>
<rect x="70" y="130" width="60" height="90" fill="#FFF5E1"/>
<ellipse cx="65" cy="50" rx="12" ry="20" fill="#FFF5E1" transform="rotate(-20 65 50)"/>
<ellipse cx="135" cy="50" rx="12" ry="20" fill="#FFF5E1" transform="rotate(20 135 50)"/>
<path d="M 90 40 Q 100 25 110 40" fill="#FFF5E1" stroke="#E6DCC8" stroke-width="2"/>
<circle cx="70" cy="95" r="8" fill="#FFB6C1" opacity="0.6"/>
<circle cx="130" cy="95" r="8" fill="#FFB6C1" opacity="0.6"/>
<g class="buddy-eye">
<circle cx="80" cy="80" r="6" fill="#333"/>
<circle cx="82" cy="78" r="2" fill="#fff"/>
</g>
<g class="buddy-eye">
<circle cx="120" cy="80" r="6" fill="#333"/>
<circle cx="118" cy="78" r="2" fill="#fff"/>
</g>
<ellipse cx="100" cy="100" rx="18" ry="12" fill="#FFF0D5"/>
<path d="M 96 97 Q 100 100 104 97" fill="none" stroke="#D4A86A" stroke-width="2" stroke-linecap="round"/>
<path d="M 94 105 Q 100 110 106 105" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round"/>
</svg>`,
        brushing: `<svg id="alpaka-brushing" viewBox="0 0 200 220" class="alpaka-svg alpaka-large" aria-label="Alpi motiviert dich" role="img">
<ellipse cx="100" cy="85" rx="55" ry="50" fill="#FFF5E1"/>
<path d="M 60 220 Q 50 160 70 140 L 80 100" fill="none" stroke="#FFF5E1" stroke-width="40" stroke-linecap="round"/>
<path d="M 140 220 Q 150 160 130 140 L 120 100" fill="none" stroke="#FFF5E1" stroke-width="40" stroke-linecap="round"/>
<rect x="70" y="130" width="60" height="90" fill="#FFF5E1"/>
<ellipse cx="65" cy="50" rx="12" ry="20" fill="#FFF5E1" transform="rotate(-20 65 50)"/>
<ellipse cx="135" cy="50" rx="12" ry="20" fill="#FFF5E1" transform="rotate(20 135 50)"/>
<path d="M 90 40 Q 100 25 110 40" fill="#FFF5E1" stroke="#E6DCC8" stroke-width="2"/>
<circle cx="70" cy="95" r="8" fill="#FFB6C1" opacity="0.6"/>
<circle cx="130" cy="95" r="8" fill="#FFB6C1" opacity="0.6"/>
<g class="buddy-eye">
<circle cx="80" cy="80" r="6" fill="#333"/>
<circle cx="82" cy="78" r="2" fill="#fff"/>
</g>
<g class="buddy-eye">
<circle cx="120" cy="80" r="6" fill="#333"/>
<circle cx="118" cy="78" r="2" fill="#fff"/>
</g>
<ellipse cx="100" cy="100" rx="18" ry="12" fill="#FFF0D5"/>
<path d="M 96 97 Q 100 100 104 97" fill="none" stroke="#D4A86A" stroke-width="2" stroke-linecap="round"/>
<path id="mouth-brushing" d="M 90 105 Q 100 115 110 105" fill="none" stroke="#333" stroke-width="2.5" stroke-linecap="round"/>
<rect x="145" y="90" width="10" height="80" rx="5" fill="#A3D8F4" transform="rotate(15 150 130)"/>
<rect x="142" y="80" width="16" height="25" rx="4" fill="#FFF" transform="rotate(15 150 130)"/>
<rect x="144" y="82" width="12" height="10" rx="2" fill="#4A90E2" opacity="0.3" transform="rotate(15 150 130)"/>
</svg>`,
        celebrate: `<svg viewBox="0 0 200 220" class="alpaka-svg alpaka-celebrate" aria-label="Alpi feiert!" role="img">
<ellipse cx="100" cy="85" rx="55" ry="50" fill="#FFF5E1"/>
<path d="M 60 220 Q 50 160 70 140 L 80 100" fill="none" stroke="#FFF5E1" stroke-width="40" stroke-linecap="round"/>
<path d="M 140 220 Q 150 160 130 140 L 120 100" fill="none" stroke="#FFF5E1" stroke-width="40" stroke-linecap="round"/>
<rect x="70" y="130" width="60" height="90" fill="#FFF5E1"/>
<ellipse cx="65" cy="50" rx="12" ry="20" fill="#FFF5E1" transform="rotate(-20 65 50)"/>
<ellipse cx="135" cy="50" rx="12" ry="20" fill="#FFF5E1" transform="rotate(20 135 50)"/>
<path d="M 90 40 Q 100 25 110 40" fill="#FFF5E1" stroke="#E6DCC8" stroke-width="2"/>
<circle cx="70" cy="95" r="8" fill="#FFB6C1" opacity="0.6"/>
<circle cx="130" cy="95" r="8" fill="#FFB6C1" opacity="0.6"/>
<g class="buddy-eye">
<path d="M 74 80 Q 80 75 86 80" fill="none" stroke="#333" stroke-width="2.5" stroke-linecap="round"/>
</g>
<g class="buddy-eye">
<path d="M 114 80 Q 120 75 126 80" fill="none" stroke="#333" stroke-width="2.5" stroke-linecap="round"/>
</g>
<path d="M 90 100 Q 100 115 110 100" fill="none" stroke="#333" stroke-width="2.5" stroke-linecap="round"/>
<text x="30" y="60" font-size="28">✨</text>
<text x="145" y="60" font-size="28">✨</text>
</svg>`,
    },

    katze: {
        idle: `<svg viewBox="0 0 200 220" class="alpaka-svg" aria-label="Katze Mia" role="img">
<ellipse cx="100" cy="150" rx="50" ry="60" fill="#FFCC80"/>
<path d="M 60 70 L 60 40 L 90 60" fill="#FFCC80" stroke="#E6B870" stroke-width="2" stroke-linejoin="round"/>
<path d="M 140 70 L 140 40 L 110 60" fill="#FFCC80" stroke="#E6B870" stroke-width="2" stroke-linejoin="round"/>
<ellipse cx="100" cy="85" rx="55" ry="48" fill="#FFCC80"/>
<path d="M 68 50 L 72 65 L 82 60" fill="#FFB6C1"/>
<path d="M 132 50 L 128 65 L 118 60" fill="#FFB6C1"/>
<g class="buddy-eye">
<ellipse cx="80" cy="80" rx="8" ry="10" fill="#FFF"/>
<circle cx="80" cy="80" r="3" fill="#333"/>
</g>
<g class="buddy-eye">
<ellipse cx="120" cy="80" rx="8" ry="10" fill="#FFF"/>
<circle cx="120" cy="80" r="3" fill="#333"/>
</g>
<circle cx="100" cy="95" r="4" fill="#FFB6C1"/>
<line x1="60" y1="90" x2="85" y2="92" stroke="#FFF" stroke-width="2" opacity="0.6"/>
<line x1="60" y1="98" x2="85" y2="96" stroke="#FFF" stroke-width="2" opacity="0.6"/>
<line x1="140" y1="90" x2="115" y2="92" stroke="#FFF" stroke-width="2" opacity="0.6"/>
<line x1="140" y1="98" x2="115" y2="96" stroke="#FFF" stroke-width="2" opacity="0.6"/>
<path d="M 94 105 Q 100 110 106 105" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round"/>
<ellipse cx="100" cy="170" rx="30" ry="25" fill="#FFE0B2"/>
</svg>`,
        brushing: `<svg id="alpaka-brushing" viewBox="0 0 200 220" class="alpaka-svg alpaka-large" aria-label="Mia putzt Zähne" role="img">
<ellipse cx="100" cy="150" rx="50" ry="60" fill="#FFCC80"/>
<path d="M 60 70 L 60 40 L 90 60" fill="#FFCC80" stroke="#E6B870" stroke-width="2" stroke-linejoin="round"/>
<path d="M 140 70 L 140 40 L 110 60" fill="#FFCC80" stroke="#E6B870" stroke-width="2" stroke-linejoin="round"/>
<ellipse cx="100" cy="85" rx="55" ry="48" fill="#FFCC80"/>
<path d="M 68 50 L 72 65 L 82 60" fill="#FFB6C1"/>
<path d="M 132 50 L 128 65 L 118 60" fill="#FFB6C1"/>
<g class="buddy-eye">
<ellipse cx="80" cy="80" rx="8" ry="10" fill="#FFF"/>
<circle cx="80" cy="80" r="3" fill="#333"/>
</g>
<g class="buddy-eye">
<ellipse cx="120" cy="80" rx="8" ry="10" fill="#FFF"/>
<circle cx="120" cy="80" r="3" fill="#333"/>
</g>
<circle cx="100" cy="95" r="4" fill="#FFB6C1"/>
<line x1="60" y1="90" x2="85" y2="92" stroke="#FFF" stroke-width="2" opacity="0.6"/>
<line x1="60" y1="98" x2="85" y2="96" stroke="#FFF" stroke-width="2" opacity="0.6"/>
<line x1="140" y1="90" x2="115" y2="92" stroke="#FFF" stroke-width="2" opacity="0.6"/>
<line x1="140" y1="98" x2="115" y2="96" stroke="#FFF" stroke-width="2" opacity="0.6"/>
<path id="mouth-brushing" d="M 90 105 Q 100 115 110 105" fill="none" stroke="#333" stroke-width="2.5" stroke-linecap="round"/>
<rect x="145" y="90" width="10" height="80" rx="5" fill="#A3D8F4" transform="rotate(15 150 130)"/>
<rect x="142" y="80" width="16" height="25" rx="4" fill="#FFF" transform="rotate(15 150 130)"/>
<rect x="144" y="82" width="12" height="10" rx="2" fill="#4A90E2" opacity="0.3" transform="rotate(15 150 130)"/>
</svg>`,
        celebrate: `<svg viewBox="0 0 200 220" class="alpaka-svg alpaka-celebrate" aria-label="Mia feiert!" role="img">
<ellipse cx="100" cy="150" rx="50" ry="60" fill="#FFCC80"/>
<path d="M 60 70 L 60 40 L 90 60" fill="#FFCC80" stroke="#E6B870" stroke-width="2" stroke-linejoin="round"/>
<path d="M 140 70 L 140 40 L 110 60" fill="#FFCC80" stroke="#E6B870" stroke-width="2" stroke-linejoin="round"/>
<ellipse cx="100" cy="85" rx="55" ry="48" fill="#FFCC80"/>
<path d="M 68 50 L 72 65 L 82 60" fill="#FFB6C1"/>
<path d="M 132 50 L 128 65 L 118 60" fill="#FFB6C1"/>
<g class="buddy-eye">
<path d="M 74 80 Q 80 75 86 80" fill="none" stroke="#333" stroke-width="2.5" stroke-linecap="round"/>
</g>
<g class="buddy-eye">
<path d="M 114 80 Q 120 75 126 80" fill="none" stroke="#333" stroke-width="2.5" stroke-linecap="round"/>
</g>
<circle cx="100" cy="95" r="4" fill="#FFB6C1"/>
<path d="M 90 100 Q 100 115 110 100" fill="none" stroke="#333" stroke-width="2.5" stroke-linecap="round"/>
<path d="M 50 150 L 30 130" fill="none" stroke="#FFCC80" stroke-width="12" stroke-linecap="round"/>
<path d="M 150 150 L 170 130" fill="none" stroke="#FFCC80" stroke-width="12" stroke-linecap="round"/>
<text x="30" y="60" font-size="28">✨</text>
<text x="145" y="60" font-size="28">✨</text>
</svg>`,
    },

    huhn: {
        idle: `<svg viewBox="0 0 200 220" class="alpaka-svg" aria-label="Huhn Hanna" role="img">
<circle cx="100" cy="110" r="60" fill="#FFFACD"/>
<circle cx="100" cy="50" r="10" fill="#FF6B6B"/>
<circle cx="85" cy="55" r="8" fill="#FF6B6B"/>
<circle cx="115" cy="55" r="8" fill="#FF6B6B"/>
<g class="buddy-eye">
<circle cx="80" cy="80" r="5" fill="#333"/>
<circle cx="82" cy="78" r="2" fill="#fff"/>
</g>
<g class="buddy-eye">
<circle cx="120" cy="80" r="5" fill="#333"/>
<circle cx="118" cy="78" r="2" fill="#fff"/>
</g>
<path d="M 92 92 L 100 104 L 108 92" fill="#FFA500" stroke="#E69500" stroke-width="1" stroke-linejoin="round"/>
<circle cx="70" cy="95" r="6" fill="#FFB6C1" opacity="0.6"/>
<circle cx="130" cy="95" r="6" fill="#FFB6C1" opacity="0.6"/>
<path d="M 94 108 Q 100 112 106 108" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round"/>
<path d="M 80 160 L 70 180" fill="none" stroke="#FFA500" stroke-width="4" stroke-linecap="round"/>
<path d="M 70 180 L 60 185" fill="none" stroke="#FFA500" stroke-width="4" stroke-linecap="round"/>
<path d="M 70 180 L 70 188" fill="none" stroke="#FFA500" stroke-width="4" stroke-linecap="round"/>
<path d="M 70 180 L 80 185" fill="none" stroke="#FFA500" stroke-width="4" stroke-linecap="round"/>
<path d="M 120 160 L 130 180" fill="none" stroke="#FFA500" stroke-width="4" stroke-linecap="round"/>
<path d="M 130 180 L 120 185" fill="none" stroke="#FFA500" stroke-width="4" stroke-linecap="round"/>
<path d="M 130 180 L 130 188" fill="none" stroke="#FFA500" stroke-width="4" stroke-linecap="round"/>
<path d="M 130 180 L 140 185" fill="none" stroke="#FFA500" stroke-width="4" stroke-linecap="round"/>
</svg>`,
        brushing: `<svg id="alpaka-brushing" viewBox="0 0 200 220" class="alpaka-svg alpaka-large" aria-label="Hanna putzt Zähne" role="img">
<circle cx="100" cy="110" r="60" fill="#FFFACD"/>
<circle cx="100" cy="50" r="10" fill="#FF6B6B"/>
<circle cx="85" cy="55" r="8" fill="#FF6B6B"/>
<circle cx="115" cy="55" r="8" fill="#FF6B6B"/>
<g class="buddy-eye">
<circle cx="80" cy="80" r="5" fill="#333"/>
<circle cx="82" cy="78" r="2" fill="#fff"/>
</g>
<g class="buddy-eye">
<circle cx="120" cy="80" r="5" fill="#333"/>
<circle cx="118" cy="78" r="2" fill="#fff"/>
</g>
<path d="M 92 92 L 100 104 L 108 92" fill="#FFA500" stroke="#E69500" stroke-width="1" stroke-linejoin="round"/>
<circle cx="70" cy="95" r="6" fill="#FFB6C1" opacity="0.6"/>
<circle cx="130" cy="95" r="6" fill="#FFB6C1" opacity="0.6"/>
<path id="mouth-brushing" d="M 90 105 Q 100 115 110 105" fill="none" stroke="#333" stroke-width="2.5" stroke-linecap="round"/>
<path d="M 150 110 Q 160 120 145 130" fill="none" stroke="#FFFACD" stroke-width="15" stroke-linecap="round"/>
<rect x="145" y="90" width="10" height="80" rx="5" fill="#A3D8F4" transform="rotate(15 150 130)"/>
<rect x="142" y="80" width="16" height="25" rx="4" fill="#FFF" transform="rotate(15 150 130)"/>
<rect x="144" y="82" width="12" height="10" rx="2" fill="#4A90E2" opacity="0.3" transform="rotate(15 150 130)"/>
</svg>`,
        celebrate: `<svg viewBox="0 0 200 220" class="alpaka-svg alpaka-celebrate" aria-label="Hanna feiert!" role="img">
<circle cx="100" cy="110" r="60" fill="#FFFACD"/>
<circle cx="100" cy="50" r="10" fill="#FF6B6B"/>
<circle cx="85" cy="55" r="8" fill="#FF6B6B"/>
<circle cx="115" cy="55" r="8" fill="#FF6B6B"/>
<g class="buddy-eye">
<path d="M 74 80 Q 80 75 86 80" fill="none" stroke="#333" stroke-width="2.5" stroke-linecap="round"/>
</g>
<g class="buddy-eye">
<path d="M 114 80 Q 120 75 126 80" fill="none" stroke="#333" stroke-width="2.5" stroke-linecap="round"/>
</g>
<path d="M 92 92 L 100 104 L 108 92" fill="#FFA500" stroke="#E69500" stroke-width="1" stroke-linejoin="round"/>
<path d="M 90 108 Q 100 120 110 108" fill="none" stroke="#333" stroke-width="2.5" stroke-linecap="round"/>
<path d="M 40 110 Q 20 90 40 70" fill="none" stroke="#FFFACD" stroke-width="15" stroke-linecap="round"/>
<path d="M 160 110 Q 180 90 160 70" fill="none" stroke="#FFFACD" stroke-width="15" stroke-linecap="round"/>
<text x="30" y="60" font-size="28">✨</text>
<text x="170" y="60" font-size="28">✨</text>
</svg>`,
    },
};

// Export für Node.js Tests
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { buddyInfo, buddySvgs };
}
