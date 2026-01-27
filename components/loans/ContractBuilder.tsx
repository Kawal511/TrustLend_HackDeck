// components/loans/ContractBuilder.tsx - Conversational contract builder interface

"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { formatCurrency } from "@/lib/utils";
import { Loader2, FileText, Sparkles, Download, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface ExtractedTerm {
    term: string;
    value: string;
}

interface ContractData {
    title: string;
    generatedText: string;
    terms: {
        amount: number;
        duration: string;
        interestRate: number;
        paymentSchedule: string;
        lateFee: number;
        gracePeriod: number;
    };
}

interface ContractBuilderProps {
    lenderName: string;
    borrowerName: string;
    onContractGenerated?: (contract: ContractData) => void;
}

export function ContractBuilder({
    lenderName,
    borrowerName,
    onContractGenerated
}: ContractBuilderProps) {
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [contract, setContract] = useState<ContractData | null>(null);
    const [extractedTerms, setExtractedTerms] = useState<ExtractedTerm[]>([]);
    const [lenderSigned, setLenderSigned] = useState(false);
    const [borrowerSigned, setBorrowerSigned] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editedText, setEditedText] = useState("");

    const examplePrompts = [
        "I want to lend $500 for 3 months with 5% interest, paid monthly",
        "Loan of $2000 over 1 year at 8% interest with weekly payments and $25 late fee",
        "A 6 month loan for $1500 with biweekly payments, 10 day grace period"
    ];

    async function handleGenerate() {
        if (!input.trim()) {
            toast.error("Please describe the loan terms");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch("/api/contracts/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    input,
                    lenderName,
                    borrowerName
                })
            });

            const data = await response.json();

            if (response.ok) {
                setContract(data.contract);
                setExtractedTerms(data.highlights || []);
                setEditedText(data.contract.generatedText);
                onContractGenerated?.(data.contract);
                toast.success("Contract generated successfully!");
            } else {
                toast.error(data.error || "Failed to generate contract");
            }
        } catch {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    function handleExport() {
        if (!contract) return;

        const finalText = editMode ? editedText : contract.generatedText;
        const signatureBlock = `

---
DIGITAL SIGNATURES:

${lenderSigned ? `✓ ${lenderName} has signed this agreement on ${new Date().toLocaleString()}` : `○ ${lenderName} has NOT signed`}
${borrowerSigned ? `✓ ${borrowerName} has signed this agreement on ${new Date().toLocaleString()}` : `○ ${borrowerName} has NOT signed`}
`;

        const blob = new Blob([finalText + signatureBlock], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `loan-contract-${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Contract exported!");
    }

    return (
        <div className="space-y-6">
            {/* Input Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-purple-600" />
                        AI Contract Generator
                    </CardTitle>
                    <CardDescription>
                        Describe your loan terms in natural language and let AI create a formal contract
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label>Describe the loan terms</Label>
                        <Textarea
                            className="mt-1 min-h-[100px]"
                            placeholder="Example: I want to lend $1000 for 6 months at 5% interest with monthly payments..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                    </div>

                    {/* Example prompts */}
                    <div className="flex flex-wrap gap-2">
                        <span className="text-sm text-gray-500">Try:</span>
                        {examplePrompts.map((prompt, i) => (
                            <Badge
                                key={i}
                                variant="outline"
                                className="cursor-pointer hover:bg-purple-50"
                                onClick={() => setInput(prompt)}
                            >
                                {prompt.slice(0, 40)}...
                            </Badge>
                        ))}
                    </div>

                    {/* Parties */}
                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <div>
                            <Label>Lender</Label>
                            <Input value={lenderName} disabled className="mt-1" />
                        </div>
                        <div>
                            <Label>Borrower</Label>
                            <Input value={borrowerName} disabled className="mt-1" />
                        </div>
                    </div>

                    <Button
                        onClick={handleGenerate}
                        disabled={loading || !input.trim()}
                        className="w-full"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating Contract...
                            </>
                        ) : (
                            <>
                                <FileText className="mr-2 h-4 w-4" />
                                Generate Contract
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>

            {/* Extracted Terms */}
            {extractedTerms.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Extracted Terms</CardTitle>
                        <CardDescription>Terms automatically detected from your description</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {contract && (
                                <>
                                    <div className="bg-purple-50 rounded-lg p-3">
                                        <div className="text-sm text-gray-500">Amount</div>
                                        <div className="text-lg font-bold">{formatCurrency(contract.terms.amount)}</div>
                                    </div>
                                    <div className="bg-blue-50 rounded-lg p-3">
                                        <div className="text-sm text-gray-500">Duration</div>
                                        <div className="text-lg font-bold">{contract.terms.duration}</div>
                                    </div>
                                    <div className="bg-green-50 rounded-lg p-3">
                                        <div className="text-sm text-gray-500">Interest Rate</div>
                                        <div className="text-lg font-bold">{(contract.terms.interestRate * 100).toFixed(1)}%</div>
                                    </div>
                                    <div className="bg-orange-50 rounded-lg p-3">
                                        <div className="text-sm text-gray-500">Payments</div>
                                        <div className="text-lg font-bold capitalize">{contract.terms.paymentSchedule}</div>
                                    </div>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Contract Preview */}
            {contract && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Contract Preview</CardTitle>
                                <CardDescription>Review and customize the generated contract</CardDescription>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditMode(!editMode)}
                            >
                                {editMode ? "View Mode" : "Edit Mode"}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {editMode ? (
                            <Textarea
                                className="min-h-[400px] font-mono text-sm"
                                value={editedText}
                                onChange={(e) => setEditedText(e.target.value)}
                            />
                        ) : (
                            <div className="bg-gray-50 rounded-lg p-6 max-h-[400px] overflow-y-auto">
                                <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800">
                                    {contract.generatedText}
                                </pre>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Signatures */}
            {contract && (
                <Card>
                    <CardHeader>
                        <CardTitle>Digital Signatures</CardTitle>
                        <CardDescription>Both parties must agree to the terms</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                            <Checkbox
                                id="lender-sign"
                                checked={lenderSigned}
                                onCheckedChange={(checked) => setLenderSigned(!!checked)}
                            />
                            <div className="flex-1">
                                <Label htmlFor="lender-sign" className="font-medium">
                                    {lenderName} (Lender)
                                </Label>
                                <p className="text-sm text-gray-500">
                                    I agree to lend under these terms
                                </p>
                            </div>
                            {lenderSigned && <Check className="h-5 w-5 text-green-600" />}
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                            <Checkbox
                                id="borrower-sign"
                                checked={borrowerSigned}
                                onCheckedChange={(checked) => setBorrowerSigned(!!checked)}
                            />
                            <div className="flex-1">
                                <Label htmlFor="borrower-sign" className="font-medium">
                                    {borrowerName} (Borrower)
                                </Label>
                                <p className="text-sm text-gray-500">
                                    I agree to repay under these terms
                                </p>
                            </div>
                            {borrowerSigned && <Check className="h-5 w-5 text-green-600" />}
                        </div>

                        {(!lenderSigned || !borrowerSigned) && (
                            <div className="flex items-center gap-2 text-amber-600 text-sm">
                                <AlertCircle className="h-4 w-4" />
                                Both parties must sign before export
                            </div>
                        )}

                        <Separator />

                        <Button
                            onClick={handleExport}
                            disabled={!lenderSigned || !borrowerSigned}
                            className="w-full"
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Export Contract
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
