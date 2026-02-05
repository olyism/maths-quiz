import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: "Zoe's Math Quiz - Fun with Pigs!",
  description: 'A playful math quiz for learning times tables',
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
