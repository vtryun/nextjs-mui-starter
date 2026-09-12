import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { AlertColor } from '@mui/material/Alert'
import type { SnackbarOrigin } from '@mui/material/Snackbar'

export type SnackbarState = {
  open: boolean
  message: string
  severity: AlertColor
  autoHideDuration: number
  anchorOrigin: SnackbarOrigin
}

type ShowSnackbarPayload = {
  message: string
  severity?: AlertColor
  autoHideDuration?: number
  anchorOrigin?: SnackbarOrigin
}

const DEFAULT_DURATION = 6000
const DEFAULT_ANCHOR: SnackbarOrigin = {
  vertical: 'top',
  horizontal: 'center',
}

const initialState: SnackbarState = {
  open: false,
  message: '',
  severity: 'info',
  autoHideDuration: DEFAULT_DURATION,
  anchorOrigin: DEFAULT_ANCHOR,
}

const snackbarSlice = createSlice({
  name: 'snackbar',
  initialState,
  reducers: {
    showSnackbar: (state, action: PayloadAction<ShowSnackbarPayload>) => {
      state.open = true
      state.message = action.payload.message
      state.severity = action.payload.severity ?? 'info'
      state.autoHideDuration =
        action.payload.autoHideDuration ?? DEFAULT_DURATION
      state.anchorOrigin = action.payload.anchorOrigin ?? DEFAULT_ANCHOR
    },
    hideSnackbar: (state) => {
      state.open = false
    },
  },
})

export const { showSnackbar, hideSnackbar } = snackbarSlice.actions
export default snackbarSlice.reducer
