"use client";

import { useEffect, useState } from "react";
// import airportLocations from "../data/location";
import HoverSelect from "./SelectBox";
// import promoCodes from "../data/promoCodes.json";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function SearchForm() {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [dates, setDates] = useState({ start: "", end: "" });
  const [promo, setPromo] = useState(null);
  const [isFormValid, setIsFormValid] = useState(false);
  // const [showTip, setShowTip] = useState(false);


  const {airportLocations,promoCodes}=useAuth();
  useEffect(() => {
    setIsFormValid(
      location.trim() !== "" && dates.start !== "" && dates.end !== ""
    );
  }, [location, dates]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    const query = new URLSearchParams({
      location,
      start: dates.start,
      end: dates.end,
      promo: promo ? JSON.stringify(promo) : "",
    }).toString();

    router.push(`/search-results?${query}`);
  };

  

  return (
    <section className="bg-[#fdf8f2] py-6">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 shadow-xl rounded-2xl bg-white/70">
        <form
          onSubmit={handleSubmit}
          className="bg-transparent rounded-xl flex flex-col md:flex-row flex-wrap items-stretch md:items-center p-4 gap-4"
        >
          {/* Location */}
          <HoverSelect
            options={airportLocations}
            placeholder="Select your location"
            onChange={setLocation}
          />

          {/* Start Date */}
          <div className="relative flex-1 min-w-[230px]">
            <input
              type="text"
              onFocus={(e) => {
                e.target.type = "date";
                setTimeout(() => e.target.showPicker?.(), 100);
              }}
              onBlur={(e) => (e.target.type = "text")}
              value={dates.start}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setDates({ ...dates, start: e.target.value })}
              placeholder="Dropoff Date"
              className="w-full px-4 py-2 border rounded-lg text-black placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 appearance-none"
            />
            {/* {showTip && (
              <span className="absolute top-full left-0 mt-1 text-xs text-gray-600">
                *Double tap if calendar doesn’t open
              </span>
            )} */}
          </div>

          {/* End Date */}
          <div className="relative flex-1 min-w-[230px]">
            <input
              type="text"
              onFocus={(e) => {
                e.target.type = "date";
                setTimeout(() => e.target.showPicker?.(), 100);
              }}
              onBlur={(e) => (e.target.type = "text")}
              value={dates.end}
              min={dates.start}
              onChange={(e) => setDates({ ...dates, end: e.target.value })}
              placeholder="Pickup Date"
              className="w-full px-4 py-2 border rounded-lg text-black placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 appearance-none"
            />
            {/* {showTip && (
              <span className="absolute top-full left-0 mt-1 text-xs text-gray-600">
                *Double tap if calendar doesn’t open
              </span>
            )} */}
          </div>

          {/* Promo Code */}
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
            className={`px-6 py-2 rounded-lg text-white transition ${
              isFormValid
                ? "bg-blue-900 hover:bg-blue-800"
                : "bg-blue-900 opacity-60 cursor-not-allowed"
            }`}
          >
            Airport Parking Search
          </button>
        </form>
      </div>
    </section>
  );
}
