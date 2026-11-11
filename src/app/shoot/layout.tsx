import type { Metadata, Viewport } from 'next'
import './shoot.css'
import { APP_NAME, CLUB_NAME } from '@/shoot/util'
import { InstallButton, ServiceWorker } from '@/shoot/ui/install'

export const metadata: Metadata = {
  title: { absolute: APP_NAME },
  description: `Private team app for ${CLUB_NAME} beaters and pickers-up.`,
  robots: { index: false, follow: false },
  manifest: '/shoot/manifest.webmanifest',
  appleWebApp: { capable: true, title: APP_NAME, statusBarStyle: 'black-translucent' },
  icons: { icon: '/shoot/icon-192.png', apple: '/shoot/apple-icon.png' },
  openGraph: null,
  twitter: null,
  alternates: null,
}

export const viewport: Viewport = {
  themeColor: '#2c3a28',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function ShootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="shoot">
      <header className="s-top">
        <div className="s-brand">
          {APP_NAME}
          <small>{CLUB_NAME}</small>
        </div>
        <InstallButton />
      </header>
      {children}
      <ServiceWorker />
    </div>
  )
}
