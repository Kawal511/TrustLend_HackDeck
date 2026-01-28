// app/api/loans/[id]/disputes/messages/route.ts - Send messages in dispute

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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
        const { content, requestAiMediation } = await req.json();

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
                            orderBy: { createdAt: 'desc' },
                            take: 10
                        }
                    }
                }
            }
        });

        if (!loan || !loan.disputeThread) {
            return NextResponse.json({ error: "Dispute not found" }, { status: 404 });
        }

        // Create user message
        const message = await prisma.disputeMessage.create({
            data: {
                threadId: loan.disputeThread.id,
                senderId: userId,
                content
            },
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
            }
        });

        let aiMessage = null;

        // Generate AI mediation if requested
        if (requestAiMediation) {
            const userName = loan.lenderId === userId 
                ? (loan.lender.firstName || "Lender")
                : (loan.borrower.firstName || "Borrower");

            // Get conversation history
            const recentMessages = loan.disputeThread.messages
                .slice(0, 5)
                .reverse()
                .map(m => m.content)
                .join("\n\n");

            const aiPrompt = `You are mediating a loan dispute. Recent conversation:

${recentMessages}

${userName} just said: "${content}"

Provide a brief, neutral mediation response that:
1. Acknowledges both perspectives
2. Suggests a compromise or next step
3. Keeps the discussion constructive

Keep it under 100 words.`;

            const completion = await groq.chat.completions.create({
                messages: [{ role: "user", content: aiPrompt }],
                model: "llama-3.3-70b-versatile",
                temperature: 0.7,
                max_tokens: 250
            });

            const aiResponse = completion.choices[0]?.message?.content || 
                "I recommend both parties take a moment to review the loan terms and discuss potential solutions.";

            aiMessage = await prisma.disputeMessage.create({
                data: {
                    threadId: loan.disputeThread.id,
                    senderId: userId,
                    content: aiResponse,
                    isAiGenerated: true,
                    aiSuggestion: "AI-mediated response"
                },
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
                }
            });
        }

        return NextResponse.json({ 
            success: true, 
            message,
            aiMessage
        });
    } catch (error) {
        console.error("Error sending message:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
