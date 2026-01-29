import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { saveUploadedFile, readUploadedFile } from '@/lib/file-storage';
import { extractIncomeDataFromDocument } from '@/lib/gemini-ocr';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const documentType = formData.get('type') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF and images are allowed' },
        { status: 400 }
      );
    }

    // Save file locally
    const { fileUrl, filePath } = await saveUploadedFile(file, 'income');

    // Read file for OCR
    const fileBuffer = await readUploadedFile(fileUrl);

    // Extract data using Document Verification
    const ocrResult = await extractIncomeDataFromDocument(
      fileBuffer,
      file.type,
      documentType
    );

    // Save document record
    const document = await prisma.document.create({
      data: {
        userId,
        category: 'INCOME_PROOF',
        type: documentType,
        filename: file.name,
        fileUrl,
        fileType: file.type.includes('pdf') ? 'pdf' : 'image',
        fileSize: file.size,
        extractedData: JSON.stringify(ocrResult.extractedData),
        ocrProcessed: true
      }
    });

    // Update verification record
    await updateIncomeVerification(userId, ocrResult.extractedData, documentType);

    return NextResponse.json({
      success: true,
      document,
      extractedData: ocrResult.extractedData,
      confidence: ocrResult.confidence,
      message: 'Document uploaded and processed successfully'
    });
  } catch (error) {
    console.error('Upload income document error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function updateIncomeVerification(
  userId: string,
  extractedData: any,
  documentType: string
) {
  const verification = await prisma.verification.findUnique({
    where: { userId }
  });

  let updates: any = {
    verificationScore: { increment: 25 }
  };

  // Determine income bracket
  if (extractedData.annualIncome && typeof extractedData.annualIncome === 'number') {
    const income = extractedData.annualIncome;
    let bracket = '0-5L';
    let incomeType = 'OTHER';

    if (income > 5000000) bracket = '50L+';
    else if (income > 2000000) bracket = '20-50L';
    else if (income > 1000000) bracket = '10-20L';
    else if (income > 500000) bracket = '5-10L';

    if (documentType === 'ITR') {
      incomeType = extractedData.incomeFromSalary ? 'SALARY' : 'BUSINESS';
    } else if (documentType === 'SALARY_SLIP') {
      incomeType = 'SALARY';
    }

    updates.incomeBracket = bracket;
    updates.annualIncome = income;
    updates.incomeType = incomeType;
  }

  // Update document arrays
  if (documentType === 'ITR') {
    const existing = verification?.itrDocuments ? JSON.parse(verification.itrDocuments) : [];
    updates.itrDocuments = JSON.stringify([...existing, extractedData]);
  } else if (documentType === 'SALARY_SLIP') {
    const existing = verification?.salarySlips ? JSON.parse(verification.salarySlips) : [];
    updates.salarySlips = JSON.stringify([...existing, extractedData]);
  } else if (documentType === 'BANK_STATEMENT') {
    const existing = verification?.bankStatements ? JSON.parse(verification.bankStatements) : [];
    updates.bankStatements = JSON.stringify([...existing, extractedData]);
  }

  // Mark as verified if sufficient documents
  const docCount = await prisma.document.count({
    where: {
      userId,
      category: 'INCOME_PROOF',
      ocrProcessed: true
    }
  });

  if (docCount >= 2) {
    updates.incomeVerified = true;
    updates.incomeVerifiedAt = new Date();

    await prisma.user.update({
      where: { id: userId },
      data: { isIncomeVerified: true }
    });
  }

  await prisma.verification.upsert({
    where: { userId },
    create: {
      userId,
      ...updates,
      verificationScore: 25
    },
    update: updates
  });
}
