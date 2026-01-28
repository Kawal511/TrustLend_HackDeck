// components/borrow/BorrowRequestFormWrapper.tsx - Client-side wrapper to avoid hydration issues

'use client';

import dynamic from 'next/dynamic';

const BorrowRequestForm = dynamic(
    () => import('./BorrowRequestForm').then(mod => mod.BorrowRequestForm),
    {
        ssr: false,
        loading: () => (
            <div className="animate-pulse space-y-4">
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
            </div>
        )
    }
);

interface Lender {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    trustScore: number;
    _count: { loansGiven: number };
}

interface BorrowRequestFormWrapperProps {
    userId: string;
    lenders: Lender[];
}

export function BorrowRequestFormWrapper({ userId, lenders }: BorrowRequestFormWrapperProps) {
    return <BorrowRequestForm userId={userId} lenders={lenders} />;
}
