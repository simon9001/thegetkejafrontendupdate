// frontend/src/pages/Auth/Register.tsx
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useRegisterMutation } from '../../features/Api/AuthApi';

interface RegisterProps {
  onToggle?: () => void;
  isEmbedded?: boolean;
}

// ---------------- PASSWORD RULES ----------------
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

const isPasswordValid = (pw: string) => PASSWORD_RULES.every((r) => r.test(pw));

const PasswordStrength: React.FC<{ password: string }> = ({ password }) => {
  if (!password) return null;

  return (
    <div className="mt-1.5 space-y-1">
      {PASSWORD_RULES.map((rule) => {
        const ok = rule.test(password);
        return (
          <div key={rule.label} className="flex items-center gap-1.5 text-xs">
            {ok ? (
              <CheckCircle2 className="w-3 h-3 text-green-600" />
            ) : (
              <XCircle className="w-3 h-3 text-gray-400" />
            )}
            <span className={ok ? 'text-green-600' : 'text-gray-400'}>
              {rule.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// ---------------- COMPONENT ----------------
const Register: React.FC<RegisterProps> = ({ onToggle }) => {
  const navigate = useNavigate();

  const [register, { isLoading }] = useRegisterMutation();

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
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // auto-clear messages
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(''), 5000);
    return () => clearTimeout(t);
  }, [error]);

  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => setSuccess(''), 4000);
    return () => clearTimeout(t);
  }, [success]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

    if (fieldErrors[e.target.name]) {
      const copy = { ...fieldErrors };
      delete copy[e.target.name];
      setFieldErrors(copy);
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (formData.full_name.trim().length < 2)
      errors.full_name = 'Name too short';

    if (!/\S+@\S+\.\S+/.test(formData.email))
      errors.email = 'Invalid email';

    if (!isPasswordValid(formData.password))
      errors.password = 'Weak password';

    if (formData.password !== formData.confirmPassword)
      errors.confirmPassword = 'Passwords do not match';

    if (!termsAccepted)
      errors.terms = 'You must accept Terms & Conditions';

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

      setSuccess('✅ Account created successfully');

      setTimeout(() => {
        navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`);
      }, 1500);

    } catch (err: any) {
      setError('❌ Registration failed. Please try again.');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-5 py-3 relative overflow-y-auto max-h-[100vh]">

      {/* Back */}
      <button onClick={onToggle} className="absolute left-3 top-3">
        <ArrowLeft className="w-4 h-4" />
      </button>

      {/* Header */}
      <div className="text-center mb-3">
        <h1 className="text-xl font-bold">Create account</h1>
        <p className="text-xs text-gray-500">Start your journey</p>
      </div>

      {/* Messages */}
      {success && (
        <p className="text-xs text-green-600 mb-2">{success}</p>
      )}
      {error && (
        <p className="text-xs text-red-500 mb-2">{error}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">

        <input
          name="full_name"
          placeholder="Full name"
          value={formData.full_name}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border rounded-lg text-sm"
        />

        <input
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border rounded-lg text-sm"
        />

        {/* Password */}
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
            onFocus={() => setPasswordFocused(true)}
            className="w-full px-3 py-2 border rounded-lg text-sm pr-10"
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2 cursor-pointer"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {(passwordFocused || formData.password) && (
          <PasswordStrength password={formData.password} />
        )}

        <input
          type={showConfirmPassword ? 'text' : 'password'}
          name="confirmPassword"
          placeholder="Confirm password"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border rounded-lg text-sm"
        />

        {/* Terms */}
        <label className="flex gap-2 text-xs">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
          />
          I agree to{' '}
          <Link to="/terms" className="text-blue-600 underline">
            Terms & Conditions
          </Link>
        </label>

        {fieldErrors.terms && (
          <p className="text-xs text-red-500">{fieldErrors.terms}</p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading || !termsAccepted}
          className="w-full py-2 bg-black text-white rounded-lg text-sm cursor-pointer hover:opacity-90 transition"
        >
          {isLoading ? 'Creating...' : 'Sign up'}
        </button>

      </form>

      {/* Sign in */}
      <p className="text-center text-xs mt-3">
        Already have an account?{' '}
        <button onClick={onToggle} className="text-blue-600 font-semibold cursor-pointer">
          Sign in
        </button>
      </p>
    </div>
  );
};

export default Register;