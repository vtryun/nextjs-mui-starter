-- Adds the username required by the better-auth `username` plugin.
-- Postgres treats NULLs as distinct in a unique index, so existing rows keep
-- working with `username = NULL` until their owner sets one.

-- AlterTable
ALTER TABLE "user" ADD COLUMN "username" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- CreateIndex
-- Not part of better-auth's default Prisma schema, but the library looks
-- accounts up by (providerId, accountId), so duplicates would be ambiguous.
CREATE UNIQUE INDEX "account_providerId_accountId_key" ON "account"("providerId", "accountId");
