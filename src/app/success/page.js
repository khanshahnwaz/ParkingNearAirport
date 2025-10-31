"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { buildEmailPayload,sendConfirmationEmail } from "@/utils/config";


/**
 * Helper function to format the full order record into the required EmailJS template variables,
 * including generating the HTML table for line items.
 * @param {object} orderRecord - The order data returned from the backend.
 * @returns {object} The payload object formatted for the EmailJS template.
 */


/**
 * Sends the formatted email payload using EmailJS.
 * NOTE: This assumes the EmailJS SDK is loaded globally (e.g., via a script tag).
 */

// ---------------------------------------------------------------------

function PaymentSuccessContent() {
  // Use standard web API to get the session ID, replacing the non-resolvable Next.js hook.
  const sessionId = typeof window !== 'undefined' 
    ? new URLSearchParams(window.location.search).get("session_id")
    : null;
    
  // Removed unused useAuth variables: paymentReceipt, user 
  const [emailSent, setEmailSent] = useState(false);
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    // Only run if sessionId is available and we haven't tried to confirm yet
    if (!sessionId) return;

    const confirmPayment = async () => {
      // Use a flag to ensure confirmation runs only once for a given session ID
      if (emailSent) return; 

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}/update-order-status.php?session_id=${sessionId}`
        );
        const data = await res.json();

        if (data.ok && data.status === 'ACCEPTED') {
          console.log("✅ Order status updated:", data.status);
          setOrderId(data.orderRecord.id);

          // --- EMAIL SENDING LOGIC ---
          // console.log("order record: ",data.orderRecord)
          const emailPayload = buildEmailPayload(data.orderRecord);
          await sendConfirmationEmail(emailPayload);
          setEmailSent(true); // Mark as sent
          // --- END EMAIL SENDING LOGIC ---

        } else if (data.ok && data.status !== 'ACCEPTED') {
          console.warn("⚠️ Payment status not ACCEPTED, status is:", data.status);
          setOrderId(data.orderRecord.id);
        } else {
          console.error("❌ Status update failed:", data.error);
        }
      } catch (err) {
        console.error("🔥 Error updating order:", err);
      }
    };

    confirmPayment();
  // We use [sessionId] and [emailSent] in the dependency array to trigger the check 
  // when the ID is available and prevent repeated execution after the email is sent.
  }, [sessionId, emailSent]); 


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
          A confirmation email with your booking details has been sent to the email address on file.
        </p>

        {orderId && (
            <p className="text-sm text-gray-500 mt-4">
                Your Order ID is: <span className="font-semibold text-green-700">{orderId}</span>
            </p>
        )}

        {/* Add a decorative divider */}
        <div className="mt-6 mb-4 border-b"></div>

        <p className="text-gray-600">
          We appreciate your trust. You can now relax — your booking is secured.
        </p>

        {/* Back to home button */}
        <Link href="/" className="mt-8 inline-block bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg transition">
          Go to Home
        </Link>
      </div>
    </div>
  );

}

export default function PaymentSuccess() {
  return (
    // Suspense is kept for framework compatibility, although fallback logic is simple here
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
