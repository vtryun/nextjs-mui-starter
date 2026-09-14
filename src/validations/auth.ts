import { z } from 'zod'

export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 72
export const USERNAME_MIN_LENGTH = 3
export const USERNAME_MAX_LENGTH = 30
export const NAME_MIN_LENGTH = 2
export const NAME_MAX_LENGTH = 50

const USERNAME_PATTERN = /^[a-zA-Z0-9._]+$/

export const emailSchema = z
  .email('Please enter a valid email')
  .max(254, 'Email must be at most 254 characters')

export const passwordSchema = z
  .string()
  .min(
    PASSWORD_MIN_LENGTH,
    `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
  )
  .max(
    PASSWORD_MAX_LENGTH,
    `Password must be at most ${PASSWORD_MAX_LENGTH} characters`,
  )

export const nameSchema = z
  .string()
  .trim()
  .min(NAME_MIN_LENGTH, `Name must be at least ${NAME_MIN_LENGTH} characters`)
  .max(NAME_MAX_LENGTH, `Name must be at most ${NAME_MAX_LENGTH} characters`)

export const usernameSchema = z
  .string()
  .trim()
  .min(
    USERNAME_MIN_LENGTH,
    `Username must be at least ${USERNAME_MIN_LENGTH} characters`,
  )
  .max(
    USERNAME_MAX_LENGTH,
    `Username must be at most ${USERNAME_MAX_LENGTH} characters`,
  )
  .regex(
    USERNAME_PATTERN,
    'Username can only contain letters, numbers, underscores, and dots',
  )

export type IdentifierKind = 'email' | 'username'

/**
 * The single definition of the "is this an email or a username?" rule.
 *
 * The sign-in form uses it to choose between `signIn.email` and
 * `signIn.username`; `loginSchema` uses it to pick the matching validator. Two
 * copies of an `includes('@')` check would be two chances to disagree.
 */
export function resolveIdentifierKind(value: string): IdentifierKind {
  return value.includes('@') ? 'email' : 'username'
}

export const loginSchema = z.object({
  // Accepts either an email address or a username. Validated with the same rule
  // the submit handler dispatches on, so a malformed value is rejected in the
  // form instead of after a round trip to the server.
  identifier: z
    .string()
    .trim()
    .min(1, 'Enter your email or username')
    .refine(
      (value) =>
        resolveIdentifierKind(value) === 'email'
          ? emailSchema.safeParse(value).success
          : usernameSchema.safeParse(value).success,
      { message: 'Enter a valid email address or username' },
    ),
  // Only "required" is enforced here. Password *policy* belongs on sign-up and
  // reset; enforcing it on sign-in would lock out accounts whose password
  // predates the current policy.
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean(),
})

export type LoginInput = z.infer<typeof loginSchema>

const registerBaseSchema = z.object({
  name: nameSchema,
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
})

export const registerSchema = registerBaseSchema
  .extend({
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type RegisterInput = z.infer<typeof registerSchema>

export const requestPasswordResetSchema = z.object({
  email: emailSchema,
})

export type RequestPasswordResetInput = z.infer<
  typeof requestPasswordResetSchema
>

const resetPasswordBaseSchema = z.object({
  password: passwordSchema,
})

export const resetPasswordSchema = resetPasswordBaseSchema
  .extend({
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>

export const profileSchema = z.object({
  name: nameSchema,
  // Empty string means "leave the username unset" — existing accounts created
  // before the username plugin have no username yet.
  username: z.union([usernameSchema, z.literal('')]),
  // Empty string clears the avatar.
  image: z.union([z.url('Enter a valid image URL'), z.literal('')]),
})

export type ProfileInput = z.infer<typeof profileSchema>

// Server-side mirrors of the schemas above. They validate the request bodies
// that better-auth receives, so the rules cannot be bypassed by skipping the
// browser form. `confirmPassword` never reaches the server and is therefore
// absent.
export const signUpServerSchema = registerBaseSchema

export const signInEmailServerSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
})

export const signInUsernameServerSchema = z.object({
  username: usernameSchema,
  password: z.string().min(1),
})

export const requestPasswordResetServerSchema = z.object({
  email: emailSchema,
  redirectTo: z.string().optional(),
})

export const resetPasswordServerSchema = z.object({
  newPassword: passwordSchema,
  token: z.string().min(1, 'Reset token is required'),
})

export const updateUserServerSchema = z.object({
  name: nameSchema.optional(),
  username: z.union([usernameSchema, z.literal('')]).optional(),
  // `null` clears the avatar; `nullish` covers it alongside `undefined`.
  image: z.union([z.url(), z.literal('')]).nullish(),
})
