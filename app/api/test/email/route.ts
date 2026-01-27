// Send a test email to verify Resend integration
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { email, loanDetails } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const { amount, dueDate, borrowerName } = loanDetails || {};

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
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>🎉 TrustLend Email Test</h2>
            </div>
            <div class="content">
              <p>Hi there!</p>
              <p>This is a <strong>test email</strong> from TrustLend to verify your email integration is working correctly.</p>
              ${amount ? `
                <div style="background: white; padding: 20px; border-radius: 6px; margin: 20px 0;">
                  <h3 style="margin-top: 0;">Sample Loan Details:</h3>
                  <p><strong>Borrower:</strong> ${borrowerName || 'Test User'}</p>
                  <p><strong>Amount:</strong> $${amount}</p>
                  <p><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</p>
                </div>
              ` : ''}
              <p>✅ If you received this email, your Resend integration is working perfectly!</p>
              <a href="http://localhost:3000" class="button">Go to TrustLend</a>
            </div>
            <div class="footer">
              <p>TrustLend - Lend with Clarity, Repay with Dignity</p>
              <p>This is an automated test email.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
      to: [email],
      subject: "🎉 TrustLend Email Test",
      html: htmlContent,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully!",
      emailId: data?.id,
    });
  } catch (error: any) {
    console.error("Error sending test email:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send test email" },
      { status: 500 }
    );
  }
}
