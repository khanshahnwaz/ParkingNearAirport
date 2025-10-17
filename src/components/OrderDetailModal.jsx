// components/OrderDetailModal.jsx
import { motion } from 'framer-motion';
import { StatusPill } from './StatusPill';

const OrderDetailModal = ({ order, onClose, onStatusUpdate }) => {
    if (!order) return null;

    // Safely parse the JSON string, assuming it comes from the DB as a string
    const details = typeof order.booking_details === 'string' 
                   ? JSON.parse(order.booking_details) 
                   : order.booking_details;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-80 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-lg p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Order #{order.id} Details</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-900">✕</button>
                </div>

                <div className="space-y-4 text-sm">
                    {/* General Status and Payment */}
                    <div className="flex justify-between p-2 bg-gray-50 rounded-md">
                        <p>Status: <StatusPill status={order.status} /></p>
                        <p>Amount: <span className="font-bold text-lg text-green-700">£{parseFloat(order.amount).toFixed(2)}</span></p>
                    </div>

                    {/* User and Booking Info */}
                    <p>User ID: <span className="font-medium">{order.user_id}</span></p>
                    <p>Session ID: <span className="font-mono text-xs text-gray-600 break-all">{order.stripe_session_id}</span></p>
                    <p>Created: {new Date(order.created_at).toLocaleString()}</p>
                    
                    <h4 className="font-semibold text-gray-900 mt-4 border-t pt-3">Booking Details</h4>

<div className="grid grid-cols-2 gap-3 text-sm">
    <p><strong>Customer:</strong> {details.title} {details.firstName} {details.lastName}</p>
    <p><strong>Email:</strong> {details.email}</p>
    
    <p><strong>Location:</strong> {details.location}</p>
    <p><strong>Parking Type:</strong> {details.type}</p>
    
    <p><strong>Pickup Date & Time:</strong> {new Date(details.pickup).toLocaleString()}</p>
    <p><strong>Dropoff Date & Time:</strong> {new Date(details.dropoff).toLocaleString()}</p>

    <p><strong>Duration (Days):</strong> {details.duration}</p>
    
    <p><strong>Cancellation Cover:</strong> 
        <span className={details.cancellation ? "text-green-600" : "text-red-600"}>
            {details.cancellation ? "Yes" : "No"}
        </span>
    </p>

    {/* Flight Info */}
    {details.hasFlightDetails && (
        <>
            <p><strong>Departure Terminal:</strong> {details.departureTerminal || "N/A"}</p>
            <p><strong>Departure Flight No.:</strong> {details.departureFlightNo || "N/A"}</p>
            <p><strong>Arrival Terminal:</strong> {details.arrivalTerminal || "N/A"}</p>
            <p><strong>Arrival Flight No.:</strong> {details.arrivalFlightNo || "N/A"}</p>
        </>
    )}

    {/* Promo Code */}
    <p><strong>Promo Code:</strong> {details.promoCode || "None"}</p>
</div>

{/* Vehicles Section */}
<h4 className="font-semibold text-gray-900 mt-4 border-t pt-3">Vehicle Details</h4>
{details.vehicles && details.vehicles.length > 0 ? (
    <div className="space-y-2">
        {details.vehicles.map((v, idx) => (
            <div key={idx} className="p-2 border rounded">
                <p><strong>Make:</strong> {v.make}</p>
                <p><strong>Model:</strong> {v.model}</p>
                <p><strong>Color:</strong> {v.color}</p>
                <p><strong>Reg No:</strong> {v.regNo}</p>
            </div>
        ))}
    </div>
) : (
    <p>No Vehicle Information</p>
)}

                </div>

                <div className="mt-6 flex justify-end space-x-3">
                    {order.status !== 'CANCELLED' && (
                        <button 
                            onClick={() => onStatusUpdate(order.id, 'CANCELLED')}
                            className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition"
                        >
                            Mark as Cancelled
                        </button>
                    )}
                    <button onClick={onClose} className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition">
                        Close
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export { OrderDetailModal };