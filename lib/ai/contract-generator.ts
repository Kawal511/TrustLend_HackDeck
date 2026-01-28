// lib/ai/contract-generator.ts - NLP-powered loan contract generator using Groq

import Groq from "groq-sdk";

export interface LoanContract {
    title: string;
    parties: {
        lender: string;
        borrower: string;
    };
    terms: {
        amount: number;
        currency: string;
        duration: string;
        interestRate: number;
        paymentSchedule: string;
        lateFee: number;
        gracePeriod: number;
    };
    clauses: string[];
    legalDisclaimer: string;
    signatures: {
        lenderSigned: boolean;
        borrowerSigned: boolean;
        signedAt?: Date;
    };
    generatedText: string;
    rawInput: string;
}

interface ParsedTerms {
    amount?: number;
    duration?: string;
    interestRate?: number;
    paymentSchedule?: string;
    lateFee?: number;
    gracePeriod?: number;
    collateral?: string;
    guarantor?: string;
}

// Initialize Groq client
function getGroqClient(): Groq | null {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return null;
    return new Groq({ apiKey });
}

// Parse natural language using Groq (llama-3.3-70b-versatile)
async function parseWithAI(input: string): Promise<ParsedTerms> {
    const groq = getGroqClient();

    if (!groq) {
        // Fallback to regex parsing
        return parseWithRegex(input);
    }

    try {
        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile", // Using current Groq model
            messages: [
                {
                    role: "system",
                    content: `You are a loan terms parser. Extract loan terms from natural language and return a JSON object.
Extract these fields if mentioned:
- amount: number (the loan amount)
- duration: string (e.g., "6 months", "1 year")
- interestRate: number (as decimal, e.g., 0.05 for 5%)
- paymentSchedule: string (e.g., "monthly", "weekly", "biweekly")
- lateFee: number (late fee amount)
- gracePeriod: number (grace period in days)
- collateral: string (if any collateral is mentioned)
- guarantor: string (if a guarantor is mentioned)

Return ONLY valid JSON, no explanation.`
                },
                {
                    role: "user",
                    content: input
                }
            ],
            temperature: 0.1,
            max_tokens: 500
        });

        const content = response.choices[0]?.message?.content || "{}";
        // Extract JSON from response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return parseWithRegex(input);
    } catch (error) {
        console.error("Groq API error:", error);
        return parseWithRegex(input);
    }
}

// Fallback regex-based parsing
function parseWithRegex(input: string): ParsedTerms {
    const terms: ParsedTerms = {};

    // Amount patterns
    const amountMatch = input.match(/\$?([\d,]+(?:\.\d{2})?)/);
    if (amountMatch) {
        terms.amount = parseFloat(amountMatch[1].replace(",", ""));
    }

    // Duration patterns
    const durationMatch = input.match(/(\d+)\s*(month|year|week)s?/i);
    if (durationMatch) {
        terms.duration = `${durationMatch[1]} ${durationMatch[2]}s`;
    }

    // Interest rate patterns
    const interestMatch = input.match(/(\d+(?:\.\d+)?)\s*%/);
    if (interestMatch) {
        terms.interestRate = parseFloat(interestMatch[1]) / 100;
    }

    // Payment schedule patterns
    if (/weekly/i.test(input)) terms.paymentSchedule = "weekly";
    else if (/bi-?weekly/i.test(input)) terms.paymentSchedule = "biweekly";
    else if (/monthly/i.test(input)) terms.paymentSchedule = "monthly";

    // Late fee patterns
    const lateFeeMatch = input.match(/late\s*fee[:\s]*\$?(\d+)/i);
    if (lateFeeMatch) {
        terms.lateFee = parseFloat(lateFeeMatch[1]);
    }

    // Grace period patterns
    const graceMatch = input.match(/grace\s*period[:\s]*(\d+)\s*days?/i);
    if (graceMatch) {
        terms.gracePeriod = parseInt(graceMatch[1]);
    }

    return terms;
}

