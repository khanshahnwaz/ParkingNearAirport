"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

function PaymentSuccessContent() {
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
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2l4-4m5 2a9 9 0 11-18 0a9 9 0 0118 0z" />
        </svg>
      </div>

      <h1 className="text-3xl font-bold text-green-600">Payment Successful</h1>
      <p className="text-gray-700 mt-3 text-lg">
        🎉 Your booking has been confirmed!
      </p>
      <p className="text-gray-500 mt-1">
        A confirmation email with your booking details has been sent.
      </p>

      {/* Add a decorative divider */}
      <div className="mt-6 mb-4 border-b"></div>

      <p className="text-gray-600">
        We appreciate your trust. You can now relax — your parking is secured.
      </p>

      {/* Back to home button */}
      <a href="/" className="mt-8 inline-block bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg transition">
        Go to Home
      </a>
    </div>
  </div>
);

}

export default function PaymentSuccess() {
  return (
    <Suspense
      fallback={
        <div className="p-10 text-center text-gray-600">
          Processing your payment...
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
