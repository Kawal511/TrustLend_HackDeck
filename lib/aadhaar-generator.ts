// lib/aadhaar-generator.ts

export interface AadhaarData {
    name: string;
    aadhaarNumber: string;
    dob: string;
    gender: string;
    address: string;
    photo: string;
}

export function generateDummyAadhaar(userData?: Partial<AadhaarData>): AadhaarData {
    const randomAadhaar = Array.from({ length: 12 }, () =>
        Math.floor(Math.random() * 10)
    ).join('');

    return {
        name: userData?.name || 'JOHN DOE',
        aadhaarNumber: userData?.aadhaarNumber || randomAadhaar,
        dob: userData?.dob || '01/01/1990',
        gender: userData?.gender || 'Male',
        address: userData?.address || 'House No. 123, Street Name, City - 400001, Maharashtra',
        photo: userData?.photo || '/placeholder-avatar.png'
    };
}

export function formatAadhaarNumber(aadhaar: string): string {
    return aadhaar.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3');
}

export function maskAadhaarNumber(aadhaar: string): string {
    return aadhaar.replace(/(\d{4})(\d{4})(\d{4})/, 'XXXX XXXX $3');
}
