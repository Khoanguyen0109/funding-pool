export type PoolType = 'private' | 'shared';
export type MemberRole = 'owner' | 'admin' | 'member' | 'viewer';
export type MemberStatus = 'pending' | 'active';
export type InviteType = 'link' | 'direct';
export type ExpenseStatus = 'logged' | 'pending_approval' | 'approved' | 'rejected';
export type OAuthProvider = 'google' | 'facebook';

export interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  oauthProvider?: OAuthProvider;
  createdAt: string;
  defaultPoolId?: string | null;
}

export interface Pool {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  currency?: string;
  type: PoolType;
  ownerId: string;
  requireApproval: boolean;
  approvalThreshold?: number;
  balance: number;
  createdAt: string;
  updatedAt: string;
  categories?: Category[];
  members?: PoolMembership[];
}

export interface PoolMembership {
  id: string;
  userId: string;
  poolId: string;
  role: MemberRole;
  status: MemberStatus;
  maxSpendWithoutApproval?: number;
  canInvite: boolean;
  canEditCategories: boolean;
  joinedAt: string;
  user?: User;
}

export interface Category {
  id: string;
  poolId: string;
  name: string;
  icon: string;
  budgetAmount: number;
  remaining: number;
  sortOrder: number;
  createdAt: string;
}

export interface Contribution {
  id: string;
  userId: string;
  poolId: string;
  amount: number;
  note?: string;
  createdAt: string;
  user?: User;
}

export interface Expense {
  id: string;
  userId: string;
  poolId: string;
  categoryId: string;
  amount: number;
  description: string;
  receiptUrl?: string;
  status: ExpenseStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  user?: User;
  category?: Category;
}

export interface Invite {
  id: string;
  poolId: string;
  invitedBy: string;
  invitedByUser?: User;
  token: string;
  type: InviteType;
  role: Exclude<MemberRole, 'owner'>;
  inviteeId?: string;
  invitee?: User;
  expiresAt: string;
  usedAt?: string;
  createdAt: string;
}

export interface InvitePreview {
  pool: {
    name: string;
    description?: string;
    icon: string;
    color: string;
    owner: { name: string };
  };
  expired: boolean;
  alreadyMember: boolean;
  alreadyPending: boolean;
}

export interface PendingInvitation {
  id: string;
  pool: { id: string; name: string; icon: string; color: string };
  invitedByUser: { name: string };
  createdAt: string;
  token: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface SignupPayload {
  name: string;
  email?: string;
  phone?: string;
  password: string;
}

export interface LoginPayload {
  email?: string;
  phone?: string;
  password: string;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  user: { id: string; name: string };
  category: { id: string; name: string; icon: string } | null;
  status?: ExpenseStatus;
  transactionDate: string;
  createdAt: string;
}

export interface DashboardSummary {
  totalBalance: number;
  totalContributions: number;
  totalExpenses: number;
  poolCount: number;
}

export interface CategoryBudget {
  name: string;
  budget: number;
  spent: number;
  remaining: number;
}

export interface MonthlyFlow {
  month: string;
  contributions: number;
  expenses: number;
}

export interface SpendingBreakdownItem {
  name: string;
  value: number;
  color: string;
}

export interface MonthlyTrend {
  month: string;
  balance: number;
  savings: number;
}

export interface PoolSummary {
  id: string;
  name: string;
  color: string;
  icon: string;
  currency?: string;
  balance: number;
  totalBudget: number;
  totalSpent: number;
  memberCount: number;
}

export interface DashboardResponse {
  summary: DashboardSummary;
  pools: PoolSummary[];
  categoryBudgets: CategoryBudget[];
  monthlyFlow: MonthlyFlow[];
  spendingBreakdown: SpendingBreakdownItem[];
  monthlyTrends: MonthlyTrend[];
  defaultPoolId: string | null;
}
