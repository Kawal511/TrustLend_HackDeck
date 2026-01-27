"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { generateContract } from "@/lib/client/api";

interface AIContractButtonProps {
  onContractGenerated?: (contract: {
    amount: number;
    dueDate: string;
    purpose: string;
    terms: string;
  }) => void;
}

export function AIContractButton({ onContractGenerated }: AIContractButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [lenderName, setLenderName] = useState("");
  const [borrowerName, setBorrowerName] = useState("");

  const handleGenerate = async () => {
    if (!prompt.trim() || !lenderName.trim() || !borrowerName.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const result = await generateContract({
        lenderName,
        borrowerName,
        prompt,
      });

      toast.success("Contract generated!", {
        description: "The AI has generated a loan contract based on your requirements.",
      });

      if (onContractGenerated) {
        // Parse the generated contract to extract loan details
        const amountMatch = result.contract.match(/\$?([\d,]+\.?\d*)/);
        const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 0;
        
        // Extract due date if mentioned
        const dateMatch = result.contract.match(/due date.*?(\d{4}-\d{2}-\d{2})/i);
        const dueDate = dateMatch ? dateMatch[1] : '';

        // Extract purpose
        const purposeMatch = result.contract.match(/purpose:?\s*(.+?)(?:\n|$)/i);
        const purpose = purposeMatch ? purposeMatch[1].trim() : prompt.substring(0, 100);

        onContractGenerated({
          amount,
          dueDate,
          purpose,
          terms: result.contract,
        });
      }

      setOpen(false);
      setPrompt("");
      setLenderName("");
      setBorrowerName("");
    } catch (error: any) {
      toast.error("Failed to generate contract", {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" type="button" className="gap-2">
          <Sparkles className="h-4 w-4" />
          Generate with AI
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>AI Contract Generator</DialogTitle>
          <DialogDescription>
            Describe the loan agreement and let AI generate the contract terms
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lenderName">Lender Name</Label>
              <Input
                id="lenderName"
                placeholder="John Doe"
                value={lenderName}
                onChange={(e) => setLenderName(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="borrowerName">Borrower Name</Label>
              <Input
                id="borrowerName"
                placeholder="Jane Smith"
                value={borrowerName}
                onChange={(e) => setBorrowerName(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="prompt">Loan Details</Label>
            <Textarea
              id="prompt"
              placeholder="Example: $5000 loan for home renovation, to be repaid in 6 months with 5% interest. Monthly installments of $850."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={loading}
              rows={6}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleGenerate}
              disabled={loading}
              className="gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Contract
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
