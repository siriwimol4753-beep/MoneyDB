import { 
  Transaction, 
  MonthlySummaryData, 
  CategoryBreakdown, 
  DailyComparison, 
  MonthlyTrend,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  ALL_CATEGORIES,
  THAI_MONTHS,
  THAI_MONTHS_SHORT
} from '../types';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatThaiDate(dateStr: string, format: 'short' | 'full' = 'short'): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;

  const year = parseInt(parts[0], 10);
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  // Buddhist year (+543)
  const bYear = year + 543;

  if (format === 'short') {
    return `${day} ${THAI_MONTHS_SHORT[monthIdx] || ''} ${bYear}`;
  }
  return `${day} ${THAI_MONTHS[monthIdx] || ''} พ.ศ. ${bYear}`;
}

export function getCategoryInfo(categoryName: string, type?: 'income' | 'expense') {
  const found = ALL_CATEGORIES.find((c) => c.name === categoryName);
  if (found) return found;

  if (type === 'income') {
    return {
      id: 'other_income',
      name: categoryName,
      iconName: 'Coins',
      color: '#10b981',
      bgLight: '#ecfdf5',
      type: 'income' as const,
    };
  }

  return {
    id: 'other_expense',
    name: categoryName,
    iconName: 'CreditCard',
    color: '#f43f5e',
    bgLight: '#fff1f2',
    type: 'expense' as const,
  };
}

export function filterTransactionsByMonth(
  transactions: Transaction[],
  year: number,
  month: number // 1 to 12
): Transaction[] {
  const targetPrefix = `${year}-${String(month).padStart(2, '0')}`;
  return transactions.filter((t) => t.date.startsWith(targetPrefix));
}

export function calculateMonthlySummary(transactions: Transaction[], daysInMonth: number = 30): MonthlySummaryData {
  let totalIncome = 0;
  let totalExpense = 0;

  for (const t of transactions) {
    if (t.type === 'income') {
      totalIncome += t.amount;
    } else if (t.type === 'expense') {
      totalExpense += t.amount;
    }
  }

  const netBalance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.max(0, Math.round((netBalance / totalIncome) * 100)) : 0;

  return {
    totalIncome,
    totalExpense,
    netBalance,
    savingsRate,
    transactionCount: transactions.length,
    dailyAverages: {
      income: Math.round(totalIncome / (daysInMonth || 1)),
      expense: Math.round(totalExpense / (daysInMonth || 1)),
    },
  };
}

export function calculateCategoryBreakdown(
  transactions: Transaction[], 
  type: 'expense' | 'income' = 'expense'
): CategoryBreakdown[] {
  const filtered = transactions.filter((t) => t.type === type);
  const total = filtered.reduce((sum, t) => sum + t.amount, 0);

  const map = new Map<string, { amount: number; count: number }>();

  for (const t of filtered) {
    const prev = map.get(t.category) || { amount: 0, count: 0 };
    map.set(t.category, {
      amount: prev.amount + t.amount,
      count: prev.count + 1,
    });
  }

  const result: CategoryBreakdown[] = [];
  map.forEach((value, category) => {
    const info = getCategoryInfo(category, type);
    result.push({
      category,
      amount: value.amount,
      percentage: total > 0 ? Number(((value.amount / total) * 100).toFixed(1)) : 0,
      color: info.color,
      count: value.count,
    });
  });

  // Sort descending by amount
  return result.sort((a, b) => b.amount - a.amount);
}

export function calculateDailyComparison(
  transactions: Transaction[],
  year: number,
  month: number
): DailyComparison[] {
  const daysInMonth = new Date(year, month, 0).getDate();
  const dailyMap = new Map<number, { income: number; expense: number }>();

  for (let d = 1; d <= daysInMonth; d++) {
    dailyMap.set(d, { income: 0, expense: 0 });
  }

  const monthStr = String(month).padStart(2, '0');
  const targetPrefix = `${year}-${monthStr}`;

  for (const t of transactions) {
    if (t.date.startsWith(targetPrefix)) {
      const day = parseInt(t.date.split('-')[2], 10);
      const curr = dailyMap.get(day) || { income: 0, expense: 0 };
      if (t.type === 'income') {
        curr.income += t.amount;
      } else {
        curr.expense += t.amount;
      }
      dailyMap.set(day, curr);
    }
  }

  const result: DailyComparison[] = [];
  dailyMap.forEach((val, day) => {
    result.push({
      day,
      dateStr: `${year}-${monthStr}-${String(day).padStart(2, '0')}`,
      displayDay: `วันที่ ${day}`,
      income: val.income,
      expense: val.expense,
      net: val.income - val.expense,
    });
  });

  return result.sort((a, b) => a.day - b.day);
}

export function calculateMonthlyTrends(transactions: Transaction[], currentYear: number): MonthlyTrend[] {
  const monthsData: MonthlyTrend[] = [];

  for (let m = 0; m < 12; m++) {
    const monthNum = m + 1;
    const prefix = `${currentYear}-${String(monthNum).padStart(2, '0')}`;
    let income = 0;
    let expense = 0;

    for (const t of transactions) {
      if (t.date.startsWith(prefix)) {
        if (t.type === 'income') income += t.amount;
        else expense += t.amount;
      }
    }

    monthsData.push({
      monthKey: prefix,
      monthName: THAI_MONTHS_SHORT[m],
      income,
      expense,
      net: income - expense,
    });
  }

  return monthsData;
}
