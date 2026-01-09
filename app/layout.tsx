import type { Metadata } from "next"
import { Inter, Outfit } from 'next/font/google'
import "./globals.css"

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const outfit = Outfit({ 
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
})

export const metadata: Metadata = {
  title: "karenBan",
  description: "A vibrant, playful task management application with the MGMT design system",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <head>
        <style>{`
          :root {
            --font-inter: ${inter.style.fontFamily};
            --font-outfit: ${outfit.style.fontFamily};
          }
        `}</style>
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
