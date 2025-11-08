// components/OrderManager.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { OrderDetailModal } from './OrderDetailModal';
// NOTE: apiFetch import commented out assuming it's passed via prop or defined higher up
import { apiFetch } from '@/utils/config'; 
import OrderTable from './OrderTable';






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
