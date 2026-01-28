import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { VerificationDashboard } from '@/components/verification/VerificationDashboard';

export default async function VerificationPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Borrower Verification</h1>
        <p className="text-gray-600 mt-2">
          Complete verification to unlock higher loan limits and better trust scores
        </p>
      </div>

      <VerificationDashboard />
    </div>
  );
}
