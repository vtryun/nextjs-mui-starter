import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { describe, expect, test } from 'vitest'
import { makeStore } from '@/store'
import { useSnackbar } from '@/hooks/useSnackbar'

function TestComponent() {
  const { show, hide } = useSnackbar()
  return (
    <>
      <button onClick={() => show('hello')}>show default</button>
      <button onClick={() => show('boom', 'error')}>show error</button>
      <button onClick={hide}>hide</button>
    </>
  )
}

function renderWithStore() {
  const store = makeStore()
  render(
    <Provider store={store}>
      <TestComponent />
    </Provider>,
  )
  return store
}

describe('useSnackbar', () => {
  test('show dispatches showSnackbar with default severity', async () => {
    const store = renderWithStore()
    await userEvent.click(screen.getByRole('button', { name: 'show default' }))

    const state = store.getState().snackbar
    expect(state.open).toBe(true)
    expect(state.message).toBe('hello')
    expect(state.severity).toBe('info')
  })

  test('show respects provided severity', async () => {
    const store = renderWithStore()
    await userEvent.click(screen.getByRole('button', { name: 'show error' }))

    expect(store.getState().snackbar.severity).toBe('error')
  })

  test('hide dispatches hideSnackbar', async () => {
    const store = renderWithStore()
    await userEvent.click(screen.getByRole('button', { name: 'show default' }))
    expect(store.getState().snackbar.open).toBe(true)

    await userEvent.click(screen.getByRole('button', { name: 'hide' }))
    expect(store.getState().snackbar.open).toBe(false)
  })
})
