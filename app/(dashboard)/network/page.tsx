// app/(dashboard)/network/page.tsx - Trust network visualization page

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TrustNetworkViz } from "@/components/trust/TrustNetworkViz";
import { buildNetworkFromLoans } from "@/lib/graph/trust-network";

async function getNetworkData() {
    const [users, loans] = await Promise.all([
        prisma.user.findMany({
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                trustScore: true
            }
        }),
        prisma.loan.findMany({
            select: {
                lenderId: true,
                borrowerId: true,
                amount: true,
                status: true
            }
        })
    ]);

    return buildNetworkFromLoans(users, loans);
}

export default async function NetworkPage() {
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");

    const network = await getNetworkData();

    return (
        <div className="space-y-8">
            <div className="border-b-2 border-dashed border-gray-200 pb-6">
                <h1 className="text-4xl font-black tracking-tight text-black mb-2">Trust Network</h1>
                <p className="text-gray-500 font-medium">
                    Visualize lending relationships and discover trusted connections
                </p>
            </div>

            <TrustNetworkViz
                network={network}
                currentUserId={userId}
            />
        </div>
    );
}
