// UserProfile.jsx
"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/utils/config';

export default function UserProfile() {
    const { user, login } = useAuth();
    // Initialize form state from global user data
    const [formState, setFormState] = useState({
        name: user.name || user.Name || '',
        email: user.email || '',
        password: '', // Password field is never pre-filled
        currentPassword: '', 
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const handleChange = (e) => {
        setFormState({ ...formState, [e.target.name]: e.target.value });
        setMessage({ text: '', type: '' });
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage({ text: 'Saving profile...', type: 'info' });

        const payload = {
            action: 'update_profile', // New API action
            userId: user.id,
            name: formState.name,
            email: formState.email,
            // Only include password fields if they are being updated
            newPassword: formState.password,
            currentPassword: formState.currentPassword,
        };

        try {
            // Assume you have a user_crud.php endpoint for this
             await apiFetch('user_crud.php', payload, 'POST');
            // Update the global user state with new data (excluding sensitive fields)
            const updatedUser = { 
                ...user, 
                name: payload.name, 
                email: payload.email 
            };
            login(updatedUser); // Update local storage and context
            
            // Clear passwords after successful update
            setFormState(prev => ({ ...prev, password: '', currentPassword: '' })); 

            setMessage({ text: 'Profile updated successfully!', type: 'success' });
        } catch (err) {
            console.error("Profile update failed:", err);
            setMessage({ text: err.message || 'Failed to update profile.', type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClasses = "mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-indigo-500 focus:border-indigo-500";
    const statusClasses = message.type === 'success' ? 'bg-green-100 text-green-700' : 
                          message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700';

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Personal Details</h2>
            
            {message.text && (
                <motion.div 
                    initial={{ scale: 0.9 }} 
                    animate={{ scale: 1 }} 
                    className={`p-3 rounded-lg border text-sm mb-6 ${statusClasses}`}
                >
                    {message.text}
                </motion.div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-6 max-w-lg">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input
                        type="text"
                        name="name"
                        value={formState.name}
                        onChange={handleChange}
                        required
                        className={inputClasses}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Email Address</label>
                    <input
                        type="email"
                        name="email"
                        value={formState.email}
                        onChange={handleChange}
                        required
                        className={inputClasses}
                    />
                </div>

                <h3 className="text-lg font-semibold text-gray-800 pt-4 border-t">Change Password</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">New Password (Optional)</label>
                        <input
                            type="password"
                            name="password"
                            value={formState.password}
                            onChange={handleChange}
                            placeholder="Leave blank to keep current password"
                            className={inputClasses}
                        />
                    </div>
                    {formState.password && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Current Password (Required to change)</label>
                            <input
                                type="password"
                                name="currentPassword"
                                value={formState.currentPassword}
                                onChange={handleChange}
                                required
                                className={inputClasses}
                            />
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-wait"
                >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
            </form>
        </motion.div>
    );
}