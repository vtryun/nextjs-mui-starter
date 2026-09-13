import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter'
import { ThemeProvider } from '@mui/material/styles'
import { Roboto } from 'next/font/google'
import theme from '@/lib/theme'
import type { ReactNode } from 'react'
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript'
import CssBaseline from '@mui/material/CssBaseline'
import { StoreProvider } from '@/components/snackbar-provider'
import { QueryProvider } from '@/components/query-provider'

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto',
})

export const metadata = {
  title: 'Next.js MUI Starter',
  description: 'Next.js + Material UI starter',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={roboto.variable} suppressHydrationWarning>
      <body>
        <InitColorSchemeScript attribute="class" defaultMode="system" />
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme} defaultMode="system">
            <CssBaseline />
            <QueryProvider>
              <StoreProvider>{children}</StoreProvider>
            </QueryProvider>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  )
}
