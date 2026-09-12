import { configureStore } from '@reduxjs/toolkit'
import snackbarReducer from './snackbar-slice'

export const makeStore = () =>
  configureStore({
    reducer: {
      snackbar: snackbarReducer,
    },
  })

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
