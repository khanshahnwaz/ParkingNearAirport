"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

function PaymentFailedContent() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");
  const { paymentReceipt, user } = useAuth();

  useEffect(() => {
    if (!sessionId || !paymentReceipt || !user) return;

    const saveFailedOrder = async () => {
      try {
        const totalAmount = paymentReceipt.cancellation
          ? paymentReceipt.vehicle * parseFloat(paymentReceipt.total) + 2
          : parseInt(paymentReceipt.vehicle) * parseFloat(paymentReceipt.total);

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/create-order.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            stripeSessionId: sessionId,
            paymentStatus: "failed",
            amount: totalAmount,
            currency: "INR",
            bookingSummary: paymentReceipt,
          }),
        });

        if (!res.ok) {
          console.error("❌ Failed to record failed payment:", await res.text());
        }
      } catch (err) {
        console.error("🔥 Error saving failed order:", err);
      }
    };

    saveFailedOrder();
  }, [sessionId, paymentReceipt, user]);

  return (
    <div className="p-10 text-center">
      <h1 className="text-3xl font-bold text-red-600">Payment Failed</h1>
      <p className="text-gray-700 mt-2">
        Your booking could not be completed. Please try again.
      </p>
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
