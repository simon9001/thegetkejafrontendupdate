// frontend/src/pages/Auth/Login.tsx
import React, { useState } from 'react';
import { Twitter, Facebook, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLoginMutation } from '../../features/Api/AuthApi';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../features/Slice/AuthSlice';
import { useNavigate, useLocation, Link } from 'react-router-dom';

interface LoginProps {
  onToggle?: () => void;
  isEmbedded?: boolean;
}

const Login: React.FC<LoginProps> = ({ onToggle }) => {
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [login, { isLoading }] = useLoginMutation();
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const location   = useLocation();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  // Auto-clear messages
  React.useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(''), 5000);
    return () => clearTimeout(t);
  }, [error]);

  React.useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => setSuccess(''), 3000);
    return () => clearTimeout(t);
  }, [success]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // On success (200) the backend returns { message, code, user, accessToken, refreshToken }
      const result = await login({ email, password }).unwrap();

      // Store tokens + user in Redux / localStorage
      dispatch(
        setCredentials({
          user: {
            id: result.user.id,
            email: result.user.email,
            roles: result.user.roles,
          },
          tokens: {
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
          },
        }),
      );

      setSuccess('Login successful! Redirecting…');
      setTimeout(() => navigate(from, { replace: true }), 1500);
    } catch (err: any) {
      // RTK Query surfaces 4xx/5xx as rejected promises with err.data
      const code    = err?.data?.code as string | undefined;
      const message = err?.data?.message as string | undefined;

      if (code === 'EMAIL_NOT_VERIFIED') {
        // Backend returns 403 with optional userId + canResend
        setError('Please verify your email before logging in.');
        const userId = err?.data?.userId as string | undefined;
        setTimeout(() => {
          // Redirect to verify-email page; pass email so resend pre-fills
          navigate(
            `/verify-email?email=${encodeURIComponent(email)}${userId ? `&userId=${userId}` : ''}`,
          );
        }, 2000);
      } else if (code === 'ACCOUNT_LOCKED') {
        setError('Account temporarily locked. Please try again later.');
      } else if (code === 'ACCOUNT_BANNED') {
        setError('Your account has been suspended. Contact support.');
      } else if (code === 'INVALID_CREDENTIALS') {
        setError('Invalid email or password.');
      } else {
        setError(message ?? 'Login failed. Please try again.');
      }
    }
  };

  return (
    <div className="w-full max-w-xs mx-auto px-5 py-6">
      {/* Header */}
      <div className="text-center mb-5">
        <h1 className="text-2xl font-bold text-[#1B2430] mb-0.5">Sign In</h1>
        <p className="text-[#C5A373] text-xs font-medium">Welcome, Friend!</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label className="text-[10px] font-bold text-[#8B6E4E] uppercase tracking-wider block mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@getkeja.com"
            required
            disabled={isLoading}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C5A373] focus:border-[#C5A373] focus:bg-white transition-all text-xs text-[#1B2430] placeholder:text-gray-400 placeholder:text-[10px]"
          />
        </div>

        {/* Password */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-[10px] font-bold text-[#8B6E4E] uppercase tracking-wider">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-[10px] font-bold text-[#C5A373] hover:text-[#8B6E4E] transition-colors uppercase tracking-wider"
            >
              Forgot?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={isLoading}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C5A373] focus:border-[#C5A373] focus:bg-white transition-all text-sm text-[#1B2430] placeholder:text-gray-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#C5A373] transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Messages */}
        <AnimatePresence mode="wait">
          {success && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-2 bg-green-50 border border-green-200 rounded-lg text-green-700 text-[10px] text-center"
            >
              {success}
            </motion.div>
          )}
          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-[10px] text-center"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 bg-[#C5A373] text-white font-bold rounded-lg hover:bg-[#8B6E4E] transition-all shadow-sm shadow-[#C5A373]/30 active:scale-[0.98] disabled:opacity-50 text-xs uppercase tracking-wider flex items-center justify-center gap-2"
        >
          {isLoading && (
            <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />
          )}
          <span>{isLoading ? 'SIGNING IN…' : 'SIGN IN'}</span>
        </button>

        {/* Toggle to Register */}
        <p className="text-center">
          <button
            type="button"
            onClick={onToggle}
            className="text-[#C5A373] font-bold hover:text-[#8B6E4E] transition-colors text-xs uppercase tracking-wider"
          >
            SIGN UP
          </button>
        </p>

        {/* Social */}
        <div className="pt-3">
          <div className="flex items-center justify-center gap-2.5">
            {/* Google */}
            <a
              href="/api/auth/google"
              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 bg-white text-[#1B2430] hover:border-[#C5A373] hover:bg-[#FCFAF2] transition-all"
              aria-label="Sign in with Google"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            </a>
            <button
              type="button"
              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 bg-white text-[#1B2430] hover:border-[#C5A373] hover:bg-[#FCFAF2] transition-all"
              aria-label="Sign in with Twitter"
            >
              <Twitter className="w-3.5 h-3.5 fill-current" />
            </button>
            <button
              type="button"
              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 bg-white text-[#1B2430] hover:border-[#C5A373] hover:bg-[#FCFAF2] transition-all"
              aria-label="Sign in with Facebook"
            >
              <Facebook className="w-3.5 h-3.5 fill-current" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Login;