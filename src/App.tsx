import React, { useState, useEffect, useMemo } from 'react';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User 
} from './lib/firebase';
import { Transaction, TransactionType } from './types';
import { 
  subscribeToTransactions, 
  createTransaction, 
  updateTransaction, 
  deleteTransaction, 
  seedSampleTransactions,
  migrateGuestTransactions 
} from './services/transactionService';
import { 
  filterTransactionsByMonth, 
  calculateMonthlySummary, 
  calculateCategoryBreakdown, 
  calculateDailyComparison, 
  calculateMonthlyTrends,
  formatThaiDate 
} from './utils/formatters';
import { Navbar } from './components/Navbar';
import { MonthlySummary } from './components/MonthlySummary';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { TransactionList } from './components/TransactionList';
import { TransactionModal } from './components/TransactionModal';
import { AuthBanner } from './components/AuthBanner';
import { BudgetInsights } from './components/BudgetInsights';
import { Plus, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Date selection state (defaults to current date)
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth() + 1); // 1-12

  // Transactions state
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [firestoreError, setFirestoreError] = useState<string | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialType, setModalInitialType] = useState<TransactionType>('expense');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Demo / guest mode state
  const [guestId, setGuestId] = useState<string>(() => {
    let id = localStorage.getItem('moneydb_guest_id');
    if (!id) {
      id = 'guest_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('moneydb_guest_id', id);
    }
    return id;
  });

  // Effective user ID for Firestore operations
  const activeUserId = user ? user.uid : guestId;

  const showToast = (message: string) => {
    setSuccessToast(message);
    setTimeout(() => {
      setSuccessToast((prev) => (prev === message ? null : prev));
    }, 3500);
  };

  // Listen for Firebase Auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);
      setAuthError(null);

      // If user logs in with Google and previously had guest transactions, migrate them
      if (currentUser && guestId) {
        try {
          await migrateGuestTransactions(guestId, currentUser.uid);
        } catch (e) {
          console.error('Failed to migrate guest records:', e);
        }
      }
    });

    return () => unsubscribe();
  }, [guestId]);

  // Listen for Firestore transactions in real time
  useEffect(() => {
    if (!activeUserId) return;

    setIsLoadingTransactions(true);
    setFirestoreError(null);

    const unsubscribe = subscribeToTransactions(
      activeUserId,
      (items) => {
        setAllTransactions(items);
        setIsLoadingTransactions(false);
      },
      (err) => {
        console.error('Firestore subscription error:', err);
        setFirestoreError(err.message || 'ไม่สามารถเชื่อมต่อฐานข้อมูลได้');
        setIsLoadingTransactions(false);
      }
    );

    return () => unsubscribe();
  }, [activeUserId]);

  // Handle Google / Gmail Sign In
  const handleSignIn = async () => {
    try {
      setAuthError(null);
      setIsAuthLoading(true);
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Sign-in error:', err);
      if (err.code === 'auth/popup-blocked') {
        setAuthError('เบราว์เซอร์บล็อกป๊อปอัป กรุณาอนุญาตป๊อปอัปเพื่อเข้าสู่ระบบด้วย Google');
      } else if (err.code === 'auth/popup-closed-by-user') {
        // User closed popup, do nothing
      } else {
        setAuthError(err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ Google');
      }
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Handle Sign Out
  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err: any) {
      console.error('Sign-out error:', err);
    }
  };

  // Month navigation
  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((prev) => prev - 1);
    } else {
      setSelectedMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((prev) => prev + 1);
    } else {
      setSelectedMonth((prev) => prev + 1);
    }
  };

  const handleCurrentMonth = () => {
    const d = new Date();
    setSelectedYear(d.getFullYear());
    setSelectedMonth(d.getMonth() + 1);
  };

  // Filtered transactions for the currently selected month
  const monthlyTransactions = useMemo(() => {
    return filterTransactionsByMonth(allTransactions, selectedYear, selectedMonth);
  }, [allTransactions, selectedYear, selectedMonth]);

  // Calculate monthly summary
  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const summary = useMemo(() => {
    return calculateMonthlySummary(monthlyTransactions, daysInMonth);
  }, [monthlyTransactions, daysInMonth]);

  // Calculate category breakdown
  const expenseCategories = useMemo(() => {
    return calculateCategoryBreakdown(monthlyTransactions, 'expense');
  }, [monthlyTransactions]);

  const incomeCategories = useMemo(() => {
    return calculateCategoryBreakdown(monthlyTransactions, 'income');
  }, [monthlyTransactions]);

  // Calculate daily comparison
  const dailyComparison = useMemo(() => {
    return calculateDailyComparison(allTransactions, selectedYear, selectedMonth);
  }, [allTransactions, selectedYear, selectedMonth]);

  // Calculate annual 12-month trends
  const monthlyTrends = useMemo(() => {
    return calculateMonthlyTrends(allTransactions, selectedYear);
  }, [allTransactions, selectedYear]);

  // Top expense category
  const topExpenseCategory = expenseCategories[0];

  // Open modal handlers
  const handleOpenAddModal = (type: TransactionType = 'expense') => {
    setEditingTransaction(null);
    setModalInitialType(type);
    setIsModalOpen(true);
  };

  const handleEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    setModalInitialType(tx.type);
    setIsModalOpen(true);
  };

  // Submit transaction (Add or Edit)
  const handleSaveTransaction = async (data: {
    type: TransactionType;
    amount: number;
    category: string;
    note: string;
    date: string;
  }) => {
    if (editingTransaction) {
      await updateTransaction(editingTransaction.id, activeUserId, data);
      showToast('แก้ไขข้อมูลรายการเรียบร้อยแล้ว');
    } else {
      await createTransaction(activeUserId, data);
      showToast(data.type === 'income' ? 'บันทึกรายรับเรียบร้อยแล้ว' : 'บันทึกรายจ่ายเรียบร้อยแล้ว');
    }
  };

  // Delete transaction
  const handleDeleteTransaction = async (id: string) => {
    await deleteTransaction(id, activeUserId);
    showToast('ลบรายการเรียบร้อยแล้ว');
  };

  // Seed sample data for testing
  const handleSeedData = async () => {
    try {
      await seedSampleTransactions(activeUserId);
      showToast('โหลดข้อมูลตัวอย่างสำหรับทดสอบเรียบร้อยแล้ว');
    } catch (err: any) {
      console.error('Seed error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-emerald-100 selection:text-emerald-900 relative">
      {/* Success Notification Toast */}
      {successToast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white rounded-2xl shadow-xl border border-slate-700/50 text-xs font-semibold animate-bounce-short">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        user={user}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onCurrentMonth={handleCurrentMonth}
        onOpenAddModal={() => handleOpenAddModal('expense')}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        onSeedData={handleSeedData}
        hasTransactions={allTransactions.length > 0}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {/* Auth Error Banner */}
        {authError && (
          <div className="flex items-center justify-between p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{authError}</span>
            </div>
            <button
              onClick={() => setAuthError(null)}
              className="text-rose-600 hover:text-rose-800 font-semibold underline ml-4"
            >
              ปิด
            </button>
          </div>
        )}

        {/* Not logged in: Show Google Sign-in Welcome Banner */}
        {!user && !isAuthLoading && (
          <AuthBanner onSignIn={handleSignIn} isLoading={isAuthLoading} />
        )}

        {/* Monthly Summary Cards (Income, Expense, Net/Savings) */}
        <MonthlySummary
          summary={summary}
          month={selectedMonth}
          year={selectedYear}
          onOpenAddModal={handleOpenAddModal}
        />

        {/* Budget Insights & CSV Export */}
        <BudgetInsights
          summary={summary}
          topExpenseCategory={topExpenseCategory}
          dailyComparison={dailyComparison}
          transactions={monthlyTransactions}
          monthName={`${selectedMonth}/${selectedYear + 543}`}
        />

        {/* Analytics Charts Section (Category Donut, Daily Bar, Annual Trend) */}
        <AnalyticsCharts
          expenseCategories={expenseCategories}
          incomeCategories={incomeCategories}
          dailyComparison={dailyComparison}
          monthlyTrends={monthlyTrends}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          totalExpense={summary.totalExpense}
          totalIncome={summary.totalIncome}
        />

        {/* Transaction History List with Search & Filters */}
        <TransactionList
          transactions={monthlyTransactions}
          onEdit={handleEditTransaction}
          onDelete={handleDeleteTransaction}
          onOpenAddModal={() => handleOpenAddModal('expense')}
        />

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <img 
              src="/pvclogo.png" 
              alt="วิทยาลัยอาชีวศึกษาแพร่" 
              className="w-6 h-6 object-contain rounded-full border border-slate-200"
              referrerPolicy="no-referrer"
            />
            <p className="font-medium text-slate-700">
              วิทยาลัยอาชีวศึกษาแพร่ &bull; MoneyDB ระบบจัดการรายรับรายจ่าย
            </p>
          </div>
          <p className="text-slate-400">
            เชื่อมต่อ Cloud Database บน Firebase &bull; รองรับการเข้าสู่ระบบด้วย Google
          </p>
        </div>
      </footer>

      {/* Transaction Add / Edit Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveTransaction}
        initialData={editingTransaction}
        initialType={modalInitialType}
        currentYear={selectedYear}
        currentMonth={selectedMonth}
      />

      {/* Floating Action Button on Mobile */}
      <button
        id="floating-add-btn"
        onClick={() => handleOpenAddModal('expense')}
        title="บันทึกรายการ"
        className="sm:hidden fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-emerald-600 text-white shadow-xl flex items-center justify-center hover:bg-emerald-700 active:scale-95 transition-all"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>

    </div>
  );
}
