import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  ArrowUpRight, 
  ArrowDownRight,
  Receipt,
  Plus,
  Calendar
} from 'lucide-react';
import { Transaction, TransactionType, ALL_CATEGORIES } from '../types';
import { formatCurrency, formatThaiDate, getCategoryInfo } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => Promise<void>;
  onOpenAddModal: () => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onEdit,
  onDelete,
  onOpenAddModal,
}) => {
  const [filterType, setFilterType] = useState<'all' | TransactionType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter transactions
  const filteredTransactions = transactions.filter((t) => {
    const matchesType = filterType === 'all' || t.type === filterType;
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    const matchesSearch = 
      t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.note && t.note.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesType && matchesCategory && matchesSearch;
  });

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('คุณต้องการลบรายการนี้ใช่หรือไม่?')) {
      try {
        setDeletingId(id);
        await onDelete(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Receipt className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              ประวัติรายการ
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
              {filteredTransactions.length} รายการ
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            รายการบันทึกทั้งหมดของเดือนที่เลือก
          </p>
        </div>

        {/* Actions & Type Switcher */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              id="filter-all-btn"
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterType === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ทั้งหมด
            </button>
            <button
              id="filter-income-btn"
              onClick={() => setFilterType('income')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterType === 'income'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              รายรับ
            </button>
            <button
              id="filter-expense-btn"
              onClick={() => setFilterType('expense')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterType === 'expense'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              รายจ่าย
            </button>
          </div>

          <button
            id="list-add-transaction-btn"
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden xs:inline">บันทึกรายการ</span>
          </button>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-4 mb-4">
        {/* Search */}
        <div className="sm:col-span-7 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="search-transactions-input"
            type="text"
            placeholder="ค้นหาตามหมวดหมู่ หรือ บันทึกช่วยจำ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
          />
        </div>

        {/* Category Select */}
        <div className="sm:col-span-5 relative">
          <Filter className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <select
            id="category-filter-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all appearance-none cursor-pointer"
          >
            <option value="all">ทุกหมวดหมู่</option>
            {ALL_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name} ({cat.type === 'income' ? 'รายรับ' : 'รายจ่าย'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transaction Items */}
      {filteredTransactions.length === 0 ? (
        <div className="py-12 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
          <Receipt className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <p className="font-semibold text-slate-700 text-sm">ไม่พบรายการบันทึก</p>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            {transactions.length === 0 
              ? 'ยังไม่มีรายการในเดือนนี้ เริ่มต้นบันทึกรายรับรายจ่ายได้เลย' 
              : 'ลองปรับเปลี่ยนคำค้นหาหรือตัวกรองหมวดหมู่'}
          </p>
          <button
            id="add-first-transaction-btn"
            onClick={onOpenAddModal}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold shadow-xs hover:bg-emerald-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>บันทึกรายการแรก</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTransactions.map((t) => {
            const catInfo = getCategoryInfo(t.category, t.type);
            const isExpense = t.type === 'expense';
            const isDeleting = deletingId === t.id;

            return (
              <div
                key={t.id}
                id={`transaction-item-${t.id}`}
                onClick={() => onEdit(t)}
                className={`group flex items-center justify-between p-3 sm:p-3.5 rounded-xl border border-slate-100 bg-white hover:bg-slate-50/80 hover:border-slate-200 transition-all cursor-pointer ${
                  isDeleting ? 'opacity-40 pointer-events-none' : ''
                }`}
              >
                {/* Left: Category Icon & Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs"
                    style={{ backgroundColor: catInfo.bgLight, color: catInfo.color }}
                  >
                    <CategoryIcon iconName={catInfo.iconName} size={18} />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs sm:text-sm text-slate-900 truncate">
                        {t.category}
                      </span>
                      <span className={`inline-flex items-center text-[10px] px-1.5 py-0.2 rounded-sm font-medium ${
                        isExpense ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {isExpense ? 'รายจ่าย' : 'รายรับ'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {formatThaiDate(t.date, 'short')}
                      </span>
                      {t.note && (
                        <>
                          <span>•</span>
                          <span className="text-slate-600 truncate max-w-[150px] sm:max-w-xs">
                            {t.note}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Amount & Actions */}
                <div className="flex items-center gap-3 shrink-0 ml-2">
                  <div className="text-right">
                    <span className={`font-bold text-xs sm:text-sm tracking-tight ${
                      isExpense ? 'text-rose-600' : 'text-emerald-600'
                    }`}>
                      {isExpense ? '-' : '+'}{formatCurrency(t.amount)}
                    </span>
                  </div>

                  {/* Actions on hover/mobile */}
                  <div className="flex items-center gap-1">
                    <button
                      id={`edit-item-${t.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(t);
                      }}
                      title="แก้ไข"
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      id={`delete-item-${t.id}`}
                      onClick={(e) => handleDelete(t.id, e)}
                      title="ลบ"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
