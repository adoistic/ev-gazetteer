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
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#141414' },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/*
          Runs before first paint. The site is a static export, so the HTML
          arrives before React does; without this a reader who chose dark on a
          light machine would get a white flash on every page load.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('theme');if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t)}}catch(e){}",
          }}
        />
      </head>
      <body>
        <a className="skip" href="#grants">Skip to the grantees</a>
        {children}
      </body>
    </html>
  )
}
