'use client'

import type { Theme } from '@mui/material/styles'
import { alpha, useColorScheme } from '@mui/material/styles'
import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import type { SvgIconComponent } from '@mui/icons-material'
import MonitorRoundedIcon from '@mui/icons-material/MonitorRounded'
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded'
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded'

const THEME_OPTIONS = [
  { value: 'light', label: 'Light', Icon: LightModeRoundedIcon },
  { value: 'dark', label: 'Dark', Icon: DarkModeRoundedIcon },
  { value: 'system', label: 'System', Icon: MonitorRoundedIcon },
] as const satisfies ReadonlyArray<{
  value: string
  label: string
  Icon: SvgIconComponent
}>

type ThemeMode = (typeof THEME_OPTIONS)[number]['value']

const containerSx = (theme: Theme) => ({
  display: 'inline-flex',
  alignItems: 'center',
  borderRadius: 999,
  border: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(0.5),
  gap: 0.5,
  backgroundColor: theme.palette.background.paper,
  ...theme.applyStyles('dark', {
    // 容器背景改成黑色
    backgroundColor: '#000',
    // 边框色改成灰白色
    borderColor: theme.palette.grey[900],
  }),
})

const buttonSx = (theme: Theme) => ({
  width: 26,
  height: 26,
  borderRadius: '50%',
  padding: theme.spacing(0.75),
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'transparent',
  transition: theme.transitions.create(['background-color', 'color'], {
    duration: 300,
  }),
  '@media (prefers-reduced-motion: reduce)': {
    transition: 'none',
  },
  color: theme.palette.text.secondary,
  '&:hover': {
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.action.hover,
  },
  '&[data-selected="true"]': {
    backgroundColor: theme.palette.action.selected,
    color: theme.palette.text.primary,
  },
  '& .MuiSvgIcon-root': {
    fontSize: 16,
  },
  ...theme.applyStyles('dark', {
    backgroundColor: 'transparent',
    // 图标默认是灰色
    color: theme.palette.grey[500],
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
      color: theme.palette.grey[300],
    },
    // 选中的按钮带主题色
    '&[data-selected="true"]': {
      backgroundColor: alpha(theme.palette.primary.main, 0.7),
      color: theme.palette.primary.contrastText,
      '&:hover': {
        backgroundColor: alpha(theme.palette.primary.dark, 0.5),
      },
    },
  }),
})

export default function ThemeToggle() {
  const { mode, setMode } = useColorScheme()

  if (!mode) return null

  return (
    <Box sx={containerSx}>
      {THEME_OPTIONS.map(({ value, label, Icon }) => {
        const selected = mode === value
        return (
          <ButtonBase
            key={value}
            aria-label={label}
            title={label}
            data-selected={selected}
            onClick={() => setMode(value as ThemeMode)}
            sx={buttonSx}
          >
            <Icon fontSize="small" />
          </ButtonBase>
        )
      })}
    </Box>
  )
}
