import type { ReactNode } from 'react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

type AuthCardProps = {
  title: string
  subtitle: string
  children: ReactNode
}

/** Centered single-column shell shared by the unauthenticated auth pages. */
export default function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 3, md: 4 },
        bgcolor: 'background.paper',
      }}
    >
      <Box sx={{ maxWidth: 400, width: '100%' }}>
        <Stack spacing={3}>
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Typography variant="h2" sx={{ fontWeight: 600, mb: 1 }}>
              {title}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {subtitle}
            </Typography>
          </Box>
          {children}
        </Stack>
      </Box>
    </Box>
  )
}
