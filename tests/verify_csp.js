const fs = require('fs');
const path = require('path');
const assert = require('assert');

const htmlPath = path.join(__dirname, '../index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

// Check for CSP meta tag
const cspRegex = /<meta\s+http-equiv="Content-Security-Policy"\s+content="([^"]+)"/i;
const match = html.match(cspRegex);

assert.ok(match, 'CSP meta tag not found');

const content = match[1];
console.log('CSP Content:', content);

// Validate directives
const expectedDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' https://cdn.jsdelivr.net",
    "style-src 'self' 'unsafe-inline'",
    "connect-src 'self' https://huggingface.co https://*.huggingface.co https://cdn.jsdelivr.net",
    "worker-src 'self' blob:",
    "media-src 'self' blob:",
    "img-src 'self' data:"
];

expectedDirectives.forEach(directive => {
    assert.ok(content.includes(directive), `CSP missing directive: ${directive}`);
});

console.log('CSP Verification Passed!');
