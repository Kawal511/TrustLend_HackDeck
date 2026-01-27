// app/api/notifications/route.ts - Notifications API endpoint

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Generate notifications from loan activity
        const notifications = [];

        // Get recent loans where user is lender or borrower
        const recentLoans = await prisma.loan.findMany({
            where: {
                OR: [
                    { lenderId: userId },
                    { borrowerId: userId }
                ],
                createdAt: {
                    gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
                }
            },
            include: {
                lender: { select: { firstName: true, lastName: true, email: true } },
                borrower: { select: { firstName: true, lastName: true, email: true } }
            },
            orderBy: { createdAt: "desc" },
            take: 10
        });

        // Get recent repayments
        const recentRepayments = await prisma.repayment.findMany({
            where: {
                OR: [
                    { payerId: userId },
                    { receiverId: userId }
                ],
                createdAt: {
                    gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                }
            },
            include: {
                loan: true,
                payer: { select: { firstName: true, lastName: true, email: true } },
                receiver: { select: { firstName: true, lastName: true, email: true } }
            },
            orderBy: { createdAt: "desc" },
            take: 10
        });

        // Create notifications for loans
        for (const loan of recentLoans) {
            const isLender = loan.lenderId === userId;
            const otherParty = isLender ? loan.borrower : loan.lender;
            const otherName = otherParty.firstName && otherParty.lastName
                ? `${otherParty.firstName} ${otherParty.lastName}`
                : otherParty.email;

            if (isLender) {
                notifications.push({
                    id: `loan_${loan.id}`,
                    type: "loan_request" as const,
                    title: "New Loan Created",
                    message: `You lent $${loan.amount} to ${otherName}`,
                    read: false,
                    createdAt: loan.createdAt,
                    link: `/loans/${loan.id}`
                });
            } else {
                notifications.push({
                    id: `loan_${loan.id}`,
                    type: "loan_request" as const,
                    title: "Loan Received",
                    message: `${otherName} lent you $${loan.amount}`,
                    read: false,
                    createdAt: loan.createdAt,
                    link: `/loans/${loan.id}`
                });
            }
        }

        // Create notifications for repayments
        for (const repayment of recentRepayments) {
            const isPayer = repayment.payerId === userId;
            const otherParty = isPayer ? repayment.receiver : repayment.payer;
            const otherName = otherParty.firstName && otherParty.lastName
                ? `${otherParty.firstName} ${otherParty.lastName}`
                : otherParty.email;

            if (repayment.status === "PENDING_CONFIRMATION") {
                notifications.push({
                    id: `repayment_${repayment.id}`,
                    type: "repayment" as const,
                    title: isPayer ? "Payment Sent" : "Payment Received",
                    message: isPayer
                        ? `You paid $${repayment.amount} to ${otherName} - awaiting confirmation`
                        : `${otherName} paid $${repayment.amount} - please confirm`,
                    read: false,
                    createdAt: repayment.createdAt,
                    link: `/loans/${repayment.loanId}`
                });
            } else if (repayment.status === "CONFIRMED") {
                notifications.push({
                    id: `repayment_${repayment.id}`,
                    type: "confirmation" as const,
                    title: "Payment Confirmed",
                    message: `$${repayment.amount} payment was confirmed`,
                    read: true, // Confirmed payments are considered read
                    createdAt: repayment.confirmedAt || repayment.createdAt,
                    link: `/loans/${repayment.loanId}`
                });
            }
        }

        // Check for overdue loans
        const overdueLoans = await prisma.loan.findMany({
            where: {
                borrowerId: userId,
                status: "ACTIVE",
                dueDate: { lt: new Date() }
            },
            take: 5
        });

        for (const loan of overdueLoans) {
            notifications.push({
                id: `overdue_${loan.id}`,
                type: "overdue" as const,
                title: "Payment Overdue",
                message: `Your loan of $${loan.amount} is past due!`,
                read: false,
                createdAt: loan.dueDate,
                link: `/loans/${loan.id}`
            });
        }

        // Sort by date
        notifications.sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        return NextResponse.json({ notifications: notifications.slice(0, 20) });

    } catch (error) {
        console.error("Notifications error:", error);
        return NextResponse.json(
            { error: "Failed to fetch notifications" },
            { status: 500 }
        );
    }
}

export async function PATCH(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // For now, we don't persist read status (would need a notifications table)
        // This just returns success
        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Notifications update error:", error);
        return NextResponse.json(
            { error: "Failed to update notifications" },
            { status: 500 }
        );
    }
}
