"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface RaiseDisputeButtonProps {
  loanId: string;
  hasExistingDispute: boolean;
}

const DISPUTE_TYPES = [
  "Non-payment",
  "Partial payment dispute",
  "Payment timing disagreement",
  "Interest rate dispute",
  "Loan amount discrepancy",
  "Terms violation",
  "Unauthorized changes",
  "Communication issues",
  "Documentation missing",
  "Repayment schedule conflict",
  "Currency exchange dispute",
  "Collateral concerns",
  "Third-party involvement",
  "Fraudulent activity suspected",
  "Breach of agreement",
  "Unfair terms",
  "Verbal agreement conflict",
  "Emergency extension request",
  "Inability to pay",
  "Other"
];

export function RaiseDisputeButton({ loanId, hasExistingDispute }: RaiseDisputeButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [disputeType, setDisputeType] = useState("");
  const [description, setDescription] = useState("");
  const router = useRouter();

  const handleSubmit = async () => {
    if (!disputeType) {
      toast.error("Please select a dispute type");
      return;
    }

    if (!description.trim()) {
      toast.error("Please provide a description");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/loans/${loanId}/disputes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: disputeType,
          description: description.trim()
        })
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Dispute raised successfully", {
          description: "An AI mediator will help resolve this issue."
        });
        setOpen(false);
        setDisputeType("");
        setDescription("");
        router.refresh();
      } else {
        toast.error(data.error || "Failed to raise dispute");
      }
    } catch (error) {
      toast.error("Failed to raise dispute");
    } finally {
      setLoading(false);
    }
  };

  if (hasExistingDispute) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 border-gray-300 text-gray-900 hover:bg-gray-50">
          <AlertTriangle className="h-4 w-4" />
          Raise Dispute
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-900 font-semibold">
            <AlertTriangle className="h-5 w-5 text-gray-900" />
            Raise a Dispute
          </DialogTitle>
          <DialogDescription>
            Describe the issue with this loan. An AI mediator will help facilitate resolution between both parties.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="disputeType">Dispute Type</Label>
            <Select value={disputeType} onValueChange={setDisputeType} disabled={loading}>
              <SelectTrigger id="disputeType">
                <SelectValue placeholder="Select dispute type" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {DISPUTE_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Provide details about the dispute..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              rows={6}
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground">
              {description.length}/1000 characters
            </p>
          </div>
          <div className="bg-gray-50 border border-gray-300 rounded-lg p-3">
            <p className="text-sm text-gray-900">
              <strong>AI Mediation:</strong> Once submitted, our AI mediator will analyze the situation and provide neutral suggestions to help both parties reach a fair resolution.
            </p>
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
              onClick={handleSubmit}
              disabled={loading}
              className="gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4" />
                  Submit Dispute
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
