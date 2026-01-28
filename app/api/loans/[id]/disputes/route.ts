// app/api/loans/[id]/disputes/route.ts - Create and list disputes

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        // Verify user is part of this loan
        const loan = await prisma.loan.findFirst({
            where: {
                id,
                OR: [{ lenderId: userId }, { borrowerId: userId }]
            },
            include: {
                lender: true,
                borrower: true,
                disputeThread: {
                    include: {
                        messages: {
                            include: {
                                sender: {
                                    select: {
                                        id: true,
                                        email: true,
                                        firstName: true,
                                        lastName: true,
                                        imageUrl: true
                                    }
                                }
                            },
                            orderBy: { createdAt: 'asc' }
                        }
                    }
                }
            }
        });

        if (!loan) {
            return NextResponse.json({ error: "Loan not found" }, { status: 404 });
        }

        return NextResponse.json({ dispute: loan.disputeThread });
    } catch (error) {
        console.error("Error fetching dispute:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const { type, description } = await req.json();

        // Verify user is part of this loan
        const loan = await prisma.loan.findFirst({
            where: {
                id,
                OR: [{ lenderId: userId }, { borrowerId: userId }]
            },
            include: {
                lender: true,
                borrower: true
            }
        });

        if (!loan) {
            return NextResponse.json({ error: "Loan not found" }, { status: 404 });
        }

        // Check if dispute already exists
        let dispute = await prisma.disputeThread.findUnique({
            where: { loanId: id }
        });

        if (dispute) {
            return NextResponse.json({ error: "Dispute already exists for this loan" }, { status: 400 });
        }

        // Create dispute thread
        dispute = await prisma.disputeThread.create({
            data: {
                loanId: id,
                status: "OPEN"
            }
        });

        // Create initial message
        await prisma.disputeMessage.create({
            data: {
                threadId: dispute.id,
                senderId: userId,
                content: `**Dispute Type:** ${type}\n\n**Description:** ${description}`
            }
        });

        // Generate AI mediation response
        const userName = loan.lenderId === userId 
            ? (loan.lender.firstName || "Lender")
            : (loan.borrower.firstName || "Borrower");
        
        const otherPartyName = loan.lenderId === userId 
            ? (loan.borrower.firstName || "Borrower")
            : (loan.lender.firstName || "Lender");

        const aiPrompt = `You are a neutral mediator helping resolve a dispute between two parties in a peer-to-peer lending platform.

Loan Details:
- Amount: $${loan.amount}
- Due Date: ${new Date(loan.dueDate).toLocaleDateString()}
- Current Balance: $${loan.balance}

${userName} has raised a dispute:
Type: ${type}
Description: ${description}

Please provide:
1. An acknowledgment of the dispute
2. Suggestions for resolution
3. Next steps both parties should take

Keep your response professional, empathetic, and solution-focused. Aim for 150-200 words.`;

        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: aiPrompt }],
            model: "llama-3.1-70b-versatile",
            temperature: 0.7,
            max_tokens: 500
        });

        const aiResponse = completion.choices[0]?.message?.content || 
            "I understand there's a dispute. Both parties should communicate openly to find a fair resolution. I'm here to help mediate if needed.";

        // Create AI mediation message
        await prisma.disputeMessage.create({
            data: {
                threadId: dispute.id,
                senderId: userId, // AI uses current user as sender for permissions
                content: aiResponse,
                isAiGenerated: true,
                aiSuggestion: "AI-mediated response"
            }
        });

        // Update loan status to DISPUTED
        await prisma.loan.update({
            where: { id },
            data: { status: "DISPUTED" }
        });

        return NextResponse.json({ 
            success: true, 
            disputeId: dispute.id,
            message: "Dispute created successfully" 
        });
    } catch (error) {
        console.error("Error creating dispute:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
