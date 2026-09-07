import React from 'react';
import { 
  Sparkles, 
  Target, 
  Flame, 
  Award, 
  Download,
  AlertTriangle,
  CheckCircle2,
  TrendingUp
} from 'lucide-react';
import { MonthlySummaryData, CategoryBreakdown, DailyComparison, Transaction } from '../types';
import { formatCurrency } from '../utils/formatters';

interface BudgetInsightsProps {
  summary: MonthlySummaryData;
  topExpenseCategory: CategoryBreakdown | undefined;
  dailyComparison: DailyComparison[];
  transactions: Transaction[];
  monthName: string;
}

export const BudgetInsights: React.FC<BudgetInsightsProps> = ({
  summary,
  topExpenseCategory,
  dailyComparison,
  transactions,
  monthName,
}) => {
  // Find peak spending day
  const peakDay = [...dailyComparison].sort((a, b) => b.expense - a.expense)[0];

  // Export transactions to CSV
  const handleExportCSV = () => {
    if (transactions.length === 0) return;
    
    const headers = ['วันที่', 'ประเภท', 'หมวดหมู่', 'จำนวนเงิน', 'บันทึกช่วยจำ'];
    const rows = transactions.map((t) => [
      t.date,
      t.type === 'income' ? 'รายรับ' : 'รายจ่าย',
      t.category,
      t.amount,
      `"${(t.note || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `MoneyDB_${monthName}_transactions.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
        <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
          <div className="p-1 rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
            <Sparkles className="w-4 h-4" />
          </div>
          <span>สรุปข้อคิดทางการเงิน (Financial Insights)</span>
        </div>
        {transactions.length > 0 && (
          <button
            id="export-csv-btn"
            onClick={handleExportCSV}
            title="ดาวน์โหลดไฟล์ CSV สำหรับเปิดใน Excel หรือ Google Sheets"
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>ส่งออก CSV</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        {/* Top Expense Category */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-slate-500 font-medium block mb-1">หมวดหมู่ที่จ่ายมากสุด</span>
          {topExpenseCategory ? (
            <div>
              <span className="font-bold text-slate-900 text-sm block truncate">
                {topExpenseCategory.category}
              </span>
              <span className="text-rose-600 font-semibold">
                {formatCurrency(topExpenseCategory.amount)} ({topExpenseCategory.percentage}%)
              </span>
            </div>
          ) : (
            <span className="text-slate-400">ยังไม่มีข้อมูลรายจ่าย</span>
          )}
        </div>

        {/* Peak Spending Day */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-slate-500 font-medium block mb-1">วันที่ใช้จ่ายสูงสุด</span>
          {peakDay && peakDay.expense > 0 ? (
            <div>
              <span className="font-bold text-slate-900 text-sm block">
                {peakDay.displayDay}
              </span>
              <span className="text-rose-600 font-semibold">
                {formatCurrency(peakDay.expense)}
              </span>
            </div>
          ) : (
            <span className="text-slate-400">-</span>
          )}
        </div>

        {/* Health status */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-slate-500 font-medium block mb-1">วินัยการเงินประจำเดือน</span>
          {summary.totalIncome === 0 && summary.totalExpense === 0 ? (
            <span className="text-slate-400">ยังไม่มีรายการ</span>
          ) : summary.savingsRate >= 20 ? (
            <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>ยอดเยี่ยม! ออมได้ {summary.savingsRate}%</span>
            </div>
          ) : summary.savingsRate > 0 ? (
            <div className="flex items-center gap-1.5 text-teal-700 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0" />
              <span>ดี! ออมได้ {summary.savingsRate}%</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-amber-700 font-semibold">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
              <span>ระวังการใช้จ่ายเกินตัว</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
