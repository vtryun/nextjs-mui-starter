import 'dotenv/config'
import prisma from '../src/lib/prisma'

async function main() {
  // No business models yet — only better-auth tables (User/Session/Account/Verification).
  // Add seed logic here once you introduce your own models, e.g.:
  //
  //   await prisma.post.createMany({ data: [...] })
  //
  console.log('Nothing to seed yet.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
