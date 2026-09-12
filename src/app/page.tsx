import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Link from '@/components/link'
import ThemeToggle from '@/components/theme-toggle'

export default function Page() {
  return (
    <Stack spacing={2} sx={{ p: 4, alignItems: 'flex-start' }}>
      <Typography variant="h4" component="h1">
        Home
      </Typography>
      <Button component={Link} href="/about" variant="contained">
        Go to About Page
      </Button>
      <ThemeToggle />
    </Stack>
  )
}
