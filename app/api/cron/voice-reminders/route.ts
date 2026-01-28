// app/api/cron/voice-reminders/route.ts - Voice reminder cron job

import { prisma } from '@/lib/prisma';
import { initiateBolnaCall } from '@/lib/bolna';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  
  const reminders = await prisma.voiceReminder.findMany({
    where: {
      status: 'SCHEDULED',
      scheduledFor: { lte: now }
    },
    include: {
      loan: {
        include: {
          borrower: true,
          lender: true
        }
      }
    }
  });

  const results = [];

  for (const reminder of reminders) {
    if (!reminder.loan.borrower.voiceRemindersEnabled) {
      await prisma.voiceReminder.update({
        where: { id: reminder.id },
        data: { status: 'SKIPPED' }
      });
      continue;
    }

    const result = await initiateBolnaCall({
      phoneNumber: reminder.phoneNumber,
      loanId: reminder.loan.id,
      borrowerName: reminder.loan.borrower.firstName || 'User',
      lenderName: reminder.loan.lender.firstName || 'Lender',
      loanAmount: reminder.loan.balance,
      dueDate: reminder.loan.dueDate.toLocaleDateString()
    });

    if (result.success) {
      await prisma.voiceReminder.update({
        where: { id: reminder.id },
        data: { 
          status: 'CALLING',
          callId: result.call_id,
          calledAt: new Date()
        }
      });
      results.push({ id: reminder.id, status: 'initiated' });
    } else {
      await prisma.voiceReminder.update({
        where: { id: reminder.id },
        data: { status: 'FAILED' }
      });
      results.push({ id: reminder.id, status: 'failed' });
    }
  }

  return NextResponse.json({ processed: results.length, results });
}
