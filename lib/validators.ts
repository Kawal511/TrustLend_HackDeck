// lib/validators.ts - Zod validation schemas

import { z } from "zod";

// Create Loan Schema
export const createLoanSchema = z.object({
    borrowerEmail: z.string().email("Invalid email address"),
    amount: z.number().positive("Amount must be positive").max(10000, "Maximum loan amount is $10,000"),
    dueDate: z.string().datetime("Invalid date format"),
    purpose: z.string().max(200, "Purpose must be 200 characters or less").optional(),
    notes: z.string().max(500, "Notes must be 500 characters or less").optional()
});

export type CreateLoanInput = z.infer<typeof createLoanSchema>;

// Create Repayment Schema
export const createRepaymentSchema = z.object({
    amount: z.number().positive("Amount must be positive"),
    note: z.string().max(200, "Note must be 200 characters or less").optional()
});

export type CreateRepaymentInput = z.infer<typeof createRepaymentSchema>;

// Confirm Repayment Schema
export const confirmRepaymentSchema = z.object({
    action: z.enum(["confirm", "dispute"])
});

export type ConfirmRepaymentInput = z.infer<typeof confirmRepaymentSchema>;

// Update Loan Schema
export const updateLoanSchema = z.object({
    status: z.enum(["ACTIVE", "COMPLETED", "OVERDUE", "DISPUTED", "CANCELLED"]).optional(),
    notes: z.string().max(500).optional()
});

export type UpdateLoanInput = z.infer<typeof updateLoanSchema>;

// Search User Schema
export const searchUserSchema = z.object({
    query: z.string().min(1, "Search query is required").max(100)
});

export type SearchUserInput = z.infer<typeof searchUserSchema>;
