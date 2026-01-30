'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IdentityVerification } from './IdentityVerification';
import { IncomeVerification } from './IncomeVerification';
import { CollateralVerification } from './CollateralVerification';
import { Shield, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface VerificationStatus {
  verificationScore: number;
  isFullyVerified: boolean;
  idVerified: boolean;
  incomeVerified: boolean;
  hasCollateral: boolean;
  incomeBracket?: string;
  collateralValue?: number;
}

export function VerificationDashboard() {
  const [status, setStatus] = useState<VerificationStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatus();
  }, []);

  async function fetchStatus() {
    try {
      const res = await fetch('/api/verification/identity');
      const data = await res.json();
      setStatus({
        verificationScore: data.verificationScore || 0,
        isFullyVerified: data.isFullyVerified || false,
        idVerified: data.idVerified || false,
        incomeVerified: data.incomeVerified || false,
        hasCollateral: data.collateralType ? true : false,
        incomeBracket: data.incomeBracket,
        collateralValue: data.collateralValue
      });
    } catch (error) {
      console.error('Fetch status error:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div>Loading verification status...</div>;
  }

  const score = status?.verificationScore || 0;

  return (
    <div className="space-y-6">
      {/* Overall Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Borrower Verification Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Verification Score</span>
                <span className="text-2xl font-bold">{score}/100</span>
              </div>
              <Progress value={score} className="h-3" />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <VerificationItem
                label="Identity"
                verified={status?.idVerified || false}
                points="+50 points"
              />
              <VerificationItem
                label="Income"
                verified={status?.incomeVerified || false}
                points="+25 points"
                detail={status?.incomeBracket}
              />
              <VerificationItem
                label="Collateral"
                verified={status?.hasCollateral || false}
                points="+25 points"
                detail={status?.collateralValue ? `₹${status.collateralValue.toLocaleString()}` : undefined}
              />
            </div>

            {status?.isFullyVerified ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-semibold">Fully Verified Borrower</span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  You have access to higher loan amounts and better trust scores
                </p>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-yellow-800">
                  <Clock className="h-5 w-5" />
                  <span className="font-semibold">Verification Incomplete</span>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  Complete all verification steps to unlock maximum borrowing limits
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Verification Steps */}
      <Tabs defaultValue="identity" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="identity">
            {status?.idVerified ? '✓ ' : ''}Identity
          </TabsTrigger>
          <TabsTrigger value="income">
            {status?.incomeVerified ? '✓ ' : ''}Income
          </TabsTrigger>
          <TabsTrigger value="collateral">
            {status?.hasCollateral ? '✓ ' : ''}Collateral
          </TabsTrigger>
        </TabsList>

        <TabsContent value="identity">
          <IdentityVerification onSuccess={fetchStatus} />
        </TabsContent>

        <TabsContent value="income">
          <IncomeVerification onSuccess={fetchStatus} />
        </TabsContent>

        <TabsContent value="collateral">
          <CollateralVerification onSuccess={fetchStatus} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function VerificationItem({
  label,
  verified,
  points,
  detail
}: {
  label: string;
  verified: boolean;
  points: string;
  detail?: string;
}) {
  return (
    <div className="border rounded-lg p-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium">{label}</span>
        {verified ? (
          <CheckCircle className="h-4 w-4 text-green-600" />
        ) : (
          <AlertCircle className="h-4 w-4 text-gray-400" />
        )}
      </div>
      <Badge variant={verified ? 'default' : 'outline'}>
        {verified ? 'Verified' : 'Pending'}
      </Badge>
      <div className="text-xs text-gray-500 mt-1">{points}</div>
      {detail && <div className="text-xs font-medium mt-1">{detail}</div>}
    </div>
  );
}
