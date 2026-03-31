import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { Suspense } from 'react'
import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { Geist, Geist_Mono } from 'next/font/google'
import { QueryProvider } from '@/components/providers/query-provider'
import { ServiceWorkerRegister } from '@/components/pwa/service-worker-register'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AlertDialogProvider } from '@/contexts/alert-dialog-context'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
})

export const metadata: Metadata = {
  title: 'Tagr',
  description: 'Self-hosted music metadata editor. Browse, edit, and manage audio file tags from your browser.',
  applicationName: 'Tagr',
  keywords: ['music', 'metadata', 'tags', 'editor', 'self-hosted', 'audio'],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Tagr',
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en' className='dark'>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} cz-shortcut-listen='true'>
        <NuqsAdapter>
          <QueryProvider>
            <NextIntlClientProvider>
              <AlertDialogProvider>
                <TooltipProvider delayDuration={300}>
                  <Suspense>{children}</Suspense>
                </TooltipProvider>
              </AlertDialogProvider>
            </NextIntlClientProvider>
          </QueryProvider>
        </NuqsAdapter>
        <Toaster richColors />
        <ServiceWorkerRegister />
      </body>
    </html>
  )
}
