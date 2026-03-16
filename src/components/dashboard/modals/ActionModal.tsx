import { motion } from 'framer-motion';
import { X, Loader2, AlertTriangle } from 'lucide-react';

interface ActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    icon?: React.ElementType;
    iconColor?: 'red' | 'blue' | 'amber' | 'green' | 'primary';
    children?: React.ReactNode;
    onSubmit?: (e: React.FormEvent) => void;
    submitText?: string;
    isSubmitting?: boolean;
    submitColor?: 'red' | 'blue' | 'amber' | 'green' | 'primary';
}

const colorMap = {
    red: { bg: 'bg-red-500', text: 'text-red-500', iconBg: 'bg-red-500/10 text-red-500', hover: 'hover:bg-red-600' },
    blue: { bg: 'bg-blue-500', text: 'text-blue-500', iconBg: 'bg-blue-500/10 text-blue-500', hover: 'hover:bg-blue-600' },
    amber: { bg: 'bg-amber-500', text: 'text-amber-500', iconBg: 'bg-amber-500/10 text-amber-500', hover: 'hover:bg-amber-600' },
    green: { bg: 'bg-green-500', text: 'text-green-500', iconBg: 'bg-green-500/10 text-green-500', hover: 'hover:bg-green-600' },
    primary: { bg: 'bg-[#D4A373]', text: 'text-[#D4A373]', iconBg: 'bg-[#D4A373]/10 text-[#D4A373]', hover: 'hover:bg-[#E6B17E]' }
};

const ActionModal: React.FC<ActionModalProps> = ({
    isOpen,
    onClose,
    title,
    description,
    icon: Icon = AlertTriangle,
    iconColor = 'amber',
    children,
    onSubmit,
    submitText = 'Confirm',
    isSubmitting = false,
    submitColor = 'primary',
}) => {
    if (!isOpen) return null;

    const selectedIconColor = colorMap[iconColor] || colorMap.primary;
    const selectedSubmitColor = colorMap[submitColor] || colorMap.primary;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-white dark:bg-[#1B2430] rounded-[24px] w-full max-w-md border border-gray-100 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col"
            >
                <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-start bg-gray-50/50 dark:bg-white/[0.02]">
                    <div className="flex gap-4 items-center">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedIconColor.iconBg} border border-current border-opacity-20`}>
                            <Icon className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {title}
                            </h2>
                            {description && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    {description}
                                </p>
                            )}
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 -mr-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors shrink-0">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                <form onSubmit={onSubmit ? (e) => { e.preventDefault(); onSubmit(e); } : undefined} className="flex flex-col">
                    {children && (
                        <div className="p-6 space-y-4">
                            {children}
                        </div>
                    )}

                    <div className="p-6 pt-2 flex flex-col sm:flex-row gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-white/10 transition-all text-center"
                        >
                            Cancel
                        </button>
                        {onSubmit && (
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`flex-[1.5] px-4 py-3 ${selectedSubmitColor.bg} text-white font-bold rounded-xl ${selectedSubmitColor.hover} transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-center`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    submitText
                                )}
                            </button>
                        )}
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default ActionModal;
