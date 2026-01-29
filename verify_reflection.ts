
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyReflection() {
    const loanId = 'loan_atharva_001';

    // 1. Verify existence
    const loan = await prisma.loan.findUnique({
        where: { id: loanId },
        include: { lender: true, borrower: true }
    });

    if (!loan) {
        console.error("❌ Loan not found!");
        process.exit(1);
    }
    console.log(`✅ Loan found: ${loan.lender.firstName} lent to ${loan.borrower.firstName}`);

    // Get the actual ID for Atharva (in case it differs from seed due to existing Clerk record)
    const atharvaUser = await prisma.user.findUnique({ where: { email: 'atharvavdeo75@gmail.com' } });
    if (!atharvaUser) {
        console.error("❌ Atharva user not found!");
        process.exit(1);
    }
    const atharvaId = atharvaUser.id;
    console.log(`ℹ️ Verifying for Atharva ID: ${atharvaId}`);

    // 2. Simulate User A (Atharva) Dashboard
    const atharvaLoans = await prisma.loan.findMany({
        where: { lenderId: atharvaId }
    });
    const seesAsLender = atharvaLoans.some(l => l.id === loanId);
    console.log(seesAsLender ? "✅ Atharva sees the loan (Lender View)" : "❌ Atharva CANNOT see the loan");

    // 3. Simulate User B (Rahul) Dashboard
    const rahulLoans = await prisma.loan.findMany({
        where: { borrowerId: 'user_rahul_001' }
    });
    const seesAsBorrower = rahulLoans.some(l => l.id === loanId);
    console.log(seesAsBorrower ? "✅ Rahul sees the loan (Borrower View)" : "❌ Rahul CANNOT see the loan");

    if (seesAsLender && seesAsBorrower) {
        console.log("🎉 Cross-user reflection VERIFIED!");
    } else {
        console.error("❌ Cross-user reflection FAILED");
    }
}

verifyReflection()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
