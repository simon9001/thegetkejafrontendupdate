import React, { useState, useEffect } from 'react';
import { Twitter, Facebook, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useRegisterMutation } from '../../features/Api/AuthApi';

interface RegisterProps {
    onToggle?: () => void;
    isEmbedded?: boolean;
}

const Register: React.FC<RegisterProps> = ({ onToggle, isEmbedded = false }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [register, { isLoading }] = useRegisterMutation();

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(''), 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => setSuccess(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [success]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (fieldErrors[e.target.name]) {
            setFieldErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[e.target.name];
                return newErrors;
            });
        }
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!formData.full_name.trim()) {
            errors.full_name = 'Full name is required';
        }

        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = 'Email is invalid';
        }

        if (formData.phone && !/^\+?[\d\s-]{10,}$/.test(formData.phone)) {
            errors.phone = 'Phone number is invalid';
        }

        if (!formData.password) {
            errors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            errors.password = 'Must be at least 8 characters';
        }

        if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!validateForm()) {
            return;
        }

        try {
            await register({
                full_name: formData.full_name,
                email: formData.email,
                phone: formData.phone || undefined,
                password: formData.password
            }).unwrap();

            setSuccess('Account created successfully!');

            if (isEmbedded) {
                setTimeout(() => {
                    if (onToggle) onToggle();
                }, 3000);
            } else {
                setTimeout(() => {
                    navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`);
                }, 2000);
            }
        } catch (err: any) {
            const errorCode = err.data?.code;
            const errorMessage = err.data?.message || 'Registration failed. Please try again.';

            if (errorCode === 'EMAIL_EXISTS') {
                setError('This email is already registered.');
                setFieldErrors(prev => ({ ...prev, email: 'Email already exists' }));
            } else {
                setError(errorMessage);
            }
        }
    };

    return (
        <div className="w-full max-w-xs mx-auto px-5 py-6 relative">
            {/* Back Button */}
            <button
                onClick={onToggle}
                className="absolute left-4 top-4 text-[#1B2430]/50 hover:text-[#1B2430] transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="text-center mb-5">
                <h1 className="text-2xl font-bold text-[#1B2430] mb-0.5">Sign Up</h1>
                <p className="text-[#C5A373] text-xs font-medium">Join Us Today!</p>
            </div>

            {/* Form */}
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
                        className={`w-full px-3 py-2 bg-gray-50 border ${fieldErrors.full_name ? 'border-red-300' : 'border-gray-200'
                            } rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C5A373] focus:border-[#C5A373] focus:bg-white transition-all text-xs text-[#1B2430] placeholder:text-gray-400 placeholder:text-[10px]`}
                        disabled={isLoading}
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
                        className={`w-full px-3 py-2 bg-gray-50 border ${fieldErrors.email ? 'border-red-300' : 'border-gray-200'
                            } rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C5A373] focus:border-[#C5A373] focus:bg-white transition-all text-xs text-[#1B2430] placeholder:text-gray-400 placeholder:text-[10px]`}
                        disabled={isLoading}
                    />
                    {fieldErrors.email && (
                        <p className="text-[10px] text-red-600 mt-0.5">{fieldErrors.email}</p>
                    )}
                </div>

                {/* Phone */}
                <div>
                    <label className="text-[10px] font-bold text-[#8B6E4E] uppercase tracking-wider block mb-1">
                        Phone
                    </label>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+254 700 000 000"
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C5A373] focus:border-[#C5A373] focus:bg-white transition-all text-xs text-[#1B2430] placeholder:text-gray-400 placeholder:text-[10px]"
                        disabled={isLoading}
                    />
                </div>

                {/* Password & Confirm Password */}
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="text-[10px] font-bold text-[#8B6E4E] uppercase tracking-wider block mb-1">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder="••••••"
                                required
                                className={`w-full px-3 py-2 bg-gray-50 border ${fieldErrors.password ? 'border-red-300' : 'border-gray-200'
                                    } rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C5A373] focus:border-[#C5A373] focus:bg-white transition-all text-sm text-[#1B2430]`}
                                disabled={isLoading}
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
                    <div>
                        <label className="text-[10px] font-bold text-[#8B6E4E] uppercase tracking-wider block mb-1">
                            Confirm
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                placeholder="••••••"
                                required
                                className={`w-full px-3 py-2 bg-gray-50 border ${fieldErrors.confirmPassword ? 'border-red-300' : 'border-gray-200'
                                    } rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C5A373] focus:border-[#C5A373] focus:bg-white transition-all text-sm text-[#1B2430]`}
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#C5A373] transition-colors"
                            >
                                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Password Error Message */}
                {(fieldErrors.password || fieldErrors.confirmPassword) && (
                    <p className="text-[10px] text-red-600 -mt-1.5">
                        {fieldErrors.password || fieldErrors.confirmPassword}
                    </p>
                )}

                {/* Messages */}
                <AnimatePresence mode="wait">
                    {success && (
                        <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="p-2 bg-green-50 border border-green-200 rounded-lg text-green-700 text-[10px]"
                        >
                            {success}
                        </motion.div>
                    )}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="p-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-[10px]"
                        >
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Sign Up Button */}
                <button
                    type="submit"
                    disabled={isLoading || !!success}
                    className="w-full py-2.5 bg-[#C5A373] text-white font-bold rounded-lg hover:bg-[#8B6E4E] transition-all shadow-sm shadow-[#C5A373]/30 active:scale-[0.98] disabled:opacity-50 text-xs uppercase tracking-wider flex items-center justify-center gap-2 mt-1"
                >
                    {isLoading && (
                        <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
                    )}
                    <span>{isLoading ? 'PROCESSING...' : success ? 'SUCCESS!' : 'SIGN UP'}</span>
                </button>

                {/* Sign In Link */}
                <p className="text-center">
                    <button
                        type="button"
                        onClick={onToggle}
                        className="text-[#C5A373] font-bold hover:text-[#8B6E4E] transition-colors text-xs uppercase tracking-wider"
                    >
                        SIGN IN
                    </button>
                </p>

                {/* Social Connect */}
                <div className="pt-2">
                    <div className="flex items-center justify-center gap-2.5">
                        <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 bg-white text-[#1B2430] hover:border-[#C5A373] hover:bg-[#FCFAF2] transition-all">
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 bg-white text-[#1B2430] hover:border-[#C5A373] hover:bg-[#FCFAF2] transition-all">
                            <Twitter className="w-3.5 h-3.5 fill-current" />
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 bg-white text-[#1B2430] hover:border-[#C5A373] hover:bg-[#FCFAF2] transition-all">
                            <Facebook className="w-3.5 h-3.5 fill-current" />
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default Register;