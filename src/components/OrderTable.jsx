import { motion } from "framer-motion";

// Component that was OrderTable.jsx
const OrderTable = ({ title, orders, onViewDetails }) => {

    // Components will be defined locally or assume existence for compilation
    const StatusPill = ({ status }) => {
        let color = 'bg-gray-300 text-gray-800';
        if (status === 'ACCEPTED') color = 'bg-green-200 text-green-800';
        if (status === 'CANCELLED') color = 'bg-red-200 text-red-800';
        if (status === 'PENDING') color = 'bg-yellow-200 text-yellow-800';
        if (status === 'FAILED') color = 'bg-red-200 text-red-800';
        return <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${color}`}>{status}</span>;
    };
    
    // Helper function to format date from 'YYYY-MM-DDTHH:mm' or 'YYYY-MM-DD HH:mm:ss'
    const formatDate = (datetime) => {
        if (!datetime) return 'N/A';
        try {
            // Replaces the space with 'T' for consistent Date object creation if needed
            const date = new Date(datetime.replace(' ', 'T'));
            return date.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
        } catch {
            return 'N/A';
        }
    };

    console.log("orders ",orders)
    return (
        <div>
            <h3 className="text-xl font-semibold mb-3 border-b pb-1 text-gray-700">🗓️ {title} ({orders.length})</h3>
            
            {orders.length === 0 ? (
                <p className="text-gray-500 py-4">No {title.toLowerCase()} found.</p>
            ) : (
                <div className="overflow-x-auto bg-gray-50 rounded-xl shadow-inner">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booked On</th> 
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Airport / Company</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">View</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {orders.map((order, index) => {
                                const booking = order.booking_details || {};
                                const customerName = order.user_firstName || booking.userFirstName;
                                
                                return (
                                    <motion.tr
                                        key={order.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.03 }}
                                        className="hover:bg-indigo-50/50"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                                            **{order.id}**
                                        </td>
                                        {/* NEW COLUMN: Booked On */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(order.created_at)}
                                        </td>
                                        {/* END NEW COLUMN */}
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                           <p className=" font-semibold truncate max-w-[200px]">{booking.location || 'Airport N/A'}</p>

                                            <p className="text-gray-500 text-xs mt-0.5">{booking.name || 'Company N/A'}</p>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            <p className="font-medium">{customerName || 'N/A'}</p>
                                            <p className="text-gray-500 text-xs mt-0.5 truncate max-w-[150px]">{order.user_email}</p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <p>Drop-off: **{formatDate(booking.dropoff)}**</p>
                                            <p className="text-gray-500 text-xs mt-0.5">Pick-up: {formatDate(booking.pickup)}</p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                            £{parseFloat(order.amount).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <StatusPill status={order.status} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button 
                                                onClick={() => onViewDetails(order)}
                                                className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50 transition"
                                                title="View Details"
                                            >
                                                View
                                            </button>
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default OrderTable;