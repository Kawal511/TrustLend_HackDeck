// Test script for email and voice services
import "dotenv/config";
import { Resend } from "resend";
import axios from "axios";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const BOLNA_API_KEY = process.env.BOLNA_API_KEY;
const BOLNA_AGENT_ID = process.env.BOLNA_AGENT_ID;

// Test Email
async function testEmail() {
  console.log("\n🔵 Testing Email Service...");
  
  if (!RESEND_API_KEY) {
    console.error("❌ RESEND_API_KEY not found in environment");
    return;
  }

  try {
    const resend = new Resend(RESEND_API_KEY);
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4F46E5; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>🎉 TrustLend Email Test</h2>
            </div>
            <div class="content">
              <p>Hi Atharva!</p>
              <p>This is a <strong>test email</strong> from TrustLend backend terminal.</p>
              <div style="background: white; padding: 20px; border-radius: 6px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Sample Loan Details:</h3>
                <p><strong>Amount:</strong> $5,000</p>
                <p><strong>Due Date:</strong> Feb 15, 2026</p>
              </div>
              <p>✅ Email service is working correctly!</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const { data, error } = await resend.emails.send({
      from: "TrustLend <onboarding@resend.dev>",
      to: ["atharva.deo03@svkmmumbai.onmicrosoft.com"], // Must be account owner email in test mode
      subject: "🎉 TrustLend Terminal Test - Email Service [TO: atharvavdeo75@gmail.com]",
      html: htmlContent,
    });

    if (error) {
      console.error("❌ Resend error:", error);
      console.log("\n⚠️  NOTE: In Resend test mode, emails can only be sent to the account owner's email.");
      console.log("   To send to atharvavdeo75@gmail.com, verify a domain at resend.com/domains");
      return;
    }

    console.log("✅ Email sent successfully!");
    console.log("   📧 To: atharva.deo03@svkmmumbai.onmicrosoft.com (test mode)");
    console.log("   🎯 Target: atharvavdeo75@gmail.com (requires domain verification)");
    console.log("   📬 Email ID:", data?.id);
  } catch (error: any) {
    console.error("❌ Error sending email:", error.message);
  }
}

// Test Voice Call
async function testVoiceCall() {
  console.log("\n🔵 Testing Voice Call Service...");
  
  if (!BOLNA_API_KEY || !BOLNA_AGENT_ID) {
    console.error("❌ BOLNA_API_KEY or BOLNA_AGENT_ID not found in environment");
    return;
  }

  try {
    const response = await axios.post(
      "https://api.bolna.dev/call",
      {
        agent_id: BOLNA_AGENT_ID,
        recipient_phone_number: "+917021470357",
        from: process.env.BOLNA_PHONE_NUMBER || "+14155238886",
        metadata: {
          loanAmount: 5000,
          dueDate: "February 15, 2026",
          borrowerName: "Atharva",
          lenderName: "TrustLend Team",
          loanId: "test-terminal-" + Date.now(),
        },
      },
      {
        headers: {
          Authorization: `Bearer ${BOLNA_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Voice call initiated successfully!");
    console.log("   📞 To: +917021470357 (7021470357)");
    console.log("   🆔 Call ID:", response.data.call_id);
    console.log("   📊 Status:", response.data.status);
  } catch (error: any) {
    if (error.response) {
      console.error("❌ Bolna API error:", error.response.data);
      console.log("\n⚠️  NOTE: Trial accounts can only make calls to verified phone numbers.");
      console.log("   To call +917021470357 (7021470357), verify the number in your Bolna dashboard");
      console.log("   or upgrade to a paid account.");
    } else {
      console.error("❌ Error initiating call:", error.message);
    }
  }
}

// Run tests
async function runTests() {
  console.log("=".repeat(60));
  console.log("🧪 TrustLend Backend Services Test");
  console.log("=".repeat(60));
  
  await testEmail();
  await testVoiceCall();
  
  console.log("\n" + "=".repeat(60));
  console.log("✨ Tests completed!");
  console.log("=".repeat(60) + "\n");
}

runTests();
