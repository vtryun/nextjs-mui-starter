import { createAuthClient } from 'better-auth/react'
import { usernameClient } from 'better-auth/client/plugins'

export const authClient = createAuthClient({
  plugins: [
    // `displayUsername: false` must mirror the server plugin options so the
    // inferred types line up.
    usernameClient({ displayUsername: false }),
  ],
})

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  updateUser,
  requestPasswordReset,
  resetPassword,
  listSessions,
  revokeSession,
} = authClient
