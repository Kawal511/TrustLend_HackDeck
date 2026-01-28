
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create test borrower with email and phone number for testing
  const dummyBorrower = await prisma.user.upsert({
    where: { email: 'atharvavdeo75@gmail.com' },
    update: {
      phoneNumber: '+917021470357',
      voiceRemindersEnabled: true,
    },
    create: {
      id: 'atharva_user_123',
      email: 'atharvavdeo75@gmail.com',
      firstName: 'Atharva',
      lastName: 'Deo',
      username: 'atharvadeo',
      phoneNumber: '+917021470357',
      voiceRemindersEnabled: true,
      trustScore: 100,
    },
  })
  console.log('✅ Created/Updated user:', { dummyBorrower })

  // Create a test lender
  const dummyLender = await prisma.user.upsert({
    where: { email: 'lender@test.com' },
    update: {},
    create: {
      id: 'dummy_lender_456',
      email: 'lender@test.com',
      firstName: 'Test',
      lastName: 'Lender',
      username: 'testlender',
      trustScore: 95,
    },
  })
  console.log('✅ Created/Updated lender:', { dummyLender })
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
