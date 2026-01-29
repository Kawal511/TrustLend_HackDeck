// app/(dashboard)/layout.tsx - Protected dashboard layout

import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { TopNav } from "@/components/layout/TopNav";
import { BottomNav } from "@/components/layout/BottomNav";
import { prisma } from "@/lib/prisma";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await currentUser();

    if (!user) {
        redirect("/sign-in");
    }

    // Sync user to database if not exists
    const dbUser = await prisma.user.findUnique({
        where: { id: user.id }
    });

    if (!dbUser) {
        const primaryEmail = user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress || user.emailAddresses[0].emailAddress;

        await prisma.user.create({
            data: {
                id: user.id,
                email: primaryEmail,
                firstName: user.firstName,
                lastName: user.lastName,
                imageUrl: user.imageUrl,
                username: user.username
            }
        });
    }

    return (
        <div className="min-h-screen bg-background text-foreground pb-24">
            <TopNav />
            <main className="px-8 py-6">
                {children}
            </main>
            <BottomNav />
        </div>
    );
}
