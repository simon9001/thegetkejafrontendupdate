// frontend/src/pages/Auth/ResetPassword.tsx
import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useResetPasswordMutation } from '../../features/Api/AuthApi';

const ResetPassword: React.FC = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [resetPassword, { isLoading }] = useResetPasswordMutation();

    useEffect(() => {
        if (!token) {
            setError('Invalid or missing reset token.');
            const timer = setTimeout(() => navigate('/login'), 3000);
            return () => clearTimeout(timer);
        }
    }, [token, navigate]);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!token) {
            setError('Invalid or missing reset token.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters long.');
            return;
        }

        try {
            await resetPassword({ token, password }).unwrap();
            setIsSubmitted(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err: any) {
            setError(err?.data?.message || 'Failed to reset password. The link may have expired.');
        }
    };

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-[#FCFAF2] flex items-center justify-center p-4 sm:p-6 overflow-hidden selection:bg-[#C5A373]/30 antialiased">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-[#C5A373]/5 -skew-x-12 transform origin-top-right -z-10 hidden lg:block"></div>
                <div className="w-full max-w-5xl h-[90vh] sm:h-[85vh] bg-white rounded-3xl sm:rounded-[2.5rem] shadow-[0_20px_50px_rgba(197,163,115,0.15)] overflow-hidden flex flex-col lg:flex-row relative">
                    <div className="flex-1 flex flex-col lg:flex-row w-full h-full">
                        <div className="w-full lg:w-1/2 h-full relative bg-white z-10 flex flex-col">
                            <div className="h-full flex items-center justify-center">
                                <div className="w-full max-w-xs mx-auto px-5 py-6">
                                    <div className="text-center">
                                        <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <CheckCircle className="w-7 h-7 text-green-500" />
                                        </div>
                                        <h2 className="text-xl font-bold text-[#1B2430] mb-2">Success!</h2>
                                        <p className="text-xs text-gray-500 mb-4">
                                            Your password has been reset successfully.
                                        </p>
                                        <Link
                                            to="/login"
                                            className="w-full py-2.5 bg-[#C5A373] text-white font-bold rounded-lg hover:bg-[#8B6E4E] transition-all text-xs uppercase tracking-wider block text-center"
                                        >
                                            Back to Login
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="hidden lg:block lg:w-1/2 h-full relative overflow-hidden bg-[#1B2430]">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.8 }}
                                className="absolute inset-0 bg-cover bg-center"
                                style={{ backgroundImage: `url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=2073&auto=format&fit=crop')` }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-tr from-[#1B2430]/90 via-[#1B2430]/40 to-transparent"></div>
                                <div className="absolute bottom-12 left-10 right-10 text-white z-20">
                                    <div className="w-10 h-1 bg-[#C5A373] mb-4 rounded-full"></div>
                                    <h2 className="text-3xl font-black mb-3 leading-tight">
                                        Secure Your <span className="text-[#C5A373]">Future</span>
                                    </h2>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FCFAF2] flex items-center justify-center p-4 sm:p-6 overflow-hidden selection:bg-[#C5A373]/30 antialiased">
            <div className="absolute top-0 right-0 w-1/3 h-full bg-[#C5A373]/5 -skew-x-12 transform origin-top-right -z-10 hidden lg:block"></div>
            <div className="w-full max-w-5xl h-[90vh] sm:h-[85vh] bg-white rounded-3xl sm:rounded-[2.5rem] shadow-[0_20px_50px_rgba(197,163,115,0.15)] overflow-hidden flex flex-col lg:flex-row relative">
                <div className="flex-1 flex flex-col lg:flex-row w-full h-full">
                    <div className="w-full lg:w-1/2 h-full relative bg-white z-10 flex flex-col">
                        <div className="h-full flex items-center justify-center">
                            <div className="w-full max-w-xs mx-auto px-5 py-6 relative">
                                {/* Back Button */}
                                <Link 
                                    to="/login" 
                                    className="absolute left-4 top-4 text-[#1B2430]/50 hover:text-[#1B2430] transition-colors inline-flex items-center gap-1"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Back</span>
                                </Link>

                                {/* Header */}
                                <div className="text-center mb-5">
                                    <h1 className="text-2xl font-bold text-[#1B2430] mb-0.5">Reset Password</h1>
                                    <p className="text-[#C5A373] text-xs font-medium">Create a new password</p>
                                </div>

                                {/* Icon */}
                                <div className="flex justify-center mb-4">
                                    <div className="w-14 h-14 bg-[#C5A373]/10 rounded-full flex items-center justify-center">
                                        <Lock className="w-7 h-7 text-[#C5A373]" />
                                    </div>
                                </div>

                                {/* Error Message */}
                                <AnimatePresence mode="wait">
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-[10px] text-center"
                                        >
                                            {error}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <form onSubmit={handleSubmit} className="space-y-3">
                                    <div>
                                        <label className="text-[10px] font-bold text-[#8B6E4E] uppercase tracking-wider block mb-1">
                                            New Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C5A373] focus:border-[#C5A373] text-xs pr-8"
                                                required
                                            />
                                            <button 
                                                type="button" 
                                                onClick={() => setShowPassword(!showPassword)} 
                                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#C5A373]"
                                            >
                                                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-[#8B6E4E] uppercase tracking-wider block mb-1">
                                            Confirm Password
                                        </label>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C5A373] focus:border-[#C5A373] text-xs"
                                            required
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading || !token}
                                        className="w-full py-2.5 bg-[#C5A373] text-white font-bold rounded-lg hover:bg-[#8B6E4E] transition-all disabled:opacity-50 text-xs uppercase tracking-wider flex items-center justify-center gap-2 mt-2"
                                    >
                                        {isLoading && (
                                            <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
                                        )}
                                        <span>{isLoading ? 'Resetting...' : 'Reset Password'}</span>
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                    <div className="hidden lg:block lg:w-1/2 h-full relative overflow-hidden bg-[#1B2430]">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.8 }}
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: `url('https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?q=80&w=2070&auto=format&fit=crop')` }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-tr from-[#1B2430]/90 via-[#1B2430]/40 to-transparent"></div>
                            <div className="absolute bottom-12 left-10 right-10 text-white z-20">
                                <div className="w-10 h-1 bg-[#C5A373] mb-4 rounded-full"></div>
                                <h2 className="text-3xl font-black mb-3 leading-tight">
                                    Your Privacy, <span className="text-[#C5A373]">Our Commitment</span>
                                </h2>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;