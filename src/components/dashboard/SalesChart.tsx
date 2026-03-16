import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
    { time: '7 am', value: 200 },
    { time: '9 am', value: 400 },
    { time: '11 am', value: 700 },
    { time: '1 pm', value: 500 },
    { time: '3 pm', value: 650 },
    { time: '5 pm', value: 800 },
    { time: '7 pm', value: 450 },
    { time: '9 pm', value: 550 },
];

const SalesChart: React.FC = () => {
    return (
        <div className="bg-[#1B2430] p-4 md:p-8 rounded-[24px] border border-[#2C3A4E] w-full h-[350px] md:h-[400px]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 md:mb-8">
                <div>
                    <h3 className="text-lg md:text-xl font-bold text-white mb-1">Performance Insight</h3>
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest opacity-60">Real-time stats</p>
                </div>
                <div className="flex bg-[#0F172A] p-0.5 md:p-1 rounded-lg border border-[#2C3A4E] overflow-x-auto no-scrollbar max-w-full">
                    <button className="px-3 md:px-4 py-1.5 text-[10px] md:text-xs font-bold text-[#D4A373] bg-[#D4A373]/10 rounded-md shrink-0">Day</button>
                    <button className="px-3 md:px-4 py-1.5 text-[10px] md:text-xs font-bold text-gray-500 hover:text-gray-300 shrink-0">Week</button>
                    <button className="px-3 md:px-4 py-1.5 text-[10px] md:text-xs font-bold text-gray-500 hover:text-gray-300 shrink-0">Month</button>
                </div>
            </div>

            <div className="h-[200px] md:h-[250px] w-full mt-auto min-h-[200px]">
                <ResponsiveContainer width="100%" height={250} minHeight={200} minWidth={0}>
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#D4A373" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#D4A373" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2C3A4E" />
                        <XAxis
                            dataKey="time"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#4A5568', fontSize: 10, fontWeight: 700 }}
                            dy={10}
                        />
                        <YAxis hide />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1B2430', border: '1px solid #2C3A4E', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)' }}
                            itemStyle={{ color: '#D4A373' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#D4A373"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorValue)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default SalesChart;
