import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const data = [
    { name: 'verified', value: 50, color: '#D4A373' },
    { name: 'pending', value: 30, color: '#E6B17E' },
    { name: 'disputed', value: 20, color: '#4A5568' },
];

const OrderDonut: React.FC = () => {
    return (
        <div className="bg-[#1B2430] p-4 md:p-8 rounded-[24px] border border-[#2C3A4E] w-full h-auto min-h-[350px] md:h-[400px]">
            <div className="flex justify-between items-center mb-6 md:mb-8">
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest opacity-60">Distribution</p>
                <div className="flex bg-[#0F172A] p-0.5 md:p-1 rounded-lg border border-[#2C3A4E]">
                    <button className="px-2 md:px-3 py-1 text-[10px] font-bold text-[#D4A373] bg-[#D4A373]/10 rounded-md">Day</button>
                    <button className="px-2 md:px-3 py-1 text-[10px] font-bold text-gray-500">Week</button>
                    <button className="px-2 md:px-3 py-1 text-[10px] font-bold text-gray-500">Month</button>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between h-auto sm:h-[250px] gap-8 sm:gap-4">
                <div className="w-full md:w-1/2 h-[200px] sm:h-full relative flex items-center justify-center min-h-[200px]">
                    <ResponsiveContainer width="100%" height={200} minHeight={200} minWidth={0}>
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius="60%"
                                outerRadius="90%"
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute flex flex-col items-center">
                        <span className="text-xl font-black text-white">Assets</span>
                    </div>
                </div>

                <div className="w-full md:w-1/2 space-y-4">
                    {data.map((item) => (
                        <div key={item.name} className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-gray-400 text-xs font-bold uppercase tracking-tight">
                                {item.value}% {item.name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default OrderDonut;
