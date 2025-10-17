"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Link } from "lucide-react";

function PaymentFailedContent() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");
  const { paymentReceipt, user } = useAuth();
useEffect(() => {
  if (!sessionId) return;

  const confirmPayment = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/update-order-status.php?session_id=${sessionId}`
      );
      const data = await res.json();

      if (data.ok) {
        console.log("✅ Order status updated:", data.status);
      } else {
        console.error("❌ Status update failed:", data.error);
      }
    } catch (err) {
      console.error("🔥 Error updating order:", err);
    }
  };

  confirmPayment();
}, [sessionId]);

  return (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-16 px-6">
    <div className="bg-white shadow-lg rounded-lg max-w-2xl w-full p-10 text-center">
      <div className="flex items-center justify-center mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>

      <h1 className="text-3xl font-bold text-red-600">Payment Failed</h1>
      <p className="text-gray-700 mt-3 text-lg">
        ❗ Something went wrong during your payment.
      </p>
      <p className="text-gray-500 mt-1">
        No worries — you can try completing your booking again.
      </p>

      <div className="mt-6 mb-4 border-b"></div>

      <p className="text-gray-600">
        If any amount was deducted, it will be auto-refunded.
      </p>

      <div className="mt-8 space-x-4">
        
        <a href="/" className="inline-block bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-6 rounded-lg transition">
          Go to Home
        </a>
       
      </div>
    </div>
  </div>
);

}

export default function PaymentFailed() {
  return (
    <Suspense fallback={<div className="text-center p-10 text-gray-500">Loading...</div>}>
      <PaymentFailedContent />
    </Suspense>
  );
}
