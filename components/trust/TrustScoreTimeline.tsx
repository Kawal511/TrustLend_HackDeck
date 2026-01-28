'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown, TrendingUp, TrendingDown } from 'lucide-react';

interface TrustScoreHistoryEntry {
  id: string;
  event: string;
  change: number;
  previousScore: number;
  newScore: number;
  description: string;
  createdAt: string;
  loan?: {
    id: string;
    amount: number;
    status: string;
  };
}

export default function TrustScoreTimeline() {
  const [history, setHistory] = useState<TrustScoreHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/trust-score/history');
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (error) {
      console.error('Error fetching trust score history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getEventBadgeColor = (change: number) => {
    if (change > 0) return 'bg-green-500';
    if (change < 0) return 'bg-red-500';
    return 'bg-gray-500';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Trust Score History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">Loading history...</div>
        </CardContent>
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Trust Score History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            No trust score history yet. Start making transactions to build your
            reputation!
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trust Score History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200" />

          <div className="space-y-6">
            {history.map((entry, index) => (
              <div key={entry.id} className="relative flex gap-4">
                {/* Timeline dot */}
                <div className="relative z-10">
                  <div
                    className={`w-16 h-16 rounded-full ${getEventBadgeColor(
                      entry.change
                    )} flex items-center justify-center text-white`}
                  >
                    {entry.change > 0 ? (
                      <TrendingUp className="h-8 w-8" />
                    ) : (
                      <TrendingDown className="h-8 w-8" />
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 pb-6">
                  <div className="bg-white border rounded-lg p-4 shadow-sm">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{entry.description}</h4>
                        <p className="text-sm text-gray-500">
                          {new Date(entry.createdAt).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <Badge className={getEventBadgeColor(entry.change)}>
                        {entry.change > 0 ? '+' : ''}
                        {entry.change}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 mt-3 text-sm">
                      <div>
                        <span className="text-gray-500">Previous:</span>{' '}
                        <span className="font-medium">{entry.previousScore}</span>
                      </div>
                      {entry.change > 0 ? (
                        <ArrowUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <ArrowDown className="h-4 w-4 text-red-500" />
                      )}
                      <div>
                        <span className="text-gray-500">New:</span>{' '}
                        <span className="font-medium">{entry.newScore}</span>
                      </div>
                    </div>

                    {entry.loan && (
                      <div className="mt-3 pt-3 border-t text-sm text-gray-600">
                        Related to loan of ₹{entry.loan.amount.toFixed(2)} (
                        {entry.loan.status})
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
