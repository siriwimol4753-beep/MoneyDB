import React, { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { 
  PieChart as PieIcon, 
  BarChart3, 
  TrendingUp, 
  Layers,
  ArrowUpRight,
  Sparkles,
  Info
} from 'lucide-react';
import { 
  CategoryBreakdown, 
  DailyComparison, 
  MonthlyTrend,
  THAI_MONTHS 
} from '../types';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';

interface AnalyticsChartsProps {
  expenseCategories: CategoryBreakdown[];
  incomeCategories: CategoryBreakdown[];
  dailyComparison: DailyComparison[];
  monthlyTrends: MonthlyTrend[];
  selectedMonth: number;
  selectedYear: number;
  totalExpense: number;
  totalIncome: number;
}

type ChartTab = 'categories' | 'daily' | 'annual';

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  expenseCategories,
  incomeCategories,
  dailyComparison,
  monthlyTrends,
  selectedMonth,
  selectedYear,
  totalExpense,
  totalIncome,
}) => {
  const [activeTab, setActiveTab] = useState<ChartTab>('categories');
  const [categoryType, setCategoryType] = useState<'expense' | 'income'>('expense');

  const monthName = THAI_MONTHS[selectedMonth - 1];
  const thaiYear = selectedYear + 543;

  const currentCategories = categoryType === 'expense' ? expenseCategories : incomeCategories;
  const currentTotal = categoryType === 'expense' ? totalExpense : totalIncome;

  // Format custom tooltip for pie chart
  const renderCustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as CategoryBreakdown;
      return (
        <div className="bg-slate-900 text-white px-3 py-2 rounded-xl text-xs shadow-lg border border-slate-700">
          <p className="font-semibold">{data.category}</p>
          <p className="text-emerald-400 font-bold mt-0.5">{formatCurrency(data.amount)}</p>
          <p className="text-slate-400">{data.percentage}% ({data.count} รายการ)</p>
        </div>
      );
    }
    return null;
  };

  // Format custom tooltip for bar charts
  const renderCustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white px-3 py-2 rounded-xl text-xs shadow-lg border border-slate-700 min-w-[140px]">
          <p className="font-semibold text-slate-300 pb-1 mb-1 border-b border-slate-700">{label}</p>
          {payload.map((item: any, idx: number) => (
            <div key={idx} className="flex justify-between items-center py-0.5 gap-2">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                {item.name}:
              </span>
              <span className="font-bold" style={{ color: item.color }}>
                {formatCurrency(item.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-teal-50 text-teal-600 border border-teal-100">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              กราฟวิเคราะห์ข้อมูลการเงิน
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            สรุปผลการวิเคราะห์พฤติกรรมการใช้จ่ายและกระแสเงินสด ({monthName} {thaiYear})
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold self-start sm:self-auto">
          <button
            id="tab-categories-btn"
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'categories'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PieIcon className="w-3.5 h-3.5" />
            <span>สัดส่วนหมวดหมู่</span>
          </button>
          <button
            id="tab-daily-btn"
            onClick={() => setActiveTab('daily')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'daily'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>เปรียบเทียบรายวัน</span>
          </button>
          <button
            id="tab-annual-btn"
            onClick={() => setActiveTab('annual')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'annual'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>แนวโน้มรอบปี</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Category Breakdown (Donut + Detailed Ranking) */}
      {activeTab === 'categories' && (
        <div className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500">เลือกประเภท:</span>
              <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200 text-xs">
                <button
                  id="cat-type-expense-btn"
                  onClick={() => setCategoryType('expense')}
                  className={`px-3 py-1 rounded-md font-medium transition-all ${
                    categoryType === 'expense'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  รายจ่าย ({formatCurrency(totalExpense)})
                </button>
                <button
                  id="cat-type-income-btn"
                  onClick={() => setCategoryType('income')}
                  className={`px-3 py-1 rounded-md font-medium transition-all ${
                    categoryType === 'income'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  รายรับ ({formatCurrency(totalIncome)})
                </button>
              </div>
            </div>

            <span className="text-xs text-slate-500 hidden sm:inline">
              รวม {currentCategories.length} หมวดหมู่
            </span>
          </div>

          {currentCategories.length === 0 ? (
            <div className="py-12 text-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <Layers className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="font-medium text-slate-600">ยังไม่มีรายการ{categoryType === 'expense' ? 'รายจ่าย' : 'รายรับ'}ในเดือนนี้</p>
              <p className="text-xs text-slate-400 mt-1">กดปุ่ม "บันทึกรายการ" เพื่อเริ่มต้นวิเคราะห์ข้อมูล</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Donut Chart */}
              <div className="lg:col-span-5 h-64 sm:h-72 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={currentCategories}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={4}
                      dataKey="amount"
                      nameKey="category"
                    >
                      {currentCategories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip content={renderCustomPieTooltip} />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Center Summary Label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                  <span className="text-xs text-slate-500 font-medium">รวมทั้งสิ้น</span>
                  <span className="text-base sm:text-lg font-bold text-slate-900">
                    {formatCurrency(currentTotal)}
                  </span>
                  <span className="text-[10px] text-slate-400">100%</span>
                </div>
              </div>

              {/* Category Breakdown Progress Bars */}
              <div className="lg:col-span-7 space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {currentCategories.map((cat) => (
                  <div 
                    key={cat.category}
                    className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-800 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span 
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span>{cat.category}</span>
                        <span className="text-slate-400 font-normal">({cat.count} รายการ)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-900 font-bold">{formatCurrency(cat.amount)}</span>
                        <span className="text-slate-500 w-10 text-right font-medium">{cat.percentage}%</span>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${Math.max(3, cat.percentage)}%`,
                          backgroundColor: cat.color 
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Daily Income vs Expense Bar Chart */}
      {activeTab === 'daily' && (
        <div className="pt-6">
          <div className="flex items-center justify-between mb-3 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-400" />
              เปรียบเทียบยอดรายรับและรายจ่ายในแต่ละวันของเดือน {monthName}
            </span>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-emerald-500" />
                <span className="text-slate-700 font-medium">รายรับ</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-rose-500" />
                <span className="text-slate-700 font-medium">รายจ่าย</span>
              </div>
            </div>
          </div>

          <div className="h-72 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dailyComparison}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="day" 
                  tickLine={false} 
                  axisLine={{ stroke: '#cbd5e1' }}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
                />
                <Tooltip content={renderCustomBarTooltip} />
                <Bar dataKey="income" name="รายรับ" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={18} />
                <Bar dataKey="expense" name="รายจ่าย" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Tab 3: 12-Month Annual Trend */}
      {activeTab === 'annual' && (
        <div className="pt-6">
          <div className="flex items-center justify-between mb-3 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
              ภาพรวมกระแสเงินสดทั้ง 12 เดือน ประจำปี {thaiYear}
            </span>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-emerald-500" />
                <span className="text-slate-700 font-medium">รายรับ</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-rose-500" />
                <span className="text-slate-700 font-medium">รายจ่าย</span>
              </div>
            </div>
          </div>

          <div className="h-72 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyTrends}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="monthName" 
                  tickLine={false} 
                  axisLine={{ stroke: '#cbd5e1' }}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
                />
                <Tooltip content={renderCustomBarTooltip} />
                <Bar dataKey="income" name="รายรับ" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={22} />
                <Bar dataKey="expense" name="รายจ่าย" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

    </div>
  );
};
