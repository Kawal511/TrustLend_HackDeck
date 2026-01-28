import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedSystemTemplates() {
  console.log('🌱 Seeding system templates...');

  const systemTemplates = [
    {
      name: 'Emergency Loan',
      description: 'Quick assistance for unexpected expenses',
      amount: 500,
      purpose: 'Emergency medical expenses, car repair, or urgent bill payment',
      daysUntilDue: 30,
      icon: '🚨',
      category: 'Emergency'
    },
    {
      name: 'Small Personal Loan',
      description: 'For everyday personal needs',
      amount: 1000,
      purpose: 'Personal expenses, small purchases, or household needs',
      daysUntilDue: 60,
      icon: '💰',
      category: 'Personal'
    },
    {
      name: 'Education Loan',
      description: 'Support for tuition and course fees',
      amount: 3000,
      purpose: 'Tuition fees, course materials, or educational expenses',
      daysUntilDue: 90,
      icon: '🎓',
      category: 'Education'
    },
    {
      name: 'Business Advance',
      description: 'Quick capital for business needs',
      amount: 5000,
      purpose: 'Business inventory, equipment, or operational expenses',
      daysUntilDue: 60,
      icon: '💼',
      category: 'Business'
    },
    {
      name: 'Medical Expenses',
      description: 'Healthcare and medical bills',
      amount: 2000,
      purpose: 'Medical treatment, surgery costs, or healthcare bills',
      daysUntilDue: 45,
      icon: '🏥',
      category: 'Medical'
    },
    {
      name: 'Home Improvement',
      description: 'Repairs and home upgrades',
      amount: 4000,
      purpose: 'Home repairs, renovations, or furniture purchase',
      daysUntilDue: 90,
      icon: '🏠',
      category: 'Personal'
    },
    {
      name: 'Travel Loan',
      description: 'Funding for trips and vacations',
      amount: 2500,
      purpose: 'Travel expenses, vacation costs, or trip planning',
      daysUntilDue: 60,
      icon: '✈️',
      category: 'Travel'
    },
    {
      name: 'Wedding Expenses',
      description: 'Support for wedding costs',
      amount: 8000,
      purpose: 'Wedding ceremony, reception, or related expenses',
      daysUntilDue: 120,
      icon: '💒',
      category: 'Personal'
    },
    {
      name: 'Vehicle Purchase',
      description: 'Help with buying a vehicle',
      amount: 10000,
      purpose: 'Car, motorcycle, or vehicle down payment',
      daysUntilDue: 180,
      icon: '🚗',
      category: 'Personal'
    },
    {
      name: 'Debt Consolidation',
      description: 'Combine multiple debts',
      amount: 6000,
      purpose: 'Paying off credit cards or consolidating multiple loans',
      daysUntilDue: 120,
      icon: '📊',
      category: 'Personal'
    },
    {
      name: 'Tech Equipment',
      description: 'Computer and tech purchases',
      amount: 1500,
      purpose: 'Laptop, phone, or essential technology equipment',
      daysUntilDue: 60,
      icon: '💻',
      category: 'Personal'
    },
    {
      name: 'Starting a Side Hustle',
      description: 'Launch your new venture',
      amount: 3500,
      purpose: 'Initial capital for starting a side business or freelance work',
      daysUntilDue: 90,
      icon: '🚀',
      category: 'Business'
    }
  ];

  for (const template of systemTemplates) {
    await prisma.systemTemplate.upsert({
      where: { name: template.name },
      update: template,
      create: template
    });
  }

  console.log(`✅ Created/updated ${systemTemplates.length} system templates`);
}

async function main() {
  try {
    await seedSystemTemplates();
    console.log('🎉 System templates seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding system templates:', error);
    throw error;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
