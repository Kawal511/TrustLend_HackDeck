// app/api/users/search/route.ts - Search users by email

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const url = new URL(req.url);
        const email = url.searchParams.get("email");

        if (!email) {
            return NextResponse.json({ error: "Email query required" }, { status: 400 });
        }

        // Check if searching for self
        const selfUser = await prisma.user.findFirst({
            where: {
                email: { equals: email }, // exact match
                id: userId
            }
        });

        if (selfUser) {
            return NextResponse.json({ error: "You cannot lend to yourself" }, { status: 400 });
        }

        const user = await prisma.user.findFirst({
            where: {
                email: {
                    contains: email,
                },
                isSearchable: true,
                id: { not: userId } // Exclude current user
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                username: true,
                imageUrl: true,
                trustScore: true,
                _count: {
                    select: {
                        loansTaken: {
                            where: { status: "COMPLETED" }
                        }
                    }
                }
            }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({
            ...user,
            completedLoans: user._count.loansTaken
        });

    } catch (error) {
        console.error("User search error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
