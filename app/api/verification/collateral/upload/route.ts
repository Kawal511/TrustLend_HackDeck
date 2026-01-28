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
    const collateralType = formData.get('collateralType') as string;
    const collateralValue = parseFloat(formData.get('collateralValue') as string);

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Save file locally
    const { fileUrl } = await saveUploadedFile(file, 'collateral');

    // Read file for OCR (optional - extract property/vehicle details)
    const fileBuffer = await readUploadedFile(fileUrl);
    
    let extractedData: any = {};
    if (collateralType === 'PROPERTY') {
      const ocrResult = await extractIncomeDataFromDocument(
        fileBuffer,
        file.type,
        'PROPERTY_DEED'
      );
      extractedData = ocrResult.extractedData;
    } else if (collateralType === 'VEHICLE') {
      const ocrResult = await extractIncomeDataFromDocument(
        fileBuffer,
        file.type,
        'VEHICLE_RC'
      );
      extractedData = ocrResult.extractedData;
    }

    // Save document
    const document = await prisma.document.create({
      data: {
        userId,
        category: 'COLLATERAL_PROOF',
        type: collateralType,
        filename: file.name,
        fileUrl,
        fileType: file.type.includes('pdf') ? 'pdf' : 'image',
        fileSize: file.size,
        extractedData: JSON.stringify(extractedData),
        ocrProcessed: Object.keys(extractedData).length > 0
      }
    });

    // Update verification
    const verification = await prisma.verification.findUnique({
      where: { userId }
    });

    const existingDocs = verification?.collateralDocuments ? JSON.parse(verification.collateralDocuments) : [];

    await prisma.verification.upsert({
      where: { userId },
      create: {
        userId,
        collateralType,
        collateralValue,
        collateralDocuments: JSON.stringify([
          {
            type: collateralType,
            value: collateralValue,
            documentUrl: fileUrl,
            uploadedAt: new Date(),
            extractedData
          }
        ]),
        verificationScore: 20
      },
      update: {
        collateralType,
        collateralValue: (verification?.collateralValue || 0) + collateralValue,
        collateralDocuments: JSON.stringify([
          ...existingDocs,
          {
            type: collateralType,
            value: collateralValue,
            documentUrl: fileUrl,
            uploadedAt: new Date(),
            extractedData
          }
        ]),
        verificationScore: { increment: 20 }
      }
    });

    await prisma.user.update({
      where: { id: userId },
      data: { hasCollateral: true }
    });

    return NextResponse.json({
      success: true,
      document,
      extractedData,
      message: 'Collateral document uploaded successfully'
    });
  } catch (error) {
    console.error('Upload collateral error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
