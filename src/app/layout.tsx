import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SITE_CONFIG } from '@/consts'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: SITE_CONFIG.name,
  description: SITE_CONFIG.description,
  authors: [{ name: SITE_CONFIG.author }],
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <head>
        <link 
          rel="stylesheet" 
          href="https://cdn3.codesign.qq.com/icons/dDyopjDLkGjVe1g/latest/iconfont.css" 
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
