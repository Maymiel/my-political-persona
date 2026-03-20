import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'הפרסונה הפוליטית שלי',
  description: 'שיחה קצרה שמנכיחה מחשבות שלא ידעת שיש לך',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-heebo bg-white text-gray-900 antialiased">
        {children}
      </body>
    </html>
  )
}
