"use client";

import { Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-blue-950 text-white py-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Logo & About */}
        <div>
          <div className="mb-4">
            <img src="/logo.png" alt="Logo" className="h-10" />
          </div>
          <p className="text-sm mb-4">
            Easily find and compare parking options. Save time and money with
            the best deals on parking spaces!
          </p>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2">
              <Phone size={16} /> 033 0133 1513
            </li>
            <li className="flex items-center gap-2">
              <MapPin size={16} /> Bartle House, 9 Oxford Court, Manchester
              England, M2 3WQ
            </li>
            <li className="flex items-center gap-2">
              <Mail size={16} /> info@compareparking4me.co.uk
            </li>
          </ul>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-blue-400">About Us</a></li>
            <li><a href="#" className="hover:text-blue-400">Terms Of Service</a></li>
            <li><a href="#" className="hover:text-blue-400">Privacy Policy</a></li>
          </ul>
        </div>

        {/* Support Center */}
        <div>
          <h3 className="font-semibold mb-4">Support Center</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-blue-400">FAQ&apos;s</a></li>
            <li><a href="#" className="hover:text-blue-400">Contact Us</a></li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h3 className="font-semibold mb-4">Newsletter</h3>
          <p className="text-sm mb-4">
            Subscribe Our Newsletter To Get Latest Update And News
          </p>
          <div className="flex flex-col space-y-3">
            <input
              type="email"
              placeholder="Your Email"
              className="px-4 py-2 rounded-md text-gray-50 outline"
            />
            <button className="bg-gradient-to-b from-[#001a4d] to-blue-900 text-white px-5 py-2 rounded-md shadow hover:opacity-90 transition">
              Subscribe Now →
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700 mt-10 pt-6 text-center text-sm">
        © Copyright 2025{" "}
        <a href="#" className="text-blue-400 hover:underline">
          compareparking4me
        </a>
        . All Rights Reserved.
      </div>
    </footer>
  );
}
