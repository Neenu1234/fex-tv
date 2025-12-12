import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Fex TV - Voice-Powered Movie Recommendations',
  description: 'Speak your movie preferences and get intelligent recommendations',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

