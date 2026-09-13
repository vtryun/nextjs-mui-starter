import { describe, expect, test } from 'vitest'
import reducer, {
  hideSnackbar,
  showSnackbar,
  type SnackbarState,
} from '@/store/snackbar-slice'

const initialState: SnackbarState = {
  open: false,
  message: '',
  severity: 'info',
  autoHideDuration: 6000,
  anchorOrigin: { vertical: 'top', horizontal: 'center' },
}

describe('snackbar slice', () => {
  test('returns initial state for unknown action', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual(initialState)
  })

  test('showSnackbar opens with message and defaults', () => {
    const state = reducer(initialState, showSnackbar({ message: 'Hello' }))
    expect(state.open).toBe(true)
    expect(state.message).toBe('Hello')
    expect(state.severity).toBe('info')
    expect(state.autoHideDuration).toBe(6000)
    expect(state.anchorOrigin).toEqual({
      vertical: 'top',
      horizontal: 'center',
    })
  })

  test('showSnackbar respects provided severity and duration', () => {
    const state = reducer(
      initialState,
      showSnackbar({
        message: 'Boom',
        severity: 'error',
        autoHideDuration: 3000,
        anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
      }),
    )
    expect(state.severity).toBe('error')
    expect(state.autoHideDuration).toBe(3000)
    expect(state.anchorOrigin).toEqual({
      vertical: 'bottom',
      horizontal: 'right',
    })
  })

  test('hideSnackbar closes but keeps message', () => {
    const opened = reducer(initialState, showSnackbar({ message: 'Hi' }))
    const closed = reducer(opened, hideSnackbar())
    expect(closed.open).toBe(false)
    expect(closed.message).toBe('Hi')
  })
})
