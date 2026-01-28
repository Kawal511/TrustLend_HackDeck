# TrustLend - Complete Code Changes Documentation

This document details all modifications made to the `TrustLend_HackDeck` project including bug fixes, feature implementations, and enhancements.

---

## Table of Contents

1. [Prisma Unique Constraint & Clerk Sync Fix](#1-prisma-unique-constraint--clerk-sync-fix)
2. [Fix NaN Error in Installment Manager](#2-fix-nan-error-in-installment-manager)
3. [View Uploaded Document Feature](#3-view-uploaded-document-feature)
4. [LinkPe Integration for QR Codes](#4-linkpe-integration-for-qr-codes)
5. [Contract Export Updates](#5-contract-export-updates)
6. [Borrower Registration with DigiLocker](#6-borrower-registration-with-digilocker)
7. [Loan Request System](#7-loan-request-system)
8. [Lender Notifications & Approval Flow](#8-lender-notifications--approval-flow)
9. [Export Contract UPI Dialog](#9-export-contract-upi-dialog)

---

## 1. Prisma Unique Constraint & Clerk Sync Fix

**Goal**: Resolve `PrismaClientKnownRequestError` caused by unique email constraints when syncing Clerk users who may already exist in the database with a different ID.

### `app/(dashboard)/layout.tsx`

Logic added to check for existing users by email before creation. If an ID mismatch is found, it attempts to update the ID or renames the old user's email to avoid collision.

```tsx
// Sync user to database if not exists
const dbUser = await prisma.user.findUnique({
    where: { id: user.id }
});

if (!dbUser) {
    const primaryEmail = user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress || user.emailAddresses[0].emailAddress;

    const existingUser = await prisma.user.findUnique({
        where: { email: primaryEmail }
    });

    if (existingUser) {
        try {
            // Try to update the existing user's ID to match the new Clerk ID
            await prisma.user.update({
                where: { email: primaryEmail },
                data: { id: user.id }
            });
        } catch (error) {
            // If ID update fails (e.g. FK constraints), rename the old email to free it up
            console.error("Failed to update user ID, renaming old user email:", error);
            await prisma.user.update({
                where: { email: primaryEmail },
                data: { email: `${primaryEmail}_old_${Date.now()}` }
            });
            
            await prisma.user.create({
                data: {
                    id: user.id,
                    email: primaryEmail,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    imageUrl: user.imageUrl,
                    username: user.username
                }
            });
        }
    } else {
        await prisma.user.create({
            data: {
                id: user.id,
                email: primaryEmail,
                firstName: user.firstName,
                lastName: user.lastName,
                imageUrl: user.imageUrl,
                username: user.username
            }
        });
    }
}
```

### `app/api/webhooks/clerk/route.ts`

Similar logic applied to the webhook handler to prevent race conditions or collisions during background syncs.

```typescript
// Inside user.created event handler
// Check for email conflict
if (email) {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser && existingUser.id !== id) {
        console.log(`Email collision for ${email}. Renaming old user ${existingUser.id}`);
        await prisma.user.update({
            where: { email },
            data: { email: `${email}_old_${Date.now()}` }
        });
    }
}

// Inside user.updated event handler
if (email) {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser && existingUser.id !== id) {
        console.log(`Email collision for ${email} during update. Renaming old user ${existingUser.id}`);
        await prisma.user.update({
            where: { email },
            data: { email: `${email}_old_${Date.now()}` }
        });
    }
}
```

---

## 2. Fix NaN Error in Installment Manager

**Goal**: Prevent React warnings when the "Number of Installments" input is empty or invalid.

### `components/loans/InstallmentManager.tsx`

Updated the `Input` value and `onChange` handler to safely handle parsing.

```tsx
<Input
  type="number"
  min={2}
  max={12}
  // FIX: Handle NaN for controlled input
  value={isNaN(numberOfInstallments) ? '' : numberOfInstallments}
  onChange={(e) => {
    const val = parseInt(e.target.value);
    setNumberOfInstallments(isNaN(val) ? 0 : val);
  }}
/>
```

---

## 3. "View Uploaded Document" Feature

**Goal**: Allow users to verify their uploaded documents immediately after successful upload.

### `components/verification/IncomeVerification.tsx`

Added state for `uploadedDocUrl` and a conditional link.

```tsx
// State
const [uploadedDocUrl, setUploadedDocUrl] = useState<string | null>(null);

// In handleUpload onSuccess
setUploadedDocUrl(data.document.fileUrl);

// Render
{uploadedDocUrl && (
  <div className="mt-4 pt-3 border-t border-green-200">
    <a
      href={uploadedDocUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
    >
      <FileText className="h-4 w-4" />
      View Uploaded Document
    </a>
  </div>
)}
```

### `components/verification/CollateralVerification.tsx`

Similar implementation for collateral documents.

```tsx
// Inside AssetDocumentUpload component
const [uploadedDocUrl, setUploadedDocUrl] = useState<string | null>(null);

// In handleUpload onSuccess
setUploadedDocUrl(data.document.fileUrl);

// Render
{uploadedDocUrl && (
  <div className="mt-4 pt-3 border-t border-blue-200">
    <a 
      href={uploadedDocUrl} 
      target="_blank" 
      rel="noopener noreferrer"
      className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
    >
      <FileText className="h-4 w-4" />
      View Uploaded Document
    </a>
  </div>
)}
```

---

## 4. LinkPe Integration for QR Codes

**Goal**: Replace static QR generation with dynamic LinkPe UPI links.

### `components/loans/QRCodeDisplay.tsx`

Completely rewrote the component to generate `linkpe` URLs.

```tsx
export default function QRCodeDisplay({
  loanId,
  amount,
  payeeName,
  payeeUpi: initialPayeeUpi,
}: QRCodeDisplayProps) {
  const [upiId, setUpiId] = useState(initialPayeeUpi || '');

  const generateLinkPeUrl = () => {
    const baseUrl = 'https://ptprashanttripathi.github.io/linkpe/';
    const params = new URLSearchParams({
      pa: upiId,
      pn: payeeName,
      amt: amount.toString(),
      cu: 'INR', 
    });
    return `${baseUrl}?${params.toString()}`;
  };

  const handleOpenPaymentLink = () => {
    if (!upiId) return;
    window.open(generateLinkPeUrl(), '_blank');
  };

  // ... (UI Code with Input for UPI ID and Button to Open Link)
}
```

### `app/(dashboard)/loans/[id]/page.tsx`

Updated `LoanDetailPage` to pass the required props to `QRCodeDisplay`.

```tsx
<QRCodeDisplay
    loanId={loan.id}
    amount={loan.amount}
    payeeName={`${loan.lender.firstName || ''} ${loan.lender.lastName || ''}`.trim() || loan.lender.email}
/>
```

---

## 5. Contract Export Updates

**Goal**: Include Payment Schedule and LinkPe Payment details in the PDF contract.

### `app/(dashboard)/loans/[id]/page.tsx`

Updated `getLoan` to include `installments`.

```typescript
repayments: {
    include: { payer: true, receiver: true },
    orderBy: { createdAt: "desc" }
},
installments: {
    orderBy: { installmentNumber: "asc" }
}
```

### `components/loans/ContractExportButton.tsx`

Updated PDF generation logic.

```typescript
// Add Payment Schedule Table
if (loan.installments && loan.installments.length > 0) {
     doc.text("3. Payment Schedule", leftMargin, y);
     // ... Loop through installments and add rows
}

// Add Payment Link
const linkPeUrl = `https://ptprashanttripathi.github.io/linkpe/?pn=${encodeURIComponent(lenderName)}&amt=${loan.amount}`;
doc.textWithLink("Click here to pay (LinkPe)", leftMargin, y, { url: linkPeUrl });
doc.text(`URL: ${linkPeUrl}`, leftMargin, y + 5);
```

---

## 6. Borrower Registration with DigiLocker

**Goal**: Implement borrower registration with Aadhaar verification through mock DigiLocker flow.

### NEW FILE: `lib/aadhaar-generator.ts`

Utility for generating dummy Aadhaar data.

```typescript
export function generateAadhaarNumber(): string {
    const firstDigit = Math.floor(Math.random() * 8) + 2;
    const remaining = Array.from({ length: 11 }, () => Math.floor(Math.random() * 10)).join('');
    return `${firstDigit}${remaining}`;
}

export function formatAadhaar(aadhaar: string): string {
    return aadhaar.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3');
}

export function maskAadhaar(aadhaar: string): string {
    return `XXXX XXXX ${aadhaar.slice(-4)}`;
}

export function generateDummyAadhaarData() {
    const names = ['RAHUL SHARMA', 'PRIYA PATEL', 'AMIT KUMAR', 'SNEHA GUPTA', 'RAJESH KUMAR'];
    const genders = ['Male', 'Female'];
    
    return {
        aadhaarNumber: generateAadhaarNumber(),
        name: names[Math.floor(Math.random() * names.length)],
        dob: `${Math.floor(Math.random() * 28) + 1}/${Math.floor(Math.random() * 12) + 1}/${1985 + Math.floor(Math.random() * 15)}`,
        gender: genders[Math.floor(Math.random() * 2)],
        address: 'House No. 123, Street Name, City, State - 110001'
    };
}
```

### NEW FILE: `app/digilocker/page.tsx`

Mock DigiLocker authentication page with:
- 3-step flow: Auth → Consent → Success
- OTP verification simulation (displays OTP for demo)
- SessionStorage for passing data back to registration

### NEW FILE: `app/borrowers/register/page.tsx`

3-step registration wizard:
1. **Basic Info**: Name, email, phone, DOB, address
2. **Verification**: Redirect to DigiLocker
3. **Complete**: Show verified details + Trust Score (50)

Key code - Form data persistence:
```typescript
useEffect(() => {
    const storedData = sessionStorage.getItem('digilocker_verification');
    const storedFormData = sessionStorage.getItem('borrower_form_data');
    
    if (storedData) {
        setVerificationData(JSON.parse(storedData));
        sessionStorage.removeItem('digilocker_verification');
        setStep('complete');
    }
    
    if (storedFormData) {
        setFormData(JSON.parse(storedFormData));
        sessionStorage.removeItem('borrower_form_data');
    }
}, []);

function handleDigiLockerAuth() {
    // Save form data before redirecting
    sessionStorage.setItem('borrower_form_data', JSON.stringify(formData));
    const returnUrl = encodeURIComponent(window.location.href);
    window.location.href = `/digilocker?return_url=${returnUrl}`;
}
```

### NEW FILE: `app/api/borrowers/register/route.ts`

Registration API that:
- Validates required fields
- Updates existing user by Clerk userId (priority) or email
- Creates verification record
- Sets initial trust score to 50
- Creates trust score history entry

```typescript
// First, check if logged-in user exists (by Clerk userId)
if (userId) {
    const existingByUserId = await prisma.user.findUnique({
        where: { id: userId }
    });
    if (existingByUserId) {
        user = await prisma.user.update({
            where: { id: userId },
            data: {
                firstName, lastName, phoneNumber,
                trustScore: aadhaarVerification ? 50 : 30,
                isIdVerified: !!aadhaarVerification,
            }
        });
    }
}

// Create verification record
if (aadhaarVerification) {
    await prisma.verification.upsert({
        where: { userId: user.id },
        update: { idType: 'AADHAAR', idVerified: true, ... },
        create: { userId: user.id, idType: 'AADHAAR', ... }
    });
    
    await prisma.trustScoreHistory.create({
        data: {
            userId: user.id,
            event: 'REGISTRATION',
            change: 50,
            previousScore: 0,
            newScore: 50,
            description: 'Initial registration with Aadhaar verification'
        }
    });
}
```

### NEW FILE: `app/borrowers/page.tsx`

Verified borrowers directory listing with trust scores and loan history.

---

## 7. Loan Request System

**Goal**: Allow verified borrowers to request loans from lenders.

### NEW FILE: `app/(dashboard)/borrow/page.tsx`

Loan request page showing:
- Verification status banner
- Loan request form (if verified)
- "My Loan Requests" section with status badges (Pending/Approved/Rejected)
- Available lenders sidebar

Key code - Status badges:
```tsx
const getStatusBadge = (status: string) => {
    switch (status) {
        case 'PENDING':
            return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
        case 'ACTIVE':
            return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="h-3 w-3 mr-1" />Approved</Badge>;
        case 'REJECTED':
            return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
        default:
            return <Badge variant="secondary">{status}</Badge>;
    }
};
```

### NEW FILE: `components/borrow/BorrowRequestForm.tsx`

Client component with:
- Amount input (₹)
- Repayment date picker
- Lender selection (specific or broadcast to all)
- Purpose dropdown (education, medical, business, personal, home, vehicle, other)
- Urgency level (low, normal, high, urgent)
- Additional details textarea

### NEW FILE: `app/api/borrow/request/route.ts`

API that:
- Validates user verification status
- Creates PENDING loan for specific lender or broadcasts

```typescript
// Check if user is verified
const borrower = await prisma.user.findUnique({
    where: { id: userId },
    select: { isIdVerified: true }
});

if (!borrower?.isIdVerified) {
    return NextResponse.json(
        { error: 'You must complete verification to request loans' },
        { status: 403 }
    );
}

// Create pending loan
const loan = await prisma.loan.create({
    data: {
        lenderId: lenderId,
        borrowerId: userId,
        amount, balance: amount, currency: 'INR',
        purpose, dueDate: new Date(dueDate),
        status: 'PENDING'
    }
});
```

---

## 8. Lender Notifications & Approval Flow

**Goal**: Notify lenders of pending requests and allow them to approve/reject.

### MODIFIED: `app/api/notifications/route.ts`

Added pending loan request notifications:

```typescript
// Pending loan request - show to lender
if (loan.status === 'PENDING' && isLender) {
    notifications.push({
        id: `pending_${loan.id}`,
        type: "loan_request",
        title: "🔔 New Loan Request",
        message: `${otherName} is requesting ₹${loan.amount.toLocaleString()} - Review and approve`,
        link: `/loans/${loan.id}`
    });
} else if (loan.status === 'PENDING' && !isLender) {
    notifications.push({
        id: `pending_borrower_${loan.id}`,
        type: "loan_request",
        title: "Request Pending",
        message: `Your ₹${loan.amount.toLocaleString()} loan request to ${otherName} is pending approval`,
        link: `/borrow`
    });
}
```

### NEW FILE: `app/api/loans/[id]/approve/route.ts`

Approval API:

```typescript
export async function POST(req: Request, { params }) {
    const { action } = await req.json(); // 'approve' or 'reject'
    
    // Only lender can approve/reject
    if (loan.lenderId !== userId) {
        return NextResponse.json({ error: 'Only the lender can approve' }, { status: 403 });
    }

    if (action === 'approve') {
        await prisma.loan.update({
            where: { id },
            data: { status: 'ACTIVE' }
        });
    } else if (action === 'reject') {
        await prisma.loan.update({
            where: { id },
            data: { status: 'REJECTED' }
        });
    }

    return NextResponse.json({ success: true });
}
```

### NEW FILE: `components/loans/PendingLoanActions.tsx`

Client component with Approve/Reject buttons:

```tsx
<Button onClick={() => handleAction('approve')} className="bg-green-600 hover:bg-green-700">
    <CheckCircle className="h-4 w-4 mr-2" />
    Approve Loan
</Button>
<Button onClick={() => handleAction('reject')} variant="outline" className="border-red-300 text-red-700">
    <XCircle className="h-4 w-4 mr-2" />
    Reject
</Button>
```

### MODIFIED: `app/(dashboard)/loans/[id]/page.tsx`

Added PendingLoanActions for lenders:

```tsx
import { PendingLoanActions } from "@/components/loans/PendingLoanActions";

// In JSX:
{loan.status === 'PENDING' && isLender && (
    <PendingLoanActions 
        loanId={loan.id}
        borrowerName={displayName}
        amount={loan.amount}
    />
)}
```

### MODIFIED: `components/layout/Sidebar.tsx`

Added navigation items:

```tsx
import { ..., Users, HandCoins } from "lucide-react";

const mainNavItems = [
    // ... existing items
    {
        title: "Request Loan",
        href: "/borrow",
        icon: HandCoins
    },
    {
        title: "Borrowers",
        href: "/borrowers",
        icon: Users
    },
];
```

---

## Database Changes

**No schema changes required** - All features use existing Prisma schema fields:

| Model | Field | Usage |
|-------|-------|-------|
| User | `isIdVerified` | Set to `true` after Aadhaar verification |
| User | `trustScore` | Set to `50` after verification |
| User | `phoneNumber` | Collected during registration |
| Loan | `status` | Uses `PENDING`, `ACTIVE`, `REJECTED` |
| Verification | `idType`, `idNumber`, `idVerified` | Stores Aadhaar details |
| TrustScoreHistory | All fields | Records initial 50-point score |

---

## How to Apply These Changes

1. **Copy/Create all new files** listed in sections 6-8
2. **Modify existing files** as shown in each section
3. **No database migration needed**
4. **Restart dev server**: `npm run dev`

---

## User Flows

### Borrower Registration Flow
1. User clicks "Request Loan" → `/borrow`
2. Sees "Verification Required" → Clicks "Complete Verification"
3. Goes to `/borrowers/register` → Fills Step 1: Basic Info
4. Clicks "Continue to Verification" → "Verify with DigiLocker"
5. Redirected to `/digilocker` → Enters Aadhaar + OTP
6. Reviews consent → Success → Returns to registration
7. Sees verified details + Trust Score: 50
8. Clicks "Complete Registration" → Redirected to dashboard

### Loan Request Flow
1. Verified borrower goes to `/borrow`
2. Fills form: Amount, Date, Purpose, Urgency
3. Clicks "Submit Loan Request"
4. Request appears as **Pending** in "My Loan Requests"
5. Lender receives 🔔 notification
6. Lender clicks → Views loan → Approves/Rejects
7. Borrower sees status update

---

## Testing Checklist

- [ ] Register as borrower with DigiLocker flow
- [ ] Verify trust score is set to 50
- [ ] Submit loan request as verified borrower
- [ ] Check lender receives notification
- [ ] Approve/reject loan as lender
- [ ] Verify status updates in "My Loan Requests"
- [ ] Unique constraint errors resolved in layout
- [ ] NaN error fixed in InstallmentManager
- [ ] View uploaded document links work
- [ ] LinkPe QR code URLs generate correctly
- [ ] Contract PDF includes payment schedule
- [ ] Export Contract UPI dialog works correctly

---

## 9. Export Contract UPI Dialog

**Goal**: Add a dialog popup to collect Payee UPI ID before generating the contract PDF, ensuring the LinkPe payment link includes the correct `pa` parameter.

### MODIFIED: `components/loans/ContractExportButton.tsx`

Complete rewrite with Dialog component:

```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { FileDown, Loader2 } from "lucide-react";
import { jsPDF } from "jspdf";
import { format } from "date-fns";

// State for dialog and UPI ID
const [isDialogOpen, setIsDialogOpen] = useState(false);
const [upiId, setUpiId] = useState("");
const [isGenerating, setIsGenerating] = useState(false);

// Button opens dialog instead of generating directly
<Button variant="outline" size="sm" onClick={() => setIsDialogOpen(true)}>
    <FileDown className="mr-2 h-4 w-4" />
    Export Contract
</Button>

// Dialog content with UPI input
<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
    <DialogContent className="sm:max-w-md">
        <DialogHeader>
            <DialogTitle>Export Loan Contract</DialogTitle>
            <DialogDescription>
                Enter the Lender's UPI ID to include a payment link in the contract PDF.
            </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
            <div className="space-y-2">
                <Label htmlFor="upi-id">Payee UPI ID</Label>
                <Input
                    id="upi-id"
                    placeholder="e.g., yourname@okicici"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                    This will generate a LinkPe payment link in the PDF contract.
                </p>
            </div>

            {/* Loan summary preview */}
            <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-1">
                <p><strong>Lender:</strong> {lenderName}</p>
                <p><strong>Amount:</strong> ₹{loan.amount.toLocaleString()}</p>
                <p><strong>Due:</strong> {format(new Date(loan.dueDate), "MMMM d, yyyy")}</p>
            </div>
        </div>

        <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
            </Button>
            <Button onClick={handleExport} disabled={isGenerating}>
                {isGenerating ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                    </>
                ) : (
                    <>
                        <FileDown className="mr-2 h-4 w-4" />
                        Generate PDF
                    </>
                )}
            </Button>
        </DialogFooter>
    </DialogContent>
</Dialog>
```

### PDF Generation with UPI Link

The `handleExport` function now includes the UPI ID in the LinkPe URL:

```typescript
// Payment Link Section in PDF
if (upiId) {
    const linkPeUrl = `https://ptprashanttripathi.github.io/linkpe/?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(lenderName)}&amt=${loan.amount}&cu=INR`;
    
    doc.text("Pay using UPI:", leftMargin, y);
    y += 8;
    
    // Clickable link in PDF
    doc.setTextColor(0, 0, 255);
    doc.textWithLink("Click here to pay via LinkPe", leftMargin, y, { url: linkPeUrl });
    doc.setTextColor(0, 0, 0);
    y += 8;

    doc.setFontSize(9);
    doc.text(`UPI ID: ${upiId}`, leftMargin, y);
    y += 6;
    doc.text(`URL: ${linkPeUrl}`, leftMargin, y, { maxWidth: 170 });
}
```

### Features Added:
- ✅ Dialog popup before PDF generation
- ✅ UPI ID input field with placeholder
- ✅ Loan summary preview (lender, amount, due date)
- ✅ Loading state while generating
- ✅ Cancel button to close dialog
- ✅ LinkPe URL with `pa` parameter (Payee Address)
- ✅ Clickable payment link in PDF
- ✅ Installments table if available
- ✅ Currency in ₹ (Rupees)

