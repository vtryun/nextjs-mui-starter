import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { APIError, createAuthMiddleware } from 'better-auth/api'
import { nextCookies } from 'better-auth/next-js'
import { username } from 'better-auth/plugins'
import type { z } from 'zod'

import prisma from '@/lib/prisma'
import { sendResetPasswordMail } from '@/lib/mail'
import { socialProviders } from '@/lib/social-providers'
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  requestPasswordResetServerSchema,
  resetPasswordServerSchema,
  signInEmailServerSchema,
  signInUsernameServerSchema,
  signUpServerSchema,
  updateUserServerSchema,
} from '@/validations/auth'

const trustedOrigins = (process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

const isProduction = process.env.NODE_ENV === 'production'

/**
 * The browser forms are validated with the same Zod schemas, but a client-side
 * check is only a convenience — it is trivially bypassed by posting to
 * `/api/auth/*` directly. This revalidates every write endpoint that accepts
 * user input before better-auth touches the database.
 */
function validate<T extends z.ZodType>(schema: T, body: unknown): z.infer<T> {
  const result = schema.safeParse(body)

  if (!result.success) {
    const issue = result.error.issues[0]
    const path = issue.path.join('.')

    throw new APIError('BAD_REQUEST', {
      message: path ? `${path}: ${issue.message}` : issue.message,
    })
  }

  return result.data
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: PASSWORD_MIN_LENGTH,
    maxPasswordLength: PASSWORD_MAX_LENGTH,
    // A reset is often the reaction to a compromised account, so other sessions
    // should not survive it.
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      await sendResetPasswordMail({ to: user.email, url })
    },
  },
  socialProviders,
  trustedOrigins,
  rateLimit: {
    // better-auth only rate limits in production by default; stating it
    // explicitly keeps the security posture visible and lets development run
    // unthrottled.
    enabled: isProduction,
    window: 60,
    max: 100,
    customRules: {
      // Credential endpoints are the ones worth brute forcing.
      '/sign-in/email': { window: 60, max: 10 },
      '/sign-in/username': { window: 60, max: 10 },
      '/sign-up/email': { window: 60, max: 5 },
      '/request-password-reset': { window: 300, max: 3 },
    },
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      switch (ctx.path) {
        case '/sign-up/email':
          validate(signUpServerSchema, ctx.body)
          return
        case '/sign-in/email':
          validate(signInEmailServerSchema, ctx.body)
          return
        case '/sign-in/username':
          validate(signInUsernameServerSchema, ctx.body)
          return
        case '/request-password-reset':
          validate(requestPasswordResetServerSchema, ctx.body)
          return
        case '/reset-password':
          validate(resetPasswordServerSchema, ctx.body)
          return
        case '/update-user':
          validate(updateUserServerSchema, ctx.body)
          return
        default:
          return
      }
    }),
  },
  plugins: [
    username({
      minUsernameLength: USERNAME_MIN_LENGTH,
      maxUsernameLength: USERNAME_MAX_LENGTH,
      // `name` already carries the human-readable display value, so the extra
      // `displayUsername` column would be redundant.
      displayUsername: false,
    }),
    // Must stay last so it can act on the cookies set by the endpoints above.
    nextCookies(),
  ],
})
