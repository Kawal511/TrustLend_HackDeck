// scripts/cleanup-duplicate-registrations.ts
// Run with: npx tsx scripts/cleanup-duplicate-registrations.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupDuplicateRegistrations() {
    console.log('🔍 Finding duplicate registration bonuses...\n');

    // Find all users with registration events
    const usersWithRegistrations = await prisma.trustScoreHistory.groupBy({
        by: ['userId'],
        where: {
            event: 'REGISTRATION'
        },
        _count: {
            id: true
        },
        having: {
            id: {
                _count: {
                    gt: 1
                }
            }
        }
    });

    console.log(`Found ${usersWithRegistrations.length} users with duplicate registrations\n`);

    for (const userGroup of usersWithRegistrations) {
        const userId = userGroup.userId;

        // Get all registration entries for this user
        const registrations = await prisma.trustScoreHistory.findMany({
            where: {
                userId,
                event: 'REGISTRATION'
            },
            orderBy: {
                createdAt: 'asc'
            }
        });

        console.log(`User ${userId}: ${registrations.length} registration entries`);

        // Keep the first one, delete the rest
        const [first, ...duplicates] = registrations;
        console.log(`  Keeping: ${first.id} (created: ${first.createdAt})`);

        for (const dup of duplicates) {
            await prisma.trustScoreHistory.delete({
                where: { id: dup.id }
            });
            console.log(`  Deleted: ${dup.id} (created: ${dup.createdAt})`);
        }
    }

    console.log('\n✅ Cleanup complete!');
}

cleanupDuplicateRegistrations()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
