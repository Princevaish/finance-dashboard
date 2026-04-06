export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface RecordItem {
  id: number;
  user_id: number;
  amount: string;
  type: "income" | "expense";
  category: string;
  date: string;
  notes: string | null;
}

export interface PaginatedRecords {
  items: RecordItem[];
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
}

export interface CategoryBreakdown {
  category: string;
  total: string;
}

export interface DashboardSummary {
  total_income: string;
  total_expense: string;
  net_balance: string;
  income_by_category: CategoryBreakdown[];
  expense_by_category: CategoryBreakdown[];
  recent_transactions: RecordItem[];
}

export interface TrendPoint {
  month: string;
  income: string;
  expense: string;
  net: string;
}

export interface TrendResponse {
  trends: TrendPoint[];
  total_months: number;
}

export interface UserResponse {
  id: number;
  email: string;
  role: "viewer" | "analyst" | "admin";
  is_active: boolean;
  created_at: string;
}

export interface PaginatedUsers {
  items: UserResponse[];
  total: number;
}