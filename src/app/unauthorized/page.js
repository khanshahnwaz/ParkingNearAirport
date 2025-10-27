"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Link } from "lucide-react";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-6">
      <motion.section
        initial={{ opacity: 0, y: 18, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="w-full max-w-4xl bg-white/95 backdrop-blur-sm border border-gray-100 rounded-2xl shadow-xl p-6 sm:p-10"
        aria-labelledby="unauth-heading"
        role="region"
      >
        <div className="flex flex-col md:flex-row gap-6 items-center">
          {/* Illustration */}
          <div className="w-full md:w-1/2 flex items-center justify-center">
            <div
              className="w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center rounded-xl bg-indigo-50/60 border border-indigo-100"
              aria-hidden="true"
            >
              {/* Friendly SVG illustration */}
              <svg
                viewBox="0 0 200 200"
                className="w-40 h-40 sm:w-48 sm:h-48"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="g" x1="0" x2="1">
                    <stop offset="0%" stopColor="#6366F1" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.85" />
                  </linearGradient>
                </defs>

                <rect x="8" y="42" width="184" height="116" rx="14" fill="#EEF2FF" />
                <path d="M40 78h120v8H40z" fill="url(#g)" opacity="0.18"/>
                <circle cx="100" cy="98" r="28" fill="url(#g)" opacity="0.95"/>
                <g transform="translate(80,88)" fill="#fff" opacity="0.9">
                  <rect x="-4" y="-4" width="8" height="8" rx="1.5" />
                  <rect x="12" y="-4" width="8" height="8" rx="1.5" />
                </g>
                <text x="100" y="152" fontSize="12" fontFamily="sans-serif" fill="#6B7280" textAnchor="middle">
                  Access Restricted
                </text>
              </svg>
            </div>
          </div>

          {/* Content */}
          <div className="w-full md:w-1/2">
            <h1 id="unauth-heading" className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              Access Denied
            </h1>
            <p className="mt-3 text-gray-600 leading-relaxed">
              You don’t have permission to view this page. If you believe this is a mistake, please contact your administrator or request the necessary access.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:space-x-4 gap-3">
              <button
                onClick={() => router.replace("/")}
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-white border border-gray-200 text-sm font-medium text-gray-700 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition transform duration-150"
                aria-label="Go back to home"
              >
                ← Go Home
              </button>

              {/* <button
                onClick={() => router.push("/auth/login")}
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
                aria-label="Go to login"
              >
                Sign in / Login
              </button> */}

              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-transparent border border-dashed border-gray-300 text-sm text-gray-600 hover:bg-gray-50 transition"
                aria-label="Contact support"
              >
                Contact Support
              </Link>
            </div>

            <div className="mt-6 text-xs text-gray-400">
              <p>
                Tip: Admin pages are restricted to users with the <span className="font-medium text-gray-700">admin</span> role.
              </p>
            </div>

            {/* Small horizontal divider and extra info */}
            <div className="mt-6 border-t border-gray-100 pt-4 text-sm text-gray-500">
              <p>
                If you are an admin and still see this message, try signing out and signing in again or contact your system administrator.
              </p>
            </div>
          </div>
        </div>
      </motion.section>
    </main>
  );
}
