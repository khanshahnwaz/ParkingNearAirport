// components/OrderManager.jsx
"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { apiFetch } from '@/utils/config';
import { StatusPill } from './StatusPill'; // We'll define this simple component next
import { OrderDetailModal } from './OrderDetailModal'; // We'll define this modal next
import { OrderTable } from './OrderTable';

const API_ENDPOINT = 'get_all_orders.php'; // New API to fetch all orders
const UPDATE_ENDPOINT = 'update-order-status.php'; // New API to update status

const OrderManager = () => {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const fetchOrders = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Assume the API endpoint is set up for admin read operations
            const data = await apiFetch(API_ENDPOINT, null, 'GET');
            // Assuming data is an array of order objects
            setOrders(data || []);
        } catch (err) {
            console.error("Error fetching orders:", err);
            setError("Failed to load orders data. Check the API connection.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        if (!window.confirm(`Are you sure you want to change Order #${orderId} status to ${newStatus}?`)) return;

        try {
            const payload = { orderId, status: newStatus };
            // Using POST since it's a modification action
            await apiFetch(UPDATE_ENDPOINT, payload, 'POST'); 
            
            // Refresh the list and update the modal immediately
            await fetchOrders();
            setSelectedOrder(prev => prev ? {...prev, status: newStatus} : null); 
        } catch (err) {
            window.alert(`Failed to update status: ${err.message}`);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    if (isLoading) return <div className="text-center py-8"><p>Loading orders...</p></div>;
    if (error) return <div className="text-center py-8 text-red-600">Error: {error}</div>;

    // Filter orders for Active and Past views
    const activeOrders = orders.filter(o => o.status === 'ACCEPTED');
    const pastOrders = orders.filter(o => o.status !== 'ACCEPTED');

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-800">Order Management</h2>

            {/* Active Orders Section */}
            <OrderTable 
                title="Active Orders (Accepted)" 
                orders={activeOrders} 
                onViewDetails={setSelectedOrder}
                onStatusUpdate={handleStatusUpdate}
            />

            {/* Past Orders Section */}
            <OrderTable 
                title="Past Orders (Cancelled/Failed)" 
                orders={pastOrders} 
                onViewDetails={setSelectedOrder}
                onStatusUpdate={handleStatusUpdate}
            />

            {/* Order Detail Modal */}
            <OrderDetailModal
                order={selectedOrder}
                onClose={() => setSelectedOrder(null)}
                onStatusUpdate={handleStatusUpdate}
            />
        </motion.div>
    );
};

export default OrderManager;