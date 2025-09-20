// components/PaymentForm.jsx
'use client';

export default function PaymentForm({ bookingSummary, onPrevious,total }) {
  const { name, email, contact } = bookingSummary;

  const handleCompleteBooking = async () => {
    try {
      console.log("Amount to be paid",total,"and key is",process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID)
      // 1. Call your backend to create a Razorpay order
      const response = await fetch('/api/razorpay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: total }),
      });

      if (!response.ok) {
        throw new Error('Failed to create Razorpay order');
      }

      const order = await response.json();

      // 2. Use the real order ID from the backend response
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Use NEXT_PUBLIC for client-side keys
        amount: order.amount,
        currency: order.currency,
        name: "Your Company Name",
        description: "Booking Payment",
        order_id: order.id, // This is the real, server-generated order ID
        handler: function (paymentResponse) {
          alert(`Payment successful! Payment ID: ${paymentResponse.razorpay_payment_id}`);
          // Send paymentResponse to your backend for verification
        },
        prefill: {
          name: name,
          email: email,
          contact: contact,
        },
        theme: {
          color: "#1a237e"
        }
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();

    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment failed. Please try again.');
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
        <p ><span className="font-medium text-gray-600">Name:</span> <span className="text-gray-600">{`${bookingSummary.title} ${bookingSummary.firstName} ${bookingSummary.lastName}`}</span></p>
        <p><span className="font-medium text-gray-600">Email:</span> <span className="text-gray-600">{bookingSummary.email}</span></p>
        <p><span className="font-medium text-gray-600">Contact:</span> <span className="text-gray-600">{bookingSummary.contact}</span></p>
        <p><span className="font-medium text-gray-600">People:</span> <span className="text-gray-600">{bookingSummary.people}</span></p>
        <p><span className="font-medium text-gray-600">Departure:</span> <span className="text-gray-600">{bookingSummary.departureTerminal || 'N/A'}</span></p>
        <p><span className="font-medium text-gray-600">Arrival:</span> <span className="text-gray-600">{bookingSummary.arrivalTerminal || 'N/A'}</span></p>
      </div>

      <div className="flex justify-between mt-6 px-6">
        <button type="button" onClick={onPrevious} className="bg-gray-200 text-gray-800 font-semibold py-2 px-6 rounded-lg hover:bg-gray-300 transition-colors">
          ← Previous
        </button>
        <button onClick={handleCompleteBooking} className="bg-blue-800 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-900 transition-colors">
          Complete Booking
        </button>
      </div>
    </div>
  );
}