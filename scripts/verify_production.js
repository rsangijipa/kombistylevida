const http = require('http');

const BASE_URL = 'http://localhost:3000';

const tests = [
    { path: '/blog', expectedStatus: 308, expectedRedirect: '/noticias', desc: 'Redirect /blog -> /noticias' }, // Next.js default permanent is 308 mostly
    { path: '/noticias', expectedStatus: 200, desc: 'Public Blog Index' },
    { path: '/sitemap.xml', expectedStatus: 200, desc: 'Sitemap XML' },
    { path: '/rss.xml', expectedStatus: 200, desc: 'RSS XML' },
    { path: '/admin', expectedStatus: 200, desc: 'Admin Login Page (Client-side Guard)' },
];

async function check(t) {
    return new Promise((resolve) => {
        http.get(BASE_URL + t.path, (res) => {
            // Check status
            let pass = true;
            let msg = '';

            // Next.js redirects might use 307/308 or refresh header depending on config
            // But standard 301/308 is expected for permanent.
            if (t.expectedStatus && res.statusCode !== t.expectedStatus) {
                // Allow 308 if 301 was expected, or vice versa, as strictly permanent
                if ((t.expectedStatus === 301 && res.statusCode === 308) || (t.expectedStatus === 308 && res.statusCode === 301)) {
                    // OK
                } else {
                    pass = false;
                    msg += `Expected ${t.expectedStatus}, got ${res.statusCode}. `;
                }
            }

            if (t.expectedRedirect && res.headers.location !== t.expectedRedirect) {
                // Try checking if it contains the path
                if (!res.headers.location?.includes(t.expectedRedirect)) {
                    pass = false;
                    msg += `Expected Location ${t.expectedRedirect}, got ${res.headers.location}. `;
                }
            }

            console.log(`[${pass ? 'PASS' : 'FAIL'}] ${t.desc} (${t.path}) ${msg}`);
            resolve(pass);
        }).on('error', (e) => {
            console.log(`[ERROR] ${t.desc}: ${e.message}`);
            resolve(false);
        });
    });
}

(async () => {
    console.log("Starting Post-Deploy Verification...");
    let success = true;
    for (const t of tests) {
        if (!await check(t)) success = false;
    }
    process.exit(success ? 0 : 1);
})();
