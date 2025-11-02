// UserDashboard.jsx
"use client";
import React, { useState, useMemo,useEffect } from 'react';
import { motion } from 'framer-motion';

import UserProfile from '@/components/UserProfile';
import UserOrders from '@/components/UserOrders';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Loader from '@/components/Loader';
export default function UserDashboard() {
    // 1. ALL HOOKS MUST BE CALLED UNCONDITIONALLY AT THE TOP
    const [activeTab, setActiveTab] = useState('profile');
    const { user } = useAuth(); // Hook 2

    const router = useRouter();

    const [authChecked, setAuthChecked] = useState(false);

     // Move useMemo UPWARDS, before the conditional return 👈 FIX APPLIED
    const renderContent = useMemo(() => { // Hook 3
        if (activeTab === 'profile') {
            return <UserProfile />;
        } else if (activeTab === 'orders') {
            return <UserOrders />;
        }
        return null;
    }, [activeTab]); // No dependency on 'user' needed here, so the hook is safe.


    useEffect(() => {
        async function verifyRole() {

            if (!user || user.role == 'guest') {
                router.replace('/unauthorized'); // Redirect to access denied page
            } else {
                setAuthChecked(true);
            }
        }
        verifyRole();
    }, []);

    if (!authChecked) {
        return <Loader message="User" />; // Keep showing loader until auth is verified
    }

   
    // 2. CONDITIONAL RETURN COMES AFTER ALL HOOKS
    if (!user) {
        return (
            <div className="min-h-screen p-8 text-center text-red-500">
                Please log in to view your dashboard.
            </div>
        );
    }

    const tabClasses = (tabName) => 
        `px-6 py-3 font-medium text-base rounded-t-lg transition-all duration-300 ${
            activeTab === tabName 
                ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' 
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
        }`;

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-sans">
            <header className="mb-8 max-w-4xl mx-auto">
                <h1 className="text-4xl font-extrabold text-gray-900">
                    Welcome, {user.name || user.Name || user.email}!
                </h1>
                <p className="text-gray-500 mt-1">Manage your profile and track your bookings.</p>
            </header>

            <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-xl">
                {/* Tab Navigation */}
                <div className="flex border-b border-gray-200 px-6 pt-4">
                    <button 
                        onClick={() => setActiveTab('profile')} 
                        className={tabClasses('profile')}
                    >
                        Personal Details
                    </button>
                    <button 
                        onClick={() => setActiveTab('orders')} 
                        className={tabClasses('orders')}
                    >
                        My Orders
                    </button>
                </div>

                {/* Tab Content */}
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="p-6 md:p-8 text-black"
                >
                    {renderContent}
                </motion.div>
            </div>
        </div>
    );
}