// Generate contract text
function generateContractText(contract: LoanContract): string {
    const { parties, terms } = contract;

    return `
INFORMAL LOAN AGREEMENT

This Loan Agreement ("Agreement") is entered into as of ${new Date().toLocaleDateString()}.

PARTIES:
- LENDER: ${parties.lender}
- BORROWER: ${parties.borrower}

LOAN TERMS:

1. PRINCIPAL AMOUNT
   The Lender agrees to loan the Borrower the principal sum of ${terms.currency}${terms.amount.toLocaleString()} (the "Loan").

2. DURATION
   The Loan shall be repaid in full within ${terms.duration} from the date of this Agreement.

3. INTEREST RATE
   The Loan shall bear interest at a rate of ${(terms.interestRate * 100).toFixed(1)}% per annum.

4. PAYMENT SCHEDULE
   The Borrower agrees to make ${terms.paymentSchedule} payments until the Loan is repaid in full.

5. LATE PAYMENT
   If any payment is not made within ${terms.gracePeriod} days of its due date, a late fee of ${terms.currency}${terms.lateFee} shall be assessed.

6. DEFAULT
   The Loan shall be considered in default if the Borrower fails to make any payment within 30 days of its due date.

${contract.clauses.map((clause, i) => `${7 + i}. ${clause}`).join("\n\n")}

LEGAL DISCLAIMER:
${contract.legalDisclaimer}

SIGNATURES:

_______________________          _______________________
Lender: ${parties.lender}        Borrower: ${parties.borrower}
Date: _______________            Date: _______________
`.trim();
}

// Main export: Generate contract from natural language
export async function generateContract(
    input: string,
    lenderName: string,
    borrowerName: string,
    customClauses: string[] = []
): Promise<LoanContract> {
    // Parse terms from input
    const parsedTerms = await parseWithAI(input);

    // Set defaults for missing values
    const terms = {
        amount: parsedTerms.amount || 1000,
        currency: "$",
        duration: parsedTerms.duration || "6 months",
        interestRate: parsedTerms.interestRate || 0.05,
        paymentSchedule: parsedTerms.paymentSchedule || "monthly",
        lateFee: parsedTerms.lateFee || 25,
        gracePeriod: parsedTerms.gracePeriod || 5
    };

    // Build clauses
    const clauses = [...customClauses];
    if (parsedTerms.collateral) {
        clauses.push(`COLLATERAL: The Borrower agrees to provide ${parsedTerms.collateral} as collateral for this Loan.`);
    }
    if (parsedTerms.guarantor) {
        clauses.push(`GUARANTOR: ${parsedTerms.guarantor} agrees to guarantee repayment of this Loan.`);
    }

    const contract: LoanContract = {
        title: "Informal Loan Agreement",
        parties: {
            lender: lenderName,
            borrower: borrowerName
        },
        terms,
        clauses,
        legalDisclaimer: "This agreement is made in good faith between friends/family. It is not intended to replace formal legal contracts. Both parties agree to resolve disputes amicably.",
        signatures: {
            lenderSigned: false,
            borrowerSigned: false
        },
        generatedText: "",
        rawInput: input
    };

    // Generate the full contract text
    contract.generatedText = generateContractText(contract);

    return contract;
}

// Extract highlighted terms for UI
export function extractHighlightedTerms(contract: LoanContract): Array<{
    term: string;
    value: string;
    position: { start: number; end: number };
}> {
    const highlights = [];
    const text = contract.generatedText;

    // Amount highlight
    const amountStr = `$${contract.terms.amount.toLocaleString()}`;
    const amountPos = text.indexOf(amountStr);
    if (amountPos !== -1) {
        highlights.push({
            term: "Loan Amount",
            value: amountStr,
            position: { start: amountPos, end: amountPos + amountStr.length }
        });
    }

    // Duration highlight
    const durationPos = text.indexOf(contract.terms.duration);
    if (durationPos !== -1) {
        highlights.push({
            term: "Duration",
            value: contract.terms.duration,
            position: { start: durationPos, end: durationPos + contract.terms.duration.length }
        });
    }

    // Interest rate highlight
    const rateStr = `${(contract.terms.interestRate * 100).toFixed(1)}%`;
    const ratePos = text.indexOf(rateStr);
    if (ratePos !== -1) {
        highlights.push({
            term: "Interest Rate",
            value: rateStr,
            position: { start: ratePos, end: ratePos + rateStr.length }
        });
    }

    return highlights;
}
