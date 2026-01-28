'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { FileText } from 'lucide-react';

export function IncomeVerification({ onSuccess }: { onSuccess: () => void }) {
  const [uploading, setUploading] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);

  async function handleUpload(documentType: string, file: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', documentType);

      const res = await fetch('/api/verification/income/upload', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (res.ok) {
        setExtractedData(data.extractedData);
        toast.success('Document Uploaded', { description: data.message });
        onSuccess();
      } else {
        toast.error('Error', { description: data.error });
      }
    } catch (error) {
      toast.error('Error', { description: 'Failed to upload document' });
    } finally {
      setUploading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Income Verification
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          Upload your income documents. We'll automatically extract income details using AI.
        </p>

        <div className="grid grid-cols-3 gap-4">
          <DocumentUploadCard
            title="ITR (Form 16)"
            description="Income Tax Return"
            documentType="ITR"
            onUpload={handleUpload}
            disabled={uploading}
          />
          <DocumentUploadCard
            title="Salary Slip"
            description="Last 3 months"
            documentType="SALARY_SLIP"
            onUpload={handleUpload}
            disabled={uploading}
          />
          <DocumentUploadCard
            title="Bank Statement"
            description="Last 6 months"
            documentType="BANK_STATEMENT"
            onUpload={handleUpload}
            disabled={uploading}
          />
        </div>

        {extractedData && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium mb-2">Extracted Information</h4>
            <div className="space-y-1 text-sm">
              {extractedData.annualIncome && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Annual Income:</span>
                  <span className="font-semibold">₹{extractedData.annualIncome.toLocaleString()}</span>
                </div>
              )}
              {extractedData.name && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-semibold">{extractedData.name}</span>
                </div>
              )}
              {extractedData.confidence && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Confidence:</span>
                  <span className={`font-semibold ${
                    extractedData.confidence === 'high' ? 'text-green-600' :
                    extractedData.confidence === 'medium' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {extractedData.confidence}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DocumentUploadCard({
  title,
  description,
  documentType,
  onUpload,
  disabled
}: {
  title: string;
  description: string;
  documentType: string;
  onUpload: (type: string, file: File) => void;
  disabled: boolean;
}) {
  return (
    <div className="border rounded-lg p-4 hover:border-blue-500 transition">
      <h4 className="font-medium mb-1">{title}</h4>
      <p className="text-xs text-gray-500 mb-3">{description}</p>
      <Input
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        disabled={disabled}
        onChange={e => {
          const file = e.target.files?.[0];
          if (file) onUpload(documentType, file);
        }}
        className="cursor-pointer"
      />
    </div>
  );
}
