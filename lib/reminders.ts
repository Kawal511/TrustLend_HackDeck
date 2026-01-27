// lib/reminders.ts - Reminder utilities

import { prisma } from "@/lib/prisma";

export async function createEmailReminders(loanId: string, dueDate: Date) {
  const reminders = [
    { type: '7_DAY', days: 7 },
    { type: '3_DAY', days: 3 },
    { type: '1_DAY', days: 1 }
  ];

  for (const reminder of reminders) {
    const scheduledFor = new Date(dueDate);
    scheduledFor.setDate(scheduledFor.getDate() - reminder.days);

    // Only create if in the future
    if (scheduledFor > new Date()) {
      await prisma.emailReminder.create({
        data: {
          loanId,
          type: reminder.type,
          scheduledFor,
          status: 'PENDING'
        }
      });
    }
  }
}

export async function createVoiceReminder(loanId: string, phoneNumber: string, dueDate: Date) {
  const scheduledFor = new Date(dueDate);
  scheduledFor.setDate(scheduledFor.getDate() - 1); // Call 1 day before
  
  if (scheduledFor > new Date() && phoneNumber) {
    await prisma.voiceReminder.create({
      data: {
        loanId,
        phoneNumber,
        scheduledFor,
        status: 'SCHEDULED'
      }
    });
  }
}
