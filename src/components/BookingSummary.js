// components/BookingSummary.jsx
export default function BookingSummary({ booking }) {
  const {
    name, location, country, type, dropoff, pickup, duration, base,
    promoCode,discount, discountPercent, total,cancellation,vehicle
  } = booking;
  // console.log("Booking summary ",booking)

  return (
    <div className="bg-[#fdf8f2] rounded-lg shadow-md p-6 w-full md:w-1/3">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">Booking Summary</h2>

      <div className="bg-blue-100 p-4 rounded-lg mb-4">
        <div className="flex items-center space-x-2">
          <div className="bg-blue-100 p-2 rounded">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-800" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-700">{name}</h3>
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
          <span className="font-medium text-blue-800">DROP-OFF:</span>
          <span className="text-gray-600">{dropoff}</span>
        </p>
        <p className="flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-4 4V3m-4 8h.01M16 11h.01M12 15h.01M12 19h.01M16 19h.01M16 15h.01M12 11h.01M8 15h.01M8 19h.01M8 11h.01M3 21h18a2 2 0 002-2V7a2 2 0 00-2-2H3a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="font-medium text-blue-800">PICK-UP:</span>
          <span className="text-gray-600">{pickup}</span>
        </p>
        <p className="flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium text-blue-800">DURATION:</span>
          <span className="text-gray-600">{duration} days</span>
        </p>
      </div>

      <hr className="my-4" />

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <p className="text-gray-800">Number of Days:</p>
          <p className="text-gray-600">{duration}</p>
        </div>
        <div className="flex justify-between ">
          <p className="text-gray-800">Base Amount:</p>
          <p className="text-gray-600">€{base.toFixed(2)}</p>
        </div>
        {promoCode && (
          <div className="bg-blue-100 p-4 rounded-lg ">
            <div className="flex justify-between">
              <p className="text-gray-800">Promo Code Applied</p>
              <p className="text-blue-800 font-semibold">{promoCode}</p>
            </div>
            <div className="text-xs text-gray-500">
              <p className="text-gray-700">Discount: {discountPercent}% off</p>
              <p className="text-gray-700">Valid until: 3/6/2026</p>
              {cancellation?<p className="text-gray-700">Cancellation coverage: <span className="float-right text-red-600">€2</span></p>:null}
            </div>
            <div className="flex justify-between text-green-600">
              <p>Discount ({promoCode}):</p>
              <p>-€{discount?.toFixed(2)}</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center text-lg font-bold mt-4 border-t pt-4">
        <p className="text-gray-900">Total Amount:</p>
        <p className="text-gray-700">€{cancellation?((vehicle*parseFloat(total))+2).toFixed(2):vehicle?vehicle*parseFloat(total):parseFloat(total)}</p>
      </div>
    </div>
  );
}