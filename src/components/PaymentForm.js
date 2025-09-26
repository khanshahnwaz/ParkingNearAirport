'use client';

import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

export default function PaymentForm({ bookingSummary, onPrevious, total }) {
  const { user } = useAuth();
  const[loading,setLoading]=useState(false);
  const handleCompleteBooking = async () => {
    try {
      if (!user) {
        document.getElementById("login").click();
        return;
      }
       setLoading(true);
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({amount: total, bookingSummary }),
      });
      setLoading(false);
const data = await response.json();

    if (data.url) {
      window.location.href = data.url; //  Redirect to Stripe
    } else {
      alert("Failed to redirect to payment");
    }
    } catch (error) {
      console.error("Payment failed:", error);
      alert("Payment failed. Please try again.");
    }
  };

  return (
    <div className="bg-[#fdf8f2] rounded-lg shadow-md py-6 md:p-6 w-full md:w-2/3">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Payment</h2>
      <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-800 p-4 mb-6">
        <p className="font-semibold">Ready to complete your booking</p>
        <p className="text-sm">Please review your details and click &quot;Complete Booking&quot; to proceed with payment.</p>
      </div>

      <div className="bg-[#fdf8f2] rounded-lg p-6 space-y-4">
        <h3 className="font-semibold text-gray-800">Booking Summary</h3>
        <p><span className="font-medium text-gray-600">Name:</span> {`${bookingSummary.title} ${bookingSummary.firstName} ${bookingSummary.lastName}`}</p>
        <p><span className="font-medium text-gray-600">Email:</span> {bookingSummary.email}</p>
        <p><span className="font-medium text-gray-600">Contact:</span> {bookingSummary.contact}</p>
        <p><span className="font-medium text-gray-600">People:</span> {bookingSummary.people}</p>
        <p><span className="font-medium text-gray-600">Departure:</span> {bookingSummary.departureTerminal || "N/A"}</p>
        <p><span className="font-medium text-gray-600">Arrival:</span> {bookingSummary.arrivalTerminal || "N/A"}</p>
      </div>

      <div className="flex justify-between mt-6 px-6">
        <button
          type="button"
          onClick={onPrevious}
          className="bg-gray-200 text-gray-800 font-semibold py-2 px-6 rounded-lg hover:bg-gray-300 transition-colors"
        >
          ← Previous
        </button>
        <button
          onClick={handleCompleteBooking}
          className="bg-blue-800 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-900 transition-colors cursor-pointer hover:opacity-70"
        >

         {loading?"Payment Processing...":"Complete Booking"} 
        </button>
      </div>
    </div>
  );
}
