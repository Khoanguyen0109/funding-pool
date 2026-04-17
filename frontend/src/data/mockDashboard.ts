export const MOCK_POOLS = [
  {
    id: '1',
    name: 'Household Fund',
    color: '#6C5CE7',
    icon: '🏠',
    balance: 4250.0,
    totalBudget: 6000,
    totalSpent: 3750,
    memberCount: 4,
  },
  {
    id: '2',
    name: 'Trip to Japan',
    color: '#00CEC9',
    icon: '✈️',
    balance: 2800.0,
    totalBudget: 5000,
    totalSpent: 2200,
    memberCount: 3,
  },
  {
    id: '3',
    name: 'Personal Savings',
    color: '#FDCB6E',
    icon: '💰',
    balance: 1500.0,
    totalBudget: 3000,
    totalSpent: 1500,
    memberCount: 1,
  },
];

export const MOCK_SUMMARY = {
  totalBalance: 8550,
  totalContributions: 15200,
  totalExpenses: 7450,
  poolCount: 3,
};

export const MOCK_CATEGORY_BUDGET = [
  { name: 'Groceries', budget: 1500, spent: 1320, remaining: 180 },
  { name: 'Rent', budget: 2000, spent: 2000, remaining: 0 },
  { name: 'Transport', budget: 600, spent: 450, remaining: 150 },
  { name: 'Dining', budget: 800, spent: 920, remaining: -120 },
  { name: 'Entertainment', budget: 500, spent: 380, remaining: 120 },
  { name: 'Utilities', budget: 400, spent: 350, remaining: 50 },
  { name: 'Shopping', budget: 700, spent: 530, remaining: 170 },
];

export const MOCK_MONTHLY_FLOW = [
  { month: 'Oct', contributions: 2400, expenses: 1800 },
  { month: 'Nov', contributions: 2600, expenses: 2100 },
  { month: 'Dec', contributions: 3100, expenses: 2900 },
  { month: 'Jan', contributions: 2200, expenses: 1950 },
  { month: 'Feb', contributions: 2500, expenses: 2300 },
  { month: 'Mar', contributions: 2400, expenses: 2100 },
];

export const MOCK_SPENDING_BREAKDOWN = [
  { name: 'Groceries', value: 1320, color: '#6C5CE7' },
  { name: 'Rent', value: 2000, color: '#00CEC9' },
  { name: 'Transport', value: 450, color: '#FDCB6E' },
  { name: 'Dining', value: 920, color: '#FF6B6B' },
  { name: 'Entertainment', value: 380, color: '#A29BFE' },
  { name: 'Utilities', value: 350, color: '#55EFC4' },
  { name: 'Shopping', value: 530, color: '#74B9FF' },
];

export const MOCK_MONTHLY_TRENDS = [
  { month: 'Oct', balance: 5200, savings: 600 },
  { month: 'Nov', balance: 5700, savings: 500 },
  { month: 'Dec', balance: 5900, savings: 200 },
  { month: 'Jan', balance: 6150, savings: 250 },
  { month: 'Feb', balance: 6350, savings: 200 },
  { month: 'Mar', balance: 8550, savings: 300 },
];
