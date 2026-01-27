// app/(dashboard)/contracts/new/page.tsx - Contract builder page

import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ContractBuilder } from "@/components/loans/ContractBuilder";

export default async function NewContractPage() {
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");

    const user = await currentUser();
    const userName = user?.firstName && user?.lastName
        ? `${user.firstName} ${user.lastName}`
        : user?.emailAddresses[0]?.emailAddress || "User";

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Create Loan Contract</h1>
                <p className="text-gray-500 mt-1">
                    Describe your loan terms and let AI generate a formal contract
                </p>
            </div>

            <ContractBuilder
                lenderName={userName}
                borrowerName="[Borrower Name]"
            />
        </div>
    );
}
