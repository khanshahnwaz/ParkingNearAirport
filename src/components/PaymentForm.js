// components/PaymentForm.jsx
'use client';

export default function PaymentForm({ bookingSummary, onPrevious, onCompleteBooking }) {
  const { name, email, contact, people } = bookingSummary;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 w-full md:w-2/3">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Payment</h2>
      <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-800 p-4 mb-6">
        <p className="font-semibold">Ready to complete your booking</p>
        <p className="text-sm">Please review your details and click "Complete Booking" to proceed with payment.</p>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <h3 className="font-semibold text-gray-800">Booking Summary</h3>
        <p><span className="font-medium text-gray-600">Name:</span> {name}</p>
        <p><span className="font-medium text-gray-600">Email:</span> {email}</p>
        <p><span className="font-medium text-gray-600">Contact:</span> {contact}</p>
        <p><span className="font-medium text-gray-600">People:</span> {people}</p>
        <p><span className="font-medium text-gray-600">Departure:</span> {bookingSummary.departureTerminal || 'N/A'}</p>
        <p><span className="font-medium text-gray-600">Arrival:</span> {bookingSummary.arrivalTerminal || 'N/A'}</p>
      </div>

      <div className="flex justify-between mt-6">
        <button type="button" onClick={onPrevious} className="bg-gray-200 text-gray-800 font-semibold py-2 px-6 rounded-lg hover:bg-gray-300 transition-colors">
          ← Previous
        </button>
        <button onClick={onCompleteBooking} className="bg-blue-800 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-900 transition-colors">
          Complete Booking
        </button>
      </div>
    </div>
  );
}