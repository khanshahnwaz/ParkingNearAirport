// components/BookingSummary.jsx
export default function BookingSummary({ booking }) {
  const {
    name, location, country, type, dropoff, pickup, duration, base,
    promoCode,discount, discountPercent, total,
  } = booking;
  console.log("discount",discount)

  return (
    <div className="bg-white rounded-lg shadow-md p-6 w-full md:w-1/3">
      <h2 className="text-xl font-semibold mb-4">Booking Summary</h2>

      <div className="bg-blue-100 p-4 rounded-lg mb-4">
        <div className="flex items-center space-x-2">
          <div className="bg-blue-100 p-2 rounded">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-800" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-lg">{name}</h3>
            <p className="text-gray-600 text-sm">{location}</p>
            <p className="text-gray-600 text-sm">{country}</p>
          </div>
        </div>
        <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded mt-2 inline-block">
          {type}
        </span>
      </div>

      <div className="space-y-3 text-sm">
        <p className="flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-4 4V3m-4 8h.01M16 11h.01M12 15h.01M12 19h.01M16 19h.01M16 15h.01M12 11h.01M8 15h.01M8 19h.01M8 11h.01M3 21h18a2 2 0 002-2V7a2 2 0 00-2-2H3a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="font-medium text-blue-600">DROP-OFF:</span>
          <span>{dropoff}</span>
        </p>
        <p className="flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-4 4V3m-4 8h.01M16 11h.01M12 15h.01M12 19h.01M16 19h.01M16 15h.01M12 11h.01M8 15h.01M8 19h.01M8 11h.01M3 21h18a2 2 0 002-2V7a2 2 0 00-2-2H3a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="font-medium text-blue-600">PICK-UP:</span>
          <span>{pickup}</span>
        </p>
        <p className="flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium text-blue-600">DURATION:</span>
          <span>{duration} days</span>
        </p>
      </div>

      <hr className="my-4" />

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <p>Number of Days:</p>
          <p>{duration}</p>
        </div>
        <div className="flex justify-between">
          <p>Base Amount:</p>
          <p>£{base.toFixed(2)}</p>
        </div>
        {promoCode && (
          <div className="bg-blue-100 p-4 rounded-lg ">
            <div className="flex justify-between">
              <p>Promo Code Applied</p>
              <p className="text-blue-600 font-semibold">{promoCode}</p>
            </div>
            <div className="text-xs text-gray-500">
              <p>Discount: {discountPercent}% off</p>
              <p>Valid until: 3/6/2026</p>
            </div>
            <div className="flex justify-between text-green-600">
              <p>Discount ({promoCode}):</p>
              <p>-£{discount?.toFixed(2)}</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center text-lg font-bold mt-4 border-t pt-4">
        <p>Total Amount:</p>
        <p>£{total}</p>
      </div>
    </div>
  );
}