import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface OcrResult {
  documentType: string;
  extractedData: any;
  confidence: 'high' | 'medium' | 'low';
  rawText?: string;
}

export async function extractIncomeDataFromDocument(
  fileBuffer: Buffer,
  mimeType: string,
  documentType: string
): Promise<OcrResult> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = generatePromptForDocumentType(documentType);

    // Convert buffer to base64
    const base64Data = fileBuffer.toString('base64');

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: mimeType
      }
    };

    console.log(`[OCR] Processing document type: ${documentType}, MimeType: ${mimeType}`);
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();
    console.log('[OCR] Raw Gemini Response:', text);

    // Parse JSON from response
    let extractedData;
    try {
      // Remove markdown code blocks if present
      const jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      extractedData = JSON.parse(jsonText);
      console.log('[OCR] Parsed JSON:', extractedData);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.log('[OCR] Failed to parse text:', text);
      extractedData = { error: 'Failed to parse extracted data', rawResponse: text };
    }

    return {
      documentType,
      extractedData,
      confidence: extractedData.confidence || 'medium',
      rawText: text.substring(0, 500)
    };
  } catch (error) {
    console.error('Gemini OCR error:', error);
    return {
      documentType,
      extractedData: { error: 'OCR processing failed' },
      confidence: 'low'
    };
  }
}

function generatePromptForDocumentType(documentType: string): string {
  const prompts: Record<string, string> = {
    ITR: `You are an expert at extracting data from Indian Income Tax Return (ITR) documents.

Extract the following information from this ITR document and return ONLY valid JSON:

{
  "financialYear": "string (e.g., 2023-24)",
  "annualIncome": number (total gross income in rupees),
  "taxPaid": number (total tax paid in rupees),
  "name": "string (taxpayer name)",
  "pan": "string (PAN number if visible)",
  "filingDate": "string (date in YYYY-MM-DD format)",
  "incomeFromSalary": number (if visible),
  "incomeFromBusiness": number (if visible),
  "confidence": "high" | "medium" | "low"
}

If any field is not clearly visible, use null. Set confidence based on document clarity.`,

    SALARY_SLIP: `You are an expert at extracting data from salary slips/payslips.

Extract the following information from this salary slip and return ONLY valid JSON:

{
  "name": "string (employee name)",
  "employeeId": "string (employee ID/code)",
  "month": "string (month name)",
  "year": "string (year)",
  "grossSalary": number (monthly gross salary),
  "netSalary": number (monthly net/take-home salary)",
  "deductions": number (total deductions),
  "company": "string (company/employer name)",
  "annualIncome": number (grossSalary * 12),
  "confidence": "high" | "medium" | "low"
}

Calculate annualIncome by multiplying grossSalary by 12. Set confidence based on document clarity.`,

    BANK_STATEMENT: `You are an expert at analyzing bank statements.

Extract the following information from this bank statement and return ONLY valid JSON:

{
  "name": "string (account holder name)",
  "accountNumber": "string (last 4 digits only, format: XXXX1234)",
  "bankName": "string (bank name)",
  "statementPeriod": "string (e.g., Jan 2024 - Mar 2024)",
  "openingBalance": number,
  "closingBalance": number,
  "totalCredits": number (sum of all deposits/credits in period),
  "totalDebits": number (sum of all withdrawals/debits in period),
  "averageBalance": number (approximate average),
  "monthlyCredit": number (totalCredits divided by number of months),
  "annualIncome": number (monthlyCredit * 12),
  "confidence": "high" | "medium" | "low"
}

Estimate annualIncome based on regular salary credits if visible. Set confidence based on clarity.`,

    AADHAAR: `You are an expert at extracting data from Aadhaar cards.

Extract the following information from this Aadhaar card and return ONLY valid JSON:

{
  "name": "string (full name as on Aadhaar)",
  "aadhaarNumber": "string (12-digit number, format: XXXX XXXX 1234 - mask first 8 digits)",
  "dob": "string (date of birth in DD/MM/YYYY format)",
  "gender": "string (Male/Female/Other)",
  "address": "string (full address)",
  "confidence": "high" | "medium" | "low"
}

For privacy, mask the first 8 digits of Aadhaar number. Set confidence based on document clarity.`,

    PAN: `You are an expert at extracting data from PAN cards.

Extract the following information from this PAN card and return ONLY valid JSON:

{
  "name": "string (full name as on PAN)",
  "panNumber": "string (10-character PAN number)",
  "dob": "string (date of birth in DD/MM/YYYY format)",
  "fatherName": "string (father's name if visible)",
  "confidence": "high" | "medium" | "low"
}

Set confidence based on document clarity and text readability.`,

    PROPERTY_DEED: `You are an expert at extracting data from property documents.

Extract the following information from this property deed/document and return ONLY valid JSON:

{
  "propertyType": "string (Residential/Commercial/Land)",
  "address": "string (property address)",
  "area": "string (property area with unit, e.g., 1200 sq ft)",
  "ownerName": "string (property owner name)",
  "registrationNumber": "string (document/registration number)",
  "registrationDate": "string (date in DD/MM/YYYY format)",
  "estimatedValue": number (property value if mentioned),
  "confidence": "high" | "medium" | "low"
}

If estimated value is not mentioned, set to null. Set confidence based on document clarity.`,

    VEHICLE_RC: `You are an expert at extracting data from vehicle registration certificates.

Extract the following information from this vehicle RC and return ONLY valid JSON:

{
  "vehicleNumber": "string (registration number)",
  "ownerName": "string (registered owner name)",
  "vehicleClass": "string (e.g., Motor Car, Two Wheeler)",
  "manufacturer": "string (make and model)",
  "registrationDate": "string (date in DD/MM/YYYY format)",
  "engineNumber": "string (last 4 digits only)",
  "chassisNumber": "string (last 4 digits only)",
  "confidence": "high" | "medium" | "low"
}

For privacy, only extract last 4 digits of engine and chassis numbers.`
  };

  return prompts[documentType] || prompts.SALARY_SLIP;
}

export async function extractIdDataFromDocument(
  fileBuffer: Buffer,
  mimeType: string,
  idType: string
): Promise<OcrResult> {
  return extractIncomeDataFromDocument(fileBuffer, mimeType, idType);
}
