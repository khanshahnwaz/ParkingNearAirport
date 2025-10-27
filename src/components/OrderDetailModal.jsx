// components/OrderDetailModal.jsx
import { motion } from 'framer-motion';
import { StatusPill } from './StatusPill';

const OrderDetailModal = ({ order, onClose, onStatusUpdate }) => {
    if (!order) return null;

    const details = typeof order.booking_details === 'string' 
                   ? JSON.parse(order.booking_details) 
                   : order.booking_details;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-80 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-lg p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto text-black"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h3 className="text-xl font-bold text-black">Order #{order.id} Details</h3>
                    <button onClick={onClose} className="text-black hover:text-gray-900">✕</button>
                </div>

                <div className="space-y-4 text-sm text-black">
                    <div className="flex justify-between p-2 bg-gray-50 rounded-md">
                        <p className="text-black">
                            Status: <StatusPill status={order.status} />
                        </p>
                        <p className="text-black">
                            Amount: <span className="font-bold text-lg text-green-700">£{parseFloat(order.amount).toFixed(2)}</span>
                        </p>
                    </div>

                    <p className="text-black">User ID: <span className="font-medium text-black">{order.user_id}</span></p>
                    <p className="text-black">Session ID: <span className="font-mono text-xs text-black break-all">{order.stripe_session_id}</span></p>
                    <p className="text-black">Created: {new Date(order.created_at).toLocaleString()}</p>
                    
                    <h4 className="font-semibold text-black mt-4 border-t pt-3">Booking Details</h4>

                    <div className="grid grid-cols-2 gap-3 text-sm text-black">
                        <p className="text-black"><strong>Customer:</strong> {details.title} {details.firstName} {details.lastName}</p>
                        <p className="text-black"><strong>Email:</strong> {details.email}</p>
                        
                        <p className="text-black"><strong>Location:</strong> {details.location}</p>
                        <p className="text-black"><strong>Parking Type:</strong> {details.type}</p>
                        
                        <p className="text-black"><strong>Pickup Date & Time:</strong> {new Date(details.pickup).toLocaleString()}</p>
                        <p className="text-black"><strong>Dropoff Date & Time:</strong> {new Date(details.dropoff).toLocaleString()}</p>

                        <p className="text-black"><strong>Duration (Days):</strong> {details.duration}</p>
                        
                        <p className="text-black">
                            <strong>Cancellation Cover:</strong> 
                            <span className={details.cancellation ? "text-green-600" : "text-red-600"}>
                                {details.cancellation ? "Yes" : "No"}
                            </span>
                        </p>

                        {details.hasFlightDetails && (
                            <>
                                <p className="text-black"><strong>Departure Terminal:</strong> {details.departureTerminal || "N/A"}</p>
                                <p className="text-black"><strong>Departure Flight No.:</strong> {details.departureFlightNo || "N/A"}</p>
                                <p className="text-black"><strong>Arrival Terminal:</strong> {details.arrivalTerminal || "N/A"}</p>
                                <p className="text-black"><strong>Arrival Flight No.:</strong> {details.arrivalFlightNo || "N/A"}</p>
                            </>
                        )}

                        <p className="text-black"><strong>Promo Code:</strong> {details.promoCode || "None"}</p>
                    </div>

                    <h4 className="font-semibold text-black mt-4 border-t pt-3">Vehicle Details</h4>
                    {details.vehicles && details.vehicles.length > 0 ? (
                        <div className="space-y-2">
                            {details.vehicles.map((v, idx) => (
                                <div key={idx} className="p-2 border rounded text-black">
                                    <p className="text-black"><strong>Make:</strong> {v.make}</p>
                                    <p className="text-black"><strong>Model:</strong> {v.model}</p>
                                    <p className="text-black"><strong>Color:</strong> {v.color}</p>
                                    <p className="text-black"><strong>Reg No:</strong> {v.regNo}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-black">No Vehicle Information</p>
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
                    <button onClick={onClose} className="bg-gray-200 text-black py-2 px-4 rounded-lg hover:bg-gray-300 transition">
                        Close
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export { OrderDetailModal };
