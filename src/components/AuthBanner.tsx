import React from 'react';
import { ShieldCheck, Database, LogIn, Sparkles, CheckCircle2 } from 'lucide-react';

interface AuthBannerProps {
  onSignIn: () => void;
  isLoading?: boolean;
}

export const AuthBanner: React.FC<AuthBannerProps> = ({ onSignIn, isLoading }) => {
  return (
    <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden mb-6">
      {/* Background glow effects */}
      <div className="absolute -top-12 -right-12 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold mb-3">
            <Database className="w-3.5 h-3.5" />
            <span>Firebase MoneyDB Cloud Storage</span>
          </div>
          
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            จัดการรายรับรายจ่าย วิเคราะห์การเงินส่วนบุคคล
          </h2>
          
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            เชื่อมต่อข้อมูลอัตโนมัติผ่านฐานข้อมูล Firebase <span className="font-semibold text-emerald-300">MoneyDB</span> เข้าสู่ระบบด้วย Gmail เพื่อซิงก์ข้อมูลของคุณอย่างปลอดภัยได้จากทุกอุปกรณ์
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>สรุปผลเปรียบเทียบรายเดือน</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>กราฟวิเคราะห์สัดส่วนการเงิน</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>ซิงก์ข้อมูลบน Firebase Realtime</span>
            </div>
          </div>
        </div>

        {/* Login Action */}
        <div className="shrink-0 w-full md:w-auto">
          <button
            id="google-signin-banner-btn"
            onClick={onSignIn}
            disabled={isLoading}
            className="w-full md:w-auto flex items-center justify-center gap-3 px-6 py-3.5 bg-white text-slate-800 hover:bg-slate-100 active:bg-slate-200 rounded-2xl font-bold text-sm shadow-lg hover:shadow-xl transition-all disabled:opacity-60 cursor-pointer"
          >
            <img 
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
              alt="Google" 
              className="w-5 h-5"
            />
            <span>{isLoading ? 'กำลังเชื่อมต่อ...' : 'เข้าสู่ระบบด้วย Gmail (Google)'}</span>
          </button>
          <p className="text-[11px] text-slate-400 text-center mt-2">
            บันทึกและแยกข้อมูลตามบัญชี Google ของท่าน
          </p>
        </div>
      </div>
    </div>
  );
};
