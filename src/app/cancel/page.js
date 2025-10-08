"use client";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export default function PaymentFailed() {
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

        await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/create-order.php`, {
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
      } catch (err) {
        console.error("Error saving failed order:", err);
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
