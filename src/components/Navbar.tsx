import React from 'react';
import { 
  Wallet, 
  LogIn, 
  LogOut, 
  Plus, 
  Database,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Sparkles
} from 'lucide-react';
import { User } from '../lib/firebase';
import { THAI_MONTHS } from '../types';

interface NavbarProps {
  user: User | null;
  selectedYear: number;
  selectedMonth: number; // 1-12
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onCurrentMonth: () => void;
  onOpenAddModal: () => void;
  onSignIn: () => void;
  onSignOut: () => void;
  onSeedData?: () => void;
  hasTransactions: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  selectedYear,
  selectedMonth,
  onPrevMonth,
  onNextMonth,
  onCurrentMonth,
  onOpenAddModal,
  onSignIn,
  onSignOut,
  onSeedData,
  hasTransactions,
}) => {
  const currentThaiYear = selectedYear + 543;
  const monthName = THAI_MONTHS[selectedMonth - 1];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          
          {/* Logo & Database Badge */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center justify-center w-11 h-11 rounded-full bg-white shadow-xs border border-slate-200/80 p-0.5 overflow-hidden">
              <img 
                src="/pvclogo.png" 
                alt="ตราสัญลักษณ์ วิทยาลัยอาชีวศึกษาแพร่" 
                className="w-full h-full object-contain rounded-full"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg sm:text-xl tracking-tight text-slate-900">
                  Money<span className="text-emerald-600">DB</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  <Database className="w-3 h-3 text-emerald-500" />
                  Firebase
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                วิทยาลัยอาชีวศึกษาแพร่ &bull; ระบบจัดการรายรับรายจ่าย
              </p>
            </div>
          </div>

          {/* Month Selector in Center */}
          <div className="flex items-center bg-slate-100/90 rounded-xl p-1 border border-slate-200">
            <button
              id="prev-month-btn"
              onClick={onPrevMonth}
              title="เดือนก่อนหน้า"
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              id="current-month-btn"
              onClick={onCurrentMonth}
              title="คลิกเพื่อกลับไปเดือนปัจจุบัน"
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs sm:text-sm font-semibold text-slate-800 hover:bg-white hover:shadow-xs transition-all"
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span>{monthName} {currentThaiYear}</span>
            </button>
            <button
              id="next-month-btn"
              onClick={onNextMonth}
              title="เดือนถัดไป"
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Actions & User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Sample Data (if empty) */}
            {!hasTransactions && onSeedData && (
              <button
                id="seed-sample-btn"
                onClick={onSeedData}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors"
                title="ใส่ข้อมูลตัวอย่างเพื่อดูผลการสรุปและกราฟทันที"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>โหลดข้อมูลตัวอย่าง</span>
              </button>
            )}

            {/* Add Transaction Button */}
            <button
              id="add-transaction-nav-btn"
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 shadow-sm hover:shadow transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">บันทึกรายการ</span>
              <span className="sm:hidden">บันทึก</span>
            </button>

            {/* Auth Button / Profile */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="relative group">
                  <div className="flex items-center gap-2 cursor-pointer p-1 rounded-lg hover:bg-slate-100 transition-colors">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName || 'Google User'}
                        className="w-8 h-8 rounded-full border border-slate-300 object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-semibold flex items-center justify-center text-xs">
                        {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                    <div className="hidden lg:block text-left text-xs leading-tight">
                      <p className="font-semibold text-slate-800 max-w-[130px] truncate">
                        {user.displayName || 'ผู้ใช้งาน Google'}
                      </p>
                      <p className="text-slate-500 max-w-[130px] truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  id="signout-btn"
                  onClick={onSignOut}
                  title="ออกจากระบบ"
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                id="signin-btn"
                onClick={onSignIn}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 shadow-xs transition-all"
              >
                <img 
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                  alt="Google" 
                  className="w-4 h-4"
                />
                <span className="hidden sm:inline">เข้าสู่ระบบด้วย Gmail</span>
                <span className="sm:hidden">เข้าสู่ระบบ</span>
              </button>
            )}

          </div>
        </div>
      </div>
    </header>
  );
};
