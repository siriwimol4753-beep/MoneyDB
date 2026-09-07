import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  PiggyBank, 
  ArrowUpRight, 
  ArrowDownRight,
  Sparkles,
  CalendarCheck,
  Percent
} from 'lucide-react';
import { MonthlySummaryData, THAI_MONTHS, TransactionType } from '../types';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { Plus } from 'lucide-react';

interface MonthlySummaryProps {
  summary: MonthlySummaryData;
  month: number;
  year: number;
  onOpenAddModal?: (type: TransactionType) => void;
}

export const MonthlySummary: React.FC<MonthlySummaryProps> = ({ 
  summary, 
  month, 
  year,
  onOpenAddModal 
}) => {
  const monthName = THAI_MONTHS[month - 1];
  const thaiYear = year + 543;
  const isPositive = summary.netBalance >= 0;

  return (
    <div className="space-y-4">
      {/* Overview Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Total Income Card */}
        <div 
          id="summary-income-card"
          className="relative overflow-hidden bg-white rounded-2xl p-5 border border-emerald-100 shadow-xs hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-700 font-medium text-sm">
              <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100/80">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <span>รายรับรวม</span>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/50">
              <ArrowUpRight className="w-3 h-3 text-emerald-600" />
              {monthName}
            </span>
          </div>

          <div className="mt-4">
            <div className="flex items-baseline justify-between gap-2">
              <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                {formatCurrency(summary.totalIncome)}
              </div>
              {onOpenAddModal && (
                <button
                  type="button"
                  id="card-add-income-btn"
                  onClick={() => onOpenAddModal('income')}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-lg border border-emerald-200/60 transition-colors"
                >
                  <Plus className="w-3 h-3 stroke-[2.5]" />
                  <span>เพิ่มรายรับ</span>
                </button>
              )}
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
              <span>เฉลี่ยวันละ {formatCurrency(summary.dailyAverages.income)}</span>
              <span>ประจำเดือน {monthName} {thaiYear}</span>
            </div>
          </div>

          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Total Expense Card */}
        <div 
          id="summary-expense-card"
          className="relative overflow-hidden bg-white rounded-2xl p-5 border border-rose-100 shadow-xs hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-700 font-medium text-sm">
              <div className="p-2 rounded-xl bg-rose-50 border border-rose-100/80">
                <TrendingDown className="w-5 h-5 text-rose-600" />
              </div>
              <span>รายจ่ายรวม</span>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/50">
              <ArrowDownRight className="w-3 h-3 text-rose-600" />
              {monthName}
            </span>
          </div>

          <div className="mt-4">
            <div className="flex items-baseline justify-between gap-2">
              <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                {formatCurrency(summary.totalExpense)}
              </div>
              {onOpenAddModal && (
                <button
                  type="button"
                  id="card-add-expense-btn"
                  onClick={() => onOpenAddModal('expense')}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 px-2 py-1 rounded-lg border border-rose-200/60 transition-colors"
                >
                  <Plus className="w-3 h-3 stroke-[2.5]" />
                  <span>เพิ่มรายจ่าย</span>
                </button>
              )}
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
              <span>เฉลี่ยวันละ {formatCurrency(summary.dailyAverages.expense)}</span>
              <span className="text-rose-600 font-medium">
                {summary.totalIncome > 0 ? `${Math.round((summary.totalExpense / summary.totalIncome) * 100)}% ของรายรับ` : ''}
              </span>
            </div>
          </div>

          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-rose-500/5 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Net Balance / Savings Card */}
        <div 
          id="summary-net-card"
          className={`relative overflow-hidden bg-white rounded-2xl p-5 border shadow-xs hover:shadow-md transition-shadow ${
            isPositive ? 'border-teal-100' : 'border-amber-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-700 font-medium text-sm">
              <div className={`p-2 rounded-xl border ${
                isPositive 
                  ? 'bg-teal-50 border-teal-100 text-teal-600' 
                  : 'bg-amber-50 border-amber-100 text-amber-600'
              }`}>
                <PiggyBank className="w-5 h-5" />
              </div>
              <span>คงเหลือสุทธิ (เงินเก็บ)</span>
            </div>
            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${
              isPositive 
                ? 'bg-teal-50 text-teal-700 border-teal-200/60' 
                : 'bg-amber-50 text-amber-700 border-amber-200/60'
            }`}>
              {isPositive ? 'สถานะเกินดุล' : 'รายจ่ายเกินรายรับ'}
            </span>
          </div>

          <div className="mt-4">
            <div className={`text-2xl sm:text-3xl font-bold tracking-tight ${
              isPositive ? 'text-teal-700' : 'text-amber-700'
            }`}>
              {formatCurrency(summary.netBalance)}
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Percent className="w-3.5 h-3.5 text-teal-600" />
                อัตราการออม: <strong className="text-slate-800">{summary.savingsRate}%</strong>
              </span>
              <span className="flex items-center gap-1">
                <CalendarCheck className="w-3.5 h-3.5 text-slate-400" />
                {summary.transactionCount} รายการ
              </span>
            </div>
          </div>

          <div className={`absolute -bottom-6 -right-6 w-24 h-24 rounded-full blur-xl pointer-events-none ${
            isPositive ? 'bg-teal-500/5' : 'bg-amber-500/5'
          }`} />
        </div>

      </div>

      {/* Progress & Cashflow Bar */}
      {summary.totalIncome > 0 && (
        <div className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="w-full sm:w-1/2 flex items-center gap-3">
            <span className="font-semibold text-slate-700 shrink-0">สัดส่วนค่าใช้จ่าย:</span>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden flex">
              <div 
                className="bg-rose-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, Math.round((summary.totalExpense / summary.totalIncome) * 100))}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-4 text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>ใช้ไป: {Math.round((summary.totalExpense / summary.totalIncome) * 100)}%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-500"></span>
              <span>เหลือเก็บ: {summary.savingsRate}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
