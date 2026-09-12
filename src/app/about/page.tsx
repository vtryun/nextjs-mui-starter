import Link from '@/components/link'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

export default function AboutPage() {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" component="h1">
        About
      </Typography>
      <Typography component={Link} href="/">
        home
      </Typography>
    </Box>
  )
}
