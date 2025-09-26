"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import AuthForm from "./AuthForm"; // the form we built earlier

export default function AuthModal({ mode, onClose }) {
  const modalRef = useRef(null);
  

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-transparent bg-opacity-50 flex items-center justify-center z-[1000]">
      <motion.div
        ref={modalRef}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className="relative bg-[#fdf8f2] rounded-2xl shadow-lg w-full max-w-md"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl"
        >
          &times;
        </button>

        {/* Auth form */}
        <AuthForm defaultMode={mode} close={onClose} />
      </motion.div>
    </div>
  );
}
