'use client'

import { AppStore, makeStore } from '@/store'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { hideSnackbar } from '@/store/snackbar-slice'
import Alert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'
import { useState, type ReactNode } from 'react'
import { Provider } from 'react-redux'

function SnackbarHost() {
  const dispatch = useAppDispatch()
  const { open, message, severity, autoHideDuration, anchorOrigin } =
    useAppSelector((state) => state.snackbar)

  const handleClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === 'clickaway') return
    dispatch(hideSnackbar())
  }

  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={handleClose}
      anchorOrigin={anchorOrigin}
    >
      <Alert
        onClose={handleClose}
        severity={severity}
        variant="filled"
        sx={{ width: '100%' }}
      >
        {message}
      </Alert>
    </Snackbar>
  )
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [store] = useState<AppStore>(() => makeStore())

  return (
    <Provider store={store}>
      {children}
      <SnackbarHost />
    </Provider>
  )
}
