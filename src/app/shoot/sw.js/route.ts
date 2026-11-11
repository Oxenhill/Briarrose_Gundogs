// Minimal service worker: makes the app installable and shows a friendly page
// when there's no signal. (The offline day sheet arrives in Phase 2.)
const SW = `
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', (event) => {
  if (event.request.mode !== 'navigate') return;
  event.respondWith(
    fetch(event.request).catch(() =>
      new Response(
        '<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><title>WGSC Team</title>' +
        '<body style="font-family:system-ui;padding:24px;background:#f3f0e6;color:#1f271a">' +
        '<h1 style="font-size:1.4rem">No signal</h1><p>The WGSC Team app needs a connection. Try again when you have signal.</p>' +
        '<p><button onclick="location.reload()" style="font-size:1.1rem;padding:14px 20px;border-radius:12px;border:0;background:#2c3a28;color:#fff">Try again</button></p></body>',
        { headers: { 'content-type': 'text/html; charset=utf-8' } }
      )
    )
  );
});
`

export function GET() {
  return new Response(SW, {
    headers: {
      'content-type': 'application/javascript; charset=utf-8',
      'cache-control': 'no-cache',
      'service-worker-allowed': '/shoot',
    },
  })
}
