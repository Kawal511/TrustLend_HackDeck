// lib/bolna.ts - Bolna AI voice call integration

import axios from 'axios';

interface BolnaCallParams {
  phoneNumber: string;
  agentId: string;
  metadata: {
    loanId: string;
    borrowerName: string;
    lenderName: string;
    amount: number;
    dueDate: string;
  };
}

export async function initiateBolnaCall(params: BolnaCallParams) {
  try {
    const response = await axios.post(
      'https://api.bolna.dev/call',
      {
        agent_id: params.agentId,
        recipient_phone_number: params.phoneNumber,
        metadata: params.metadata,
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
      callId: response.data.call_id
    };
    
  } catch (error: any) {
    console.error('Bolna call failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
