import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Next GPT',
  description: 'Get answers from AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" >
      <body className={`bg-slate-950 placeholder:${inter.className}`}>{children}</body>
    </html>
  )
}
