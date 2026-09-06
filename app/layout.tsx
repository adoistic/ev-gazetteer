import type { Metadata, Viewport } from 'next'
import './globals.css'

const title = 'The Emergent Ventures Gazetteer'
const description =
  'Every Emergent Ventures grant, read and classified by field, by what was made and by where. Built on Nabeel Qureshi\'s dataset.'
const url = 'https://evwinners.thothica.com'

export const metadata: Metadata = {
  metadataBase: new URL(url),
  title,
  description,
  applicationName: 'The Emergent Ventures Gazetteer',
  authors: [{ name: 'Adnan Abbasi', url: 'https://thothica.com' }],
  icons: { icon: '/brand/thothica-thumb-black.png', apple: '/brand/thothica-thumb-black.png' },
  openGraph: {
    title,
    description,
    url,
    siteName: title,
    type: 'website',
    // WhatsApp and Slack want the dimensions declared or they may skip the card.
    images: [{ url: '/og.png', width: 1200, height: 630, type: 'image/png', alt: title }],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: ['/og.png'],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // The masthead is black on every screen; there is no light and dark mode.
  themeColor: '#000000',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a className="skip" href="#grants">Skip to the grantees</a>
        {children}
      </body>
    </html>
  )
}
