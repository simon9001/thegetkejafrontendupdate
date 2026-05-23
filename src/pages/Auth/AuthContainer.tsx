import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';

// ✅ LOCAL ASSETS
import loginImage from '../../assets/OIP (1).webp';
import registerImage from '../../assets/cb4a073a-cee7-457e-ad1a-0a7f852c2a63.png';

const AuthContainer: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const isMobile = window.innerWidth < 768;

    const [isLogin, setIsLogin] = useState(location.pathname !== '/register');

    const toggleAuth = () => {
        const next = !isLogin;
        setIsLogin(next);
        navigate(next ? '/login' : '/register', { replace: true });
    };

    const backgroundImage = isLogin ? loginImage : registerImage;

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#E8DAB2] via-[#f5efe0] to-[#E8DAB2] flex items-center justify-center px-3 sm:px-6 lg:px-8 py-6 overflow-hidden">

            {/* background glow (desktop only) */}
            <div className="absolute top-0 right-0 w-1/2 lg:w-1/3 h-full bg-[#C0D6DF]/10 -skew-x-12 origin-top-right -z-10 hidden lg:block" />
            <div className="absolute bottom-0 left-0 w-1/2 lg:w-1/3 h-1/2 bg-[#50757A]/5 rounded-tr-full -z-10 hidden lg:block" />

            {/* MAIN CARD */}
            <div className="
                w-full 
                max-w-7xl 
                h-[92vh] 
                lg:h-[88vh]
                bg-white 
                rounded-2xl 
                sm:rounded-[2rem] 
                lg:rounded-[2.5rem] 
                shadow-2xl 
                overflow-hidden 
                flex 
                flex-col 
                lg:flex-row
                relative
            ">

                {/* ================= FORM ================= */}
                <div className="w-full lg:w-[52%] h-full flex items-center justify-center px-4 sm:px-6 lg:px-0">

                    <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                            key="auth-form"
                            initial={
                                isMobile
                                    ? { opacity: 0 }
                                    : { opacity: 0, x: isLogin ? -20 : 20 }
                            }
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{
                                duration: isMobile ? 0.15 : 0.35,
                                ease: 'easeOut'
                            }}
                            className="w-full h-full flex items-center justify-center"
                        >
                            {isLogin ? (
                                <Login onToggle={toggleAuth} isEmbedded={true} />
                            ) : (
                                <Register onToggle={toggleAuth} isEmbedded={true} />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* ================= IMAGE (DESKTOP ONLY) ================= */}
                {!isMobile && (
                    <div className="hidden lg:block lg:w-[48%] h-full relative overflow-hidden">

                        <motion.div
                            className="absolute inset-0 bg-cover bg-center will-change-transform"
                            style={{
                                backgroundImage: `url(${backgroundImage})`,
                                backgroundPosition: 'center'
                            }}
                            initial={{ scale: 1.05, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        />

                        {/* lighter overlay = clearer image */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#50757A]/45 via-[#50757A]/20 to-transparent" />

                        {/* content */}
                        <div className="absolute inset-0 flex flex-col justify-between p-6 sm:p-10 lg:p-12 text-white">

                            <motion.div
                                className="w-14 h-1 bg-[#DD6E42] rounded-full"
                                animate={{ width: isLogin ? 64 : 90 }}
                                transition={{ duration: 0.25 }}
                            />

                            <AnimatePresence mode="wait">
                                {isLogin ? (
                                    <motion.div
                                        key="login"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="space-y-3 max-w-sm"
                                    >
                                        <h2 className="text-3xl font-black">Welcome Back</h2>
                                        <p className="text-white/90 text-sm">
                                            Continue exploring verified rentals.
                                        </p>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="register"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="space-y-3 max-w-sm"
                                    >
                                        <h2 className="text-3xl font-black">
                                            Find Your <span className="text-[#DD6E42]">Home</span>
                                        </h2>
                                        <p className="text-white/90 text-sm">
                                            Join GetKeja and discover verified rentals.
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <p className="text-white/40 text-xs hidden sm:block italic">
                                “Homes made simple, renting made smart”
                            </p>
                        </div>
                    </div>
                )}

                {/* border */}
                <div className="absolute inset-0 pointer-events-none border border-[#C0D6DF]/20 rounded-2xl sm:rounded-[2rem] lg:rounded-[2.5rem]" />
            </div>
        </div>
    );
};

export default AuthContainer;