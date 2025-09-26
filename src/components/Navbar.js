"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AuthModal from "./AuthModal";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenForm, setIsOpenForm] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const pathname = usePathname();

  const{user,logout}=useAuth();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/search", label: "Search" },
    { href: "/about", label: "About Us" },
    { href: "/faqs", label: "FAQs" },
    { href: "/contact", label: "Contact" },
  ];

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

            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-6">
              {navLinks.map((link) => (
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

            {/* Auth buttons / User Info */}
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

            {/* Mobile button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle mobile menu"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden px-4 pb-4 space-y-2">
            {navLinks.map((link) => (
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
