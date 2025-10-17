'use client';

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";

export default function PaymentForm({ bookingSummary, onPrevious, total }) {
    const { user, setPaymentReceipt, paymentReceipt } = useAuth();
    const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
    const [loading, setLoading] = useState(false);
    const{duration,base,vehicle,discount}=total;

    console.log("booking ",bookingSummary)

    // console.log("booking ",total)

    // Total calculation (moved here for clarity)
    const calculateTotalAmount = () => {

      // Safely convert to numbers
const days = parseInt(duration) || 0;
const basePrice = parseFloat(base) || 0;
const vehicleCount = parseInt(vehicle) || 1;
const discountValue = parseFloat(discount) || 0;
        // ✅ Dynamic Calculations for Total
  const baseTotal = basePrice * days;                 // Base price * number of days
  const vehicleTotal = baseTotal * vehicleCount;          // Multiply by number of vehicles
  const discountedTotal = vehicleTotal - (discountValue || 0);  // Apply discount if exists
  const finalTotal = bookingSummary.cancellation ? discountedTotal + 2 : discountedTotal; // Add cancellation fee

  return finalTotal;

    };
    const finalAmount = calculateTotalAmount(); // Calculate once
    // console.log("final amount payment",finalAmount)

    useEffect(() => {
        setPaymentReceipt(bookingSummary)
    }, [bookingSummary, setPaymentReceipt]);

    const handleCompleteBooking = async () => {
        if (!user) {
            document.getElementById("login")?.click();
            return;
        }

        setLoading(true);

        try {
            // *****************************************************************
            // 1. CREATE PENDING ORDER RECORD AND GET ORDER ID
            // *****************************************************************
            const orderResponse = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE}/create-order-pending.php`,
                {
                    method: "POST",
                    headers: { 
                        "Content-Type": "application/json",
                        // OPTIONAL: Include user token if your API needs it for authorization
                        // 'Authorization': `Bearer ${user.token}`, 
                    },
                    body: JSON.stringify({
                        userId: user.id, // Associate order with the logged-in user
                        amount: finalAmount,
                        currency: "EUR",
                        bookingSummary: bookingSummary,
                    }),
                }
            );
            const orderData = await orderResponse.json();

            if (!orderData.ok || !orderData.orderId) {
                setLoading(false);
                alert("Failed to start booking process. Please try again.");
                return;
            }

            const orderId = orderData.orderId;
            // console.log("Provisional Order created with ID:", orderId);


            // *****************************************************************
            // 2. CREATE STRIPE CHECKOUT SESSION (Pass the Order ID)
            // *****************************************************************
            const stripeResponse = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE}/create-checkout-session.php`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        amount: finalAmount, // Use finalAmount calculated earlier
                        orderId: orderId, // 👈 CRITICAL: Pass DB Order ID to Stripe
                        bookingSummary: bookingSummary, // Optional: for Stripe line item details
                    }),
                }
            );

            const stripeData = await stripeResponse.json();
            setLoading(false);
            console.log("stripe response ",stripeData);

            if (stripeData.ok && stripeData.id) {
                const stripe = await stripePromise;
                // Redirect will handle payment and success page redirection
                await stripe.redirectToCheckout({ sessionId: stripeData.id });
            } else {
                // NOTE: In a real app, if Stripe fails here, you should immediately mark the order as 'Failed' in the DB.
                alert("Failed to redirect to payment (Stripe error).");
            }
        } catch (error) {
            setLoading(false);
            // console.error("Payment initiation failed:", error);
            alert("Payment failed. Please try again.");
        }
    };

    return (
        // ... rest of the component JSX (Summary Display) remains the same
        <div className="bg-[#fdf8f2] rounded-lg shadow-md py-6 md:p-6 w-full md:w-2/3">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Payment</h2>

            <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-900 p-4 mb-6 rounded-md">
                <p className="font-semibold text-blue-900">Ready to complete your booking</p>
                <p className="text-sm text-blue-800">
                    Please review your details and click "Complete Booking" to proceed with payment.
                </p>
            </div>

            <div className="bg-white shadow-sm rounded-lg p-6 space-y-4">
                <h3 className="font-semibold text-gray-900 text-lg">Booking Summary</h3>

                {/* --- Display Details (Simplified for brevity) --- */}
                {/* Personal Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b pb-4">
                    <p className="text-gray-800">
                        <span className="font-medium text-gray-900">Name:</span>{" "}
                        <span className="text-gray-700">{`${bookingSummary.title || ""} ${bookingSummary.firstName || ""} ${bookingSummary.lastName || ""}`}</span>
                    </p>
                    {bookingSummary.email && (
                        <p className="text-gray-800">
                            <span className="font-medium text-gray-900">Email:</span>{" "}
                            <span className="text-gray-700">{bookingSummary.email}</span>
                        </p>
                    )}
                    {/* ... other personal details ... */}
                     {bookingSummary.contact && (
                        <p className="text-gray-800">
                            <span className="font-medium text-gray-900">Contact:</span>{" "}
                            <span className="text-gray-700">{bookingSummary.contact}</span>
                        </p>
                    )}
                    {bookingSummary.vehicle && (
                        <p className="text-gray-800">
                            <span className="font-medium text-gray-900">Vehicle Count:</span>{" "}
                            <span className="text-gray-700">{bookingSummary.vehicle}</span>
                        </p>
                    )}
                    {bookingSummary.cancellation !== undefined && (
                        <p className="text-gray-800">
                            <span className="font-medium text-gray-900">Cancellation Coverage:</span>{" "}
                            <span className={`font-semibold ${bookingSummary.cancellation ? "text-green-700" : "text-red-700"}`}>
                                {bookingSummary.cancellation ? "Yes" : "No"}
                            </span>
                        </p>
                    )}
                </div>

                {/* Flight Details */}
                {(bookingSummary.hasFlightDetails || bookingSummary.departureTerminal || bookingSummary.arrivalTerminal) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b pb-4">
                                                <h4 className="font-semibold text-gray-900">Flight Details</h4>

                        {/* ... flight detail display ... */}
                        {bookingSummary.departureTerminal && (
                            <p className="text-gray-800">
                                <span className="font-medium text-gray-900">Departure Terminal:</span>{" "}
                                <span className="text-gray-700">{bookingSummary.departureTerminal}</span>
                            </p>
                        )}
                        {bookingSummary.departureFlightNo && (
                            <p className="text-gray-800">
                                <span className="font-medium text-gray-900">Departure Flight No:</span>{" "}
                                <span className="text-gray-700">{bookingSummary.departureFlightNo}</span>
                            </p>
                        )}
                        {bookingSummary.arrivalTerminal && (
                            <p className="text-gray-800">
                                <span className="font-medium text-gray-900">Arrival Terminal:</span>{" "}
                                <span className="text-gray-700">{bookingSummary.arrivalTerminal}</span>
                            </p>
                        )}
                        {bookingSummary.arrivalFlightNo && (
                            <p className="text-gray-800">
                                <span className="font-medium text-gray-900">Arrival Flight No:</span>{" "}
                                <span className="text-gray-700">{bookingSummary.arrivalFlightNo}</span>
                            </p>
                        )}
                    </div>
                )}

                {/* Vehicle Details */}
                {bookingSummary.vehicles && bookingSummary.vehicles.length > 0 && ( // Changed bookingSummary.vehicle.length to bookingSummary.vehicles.length
                    <div className="space-y-2">
                        <h4 className="font-semibold text-gray-900">Vehicle Details</h4>
                        {bookingSummary.vehicles.map((car, idx) => (
                            <div
                                key={idx}
                                className="border rounded-md p-3 bg-gray-50 grid grid-cols-1 md:grid-cols-2 gap-2"
                            >
                                {/* ... vehicle detail display ... */}
                                {car.make && (
                                    <p className="text-gray-800">
                                        <span className="font-medium text-gray-900">Make:</span>{" "}
                                        <span className="text-gray-700">{car.make}</span>
                                    </p>
                                )}
                                {car.model && (
                                    <p className="text-gray-800">
                                        <span className="font-medium text-gray-900">Model:</span>{" "}
                                        <span className="text-gray-700">{car.model}</span>
                                    </p>
                                )}
                                {car.color && (
                                    <p className="text-gray-800">
                                        <span className="font-medium text-gray-900">Color:</span>{" "}
                                        <span className="text-gray-700">{car.color}</span>
                                    </p>
                                )}
                                {car.regNo && (
                                    <p className="text-gray-800">
                                        <span className="font-medium text-gray-900">Reg No:</span>{" "}
                                        <span className="text-gray-700">{car.regNo}</span>
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex justify-between mt-6 px-6">
                <button
                    type="button"
                    onClick={() => onPrevious()}
                    className="bg-gray-200 text-gray-900 font-semibold py-2 px-6 rounded-lg hover:bg-gray-300 transition-colors"
                >
                    ← Previous
                </button>
                <button
                    onClick={handleCompleteBooking}
                    disabled={loading} // Disable button while loading
                    className="bg-blue-800 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-900 transition-colors cursor-pointer hover:opacity-70 disabled:opacity-50 disabled:cursor-wait"
                >
                    {loading ? "Payment Processing..." : `Complete Booking (Total: £${finalAmount.toFixed(2)})`}
                </button>
            </div>
        </div>
    );
}