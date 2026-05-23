// frontend/src/pages/Auth/Register.tsx
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useRegisterMutation } from '../../features/Api/AuthApi';

interface RegisterProps {
  onToggle?: () => void;
  isEmbedded?: boolean;
}

// ---------------------------------------------------------------------------
// Password strength
// ---------------------------------------------------------------------------
interface PasswordRule {
  label: string;
  test: (pw: string) => boolean;
}

const PASSWORD_RULES: PasswordRule[] = [
  { label: 'At least 8 characters', test: (pw) => pw.length >= 8 },
  { label: 'Contains a letter', test: (pw) => /[A-Za-z]/.test(pw) },
  { label: 'Contains a number', test: (pw) => /\d/.test(pw) },
  { label: 'Contains a special character (@$!%*#?&)', test: (pw) => /[@$!%*#?&]/.test(pw) },
];

const PasswordStrength: React.FC<{ password: string }> = ({ password }) => {
  if (!password) return null;
  return (
    <div className="mt-1.5 space-y-0.5">
      {PASSWORD_RULES.map((rule) => {
        const ok = rule.test(password);
        return (
          <div key={rule.label} className={`flex items-center gap-1.5 text-[11px] ${ok ? 'text-green-600' : 'text-gray-400'}`}>
            {ok ? (
              <CheckCircle2 className="w-3 h-3 shrink-0 text-green-600" />
            ) : (
              <XCircle className="w-3 h-3 shrink-0 text-gray-400" />
            )}
            <span className={ok ? 'text-green-700' : 'text-gray-500'}>{rule.label}</span>
          </div>
        );
      })}
    </div>
  );
};

const isPasswordValid = (pw: string) => PASSWORD_RULES.every((r) => r.test(pw));

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const Register: React.FC<RegisterProps> = ({ onToggle }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [register, { isLoading }] = useRegisterMutation();

  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(''), 6000);
    return () => clearTimeout(t);
  }, [error]);

  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => setSuccess(''), 3000);
    return () => clearTimeout(t);
  }, [success]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (fieldErrors[e.target.name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[e.target.name];
        return next;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.full_name.trim() || formData.full_name.trim().length < 2) {
      errors.full_name = 'Full name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Valid email is required';
    }

    if (formData.phone && !/^\+?[\d\s\-()]{7,15}$/.test(formData.phone)) {
      errors.phone = 'Invalid phone number format';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (!isPasswordValid(formData.password)) {
      errors.password = 'Password must be 8+ chars with a letter, number & special character (@$!%*#?&)';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (!termsAccepted) {
      errors.terms = 'You must accept the Terms & Conditions to continue';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    try {
      await register({
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        password: formData.password,
      }).unwrap();

      setSuccess('Account created! Check your email to verify.');

      setTimeout(() => {
        navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`);
      }, 2000);
    } catch (err: any) {
      const issues = err?.data?.errors as Array<{ message: string }> | undefined;
      if (issues?.length) {
        setError(issues.map((i) => i.message).join(' · '));
        return;
      }
      setError(err?.data?.message ?? 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-5 py-4 relative">
      {/* Back Button */}
      <button
        onClick={onToggle}
        className="absolute left-3 top-3 text-gray-400 hover:text-[#50757A] transition-colors"
        aria-label="Back to sign in"
      >
        <ArrowLeft className="w-4 h-4" />
      </button>

      {/* Header */}
      <div className="text-center mb-5">
        <h1 className="text-2xl font-bold text-[#50757A] mb-1">Create account</h1>
        <p className="text-gray-500 text-xs">Start your journey with us</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Full Name */}
        <div>
          <label className="text-xs font-semibold text-gray-700 block mb-1">
            Full name
          </label>
          <input
            type="text"
            name="full_name"
            value={formData.full_name}
            onChange={handleInputChange}
            placeholder="Simon Gatungo"
            required
            disabled={isLoading}
            className={`w-full px-3 py-2 bg-white border ${
              fieldErrors.full_name ? 'border-red-400' : 'border-gray-300'
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C0D6DF] focus:border-transparent transition-all text-gray-800 placeholder:text-gray-400 text-sm`}
          />
          {fieldErrors.full_name && (
            <p className="text-[10px] text-red-500 mt-0.5">{fieldErrors.full_name}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="text-xs font-semibold text-gray-700 block mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="simongatungo300@gmail.com"
            required
            disabled={isLoading}
            className={`w-full px-3 py-2 bg-white border ${
              fieldErrors.email ? 'border-red-400' : 'border-gray-300'
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C0D6DF] focus:border-transparent transition-all text-gray-800 placeholder:text-gray-400 text-sm`}
          />
          {fieldErrors.email && (
            <p className="text-[10px] text-red-500 mt-0.5">{fieldErrors.email}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="text-xs font-semibold text-gray-700 block mb-1">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              placeholder="••••••••"
              required
              disabled={isLoading}
              className={`w-full px-3 py-2 bg-white border ${
                fieldErrors.password ? 'border-red-400' : 'border-gray-300'
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C0D6DF] focus:border-transparent transition-all text-gray-800 placeholder:text-gray-400 pr-10 text-sm`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#50757A] transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {/* Password strength indicator */}
          {(passwordFocused || formData.password) && (
            <PasswordStrength password={formData.password} />
          )}
          {fieldErrors.password && !passwordFocused && (
            <p className="text-[10px] text-red-500 mt-0.5">{fieldErrors.password}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="text-xs font-semibold text-gray-700 block mb-1">
            Confirm password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="••••••••"
              required
              disabled={isLoading}
              className={`w-full px-3 py-2 bg-white border ${
                fieldErrors.confirmPassword ? 'border-red-400' : 'border-gray-300'
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C0D6DF] focus:border-transparent transition-all text-gray-800 placeholder:text-gray-400 pr-10 text-sm`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#50757A] transition-colors"
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {fieldErrors.confirmPassword && (
            <p className="text-[10px] text-red-500 mt-0.5">{fieldErrors.confirmPassword}</p>
          )}
        </div>

        {/* Terms & Conditions */}
        <div className="mt-2">
          <label className={`flex items-start gap-2 cursor-pointer ${fieldErrors.terms ? 'text-red-500' : 'text-gray-600'}`}>
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => {
                setTermsAccepted(e.target.checked);
                if (e.target.checked && fieldErrors.terms) {
                  setFieldErrors((prev) => { const next = { ...prev }; delete next.terms; return next; });
                }
              }}
              disabled={isLoading}
              className="mt-0.5 w-3.5 h-3.5 rounded border-gray-300 text-[#50757A] focus:ring-[#C0D6DF]"
            />
            <span className="text-xs leading-relaxed">
              I agree to{' '}
              <Link to="/terms" target="_blank" className="text-[#50757A] font-semibold hover:text-[#DD6E42] hover:underline">
                Terms & Conditions
              </Link>
            </span>
          </label>
          {fieldErrors.terms && (
            <p className="text-[10px] text-red-500 mt-1">{fieldErrors.terms}</p>
          )}
        </div>

        {/* Messages */}
        <AnimatePresence mode="wait">
          {success && (
            <motion.div 
              key="success" 
              initial={{ opacity: 0, y: -5 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0 }}
              className="p-2 bg-green-50 border border-green-200 rounded-lg text-green-700 text-xs text-center"
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
              className="p-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs text-center"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !!success || !termsAccepted}
          className="w-full py-2.5 bg-[#50757A] text-white font-semibold rounded-lg hover:bg-[#3d5a5e] transition-all shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2 mt-1"
        >
          {isLoading && <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />}
          <span>{isLoading ? 'Creating account...' : success ? 'Success!' : 'Sign up'}</span>
        </button>

        {/* Toggle to Login */}
        <p className="text-center text-gray-500 text-xs mt-3">
          Already have an account?{' '}
          <button 
            type="button" 
            onClick={onToggle}
            className="text-[#50757A] font-semibold hover:text-[#DD6E42] transition-colors"
          >
            Sign in
          </button>
        </p>
      </form>
    </div>
  );
};

export default Register;