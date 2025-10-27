import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit, Trash2, X, Loader2, BarChart3, TrendingUp, TrendingDown } from 'lucide-react';
// import CrudModal from './CrudModal'; // Replaced by local Modal definition below for self-containment
import { apiFetch } from '@/utils/config'; 

// --- Local Helper Components (Modal and Confirmation) ---

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <motion.div 
            className="fixed inset-0 bg-gray-900 bg-opacity-70 z-50 flex justify-center items-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div 
                className="bg-white rounded-xl shadow-2xl w-full max-w-lg"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-6 border-b">
                    <h3 className="text-xl font-bold text-gray-800">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </motion.div>
        </motion.div>
    );
};

const ConfirmationModal = ({ isOpen, onClose, onConfirm, item, isSubmitting }) => {
    if (!isOpen) return null;
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Confirm Deletion">
            <p className="text-gray-700 mb-6">
                Are you sure you want to permanently delete the promocode: 
                <span className="font-bold text-red-600 ml-1">{item.code}</span>? 
                This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
                <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300 transition"
                    disabled={isSubmitting}
                >
                    Cancel
                </button>
                <button
                    onClick={onConfirm}
                    className="flex items-center px-4 py-2 text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 transition disabled:opacity-50"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <Loader2 className="animate-spin w-4 h-4 mr-2" />
                    ) : (
                        <Trash2 className="w-4 h-4 mr-2" />
                    )}
                    Yes, Delete
                </button>
            </div>
        </Modal>
    );
};


/**
 * Renders a visual progress bar for code usage.
 */
const UsageProgressBar = ({ uses_count = 0, usage_limit }) => {
    // If usage_limit is null, 0, or undefined, assume no limit is set
    if (!usage_limit || usage_limit <= 0) {
        return (
            <div className="mt-3 p-2 bg-gray-200 rounded-lg text-center">
                <p className="text-xs text-gray-600 font-medium flex items-center justify-center">
                    <BarChart3 className="w-3 h-3 mr-1" />
                    Unlimited Uses
                </p>
            </div>
        );
    }
    
    const percentage = Math.min(100, (uses_count / usage_limit) * 100);
    
    let color = 'bg-green-500';
    if (percentage > 90) {
        color = 'bg-red-500';
    } else if (percentage > 75) {
        color = 'bg-orange-500';
    }

    const remaining = usage_limit - uses_count;
    const isOverLimit = remaining < 0;

    return (
        <div className="space-y-1 mt-3">
            <div className="flex justify-between text-xs font-medium">
                <span className="text-gray-700">Used: {uses_count}</span>
                <span className={`font-bold ${isOverLimit ? 'text-red-600' : 'text-gray-600'}`}>
                    {isOverLimit ? `Limit: ${usage_limit}` : `Limit: ${usage_limit}`}
                </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 shadow-inner">
                <div 
                    className={`h-2.5 rounded-full transition-all duration-500 ${color}`} 
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
            {isOverLimit ? (
                 <p className="text-xs text-red-500 font-medium flex items-center">
                    <TrendingDown className="w-3 h-3 mr-1" />
                    OVER LIMIT by {Math.abs(remaining)} uses!
                 </p>
            ) : (
                 <p className="text-xs text-gray-500 font-medium flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {remaining} uses remaining
                 </p>
            )}
        </div>
    );
};

/**
 * Section for displaying and managing Promocodes
 */
