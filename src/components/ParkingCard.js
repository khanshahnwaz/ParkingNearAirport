// components/ParkingCard.jsx
"use client";
import { useState } from "react";
import ParkingModal from "./ParkingModal";
import { useRouter } from "next/navigation";

export default function ParkingCard({ data, promo,dates }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const discount = promo?.discount || 0;
  const discountedPrice = discount
    ? (data.price - (data.price * discount) / 100).toFixed(2)
    : data.price;

  const handleBookNow = () => {
    // Construct the query string with all necessary booking details
    const bookingDetails = {
      name: data.name,
      location: data.location,
      country: data.country,
      type: "Meet n Greet",
      base: data.price,
      dropoff:dates.start,
      pickup:dates.end,
      duration:new Date(dates.end).getDate()-new Date(dates.start).getDate()+1,
      total: discountedPrice,
      promoCode: promo?.code || "",
      discount:data.price-discountedPrice,
      discountPercent: promo?.discount || 0,
    };
    
    // Navigate to the checkout page with the booking details as query parameters
    router.push(`/checkout?booking=${JSON.stringify(bookingDetails)}`);
  };

  return (
    <>
      <div className="border rounded-lg shadow-md flex flex-col p-4 ">
        {/* Header */}
        {promo && (
          <div className="bg-green-200 text-sm text-center font-medium py-1 rounded-t-md text-green-800">
            {promo.label}
          </div>
        )}

        <div className="bg-blue-900 text-white text-center py-2 font-semibold">
          Meet & Greet
        </div>

        {/* Logo */}
        <div className="flex justify-center py-4">
          <img src={data.logo} alt={data.name} className="h-12" />
        </div>

        {/* Icons row */}
        <div className="flex justify-center gap-3 py-2">
          {data.icons.map((icon, i) => (
            <div
              key={i}
              className="bg-blue-900 text-white p-2 rounded-full text-sm"
            >
              {icon}
            </div>
          ))}
        </div>

        {/* Rating */}
        <div className="text-center py-2">
          <div className="text-yellow-500 text-lg">★★★★☆</div>
          <p className="text-gray-600 text-sm">{data.reviews} reviews</p>
        </div>

        {/* Price */}
        <div className="text-center py-2">
          {discount > 0 && (
            <p className="line-through text-gray-500"><del>£{data.price}</del></p>
          )}
          <p className="text-2xl font-bold text-blue-900">
            £{discountedPrice}
          </p>
        </div>

        {/* Features */}
        <ul className="text-sm text-gray-700 space-y-1 py-2">
          {data.features.map((f, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="text-yellow-500">●</span> {f}
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className="flex justify-between gap-3 mt-auto">
          <button
            className="cursor-pointer hover:opacity-70 flex-1 bg-blue-900 text-white py-2 rounded-md hover:bg-blue-800"
            onClick={handleBookNow}
          >
            Book Now
          </button>
          <button
            onClick={() => setOpen(true)}
            className="cursor-pointer hover:opacity-70 text-gray-700 flex-1 border border-gray-400 py-2 rounded-md hover:bg-gray-100"
          >
            More Info
          </button>
        </div>
      </div>

      {/* Modal */}
      {open && <ParkingModal data={data} onClose={() => setOpen(false)} />}
    </>
  );
}