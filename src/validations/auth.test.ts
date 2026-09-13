import { describe, expect, test } from 'vitest'
import { loginSchema, registerSchema } from '@/validations/auth'

describe('loginSchema', () => {
  const valid = {
    email: 'user@example.com',
    password: '12345678',
    rememberMe: false,
  }

  test('accepts valid input', () => {
    expect(loginSchema.safeParse(valid).success).toBe(true)
  })

  test('rejects invalid email', () => {
    const result = loginSchema.safeParse({ ...valid, email: 'not-an-email' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['email'])
    }
  })

  test('rejects password shorter than 8 characters', () => {
    const result = loginSchema.safeParse({ ...valid, password: '1234567' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['password'])
    }
  })

  test('rejects empty password', () => {
    const result = loginSchema.safeParse({ ...valid, password: '' })
    expect(result.success).toBe(false)
  })

  test('requires rememberMe to be a boolean', () => {
    const result = loginSchema.safeParse({ ...valid, rememberMe: 'yes' })
    expect(result.success).toBe(false)
  })
})

describe('registerSchema', () => {
  const valid = {
    name: 'Alice',
    email: 'alice@example.com',
    password: '12345678',
    confirmPassword: '12345678',
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

  test('rejects invalid email', () => {
    const result = registerSchema.safeParse({ ...valid, email: 'bad' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['email'])
    }
  })
})