const PromocodeManager = ({ promocodes, fetchPromocodes }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [confirmationOpen, setConfirmationOpen] = useState(false); // New state for confirmation modal
    const [promoToDelete, setPromoToDelete] = useState(null); // New state to hold promo being deleted

    const [editingCode, setEditingCode] = useState(null); // null for add, object for edit
    const [formState, setFormState] = useState({ 
        id: null, 
        code: '', 
        label: '', 
        discount: '', 
        usage_limit: '' 
    });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleOpenModal = (promo = null) => {
        setEditingCode(promo);
        setFormState(promo ? { 
            id: promo.id,
            code: promo.code, 
            label: promo.label, 
            discount: promo.discount,
            usage_limit: promo.usage_limit || '' // Ensure it displays empty string if limit is null/0
        } : { 
            id: null,
            code: '', 
            label: '', 
            discount: '', 
            usage_limit: '' 
        });
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
        payload.discount = parseInt(payload.discount, 10) || 0;
        
        // Ensure usage_limit is handled: 0 or null are treated as unlimited, non-zero positive integer as limit
        // Using `payload.usage_limit = payload.usage_limit ? parseInt(payload.usage_limit, 10) : 0;` to send 0 for empty input
        payload.usage_limit = payload.usage_limit ? parseInt(payload.usage_limit, 10) : 0; 

        // Add id only for update action
        console.log("action ",action," id ",editingCode)
        if (action === 'update' && editingCode) {
            payload.id = editingCode.id;
        }

        try {
            await apiFetch('promocodes_crud.php', payload);
            await fetchPromocodes(); // Refresh list passed from parent
            setModalOpen(false);
            console.log(`Promocode successfully ${action}ed.`); 
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // Step 1: Open confirmation modal
    const handleConfirmDelete = (promo) => {
        setPromoToDelete(promo);
        setConfirmationOpen(true);
    }
    
    // Step 2: Execute deletion upon confirmation
    const handleDelete = async () => {
        if (!promoToDelete) return; // Should not happen

        setIsSubmitting(true);
        setConfirmationOpen(false); // Close confirmation modal immediately
        
        try {
            await apiFetch('promocodes_crud.php', { action: 'delete', id: promoToDelete.id });
            await fetchPromocodes();
            // Clear temporary message and user to delete
            setPromoToDelete(null);
            console.log(`Promocode ${promoToDelete.code} deleted.`);
        } catch (err) {
            console.error(`Deletion failed: ${err.message}`);
            // Reopen modal to show error
            // NOTE: Since the current design doesn't have a separate notification system, 
            // we'll just log and rely on manual error feedback for now.
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
        <div className="p-4 bg-white rounded-xl shadow-2xl">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-2xl font-extrabold text-gray-800">Promocodes Management</h2>
                <button
                    onClick={() => handleOpenModal(null)}
                    className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-xl shadow-md transition duration-200 transform hover:scale-[1.02]"
                >
                    <Edit className="w-5 h-5 mr-2" /> Add New Code
                </button>
            </div>

            {promocodes.length === 0 ? (
                <p className="text-gray-500 text-center py-10 text-lg">No promocodes found.</p>
            ) : (
                // Card Grid Layout Implementation
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-4">
                    {promocodes.map((promo, index) => {
                        // Assume promo includes uses_count (simulated for display if missing)
                        // NOTE: If your PHP/API doesn't return uses_count, it will be randomly simulated here.
                        // Ensure your backend sends the real 'uses_count' and 'usage_limit'.
                        const uses_count = promo.uses_count ; 
                        
                        return (
                            <motion.div 
                                key={promo.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                className="bg-white border border-indigo-100 rounded-2xl p-6 shadow-xl flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:border-indigo-500"
                            >
                                <div className="space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div className="font-mono text-2xl font-bold text-indigo-700">{promo.code}</div>
                                        <div className="text-xl font-extrabold text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-200 shadow-sm">
                                            {promo.discount}%
                                        </div>
                                    </div>

                                    <p className="text-md text-gray-700 font-medium">{promo.label}</p>
                                    
                                    {/* Usage Progress Bar */}
                                    <UsageProgressBar uses_count={uses_count} usage_limit={promo.usage_limit} />
                                </div>

                                {/* Actions */}
                                <div className="flex justify-end pt-4 space-x-3 border-t mt-4 border-gray-100">
                                    <button 
                                        onClick={() => handleOpenModal(promo)}
                                        className="text-indigo-600 hover:text-indigo-800 p-2 rounded-full hover:bg-indigo-100 transition"
                                        title="Edit Promocode"
                                        disabled={isSubmitting}
                                    >
                                        <Edit className="w-5 h-5" />
                                    </button>
                                    <button 
                                        onClick={() => handleConfirmDelete(promo)}
                                        className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-100 transition"
                                        title="Delete Promocode"
                                        disabled={isSubmitting}
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Edit/Add Modal */}
            <Modal 
                isOpen={modalOpen} 
                onClose={() => setModalOpen(false)} 
                title={editingCode ? `Edit Promocode: ${editingCode.code}` : 'Add New Promocode'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <p className="text-red-600 text-sm p-3 bg-red-100 rounded-lg">{error}</p>}
                    
                    {/* Code */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Code</label>
                        <input
                            type="text"
                            name="code"
                            value={formState.code}
                            onChange={handleChange}
                            required
                            readOnly={!!editingCode}
                            className={`mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 border ${editingCode ? 'bg-gray-100 cursor-not-allowed' : 'focus:ring-indigo-500 focus:border-indigo-500'}`}
                        />
                    </div>
                    {/* Label */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Label</label>
                        <input
                            type="text"
                            name="label"
                            value={formState.label}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 border focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    {/* Discount */}
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
                            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 border focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    {/* Usage Limit (New Field) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Usage Limit (0 for Unlimited)</label>
                        <input
                            type="number"
                            name="usage_limit"
                            value={formState.usage_limit}
                            onChange={handleChange}
                            min="0"
                            placeholder="e.g., 100 or 0 for unlimited"
                            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 border focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center"
                    >
                        {isSubmitting && <Loader2 className="w-5 h-5 animate-spin mr-2" />}
                        {editingCode ? 'Save Changes' : 'Add Promocode'}
                    </button>
                </form>
            </Modal>

            {/* Confirmation Modal for Deletion */}
            <ConfirmationModal 
                isOpen={confirmationOpen} 
                onClose={() => setConfirmationOpen(false)} 
                onConfirm={handleDelete}
                item={promoToDelete || { code: 'N/A' }}
                isSubmitting={isSubmitting}
            />
        </div>
    );
};

export default PromocodeManager;
