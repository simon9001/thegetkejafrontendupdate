// frontend/src/pages/VerifyEmail.tsx
import React, { useEffect, useState } from 'react';
import { MailCheck, ArrowLeft, Loader2 } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useResendVerificationMutation, useLazyVerifyEmailQuery } from '../../features/Api/AuthApi';
import EmailVerifiedSuccess from '../../components/auth/EmailVerifiedSuccess';

const VerifyEmail: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    
    const [isVerified, setIsVerified] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [resendEmail, setResendEmail] = useState(email || '');
    const [resendSuccess, setResendSuccess] = useState(false);
    
    const [triggerVerify, { isLoading: isVerifying }] = useLazyVerifyEmailQuery();
    const [resendVerification, { isLoading: isResending }] = useResendVerificationMutation();
    const [autoSent, setAutoSent] = useState(false);

    useEffect(() => {
        if (token) {
            verifyEmail(token);
        }
    }, [token]);

    // Auto-send verification email when user lands here after registration
    useEffect(() => {
        if (!token && email && !autoSent) {
            setAutoSent(true);
            resendVerification({ email })
                .unwrap()
                .then(() => setResendSuccess(true))
                .catch(() => {/* silently ignore — backend may enforce cooldown */});
        }
    }, []);

    const verifyEmail = async (verificationToken: string) => {
        try {
            const result = await triggerVerify(verificationToken).unwrap();
            if (result.code === 'VERIFICATION_SUCCESS' || result.code === 'ALREADY_VERIFIED') {
                setIsVerified(true);
            }
        } catch (err: any) {
            setError(err?.data?.message || 'Verification failed. Please try again.');
        }
    };

    const handleResend = async () => {
        if (!resendEmail) {
            setError('Please enter your email address');
            return;
        }

        try {
            await resendVerification({ email: resendEmail }).unwrap();
            setResendSuccess(true);
            setError(null);
            setTimeout(() => setResendSuccess(false), 5000);
        } catch (err: any) {
            setError(err?.data?.message || 'Failed to resend verification email');
        }
    };

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    if (isVerified) {
        return <EmailVerifiedSuccess onRedirect={() => navigate('/login')} />;
    }

    return (
        <div className="min-h-screen bg-[#FCFAF2] flex items-center justify-center p-4 sm:p-6 overflow-hidden selection:bg-[#C5A373]/30 antialiased">
            <div className="absolute top-0 right-0 w-1/3 h-full bg-[#C5A373]/5 -skew-x-12 transform origin-top-right -z-10 hidden lg:block"></div>

            <div className="w-full max-w-5xl h-[90vh] sm:h-[85vh] bg-white rounded-3xl sm:rounded-[2.5rem] shadow-[0_20px_50px_rgba(197,163,115,0.15)] overflow-hidden flex flex-col lg:flex-row relative">
                
                <div className="flex-1 flex flex-col lg:flex-row w-full h-full">
                    {/* Form Container */}
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
                                    <h1 className="text-2xl font-bold text-[#1B2430] mb-0.5">Verify Email</h1>
                                    <p className="text-[#C5A373] text-xs font-medium">Confirm your account</p>
                                </div>

                                {/* Icon */}
                                <div className="flex justify-center mb-4">
                                    <div className="w-14 h-14 bg-[#C5A373]/10 rounded-full flex items-center justify-center">
                                        {isVerifying ? (
                                            <Loader2 className="w-7 h-7 text-[#C5A373] animate-spin" />
                                        ) : (
                                            <MailCheck className="w-7 h-7 text-[#C5A373]" />
                                        )}
                                    </div>
                                </div>

                                {/* Messages */}
                                <AnimatePresence mode="wait">
                                    {resendSuccess && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            className="mb-3 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm text-center font-medium"
                                        >
                                            Verification email sent — check your inbox (and spam).
                                        </motion.div>
                                    )}
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            className="mb-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm text-center font-medium"
                                        >
                                            {error}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {token ? (
                                    // Verifying with token
                                    <div className="text-center">
                                        <h2 className="text-lg font-bold text-[#1B2430] mb-2">
                                            {isVerifying ? 'Verifying your email…' : 'Verification Failed'}
                                        </h2>
                                        {!isVerifying && error && (
                                            <>
                                                <p className="text-xs text-gray-500 mb-4">
                                                    The verification link may be expired or invalid. Enter your email below to get a new one.
                                                </p>
                                                <div className="space-y-3">
                                                    <input
                                                        type="email"
                                                        placeholder="your@email.com"
                                                        value={resendEmail}
                                                        onChange={(e) => setResendEmail(e.target.value)}
                                                        className="w-full px-3 py-2.5 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#C5A373] text-sm"
                                                    />
                                                    <button
                                                        onClick={handleResend}
                                                        disabled={isResending}
                                                        className="w-full py-2.5 bg-[#1B2430] text-white font-bold rounded-xl hover:bg-[#243447] transition-all text-sm"
                                                    >
                                                        {isResending ? 'Sending…' : 'Send New Link'}
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    // No token — email was auto-sent on mount
                                    <>
                                        <h2 className="text-lg font-bold text-[#1B2430] text-center mb-2">Check your inbox</h2>
                                        <p className="text-xs text-gray-500 text-center mb-1">
                                            We've sent a verification link to:
                                        </p>
                                        {resendEmail && (
                                            <p className="text-sm font-bold text-[#1B2430] text-center mb-4 break-all">{resendEmail}</p>
                                        )}
                                        <p className="text-xs text-gray-400 text-center mb-4">
                                            Click the link in the email to activate your account. Check your spam folder if you don't see it within a minute.
                                        </p>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                                    Wrong address? Update it here:
                                                </label>
                                                <input
                                                    type="email"
                                                    placeholder="your@email.com"
                                                    value={resendEmail}
                                                    onChange={(e) => setResendEmail(e.target.value)}
                                                    className="w-full px-3 py-2.5 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#C5A373] text-sm"
                                                />
                                            </div>
                                            <button
                                                onClick={handleResend}
                                                disabled={isResending || !resendEmail}
                                                className="w-full py-2.5 bg-[#C5A373] text-white font-bold rounded-xl hover:bg-[#8B6E4E] transition-all disabled:opacity-50 text-sm"
                                            >
                                                {isResending ? 'Sending…' : 'Resend Email'}
                                            </button>
                                        </div>
                                    </>
                                )}

                                <p className="text-[10px] text-gray-500 text-center mt-4">
                                    Didn't receive it? Check spam or{' '}
                                    <Link to="/contact" className="font-bold text-[#C5A373] hover:text-[#8B6E4E] transition-colors underline">
                                        Contact Support
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Desktop Sidebar Image */}
                    <div className="hidden lg:block lg:w-1/2 h-full relative overflow-hidden bg-[#1B2430]">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.8 }}
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-[2000ms] ease-out hover:scale-105"
                            style={{
                                backgroundImage: `url('https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop')`,
                                backgroundPosition: 'center 30%',
                            }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-tr from-[#1B2430]/90 via-[#1B2430]/40 to-transparent"></div>
                            <div className="absolute bottom-12 left-10 right-10 text-white z-20">
                                <div className="w-10 h-1 bg-[#C5A373] mb-4 rounded-full"></div>
                                <h2 className="text-3xl font-black mb-3 leading-tight">
                                    Verify Your <span className="text-[#C5A373]">Email</span>
                                </h2>
                                <p className="text-white/90 text-sm font-medium leading-relaxed max-w-sm">
                                    Please verify your email address to access your account and start exploring luxury properties.
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>

                <div className="absolute inset-0 pointer-events-none border border-[#C5A373]/10 rounded-3xl sm:rounded-[2.5rem] hidden sm:block"></div>
            </div>
        </div>
    );
};

export default VerifyEmail;