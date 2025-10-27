import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit, Trash2, X, Loader2, Save } from 'lucide-react';

// --- Utility for API Calls (Mocking the external apiFetch) ---
// IMPORTANT: If you are getting a 404, ensure the API_BASE_URL variable 
// in your main config file points to the correct location of 'user_crud.php'.
const apiFetch = async (endpoint, options = {}) => {
    const defaultHeaders = { 'Content-Type': 'application/json' };
    
    // Simulate API base URL configuration. Use "/api/" or ensure this 
    // matches your NEXT_PUBLIC_API_BASE environment variable structure.
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE; 

    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    });

    if (!response.ok) {
        let errorData = {};
        try {
            errorData = await response.json();
        } catch (e) {
            // Handle non-JSON responses
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }

    // Attempt to return JSON, fall back to simple text if needed
    try {
        return await response.json();
    } catch (e) {
        return { ok: true, message: "Operation successful" };
    }
};

// --- Edit User Modal Component ---
const EditUserModal = ({ user, onClose, onSave }) => {
    console.log(user)
    const [formData, setFormData] = useState({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        newPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const payload = {
            action: 'update_profile',
            userId: formData.id,
            name: formData.name,
            email: formData.email,
            role: formData.role,
        };
        
        // Only include newPassword if it's set
        if (formData.newPassword) {
            payload.newPassword = formData.newPassword;
            // NOTE: The PHP side will need to handle password hashing.
            // In a real-world scenario, you might require the admin's password here.
        }

        try {
            await apiFetch("user_crud.php", {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            setSuccessMessage("User updated successfully!");
            onSave(); // Call parent's fetch and close logic
        } catch (err) {
            console.error('Update Error:', err);
            setError(err.message || "Failed to update user.");
        } finally {
            setLoading(false);
        }
    };

    // Card background for the modal
    const cardVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
        exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15 } },
    };


    return (
        <motion.div 
            className="fixed inset-0 bg-gray-900 bg-opacity-70 z-50 flex justify-center items-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose} // Close on backdrop click
        >
            <motion.div 
                className="bg-white rounded-xl shadow-2xl w-full max-w-lg"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={e => e.stopPropagation()} // Prevent close when clicking inside
            >
                <div className="flex justify-between items-center p-6 border-b">
                    <h3 className="text-xl font-bold text-gray-800">Edit User: {user.name}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                        />
                    </div>

                    {/* Role */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Role</label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                        >
                            <option value="user">user</option>
                            <option value="admin">admin</option>
                        </select>
                    </div>

                    {/* New Password (Optional) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">New Password (Leave blank to keep)</label>
                        <input
                            type="password"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-red-600 p-2 bg-red-50 rounded-md">{error}</p>
                    )}
                    {successMessage && (
                        <p className="text-sm text-green-600 p-2 bg-green-50 rounded-md">{successMessage}</p>
                    )}

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg text-white transition ${
                                loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-lg'
                            }`}
                        >
                            {loading ? (
                                <Loader2 className="animate-spin w-4 h-4 mr-2" />
                            ) : (
                                <Save className="w-4 h-4 mr-2" />
                            )}
                            Save Changes
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};


/**
 * Section for displaying and managing User information (Edit/Delete enabled)
 */
const UserManager = ({ users, fetchUsers }) => {
    const [editingUser, setEditingUser] = useState(null);
    const [loadingDelete, setLoadingDelete] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });

    const clearMessage = useCallback(() => {
        setMessage({ type: '', text: '' });
    }, []);
    
    // Handler for deleting a user
    const handleDelete = useCallback(async (userId, userName) => {
        // NOTE: Replaced window.confirm with a message since alert/confirm are blocked in the environment
        if (!confirm(`Are you sure you want to permanently delete user: ${userName} (ID: ${userId})? This action cannot be undone.`)) {
             // Fallback to native confirm if available, otherwise consider custom modal implementation
             if (!window.confirm) { 
                 setMessage({ type: 'error', text: 'Deletion cancelled or confirmation not available.' });
                 return;
             }
        }

        setLoadingDelete(userId);
        clearMessage();
        
        try {
            await apiFetch("user_crud.php", {
                method: 'POST',
                body: JSON.stringify({
                    action: 'delete_user',
                    userId: userId,
                })
            });
            setMessage({ type: 'success', text: `User ${userName} deleted successfully!` });
            await fetchUsers(); // Refresh the list
        } catch (err) {
            console.error('Delete Error:', err);
            setMessage({ type: 'error', text: err.message || `Failed to delete user ${userName}.` });
        } finally {
            setLoadingDelete(null);
        }
    }, [fetchUsers, clearMessage]);

    // Function to close the modal and refresh data if needed
    const handleCloseModal = useCallback(() => {
        setEditingUser(null);
        fetchUsers(); // Always refresh data after potential successful save
    }, [fetchUsers]);

    // Message rendering logic
    const MessageDisplay = useMemo(() => {
        if (!message.text) return null;
        const baseClasses = "mt-6 p-4 rounded-xl font-medium"; // Rounded-xl for consistency
        const style = message.type === 'success' 
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800";
        return (
            <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`${baseClasses} ${style}`}
            >
                {message.text}
                <button 
                    onClick={clearMessage} 
                    className="float-right text-current opacity-70 hover:opacity-100"
                >
                    <X className="w-5 h-5" />
                </button>
            </motion.div>
        );
    }, [message, clearMessage]);


    return (
        <>
            <div className="p-4 bg-white rounded-xl shadow-lg">
                <h2 className="text-2xl font-extrabold text-gray-800 mb-6 border-b pb-3">User Accounts Management</h2>
                
                <AnimatePresence>
                    {MessageDisplay}
                </AnimatePresence>

                {users.length === 0 ? (
                    <p className="text-gray-500 text-center py-10 text-lg">No user accounts registered.</p>
                ) : (
                    // Card Grid Layout
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-4">
                        {users.map((user, index) => (
                            <motion.div 
                                key={user.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                // Aesthetic Update: Smoother shadow, more prominent border on hover, better rounded corners
                                className="bg-white border border-gray-100 rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-blue-200"
                            >
                                <div className="p-5">
                                    <div className="flex items-center space-x-4">
                                        <img 
                                            src={user.avatar || 'https://placehold.co/60x60/3b82f6/ffffff?text=U'} 
                                            alt={`${user.name} avatar`} 
                                            // Aesthetic Update: More noticeable ring effect
                                            className="h-14 w-14 rounded-full object-cover ring-4 ring-offset-2 ring-blue-500/50" 
                                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/60x60/3b82f6/ffffff?text=U'; }}
                                        />
                                        <div>
                                            <p className="text-xl font-bold text-gray-900 truncate">{user.name}</p>
                                            {/* Aesthetic Update: Role badge colors and style */}
                                            <p className={`text-xs font-semibold uppercase px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                                                user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
                                            }`}>
                                                {user.role}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-5 text-sm space-y-2 pt-3 border-t border-gray-100">
                                        <p className="text-gray-700 truncate">
                                            <strong className="text-gray-900">ID:</strong> <span className="font-mono text-xs ml-1">{user.id}</span>
                                        </p>
                                        <p className="text-gray-700 truncate">
                                            <strong className="text-gray-900">Email:</strong> {user.email}
                                        </p>
                                        <p className="text-gray-700">
                                            <strong className="text-gray-900">Joined:</strong> {new Date(user.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                {/* Actions */}
                                {/* Aesthetic Update: Cleaner footer styling */}
                                <div className="flex justify-end p-3 bg-gray-50 border-t border-gray-100">
                                    <button
                                        onClick={() => setEditingUser(user)}
                                        className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-100 transition mr-2"
                                        title="Edit User"
                                    >
                                        <Edit className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(user.id, user.name)}
                                        disabled={loadingDelete === user.id}
                                        className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-100 transition disabled:opacity-50"
                                        title="Delete User"
                                    >
                                        {loadingDelete === user.id ? (
                                            <Loader2 className="animate-spin w-5 h-5" />
                                        ) : (
                                            <Trash2 className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            <AnimatePresence>
                {editingUser && (
                    <EditUserModal 
                        user={editingUser} 
                        onClose={() => setEditingUser(null)} 
                        onSave={handleCloseModal} // Pass a function that refreshes the list
                    />
                )}
            </AnimatePresence>
        </>
    );
};

export default UserManager;
