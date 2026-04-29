import React from 'react';
import { MoreHorizontal } from 'lucide-react';

interface DataTableProps {
    items: any[];
    renderAction?: (item: any) => React.ReactNode;
}

const DataTable: React.FC<DataTableProps> = ({ items, renderAction }) => {
    return (
        <div className="bg-[#50757A] rounded-[24px] border border-[#50757A] overflow-hidden shadow-xl shadow-black/20">
            <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left min-w-[700px] md:min-w-full">
                    <thead>
                        <tr className="bg-[#50757A] border-b border-[#50757A]">
                            <th className="px-4 md:px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Sl. No</th>
                            <th className="px-4 md:px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Ref Number</th>
                            <th className="px-4 md:px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Details</th>
                            <th className="px-4 md:px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-4 md:px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Value</th>
                            <th className="px-4 md:px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-4 md:px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#50757A]">
                        {items.map((item, index) => (
                            <tr key={item.id || index} className="hover:bg-white/5 transition-colors group">
                                <td className="px-4 md:px-6 py-5 text-sm text-gray-500">{item.slNo}</td>
                                <td className="px-4 md:px-6 py-5 text-sm text-white font-medium">{item.orderNumber}</td>
                                <td className="px-4 md:px-6 py-5 text-sm text-white">{item.customerName}</td>
                                <td className="px-4 md:px-6 py-5 text-sm text-gray-500 whitespace-nowrap">{item.date}</td>
                                <td className="px-4 md:px-6 py-5 text-sm text-white font-black">{item.orderValue}</td>
                                <td className="px-4 md:px-6 py-5">
                                    <span className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter ${item.status === 'Done' ? 'bg-[#DD6E42]/10 text-[#DD6E42]' :
                                        item.status === 'Pending' ? 'bg-[#E8DAB2]/10 text-[#E8DAB2]' :
                                            'bg-red-500/10 text-red-500'
                                        }`}>
                                        {item.status}
                                    </span>
                                </td>
                                <td className="px-4 md:px-6 py-5 text-right">
                                    {renderAction ? renderAction(item) : (
                                        <button className="p-2 bg-[#232F3F] rounded-lg text-gray-500 hover:text-[#DD6E42] transition-all border border-[#50757A]/50">
                                            <MoreHorizontal size={18} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DataTable;
