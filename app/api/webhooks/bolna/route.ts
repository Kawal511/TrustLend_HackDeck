// app/api/webhooks/bolna/route.ts - Bolna webhook handler

import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    
    const {
      call_id,
      call_duration,
      call_status,
      transcript,
      extracted_data,
      summary
    } = payload;

    const reminder = await prisma.voiceReminder.findFirst({
      where: { callId: call_id },
      include: {
        loan: {
          include: {
            borrower: true,
            lender: true
          }
        }
      }
    });

    if (!reminder) {
      return NextResponse.json({ error: 'Reminder not found' }, { status: 404 });
    }

    // Update reminder record
    await prisma.voiceReminder.update({
      where: { id: reminder.id },
      data: {
        status: call_status === 'completed' ? 'COMPLETED' : 
               call_status === 'no_answer' ? 'NO_ANSWER' : 'FAILED',
        duration: call_duration || 0,
        transcript: transcript
      }
    });

    // Process extracted data if available
    if (extracted_data?.repayment_intent === 'disputes') {
      // Check if dispute thread already exists
      let dispute = await prisma.disputeThread.findUnique({
        where: { loanId: reminder.loan.id }
      });

      if (!dispute) {
        dispute = await prisma.disputeThread.create({
          data: {
            loanId: reminder.loan.id,
            status: 'OPEN'
          }
        });
      }

      // Create initial system message
      await prisma.disputeMessage.create({
        data: {
          threadId: dispute.id,
          senderId: 'system',
          content: `Borrower disputed loan during voice call on ${new Date().toLocaleDateString()}. Summary: ${summary || 'No summary available'}`,
          isAiGenerated: true
        }
      });
    }

    // Handle reschedule
    if (extracted_data?.reschedule_requested === 'yes' && 
        extracted_data?.reschedule_date) {
      await prisma.voiceReminder.create({
        data: {
          loanId: reminder.loan.id,
          phoneNumber: reminder.phoneNumber,
          status: 'SCHEDULED',
          scheduledFor: new Date(extracted_data.reschedule_date)
        }
      });
    }

    // Update loan notes
    if (summary) {
      const currentNotes = reminder.loan.notes || '';
      await prisma.loan.update({
        where: { id: reminder.loan.id },
        data: {
          notes: `${currentNotes}\n\nCall on ${new Date().toLocaleDateString()}: ${extracted_data?.call_outcome || 'completed'}. ${summary}`
        }
      });
    }

    return NextResponse.json({ success: true });
    
  } catch (error: any) {
    console.error('Bolna webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
