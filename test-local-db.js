
const { PrismaClient } = require('@prisma/client');

async function main() {
    console.log('Connecting to local SQLite database...');
    const prisma = new PrismaClient();

    try {
        const userCount = await prisma.user.count();
        console.log(`Successfully connected! User count: ${userCount}`);

        // Check if my specific test user exists (to confirm it's the old DB)
        const specificUser = await prisma.user.findFirst({
            where: { email: 'atharvavdeo75@gmail.com' }
        });

        if (specificUser) {
            console.log('Confirmed: Found original user data.');
        } else {
            console.log('Warning: Original user data not found (could be a different local db?)');
        }
    } catch (e) {
        console.error('Connection failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
