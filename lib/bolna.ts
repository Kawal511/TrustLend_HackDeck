// lib/bolna.ts - Bolna AI voice call integration

import axios from 'axios';

interface BolnaCallParams {
  phoneNumber: string;
  loanAmount: number;
  dueDate: string;
  borrowerName: string;
  lenderName: string;
  loanId: string;
}

export async function initiateBolnaCall(params: BolnaCallParams) {
  try {
    const agentId = process.env.BOLNA_AGENT_ID;
    
    if (!agentId) {
      throw new Error('BOLNA_AGENT_ID not configured');
    }

    const response = await axios.post(
      'https://api.bolna.dev/call',
      {
        agent_id: agentId,
        recipient_phone_number: params.phoneNumber,
        metadata: {
          loanId: params.loanId,
          borrowerName: params.borrowerName,
          lenderName: params.lenderName,
          amount: params.loanAmount,
          dueDate: params.dueDate
        },
        webhook_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/bolna`
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.BOLNA_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      success: true,
      call_id: response.data.call_id,
      status: response.data.status || 'queued'
    };
    
  } catch (error: any) {
    console.error('Bolna call failed:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message || 'Failed to initiate call');
  }
}
