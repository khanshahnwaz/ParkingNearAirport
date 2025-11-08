// PROMOCODE MANAGER - Updated with start_date, end_date, and activeness toggle

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2, Loader2, Calendar, Check, X } from 'lucide-react';
import { apiFetch } from '@/utils/config';
import Modal from './Modal';
import ConfirmationModal from './ConfirmationModal';
import UsageProgressBar from './UsageProgressBar';

// --- Local Components ---

const StatusPill = ({ status }) => {
    let color = 'bg-gray-200 text-gray-800';
    if (status === 'Active') color = 'bg-green-100 text-green-700 font-bold';
    if (status === 'Inactive') color = 'bg-yellow-100 text-yellow-700';
    if (status === 'Expired') color = 'bg-red-100 text-red-700';

    return (
        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${color}`}>
            {status}
        </span>
    );
};

const ActivenessToggle = ({ promo, onToggle, isSubmitting }) => {
    const isActive = promo.activeness === 'Active';

    return (
        <motion.button
            onClick={(e) => { e.stopPropagation(); onToggle(promo); }}
            disabled={isSubmitting}
            className={`w-14 h-7 rounded-full p-1 transition-colors duration-300 ${isActive ? 'bg-green-500' : 'bg-gray-300'}`}
            initial={false}
            animate={{ backgroundColor: isActive ? '#10B981' : '#D1D5DB' }}
            whileHover={{ scale: 1.05 }}
            title={isActive ? 'Mark Inactive' : 'Mark Active'}
        >
            <motion.div
                className="w-5 h-5 bg-white rounded-full shadow-md flex items-center justify-center"
                animate={{ x: isActive ? '100%' : '0%' }}
                transition={{ type: 'spring', stiffness: 700, damping: 30 }}
            >
                {isSubmitting ? (
                    <Loader2 className="w-3 h-3 text-gray-400 animate-spin" />
                ) : isActive ? (
                    <Check className="w-4 h-4 text-green-500" />
                ) : (
                    <X className="w-4 h-4 text-gray-400" />
                )}
            </motion.div>
        </motion.button>
    );
};
// --- Main Component ---

const PromocodeManager = ({ promocodes, fetchPromocodes }) => {
    console.log("promocodes ",promocodes)
    const [modalOpen, setModalOpen] = useState(false);
    const [confirmationOpen, setConfirmationOpen] = useState(false);
    const [promoToDelete, setPromoToDelete] = useState(null);
    const [editingCode, setEditingCode] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    // Track which promo is being toggled to disable its specific button
    const [togglingId, setTogglingId] = useState(null); 
    const [error, setError] = useState('');

    const [formState, setFormState] = useState({
        id: null,
        code: '',
        label: '',
        discount: '',
        usage_limit: '',
        start_date: '',
        end_date: '',
        activeness: 'Inactive', // Added activeness to form state
    });

    const handleOpenModal = (promo = null) => {
        setEditingCode(promo);
        setFormState(
            promo
                ? {
                    id: promo.id,
                    code: promo.code,
                    label: promo.label,
                    discount: promo.discount,
                    usage_limit: promo.usage_limit || '',
                    start_date: promo.start_date || '',
                    end_date: promo.end_date || '',
                    activeness: promo.activeness || 'Inactive', // Load existing activeness
                }
                : {
                    id: null,
                    code: '',
                    label: '',
                    discount: '',
                    usage_limit: '',
                    start_date: '',
                    end_date: '',
                    activeness: 'Inactive', // Default for new code
                }
        );
        setModalOpen(true);
    };

    const handleChange = (e) => {
        setFormState({ ...formState, [e.target.name]: e.target.value });
    };

    const handleAction = async (action, promoId = null) => {
        setError('');
        setIsSubmitting(true);
        let payload = { action, ...formState };

        payload.discount = parseInt(payload.discount, 10) || 0;
        payload.usage_limit = parseInt(payload.usage_limit, 10) || 0;

        if (action === 'update' && editingCode) payload.id = editingCode.id;

        try {
            await apiFetch('promocodes_crud.php', payload);
            await fetchPromocodes();
            setModalOpen(false);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleAction(editingCode ? 'update' : 'add');
    };

    const handleConfirmDelete = (promo) => {
        setPromoToDelete(promo);
        setConfirmationOpen(true);
    };

    const handleDelete = async () => {
        setIsSubmitting(true);
        setConfirmationOpen(false);
        try {
            await apiFetch('promocodes_crud.php', { action: 'delete', id: promoToDelete.id });
            await fetchPromocodes();
            setPromoToDelete(null);
        } catch (err) {
            console.error(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // --- NEW LOGIC FOR TOGGLE ---
    const handleToggleActiveness = async (promo) => {
        setTogglingId(promo.id);
        const newActiveness = promo.activeness === 'Active' ? 'Inactive' : 'Active';

        try {
            // Assume backend handles an 'update_status' action or similar
            await apiFetch('promocodes_crud.php', {
                action: 'update_activeness', // Custom action for status change
                id: promo.id,
                activeness: newActiveness,
            });
            await fetchPromocodes(); // Refresh the list
        } catch (err) {
            console.error("Failed to toggle activeness:", err);
            // Optionally, show an error toast/message
        } finally {
            setTogglingId(null);
        }
    };
    // --- END NEW LOGIC ---

    return (
        <div className="p-4 bg-white rounded-xl shadow-2xl">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-2xl font-extrabold text-gray-800">✨ Promocodes Management</h2>
                <button
                    onClick={() => handleOpenModal(null)}
                    className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-xl shadow-md transition duration-200"
                >
                    + Add New Code
                </button>
            </div>

            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {promocodes.length === 0 ? (
                    <p className="text-gray-500 text-center py-10 text-lg">No promocodes found.</p>
                ) : (
                    promocodes.map((promo) => (
                        <motion.div
                            key={promo.id}
                            className="p-5 border rounded-xl shadow hover:shadow-lg transition bg-white"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-mono font-bold text-indigo-700">{promo.code}</h3>
                                    <p className="text-gray-700 mt-1 font-medium">{promo.label}</p>
                                </div>
                                <div className="text-right">
                                    <span className="px-3 py-1 bg-green-100 text-green-700 font-semibold rounded-full text-sm">
                                        {promo.discount}%
                                    </span>
                                    {/* NEW: Activeness Pill */}
                                    <div className="mt-1">
                                        <StatusPill status={promo.activeness} />
                                    </div>
                                    {/* END NEW */}
                                </div>
                            </div>

                            <div className="text-xs text-gray-500 mt-3 flex items-center space-x-2 border-t pt-3">
                                <Calendar className="w-3 h-3" />
                                <span className="flex-1">
                                    <span className="font-medium">Start:</span> {promo.start_date || 'N/A'} 
                                    <span className="mx-2 text-gray-400">|</span>
                                    <span className="font-medium">End:</span> {promo.end_date || 'N/A'}
                                </span>
                            </div>

                            <UsageProgressBar uses_count={promo.uses_count} usage_limit={promo.usage_limit} />

                            <div className="flex justify-between items-center mt-4 border-t pt-3">
                                {/* NEW: Activeness Toggle */}
                                <ActivenessToggle 
                                    promo={promo} 
                                    onToggle={handleToggleActiveness} 
                                    isSubmitting={togglingId === promo.id}
                                />
                                {/* END NEW */}

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handleOpenModal(promo)}
                                        className="text-indigo-600 hover:text-indigo-800 p-1 rounded-full hover:bg-indigo-50 transition"
                                    >
                                        <Edit className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleConfirmDelete(promo)}
                                        className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50 transition"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Modal and ConfirmationModal remain the same... */}
            {/* Modal: Add or Edit Promocode */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingCode ? 'Edit Promocode' : 'Add New Promocode'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <p className="text-red-600 text-sm">{error}</p>}

                    <input
                        type="text"
                        name="code"
                        placeholder="Code"
                        value={formState.code}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border rounded-lg"
                    />
                    <input
                        type="text"
                        name="label"
                        placeholder="Label"
                        value={formState.label}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border rounded-lg"
                    />
                    <input
                        type="number"
                        name="discount"
                        placeholder="Discount (%)"
                        value={formState.discount}
                        onChange={handleChange}
                        className="w-full p-3 border rounded-lg"
                    />
                    <input
                        type="number"
                        name="usage_limit"
                        placeholder="Usage Limit (0 for Unlimited)"
                        value={formState.usage_limit}
                        onChange={handleChange}
                        className="w-full p-3 border rounded-lg"
                    />
                    {/* NEW: Activeness Dropdown for initial/edit setup */}
                    <select
                        name="activeness"
                        value={formState.activeness}
                        onChange={handleChange}
                        className="w-full p-3 border rounded-lg"
                    >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Expired">Expired</option>
                    </select>
                    {/* END NEW */}
                    <div className="flex gap-3">
                        <input
                            type="date"
                            name="start_date"
                            value={formState.start_date}
                            onChange={handleChange}
                            className="w-full p-3 border rounded-lg"
                        />
                        <input
                            type="date"
                            name="end_date"
                            value={formState.end_date}
                            onChange={handleChange}
                            className="w-full p-3 border rounded-lg"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 flex justify-center"
                    >
                        {isSubmitting && <Loader2 className="animate-spin w-5 h-5 mr-2" />}
                        {editingCode ? 'Save Changes' : 'Add Promocode'}
                    </button>
                </form>
            </Modal>

            <ConfirmationModal
                isOpen={confirmationOpen}
                onClose={() => setConfirmationOpen(false)}
                onConfirm={handleDelete}
                item={promoToDelete || { code: '' }}
                isSubmitting={isSubmitting}
            />
        </div>
    );
};

export default PromocodeManager;