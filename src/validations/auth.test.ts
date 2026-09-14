import { describe, expect, test } from 'vitest'
import {
  PASSWORD_MAX_LENGTH,
  loginSchema,
  profileSchema,
  registerSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
  signInUsernameServerSchema,
  signUpServerSchema,
} from '@/validations/auth'

describe('loginSchema', () => {
  const valid = {
    identifier: 'user@example.com',
    password: 'anything',
    rememberMe: false,
  }

  test('accepts an email identifier', () => {
    expect(loginSchema.safeParse(valid).success).toBe(true)
  })

  test('accepts a username identifier', () => {
    expect(
      loginSchema.safeParse({ ...valid, identifier: 'john.doe' }).success,
    ).toBe(true)
  })

  test('rejects a blank identifier', () => {
    const result = loginSchema.safeParse({ ...valid, identifier: '   ' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['identifier'])
    }
  })

  // Anything containing "@" is dispatched to signIn.email, so it has to be a
  // well-formed address or the failure only surfaces after a server round trip.
  test.each(['@', 'a@', '@b', 'a@b', 'a b@c.com'])(
    'rejects %s, which would be dispatched to the email endpoint',
    (identifier) => {
      const result = loginSchema.safeParse({ ...valid, identifier })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['identifier'])
      }
    },
  )

  // Without an "@" the value is dispatched to signIn.username, so it has to
  // satisfy the username rules.
  test.each(['ab', 'has space', 'has-dash', 'x'.repeat(31)])(
    'rejects %s, which would be dispatched to the username endpoint',
    (identifier) => {
      expect(loginSchema.safeParse({ ...valid, identifier }).success).toBe(
        false,
      )
    },
  )

  test('accepts a username with dots and underscores', () => {
    expect(
      loginSchema.safeParse({ ...valid, identifier: 'john.doe_99' }).success,
    ).toBe(true)
  })

  test('rejects an empty password', () => {
    expect(loginSchema.safeParse({ ...valid, password: '' }).success).toBe(
      false,
    )
  })

  test('does not enforce the sign-up password policy on sign-in', () => {
    // A short password must still be submittable — the policy can change over
    // time and existing accounts must not be locked out of the form.
    expect(loginSchema.safeParse({ ...valid, password: 'old' }).success).toBe(
      true,
    )
  })

  test('requires rememberMe to be a boolean', () => {
    expect(loginSchema.safeParse({ ...valid, rememberMe: 'yes' }).success).toBe(
      false,
    )
  })
})

describe('registerSchema', () => {
  const valid = {
    name: 'Alice',
    username: 'alice',
    email: 'alice@example.com',
    password: 'password1234',
    confirmPassword: 'password1234',
  }

  test('accepts valid input', () => {
    expect(registerSchema.safeParse(valid).success).toBe(true)
  })

  test('rejects name shorter than 2 characters', () => {
    const result = registerSchema.safeParse({ ...valid, name: 'A' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['name'])
    }
  })

  test('rejects username shorter than 3 characters', () => {
    const result = registerSchema.safeParse({ ...valid, username: 'ab' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['username'])
    }
  })

  test.each(['has space', 'has-dash', 'has@symbol', 'emoji🙂'])(
    'rejects username %s',
    (username) => {
      expect(registerSchema.safeParse({ ...valid, username }).success).toBe(
        false,
      )
    },
  )

  test('accepts underscores and dots in a username', () => {
    expect(
      registerSchema.safeParse({ ...valid, username: 'john.doe_99' }).success,
    ).toBe(true)
  })

  test('rejects mismatched passwords', () => {
    const result = registerSchema.safeParse({
      ...valid,
      confirmPassword: 'different',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['confirmPassword'])
    }
  })

  test('rejects a password beyond the maximum length', () => {
    const password = 'a'.repeat(PASSWORD_MAX_LENGTH + 1)
    expect(
      registerSchema.safeParse({
        ...valid,
        password,
        confirmPassword: password,
      }).success,
    ).toBe(false)
  })

  test('rejects invalid email', () => {
    const result = registerSchema.safeParse({ ...valid, email: 'bad' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['email'])
    }
  })
})

describe('signUpServerSchema', () => {
  // Mirrors what better-auth posts to /sign-up/email: no confirmPassword.
  const valid = {
    name: 'Alice',
    username: 'alice',
    email: 'alice@example.com',
    password: 'password1234',
  }

  test('accepts the server payload shape', () => {
    expect(signUpServerSchema.safeParse(valid).success).toBe(true)
  })

  test('rejects an invalid username posted directly to the endpoint', () => {
    expect(
      signUpServerSchema.safeParse({ ...valid, username: 'a' }).success,
    ).toBe(false)
  })
})

describe('signInUsernameServerSchema', () => {
  test('accepts a valid payload', () => {
    expect(
      signInUsernameServerSchema.safeParse({
        username: 'alice',
        password: 'password1234',
      }).success,
    ).toBe(true)
  })

  test('rejects a malformed username', () => {
    expect(
      signInUsernameServerSchema.safeParse({
        username: 'not valid',
        password: 'password1234',
      }).success,
    ).toBe(false)
  })
})

describe('requestPasswordResetSchema', () => {
  test('accepts a valid email', () => {
    expect(
      requestPasswordResetSchema.safeParse({ email: 'a@b.com' }).success,
    ).toBe(true)
  })

  test('rejects a malformed email', () => {
    expect(
      requestPasswordResetSchema.safeParse({ email: 'nope' }).success,
    ).toBe(false)
  })
})

describe('resetPasswordSchema', () => {
  test('accepts matching passwords', () => {
    expect(
      resetPasswordSchema.safeParse({
        password: 'password1234',
        confirmPassword: 'password1234',
      }).success,
    ).toBe(true)
  })

  test('rejects a too-short password', () => {
    expect(
      resetPasswordSchema.safeParse({
        password: 'short',
        confirmPassword: 'short',
      }).success,
    ).toBe(false)
  })

  test('rejects mismatched passwords', () => {
    const result = resetPasswordSchema.safeParse({
      password: 'password1234',
      confirmPassword: 'password5678',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['confirmPassword'])
    }
  })
})

describe('profileSchema', () => {
  test('accepts a fully populated profile', () => {
    expect(
      profileSchema.safeParse({
        name: 'Alice',
        username: 'alice',
        image: 'https://example.com/a.png',
      }).success,
    ).toBe(true)
  })

  test('accepts an empty username for accounts created before the plugin', () => {
    expect(
      profileSchema.safeParse({ name: 'Alice', username: '', image: '' })
        .success,
    ).toBe(true)
  })

  test('rejects a relative avatar URL', () => {
    expect(
      profileSchema.safeParse({
        name: 'Alice',
        username: 'alice',
        image: '/a.png',
      }).success,
    ).toBe(false)
  })

  test('rejects an over-long name', () => {
    expect(
      profileSchema.safeParse({
        name: 'a'.repeat(51),
        username: 'alice',
        image: '',
      }).success,
    ).toBe(false)
  })
})
