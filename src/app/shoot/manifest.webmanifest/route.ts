export function GET() {
  return Response.json(
    {
      name: 'WGSC Team',
      short_name: 'WGSC Team',
      description: 'Westerham Game Shooting Club — beaters and pickers-up',
      id: '/shoot',
      start_url: '/shoot',
      scope: '/shoot',
      display: 'standalone',
      orientation: 'portrait',
      background_color: '#f3f0e6',
      theme_color: '#2c3a28',
      icons: [
        { src: '/shoot/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/shoot/icon-512.png', sizes: '512x512', type: 'image/png' },
        { src: '/shoot/icon-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    { headers: { 'content-type': 'application/manifest+json', 'cache-control': 'public, max-age=3600' } },
  )
}
