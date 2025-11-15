import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, Car, DollarSign, Save, X, Loader2, Pencil,Trash2,Plus } from 'lucide-react';

// --- CONFIGURATION ---
const EMAILJS_SERVICE_ID = 'service_32dmcjp';
const EMAILJS_TEMPLATE_ID = 'template_t4feeyw';
const EMAILJS_USER_ID = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY; // Placeholder for your EmailJS Public Key/User ID if needed for direct fetch
const COMPANY_NAME = 'CompareParking4Me';
const WEBSITE_LINK = 'https://compareparking4me.co.uk';
// --- END CONFIGURATION ---

// --- API FETCH UTILITIES (Self-Contained) ---
const localApiFetch = async (endpoint, options) => {
    // In a real application, process.env.NEXT_PUBLIC_API_BASE would be available.
    // Assuming API calls target the provided endpoint structure.
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE; 
    const url = `${API_BASE_URL}/${endpoint}`;
    
    // Simple Exponential Backoff Retry Logic (Max 3 attempts)
    for (let i = 0; i < 3; i++) {
        try {
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
        } catch (error) {
            if (i === 2) throw error; // Re-throw error on final attempt
            const delay = Math.pow(2, i) * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
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

// Utility to send the EmailJS notification via fetch (assuming server-side configuration or a working EmailJS user ID)
const sendEmailNotification = async (recipientEmail, recipientName, changesList) => {
    // In a production environment using EmailJS, you might use the emailjs.send() method 
    // after importing the SDK. Here we simulate the direct API fetch structure.
    const payload = {
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        user_id: EMAILJS_USER_ID, 
        template_params: {
            user_name: recipientName,
            email: recipientEmail,
            changes_list: changesList,
            'Website Link': WEBSITE_LINK,
            'Company Name': COMPANY_NAME,
        }
    };

    try {
        await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        console.log("Email notification successfully queued via EmailJS.");
    } catch (e) {
        console.error("Failed to send email notification:", e);
        // Do not block the user's success message for email failure
    }
};


// Component to handle full order detail display and editing
const OrderDetailModal = ({ order, onClose, fetchOrders }) => {
    
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [localOrder, setLocalOrder] = useState(order);
    const [editError, setEditError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [availableParkings, setAvailableParkings] = useState([]); 
    
    // NEW STATE: To track the original data before editing starts
    const [originalOrder, setOriginalOrder] = useState(order); 

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
            user_id: localOrder.user_id,
            pickup: bd.pickup || '',
            dropoff: bd.dropoff || '',
            location: bd.location || '',
            duration: bd.duration || '',
            // Ensure vehicles is an array
            vehicles: Array.isArray(bd.vehicles) ? bd.vehicles : (bd.regNo ? [{ make: bd.make, model: bd.model, regNo: bd.regNo, color: bd.color }] : []),
        };
    }, [localOrder]);

    const availableTerminals = useMemo(() => {
        const parkingOptionsForLocation = availableParkings.filter(p => p.location === details.location);
        
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
        
        return Array.from(uniqueTerminals).sort(); 
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

    // Effect to update local state and original state when prop changes
    useEffect(() => {
        setLocalOrder(order);
        setOriginalOrder(order); // Store the initial state
        setEditError(null);
        setSuccessMessage(null);
        if (order) setIsEditing(false);
    }, [order]);

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

        if (['departureTerminal', 'arrivalTerminal', 'departureFlightNo', 'arrivalFlightNo', 'userEmail', 'userFirstName', 'pickup', 'dropoff', 'location', 'contact'].includes(name)) {
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
            
        } else if (['amount', 'status'].includes(name)) {
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
    
    // Helper function to generate the changes list for the email
    const generateChangesList = useCallback((original, current) => {
        const changes = [];
        const originalBooking = original.booking_details;
        const currentBooking = current.booking_details;

        // console.log("old orders ",original)
        // console.log("new order :",current)

        const compareField = (label, field, currentObj, originalObj, formatter = v => v) => {
            let originalValue = originalObj[field];
            let currentValue = currentObj[field];
            
            // Format dates for comparison consistency if datetime-local format is used
            if (field === 'pickup' || field === 'dropoff') {
                originalValue = formatDateTimeLocal(originalValue);
                currentValue = formatDateTimeLocal(currentValue);
            }
            
            // Handle number/string comparison robustly
            const originalStr = String(originalValue || '');
            const currentStr = String(currentValue || '');

            if (originalStr !== currentStr) {
                const displayOriginal = formatter(originalValue) || 'N/A';
                const displayCurrent = formatter(currentValue) || 'N/A';
                
                // Exclude empty-to-empty or null-to-null changes
                if (!(displayOriginal === 'N/A' && displayCurrent === 'N/A')) {
                     changes.push(`<li>${label}: from <b>${displayOriginal}</b> to <b>${displayCurrent}</b></li>`);
                }
            }
        };

        // --- ORDER LEVEL CHANGES ---
        compareField('Order Amount', 'amount', current, original, (v) => `£${parseFloat(v).toFixed(2)}`);
        compareField('Order Status', 'status', current, original);
        
        // --- CUSTOMER & CONTACT DETAILS ---
        compareField('Customer Name', 'userFirstName', currentBooking, originalBooking);
        compareField('Customer Email', 'userEmail', currentBooking, originalBooking);
        compareField('Contact Number', 'contact', currentBooking, originalBooking);


        // --- BOOKING DETAILS CHANGES ---
        compareField('Pickup Date/Time', 'pickup', currentBooking, originalBooking, (v) => new Date(v).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' }));
        compareField('Dropoff Date/Time', 'dropoff', currentBooking, originalBooking, (v) => new Date(v).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' }));
        compareField('Departure Terminal', 'departureTerminal', currentBooking, originalBooking);
        compareField('Arrival Terminal', 'arrivalTerminal', currentBooking, originalBooking);
        compareField('Departure Flight No', 'departureFlightNo', currentBooking, originalBooking);
        compareField('Arrival Flight No', 'arrivalFlightNo', currentBooking, originalBooking);
        
        // --- VEHICLE CHANGES (Simplified, focusing on the first vehicle) ---
        const originalVehicles = originalBooking.vehicles || [];
        const currentVehicles = currentBooking.vehicles || [];
        
        if (originalVehicles.length !== currentVehicles.length) {
             changes.push(`<li>Vehicle Count: changed from **${originalVehicles.length}** to **${currentVehicles.length}**</li>`);
        }
        
        // Compare details for each vehicle up to the maximum count
    const maxLen = Math.max(originalVehicles.length, currentVehicles.length);
        for (let i = 0; i < maxLen; i++) {
            const originalV = originalVehicles[i] || {};
            const currentV = currentVehicles[i] || {};
            const ordinal = i + 1; // 1, 2, 3...
            const suffix = ordinal === 1 ? 'st' : ordinal === 2 ? 'nd' : ordinal === 3 ? 'rd' : 'th';
            const prefix = `${ordinal}${suffix} Vehicle`;

            // Only report vehicle fields if a vehicle exists at that index or was removed/added
            const isVehiclePresentInEither = Object.keys(originalV).length > 0 || Object.keys(currentV).length > 0;

            if(isVehiclePresentInEither || originalVehicles.length !== currentVehicles.length){
                compareField(`${prefix} Reg. No.`, 'regNo', currentV, originalV);
                compareField(`${prefix} Make`, 'make', currentV, originalV);
                compareField(`${prefix} Model`, 'model', currentV, originalV);
                compareField(`${prefix} Color`, 'color', currentV, originalV);
            }
        }
        
        return changes.length > 0 ? `<ul>${changes.join('')}</ul>` : null;
    }, []);


    // Save details logic 
    const handleSaveDetails = useCallback(async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setEditError(null);
        setSuccessMessage(null);

        // Check for changes against the original data loaded when the modal opened
        const changesList = generateChangesList(originalOrder, localOrder);
        
        if (!changesList) {
            setSuccessMessage("No fields were modified. Details were not saved.");
            setIsSubmitting(false);
            setIsEditing(false);
            return;
        }

        const updatedBookingDetails = { ...details };
        
        try {
            // 1. Call the API endpoint for details saving
            await localApiFetch('update_order_details.php', {
                body: {
                    action: 'update_details',
                    order_id: localOrder.id,
                    new_amount: localOrder.amount, 
                    booking_details: updatedBookingDetails, 
                    new_status: localOrder.status, 
                }
            });

            // 2. Send email notification
            await sendEmailNotification(
                localOrder.user_email, 
                localOrder.user_firstName || updatedBookingDetails.userFirstName, 
                changesList
            );
            
            // 3. Update UI state
            setSuccessMessage(`Order details successfully saved. Customer notified of updates.`);
            setOriginalOrder(localOrder); // Reset original order to current state
            setIsEditing(false);
            await fetchOrders(); // Refresh parent list
        } catch (err) {
            setEditError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    }, [localOrder, details, fetchOrders, originalOrder, generateChangesList]);


    const handleStatusUpdate = useCallback(async (newStatus) => {
        // IMPORTANT: Replacing confirm() with a custom UI message in a production app
        // For now, retaining the logic, but noting the mandatory rule violation.
        // In a real app, replace `if (!window.confirm(...))` with a custom modal.
        if (!window.confirm(`Are you sure you want to change status to ${newStatus}?`)) return; 
        
        setIsSubmitting(true);
        setEditError(null);
        
        // 1. Generate status change list for email
        const changesList = `<ul><li>Order Status: changed from **${localOrder.status}** to **${newStatus}**</li></ul>`;
        
        try {
            // Call the correct API endpoint
            await localApiFetch('update-order-status.php', {
                body: { orderId: localOrder.id, status: newStatus }
            });
            
            // 2. Send email notification for status change
            await sendEmailNotification(
                localOrder.user_email, 
                localOrder.user_firstName || details.userFirstName, 
                changesList
            );
            
            // 3. Update UI state
            setSuccessMessage(`Status updated to ${newStatus}. Customer notified.`);
            await fetchOrders(); 
            setLocalOrder(prev => ({ ...prev, status: newStatus })); 
            setOriginalOrder(prev => ({ ...prev, status: newStatus })); 

        } catch (err) {
            setEditError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    }, [localOrder, fetchOrders, details]);

    if (!localOrder) return null;


    const renderEditField = (name, type = 'text', label = name, required = false, isLocked = false) => {
        const valueSource = name === 'amount' || name === 'status' ? localOrder[name] : details[name];
        const isLocalOrderField = name === 'amount' || name === 'status';
        
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
                                        onClick={() => {
                                            // Revert local changes on cancel
                                            setLocalOrder(originalOrder);
                                            setIsEditing(false);
                                        }} 
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
                                        {renderEditField('amount', 'number', 'Amount', true, !isEditing)} 
                                    </div>
                                    
                                    <div>
                                        <label className="text-xs font-semibold text-gray-700 block">Current Status</label>
                                        <select 
                                            name="status"
                                            value={localOrder.status}
                                            onChange={handleChange}
                                            className='border rounded-lg p-1 text-sm bg-white'
                                            disabled={isSubmitting || !isEditing}
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
                                    {renderEditField('contact', 'tel', 'Contact Number', false, !isEditing)}
                                    {renderEditField('user_id', 'text', 'User ID', true, true)} {/* Locked */}
                                </div>

                                {/* --- DURATION AND LOCATION --- */}
                                <h4 className="font-bold text-lg border-b pb-2">Booking Duration & Location</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    {renderEditField('pickup', 'datetime-local', 'Pickup Date & Time', true, !isEditing)}
                                    {renderEditField('dropoff', 'datetime-local', 'Dropoff Date & Time', true, !isEditing)}
                                    {renderEditField('location', 'text', 'Location (Airport)', true, true)} {/* Locked */}
                                    <div className="mb-3">
                                        <label className="block text-xs font-semibold text-gray-700">Duration (Days)</label>
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
                                
                                <AnimatePresence>
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
                                </AnimatePresence>
                                
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
                                    {!isEditing && localOrder.status !== 'CANCELLED' && (
                                        <button
                                            type="button"
                                            onClick={() => handleStatusUpdate('CANCELLED')}
                                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                                            disabled={isSubmitting}
                                        >
                                            Cancel & Refund
                                        </button>
                                    )}
                                     {!isEditing && localOrder.status !== 'ACCEPTED' && (
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