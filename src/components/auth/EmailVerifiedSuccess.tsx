// frontend/src/components/auth/EmailVerifiedSuccess.tsx
import React, { useEffect } from 'react';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface EmailVerifiedSuccessProps {
    onRedirect?: () => void;
}

const EmailVerifiedSuccess: React.FC<EmailVerifiedSuccessProps> = ({ onRedirect }) => {
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            if (onRedirect) {
                onRedirect();
            } else {
                navigate('/login');
            }
        }, 3000);

        return () => clearTimeout(timer);
    }, [navigate, onRedirect]);

    return (
        <div className="min-h-[100dvh] bg-[#FCFAF2] flex items-center justify-center p-0 sm:p-6 lg:p-12 overflow-hidden selection:bg-[#C5A373]/30 antialiased">
            {/* Background Decorative Element */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-[#C5A373]/5 -skew-x-12 transform origin-top-right -z-10 hidden lg:block"></div>

            <div className="w-full max-w-[1240px] h-[100dvh] sm:h-[min(880px,94vh)] bg-white sm:rounded-[3.5rem] shadow-[0_25px_60px_rgba(197,163,115,0.15)] overflow-hidden flex flex-col lg:flex-row relative">
                
                <div className="flex-1 flex flex-col lg:flex-row w-full h-full">
                    {/* Content Container */}
                    <div className="w-full lg:w-[45%] h-full relative bg-white z-10 flex flex-col shrink-0">
                        <div className="flex flex-col h-full bg-white">
                            {/* Navy Header Section */}
                            <div className="bg-[#1B2430] px-6 lg:px-8 pt-4 lg:pt-6 pb-6 lg:pb-8 flex flex-col relative overflow-hidden shrink-0">
                                <Link 
                                    to="/login" 
                                    className="text-white/80 hover:text-white transition-colors mb-2 lg:mb-4 inline-flex items-center gap-2 w-fit cursor-pointer group"
                                >
                                    <ArrowLeft className="w-4 h-4 lg:w-5 lg:h-5 group-hover:-translate-x-1 transition-transform text-[#C5A373]" />
                                    <span className="text-[10px] lg:text-xs font-bold uppercase tracking-widest group-hover:opacity-100 opacity-60 transition-opacity">Back to Login</span>
                                </Link>
                                <h1 className="text-xl lg:text-2xl xl:text-3xl font-bold text-white text-center tracking-tight">
                                    Email <span className="text-[#C5A373]">Verified</span>
                                </h1>
                                <div className="absolute bottom-0 left-0 right-0 h-5 lg:h-6 bg-white rounded-t-[2rem] lg:rounded-t-[3rem]"></div>
                            </div>

                            {/* Content Section */}
                            <div className="flex-1 overflow-y-auto no-scrollbar px-4 lg:px-8 py-4 lg:py-6">
                                <div className="max-w-md mx-auto w-full flex flex-col items-center text-center">
                                    <div className="w-20 h-20 lg:w-24 lg:h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 lg:mb-8">
                                        <CheckCircle className="w-10 h-10 lg:w-12 lg:h-12 text-green-500" />
                                    </div>

                                    <h2 className="text-xl lg:text-2xl xl:text-3xl font-black text-[#1B2430] mb-3">Success!</h2>
                                    <p className="text-sm lg:text-base text-gray-500 mb-4">
                                        Your email has been verified successfully.
                                    </p>
                                    
                                    <div className="w-full bg-[#C5A373]/10 rounded-xl lg:rounded-2xl p-4 mb-6">
                                        <p className="text-sm lg:text-base text-[#8B6E4E] font-semibold">
                                            Redirecting you to login page in 3 seconds...
                                        </p>
                                    </div>

                                    <div className="w-full h-1.5 lg:h-2 bg-gray-200 rounded-full overflow-hidden mb-6">
                                        <motion.div 
                                            className="h-full bg-green-500 rounded-full"
                                            initial={{ width: '100%' }}
                                            animate={{ width: '0%' }}
                                            transition={{ duration: 3, ease: 'linear' }}
                                        />
                                    </div>

                                    <p className="text-xs lg:text-sm text-gray-500">
                                        Not redirected?{' '}
                                        <Link to="/login" className="font-black text-[#C5A373] hover:text-[#8B6E4E] transition-colors underline decoration-2 underline-offset-4">
                                            Click here to login
                                        </Link>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Desktop Sidebar Image */}
                    <div className="hidden lg:block lg:w-[55%] h-full relative overflow-hidden bg-[#1B2430]">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1 }}
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-[2000ms] ease-out hover:scale-105"
                            style={{
                                backgroundImage: `url('https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop')`,
                                backfaceVisibility: "hidden"
                            }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-tr from-[#1B2430]/90 via-[#1B2430]/40 to-transparent"></div>

                            <div className="absolute bottom-16 left-16 right-16 text-white max-w-md z-20">
                                <motion.div
                                    initial={{ y: 30, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.3, duration: 0.6 }}
                                >
                                    <div className="w-12 h-1 bg-[#C5A373] mb-6 rounded-full shadow-lg"></div>
                                    <h2 className="text-4xl lg:text-5xl font-black mb-6 leading-[1.15] tracking-tight drop-shadow-2xl">
                                        Welcome to <span className="text-[#C5A373]">Getkeja</span>
                                    </h2>
                                    <p className="text-white text-lg lg:text-xl font-extrabold leading-relaxed opacity-100 drop-shadow-md">
                                        Your email has been verified. You can now log in and start exploring luxury properties.
                                    </p>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                <div className="absolute inset-0 pointer-events-none border-[1px] border-[#C5A373]/10 rounded-[3.5rem] hidden sm:block"></div>
            </div>
        </div>
    );
};

export default EmailVerifiedSuccess;