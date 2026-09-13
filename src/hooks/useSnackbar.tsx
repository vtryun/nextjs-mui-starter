import type { AlertColor } from '@mui/material/Alert'
import { useAppDispatch } from '@/store/hooks'
import { hideSnackbar, showSnackbar } from '@/store/snackbar-slice'

export function useSnackbar() {
  const dispatch = useAppDispatch()

  return {
    show: (message: string, severity: AlertColor = 'info') =>
      dispatch(showSnackbar({ message, severity })),
    hide: () => dispatch(hideSnackbar()),
  }
}
