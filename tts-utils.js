/**
 * Sanitizes text for TTS by removing emojis and extra whitespace.
 * @param {string} text - The text to sanitize.
 * @returns {string} - The cleaned text.
 */
function sanitizeTTS(text) {
    if (typeof text !== 'string') return '';

    return text
        // Remove emojis and pictographs using modern Unicode property escapes
        .replace(/\p{Extended_Pictographic}/gu, '')
        // Replace multiple spaces with a single space (resulting from removed emojis)
        .replace(/\s+/g, ' ')
        .trim();
}

// Export for Node.js tests
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { sanitizeTTS };
}
