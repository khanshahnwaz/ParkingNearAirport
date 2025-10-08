import React from 'react';
import { motion } from 'framer-motion';

/**
 * Section for displaying User information
 */
const UserManager = ({ users }) => (
    <div className="p-4 bg-white rounded-xl shadow">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">User Accounts</h2>
        
        {users.length === 0 ? (
            <p className="text-gray-500 text-center py-10">No users found.</p>
        ) : (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avatar</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user, index) => (
                            <motion.tr 
                                key={user.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                className="hover:bg-gray-50"
                            >
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{user.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <img 
                                        src={user.avatar || 'https://placehold.co/40x40/ccc/000?text=U'} 
                                        alt={`${user.name} avatar`} 
                                        className="h-10 w-10 rounded-full object-cover" 
                                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/40x40/ccc/000?text=U'; }}
                                    />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(user.created_at).toLocaleDateString()}</td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
    </div>
);

export default UserManager;
