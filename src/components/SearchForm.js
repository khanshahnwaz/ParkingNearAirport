"use client";

import { useEffect, useState } from "react";
import airportLocations from "../data/location"
import HoverSelect from "./SelectBox";
import promoCodes from "../data/promoCodes.json"; // adjust path as needed
import { useRouter } from "next/navigation";
export default function SearchForm() {
    const router=useRouter();
  const [location, setLocation] = useState("");
  const [dates, setDates] = useState({ start: "", end: "" });
  const [promo, setPromo] = useState(null);
  const[pickupType,setPickUpType]=useState("text");
  const[dropType,setDropType]=useState("text");

  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    if (location.trim() !== "" && dates.start !== "" && dates.end !== "") {
      setIsFormValid(true);
    } else {
      setIsFormValid(false);
    }
  }, [location, dates]);

  const handleSubmit = (e) => {
  e.preventDefault();
  if (!isFormValid) return;

  // Build query string
  const query = new URLSearchParams({
    location,
    start: dates.start,
    end: dates.end,
    promo: promo?JSON.stringify(promo): "",
  }).toString();

  // Navigate to /search-results with query
  router.push(`/search-results?${query}`);
};


  return (
    <section className="bg-[#fdf8f2] py-6">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <form
          onSubmit={handleSubmit}
          className="bg-transparent shadow-md rounded-xl flex flex-col md:flex-row items-stretch md:items-center p-4 gap-4"
        >
          {/* Location */}
          <HoverSelect
            options={airportLocations}
            placeholder="Select your location"
            onChange={setLocation}
          />

          {/* Start Date */}
          <input
            type="text"
            onFocus={(e)=>{e.target.type='date',setTimeout(()=>e.target.click(),100)}}
            onBlur={(e)=>e.target.type='text'}
      placeholder="Dropoff Date"
            value={dates.start}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => setDates({ ...dates, start: e.target.value })}
            className="w-full placeholder-gray-700 text-gray-700 flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          {/* End Date */}
          <input
           type="text"
            onFocus={(e)=>{e.target.type='date',setTimeout(()=>e.target.click(),100)}}
            onBlur={(e)=>e.target.type='text'}
            value={dates.end}
            min={dates.start}
            placeholder="Pickup Date"
            onChange={(e) => setDates({ ...dates, end: e.target.value })}
            className="placeholder-gray-700 w-full text-gray-700 flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          {/* Promo Code (Dropdown from JSON) */}
          <HoverSelect
            options={promoCodes.map((p) => p.label)}
            placeholder="Select promo code (optional)"
            onChange={(value) => {
              const selected = promoCodes.find((p) => p.label === value);
              setPromo(selected || null);
            }}
          />

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isFormValid}
            className={`px-6 py-2 rounded-lg bg-blue-900 text-white ${
              isFormValid
                ? "cursor-pointer hover:bg-blue-900"
                : "cursor-not-allowed opacity-60"
            }`}
          >
            Airport Parking Search
          </button>
        </form>
      </div>
    </section>
  );
}
