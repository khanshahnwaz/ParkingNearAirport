// components/OrderTable.jsx
"use client";
import { motion } from 'framer-motion';
import { StatusPill } from './StatusPill';

const OrderTable = ({ title, orders, onViewDetails, onStatusUpdate }) => {
    return (
        <div>
            <h3 className="text-xl font-semibold mb-3 border-b pb-1 text-gray-700">{title} ({orders.length})</h3>
            
            {orders.length === 0 ? (
                <p className="text-gray-500 py-4">No {title.toLowerCase()} found.</p>
            ) : (
                <div className="overflow-x-auto bg-gray-50 rounded-lg shadow-inner">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {orders.map((order, index) => (
                                <motion.tr
                                    key={order.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.03 }}
                                    className="hover:bg-indigo-50/50"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">{order.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.user_id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">£{parseFloat(order.amount).toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap"><StatusPill status={order.status} /></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button 
                                            onClick={() => onViewDetails(order)}
                                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                                        >
                                            View
                                        </button>
                                        {order.status === 'ACCEPTED' && (
                                            <button 
                                                onClick={() => onStatusUpdate(order.id, 'CANCELLED')}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export { OrderTable };