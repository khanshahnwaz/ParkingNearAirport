"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

function PaymentSuccessContent() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");
  const { paymentReceipt, user } = useAuth();

  useEffect(() => {
    if (!sessionId || !paymentReceipt || !user) return;

    const createOrder = async () => {
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
            paymentStatus: "completed",
            amount: totalAmount,
            currency: "INR",
            bookingSummary: paymentReceipt,
          }),
        });

        const data = await res.json();
        if (data.ok) {
          console.log("✅ Order created:", data.orderNumber);
        } else {
          console.error("❌ Failed to save order:", data.error);
        }
      } catch (err) {
        console.error("🔥 Error saving order:", err);
      }
    };

    createOrder();
  }, [sessionId, paymentReceipt, user]);

  return (
    <div className="p-10 text-center">
      <h1 className="text-3xl font-bold text-green-600">Payment Successful</h1>
      <p className="text-gray-700 mt-2">Your booking has been confirmed.</p>
      <p className="text-gray-500 mt-1 text-sm">
        You will receive a confirmation email shortly.
      </p>
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
