'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Wallet } from 'lucide-react';

export function CollateralVerification({ onSuccess }: { onSuccess: () => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Collateral Verification</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="crypto">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="crypto">Crypto Wallet</TabsTrigger>
            <TabsTrigger value="documents">Other Assets</TabsTrigger>
          </TabsList>

          <TabsContent value="crypto">
            <CryptoWalletForm onSuccess={onSuccess} />
          </TabsContent>

          <TabsContent value="documents">
            <AssetDocumentUpload onSuccess={onSuccess} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function CryptoWalletForm({ onSuccess }: { onSuccess: () => void }) {
  const [blockchain, setBlockchain] = useState('ETHEREUM');
  const [walletAddress, setWalletAddress] = useState('');
  const [balance, setBalance] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    try {
      const res = await fetch('/api/verification/collateral/crypto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress,
          walletBalance: parseFloat(balance),
          blockchain
        })
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Crypto Wallet Added', {
          description: `Collateral value: ₹${data.collateralValueUSD.toLocaleString()}`
        });
        onSuccess();
      } else {
        toast.error('Error', { description: data.error });
      }
    } catch (error) {
      toast.error('Error', { description: 'Failed to add crypto wallet' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4 mt-4">
      <div>
        <Label>Blockchain</Label>
        <Select value={blockchain} onValueChange={setBlockchain}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ETHEREUM">Ethereum (ETH)</SelectItem>
            <SelectItem value="BITCOIN">Bitcoin (BTC)</SelectItem>
            <SelectItem value="SOLANA">Solana (SOL)</SelectItem>
            <SelectItem value="USDT">Tether (USDT)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Wallet Address</Label>
        <Input
          value={walletAddress}
          onChange={e => setWalletAddress(e.target.value)}
          placeholder={
            blockchain === 'ETHEREUM'
              ? '0x...'
              : blockchain === 'BITCOIN'
                ? '1...'
                : blockchain === 'SOLANA'
                  ? 'Base58 address'
                  : 'Wallet address'
          }
        />
      </div>

      <div>
        <Label>Balance (in {blockchain.split('_')[0]})</Label>
        <Input
          type="number"
          step="0.000001"
          value={balance}
          onChange={e => setBalance(e.target.value)}
          placeholder="0.0"
        />
      </div>

      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> This is a mock verification. In production, we'd verify your wallet balance via blockchain APIs.
        </p>
      </div>

      <Button onClick={handleSubmit} disabled={loading || !walletAddress || !balance} className="w-full">
        <Wallet className="h-4 w-4 mr-2" />
        Add Crypto Collateral
      </Button>
    </div>
  );
}

function AssetDocumentUpload({ onSuccess }: { onSuccess: () => void }) {
  const [collateralType, setCollateralType] = useState('PROPERTY');
  const [value, setValue] = useState('');
  const [uploading, setUploading] = useState(false);
  const [extractedInfo, setExtractedInfo] = useState<any>(null);

  async function handleUpload(file: File) {
    setUploading(true);
    setExtractedInfo(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('collateralType', collateralType);

      // If user hasn't typed a value yet, we might get it from OCR
      if (value) formData.append('collateralValue', value);
      else formData.append('collateralValue', '0'); // Placeholder, will update later

      const res = await fetch('/api/verification/collateral/upload', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Collateral Added', { description: data.message });
        setExtractedInfo(data.extractedData);

        // Auto-fill value if extracted
        if (data.extractedData?.estimatedValue) {
          setValue(data.extractedData.estimatedValue.toString());
        }

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
    <div className="space-y-4 mt-4">
      <div>
        <Label>Collateral Type</Label>
        <Select value={collateralType} onValueChange={setCollateralType}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PROPERTY">Property/Real Estate</SelectItem>
            <SelectItem value="VEHICLE">Vehicle</SelectItem>
            <SelectItem value="SECURITIES">Stocks/Securities</SelectItem>
            <SelectItem value="FIXED_DEPOSIT">Fixed Deposit</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Estimated Value (INR)</Label>
        <Input
          type="number"
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="10000"
        />
      </div>

      <div>
        <Label>Upload Proof Document</Label>
        <Input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          disabled={uploading}
          onChange={e => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
          }}
        />
        <p className="text-xs text-gray-500 mt-1">
          Upload property deed, vehicle registration, or other proof
        </p>
      </div>

      {extractedInfo && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
          <h5 className="font-semibold text-blue-900 mb-1">OCR Extracted Details:</h5>
          <ul className="list-disc list-inside text-blue-800 space-y-1">
            {extractedInfo.ownerName && <li><strong>Owner:</strong> {extractedInfo.ownerName}</li>}
            {extractedInfo.propertyType && <li><strong>Type:</strong> {extractedInfo.propertyType}</li>}
            {extractedInfo.area && <li><strong>Area:</strong> {extractedInfo.area}</li>}
            {extractedInfo.registrationNumber && <li><strong>Reg No:</strong> {extractedInfo.registrationNumber}</li>}
            {extractedInfo.vehicleNumber && <li><strong>Vehicle No:</strong> {extractedInfo.vehicleNumber}</li>}
            {extractedInfo.manufacturer && <li><strong>Make:</strong> {extractedInfo.manufacturer}</li>}
            {extractedInfo.estimatedValue && <li><strong>Est. Value:</strong> {extractedInfo.estimatedValue}</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
