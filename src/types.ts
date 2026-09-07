export type TransactionType = 'income' | 'expense';

export interface CategoryInfo {
  id: string;
  name: string;
  iconName: string;
  color: string;
  bgLight: string;
  type: TransactionType;
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  category: string;
  note: string;
  date: string; // YYYY-MM-DD
  createdAt?: any;
  updatedAt?: any;
}

export interface MonthlySummaryData {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  savingsRate: number;
  transactionCount: number;
  dailyAverages: {
    income: number;
    expense: number;
  };
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  color: string;
  count: number;
}

export interface DailyComparison {
  day: number;
  dateStr: string;
  displayDay: string;
  income: number;
  expense: number;
  net: number;
}

export interface MonthlyTrend {
  monthKey: string;
  monthName: string;
  income: number;
  expense: number;
  net: number;
}

export const INCOME_CATEGORIES: CategoryInfo[] = [
  { id: 'salary', name: 'เงินเดือน', iconName: 'Briefcase', color: '#10b981', bgLight: '#ecfdf5', type: 'income' },
  { id: 'bonus', name: 'โบนัส/เงินรางวัล', iconName: 'Award', color: '#059669', bgLight: '#d1fae5', type: 'income' },
  { id: 'business', name: 'ธุรกิจส่วนตัว/ค้าขาย', iconName: 'Store', color: '#0d9488', bgLight: '#ccfbf1', type: 'income' },
  { id: 'freelance', name: 'งานเสริม/ฟรีแลนซ์', iconName: 'Laptop', color: '#06b6d4', bgLight: '#cffafe', type: 'income' },
  { id: 'investment', name: 'การลงทุน/เงินปันผล', iconName: 'TrendingUp', color: '#3b82f6', bgLight: '#eff6ff', type: 'income' },
  { id: 'gift', name: 'ของขวัญ/เงินช่วย', iconName: 'Gift', color: '#8b5cf6', bgLight: '#f5f3ff', type: 'income' },
  { id: 'other_income', name: 'รายรับอื่นๆ', iconName: 'Coins', color: '#64748b', bgLight: '#f1f5f9', type: 'income' },
];

export const EXPENSE_CATEGORIES: CategoryInfo[] = [
  { id: 'food', name: 'อาหารและเครื่องดื่ม', iconName: 'Utensils', color: '#f43f5e', bgLight: '#fff1f2', type: 'expense' },
  { id: 'transport', name: 'การเดินทาง/น้ำมัน', iconName: 'Car', color: '#f97316', bgLight: '#fff7ed', type: 'expense' },
  { id: 'housing', name: 'ค่าที่พัก/ผ่อนบ้าน', iconName: 'Home', color: '#eab308', bgLight: '#fefce8', type: 'expense' },
  { id: 'utilities', name: 'ค่าน้ำ/ค่าไฟ/อินเทอร์เน็ต', iconName: 'Zap', color: '#84cc16', bgLight: '#f7fee7', type: 'expense' },
  { id: 'shopping', name: 'ช้อปปิ้ง/ของใช้', iconName: 'ShoppingBag', color: '#ec4899', bgLight: '#fdf2f8', type: 'expense' },
  { id: 'health', name: 'สุขภาพและการรักษา', iconName: 'HeartPulse', color: '#ef4444', bgLight: '#fef2f2', type: 'expense' },
  { id: 'education', name: 'การศึกษา/หนังสือ', iconName: 'GraduationCap', color: '#a855f7', bgLight: '#faf5ff', type: 'expense' },
  { id: 'entertainment', name: 'บันเทิง/พักผ่อน', iconName: 'Film', color: '#6366f1', bgLight: '#eef2ff', type: 'expense' },
  { id: 'family', name: 'ให้ครอบครัว/บริจาค', iconName: 'Users', color: '#14b8a6', bgLight: '#f0fdfa', type: 'expense' },
  { id: 'other_expense', name: 'รายจ่ายอื่นๆ', iconName: 'CreditCard', color: '#64748b', bgLight: '#f1f5f9', type: 'expense' },
];

export const ALL_CATEGORIES = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];

export const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน',
  'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม',
  'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

export const THAI_MONTHS_SHORT = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.',
  'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.',
  'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
];
