import { useState } from 'react';
import { useAuth } from '../contexts/auth-context';
import { Lock, Mail, LogIn, Eye, EyeOff, ShieldCheck, Activity } from 'lucide-react';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login({ email, password });
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">

      {/* LEFT SIDE */}
      <div className="hidden md:flex flex-1 flex-col justify-between px-16 py-12 bg-[var(--dark-gradient)] text-white relative overflow-hidden">

        {/* Glow Effects */}
        <div className="absolute top-[-100px] right-[-100px] w-[400px] h-[400px] bg-teal-500/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-120px] left-[-120px] w-[300px] h-[300px] bg-blue-500/20 blur-[100px] rounded-full"></div>

        <div className="relative z-10 max-w-lg">

          {/* Logo */}
          <div className="flex items-center gap-3 mb-16">
            <div className="w-11 h-11 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
              <Activity className="w-6 h-6 text-teal-300" />
            </div>
            <span className="text-2xl font-semibold tracking-tight">PharmaCenter</span>
          </div>

          {/* Heading */}
          <h1 className="text-[56px] font-bold leading-[1.1] mb-6">
            Precision in <br />
            <span className="text-teal-300">Pharmacy Care.</span>
          </h1>

          {/* Subtext */}
          <p className="text-lg text-white/70 leading-relaxed mb-10">
            Experience the next generation of inventory control. Secure, fast,
            and designed for modern healthcare professionals.
          </p>

          {/* Features */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-teal-300" />
              <span className="text-sm text-white/80">Enterprise-grade Security</span>
            </div>

            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-teal-300" />
              <span className="text-sm text-white/80">Real-time Inventory Analytics</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-sm text-white/40">
          © 2026 PharmaCenter Management System v1.0
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative">

        {/* Background Glow */}
        <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-teal-400/20 blur-[100px] rounded-full"></div>

        <div className="w-full max-w-[420px] relative z-10">

          {/* LOGIN CARD */}
          <div className="login-card">

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Welcome back, Mehak.</h2>
              <p className="text-white/60 text-sm">Sign in to continue</p>
            </div>

            {error && (
              <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* EMAIL */}
              <div className="space-y-2">
                <label className="text-sm text-white/70">Email</label>

               <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" size={18} />
  
                <input
                  type="email"
                  className="input !pl-14 !pr-4"
                  placeholder="you@pharmacy.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              </div>

              {/* PASSWORD */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm text-white/70">Password</label>
                  <span className="text-xs text-teal-300 cursor-pointer hover:underline">
                    Forgot?
                  </span>
                </div>

                <div className="relative group">
  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" size={18} />

  <input
    type={showPassword ? 'text' : 'password'}
    className="input !pl-14 !pr-14"
    placeholder="••••••••"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    required
  />

  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-white transition"
  >
    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
  </button>
</div>
              </div>

              {/* BUTTON */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-[50px] rounded-xl font-semibold text-white 
                bg-gradient-to-r from-teal-500 to-teal-700
                hover:from-teal-400 hover:to-teal-600
                transition-all duration-300
                shadow-lg hover:shadow-teal-500/40
                hover:-translate-y-[2px] active:scale-[0.98]
                flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <LogIn size={18} />
                    Sign In
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/10 text-center text-sm text-white/50">
              Need help? <span className="text-teal-300 cursor-pointer hover:underline">Contact Support</span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}