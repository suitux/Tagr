import { NuqsAdapter } from 'nuqs/adapters/next/app'
import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { Geist, Geist_Mono } from 'next/font/google'
import { QueryProvider } from '@/components/providers/query-provider'
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
  keywords: ['music', 'metadata', 'tags', 'editor', 'self-hosted', 'audio']
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
                <TooltipProvider delayDuration={300}>{children}</TooltipProvider>
              </AlertDialogProvider>
            </NextIntlClientProvider>
          </QueryProvider>
        </NuqsAdapter>
        <Toaster richColors />
      </body>
    </html>
  )
}
