import React, { useState } from 'react';
import { Twitter, Facebook } from 'lucide-react';
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

    const [login, { isLoading }] = useLoginMutation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const from = (location.state as any)?.from?.pathname || '/dashboard';

    React.useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(''), 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    React.useEffect(() => {
        if (success) {
            const timer = setTimeout(() => setSuccess(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [success]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const result = await login({ email, password }).unwrap();

            if (result.code === 'EMAIL_NOT_VERIFIED') {
                setError('Please verify your email before logging in');
                setTimeout(() => {
                    navigate(`/verify-email?email=${encodeURIComponent(email)}`);
                }, 2000);
                return;
            }

            if (result.accessToken && result.user) {
                const userRole = result.user.roles?.[0] || 'user';

                dispatch(setCredentials({
                    user: {
                        user_id: result.user.id,
                        username: result.user.email,
                        email: result.user.email,
                        full_name: result.user.full_name,
                        phone: '',
                        role: userRole,
                        isActive: true,
                        isEmailVerified: true
                    },
                    tokens: {
                        accessToken: result.accessToken,
                        refreshToken: result.refreshToken
                    }
                }));

                setSuccess('Login successful! Redirecting...');
                setTimeout(() => {
                    navigate(from, { replace: true });
                }, 1500);
            }
        } catch (err: any) {
            const errorCode = err.data?.code;
            const errorMessage = err.data?.message || 'Login failed. Please try again.';

            if (errorCode === 'EMAIL_NOT_VERIFIED') {
                setError('Please verify your email before logging in');
                setTimeout(() => {
                    navigate(`/verify-email?email=${encodeURIComponent(email)}`);
                }, 2000);
            } else if (errorCode === 'INVALID_CREDENTIALS') {
                setError('Invalid email or password');
            } else {
                setError(errorMessage);
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

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email/Phone Field */}
                <div>
                    <label className="text-[10px] font-bold text-[#8B6E4E] uppercase tracking-wider block mb-1">
                        Email/Phone
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your personal details to use all of site features"
                        required
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C5A373] focus:border-[#C5A373] focus:bg-white transition-all text-xs text-[#1B2430] placeholder:text-gray-400 placeholder:text-[10px]"
                        disabled={isLoading}
                    />
                </div>

                {/* Password Field with Forgot Password Link */}
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
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C5A373] focus:border-[#C5A373] focus:bg-white transition-all text-xs text-[#1B2430] placeholder:text-gray-400"
                        disabled={isLoading}
                    />
                </div>

                {/* Messages */}
                <AnimatePresence mode="wait">
                    {success && (
                        <motion.div
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
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="p-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-[10px] text-center"
                        >
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Sign In Button */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 bg-[#C5A373] text-white font-bold rounded-lg hover:bg-[#8B6E4E] transition-all shadow-sm shadow-[#C5A373]/30 active:scale-[0.98] disabled:opacity-50 text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                >
                    {isLoading && (
                        <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
                    )}
                    <span>{isLoading ? 'SIGNING IN...' : 'SIGN IN'}</span>
                </button>

                {/* Sign Up Link */}
                <p className="text-center">
                    <button
                        type="button"
                        onClick={onToggle}
                        className="text-[#C5A373] font-bold hover:text-[#8B6E4E] transition-colors text-xs uppercase tracking-wider"
                    >
                        SIGN UP
                    </button>
                </p>

                {/* Social Login */}
                <div className="pt-3">
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

export default Login;