// app/api/contracts/generate/route.ts - Contract generation API endpoint

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { generateContract, extractHighlightedTerms } from "@/lib/ai/contract-generator";

export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { input, lenderName, borrowerName, customClauses } = body;

        if (!input || !lenderName || !borrowerName) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Generate contract using AI
        const contract = await generateContract(
            input,
            lenderName,
            borrowerName,
            customClauses || []
        );

        // Extract highlighted terms for UI
        const highlights = extractHighlightedTerms(contract);

        return NextResponse.json({
            contract,
            highlights
        });

    } catch (error) {
        console.error("Contract generation error:", error);
        return NextResponse.json(
            { error: "Failed to generate contract" },
            { status: 500 }
        );
    }
}
