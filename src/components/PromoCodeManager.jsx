import React, { useState } from 'react';
import { motion } from 'framer-motion';
import CrudModal from './CrudModal';
import { apiFetch } from '@/utils/config'; // Relative import from components folder

/**
 * Section for displaying and managing Promocodes
 */
const PromocodeManager = ({ promocodes, fetchPromocodes }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingCode, setEditingCode] = useState(null); // null for add, object for edit
    const [formState, setFormState] = useState({ code: '', label: '', discount: '' });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleOpenModal = (code = null) => {
        setEditingCode(code);
        setFormState(code ? { code: code.code, label: code.label, discount: code.discount } : { code: '', label: '', discount: '' });
        setError('');
        setModalOpen(true);
    };

    const handleChange = (e) => {
        setFormState({ ...formState, [e.target.name]: e.target.value });
    };

    const handleAction = async (action) => {
        setError('');
        setIsSubmitting(true);
        let payload = { action, ...formState };
        
        // Ensure discount is an integer
        payload.discount = parseInt(payload.discount, 10);
        
        try {
            await apiFetch('promocodes_crud.php', payload);
            await fetchPromocodes(); // Refresh list passed from parent
            setModalOpen(false);
            // Use window.alert as a simple notification (per instructions)
            window.alert(`Promocode successfully ${action}ed.`); 
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleDelete = async (code) => {
        if (!window.confirm(`Are you sure you want to delete the promocode: ${code}?`)) return;
        
        setIsSubmitting(true);
        try {
            await apiFetch('promocodes_crud.php', { action: 'delete', code });
            await fetchPromocodes();
        } catch (err) {
            window.alert(`Deletion failed: ${err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        const action = editingCode ? 'update' : 'add';
        handleAction(action);
    };


    return (
        <div className="p-4 bg-white rounded-xl shadow">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-700">Promocodes Management</h2>
                <button
                    onClick={() => handleOpenModal(null)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-200"
                >
                    + Add New Code
                </button>
            </div>

            {promocodes.length === 0 ? (
                <p className="text-gray-500 text-center py-10">No promocodes found.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Label</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount (%)</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {promocodes.map((promo, index) => (
                                <motion.tr 
                                    key={promo.code}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    className="hover:bg-gray-50"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-indigo-600">{promo.code}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{promo.label}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{promo.discount}%</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button 
                                            onClick={() => handleOpenModal(promo)}
                                            className="text-indigo-600 hover:text-indigo-900 mr-3 disabled:opacity-50"
                                            disabled={isSubmitting}
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(promo.code)}
                                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                            disabled={isSubmitting}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <CrudModal 
                isOpen={modalOpen} 
                onClose={() => setModalOpen(false)} 
                title={editingCode ? 'Edit Promocode' : 'Add Promocode'}
                isSubmitting={isSubmitting}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <p className="text-red-500 text-sm p-2 bg-red-100 rounded">{error}</p>}
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Code</label>
                        <input
                            type="text"
                            name="code"
                            value={formState.code}
                            onChange={handleChange}
                            required
                            readOnly={!!editingCode}
                            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border ${editingCode ? 'bg-gray-100' : 'focus:ring-indigo-500 focus:border-indigo-500'}`}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Label</label>
                        <input
                            type="text"
                            name="label"
                            value={formState.label}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Discount (%)</label>
                        <input
                            type="number"
                            name="discount"
                            value={formState.discount}
                            onChange={handleChange}
                            required
                            min="0"
                            max="100"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {editingCode ? 'Save Changes' : 'Add Promocode'}
                    </button>
                </form>
            </CrudModal>
        </div>
    );
};

export default PromocodeManager;
