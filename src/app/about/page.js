"use client";

import { CheckCircle, Car, Shield, Clock, Award } from "lucide-react";
import Footer from "@/components/Footer";

export default function About() {
  return (
    <div className="bg-[#fdf8f2] min-h-screen flex flex-col">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-[#001a4d] to-blue-900 text-center py-20">
        <h1 className="text-4xl md:text-5xl font-bold text-white">About Us</h1>
        <p className="text-lg text-blue-100 mt-4">
          Your Trusted Airport Parking Solution
        </p>
      </div>

      {/* Main Content */}
      <div className=" flex-grow py-12 px-4">
        {/* First Section */}
        <div className="max-w-5xl mx-auto bg-inherit rounded-lg shadow-md p-8 flex flex-col md:flex-row gap-6 mb-12">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Compare Parking 4 Me
            </h2>
            <p className="text-gray-600 mb-4 leading-relaxed">
              We are committed to offer the best airport parking deals by
              comparing available car parks. Our deals are competitively priced
              with premium service standards. Compare Parking 4 Me is a modern,
              informative, and user-friendly website with a recently updated
              booking system to help you find exactly what you need.
            </p>
            <p className="text-gray-600 leading-relaxed">
              We prioritize customer satisfaction, aiming to deliver the highest
              quality at reasonable prices. We take pride in our customer
              service, handling queries and complaints promptly and
              professionally.
            </p>
          </div>
          <div className="w-full md:w-1/3 flex-shrink-0">
            <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white p-6 rounded-xl shadow-md h-full flex flex-col justify-center">
              <h3 className="text-lg font-semibold mb-2">Customer First</h3>
              <p className="text-sm leading-relaxed">
                Our secure website is accessible 24/7, providing efficient,
                friendly, and professional service.
              </p>
            </div>
          </div>
        </div>

        {/* Services Section */}
        <div className="max-w-6xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Our Range of Services
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md text-left">
              <Car className="text-blue-900 w-8 h-8 mb-4" />
              <h3 className="font-semibold text-lg mb-2 text-gray-800">Meet and Greet Services</h3>
              <p className="text-gray-600 text-sm">
                Convenient valet parking service where we take care of your
                vehicle while you travel.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-left">
              <Shield className="text-blue-900 w-8 h-8 mb-4" />
              <h3 className="font-semibold text-lg mb-2 text-gray-800">Park & Ride</h3>
              <p className="text-gray-600 text-sm">
                Secure parking with shuttle service to get you to the terminal
                quickly and safely.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-left">
              <Clock className="text-blue-900 w-8 h-8 mb-4" />
              <h3 className="font-semibold text-lg mb-2 text-gray-800">Onsite Parking</h3>
              <p className="text-gray-600 text-sm">
                Direct airport parking spaces for maximum convenience and peace
                of mind.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-left">
              <Award className="text-blue-900 w-8 h-8 mb-4" />
              <h3 className="font-semibold text-lg mb-2 text-gray-800">Premium Service Standards</h3>
              <p className="text-gray-600 text-sm">
                We maintain the highest quality standards with competitive
                pricing.
              </p>
            </div>
          </div>
        </div>

        {/* Commitment Section */}
        <div className="max-w-6xl mx-auto bg-blue-50 rounded-lg p-8 flex flex-col md:flex-row gap-6">
          {/* Left */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Our Commitment to You
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              We personally visit car parks to ensure security measures are in
              place. For our customers&apos; peace of mind, we verify parking
              operators&apos; insurance and liability documents to ensure operational
              standards are met.
            </p>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-center gap-2">
                <CheckCircle className="text-green-500 w-5 h-5" />
                24/7 secure website accessibility
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="text-green-500 w-5 h-5" />
                Efficient, friendly, and professional service
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="text-green-500 w-5 h-5" />
                Secure online booking facilities
              </li>
            </ul>
          </div>
          {/* Right */}
          <div className="w-full md:w-1/3 flex-shrink-0">
            <div className="bg-white p-6 rounded-lg shadow-md h-full flex flex-col justify-between">
              <div>
                <Shield className="text-blue-900 w-8 h-8 mb-3" />
                <h3 className="font-semibold text-lg mb-2 text-gray-800">Security First</h3>
                <p className="text-gray-600 text-sm mb-3">
                  Our online booking facilities are secure, offering confidence
                  to clients who prefer internet bookings.
                </p>
              </div>
              <span className="inline-block bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded">
                SSL Secured
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
    </div>
  );
}
