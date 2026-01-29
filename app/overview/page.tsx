"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Home, Users, Code, LineChart, TrendingUp, DollarSign, PieChart, Smartphone, Shield, Lock, Search, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Custom SVG Line Chart for Market Growth
const MarketGrowthChart = () => (
    <div className="relative h-48 w-full">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-xs text-gray-400">
            <span>$500B</span>
            <span>$300B</span>
            <span>$100B</span>
            <span>$0</span>
        </div>
        {/* Chart */}
        <div className="ml-10 h-full border-l border-b border-black/10 relative">
            <svg className="w-full h-full p-2" preserveAspectRatio="none">
                {/* Grid lines */}
                <line x1="0" y1="0%" x2="100%" y2="0%" stroke="rgba(0,0,0,0.05)" strokeDasharray="4 4" />
                <line x1="0" y1="33%" x2="100%" y2="33%" stroke="rgba(0,0,0,0.05)" strokeDasharray="4 4" />
                <line x1="0" y1="66%" x2="100%" y2="66%" stroke="rgba(0,0,0,0.05)" strokeDasharray="4 4" />

                {/* Trend line */}
                <path
                    d="M0,150 C50,140 100,120 150,80 S250,20 300,10"
                    fill="none"
                    stroke="#000"
                    strokeWidth="3"
                />
                {/* Area under curve */}
                <path
                    d="M0,150 C50,140 100,120 150,80 S250,20 300,10 V160 H0 Z"
                    fill="url(#gradient)"
                    opacity="0.2"
                />
                <defs>
                    <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#000" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#000" stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Data points */}
                <circle cx="0%" cy="88%" r="4" fill="#000" />
                <circle cx="33%" cy="65%" r="4" fill="#000" />
                <circle cx="66%" cy="35%" r="4" fill="#000" />
                <circle cx="100%" cy="5%" r="4" fill="#000" />
            </svg>

            {/* X-axis labels */}
            <div className="absolute bottom-[-24px] left-0 right-0 flex justify-between text-xs text-gray-500 font-bold w-full px-2">
                <span>2024</span>
                <span>2025</span>
                <span>2026</span>
                <span>2028</span>
            </div>
        </div>
    </div>
);

// Custom SVG Bar Chart for Revenue Streams
const RevenueChart = () => (
    <div className="relative h-48 w-full flex items-end justify-around gap-4 pb-6 border-b border-black/10">
        <div className="flex flex-col items-center gap-2 group w-1/3">
            <div className="w-full bg-yellow-100 rounded-t-lg border-x-2 border-t-2 border-black relative h-16 group-hover:h-20 transition-all duration-500">
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 font-bold text-xs opacity-0 group-hover:opacity-100 transition-opacity">Free</span>
            </div>
            <span className="text-xs font-bold text-gray-500">Freemium</span>
        </div>
        <div className="flex flex-col items-center gap-2 group w-1/3">
            <div className="w-full bg-blue-100 rounded-t-lg border-x-2 border-t-2 border-black relative h-32 group-hover:h-36 transition-all duration-500">
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 font-bold text-xs opacity-0 group-hover:opacity-100 transition-opacity">$15/mo</span>
            </div>
            <span className="text-xs font-bold text-gray-500">Premium</span>
        </div>
        <div className="flex flex-col items-center gap-2 group w-1/3">
            <div className="w-full bg-green-100 rounded-t-lg border-x-2 border-t-2 border-black relative h-24 group-hover:h-28 transition-all duration-500">
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 font-bold text-xs opacity-0 group-hover:opacity-100 transition-opacity">1.5%</span>
            </div>
            <span className="text-xs font-bold text-gray-500">Fees</span>
        </div>
    </div>
);

