// app/(dashboard)/loans/new/page.tsx - Create new loan page

import { LoanForm } from "@/components/loans/LoanForm";

export default function NewLoanPage() {
    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Create New Loan</h1>
                <p className="text-gray-500 mt-1">
                    Lend money to someone in your network
                </p>
            </div>

            {/* Form */}
            <LoanForm />
        </div>
    );
}
