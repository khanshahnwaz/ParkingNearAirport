// Navbar.jsx
"use client";

import { useState, useEffect, useMemo } from "react"; // Added useMemo
import Link from "next/link";
import { usePathname } from "next/navigation";
import AuthModal from "./AuthModal";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isOpenForm, setIsOpenForm] = useState(false);
    const [authMode, setAuthMode] = useState("login");
    const pathname = usePathname();

    const { user, logout } = useAuth(); // Assuming user.role exists
    // console.log("logged in user ",user)

    // Define all links
    const allLinks = [
        { href: "/", label: "Home", roles: ["guest", "user", "admin"] },
        { href: "/search", label: "Search", roles: ["guest", "user", "admin"] },
        { href: "/about", label: "About Us", roles: ["guest", "user", "admin"] },
        { href: "/faqs", label: "FAQs", roles: ["guest", "user", "admin"] },
        { href: "/contact", label: "Contact", roles: ["guest", "user", "admin"] },
        // Restricted Links
        { href: "/dashboard", label: "Dashboard", roles: ["user", "admin"] },
        { href: "/admin", label: "Admin", roles: ["admin"] },
    ];

    // Filter links based on user role and login status
    const navLinks = useMemo(() => {
        // Determine current role: 'admin', 'user', or 'guest'
        const userRole = user ? user.role : 'guest';
        
        return allLinks.filter(link => 
            link.roles.includes(userRole)
        );
    }, [user]); // Re-calculate when user object changes


    return (
        <>
            <nav className="bg-[#0a1128] text-white sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <div className="flex-shrink-0">
                            <Link href="/">
                                <img src="/logo.png" alt="Logo" className="h-10" />
                            </Link>
                        </div>

                        {/* Desktop Menu - Renders filtered links */}
                        <div className="hidden md:flex space-x-6">
                            {navLinks.map((link) => ( // 👈 Renders ONLY filtered links
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`transition-colors duration-200 ${
                                        pathname === link.href
                                            ? "text-blue-800 font-semibold"
                                            : "hover:text-blue-600"
                                    }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>

                        {/* Auth buttons / User Info (No change needed here) */}
                        <div className="hidden md:flex space-x-4">
                            {user ? (
                                <>
                                    <span className="px-4 py-2 rounded-md bg-gray-700">
                                        {user.name || user.email}
                                    </span>
                                    <button
                                        onClick={logout}
                                        className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-500"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => {
                                            setAuthMode("login");
                                            setIsOpenForm(true);
                                        }}
                                        id="login"
                                        className="px-4 py-2 rounded-md hover:bg-gray-700"
                                    >
                                        Sign In
                                    </button>
                                    <button
                                        onClick={() => {
                                            setAuthMode("signup");
                                            setIsOpenForm(true);
                                        }}
                                        className="px-4 py-2 rounded-md bg-blue-800 hover:bg-blue-700"
                                    >
                                        Sign Up
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Mobile button (No change) */}
                        <div className="md:hidden">
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                aria-label="Toggle mobile menu"
                            >
                                {/* SVG Icon */}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu - Renders filtered links */}
                {isOpen && (
                    <div className="md:hidden px-4 pb-4 space-y-2">
                        {navLinks.map((link) => ( // 👈 Renders ONLY filtered links
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`block px-4 py-2 rounded-md transition-colors duration-200 ${
                                    pathname === link.href
                                        ? "bg-blue-600 text-white"
                                        : "hover:bg-gray-700"
                                }`}
                                onClick={() => setIsOpen(false)}
                            >
                                {link.label}
                            </Link>
                        ))}
                        {/* ... Mobile Auth buttons (no change) ... */}
                        {user ? (
                            <>
                                <span className="block px-4 py-2 rounded-md bg-gray-700">
                                    {user.name || user.email}
                                </span>
                                <button
                                    onClick={() => {
                                        logout();
                                        setIsOpen(false);
                                    }}
                                    className="block w-full text-left px-4 py-2 rounded-md bg-red-600 hover:bg-red-500"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => {
                                        setAuthMode("login");
                                        setIsOpenForm(true);
                                        setIsOpen(false);
                                    }}
                                    className="block w-full text-left px-4 py-2 rounded-md hover:bg-gray-700"
                                    id="login"
                                >
                                    Sign In
                                </button>
                                <button
                                    onClick={() => {
                                        setAuthMode("signup");
                                        setIsOpenForm(true);
                                        setIsOpen(false);
                                    }}
                                    className="block w-full text-left px-4 py-2 rounded-md bg-blue-800 hover:bg-blue-700"
                                >
                                    Sign Up
                                </button>
                            </>
                        )}
                    </div>
                )}
            </nav>

            {isOpenForm && (
                <AuthModal mode={authMode} onClose={() => setIsOpenForm(false)} />
            )}
        </>
    );
}