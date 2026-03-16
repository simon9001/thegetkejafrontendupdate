import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface StatGaugeProps {
    label: string;
    value: string;
    percentage: number;
    color: string;
}

const StatGauge: React.FC<StatGaugeProps> = ({ label, value, percentage, color }) => {
    const data = [
        { value: percentage },
        { value: 100 - percentage },
    ];

    return (
        <div className="bg-[#1B2430] p-4 md:p-6 rounded-[24px] border border-[#2C3A4E] flex flex-col items-center relative overflow-hidden group hover:border-[#D4A373]/30 transition-all duration-300">
            <div className="w-full text-left mb-1 md:mb-2">
                <p className="text-gray-400 text-[10px] md:text-xs font-bold tracking-tight uppercase opacity-60">{label}</p>
            </div>

            <div className="h-32 w-full relative flex items-center justify-center overflow-hidden bg-white/5 rounded-2xl border border-white/10 mt-2">
                <div className="absolute inset-0 flex items-center justify-center w-full h-full">
                    <ResponsiveContainer width="100%" height="100%" minHeight={128}>
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                startAngle={180}
                                endAngle={0}
                                innerRadius="65%"
                                outerRadius="85%"
                                paddingAngle={0}
                                dataKey="value"
                                stroke="none"
                                cornerRadius={10}
                            >
                                <Cell fill={color === '#FF6B35' ? '#D4A373' : color} />
                                <Cell fill="#2C3A4E" />
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>

                    <div className="absolute top-[60%] flex flex-col items-center">
                        <span className="text-2xl font-black text-white">{value}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatGauge;
