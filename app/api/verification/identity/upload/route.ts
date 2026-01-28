import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { saveUploadedFile, readUploadedFile } from '@/lib/file-storage';
import { extractIdDataFromDocument } from '@/lib/gemini-ocr';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const idType = formData.get('idType') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Save file locally
    const { fileUrl } = await saveUploadedFile(file, 'identity');

    // Read file for OCR
    const fileBuffer = await readUploadedFile(fileUrl);

    // Extract data using Gemini OCR
    const ocrResult = await extractIdDataFromDocument(
      fileBuffer,
      file.type,
      idType
    );

    // Save document record
    const document = await prisma.document.create({
      data: {
        userId,
        category: 'ID_PROOF',
        type: idType,
        filename: file.name,
        fileUrl,
        fileType: file.type.includes('pdf') ? 'pdf' : 'image',
        fileSize: file.size,
        extractedData: JSON.stringify(ocrResult.extractedData),
        ocrProcessed: true
      }
    });

    // Update verification record
    const verification = await prisma.verification.findUnique({
      where: { userId }
    });

    await prisma.verification.upsert({
      where: { userId },
      create: {
        userId,
        idType,
        idDocument: fileUrl,
        idNumber: ocrResult.extractedData.aadhaarNumber || 
                  ocrResult.extractedData.panNumber || 
                  verification?.idNumber,
        extractedData: JSON.stringify(ocrResult.extractedData),
        verificationScore: 20
      },
      update: {
        idDocument: fileUrl,
        extractedData: JSON.stringify(ocrResult.extractedData),
        verificationScore: { increment: 20 }
      }
    });

    return NextResponse.json({
      success: true,
      document,
      extractedData: ocrResult.extractedData,
      confidence: ocrResult.confidence,
      message: 'ID document uploaded and processed successfully'
    });
  } catch (error) {
    console.error('Upload ID document error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
