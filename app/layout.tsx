import type { Metadata, Viewport } from 'next'
import './globals.css'

const title = 'Emergent Ventures beyond the main series'
const description =
  'The 469 Emergent Ventures grantees from the India, Africa and Caribbean, Covid prize and progress studies tranches, searchable by meaning.'
const url = 'https://evwinners.thothica.com'

export const metadata: Metadata = {
  metadataBase: new URL(url),
  title,
  description,
  applicationName: 'Emergent Ventures beyond the main series',
  authors: [{ name: 'Adnan Abbasi', url: 'https://thothica.com' }],
  icons: { icon: '/brand/thothica-thumb-black.png', apple: '/brand/thothica-thumb-black.png' },
  openGraph: { title, description, url, siteName: title, type: 'website' },
  twitter: { card: 'summary', title, description },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a className="skip" href="#grantees">Skip to the grantees</a>
        {children}
      </body>
    </html>
  )
}
