// UserOrders.jsx
"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/utils/config';
import { StatusPill } from '@/components/StatusPill'; // Reuse the StatusPill from Admin

export default function UserOrders() {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchUserOrders = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Assume a dedicated API endpoint to fetch orders by user ID
            const payload = { userId: user.id };
            // Note: Use POST if your API is expecting JSON body, otherwise use GET with query params
            const data = await apiFetch('get_user_orders.php', payload, 'POST'); 
            setOrders(data || []);
        } catch (err) {
            console.error("Error fetching user orders:", err);
            setError("Failed to load your order history.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user?.id) {
            fetchUserOrders();
        }
    }, [user?.id]);

    if (isLoading) return <div className="text-center py-8"><p className="text-indigo-600">Loading your orders...</p></div>;
    if (error) return <div className="text-center py-8 text-red-600">{error}</div>;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Your Booking History</h2>

            {orders.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed text-gray-500">
                    <p>You have no parking orders yet.</p>
                </div>
            ) : (
                <div className="overflow-x-auto shadow-md rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {orders.map((order) => {
                                // Assume booking_details is an object here, or parse if needed: JSON.parse(order.booking_details)
                                const details = order.booking_details; 
                                return (
                                    <motion.tr 
                                        key={order.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-indigo-600">{order.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                            {details?.start ? new Date(details.start).toLocaleDateString() : 'N/A'} - 
                                            {details?.end ? new Date(details.end).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-700">£{parseFloat(order.amount).toFixed(2)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap"><StatusPill status={order.status} /></td>
                                    </motion.tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </motion.div>
    );
}