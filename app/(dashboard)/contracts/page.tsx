import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ContractBuilder } from "@/components/loans/ContractBuilder";

export default async function ContractsPage() {
    const user = await currentUser();
    if (!user) redirect("/sign-in");

    const userName = `${user.firstName} ${user.lastName}`;

    return (
        <div className="space-y-8">
            <div className="border-b-2 border-dashed border-gray-200 pb-6">
                <h1 className="text-4xl font-black tracking-tight text-black mb-2">Smart Contracts</h1>
                <p className="text-gray-500 font-medium">Draft and manage legally binding loan agreements powered by AI.</p>
            </div>

            <div className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-2xl bg-white overflow-hidden p-6">
                <ContractBuilder
                    lenderName={userName}
                    borrowerName="[Borrower Name]"
                />
            </div>
        </div>
    );
}