export default function OverviewPage() {
    const [currSlide, setCurrSlide] = useState(0);

    const slides = [
        // Slide 1: Team & Intro
        {
            title: "Project & Team",
            icon: Users,
            content: (
                <div className="space-y-8">
                    <div className="text-center space-y-4">
                        <h2 className="text-3xl font-black">TrustLend</h2>
                        <p className="text-xl text-gray-600">Lend with Clarity, Repay with Dignity</p>
                        <p className="max-w-2xl mx-auto text-gray-500">
                            A decentralized peer-to-peer lending platform powered by social trust scores and AI-driven smart contracts.
                            We bridge the gap between informal lending and formal credit systems.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                        {[
                            { name: "Atharva Deo", role: "Team Lead" },
                            { name: "Prapti Kambli", role: "Frontend" },
                            { name: "Kawaljeet Singh", role: "Backend" },
                            { name: "Akshat Bhalani", role: "ML Engineer" }
                        ].map((member) => (
                            <Card key={member.name} className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
                                <CardContent className="p-6 text-center">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center font-bold text-xl border-2 border-black">
                                        {member.name.charAt(0)}
                                    </div>
                                    <h3 className="font-bold text-lg">{member.name}</h3>
                                    <p className="text-sm text-gray-500">{member.role}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Project Preview */}
                    <div className="mt-8 border-2 border-black rounded-xl overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <img src="/assets/landing-hero.png" alt="TrustLend Dashboard Preview" className="w-full h-64 object-cover object-top" />
                    </div>
                </div>
            )
        },
        // Slide 2: Tech & Architecture
        {
            title: "Tech Stack & Architecture",
            icon: Code,
            content: (
                <div className="space-y-6">
                    {/* Tech Stack Grid */}
                    <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <CardContent className="p-6">
                            <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                                <Code className="h-5 w-5" />
                                Modern Tech Stack
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div>
                                    <h4 className="font-bold text-xs text-gray-400 uppercase tracking-wider mb-2">Frontend Core</h4>
                                    <ul className="space-y-1.5 text-sm">
                                        <li className="flex items-center gap-2 font-medium"><span className="w-1.5 h-1.5 bg-black rounded-full" />Next.js 16 (Turbopack)</li>
                                        <li className="flex items-center gap-2 text-gray-600"><span className="w-1.5 h-1.5 bg-gray-300 rounded-full" />React 19</li>
                                        <li className="flex items-center gap-2 text-gray-600"><span className="w-1.5 h-1.5 bg-gray-300 rounded-full" />Tailwind CSS 4</li>
                                        <li className="flex items-center gap-2 text-gray-600"><span className="w-1.5 h-1.5 bg-gray-300 rounded-full" />Framer Motion</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-bold text-xs text-gray-400 uppercase tracking-wider mb-2">Backend & Data</h4>
                                    <ul className="space-y-1.5 text-sm">
                                        <li className="flex items-center gap-2 font-medium"><span className="w-1.5 h-1.5 bg-black rounded-full" />Prisma ORM 6</li>
                                        <li className="flex items-center gap-2 text-gray-600"><span className="w-1.5 h-1.5 bg-gray-300 rounded-full" />PostgreSQL (Neon)</li>
                                        <li className="flex items-center gap-2 text-gray-600"><span className="w-1.5 h-1.5 bg-gray-300 rounded-full" />Clerk Auth</li>
                                        <li className="flex items-center gap-2 text-gray-600"><span className="w-1.5 h-1.5 bg-gray-300 rounded-full" />Server Actions</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-bold text-xs text-gray-400 uppercase tracking-wider mb-2">AI Services</h4>
                                    <ul className="space-y-1.5 text-sm">
                                        <li className="flex items-center gap-2 font-medium"><span className="w-1.5 h-1.5 bg-black rounded-full" />DigiLocker (Verification)</li>
                                        <li className="flex items-center gap-2 text-gray-600"><span className="w-1.5 h-1.5 bg-gray-300 rounded-full" />Groq (Llama 3)</li>
                                        <li className="flex items-center gap-2 text-gray-600"><span className="w-1.5 h-1.5 bg-gray-300 rounded-full" />Bolna (Voice AI)</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-bold text-xs text-gray-400 uppercase tracking-wider mb-2">Integrations</h4>
                                    <ul className="space-y-1.5 text-sm">
                                        <li className="flex items-center gap-2 text-gray-600"><span className="w-1.5 h-1.5 bg-gray-300 rounded-full" />Resend (Email)</li>
                                        <li className="flex items-center gap-2 text-gray-600"><span className="w-1.5 h-1.5 bg-gray-300 rounded-full" />Google Calendar</li>
                                        <li className="flex items-center gap-2 text-gray-600"><span className="w-1.5 h-1.5 bg-gray-300 rounded-full" />UPI QR Codes</li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Visual Architecture Diagram */}
                    <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-gray-50">
                        <CardContent className="p-6">
                            <h3 className="font-bold text-xl mb-6 text-center">System Architecture</h3>
                            <div className="relative flex flex-col items-center justify-center gap-8 py-4">

                                {/* Client Layer */}
                                <div className="flex gap-8 relative z-10 w-full justify-center">
                                    <div className="flex flex-col items-center bg-white p-4 rounded-xl border-2 border-black shadow-sm w-32">
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-2 border border-black"><Users className="h-5 w-5" /></div>
                                        <span className="font-bold text-xs">Web Client</span>
                                    </div>
                                    <div className="flex flex-col items-center bg-white p-4 rounded-xl border-2 border-black shadow-sm w-32 opacity-50">
                                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mb-2 border border-black"><Smartphone className="h-5 w-5" /></div>
                                        <span className="font-bold text-xs">Mobile PWA</span>
                                    </div>
                                </div>

                                {/* Flow Arrow */}
                                <div className="h-8 w-0.5 bg-gray-300 relative">
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 py-1 text-[10px] font-bold border border-gray-200 rounded-full text-gray-500 whitespace-nowrap">HTTPS / JSON</div>
                                </div>

                                {/* Server Layer */}
                                <div className="border-2 border-dashed border-gray-300 p-6 rounded-2xl bg-white/50 w-full max-w-2xl relative">
                                    <span className="absolute -top-3 left-6 bg-gray-100 px-3 py-1 text-xs font-bold text-gray-500 border border-gray-200 rounded-full">Next.js Server Actions</span>

                                    <div className="grid grid-cols-3 gap-4">
                                        {/* Core Services */}
                                        <div className="col-span-1 space-y-3">
                                            <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm text-xs font-bold text-center flex items-center justify-center gap-2">
                                                <div className="w-2 h-2 bg-green-500 rounded-full"></div> Auth (Clerk)
                                            </div>
                                            <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm text-xs font-bold text-center flex items-center justify-center gap-2">
                                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div> Trust Engine
                                            </div>
                                        </div>

                                        {/* AI Orchestrator */}
                                        <div className="col-span-1 border-2 border-black bg-black text-white p-4 rounded-xl flex flex-col items-center justify-center text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
                                            <Code className="h-6 w-6 mb-2" />
                                            <span className="font-black text-sm">AI Layer</span>
                                            <span className="text-[10px] text-gray-400 mt-1">Orchestration</span>
                                        </div>

                                        {/* External Services */}
                                        <div className="col-span-1 space-y-3">
                                            <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm text-xs text-center text-gray-500">
                                                DigiLocker Verify
                                            </div>
                                            <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm text-xs text-center text-gray-500">
                                                Groq Contracts
                                            </div>
                                            <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm text-xs text-center text-gray-500">
                                                Bolna Voice
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Flow Arrow */}
                                <div className="h-8 w-0.5 bg-gray-300"></div>

                                {/* Data Layer */}
                                <div className="flex gap-4 w-full justify-center">
                                    <div className="bg-white px-6 py-3 rounded-xl border-2 border-black shadow-sm flex items-center gap-3">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                        <div className="text-left">
                                            <div className="font-bold text-xs">PostgreSQL</div>
                                            <div className="text-[10px] text-gray-500">Neon DB (Serverless)</div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </CardContent>
                    </Card>
                    {/* Trust & Security Engine */}
                    <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <CardContent className="p-6">
                            <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Trust & Security Engine
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Trust Score Logic */}
                                <div className="space-y-3">
                                    <h4 className="font-bold text-sm text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-1">Trust Score (0-150)</h4>
                                    <div className="space-y-2">
                                        {[
                                            { tier: 'Bronze', range: '0-49', color: 'bg-amber-600' },
                                            { tier: 'Silver', range: '50-79', color: 'bg-slate-400' },
                                            { tier: 'Gold', range: '80-109', color: 'bg-yellow-400' },
                                            { tier: 'Diamond', range: '140+', color: 'bg-cyan-400' }
                                        ].map(t => (
                                            <div key={t.tier} className="flex items-center justify-between text-xs font-medium bg-gray-50 p-2 rounded border border-gray-100">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${t.color}`}></div>
                                                    {t.tier}
                                                </div>
                                                <span className="text-gray-500">{t.range}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="text-[10px] text-gray-500 mt-2 bg-yellow-50 p-2 rounded border border-yellow-200">
                                        <span className="font-bold text-black">Events: </span>
                                        Repayment (+10), Late (-5), Dispute (-15)
                                    </div>
                                </div>

                                {/* Fraud Detection */}
                                <div className="space-y-3">
                                    <h4 className="font-bold text-sm text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-1">Fraud Shield</h4>
                                    <div className="space-y-2">
                                        {[
                                            { label: 'Velocity Abuse', desc: 'Too many requests' },
                                            { label: 'Circular Lending', desc: 'Loop detection' },
                                            { label: 'Amount Anomaly', desc: 'Outlier requests' },
                                            { label: 'Identity Spoofing', desc: 'OCR verification' }
                                        ].map((check, i) => (
                                            <div key={i} className="flex items-center gap-2 text-xs p-2 bg-red-50 text-red-900 rounded border border-red-100">
                                                <Lock className="h-3 w-3 flex-shrink-0" />
                                                <div>
                                                    <span className="font-bold">{check.label}</span>
                                                    <span className="block text-[10px] opacity-75">{check.desc}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Verification Workflow */}
                                <div className="space-y-3">
                                    <h4 className="font-bold text-sm text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-1">Verification Pipeline</h4>
                                    <div className="relative border-l-2 border-dashed border-gray-200 ml-2 space-y-4 py-1">
                                        <div className="flex items-start gap-2 ml-4 relative">
                                            <div className="w-2 h-2 bg-black rounded-full absolute -left-[21px] top-1.5 ring-4 ring-white"></div>
                                            <div className="bg-white border border-gray-200 rounded p-2 text-xs shadow-sm flex-1">
                                                <div className="font-bold flex items-center gap-1"><Smartphone className="h-3 w-3" /> User Upload</div>
                                                <div className="text-gray-500 text-[10px]">Aadhaar / PAN / ITR</div>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2 ml-4 relative">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full absolute -left-[21px] top-1.5 ring-4 ring-white"></div>
                                            <div className="bg-blue-50 border border-blue-100 text-blue-900 rounded p-2 text-xs shadow-sm flex-1">
                                                <div className="font-bold flex items-center gap-1"><Search className="h-3 w-3" /> DigiLocker</div>
                                                <div className="opacity-75 text-[10px]">Document Verification</div>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2 ml-4 relative">
                                            <div className="w-2 h-2 bg-green-500 rounded-full absolute -left-[21px] top-1.5 ring-4 ring-white"></div>
                                            <div className="bg-green-50 border border-green-100 text-green-900 rounded p-2 text-xs shadow-sm flex-1">
                                                <div className="font-bold flex items-center gap-1"><FileText className="h-3 w-3" /> Confidence Score</div>
                                                <div className="opacity-75 text-[10px]">AI validates document authenticity</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )
        },
        // Slide 3: Business & Analysis
        {
            title: "Business Model & Analysis",
            icon: LineChart,
            content: (
                <div className="space-y-6">
                    {/* Top Row: Metrics and Revenue */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-bold text-lg flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5" />
                                        Market Growth (TAM)
                                    </h3>
                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-bold">+18.5% CAGR</span>
                                </div>
                                <MarketGrowthChart />
                                <p className="text-xs text-gray-500 mt-4 text-center">
                                    Global P2P Lending Market projected to reach $804B by 2028
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-bold text-lg flex items-center gap-2">
                                        <DollarSign className="h-5 w-5" />
                                        Revenue Streams
                                    </h3>
                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-bold">Hybrid Model</span>
                                </div>
                                <RevenueChart />
                                <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                                    <div>
                                        <p className="font-bold text-sm">User Growth</p>
                                        <p className="text-xs text-gray-500">Free Tier</p>
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm">SaaS</p>
                                        <p className="text-xs text-gray-500">Premium Tooling</p>
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm">Transaction</p>
                                        <p className="text-xs text-gray-500">Loan Success Fee</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Market Analysis & USPs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <CardContent className="p-6">
                                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5" />
                                    5 Key USPs
                                </h3>
                                <ul className="space-y-3">
                                    {[
                                        "Zero-Collateral Trust-Based Lending",
                                        "AI-Generated Legally Binding Contracts",
                                        "Automated Voice Call Repayment Reminders",
                                        "Gamified Credit Building (Trust Score)",
                                        "Instant KYC with DigiLocker Integration"
                                    ].map((usp, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm">
                                            <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</div>
                                            <span className="font-medium">{usp}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>

                        <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <CardContent className="p-6">
                                <h3 className="font-black text-lg mb-4 flex items-center gap-2">
                                    <PieChart className="h-5 w-5" />
                                    Unique Market Features
                                </h3>
                                <div className="space-y-4">
                                    <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                                        <div className="font-bold text-xs uppercase tracking-wider text-yellow-800 mb-1">Social Graph Analysis</div>
                                        <p className="text-sm text-gray-600">Unlike banks, we use your social connections and repayment history to verify credibility.</p>
                                    </div>
                                    <div className="bg-purple-50 border border-purple-200 p-3 rounded-lg">
                                        <div className="font-bold text-xs uppercase tracking-wider text-purple-800 mb-1">Hybrid Arbitration</div>
                                        <p className="text-sm text-gray-600">AI-first dispute resolution with a human fallback layer for complex cases.</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Detailed SWOT */}
                    <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <CardContent className="p-6 bg-gray-50">
                            <h3 className="font-black text-2xl mb-6 text-center tracking-tight flex items-center justify-center gap-2">
                                <Shield className="h-6 w-6" />
                                Strategic Analysis (SWOT)
                            </h3>
                            {/* ... SWOT Content ... */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Strengths */}
                                <div className="bg-white p-4 rounded-xl border border-black/10 hover:border-black/30 transition-colors">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-2 h-8 bg-green-500 rounded-full" />
                                        <h4 className="font-black text-lg text-green-900">Strengths</h4>
                                    </div>
                                    <ul className="text-sm space-y-2 text-gray-600 ml-4 list-disc marker:text-green-500">
                                        <li><span className="font-bold text-black">Proprietary Trust Score:</span> Unique social graph algorithm incorporating repayment history.</li>
                                        <li><span className="font-bold text-black">AI Contracts:</span> Zero-cost legal framework generation using Gemini.</li>
                                        <li><span className="font-bold text-black">User Experience:</span> Frictionless, neo-brutalist UI targeting Gen-Z.</li>
                                    </ul>
                                </div>

                                {/* Weaknesses */}
                                <div className="bg-white p-4 rounded-xl border border-black/10 hover:border-black/30 transition-colors">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-2 h-8 bg-red-500 rounded-full" />
                                        <h4 className="font-black text-lg text-red-900">Weaknesses</h4>
                                    </div>
                                    <ul className="text-sm space-y-2 text-gray-600 ml-4 list-disc marker:text-red-500">
                                        <li><span className="font-bold text-black">Cold Start Problem:</span> Need initial critical mass for network effects.</li>
                                        <li><span className="font-bold text-black">Verification Costs:</span> DigiLocker/Aadhaar verification costs at scale.</li>
                                    </ul>
                                </div>

                                {/* Opportunities */}
                                <div className="bg-white p-4 rounded-xl border border-black/10 hover:border-black/30 transition-colors">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-2 h-8 bg-blue-500 rounded-full" />
                                        <h4 className="font-black text-lg text-blue-900">Opportunities</h4>
                                    </div>
                                    <ul className="text-sm space-y-2 text-gray-600 ml-4 list-disc marker:text-blue-500">
                                        <li><span className="font-bold text-black">Fintech APIs:</span> Integration with UPI apps (GPay, PhonePe) for seamless repayment.</li>
                                        <li><span className="font-bold text-black">SME Lending:</span> Expanding to micro-business loans for street vendors.</li>
                                        <li><span className="font-bold text-black">Account Aggregators:</span> Utilizing AA framework for better credit assessment.</li>
                                    </ul>
                                </div>

                                {/* Threats */}
                                <div className="bg-white p-4 rounded-xl border border-black/10 hover:border-black/30 transition-colors">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-2 h-8 bg-orange-500 rounded-full" />
                                        <h4 className="font-black text-lg text-orange-900">Threats</h4>
                                    </div>
                                    <ul className="text-sm space-y-2 text-gray-600 ml-4 list-disc marker:text-orange-500">
                                        <li><span className="font-bold text-black">Regulation:</span> Changing RBI guidelines on P2P lending platforms.</li>
                                        <li><span className="font-bold text-black">Big Players:</span> Traditional banks launching "Buy Now Pay Later" affecting micro-loans.</li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )
        }
    ];

    const nextSlide = () => setCurrSlide((p) => Math.min(p + 1, slides.length - 1));
    const prevSlide = () => setCurrSlide((p) => Math.max(p - 1, 0));

    return (
        <div className="min-h-screen bg-white p-8 font-sans text-black">
            <div className="max-w-6xl mx-auto h-full flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <Link href="/">
                        <Button variant="outline" className="border-2 border-black hover:bg-black hover:text-white transition-colors rounded-xl font-bold">
                            <Home className="mr-2 h-4 w-4" />
                            Back to Home
                        </Button>
                    </Link>
                    <div className="flex gap-2">
                        {slides.map((_, idx) => (
                            <div
                                key={idx}
                                className={`w-3 h-3 rounded-full border border-black ${idx === currSlide ? 'bg-black' : 'bg-transparent'}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Slide Content */}
                <div className="flex-1 flex flex-col justify-center min-h-[600px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currSlide}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="mb-8 flex items-center gap-4">
                                <div className="bg-black text-white p-3 rounded-xl">
                                    {(() => {
                                        const IconComponent = slides[currSlide].icon;
                                        return IconComponent && <IconComponent className="h-8 w-8" />;
                                    })()}
                                </div>
                                <h1 className="text-4xl font-black tracking-tight">{slides[currSlide].title}</h1>
                            </div>

                            {slides[currSlide].content}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Controls */}
                <div className="flex justify-between items-center mt-12 border-t-2 border-gray-100 pt-8">
                    <Button
                        onClick={prevSlide}
                        disabled={currSlide === 0}
                        variant="outline"
                        className="border-2 border-black hover:bg-black hover:text-white transition-colors rounded-xl font-bold h-12 px-6 disabled:opacity-30"
                    >
                        <ChevronLeft className="mr-2 h-5 w-5" />
                        Previous
                    </Button>
                    <Button
                        onClick={nextSlide}
                        disabled={currSlide === slides.length - 1}
                        className="bg-black text-white hover:bg-black/80 hover:scale-[1.02] transition-transform rounded-xl font-bold h-12 px-8 disabled:opacity-30 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none"
                    >
                        Next
                        <ChevronRight className="ml-2 h-5 w-5" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
// Presentation Slide
