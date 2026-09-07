import React, { useState, useEffect } from 'react';
import { 
  X, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  FileText, 
  Check, 
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { 
  Transaction, 
  TransactionType, 
  INCOME_CATEGORIES, 
  EXPENSE_CATEGORIES 
} from '../types';
import { CategoryIcon } from './CategoryIcon';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    type: TransactionType;
    amount: number;
    category: string;
    note: string;
    date: string;
  }) => Promise<void>;
  initialData?: Transaction | null;
  initialType?: TransactionType;
  currentYear: number;
  currentMonth: number;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  initialType = 'expense',
  currentYear,
  currentMonth,
}) => {
  const [type, setType] = useState<TransactionType>(initialType);
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [customCategory, setCustomCategory] = useState<string>('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [note, setNote] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Today local ISO string
  const getTodayStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getYesterdayStr = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Initialize form
  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setAmount(initialData.amount.toString());
      const categoriesList = initialData.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
      const foundPreset = categoriesList.some(c => c.name === initialData.category);
      if (foundPreset) {
        setCategory(initialData.category);
        setIsCustomCategory(false);
        setCustomCategory('');
      } else {
        setCategory('');
        setIsCustomCategory(true);
        setCustomCategory(initialData.category);
      }
      setNote(initialData.note || '');
      setDate(initialData.date);
    } else {
      const defaultType = initialType || 'expense';
      setType(defaultType);
      setAmount('');
      const defaultCat = defaultType === 'expense' ? EXPENSE_CATEGORIES[0].name : INCOME_CATEGORIES[0].name;
      setCategory(defaultCat);
      setIsCustomCategory(false);
      setCustomCategory('');
      setNote('');
      // Default to today
      setDate(getTodayStr());
    }
    setError(null);
  }, [initialData, initialType, isOpen]);

  // When switching type, reset to first category of that type
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    setIsCustomCategory(false);
    setCustomCategory('');
    if (newType === 'expense') {
      setCategory(EXPENSE_CATEGORIES[0].name);
    } else {
      setCategory(INCOME_CATEGORIES[0].name);
    }
  };

  const handleQuickAddAmount = (addValue: number) => {
    const current = parseFloat(amount) || 0;
    setAmount((current + addValue).toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      setError('กรุณาระบุจำนวนเงินที่ถูกต้อง (มากกว่า 0)');
      return;
    }

    const finalCategory = isCustomCategory ? customCategory.trim() : category.trim();

    if (!finalCategory) {
      setError('กรุณาเลือกหรือระบุหมวดหมู่');
      return;
    }

    if (!date) {
      setError('กรุณาเลือกวันที่ทำรายการ');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit({
        type,
        amount: numAmount,
        category: finalCategory,
        note: note.trim(),
        date,
      });
      onClose();
    } catch (err: any) {
      console.error('Submit transaction error:', err);
      setError(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const activeCategories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        id="transaction-modal"
        className="relative bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900">
              {initialData ? 'แก้ไขรายการ' : 'บันทึกรายการใหม่'}
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
              MoneyDB
            </span>
          </div>
          <button
            id="close-modal-btn"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 p-3 text-xs text-rose-700 bg-rose-50 rounded-xl border border-rose-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Type Toggle: Income vs Expense */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              ประเภทรายการ
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
              <button
                type="button"
                id="type-expense-toggle"
                onClick={() => handleTypeChange('expense')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  type === 'expense'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <TrendingDown className="w-4 h-4" />
                <span>รายจ่าย (Expense)</span>
              </button>
              <button
                type="button"
                id="type-income-toggle"
                onClick={() => handleTypeChange('income')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  type === 'income'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>รายรับ (Income)</span>
              </button>
            </div>
          </div>

          {/* Amount Input & Quick Add */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              จำนวนเงิน (บาท) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">
                ฿
              </span>
              <input
                id="transaction-amount-input"
                type="number"
                step="any"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
                className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xl font-bold text-slate-900 placeholder:text-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              />
            </div>
            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1">
              <span className="text-[11px] text-slate-400 shrink-0">เพิ่มเร็ว:</span>
              {[50, 100, 500, 1000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickAddAmount(val)}
                  className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors shrink-0"
                >
                  +{val.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Categories Grid or Custom */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-600">
                หมวดหมู่ <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsCustomCategory(!isCustomCategory);
                  if (!isCustomCategory) {
                    setCategory('');
                  } else {
                    const defaultCat = type === 'expense' ? EXPENSE_CATEGORIES[0].name : INCOME_CATEGORIES[0].name;
                    setCategory(defaultCat);
                  }
                }}
                className="text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
              >
                {isCustomCategory ? '← เลือกจากหมวดหมู่แนะนำ' : '+ พิมพ์หมวดหมู่เอง'}
              </button>
            </div>

            {isCustomCategory ? (
              <div className="relative">
                <input
                  id="custom-category-input"
                  type="text"
                  placeholder="ระบุชื่อหมวดหมู่ เช่น ค่าคอร์สเรียน, ขายของออนไลน์"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                  autoFocus
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-44 overflow-y-auto p-1 border border-slate-100 rounded-2xl bg-slate-50/50">
                {activeCategories.map((cat) => {
                  const isSelected = category === cat.name;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.name)}
                      className={`flex items-center gap-2 p-2 rounded-xl text-left text-xs transition-all border ${
                        isSelected
                          ? 'border-slate-800 bg-white text-slate-900 shadow-xs font-bold'
                          : 'border-transparent bg-white/70 hover:bg-white text-slate-600 font-medium'
                      }`}
                    >
                      <div 
                        className="p-1.5 rounded-lg shrink-0"
                        style={{ backgroundColor: cat.bgLight, color: cat.color }}
                      >
                        <CategoryIcon iconName={cat.iconName} size={14} />
                      </div>
                      <span className="truncate">{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Date & Note */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-600">
                  วันที่ทำรายการ <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setDate(getTodayStr())}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium transition-colors"
                  >
                    วันนี้
                  </button>
                  <button
                    type="button"
                    onClick={() => setDate(getYesterdayStr())}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium transition-colors"
                  >
                    เมื่อวาน
                  </button>
                </div>
              </div>
              <div className="relative">
                <input
                  id="transaction-date-input"
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                บันทึกช่วยจำ (ถ้ามี)
              </label>
              <div className="relative">
                <input
                  id="transaction-note-input"
                  type="text"
                  placeholder="เช่น มื้อเที่ยง, ค่าเน็ต, เงินเดือน"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              id="submit-transaction-btn"
              disabled={isSubmitting}
              className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm transition-all ${
                type === 'expense'
                  ? 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800'
                  : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800'
              } disabled:opacity-50`}
            >
              {isSubmitting ? (
                <span>กำลังบันทึก...</span>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>{initialData ? 'บันทึกการแก้ไข' : 'บันทึกรายการ'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
