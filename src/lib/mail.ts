type SendMailParams = {
  to: string
  subject: string
  text: string
}

/**
 * Single delivery seam for transactional email.
 *
 * No provider is wired up yet on purpose: a mismatched half-configured SMTP
 * integration is worse than an obvious failure. What matters is that
 * `sendResetPassword` in `src/lib/auth.ts` only ever calls this function, so
 * plugging in a provider (Resend, SES, SMTP, ...) is a change confined to this
 * file.
 *
 * Development: the message is printed to the server console, so the reset flow
 * is exercisable end to end without any credentials.
 * Production: throws, because silently swallowing reset mail would leave users
 * stuck on a broken flow with no signal to operators.
 */
export async function sendMail({ to, subject, text }: SendMailParams) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'Outbound email is not configured. Implement sendMail() in src/lib/mail.ts before deploying.',
    )
  }

  console.info(
    [
      '',
      '── mail (development) ─────────────────────────────',
      `to:      ${to}`,
      `subject: ${subject}`,
      '',
      text,
      '───────────────────────────────────────────────────',
      '',
    ].join('\n'),
  )
}

export async function sendResetPasswordMail({
  to,
  url,
}: {
  to: string
  url: string
}) {
  await sendMail({
    to,
    subject: 'Reset your password',
    text: `Someone requested a password reset for this address.\n\nUse the link below to choose a new password:\n${url}\n\nIf you did not request this, you can safely ignore this email.`,
  })
}
