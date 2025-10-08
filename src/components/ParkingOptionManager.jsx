import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CrudModal from './CrudModal';
import { apiFetch } from '@/utils/config'; // Relative import from components folder

/**
 * Section for displaying and managing Parking Options
 * Data is grouped by Company Name, then by Airport Location.
 */
const ParkingOptionManager = ({ parkingOptions, fetchParkingOptions }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingOption, setEditingOption] = useState(null);
    const [formState, setFormState] = useState({ 
        id: '', name: '', location: '', price: '', reviews: '', logo: '',
        icons: '', features: '', extraFeatures: ''
    });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- Data Grouping Logic ---
    const groupedOptions = useMemo(() => {
        return parkingOptions.reduce((acc, option) => {
            const companyName = option.name;
            const locationName = option.location;

            if (!acc[companyName]) {
                acc[companyName] = {};
            }
            if (!acc[companyName][locationName]) {
                // Ensure we handle the possibility of multiple options per location (though rare)
                acc[companyName][locationName] = []; 
            }

            acc[companyName][locationName].push(option);
            return acc;
        }, {});
    }, [parkingOptions]);

    // --- CRUD/Modal Handlers ---

    const handleOpenModal = (option = null) => {
        setEditingOption(option);
        if (option) {
            setFormState({
                id: option.id,
                name: option.name,
                location: option.location,
                price: option.price,
                reviews: option.reviews,
                logo: option.logo,
                // Convert arrays back to comma-separated strings for the form input
                icons: Array.isArray(option.icons) ? option.icons.join(', ') : option.icons,
                features: Array.isArray(option.features) ? option.features.join(', ') : option.features,
                extraFeatures: Array.isArray(option.extraFeatures) ? option.extraFeatures.join(', ') : option.extraFeatures,
            });
        } else {
            setFormState({ id: '', name: '', location: '', price: '', reviews: 0, logo: '', icons: '', features: '', extraFeatures: '' });
        }
        setError('');
        setModalOpen(true);
    };

    const handleChange = (e) => {
        setFormState({ ...formState, [e.target.name]: e.target.value });
    };

    const handleAction = async (action) => {
        setError('');
        setIsSubmitting(true);
        let payload = { action };

        // Process simple fields
        if (action !== 'add') payload.id = formState.id; // ID only required for update/delete
        payload.name = formState.name;
        payload.location = formState.location;
        payload.price = parseFloat(formState.price);
        payload.reviews = parseInt(formState.reviews, 10);
        payload.logo = formState.logo;

        // Process array-string fields: convert comma-separated string to array
        payload.icons = formState.icons.split(',').map(s => s.trim()).filter(s => s.length > 0);
        payload.features = formState.features.split(',').map(s => s.trim()).filter(s => s.length > 0);
        payload.extraFeatures = formState.extraFeatures.split(',').map(s => s.trim()).filter(s => s.length > 0);

        try {
            await apiFetch('parking_crud.php', payload);
            await fetchParkingOptions(); // Refresh list passed from parent
            setModalOpen(false);
            window.alert(`Parking option successfully ${action}ed.`);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleDelete = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete parking option: ${name} (ID: ${id})?`)) return;
        
        setIsSubmitting(true);
        try {
            await apiFetch('parking_crud.php', { action: 'delete', id });
            await fetchParkingOptions();
        } catch (err) {
            window.alert(`Deletion failed: ${err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        const action = editingOption ? 'update' : 'add';
        handleAction(action);
    };

    // --- Rendering ---

    const companyNames = Object.keys(groupedOptions);

    return (
        <div className="p-4 bg-gray-50 rounded-xl shadow">
            <div className="flex justify-between items-center mb-6 border-b pb-4 bg-white p-4 rounded-xl shadow-inner">
                <h2 className="text-2xl font-bold text-gray-800">Parking Inventory Management</h2>
                <button
                    onClick={() => handleOpenModal(null)}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-200 hover:scale-[1.02] transform"
                >
                    + Add New Option
                </button>
            </div>
            
            {companyNames.length === 0 ? (
                <p className="text-gray-500 text-center py-10 bg-white rounded-lg">No parking options found.</p>
            ) : (
                <AnimatePresence mode="wait">
                    <motion.div 
                        className="space-y-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        {companyNames.map((companyName, companyIndex) => (
                            <motion.div 
                                key={companyName}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: companyIndex * 0.1 }}
                                className="bg-white border border-gray-200 rounded-xl shadow-lg p-6 space-y-5"
                            >
                                {/* Company Header */}
                                <h3 className="text-3xl font-extrabold text-indigo-700 mb-4 border-b pb-2">
                                    {companyName}
                                </h3>
                                
                                {/* Location Grouping */}
                                <div className="space-y-4">
                                    {Object.keys(groupedOptions[companyName]).map((locationName, locationIndex) => (
                                        <motion.div 
                                            key={locationName}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.3, delay: locationIndex * 0.05 + companyIndex * 0.1 }}
                                            className="bg-gray-50 border-l-4 border-indigo-400 p-4 rounded-lg shadow-inner"
                                        >
                                            <h4 className="text-xl font-semibold text-gray-700 mb-3 flex items-center">
                                                <span className="mr-2 text-2xl">✈️</span> {locationName}
                                            </h4>
                                            
                                            {/* Data Table for the Location */}
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead className='bg-white'>
                                                        <tr>
                                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Reviews</th>
                                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Icons</th>
                                                            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-100">
                                                        {groupedOptions[companyName][locationName].map((option) => (
                                                            <tr key={option.id} className="hover:bg-blue-50/50 transition">
                                                                <td className="px-3 py-2 whitespace-nowrap text-sm font-mono text-gray-900">{option.id}</td>
                                                                <td className="px-3 py-2 whitespace-nowrap text-sm text-green-600 font-bold">£{option.price.toFixed(2)}</td>
                                                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{option.reviews}</td>
                                                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">{option.icons.join(' ')}</td>
                                                                <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-medium">
                                                                    <button 
                                                                        onClick={() => handleOpenModal(option)}
                                                                        className="text-indigo-600 hover:text-indigo-900 mr-3 disabled:opacity-50"
                                                                        disabled={isSubmitting}
                                                                    >
                                                                        Edit
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => handleDelete(option.id, option.name)}
                                                                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                                                        disabled={isSubmitting}
                                                                    >
                                                                        Delete
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </AnimatePresence>
            )}

            {/* CRUD Modal remains the same */}
            <CrudModal 
                isOpen={modalOpen} 
                onClose={() => setModalOpen(false)} 
                title={editingOption ? 'Edit Parking Option' : 'Add New Parking Option'}
                isSubmitting={isSubmitting}
            >
                <form onSubmit={handleSubmit} className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {error && <p className="text-red-500 text-sm p-2 bg-red-100 rounded">{error}</p>}
                    
                    {editingOption && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">ID</label>
                            <input type="text" name="id" value={formState.id} readOnly className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border bg-gray-100" />
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name (Company)</label>
                        <input type="text" name="name" value={formState.name} onChange={handleChange} required className="form-input mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div className='grid grid-cols-2 gap-4'>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Location (Airport)</label>
                            <input type="text" name="location" value={formState.location} onChange={handleChange} required className="form-input mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Price (£)</label>
                            <input type="number" step="0.01" name="price" value={formState.price} onChange={handleChange} required className="form-input mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                    </div>
                    <div className='grid grid-cols-2 gap-4'>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Reviews</label>
                            <input type="number" name="reviews" value={formState.reviews} onChange={handleChange} required className="form-input mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Logo Path</label>
                            <input type="text" name="logo" value={formState.logo} onChange={handleChange} className="form-input mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                    </div>
                    
                    <div className="pt-2">
                        <h4 className="text-lg font-semibold text-gray-700 mb-2 border-t pt-2">Features (Comma Separated)</h4>
                        <label className="block text-sm font-medium text-gray-700">Icons (e.g., ⏰, 📷, ✔)</label>
                        <input type="text" name="icons" value={formState.icons} onChange={handleChange} className="form-input mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" placeholder="e.g., ⏰, 📷, ✔" />
                        
                        <label className="block text-sm font-medium text-gray-700 mt-3">Main Features</label>
                        <textarea name="features" value={formState.features} onChange={handleChange} rows="2" className="form-textarea mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" placeholder="e.g., CCTV Secure Compound, 24 Hours Frequent Shuttles"></textarea>
                        
                        <label className="block text-sm font-medium text-gray-700 mt-3">Extra Features</label>
                        <textarea name="extraFeatures" value={formState.extraFeatures} onChange={handleChange} rows="3" className="form-textarea mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" placeholder="e.g., 24hr Patrols, Fencing, Secure Barrier, Park Mark"></textarea>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {editingOption ? 'Save Changes' : 'Add Parking Option'}
                    </button>
                </form>
            </CrudModal>
        </div>
    );
};

export default ParkingOptionManager;
