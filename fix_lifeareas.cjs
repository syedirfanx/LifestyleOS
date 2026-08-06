const fs = require('fs');

let code = fs.readFileSync('./src/data/lifeAreasData.ts', 'utf-8');

const recurringExpensesCode = `
  {
    id: 'recurring-expenses',
    name: '💳 Recurring Expenses',
    icon: 'CreditCard',
    description: 'Track ongoing subscriptions, utilities, and rental commitments.',
    subCategories: [
      {
        id: 'housing',
        name: 'Housing',
        defaultTitle: 'My Housing Expenses',
        description: 'Rent, parking, and storage units',
        exampleItems: [
          { name: 'Apartment Rent', estimatedPrice: 25000 },
          { name: 'Parking Rent', estimatedPrice: 2000 },
        ],
      },
      {
        id: 'utilities',
        name: 'Utilities',
        defaultTitle: 'My Utilities',
        description: 'Electricity, water, gas, internet, and mobile',
        exampleItems: [
          { name: 'Electricity', estimatedPrice: 3500 },
          { name: 'Internet', estimatedPrice: 1500 },
        ],
      },
      {
        id: 'subscriptions',
        name: 'Subscriptions',
        defaultTitle: 'My Digital Subscriptions',
        description: 'Netflix, Spotify, AI tools, and software',
        exampleItems: [
          { name: 'Netflix', estimatedPrice: 500 },
          { name: 'Spotify', estimatedPrice: 200 },
        ],
      },
      {
        id: 'memberships',
        name: 'Memberships',
        defaultTitle: 'My Memberships',
        description: 'Gym, swimming, and co-working spaces',
        exampleItems: [
          { name: 'Gym Membership', estimatedPrice: 3000 },
        ],
      },
      {
        id: 'insurance',
        name: 'Insurance',
        defaultTitle: 'My Insurance Policies',
        description: 'Health, life, and vehicle insurance',
        exampleItems: [
          { name: 'Health Insurance', estimatedPrice: 12000 },
        ],
      },
      {
        id: 'education',
        name: 'Education',
        defaultTitle: 'My Education Subscriptions',
        description: 'Coursera, Udemy, and online learning',
        exampleItems: [
          { name: 'Coursera Plus', estimatedPrice: 4000 },
        ],
      },
      {
        id: 'healthcare',
        name: 'Healthcare',
        defaultTitle: 'My Healthcare Plans',
        description: 'Doctor subscriptions, medical plans',
        exampleItems: [
          { name: 'Health Checkup Plan', estimatedPrice: 2000 },
        ],
      },
    ],
  },
`;

const lastBracketIndex = code.lastIndexOf('];');
if (lastBracketIndex !== -1) {
  code = code.slice(0, lastBracketIndex) + recurringExpensesCode + code.slice(lastBracketIndex);
}

fs.writeFileSync('./src/data/lifeAreasData.ts', code);
console.log('Added recurring expenses.');
