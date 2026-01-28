import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { walletAddress, walletBalance, blockchain, proofUrl } = await req.json();

    // Mock wallet validation (in production, verify via blockchain API)
    const isValidAddress = validateWalletAddress(walletAddress, blockchain);

    if (!isValidAddress) {
      return NextResponse.json(
        { error: 'Invalid wallet address format' },
        { status: 400 }
      );
    }

    // Calculate collateral value in USD (mock conversion)
    const collateralValueUSD = calculateCollateralValue(
      walletBalance,
      blockchain
    );

    // Update verification
    const verification = await prisma.verification.upsert({
      where: { userId },
      create: {
        userId,
        collateralType: 'CRYPTO',
        collateralValue: collateralValueUSD,
        cryptoWalletAddress: walletAddress,
        cryptoWalletBalance: walletBalance,
        cryptoWalletProof: proofUrl,
        verificationScore: 25 // +25 for collateral
      },
      update: {
        collateralType: 'CRYPTO',
        collateralValue: collateralValueUSD,
        cryptoWalletAddress: walletAddress,
        cryptoWalletBalance: walletBalance,
        cryptoWalletProof: proofUrl,
        verificationScore: { increment: 25 }
      }
    });

    await prisma.user.update({
      where: { id: userId },
      data: { hasCollateral: true }
    });

    return NextResponse.json({
      success: true,
      verification,
      collateralValueUSD,
      message: 'Crypto wallet added as collateral'
    });
  } catch (error) {
    console.error('Crypto collateral error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function validateWalletAddress(address: string, blockchain: string): boolean {
  const patterns: Record<string, RegExp> = {
    ETHEREUM: /^0x[a-fA-F0-9]{40}$/,
    BITCOIN: /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
    SOLANA: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/
  };

  return patterns[blockchain]?.test(address) || false;
}

function calculateCollateralValue(balance: number, blockchain: string): number {
  // Mock exchange rates (use real API in production)
  const rates: Record<string, number> = {
    ETHEREUM: 3500,
    BITCOIN: 50000,
    SOLANA: 120,
    USDT: 1
  };

  return balance * (rates[blockchain] || 1);
}
