// components/ParkingOptionManager.jsx
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit, Trash2, X, Loader2, Save, Plus, Search } from 'lucide-react';

// --- Local API Fetch Utility (Self-Contained) ---
// NOTE: This utility is included locally to resolve potential module import issues (@/utils/config) 
const localApiFetch = async (endpoint, options = {}) => {
    // Fallback URL assumes API is served from the same domain root
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE || ''; 
    const url = `${API_BASE_URL}/${endpoint}`;
    
    // Default headers, specifically setting Content-Type for JSON payloads
    const defaultHeaders = options.body && typeof options.body === 'string' 
        ? { 'Content-Type': 'application/json' } 
        : {};

    try {
        const response = await fetch(url, {
            method: options.method || 'GET',
            headers: {
                ...defaultHeaders,
                ...options.headers,
            },
            body: options.method !== 'GET' ? options.body : undefined,
        });

        const data = await response.json();

        if (data && data.ok === false) {
            throw new Error(data.error || 'API response indicated failure.');
        }
        return data.data || data.companies || data; 
    } catch (error) {
        throw new Error(error.message || `API request failed for ${endpoint}.`);
    }
};

// --- Dedicated File Upload Utility (Self-Contained) ---
const fileApiFetch = async (endpoint, formData) => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE || '';
    const url = `${API_BASE_URL}/${endpoint}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            body: formData, 
        });

        const data = await response.json();

        if (!data.ok) {
            throw new Error(data.error || 'File upload failed.');
        }

        return data.data || data;

    } catch (error) {
        console.error("File API Fetch Error:", error);
        throw new Error(`File upload failed: ${error.message}`);
    }
};

// --- Crud Modal Component ---
const CrudModal = ({ isOpen, onClose, title, children }) => {
    const cardVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
        exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15 } },
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    className="fixed inset-0 bg-gray-900 bg-opacity-70 z-50 flex justify-center items-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div 
                        className="bg-white rounded-xl shadow-2xl w-full max-w-xl"
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
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
            )}
        </AnimatePresence>
    );
};


/**
 * Section for displaying and managing Parking Options
 */
const ParkingOptionManager = ({ parkingOptions: parkingOptionsProp, fetchParkingOptions }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingOption, setEditingOption] = useState(null);
    const [formState, setFormState] = useState({ 
        id: '', name: '', location: '', price: '', reviews: '', logo: '',
        icons: '', features: '', extraFeatures: '', terminals: '' 
    });
    
    // --- STATE MANAGEMENT ---
    const [companiesList, setCompaniesList] = useState([]); 
    const [logoFile, setLogoFile] = useState(null); 
    const [iconFiles, setIconFiles] = useState([]); 
    const [message, setMessage] = useState({ type: '', text: '' }); 
    const [loadingDelete, setLoadingDelete] = useState(null); 
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- Filter State ---
    const [companyFilter, setCompanyFilter] = useState('');
    const [airportFilter, setAirportFilter] = useState('');

    const clearMessage = useCallback(() => {
        setMessage({ type: '', text: '' });
    }, []);

    const stringToArray = useCallback((str) => str.split(',').map(s => s.trim()).filter(s => s.length > 0), []);
    const arrayToString = useCallback((arr) => Array.isArray(arr) ? arr.join(', ') : (arr || ''), []);
    
    // Determine the base URL for asset loading (used for images)
    const ASSET_BASE_URL = process.env.NEXT_PUBLIC_API_BASE || ''; 

    // --- Fetch all companies for the dropdown ---
    const fetchCompaniesList = useCallback(async () => {
        try {
            const result = await localApiFetch("get_companies.php", { method: 'GET' }); 
            setCompaniesList(result.data || result || []); 
        } catch (err) {
            console.error("Error fetching companies:", err);
            setMessage({ type: 'error', text: err.message || "Failed to load company list for dropdown." });
        }
    }, []);

    // Load initial data 
    useEffect(() => {
        if (fetchParkingOptions) fetchParkingOptions(); 
        fetchCompaniesList(); 
    }, [fetchCompaniesList, fetchParkingOptions]);

    // --- File handlers ---
    const handleLogoChange = (e) => {
        setLogoFile(e.target.files[0] || null);
    };

    // Handler for multiple icon files
    const handleIconFileChange = (e) => {
        const files = Array.from(e.target.files);
        setIconFiles(files);
    };

    // --- Filtered List and Grouping Logic ---
    const filteredOptions = useMemo(() => {
        return parkingOptionsProp.filter(option => {
            const matchesCompany = companyFilter === '' || option.name === companyFilter;
            const matchesAirport = airportFilter === '' || 
                                   (option.location && option.location.toLowerCase().includes(airportFilter.toLowerCase()));
            return matchesCompany && matchesAirport;
        });
    }, [parkingOptionsProp, companyFilter, airportFilter]);

    const groupedOptions = useMemo(() => {
        return filteredOptions.reduce((acc, option) => {
            const companyName = option.name;
            const locationName = option.location;

            if (!acc[companyName]) {
                acc[companyName] = {};
            }
            if (!acc[companyName][locationName]) {
                acc[companyName][locationName] = []; 
            }

            acc[companyName][locationName].push(option);
            return acc;
        }, {});
    }, [filteredOptions]);

    // --- CRUD/Modal Handlers ---

    const handleOpenModal = (option = null) => {
        setEditingOption(option);
        clearMessage();
        setLogoFile(null); 
        setIconFiles([]); 
        
        if (option) {
            setFormState({
                id: option.id,
                name: option.name, 
                location: option.location,
                price: option.price,
                reviews: option.reviews,
                logo: option.logo || '', 
                
                icons: arrayToString(option.icons),
                features: arrayToString(option.features),
                extraFeatures: arrayToString(option.extraFeatures),
                terminals: arrayToString(option.terminals) 
            });
        } else {
            setFormState({ 
                id: '', name: '', location: '', price: '', reviews: 0, logo: '', 
                icons: '', features: '', extraFeatures: '', terminals: '' 
            });
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
        setMessage({ type: '', text: '' }); 
        
        let payload = { action };
        
        // --- Payload Construction ---
        if (action !== 'add') payload.id = formState.id;
        payload.name = formState.name; 
        payload.location = formState.location;
        payload.price = parseFloat(formState.price);
        payload.reviews = parseInt(formState.reviews, 10) || 0;
        
        if (!payload.name || !payload.location || isNaN(payload.price)) {
            setError("Company, Location, and Price are required fields.");
            setIsSubmitting(false);
            return;
        }

        // Convert string inputs to arrays for API
        payload.icons = stringToArray(formState.icons);
        payload.features = stringToArray(formState.features);
        payload.extraFeatures = stringToArray(formState.extraFeatures);
        payload.terminals = stringToArray(formState.terminals); 
        
        // Pass the existing logo path if no new file is uploaded (for update)
        if (!logoFile) {
            payload.logo = formState.logo; 
        } else {
            // Clear old logo path if a new file is present (it will be handled by upload)
            payload.logo = '';
        }
        
        // Only trigger file upload if EITHER a logo file OR icon files are present
        const hasFilesToUpload = logoFile || iconFiles.length > 0;

        try {
            if (hasFilesToUpload) {
                // --- FILE UPLOAD PATH (Form Data) ---
                const formData = new FormData();
                
                // 1. Append Logo File
                if (logoFile) {
                    formData.append('logo_upload', logoFile);
                }
                
                // 2. Append Icon Files (Multiple files)
                iconFiles.forEach((file, index) => {
                    formData.append(`icon_upload_${index}`, file);
                });

                // 3. Append JSON payload fields
                Object.keys(payload).forEach(key => {
                    if (Array.isArray(payload[key]) || typeof payload[key] === 'object') {
                        formData.append(key, JSON.stringify(payload[key]));
                    } else {
                        formData.append(key, payload[key]);
                    }
                });
                
                // 4. Add context for file saving path
                formData.append('file_upload_context', JSON.stringify({
                    companyName: formState.name,
                    airportName: formState.location,
                }));
                
                await fileApiFetch('parking_crud.php', formData); 

            } else {
                // --- STANDARD JSON PATH (No file upload) ---
                await localApiFetch('parking_crud.php', {
                    method: 'POST',
                    body: JSON.stringify(payload)
                });
            }

            if (fetchParkingOptions) await fetchParkingOptions(); 
            setModalOpen(false);
            setMessage({ type: 'success', text: `Parking option successfully ${action}ed.` });
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
            setLogoFile(null); 
            setIconFiles([]); // Clear icon files on completion/error
        }
    };
    
    const handleDelete = async (id, name) => {
        if (!confirm(`Are you sure you want to delete parking option: ${name} (ID: ${id})?`)) return; 
        
        setLoadingDelete(id);
        setMessage({ type: '', text: '' });
        
        try {
            await localApiFetch('parking_crud.php', { method: 'POST', body: JSON.stringify({ action: 'delete', id }) });
            if (fetchParkingOptions) await fetchParkingOptions();
            setMessage({ type: 'success', text: `Parking option ${name} deleted successfully.` });
        } catch (err) {
            setMessage({ type: 'error', text: err.message || `Deletion of ${name} failed.` });
        } finally {
            setLoadingDelete(null);
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        const action = editingOption ? 'update' : 'add';
        handleAction(action);
    };


    // Message rendering logic (for dashboard display)
    const MessageDisplay = useMemo(() => {
        if (!message.text) return null;
        const baseClasses = "mb-4 p-4 rounded-xl font-medium flex justify-between items-center";
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
                    className="text-current opacity-70 hover:opacity-100"
                    aria-label="Close message"
                >
                    <X className="w-5 h-5" />
                </button>
            </motion.div>
        );
    }, [message, clearMessage]);


    // --- Rendering ---

    const companyNames = Object.keys(groupedOptions);

    return (
        <div className="p-4 bg-gray-50 rounded-xl shadow-2xl">
            
            {/* Header and Add Button */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b pb-4 bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0">Parking Inventory Management</h2>
                <button
                    onClick={() => handleOpenModal(null)}
                    className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-200 hover:scale-[1.02] transform"
                >
                    <Plus className='w-5 h-5 mr-1'/> Add New Option
                </button>
            </div>
            
            <AnimatePresence>
                {MessageDisplay}
            </AnimatePresence>
            
            {/* Search and Filter Section */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-xl shadow-lg mb-6 flex flex-col md:flex-row gap-4 items-center"
            >
                <div className="relative w-full md:w-1/3">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    <select 
                        value={companyFilter}
                        onChange={(e) => setCompanyFilter(e.target.value)}
                        className="w-full border-2 border-gray-200 rounded-lg py-2 pl-10 pr-4 text-gray-700 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white transition"
                    >
                        <option value="">Filter by Company (All)</option>
                        {companiesList.map(company => (
                            <option key={company.id} value={company.name}>
                                {company.name}
                            </option>
                        ))}
                    </select>
                </div>
                
                <div className="relative w-full md:w-1/3">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    <input 
                        type="text"
                        placeholder="Search by Airport Location..."
                        value={airportFilter}
                        onChange={(e) => setAirportFilter(e.target.value)}
                        className="w-full border-2 border-gray-200 rounded-lg py-2 pl-10 pr-4 text-gray-700 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    />
                </div>

                <button
                    onClick={() => { setCompanyFilter(''); setAirportFilter(''); }}
                    className="w-full md:w-auto bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition shrink-0"
                >
                    Reset Filters
                </button>
            </motion.div>


            {/* Display Table */}
            {companyNames.length === 0 ? (
                <p className="text-gray-500 text-center py-10 bg-white rounded-lg shadow-lg">
                    {companyFilter || airportFilter ? 'No matching parking options found for the current filters.' : 'No parking options found.'}
                </p>
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
                                className="bg-white border border-gray-200 rounded-2xl shadow-2xl p-6 space-y-5"
                            >
                                <h3 className="text-3xl font-extrabold text-indigo-700 mb-4 border-b pb-2">
                                    {companyName}
                                </h3>
                                
                                <div className="space-y-6">
                                    {Object.keys(groupedOptions[companyName]).map((locationName, locationIndex) => {
                                        // Get logo path from the first option in the group
                                        const firstOption = groupedOptions[companyName][locationName][0];
                                        const logoPath = firstOption.logo ? `${ASSET_BASE_URL}${firstOption.logo}` : null;
                                        const isLogoAvailable = !!logoPath;

                                        return (
                                            <motion.div 
                                                key={locationName}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.3, delay: locationIndex * 0.05 + companyIndex * 0.1 }}
                                                className="bg-gray-50 border-l-4 border-indigo-500 p-5 rounded-xl shadow-inner"
                                            >
                                                <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                                    {isLogoAvailable ? (
                                                        <img 
                                                            src={logoPath}
                                                            alt={`${companyName} Logo`}
                                                            className="w-6 h-6 mr-2 object-contain"
                                                            // Fallback to airplane emoji span if image fails to load
                                                            onError={(e) => { e.target.onerror = null; e.target.outerHTML = '<span class="mr-2 text-2xl" role="img" aria-label="airplane">✈️</span>'; }}
                                                        />
                                                    ) : (
                                                        <span className="mr-2 text-2xl" role="img" aria-label="airplane">✈️</span>
                                                    )}
                                                    {locationName}
                                                </h4>
                                                
                                                <div className="overflow-x-auto">
                                                    <table className="min-w-full divide-y divide-gray-200 border border-gray-100 rounded-lg overflow-hidden">
                                                        <thead className='bg-indigo-100/50'>
                                                            <tr>
                                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">ID</th>
                                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Price</th>
                                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Reviews</th>
                                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Terminals</th>
                                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Icons</th>
                                                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="bg-white divide-y divide-gray-100">
                                                            {groupedOptions[companyName][locationName].map((option) => (
                                                                <tr key={option.id} className="hover:bg-blue-50/50 transition">
                                                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-900">{option.id}</td>
                                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600 font-bold">£{parseFloat(option.price).toFixed(2)}</td>
                                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{option.reviews}</td>
                                                                    
                                                                    {/* Display Terminals */}
                                                                    <td className="px-4 py-3 whitespace-normal text-xs text-indigo-700 font-medium max-w-xs">
                                                                        <div className='flex flex-wrap gap-1'>
                                                                            {Array.isArray(option.terminals) ? option.terminals.map((t, i) => (
                                                                                <span key={i} className='bg-indigo-50 text-indigo-600 rounded-full px-2 py-0.5 text-xs font-semibold'>
                                                                                    {t}
                                                                                </span>
                                                                            )) : 'N/A'}
                                                                        </div>
                                                                    </td>
                                                                    
                                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                                                                        {/* Display Icons: Renders image paths or plain text/emoji */}
                                                                        <div className='flex gap-1'>
                                                                            {Array.isArray(option.icons) && option.icons.map((iconPath, i) => (
                                                                                // Check if the item looks like a URL/path (starts with /)
                                                                                iconPath.startsWith('/') ? (
                                                                                    <img 
                                                                                        key={i} 
                                                                                        // CRITICAL FIX: Prepend ASSET_BASE_URL to DB path
                                                                                        src={`${ASSET_BASE_URL}${iconPath}`} 
                                                                                        alt={`Icon ${i}`} 
                                                                                        className='w-5 h-5 object-contain rounded' 
                                                                                        // Fallback image if the URL is broken
                                                                                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/20x20/cccccc/000000?text=?'; }}
                                                                                    />
                                                                                ) : (
                                                                                    <span key={i} className='text-xl'>{iconPath}</span> // Assume it's an emoji or plain text icon
                                                                                )
                                                                            ))}
                                                                        </div>
                                                                    </td>
                                                                    
                                                                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                                                        <button 
                                                                            onClick={() => handleOpenModal(option)}
                                                                            className="text-indigo-600 hover:text-indigo-900 p-2 rounded-full hover:bg-indigo-100 transition disabled:opacity-50"
                                                                            disabled={isSubmitting}
                                                                            title="Edit"
                                                                        >
                                                                            <Edit className="w-5 h-5 inline-block"/>
                                                                        </button>
                                                                        <button 
                                                                            onClick={() => handleDelete(option.id, option.name)}
                                                                            className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-100 transition disabled:opacity-50"
                                                                            disabled={loadingDelete === option.id}
                                                                            title="Delete"
                                                                        >
                                                                            {loadingDelete === option.id ? (
                                                                                <Loader2 className="animate-spin w-5 h-5 inline-block"/>
                                                                            ) : (
                                                                                <Trash2 className="w-5 h-5 inline-block"/>
                                                                            )}
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </AnimatePresence>
            )}

            {/* CRUD Modal */}
            <CrudModal 
                isOpen={modalOpen} 
                onClose={() => { setModalOpen(false); setLogoFile(null); setIconFiles([]); }} 
                title={editingOption ? 'Edit Parking Option' : 'Add New Parking Option'}
            >
                <form onSubmit={handleSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto pr-4">
                    {error && <p className="text-red-600 text-sm p-2 bg-red-100 rounded-lg">{error}</p>}
                    
                    {editingOption && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">ID</label>
                            <input type="text" name="id" value={formState.id} readOnly className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-2 border bg-gray-100" />
                        </div>
                    )}
                    
                    {/* Company Name as Dropdown */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name (Company)</label>
                        <select 
                            name="name" 
                            value={formState.name} 
                            onChange={handleChange} 
                            required 
                            className="form-select mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-2 border focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="" disabled>Select Company</option>
                            {companiesList.map(company => (
                                <option key={company.id} value={company.name}>
                                    {company.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className='grid grid-cols-2 gap-4'>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Location (Airport)</label>
                            <input type="text" name="location" value={formState.location} onChange={handleChange} required className="form-input mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-2 border focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Price (£)</label>
                            <input type="number" step="0.01" name="price" value={formState.price} onChange={handleChange} required className="form-input mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-2 border focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                    </div>

                    <div className='grid grid-cols-2 gap-4'>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Reviews</label>
                            <input type="number" name="reviews" value={formState.reviews} onChange={handleChange} required className="form-input mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-2 border focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        
                        {/* Logo Upload Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Company Logo (File)</label>
                            <input 
                                type="file" 
                                name="logo_upload" 
                                onChange={handleLogoChange} 
                                accept="image/*"
                                className="mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-white file:py-2 file:px-4 file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                            />
                            {editingOption && formState.logo && !logoFile && (
                                <>
                                    <p className="text-xs text-gray-500 mt-1 truncate">Current: {formState.logo.split('/').pop()}</p>
                                    <img 
                                        // CRITICAL FIX: Prepend ASSET_BASE_URL to DB path
                                        src={`${ASSET_BASE_URL}${formState.logo}`} 
                                        alt="Current Logo" 
                                        className="w-16 h-16 object-contain border rounded p-1 mt-1" 
                                        // Default fallback image
                                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/64x64/cccccc/000000?text=LOGO'; }}
                                    />
                                </>
                            )}
                            {logoFile && (
                                <p className="text-xs text-green-600 mt-1">Ready to upload: {logoFile.name}</p>
                            )}
                        </div>
                    </div>
                    
                    <div className="pt-2 border-t mt-4">
                        <h4 className="text-lg font-semibold text-gray-700 mb-2">Terminal Assignments</h4>
                        <label className="block text-sm font-medium text-gray-700">Terminals Supported (Comma Separated)</label>
                        <input 
                            type="text" 
                            name="terminals" 
                            value={formState.terminals} 
                            onChange={handleChange} 
                            className="form-input mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-2 border" 
                            placeholder="e.g., T1, T2 South, T3"
                        />
                    </div>
                    
                    {/* ICON UPLOAD FIELD */}
                    <div className="pt-2 border-t mt-4">
                        <h4 className="text-lg font-semibold text-gray-700 mb-2">Upload Feature Icons (Images)</h4>
                        <label className="block text-sm font-medium text-gray-700">Select multiple icon files (PNG, SVG, etc.)</label>
                        <input 
                            type="file" 
                            name="icon_upload_files" 
                            onChange={handleIconFileChange} 
                            multiple
                            accept="image/*"
                            className="mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-white file:py-2 file:px-4 file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                        />
                        {iconFiles.length > 0 && (
                            <p className="text-xs text-green-600 mt-1">{iconFiles.length} icon(s) ready to upload.</p>
                        )}
                        {editingOption && formState.icons && iconFiles.length === 0 && (
                             <p className="text-xs text-gray-500 mt-1">
                                Existing icons in DB: {formState.icons.length > 100 ? formState.icons.substring(0, 100) + '...' : formState.icons}
                            </p>
                        )}
                    </div>


                    <div className="pt-2">
                        <h4 className="text-lg font-semibold text-gray-700 mb-2 border-t pt-2">Features (Comma Separated)</h4>
                        
                        <label className="block text-sm font-medium text-gray-700 mt-3">Main Features</label>
                        <textarea name="features" value={formState.features} onChange={handleChange} rows="2" className="form-textarea mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-2 border" placeholder="e.g., CCTV Secure Compound, 24 Hours Frequent Shuttles"></textarea>
                        
                        <label className="block text-sm font-medium text-gray-700 mt-3">Extra Features</label>
                        <textarea name="extraFeatures" value={formState.extraFeatures} onChange={handleChange} rows="3" className="form-textarea mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-2 border" placeholder="e.g., 24hr Patrols, Fencing, Secure Barrier, Park Mark"></textarea>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : <Save className="w-5 h-5 mr-2"/>}
                        {editingOption ? 'Save Changes' : 'Add Parking Option'}
                    </button>
                </form>
            </CrudModal>
        </div>
    );
};

export default ParkingOptionManager;
