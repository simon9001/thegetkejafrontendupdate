// frontend/src/pages/Auth/Login.tsx
import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  // auto clear messages
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(''), 5000);
    return () => clearTimeout(t);
  }, [error]);

  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => setSuccess(''), 3500);
    return () => clearTimeout(t);
  }, [success]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const result = await login({ email, password }).unwrap();

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

      setSuccess('Login successful');

      setTimeout(() => {
        navigate(from, { replace: true });
      }, 1200);

    } catch (err: any) {
      const code = err?.data?.code;

      if (code === 'EMAIL_NOT_VERIFIED') {
        setError('Please verify your email first');
        setTimeout(() => {
          navigate(`/verify-email?email=${encodeURIComponent(email)}`);
        }, 1800);

      } else if (code === 'ACCOUNT_LOCKED') {
        setError('Account temporarily locked');

      } else if (code === 'ACCOUNT_BANNED') {
        setError('Account suspended');

      } else if (code === 'INVALID_CREDENTIALS') {
        setError('Invalid email or password');

      } else {
        setError(err?.data?.message || 'Login failed');
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-5 py-3 relative">

      {/* Back */}
      {onToggle && (
        <button onClick={onToggle} className="absolute left-3 top-3 cursor-pointer">
          <ArrowLeft className="w-4 h-4" />
        </button>
      )}

      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="text-xl font-bold">Welcome Back</h1>
        <p className="text-xs text-gray-500">Sign in to continue</p>
      </div>

      {/* Messages */}
      <AnimatePresence mode="wait">
        {success && (
          <motion.p
            key="success"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-xs text-green-600 mb-2"
          >
            {success}
          </motion.p>
        )}

        {error && (
          <motion.p
            key="error"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-xs text-red-500 mb-2"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-3">

        {/* Email */}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          disabled={isLoading}
          className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
        />

        {/* Password */}
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            disabled={isLoading}
            className="w-full px-3 py-2 border rounded-lg text-sm pr-10 focus:outline-none focus:ring-1 focus:ring-gray-300"
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2 cursor-pointer text-gray-400 hover:text-black"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {/* Forgot password */}
        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-xs text-gray-500 hover:text-black cursor-pointer"
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 bg-black text-white rounded-lg text-sm cursor-pointer hover:opacity-90 transition active:scale-[0.98]"
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>

      </form>

      {/* Toggle */}
      <p className="text-center text-xs mt-3">
        Don’t have an account?{' '}
        <button
          type="button"
          onClick={onToggle}
          className="text-blue-600 font-semibold cursor-pointer"
        >
          Sign up
        </button>
      </p>
    </div>
  );
};

export default Login;