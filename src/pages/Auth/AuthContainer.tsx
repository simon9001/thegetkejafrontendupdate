import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';

const AuthContainer: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Start on the register form when the URL is /register
    const [isLogin, setIsLogin] = useState(location.pathname !== '/register');

    const toggleAuth = () => {
        const next = !isLogin;
        setIsLogin(next);
        navigate(next ? '/login' : '/register', { replace: true });
    };

    return (
        <div className="min-h-screen bg-[#FCFAF2] flex items-center justify-center p-4 sm:p-6 overflow-hidden selection:bg-[#C5A373]/30 antialiased">
            {/* Background Decorative Element */}
            <div className="absolute top-0 right-0 w-1/3 h-full bg-[#C5A373]/5 -skew-x-12 transform origin-top-right -z-10 hidden lg:block"></div>

            <div className="w-full max-w-5xl h-[90vh] sm:h-[85vh] bg-white rounded-3xl sm:rounded-[2.5rem] shadow-[0_20px_50px_rgba(197,163,115,0.15)] overflow-hidden flex flex-col lg:flex-row relative">

                {/* Layout for Animated Form & Static Image */}
                <div className="flex-1 flex flex-col lg:flex-row w-full h-full">

                    {/* Animated Form Container */}
                    <div className="w-full lg:w-1/2 h-full relative bg-white z-10 flex flex-col">
                        <AnimatePresence mode="wait" initial={false}>
                            <motion.div
                                key={isLogin ? 'login' : 'register'}
                                initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 30, duration: 0.3 }}
                                className="h-full flex items-center justify-center"
                            >
                                {isLogin ? (
                                    <Login onToggle={toggleAuth} isEmbedded={true} />
                                ) : (
                                    <Register onToggle={toggleAuth} isEmbedded={true} />
                                )}
                            </motion.div>
                        </AnimatePresence>
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
                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-[#1B2430]/90 via-[#1B2430]/40 to-transparent"></div>

                            {/* Content */}
                            <div className="absolute bottom-12 left-10 right-10 text-white z-20">
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.2, duration: 0.5 }}
                                >
                                    <div className="w-10 h-1 bg-[#C5A373] mb-4 rounded-full"></div>
                                    <h2 className="text-3xl font-black mb-3 leading-tight">
                                        Luxury Living, <span className="text-[#C5A373]">Redefined</span>.
                                    </h2>
                                    <p className="text-white/90 text-sm font-medium leading-relaxed max-w-sm">
                                        Experience the pinnacle of real estate with our curated collection of extraordinary properties.
                                    </p>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Decorative Border */}
                <div className="absolute inset-0 pointer-events-none border border-[#C5A373]/10 rounded-3xl sm:rounded-[2.5rem] hidden sm:block"></div>
            </div>
        </div>
    );
};

export default AuthContainer;
