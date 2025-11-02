// components/OrderManager.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { OrderDetailModal } from './OrderDetailModal';

// NOTE: apiFetch import commented out assuming it's passed via prop or defined higher up
import { apiFetch } from '@/utils/config'; 

// Components will be defined locally or assume existence for compilation
const StatusPill = ({ status }) => {
    let color = 'bg-gray-300 text-gray-800';
    if (status === 'ACCEPTED') color = 'bg-green-200 text-green-800';
    if (status === 'CANCELLED') color = 'bg-red-200 text-red-800';
    if (status === 'PENDING') color = 'bg-yellow-200 text-yellow-800';
    if (status === 'FAILED') color = 'bg-red-200 text-red-800';
    return <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${color}`}>{status}</span>;
};

// Component that was OrderTable.jsx
const OrderTable = ({ title, orders, onViewDetails }) => {
    return (
        <div>
            <h3 className="text-xl font-semibold mb-3 border-b pb-1 text-gray-700">{title} ({orders.length})</h3>
            
            {orders.length === 0 ? (
                <p className="text-gray-500 py-4">No {title.toLowerCase()} found.</p>
            ) : (
                <div className="overflow-x-auto bg-gray-50 rounded-xl shadow-inner">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
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
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.user_firstName || order.user_email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">£{parseFloat(order.amount).toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap"><StatusPill status={order.status} /></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button 
                                            onClick={() => onViewDetails(order)}
                                            className="text-indigo-600 hover:text-indigo-900 mr-3 p-1 rounded hover:bg-indigo-50 transition"
                                        >
                                            View & Edit
                                        </button>
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


const OrderManager = ({ orders, fetchOrders }) => {
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Filter orders based on status for the two tables
    const activeOrders = useMemo(() => orders.filter(o => o.status === 'ACCEPTED'), [orders]);
    const pastOrders = useMemo(() => orders.filter(o => o.status !== 'ACCEPTED'), [orders]);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-800">Booking Management</h2>

            {/* Active Orders Section */}
            <OrderTable 
                title="Active Bookings" 
                orders={activeOrders} 
                onViewDetails={setSelectedOrder}
            />

            {/* Past Orders Section */}
            <OrderTable 
                title="Past Bookings (Pending, Cancelled, Failed)" 
                orders={pastOrders} 
                onViewDetails={setSelectedOrder}
            />

            {/* Order Detail Modal (now handles all editing and status updates) */}
            <OrderDetailModal
                order={selectedOrder}
                onClose={() => setSelectedOrder(null)}
                fetchOrders={fetchOrders} // Pass fetch function to modal to refresh parent data
            />
        </motion.div>
    );
};

export default OrderManager;
