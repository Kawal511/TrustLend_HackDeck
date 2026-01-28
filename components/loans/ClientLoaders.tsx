"use client";

import dynamic from "next/dynamic";

// Dynamic imports to avoid hydration mismatch with Radix UI Dialogs by forcing client-side rendering
export const ClientRepaymentForm = dynamic(() => import("./RepaymentForm").then(mod => mod.RepaymentForm), { ssr: false });
export const ClientContractExportButton = dynamic(() => import("./ContractExportButton").then(mod => mod.ContractExportButton), { ssr: false });
export const ClientRemindersDisplay = dynamic(() => import("./RemindersDisplay").then(mod => mod.RemindersDisplay), { ssr: false });
export const ClientRaiseDisputeButton = dynamic(() => import("./RaiseDisputeButton").then(mod => mod.RaiseDisputeButton), { ssr: false });
