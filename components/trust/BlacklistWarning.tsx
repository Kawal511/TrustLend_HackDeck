'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertTriangle } from 'lucide-react';

interface BlacklistWarningProps {
  userId: string;
  userName: string;
}

export default function BlacklistWarning({ userId, userName }: BlacklistWarningProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [evidence, setEvidence] = useState('');
  const [severity, setSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>(
    'MEDIUM'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/blacklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          reason,
          evidence,
          severity,
        }),
      });

      if (res.ok) {
        setIsOpen(false);
        setReason('');
        setEvidence('');
        setSeverity('MEDIUM');
        // Show success message or refresh page
        window.location.reload();
      }
    } catch (error) {
      console.error('Error reporting user:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <AlertTriangle className="h-4 w-4 mr-2" />
          Report User
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report {userName} for Fraudulent Activity</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="text-sm text-red-800">
                <p className="font-semibold">Warning</p>
                <p>
                  This action will blacklist the user and severely impact their trust
                  score. Only report users for legitimate fraudulent activities with
                  proper evidence.
                </p>
              </div>
            </div>
          </div>

          <div>
            <Label>Severity</Label>
            <Select value={severity} onValueChange={(v: any) => setSeverity(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Low - Minor issues</SelectItem>
                <SelectItem value="MEDIUM">Medium - Significant concerns</SelectItem>
                <SelectItem value="HIGH">High - Clear fraud indicators</SelectItem>
                <SelectItem value="CRITICAL">
                  Critical - Proven fraud (Permanent ban)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Reason for Blacklisting</Label>
            <Textarea
              placeholder="Describe the fraudulent activity..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>

          <div>
            <Label>Evidence (Optional)</Label>
            <Textarea
              placeholder="Provide evidence such as transaction IDs, screenshots descriptions, etc."
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleSubmit}
              disabled={isSubmitting || !reason}
              className="flex-1"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
