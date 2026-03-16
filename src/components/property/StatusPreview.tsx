// frontend/src/components/property/StatusPreview.tsx
import React from 'react';
import { motion } from 'framer-motion';

import { type Status } from '../../data/statusData';

interface StatusPreviewProps {
    statuses: Status[];
    onStatusClick: (index: number) => void;
}

const StatusPreview: React.FC<StatusPreviewProps> = ({ statuses, onStatusClick }) => {
    // Sort in reverse chronological order (latest first)
    const sortedStatuses = [...statuses].sort((a, b) =>
        new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()
    );

    return (
        <div className="flex gap-4 overflow-x-auto no-scrollbar py-2 px-4">
            {sortedStatuses.map((status, index) => (
                <motion.button
                    key={status.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onStatusClick(index)}
                    className="flex flex-col items-center gap-1 min-w-[64px]"
                >
                    <div className="relative">
                        <div className={`w-14 h-14 rounded-full p-0.5 ${status.hasUnviewed
                                ? 'bg-gradient-to-r from-[#D4A373] to-[#E6B17E]'
                                : 'bg-gray-300'
                            }`}>
                            <div className="w-full h-full rounded-full overflow-hidden border-2 border-white">
                                <img
                                    src={status.propertyImage}
                                    alt={status.propertyTitle}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                        {/* Multiple media indicator */}
                        {status.media.length > 1 && (
                            <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#D4A373] text-white text-xs rounded-full flex items-center justify-center border-2 border-white">
                                {status.media.length}
                            </span>
                        )}
                    </div>
                    <span className="text-xs text-gray-600 truncate max-w-[64px]">
                        {status.owner.name.split(' ')[0]}
                    </span>
                </motion.button>
            ))}
        </div>
    );
};

export default StatusPreview;