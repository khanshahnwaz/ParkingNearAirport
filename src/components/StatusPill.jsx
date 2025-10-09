// components/StatusPill.jsx
const StatusPill = ({ status }) => {
    const statusClasses = {
        'ACCEPTED': 'bg-green-100 text-green-800',
        'PENDING': 'bg-yellow-100 text-yellow-800',
        'CANCELLED': 'bg-red-100 text-red-800',
        'FAILED': 'bg-gray-100 text-gray-800',
    };
    return (
        <span 
            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses[status] || 'bg-gray-200 text-gray-600'}`}
        >
            {status}
        </span>
    );
};
export { StatusPill };