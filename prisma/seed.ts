
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const dummyBorrower = await prisma.user.upsert({
    where: { email: 'borrower@test.com' },
    update: {},
    create: {
      id: 'dummy_borrower_123',
      email: 'borrower@test.com',
      firstName: 'Test',
      lastName: 'Borrower',
      username: 'testborrower',
      trustScore: 85,
    },
  })
  console.log({ dummyBorrower })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
