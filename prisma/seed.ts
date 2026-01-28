import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create 10 users with realistic Indian names
  const users = [
    {
      id: 'user_rahul_001',
      email: 'rahul.sharma@gmail.com',
      firstName: 'Rahul',
      lastName: 'Sharma',
      username: 'rahulsharma',
      trustScore: 92,
    },
    {
      id: 'user_priya_002',
      email: 'priya.patel@gmail.com',
      firstName: 'Priya',
      lastName: 'Patel',
      username: 'priyapatel',
      trustScore: 88,
    },
    {
      id: 'user_amit_003',
      email: 'amit.kumar@outlook.com',
      firstName: 'Amit',
      lastName: 'Kumar',
      username: 'amitkumar',
      trustScore: 75,
    },
    {
      id: 'user_sneha_004',
      email: 'sneha.reddy@yahoo.com',
      firstName: 'Sneha',
      lastName: 'Reddy',
      username: 'snehareddy',
      trustScore: 95,
    },
    {
      id: 'user_vikram_005',
      email: 'vikram.singh@gmail.com',
      firstName: 'Vikram',
      lastName: 'Singh',
      username: 'vikramsingh',
      trustScore: 68,
    },
    {
      id: 'user_ananya_006',
      email: 'ananya.gupta@gmail.com',
      firstName: 'Ananya',
      lastName: 'Gupta',
      username: 'ananyagupta',
      trustScore: 82,
    },
    {
      id: 'user_arjun_007',
      email: 'arjun.das@outlook.com',
      firstName: 'Arjun',
      lastName: 'Das',
      username: 'arjundas',
      trustScore: 79,
    },
    {
      id: 'user_kavya_008',
      email: 'kavya.menon@gmail.com',
      firstName: 'Kavya',
      lastName: 'Menon',
      username: 'kavyamenon',
      trustScore: 91,
    },
    {
      id: 'user_rohan_009',
      email: 'rohan.joshi@yahoo.com',
      firstName: 'Rohan',
      lastName: 'Joshi',
      username: 'rohanjoshi',
      trustScore: 85,
    },
    {
      id: 'user_nisha_010',
      email: 'nisha.agarwal@gmail.com',
      firstName: 'Nisha',
      lastName: 'Agarwal',
      username: 'nishaagarwal',
      trustScore: 77,
    },
    {
      id: 'atharva_user_123',
      email: 'atharvavdeo75@gmail.com',
      firstName: 'Atharva',
      lastName: 'Deo',
      username: 'atharvadeo',
      phoneNumber: '+917021470357',
      voiceRemindersEnabled: true,
      trustScore: 100,
    },
  ]

  console.log('🌱 Seeding users...')

  for (const userData of users) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: userData,
    })
    console.log(`✅ Created user: ${user.firstName} ${user.lastName} (${user.email})`)
  }

  // Create some sample loans between users
  console.log('\n💰 Seeding loans...')

  const loans = [
    {
      id: 'loan_001',
      lenderId: 'user_rahul_001',
      borrowerId: 'user_amit_003',
      amount: 15000,
      balance: 10000,
      purpose: 'Medical emergency - hospital bills',
      dueDate: new Date('2026-03-15'),
      status: 'ACTIVE',
    },
    {
      id: 'loan_002',
      lenderId: 'user_priya_002',
      borrowerId: 'user_vikram_005',
      amount: 25000,
      balance: 25000,
      purpose: 'Laptop for new job',
      dueDate: new Date('2026-04-01'),
      status: 'ACTIVE',
    },
    {
      id: 'loan_003',
      lenderId: 'user_sneha_004',
      borrowerId: 'user_arjun_007',
      amount: 8000,
      balance: 0,
      purpose: 'College textbooks',
      dueDate: new Date('2026-02-28'),
      status: 'PAID',
    },
    {
      id: 'loan_004',
      lenderId: 'user_kavya_008',
      borrowerId: 'user_rohan_009',
      amount: 50000,
      balance: 35000,
      purpose: 'Wedding expenses',
      dueDate: new Date('2026-06-15'),
      status: 'ACTIVE',
    },
    {
      id: 'loan_005',
      lenderId: 'user_ananya_006',
      borrowerId: 'user_nisha_010',
      amount: 12000,
      balance: 12000,
      purpose: 'Rent advance',
      dueDate: new Date('2026-02-01'),
      status: 'OVERDUE',
    },
  ]

  for (const loanData of loans) {
    const loan = await prisma.loan.upsert({
      where: { id: loanData.id },
      update: {},
      create: loanData,
    })
    console.log(`✅ Created loan: ₹${loan.amount} - ${loanData.purpose}`)
  }

  // Create some repayments
  console.log('\n💳 Seeding repayments...')

  const repayments = [
    {
      id: 'repay_001',
      loanId: 'loan_001',
      payerId: 'user_amit_003',
      receiverId: 'user_rahul_001',
      amount: 5000,
      note: 'First installment - thanks for understanding!',
      status: 'CONFIRMED',
      initiatedBy: 'user_amit_003',
      confirmedBy: 'user_rahul_001',
      confirmedAt: new Date('2026-01-20'),
    },
    {
      id: 'repay_002',
      loanId: 'loan_003',
      payerId: 'user_arjun_007',
      receiverId: 'user_sneha_004',
      amount: 8000,
      note: 'Full payment - thank you so much!',
      status: 'CONFIRMED',
      initiatedBy: 'user_arjun_007',
      confirmedBy: 'user_sneha_004',
      confirmedAt: new Date('2026-01-18'),
    },
    {
      id: 'repay_003',
      loanId: 'loan_004',
      payerId: 'user_rohan_009',
      receiverId: 'user_kavya_008',
      amount: 15000,
      note: 'Wedding went well! Here is the first repayment.',
      status: 'CONFIRMED',
      initiatedBy: 'user_rohan_009',
      confirmedBy: 'user_kavya_008',
      confirmedAt: new Date('2026-01-25'),
    },
  ]

  for (const repaymentData of repayments) {
    const repayment = await prisma.repayment.upsert({
      where: { id: repaymentData.id },
      update: {},
      create: repaymentData,
    })
    console.log(`✅ Created repayment: ₹${repayment.amount}`)
  }

  console.log('\n🎉 Seeding completed successfully!')
  console.log(`
📊 Summary:
   - ${users.length} users created
   - ${loans.length} loans created
   - ${repayments.length} repayments created
  `)
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
