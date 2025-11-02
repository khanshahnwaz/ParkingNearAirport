import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, Car, DollarSign, Save, X, Loader2, Pencil,Trash2,Plus } from 'lucide-react';

// --- API FETCH UTILITIES (Self-Contained) ---
const localApiFetch = async (endpoint, options) => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE || '';
    const url = `${API_BASE_URL}/${endpoint}`;
    
    const response = await fetch(url, {
        method: options.method || 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options.body),
    });

    const data = await response.json();
    if (!data.ok) {
        const errorDetail = data.db_error_detail || data.error;
        throw new Error(errorDetail || 'API operation failed.');
    }
    return data.data || data.orderRecord || data;
};

// Helper function to format date/time string to HTML input[type=datetime-local] format (YYYY-MM-DDTHH:mm)
const formatDateTimeLocal = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    
    const pad = (num) => String(num).padStart(2, '0');

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const StatusPill = ({ status }) => {
    let color = 'bg-gray-300 text-gray-800';
    if (status === 'ACCEPTED') color = 'bg-green-200 text-green-800';
    if (status === 'CANCELLED') color = 'bg-red-200 text-red-800';
    if (status === 'PENDING') color = 'bg-yellow-200 text-yellow-800';
    if (status === 'FAILED') color = 'bg-red-200 text-red-800';
    return <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${color}`}>{status}</span>;
};


// Component to handle full order detail display and editing
const OrderDetailModal = ({ order, onClose, fetchOrders }) => {
    
    // --- 1. HOOKS: MUST BE AT THE TOP AND UNCONDITIONAL ---
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [localOrder, setLocalOrder] = useState(order);
    const [editError, setEditError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [availableParkings, setAvailableParkings] = useState([]); // Parking options list
    
    // useMemo for booking details
    const details = useMemo(() => {
        if (!localOrder) return {};

        const bd = typeof localOrder.booking_details === 'string' 
                   ? JSON.parse(localOrder.booking_details) 
                   : localOrder.booking_details;

        const vehicle = (bd.vehicles && bd.vehicles.length > 0) ? bd.vehicles[0] : {};

        return {
            ...bd,
            ...vehicle, 
            departureTerminal: bd.departureTerminal || '',
            arrivalTerminal: bd.arrivalTerminal || '',
            departureFlightNo: bd.departureFlightNo || '',
            arrivalFlightNo: bd.arrivalFlightNo || '',
            userEmail: localOrder.user_email,
            userFirstName: localOrder.user_firstName,
            user_id:localOrder.user_id,
            pickup: bd.pickup || '',
            dropoff: bd.dropoff || '',
            location: bd.location || '',
            duration: bd.duration || '',
        };
    }, [localOrder]);

    // NEW FIX: Robustly flatten terminals from parking options
    const availableTerminals = useMemo(() => {
        // console.log("aval ",availableParkings)
        // console.log("details ",details)
        const parkingOptionsForLocation = availableParkings.filter(p => p.location === details.location);
        // console.log("final ",parkingOptionsForLocation)
        
        if (parkingOptionsForLocation.length === 0) return [];

        const uniqueTerminals = new Set();
        
        parkingOptionsForLocation.forEach(option => {
            if (Array.isArray(option.terminals)) {
                option.terminals.forEach(terminal => {
                    if (typeof terminal === 'string' && terminal.trim()) {
                        uniqueTerminals.add(terminal.trim());
                    }
                });
            }
        });
        
        return Array.from(uniqueTerminals).sort(); // Return sorted list of unique terminals
    }, [availableParkings, details.location]);


    // Effect to fetch all parking options once, for terminal filtering
    useEffect(() => {
        const fetchParkings = async () => {
            try {
                // Fetching parking data to get the list of terminals per airport
                const result = await localApiFetch("get_parking.php", { method: 'GET' });
                // console.log("result ",result)
                setAvailableParkings(result || []);
            } catch (err) {
                console.error("Failed to fetch parking options for terminals:", err);
            }
        };
        fetchParkings();
    }, []);


    const handleVehicleChange = useCallback((index, field, value) => {
        const newVehicles = [...details.vehicles];
        newVehicles[index] = { ...newVehicles[index], [field]: value };

        setLocalOrder(prev => ({
            ...prev,
            booking_details: {
                ...details,
                vehicles: newVehicles,
            }
        }));
    }, [details]);
    
    const handleAddVehicle = useCallback(() => {
        setLocalOrder(prev => ({
            ...prev,
            booking_details: {
                ...details,
                vehicles: [...details.vehicles, { make: '', model: '', regNo: '', color: '' }],
            }
        }));
    }, [details]);

    const handleRemoveVehicle = useCallback((index) => {
        const newVehicles = details.vehicles.filter((_, i) => i !== index);
        setLocalOrder(prev => ({
            ...prev,
            booking_details: {
                ...details,
                vehicles: newVehicles,
            }
        }));
    }, [details]);

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        
        const newDetails = { ...details };

        // Handle vehicle details (which are already handled via the vehicle specific inputs, but keeping for robustness)
        if (['make', 'model', 'regNo', 'color'].includes(name)) {
             // This case is typically not hit since we use handleVehicleChange for vehicle inputs
             // But if we were to dynamically update, this structure would be needed.
             // We'll rely on the manual vehicle inputs below for clarity.
        } else if (['departureTerminal', 'arrivalTerminal', 'departureFlightNo', 'arrivalFlightNo', 'userEmail', 'userFirstName', 'pickup', 'dropoff', 'location'].includes(name)) {
            newDetails[name] = value;

            // DURATION CALCULATION LOGIC
            if (name === 'pickup' || name === 'dropoff') {
                const newPickup = name === 'pickup' ? value : newDetails.pickup;
                const newDropoff = name === 'dropoff' ? value : newDetails.dropoff;

                const dropoffDate = new Date(newDropoff);
                const pickupDate = new Date(newPickup);
                
                if (!isNaN(dropoffDate.getTime()) && !isNaN(pickupDate.getTime()) && pickupDate.getTime() > dropoffDate.getTime()) {
                    const diffTime = pickupDate.getTime() - dropoffDate.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    newDetails.duration = diffDays; 
                } else {
                    newDetails.duration = ''; 
                }
            }
            
        // Handle global order amount update
        } else if (name === 'amount') {
            setLocalOrder(prev => ({ ...prev, [name]: value }));
            return;
        } else {
            newDetails[name] = value;
        }

        setLocalOrder(prev => ({ 
            ...prev, 
            booking_details: newDetails 
        }));
    }, [details]);
    
    const handleStatusUpdate = useCallback(async (newStatus) => {
        if (!confirm(`Are you sure you want to change status to ${newStatus}?`)) return;
        
        setIsSubmitting(true);
        setEditError(null);
        
        try {
            await localApiFetch('update-order-status.php', {
                body: { orderId: localOrder.id, status: newStatus }
            });
            
            setSuccessMessage(`Status updated to ${newStatus}.`);
            await fetchOrders(); 
            setLocalOrder(prev => ({ ...prev, status: newStatus })); 

        } catch (err) {
            setEditError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    }, [localOrder, fetchOrders]);
    
    // Save details logic 
    const handleSaveDetails = useCallback(async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setEditError(null);
        setSuccessMessage(null);

        // Final payload structure (using details.vehicles which is already managed by handleVehicleChange)
        const updatedBookingDetails = { ...details };
        
        try {
            // Call the correct API endpoint for details saving
            await localApiFetch('update_order_details.php', {
                body: {
                    action: 'update_details',
                    order_id: localOrder.id,
                    new_amount: localOrder.amount, 
                    booking_details: updatedBookingDetails, 
                    new_status: localOrder.status, 
                }
            });

            setSuccessMessage("Order details successfully saved.");
            setIsEditing(false);
            await fetchOrders(); // Refresh parent list
        } catch (err) {
            setEditError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    }, [localOrder, details, fetchOrders]);


    // Effect to update local state when prop changes
    useEffect(() => {
        setLocalOrder(order);
        setEditError(null);
        setSuccessMessage(null);
        if (order) setIsEditing(false);
    }, [order]);

    // --- 2. CONDITIONAL RETURN (Check must happen after all hooks) ---
    if (!localOrder) return null;


    // Fallback component for editing logic
    const renderEditField = (name, type = 'text', label = name, required = false, isLocked = false) => {
        const valueSource = name === 'amount' ? localOrder.amount : details[name];
        const isLocalOrderField = name === 'amount';
        
        const isCurrentlyReadOnly = isLocked || !isEditing;

        const inputDisplayValue = type === 'datetime-local' 
            ? formatDateTimeLocal(valueSource) 
            : (valueSource || ''); 
        
        const readOnlyDisplayValue = (valueSource || valueSource === 0) 
            ? (type === 'datetime-local' 
                ? new Date(valueSource).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })
                : valueSource)
            : 'N/A';
        
        const finalValue = isCurrentlyReadOnly ? readOnlyDisplayValue : inputDisplayValue;


        return (
            <div className="mb-3">
                <label className="block text-xs font-semibold text-gray-700">{label}</label>
                <input
                    type={type}
                    name={name}
                    value={finalValue} 
                    onChange={isLocalOrderField ? (e) => setLocalOrder(prev => ({ ...prev, [name]: e.target.value })) : handleChange}
                    required={required}
                    readOnly={isCurrentlyReadOnly} 
                    step={type === 'number' ? '0.01' : undefined}
                    className={`w-full border rounded-lg px-3 py-2 text-sm shadow-sm ${isCurrentlyReadOnly ? 'bg-gray-100' : 'bg-white focus:ring-indigo-500 focus:border-indigo-500'}`}
                />
            </div>
        );
    };

    // JSX for the modal
    return (
        <AnimatePresence>
            {localOrder && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-70 z-50 flex items-center justify-center p-4" onClick={() => !isSubmitting && onClose()}>
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }} 
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto text-gray-800"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center p-6 border-b">
                            <h3 className="text-2xl font-bold text-gray-800">Order #{localOrder.id}</h3>
                            <div className="flex items-center space-x-3">
                                {isEditing && (
                                    <button 
                                        onClick={() => setIsEditing(false)} 
                                        className="text-sm text-gray-500 hover:text-gray-700"
                                        type="button"
                                    >
                                        Cancel Edit
                                    </button>
                                )}
                                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition" type="button">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleSaveDetails}>
                            <div className="p-6 space-y-6">
                                {editError && <p className="text-red-600 p-3 bg-red-100 rounded-lg">{editError}</p>}
                                {successMessage && <p className="text-green-600 p-3 bg-green-100 rounded-lg">{successMessage}</p>}
                                
                                {/* --- PAYMENT & STATUS HEADER --- */}
                                <div className="bg-indigo-50 p-4 rounded-lg flex justify-between items-center">
                                    <div className="text-lg font-bold flex items-center">
                                        <DollarSign className='w-5 h-5 mr-2 text-indigo-600'/> Amount: 
                                        {renderEditField('amount', 'number', 'Amount', true, false)} 
                                    </div>
                                    
                                    <div>
                                        <label className="text-xs font-semibold text-gray-700 block">Current Status</label>
                                        <select 
                                            name="status"
                                            value={localOrder.status}
                                            onChange={(e) => setLocalOrder(prev => ({ ...prev, status: e.target.value }))}
                                            className='border rounded-lg p-1 text-sm bg-white'
                                            disabled={isSubmitting}
                                        >
                                            <option value="PENDING">PENDING</option>
                                            <option value="ACCEPTED">ACCEPTED</option>
                                            <option value="CANCELLED">CANCELLED</option>
                                            <option value="FAILED">FAILED</option>
                                        </select>
                                    </div>
                                </div>
                                
                                {/* --- ORDER METADATA --- */}
                                <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                                    <p><strong>Session ID:</strong> <span className="font-mono text-xs break-all">{localOrder.stripe_session_id || 'N/A'}</span></p>
                                    <p><strong>Created:</strong> {new Date(localOrder.created_at).toLocaleString()}</p>
                                </div>


                                {/* --- CUSTOMER INFO --- */}
                                <h4 className="font-bold text-lg border-b pb-2">Customer & Contact</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    {renderEditField('userFirstName', 'text', 'Customer Name', false, !isEditing)}
                                    {renderEditField('userEmail', 'email', 'Email', true, !isEditing)}
                                    {renderEditField('user_id', 'text', 'User ID', true, true)} {/* Locked */}
                                </div>

                                {/* --- DURATION AND LOCATION --- */}
                                <h4 className="font-bold text-lg border-b pb-2">Booking Duration & Location</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    {/* PICKUP & DROPOFF TIMES - NOW EDITABLE */}
                                    {renderEditField('pickup', 'datetime-local', 'Pickup Date & Time', true, !isEditing)}
                                    {renderEditField('dropoff', 'datetime-local', 'Dropoff Date & Time', true, !isEditing)}
                                    {renderEditField('location', 'text', 'Location (Airport)', true, true)} {/* Locked */}
                                    <div className="mb-3">
                                        <label className="block text-xs font-semibold text-gray-700">Duration (Days)</label>
                                        {/* Duration now dynamically calculated */}
                                        <span className="mt-1 block w-full rounded-lg bg-gray-100 px-3 py-2 text-sm shadow-sm border border-gray-300">
                                            {details.duration || 'N/A'}
                                        </span>
                                    </div>
                                </div>


                                {/* --- FLIGHT DETAILS (Terminal Dropdowns) --- */}
                                <h4 className="font-bold text-lg border-b pb-2">Flight & Terminal</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Departure Terminal Dropdown */}
                                    <div className="mb-3">
                                        <label className="block text-xs font-semibold text-gray-700">Departure Terminal</label>
                                        {isEditing ? (
                                            <select
                                                name="departureTerminal"
                                                value={details.departureTerminal}
                                                onChange={handleChange}
                                                disabled={availableTerminals.length === 0}
                                                className={`w-full border rounded-lg px-3 py-2 text-sm shadow-sm bg-white focus:ring-indigo-500 focus:border-indigo-500`}
                                            >
                                                <option value="">{availableTerminals.length > 0 ? 'Select Terminal' : 'No Terminals Available'}</option>
                                                {availableTerminals.map(terminal => (
                                                    <option key={terminal} value={terminal}>{terminal}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <span className="mt-1 block w-full rounded-lg bg-gray-100 px-3 py-2 text-sm shadow-sm border border-gray-300">
                                                {details.departureTerminal || 'N/A'}
                                            </span>
                                        )}
                                    </div>

                                    {/* Arrival Terminal Dropdown */}
                                    <div className="mb-3">
                                        <label className="block text-xs font-semibold text-gray-700">Arrival Terminal</label>
                                        {isEditing ? (
                                            <select
                                                name="arrivalTerminal"
                                                value={details.arrivalTerminal}
                                                onChange={handleChange}
                                                disabled={availableTerminals.length === 0}
                                                className={`w-full border rounded-lg px-3 py-2 text-sm shadow-sm bg-white focus:ring-indigo-500 focus:border-indigo-500`}
                                            >
                                                <option value="">{availableTerminals.length > 0 ? 'Select Terminal' : 'No Terminals Available'}</option>
                                                {availableTerminals.map(terminal => (
                                                    <option key={terminal} value={terminal}>{terminal}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <span className="mt-1 block w-full rounded-lg bg-gray-100 px-3 py-2 text-sm shadow-sm border border-gray-300">
                                                {details.arrivalTerminal || 'N/A'}
                                            </span>
                                        )}
                                    </div>
                                    
                                    {renderEditField('departureFlightNo', 'text', 'Departure Flight No.', false, !isEditing)}
                                    {renderEditField('arrivalFlightNo', 'text', 'Arrival Flight No.', false, !isEditing)}
                                </div>


                                {/* --- VEHICLE DETAILS (Multiple Vehicles) --- */}
                                <h4 className="font-bold text-lg border-b pb-2 flex items-center">
                                    <Car className='w-4 h-4 mr-2'/> Vehicle Details
                                </h4>
                                
                                {details.vehicles.map((vehicle, index) => (
                                    <motion.div 
                                        key={index} 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="p-4 border border-gray-200 rounded-lg bg-gray-50 relative"
                                    >
                                        <h5 className="font-semibold text-sm mb-3 text-indigo-700">Vehicle {index + 1}</h5>

                                        {isEditing && details.vehicles.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveVehicle(index)}
                                                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                                                title="Remove Vehicle"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="mb-3">
                                                <label className="block text-xs font-semibold text-gray-700">Registration No.</label>
                                                <input
                                                    type="text"
                                                    value={isEditing ? vehicle.regNo || '' : (vehicle.regNo || 'N/A')}
                                                    onChange={(e) => handleVehicleChange(index, 'regNo', e.target.value)}
                                                    required={false}
                                                    readOnly={!isEditing} 
                                                    className={`w-full border rounded-lg px-3 py-2 text-sm shadow-sm ${!isEditing ? 'bg-gray-100' : 'bg-white focus:ring-indigo-500 focus:border-indigo-500'}`}
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="block text-xs font-semibold text-gray-700">Make</label>
                                                <input
                                                    type="text"
                                                    value={isEditing ? vehicle.make || '' : (vehicle.make || 'N/A')}
                                                    onChange={(e) => handleVehicleChange(index, 'make', e.target.value)}
                                                    readOnly={!isEditing} 
                                                    className={`w-full border rounded-lg px-3 py-2 text-sm shadow-sm ${!isEditing ? 'bg-gray-100' : 'bg-white focus:ring-indigo-500 focus:border-indigo-500'}`}
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="block text-xs font-semibold text-gray-700">Model</label>
                                                <input
                                                    type="text"
                                                    value={isEditing ? vehicle.model || '' : (vehicle.model || 'N/A')}
                                                    onChange={(e) => handleVehicleChange(index, 'model', e.target.value)}
                                                    readOnly={!isEditing} 
                                                    className={`w-full border rounded-lg px-3 py-2 text-sm shadow-sm ${!isEditing ? 'bg-gray-100' : 'bg-white focus:ring-indigo-500 focus:border-indigo-500'}`}
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="block text-xs font-semibold text-gray-700">Color</label>
                                                <input
                                                    type="text"
                                                    value={isEditing ? vehicle.color || '' : (vehicle.color || 'N/A')}
                                                    onChange={(e) => handleVehicleChange(index, 'color', e.target.value)}
                                                    readOnly={!isEditing} 
                                                    className={`w-full border rounded-lg px-3 py-2 text-sm shadow-sm ${!isEditing ? 'bg-gray-100' : 'bg-white focus:ring-indigo-500 focus:border-indigo-500'}`}
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                                
                                {isEditing && (
                                    <button
                                        type="button"
                                        onClick={handleAddVehicle}
                                        className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold flex items-center mt-3"
                                    >
                                        <Plus className="w-4 h-4 mr-1"/> Add Another Vehicle
                                    </button>
                                )}

                                {/* --- ADMIN ACTIONS --- */}
                                <div className="flex justify-between items-center pt-4 border-t">
                                    {!isEditing && (
                                        <button
                                            type="button"
                                            onClick={() => setIsEditing(true)}
                                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center"
                                        >
                                            <Pencil className='w-4 h-4 mr-2'/> Edit Details
                                        </button>
                                    )}
                                    
                                    {isEditing && (
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center disabled:opacity-50"
                                        >
                                            {isSubmitting ? <Loader2 className='w-4 h-4 animate-spin mr-2'/> : <Save className='w-4 h-4 mr-2'/>}
                                            Save All Changes
                                        </button>
                                    )}

                                    {/* Status Change Buttons (Outside Edit Mode) */}
                                    {localOrder.status !== 'CANCELLED' && (
                                        <button
                                            type="button"
                                            onClick={() => handleStatusUpdate('CANCELLED')}
                                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                                            disabled={isSubmitting || localOrder.status !== 'ACCEPTED'}
                                        >
                                            Cancel & Refund
                                        </button>
                                    )}
                                     {localOrder.status !== 'ACCEPTED' && (
                                        <button
                                            type="button"
                                            onClick={() => handleStatusUpdate('ACCEPTED')}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                                            disabled={isSubmitting}
                                        >
                                            Mark as Accepted
                                        </button>
                                    )}
                                </div>

                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export { OrderDetailModal };
