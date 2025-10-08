"use client"
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';

import UserManager from '@/components/UserManager';
import PromocodeManager from '@/components/PromocodeManager';
import ParkingOptionManager from '@/components/ParkingOptionManager';
import Loader from "@/components/Loader"
import { apiFetch } from '@/utils/config'; // Relative import for the utility file

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [promocodes, setPromocodes] = useState([]);
    const [parkingOptions, setParkingOptions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch data functions
    const fetchData = async (endpoint, setter) => {
        try {
            const data = await apiFetch(endpoint, {});
            setter(data);
            return data;
        } catch (err) {
            console.error(`Error fetching ${endpoint}:`, err);
            setError(`Failed to load data for ${endpoint}. Check your API_BASE_URL in api.js and network.`);
            return null;
        }
    };
    
    // Wrapped fetchers to pass to child components for refresh
    const fetchUsers = () => fetchData('get_users.php', setUsers);
    const fetchPromocodes = () => fetchData('get_promocodes.php', setPromocodes);
    const fetchParkingOptions = () => fetchData('get_parking.php', setParkingOptions);

    useEffect(() => {
        setIsLoading(true);
        setError(null);
        
        // Fetch all data concurrently on initial load
        Promise.all([
            fetchUsers(),
            fetchPromocodes(),
            fetchParkingOptions()
        ]).finally(() => {
            setIsLoading(false);
        });
    }, []);

    const tabClasses = (tabName) => 
        `px-6 py-3 font-medium text-sm rounded-t-xl transition-all duration-300 ${
            activeTab === tabName 
                ? 'bg-white text-indigo-600 shadow-md' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`;

    const renderContent = useMemo(() => {
        if (activeTab === 'users') {
            return <UserManager users={users} />;
        } else if (activeTab === 'promocodes') {
            return <PromocodeManager promocodes={promocodes} fetchPromocodes={fetchPromocodes} />;
        } else if (activeTab === 'parking') {
            return <ParkingOptionManager parkingOptions={parkingOptions} fetchParkingOptions={fetchParkingOptions} />;
        }
        return null;
    }, [activeTab, users, promocodes, parkingOptions]);


    if (isLoading) {
        return (
           <Loader/>
        );
    }
    
    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-sans">
            <header className="mb-8">
                <h1 className="text-4xl font-extrabold text-gray-900 border-b pb-2">Admin Dashboard</h1>
                <p className="text-gray-500 mt-1">Manage users, promotions, and parking inventory.</p>
                {error && (
                    <div className="bg-red-100 text-red-700 p-3 rounded-lg mt-4 border border-red-300">
                        <p className='font-semibold'>Data Load Error:</p>
                        <p className='text-sm'>{error}</p>
                    </div>
                )}
            </header>

            <div className="max-w-7xl mx-auto">
                {/* Tab Navigation */}
                <div className="flex border-b border-gray-200">
                    <button 
                        onClick={() => setActiveTab('users')} 
                        className={tabClasses('users')}
                    >
                        Users ({users.length})
                    </button>
                    <button 
                        onClick={() => setActiveTab('promocodes')} 
                        className={tabClasses('promocodes')}
                    >
                        Promocodes ({promocodes.length})
                    </button>
                    <button 
                        onClick={() => setActiveTab('parking')} 
                        className={tabClasses('parking')}
                    >
                        Parking Options ({parkingOptions.length})
                    </button>
                </div>

                {/* Tab Content */}
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="p-4 pt-6 bg-white rounded-b-xl shadow-xl"
                >
                    {renderContent}
                </motion.div>
            </div>
        </div>
    );
};

export default AdminDashboard;
