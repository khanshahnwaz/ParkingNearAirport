import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Modal component for Add/Edit operations
 */
const CrudModal = ({ isOpen, onClose, children, title, isSubmitting }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-75 p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg"
                    initial={{ y: -50, scale: 0.9 }}
                    animate={{ y: 0, scale: 1 }}
                    exit={{ y: -50, scale: 0.9 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                >
                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
                        <button 
                            onClick={onClose} 
                            disabled={isSubmitting}
                            className="text-gray-500 hover:text-red-600 transition disabled:opacity-50"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>
                    {children}
                    {isSubmitting && (
                        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-xl">
                            <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default CrudModal;
