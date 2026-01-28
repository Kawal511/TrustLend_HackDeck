// API route for loan templates - GET all templates, POST create new template
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's custom templates
    const userTemplates = await prisma.loanTemplate.findMany({
      where: { userId },
      orderBy: [
        { isDefault: 'desc' },
        { useCount: 'desc' },
        { updatedAt: 'desc' }
      ]
    });

    // Get system templates
    const systemTemplates = await prisma.systemTemplate.findMany({
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({
      userTemplates,
      systemTemplates
    });
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, amount, purpose, daysUntilDue, isDefault } = body;

    if (!name || !amount || !purpose || !daysUntilDue) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await prisma.loanTemplate.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false }
      });
    }

    const template = await prisma.loanTemplate.create({
      data: {
        userId,
        name,
        amount: parseFloat(amount),
        purpose,
        daysUntilDue: parseInt(daysUntilDue),
        isDefault: isDefault || false
      }
    });

    return NextResponse.json({
      success: true,
      template
    });
  } catch (error) {
    console.error("Error creating template:", error);
    return NextResponse.json(
      { error: "Failed to create template" },
      { status: 500 }
    );
  }
}
