import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  User as UserIcon, 
  AlertCircle, 
  CheckCircle2, 
  ExternalLink,
  KeyRound,
  ArrowRight
} from 'lucide-react';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  sendPasswordResetEmail 
} from '../lib/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type AuthMode = 'signin' | 'signup' | 'forgot';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [unauthorizedDomain, setUnauthorizedDomain] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetState = () => {
    setError(null);
    setSuccessMessage(null);
    setUnauthorizedDomain(null);
  };

  const switchMode = (newMode: AuthMode) => {
    resetState();
    setMode(newMode);
  };

  // Map Firebase auth errors into clear Thai messages
  const getErrorMessage = (err: any): string => {
    const code = err.code || '';
    if (code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
      return 'อีเมลหรือรหัสผ่านไม่ถูกต้อง หรือยังไม่ได้สมัครสมาชิกด้วยอีเมลนี้';
    }
    if (code === 'auth/user-not-found') {
      return 'ไม่พบบัญชีผู้ใช้นี้ในระบบ กรุณาตรวจสอบอีเมลหรือคลิก "สมัครสมาชิกใหม่"';
    }
    if (code === 'auth/email-already-in-use') {
      return 'อีเมลนี้ถูกใช้งานแล้ว กรุณาเลือก "เข้าสู่ระบบ" หรือกู้คืนรหัสผ่าน';
    }
    if (code === 'auth/weak-password') {
      return 'รหัสผ่านสั้นเกินไป ต้องมีความยาวอย่างน้อย 6 ตัวอักษรขึ้นไป';
    }
    if (code === 'auth/invalid-email') {
      return 'รูปแบบอีเมลไม่ถูกต้อง กรุณาตรวจสอบที่อยู่อีเมลของคุณ';
    }
    if (code === 'auth/operation-not-allowed') {
      return 'ระบบ Email/Password ยังไม่ได้เปิดใช้งานใน Firebase Console (เข้าที่ Authentication > Sign-in method > Email/Password แล้วกด Enable)';
    }
    if (code === 'auth/too-many-requests') {
      return 'มีการลองเข้าสู่ระบบล้มเหลวหลายครั้งเกินไป โปรดรอ 1-2 นาทีแล้วลองใหม่';
    }
    if (code === 'auth/popup-blocked') {
      return 'เบราว์เซอร์บล็อกหน้าต่างป๊อปอัป กรุณาอนุญาตป๊อปอัป หรือใช้การกรอกอีเมลและรหัสผ่านด้านล่างนี้';
    }
    if (code === 'auth/unauthorized-domain') {
      const domain = typeof window !== 'undefined' ? window.location.hostname : 'domain';
      setUnauthorizedDomain(domain);
      return `โดเมน "${domain}" ยังไม่ได้รับอนุญาตให้ใช้ Google Sign-In ใน Firebase Console`;
    }
    return err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง';
  };

  // Handle Email & Password Sign In
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await signInWithEmailAndPassword(auth, email.trim(), password);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Email sign in error:', err);
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Email & Password Sign Up
  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน');
      return;
    }
    if (password.length < 6) {
      setError('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      
      if (displayName.trim() && userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: displayName.trim()
        });
      }

      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Email sign up error:', err);
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Forgot Password
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('กรุณาระบุอีเมลที่ต้องการรีเซ็ตรหัสผ่าน');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await sendPasswordResetEmail(auth, email.trim());
      setSuccessMessage(`ระบบได้ส่งลิงก์ตั้งรหัสผ่านใหม่ไปยัง "${email.trim()}" เรียบร้อยแล้ว โปรดตรวจสอบในกล่องข้อความหรือสแปม`);
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google 1-Click Sign In
  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      setError(null);
      setUnauthorizedDomain(null);
      await signInWithPopup(auth, googleProvider);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Google sign in error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        // User closed window, don't show error
        return;
      }
      setError(getErrorMessage(err));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-8 text-slate-800 my-8 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          title="ปิด"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with College & MoneyDB Logo */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full border border-slate-200 bg-white p-0.5 shadow-xs shrink-0">
            <img 
              src="/pvclogo.png" 
              alt="วิทยาลัยอาชีวศึกษาแพร่" 
              className="w-full h-full object-contain rounded-full"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900 leading-tight">
              {mode === 'signin' && 'เข้าสู่ระบบ MoneyDB'}
              {mode === 'signup' && 'สมัครสมาชิกใหม่'}
              {mode === 'forgot' && 'รีเซ็ตรหัสผ่าน'}
            </h3>
            <p className="text-xs text-slate-500">
              วิทยาลัยอาชีวศึกษาแพร่ &bull; ระบบบัญชีคลาวด์
            </p>
          </div>
        </div>

        {/* Tab Toggle (Sign In / Sign Up) */}
        {mode !== 'forgot' && (
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl mb-5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => switchMode('signin')}
              className={`py-2 rounded-lg transition-all ${
                mode === 'signin'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              เข้าสู่ระบบ (Sign In)
            </button>
            <button
              type="button"
              onClick={() => switchMode('signup')}
              className={`py-2 rounded-lg transition-all ${
                mode === 'signup'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              สมัครสมาชิก (Register)
            </button>
          </div>
        )}

        {/* Notifications / Error Banner */}
        {error && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1.5 flex-1">
              <p>{error}</p>
              {unauthorizedDomain && (
                <div className="pt-1 text-[11px] text-rose-700 space-y-1 border-t border-rose-200/60">
                  <p>
                    💡 <strong>วิธีแก้ไข:</strong> คุณสามารถพิมพ์ <strong>อีเมลและรหัสผ่าน</strong> ในแบบฟอร์มด้านล่างนี้เพื่อเข้าใช้งานได้ทันที 100% หรือเพิ่มโดเมนใน Firebase Console
                  </p>
                  <a
                    href="https://console.firebase.google.com/project/moneydb-ff416/authentication/settings"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-bold underline text-rose-800 hover:text-rose-950"
                  >
                    เปิด Firebase Console &gt; Authorized domains (moneydb-ff416) <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="flex-1">{successMessage}</p>
          </div>
        )}

        {/* Email & Password Forms */}
        {mode === 'forgot' ? (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                ระบุอีเมลของคุณ
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com หรือ gmail.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold rounded-xl text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? 'กำลังส่งข้อมูล...' : 'ส่งลิงก์ตั้งรหัสผ่านใหม่'}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => switchMode('signin')}
                className="text-xs text-slate-600 hover:text-emerald-700 font-medium underline"
              >
                &larr; กลับไปหน้าเข้าสู่ระบบ
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={mode === 'signin' ? handleEmailSignIn : handleEmailSignUp} className="space-y-3.5">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ชื่อผู้ใช้งาน / ชื่อที่แสดง
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="เช่น สมชาย ใจดี"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                อีเมล (Email)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="เช่น siriwimol4753@gmail.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  รหัสผ่าน (Password)
                </label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => switchMode('forgot')}
                    className="text-[11px] text-emerald-600 hover:text-emerald-800 font-medium"
                  >
                    ลืมรหัสผ่าน?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'signup' ? 'กำหนดรหัสผ่านอย่างน้อย 6 ตัวอักษร' : 'รหัสผ่านของคุณ'}
                  required
                  minLength={6}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  title={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold rounded-xl text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? (
                'กำลังดำเนินการ...'
              ) : mode === 'signin' ? (
                <>
                  <span>เข้าสู่ระบบด้วยอีเมล</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>สร้างบัญชีผู้ใช้ใหม่</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Divider */}
        {mode !== 'forgot' && (
          <>
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs text-slate-400">
                <span className="px-3 bg-white">หรือเข้าใช้งานด้วย 1-Click</span>
              </div>
            </div>

            {/* Google Sign In Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-300 hover:border-slate-400 rounded-xl text-sm font-semibold text-slate-700 shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              <img 
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                alt="Google" 
                className="w-4 h-4" 
              />
              <span>{isGoogleLoading ? 'กำลังเปิดหน้าต่าง Google...' : 'เข้าสู่ระบบด้วย Google (Gmail)'}</span>
            </button>
          </>
        )}

        {/* Helper Note */}
        <div className="mt-6 pt-4 border-t border-slate-100 text-center text-[11px] text-slate-400">
          ข้อมูลถูกจัดเก็บบนคลาวด์ Firebase MoneyDB ปลอดภัยและแยกตามบัญชีผู้ใช้งาน
        </div>
      </div>
    </div>
  );
};
