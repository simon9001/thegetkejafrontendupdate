import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';

const AuthContainer: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [isLogin, setIsLogin] = useState(location.pathname !== '/register');

    const toggleAuth = () => {
        const next = !isLogin;
        setIsLogin(next);
        navigate(next ? '/login' : '/register', { replace: true });
    };

    const backgroundImage = isLogin
        ? "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?q=80&w=2070&auto=format&fit=crop"
        : "https://images.unsplash.com/photo-1501183638710-841dd1904471?q=80&w=2070&auto=format&fit=crop";

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#E8DAB2] via-[#f5efe0] to-[#E8DAB2] flex items-center justify-center px-3 sm:px-6 lg:px-8 py-6 overflow-hidden">

            {/* background glow */}
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
                            key={isLogin ? 'login' : 'register'}
                            initial={{ opacity: 0, x: isLogin ? -30 : 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: isLogin ? 30 : -30 }}
                            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
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

                {/* ================= IMAGE ================= */}
                <div className="hidden lg:block lg:w-[48%] h-full relative overflow-hidden">

                    <motion.div
                        key={backgroundImage}
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                            backgroundImage: `url('${backgroundImage}')`,
                            backgroundPosition: 'center 30%',
                        }}
                        initial={{ scale: 1.15, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.8 }}
                    />

                    {/* overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#50757A]/95 via-[#50757A]/60 to-transparent" />

                    {/* content */}
                    <div className="absolute inset-0 flex flex-col justify-between p-6 sm:p-10 lg:p-12 text-white">

                        {/* top accent */}
                        <motion.div
                            className="w-12 sm:w-14 lg:w-16 h-1 bg-[#DD6E42] rounded-full"
                            animate={{ width: isLogin ? 64 : 88 }}
                            transition={{ duration: 0.3 }}
                        />

                        {/* middle text */}
                        <AnimatePresence mode="wait">
                            {isLogin ? (
                                <motion.div
                                    key="login"
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -15 }}
                                    className="space-y-3 lg:space-y-4 max-w-sm"
                                >
                                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black leading-tight">
                                        Welcome Back
                                    </h2>

                                    <p className="text-white/90 text-sm sm:text-base">
                                        Continue exploring verified rental listings on GetKeja.
                                    </p>

                                    <div className="flex items-center gap-2">
                                        <div className="w-8 lg:w-10 h-0.5 bg-[#DD6E42]" />
                                        <span className="text-white/70 text-xs sm:text-sm">
                                            Your next home awaits
                                        </span>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="register"
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -15 }}
                                    className="space-y-3 lg:space-y-4 max-w-sm"
                                >
                                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black leading-tight">
                                        Find Your <span className="text-[#DD6E42]">Home</span>
                                    </h2>

                                    <p className="text-white/90 text-sm sm:text-base">
                                        Join GetKeja and discover affordable verified rentals near you.
                                    </p>

                                    <div className="flex items-center gap-2">
                                        <div className="w-8 lg:w-10 h-0.5 bg-[#DD6E42]" />
                                        <span className="text-white/70 text-xs sm:text-sm">
                                            Start your journey today
                                        </span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* bottom quote (hidden on small screens for cleanliness) */}
                        <p className="hidden sm:block text-white/50 text-xs italic">
                            “Homes made simple, renting made smart”
                        </p>
                    </div>
                </div>

                {/* border */}
                <div className="absolute inset-0 pointer-events-none border border-[#C0D6DF]/20 rounded-2xl sm:rounded-[2rem] lg:rounded-[2.5rem]" />
            </div>
        </div>
    );
};

export default AuthContainer;