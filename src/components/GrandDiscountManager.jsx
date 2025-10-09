// components/GrandDiscountManager.jsx
"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { apiFetch } from '@/utils/config'; 
import { useAuth } from '@/context/AuthContext'; // To get the global discount value

// API Endpoint constant
const API_ENDPOINT = 'grand-discount-api.php'; // Using the action-based file

const GrandDiscountManager = () => {
    // Get the globally shared discount value from context
    const { grandDiscount } = useAuth();

    // State for the value currently being edited in the input field
    const [newDiscount, setNewDiscount] = useState('');
    
    // State for UI management
    const [isLoading, setIsLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });

    // Sync global discount to local state for display and input initialization
    useEffect(() => {
        if (grandDiscount !== null) {
            // Set both the displayed current discount and the input field value
            // We use toFixed(2) to ensure decimal format in the input
            setNewDiscount(grandDiscount.toFixed(2));
        }
    }, [grandDiscount]);

    /**
     * Helper to trigger a global data refresh. 
     * In a full application, this would call a method in AuthContext to re-run the GET request.
     * For this format, we'll just rely on the local notification.
     */
    // const refreshGlobalDiscount = () => {
    //     // Ideally, AuthContext would expose a function like `fetchGlobalData` here.
    //     // Since we don't have that, we rely on the component's internal state update.
    // };

    // --- CRUD Operations ---

    // CREATE / UPDATE: Post the new discount
    const handleSave = async (e) => {
        e.preventDefault();
        
        const value = parseFloat(newDiscount);
        if (isNaN(value) || value < 0) {
            setStatusMessage({ text: 'Please enter a valid, non-negative number.', type: 'error' });
            return;
        }

        // Check if value is actually different before submitting
        if (value === grandDiscount) {
            setStatusMessage({ text: 'Discount value is the same as current.', type: 'info' });
            return;
        }

        setIsLoading(true);
        setStatusMessage({ text: 'Saving discount...', type: 'info' });
        
        try {
            // Use POST with action: 'update' and the discount_number payload
            const payload = { 
                action: 'update',
                discount_number: value 
            };
            
            // apiFetch defaults to POST, so we don't specify the method
            await apiFetch(API_ENDPOINT, payload); 
            
            // Ideally, refresh the context here to update all consumers
            // refreshGlobalDiscount(); 
            
            // Since we don't have a global refresh, rely on success message
            window.alert(`Discount successfully updated to ${value.toFixed(2)}!`);
            setStatusMessage({ text: `Discount successfully updated to ${value.toFixed(2)}!`, type: 'success' });
            
        } catch (err) {
            console.error("Error saving discount:", err);
            setStatusMessage({ text: `Failed to save the discount: ${err.message}`, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    // DELETE: Remove the latest discount record
    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete the current grand discount? This will effectively set the running discount to zero.")) {
            return;
        }

        setIsLoading(true);
        setStatusMessage({ text: 'Deleting discount...', type: 'info' });
        try {
            // Use POST with action: 'delete'
            const payload = { action: 'delete' };
            await apiFetch(API_ENDPOINT, payload); 
            
            // refreshGlobalDiscount();
            window.alert('Discount successfully deleted (now 0). Please refresh your global context manually.');
            setStatusMessage({ text: 'Discount successfully deleted.', type: 'success' });
        } catch (err) {
            console.error("Error deleting discount:", err);
            setStatusMessage({ text: `Failed to delete the discount: ${err.message}`, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    // Animation variants (kept from previous version)
    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 10 } }
    };

    const getStatusClasses = () => {
        if (statusMessage.type === 'success') return 'bg-green-100 text-green-700 border-green-300';
        if (statusMessage.type === 'error') return 'bg-red-100 text-red-700 border-red-300';
        if (statusMessage.type === 'info') return 'bg-blue-100 text-blue-700 border-blue-300';
        return 'hidden';
    };

    // Using grandDiscount from context for display
    const currentDiscountDisplay = grandDiscount !== null ? grandDiscount.toFixed(2) : 'Loading...';

    return (
        <motion.div 
            className="p-6 bg-white rounded-xl shadow-lg border border-gray-100"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            initial="hidden"
            animate="visible"
        >
            <motion.h2 
                className="text-2xl font-bold text-indigo-700 mb-4 border-b pb-2"
                variants={itemVariants}
            >
                🔥 Grand Discount Manager
            </motion.h2>

            <motion.div 
                className={`p-3 rounded-lg border text-sm mb-4 ${getStatusClasses()}`}
                animate={{ opacity: statusMessage.text ? 1 : 0, y: statusMessage.text ? 0 : -10 }}
                transition={{ duration: 0.3 }}
                variants={itemVariants}
            >
                {statusMessage.text}
            </motion.div>

            <motion.div 
                className="mb-6 p-4 bg-indigo-50 rounded-lg shadow-inner"
                variants={itemVariants}
            >
                <p className="text-gray-600 font-semibold text-lg mb-1">
                    Current Grand Discount: 
                </p>
                <motion.span 
                    className="text-4xl font-extrabold text-indigo-900 transition-all duration-500"
                    key={grandDiscount} // Animate context change
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                >
                    {currentDiscountDisplay}
                </motion.span>
                <span className="text-xl text-indigo-600">%</span> 
            </motion.div>
            
            <form onSubmit={handleSave} className="space-y-4">
                <motion.div variants={itemVariants}>
                    <label htmlFor="discountInput" className="block text-sm font-medium text-gray-700 mb-1">
                        Set New Grand Discount Value (%)
                    </label>
                    <input
                        type="number"
                        id="discountInput"
                        value={newDiscount}
                        onChange={(e) => setNewDiscount(e.target.value)}
                        step="0.01"
                        min="0"
                        placeholder="e.g., 25.50"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                        disabled={isLoading}
                    />
                </motion.div>

                <motion.div className="flex space-x-3" variants={itemVariants}>
                    <button
                        type="submit"
                        disabled={isLoading || parseFloat(newDiscount) === grandDiscount}
                        className={`flex-1 px-4 py-2 rounded-lg text-white font-semibold transition-colors duration-300 ${
                            isLoading || parseFloat(newDiscount) === grandDiscount
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-green-600 hover:bg-green-700 shadow-md'
                        }`}
                    >
                        {isLoading ? 'Saving...' : 'SAVE New Discount'}
                    </button>
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={isLoading || grandDiscount === 0 || grandDiscount === null}
                        className={`px-4 py-2 rounded-lg text-white font-semibold transition-colors duration-300 ${
                            isLoading || grandDiscount === 0 || grandDiscount === null
                                ? 'bg-red-300 cursor-not-allowed'
                                : 'bg-red-600 hover:bg-red-700 shadow-md'
                        }`}
                    >
                        {isLoading ? 'Deleting...' : 'DELETE Discount'}
                    </button>
                </motion.div>
            </form>
        </motion.div>
    );
};

export default GrandDiscountManager;