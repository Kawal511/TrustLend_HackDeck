import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, formatDistanceToNow, differenceInDays } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format currency with symbol
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

// Format date for display
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'MMM d, yyyy');
}

// Format date with time
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'MMM d, yyyy h:mm a');
}

// Get relative time (e.g., "2 days ago")
export function getRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

// Get days until due date (negative if overdue)
export function getDaysUntilDue(dueDate: Date | string): number {
  const d = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
  return differenceInDays(d, new Date());
}

// Check if loan is overdue
export function isOverdue(dueDate: Date | string): boolean {
  return getDaysUntilDue(dueDate) < 0;
}

// Get due date status for styling
export function getDueDateStatus(dueDate: Date | string): 'overdue' | 'urgent' | 'approaching' | 'safe' {
  const days = getDaysUntilDue(dueDate);
  if (days < 0) return 'overdue';
  if (days === 0) return 'urgent';
  if (days <= 7) return 'approaching';
  return 'safe';
}

// Get status color class
export function getStatusColor(status: string): string {
  switch (status) {
    case 'ACTIVE':
      return 'bg-green-100 text-green-800';
    case 'COMPLETED':
      return 'bg-blue-100 text-blue-800';
    case 'OVERDUE':
      return 'bg-red-100 text-red-800';
    case 'DISPUTED':
      return 'bg-yellow-100 text-yellow-800';
    case 'CANCELLED':
      return 'bg-gray-100 text-gray-800';
    case 'PENDING_CONFIRMATION':
      return 'bg-orange-100 text-orange-800';
    case 'CONFIRMED':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
