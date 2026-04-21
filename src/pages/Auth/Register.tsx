// frontend/src/pages/Auth/Register.tsx
import React, { useState, useEffect } from 'react';
import { Twitter, Facebook, ArrowLeft, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useRegisterMutation } from '../../features/Api/AuthApi';

interface RegisterProps {
  onToggle?: () => void;
  isEmbedded?: boolean;
}

// ---------------------------------------------------------------------------
// Password strength — mirrors the backend Zod passwordSchema exactly
// ---------------------------------------------------------------------------
interface PasswordRule {
  label: string;
  test: (pw: string) => boolean;
}

const PASSWORD_RULES: PasswordRule[] = [
  { label: 'At least 8 characters',                        test: (pw) => pw.length >= 8 },
  { label: 'Contains a letter',                            test: (pw) => /[A-Za-z]/.test(pw) },
  { label: 'Contains a number',                            test: (pw) => /\d/.test(pw) },
  { label: 'Contains a special character (@$!%*#?&)',      test: (pw) => /[@$!%*#?&]/.test(pw) },
];

const PasswordStrength: React.FC<{ password: string }> = ({ password }) => {
  if (!password) return null;
  return (
    <ul className="mt-1.5 space-y-0.5">
      {PASSWORD_RULES.map((rule) => {
        const ok = rule.test(password);
        return (
          <li key={rule.label} className={`flex items-center gap-1 text-[10px] ${ok ? 'text-green-600' : 'text-gray-400'}`}>
            {ok ? <CheckCircle2 className="w-3 h-3 shrink-0" /> : <XCircle className="w-3 h-3 shrink-0" />}
            {rule.label}
          </li>
        );
      })}
    </ul>
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
  const [error, setError]             = useState('');
  const [success, setSuccess]         = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword]               = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordFocused, setPasswordFocused]         = useState(false);
  const [termsAccepted, setTermsAccepted]             = useState(false);

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

  // Client-side validation mirrors the backend Zod registerSchema exactly.
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

    // phone regex matches backend: /^\+?[\d\s\-()]{7,15}$/
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
      // Surface Zod issues from the backend if any slip past client validation
      const issues = err?.data?.errors as Array<{ message: string }> | undefined;
      if (issues?.length) {
        setError(issues.map((i) => i.message).join(' · '));
        return;
      }
      setError(err?.data?.message ?? 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="w-full max-w-xs mx-auto px-5 py-6 relative">
      {/* Back Button */}
      <button
        onClick={onToggle}
        className="absolute left-4 top-4 text-[#1B2430]/50 hover:text-[#1B2430] transition-colors"
        aria-label="Back to sign in"
      >
        <ArrowLeft className="w-4 h-4" />
      </button>

      {/* Header */}
      <div className="text-center mb-5">
        <h1 className="text-2xl font-bold text-[#1B2430] mb-0.5">Sign Up</h1>
        <p className="text-[#C5A373] text-xs font-medium">Join Us Today!</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Full Name */}
        <div>
          <label className="text-[10px] font-bold text-[#8B6E4E] uppercase tracking-wider block mb-1">
            Full Name
          </label>
          <input
            type="text"
            name="full_name"
            value={formData.full_name}
            onChange={handleInputChange}
            placeholder="Alexander Magnus"
            required
            disabled={isLoading}
            className={`w-full px-3 py-2 bg-gray-50 border ${
              fieldErrors.full_name ? 'border-red-300' : 'border-gray-200'
            } rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C5A373] focus:border-[#C5A373] focus:bg-white transition-all text-xs text-[#1B2430] placeholder:text-gray-400`}
          />
          {fieldErrors.full_name && (
            <p className="text-[10px] text-red-600 mt-0.5">{fieldErrors.full_name}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="text-[10px] font-bold text-[#8B6E4E] uppercase tracking-wider block mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="name@getkeja.com"
            required
            disabled={isLoading}
            className={`w-full px-3 py-2 bg-gray-50 border ${
              fieldErrors.email ? 'border-red-300' : 'border-gray-200'
            } rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C5A373] focus:border-[#C5A373] focus:bg-white transition-all text-xs text-[#1B2430] placeholder:text-gray-400`}
          />
          {fieldErrors.email && (
            <p className="text-[10px] text-red-600 mt-0.5">{fieldErrors.email}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="text-[10px] font-bold text-[#8B6E4E] uppercase tracking-wider block mb-1">
            Phone <span className="font-normal normal-case text-gray-400">(optional)</span>
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="+254 700 000 000"
            disabled={isLoading}
            className={`w-full px-3 py-2 bg-gray-50 border ${
              fieldErrors.phone ? 'border-red-300' : 'border-gray-200'
            } rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C5A373] focus:border-[#C5A373] focus:bg-white transition-all text-xs text-[#1B2430] placeholder:text-gray-400`}
          />
          {fieldErrors.phone && (
            <p className="text-[10px] text-red-600 mt-0.5">{fieldErrors.phone}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="text-[10px] font-bold text-[#8B6E4E] uppercase tracking-wider block mb-1">
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
              placeholder="e.g. MyPass1@"
              required
              disabled={isLoading}
              className={`w-full px-3 py-2 bg-gray-50 border ${
                fieldErrors.password ? 'border-red-300' : 'border-gray-200'
              } rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C5A373] focus:border-[#C5A373] focus:bg-white transition-all text-sm text-[#1B2430]`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#C5A373] transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {/* Live strength indicator */}
          {(passwordFocused || formData.password) && (
            <PasswordStrength password={formData.password} />
          )}
          {fieldErrors.password && !passwordFocused && (
            <p className="text-[10px] text-red-600 mt-0.5">{fieldErrors.password}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="text-[10px] font-bold text-[#8B6E4E] uppercase tracking-wider block mb-1">
            Confirm Password
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
              className={`w-full px-3 py-2 bg-gray-50 border ${
                fieldErrors.confirmPassword ? 'border-red-300' : 'border-gray-200'
              } rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C5A373] focus:border-[#C5A373] focus:bg-white transition-all text-sm text-[#1B2430]`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#C5A373] transition-colors"
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {fieldErrors.confirmPassword && (
            <p className="text-[10px] text-red-600 mt-0.5">{fieldErrors.confirmPassword}</p>
          )}
        </div>

        {/* Terms & Conditions acceptance */}
        <div className="mt-1">
          <label className={`flex items-start gap-2 cursor-pointer ${fieldErrors.terms ? 'text-red-600' : 'text-gray-500'}`}>
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
              className="mt-0.5 accent-[#C5A373] shrink-0"
            />
            <span className="text-[10px] leading-relaxed">
              I have read and agree to the{' '}
              <Link to="/terms" target="_blank" rel="noopener noreferrer" className="text-[#C5A373] font-semibold hover:text-[#8B6E4E] underline underline-offset-2">
                Terms & Conditions
              </Link>
              {' '}and{' '}
              <Link to="/privacy" target="_blank" rel="noopener noreferrer" className="text-[#C5A373] font-semibold hover:text-[#8B6E4E] underline underline-offset-2">
                Privacy Policy
              </Link>
              . I confirm I am at least 18 years old and legally capable of entering contracts in Kenya.
            </span>
          </label>
          {fieldErrors.terms && (
            <p className="text-[10px] text-red-600 mt-1">{fieldErrors.terms}</p>
          )}
        </div>

        {/* Messages */}
        <AnimatePresence mode="wait">
          {success && (
            <motion.div key="success" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="p-2 bg-green-50 border border-green-200 rounded-lg text-green-700 text-[10px]">
              {success}
            </motion.div>
          )}
          {error && (
            <motion.div key="error" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="p-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-[10px]">
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading || !!success || !termsAccepted}
          className="w-full py-2.5 bg-[#C5A373] text-white font-bold rounded-lg hover:bg-[#8B6E4E] transition-all shadow-sm shadow-[#C5A373]/30 active:scale-[0.98] disabled:opacity-50 text-xs uppercase tracking-wider flex items-center justify-center gap-2 mt-1"
        >
          {isLoading && <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />}
          <span>{isLoading ? 'PROCESSING…' : success ? 'SUCCESS!' : 'SIGN UP'}</span>
        </button>

        <p className="text-center">
          <button type="button" onClick={onToggle}
            className="text-[#C5A373] font-bold hover:text-[#8B6E4E] transition-colors text-xs uppercase tracking-wider">
            SIGN IN
          </button>
        </p>

        {/* Social */}
        <div className="pt-2">
          <div className="flex items-center justify-center gap-2.5">
            <a href="/api/auth/google" aria-label="Sign up with Google"
              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 bg-white text-[#1B2430] hover:border-[#C5A373] hover:bg-[#FCFAF2] transition-all">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            </a>
            <button type="button" aria-label="Sign up with Twitter"
              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 bg-white text-[#1B2430] hover:border-[#C5A373] hover:bg-[#FCFAF2] transition-all">
              <Twitter className="w-3.5 h-3.5 fill-current" />
            </button>
            <button type="button" aria-label="Sign up with Facebook"
              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 bg-white text-[#1B2430] hover:border-[#C5A373] hover:bg-[#FCFAF2] transition-all">
              <Facebook className="w-3.5 h-3.5 fill-current" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Register;
