// app/api/cron/send-reminders/route.ts - Email reminder cron job

import { Resend } from 'resend';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(req: Request) {
  // Verify cron secret for security
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  
  // Find pending reminders
  const reminders = await prisma.emailReminder.findMany({
    where: {
      status: 'PENDING',
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
    try {
      const emailContent = generateEmailContent(reminder.type, reminder.loan);
      
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL!,
        to: reminder.loan.borrower.email,
        subject: emailContent.subject,
        html: emailContent.html
      });

      await prisma.emailReminder.update({
        where: { id: reminder.id },
        data: { 
          status: 'SENT',
          sentAt: new Date()
        }
      });

      results.push({ id: reminder.id, status: 'sent' });
      
    } catch (error: any) {
      await prisma.emailReminder.update({
        where: { id: reminder.id },
        data: { status: 'FAILED' }
      });
      
      results.push({ id: reminder.id, status: 'failed', error: error.message });
    }
  }

  return NextResponse.json({ processed: results.length, results });
}

function generateEmailContent(type: string, loan: any) {
  const daysMap: Record<string, number> = {
    '7_DAY': 7,
    '3_DAY': 3,
    '1_DAY': 1,
    'OVERDUE': 0
  };

  const days = daysMap[type];
  
  if (type === 'OVERDUE') {
    return {
      subject: `⚠️ Loan Overdue: $${loan.amount} to ${loan.lender.firstName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Loan Payment Overdue</h2>
          <p>Hi ${loan.borrower.firstName || 'there'},</p>
          <p>Your loan payment of <strong>$${loan.balance}</strong> to ${loan.lender.firstName} ${loan.lender.lastName} was due on ${new Date(loan.dueDate).toLocaleDateString()}.</p>
          <p style="background: #fee; padding: 15px; border-left: 4px solid #dc2626;">
            <strong>Action Required:</strong> Please settle this payment to maintain your trust score.
          </p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/loans/${loan.id}" 
             style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 15px 0;">
            View Loan Details
          </a>
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            This is an automated reminder from TrustLend. Late payments affect your trust score.
          </p>
        </div>
      `
    };
  }

  return {
    subject: `Reminder: $${loan.amount} loan due in ${days} day${days > 1 ? 's' : ''}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Loan Payment Reminder</h2>
        <p>Hi ${loan.borrower.firstName || 'there'},</p>
        <p>This is a friendly reminder that your loan payment is due soon:</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <table style="width: 100%;">
            <tr>
              <td style="color: #666;">Amount:</td>
              <td style="text-align: right;"><strong>$${loan.balance}</strong></td>
            </tr>
            <tr>
              <td style="color: #666;">Lender:</td>
              <td style="text-align: right;">${loan.lender.firstName} ${loan.lender.lastName}</td>
            </tr>
            <tr>
              <td style="color: #666;">Due Date:</td>
              <td style="text-align: right;">${new Date(loan.dueDate).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td style="color: #666;">Days Remaining:</td>
              <td style="text-align: right; color: ${days <= 1 ? '#dc2626' : '#16a34a'};">${days}</td>
            </tr>
          </table>
        </div>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/loans/${loan.id}" 
           style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
          Record Payment
        </a>
        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          On-time payments help build your trust score on TrustLend.
        </p>
      </div>
    `
  };
}
