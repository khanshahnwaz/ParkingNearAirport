"use client";

import React, { useMemo, useState } from "react";
import ParkingCard from "./ParkingCard";
import { useSearchParams, useRouter } from "next/navigation";
import { FaArrowLeft, FaRedoAlt, FaFilter } from "react-icons/fa";
import { FiMapPin, FiCalendar } from "react-icons/fi";

import parkingData from "../data/parkingData.json";

export default function SearchResultsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // read query params filled by your SearchForm when user clicks Search
  const location = searchParams?.get("location") || "";
  const start = searchParams?.get("start") || "";
  const end = searchParams?.get("end") || "";
  let promo = searchParams?.get("promo") || "";
if (promo !== "") {
  try {
    promo = JSON.parse(promo); // convert back into object
  } catch (e) {
    console.error("Invalid promo JSON", e);
    promo = null;
  }
} else {
  promo = null;
}


  const [sort, setSort] = useState("Price (Low to High)");

  // filter + sort (non-mutating)
  const filteredLots = useMemo(() => {
    if (!location) return [];

    let list = parkingData.filter((p) => p.location === location);

    // clone and sort
    const sorted = [...list];
    if (sort === "Price (Low to High)") {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sort === "Price (High to Low)") {
      sorted.sort((a, b) => b.price - a.price);
    } else if (sort === "Rating (High to Low)") {
      sorted.sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
    }
    // Distance sort would require distance data; left as-is.
    return sorted;
  }, [location, sort]);

  const count = filteredLots.length;

  const formatDate = (iso) => {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return iso;
    }
  };

  // push user back to search page with existing params to allow updating
  const handleUpdateSearch = () => {
    const qs = new URLSearchParams();
    if (location) qs.set("location", location);
    if (start) qs.set("start", start);
    if (end) qs.set("end", end);
    if (promo) qs.set("promo", promo);
    router.push("/?" + qs.toString());
  };

  return (
    <div className="bg-[#fdf8f2] min-h-screen  py-10 px-5 ">
      <div className="">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          {/* Header */}
          <h2 className="text-2xl font-bold text-gray-900 mb-1 mt-4">
            We found {count} parking {count === 1 ? "space" : "spaces"} that match
            your search criteria
          </h2>
          <p className="text-gray-500 mb-6">
            You can refine your search results by using the filters below.
          </p>

          {/* Search Summary Box */}
          <div className=" border rounded-lg p-4 flex flex-col  md:flex-row md:items-center md:justify-between gap-4 mb-6 shadow-sm">
            <div className="flex flex-col md:flex-row  md:items-center gap-6">
              <span className="flex items-center gap-2 text-gray-700">
                <FiMapPin className="text-blue-600" />
                {location || "—"}
              </span>

              <span className="flex items-center gap-2 text-gray-700">
                <FiCalendar className="text-blue-600" />
                {start && end
                  ? `${formatDate(start)} - ${formatDate(end)}`
                  : "Select dates"}
              </span>

              {promo ? (
                <span className="ml-2 text-sm text-green-700 font-medium">
                  Promo: {promo.label}
                </span>
              ) : null}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleUpdateSearch}
                className="flex items-center gap-2 border border-gray-300 rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                <FaRedoAlt /> Update Search
              </button>
            </div>
          </div>

          {/* Filter Header */}
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-700 font-medium"
            >
              <FaArrowLeft /> Back to Search
            </button>

            <button className="flex items-center gap-2 border border-gray-300 rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-100">
              <FaFilter /> Sort & Filter
            </button>
          </div>

          {/* Filter Section */}
          <div className="border rounded-lg p-4 mb-8 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-3">Filter</h3>

            {/* Sort Dropdown */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="text-gray-600 w-full md:w-1/3 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option>Price (Low to High)</option>
                <option>Price (High to Low)</option>
                <option>Rating (High to Low)</option>
                <option>Distance (Closest First)</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSort("Price (Low to High)")}
                className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100"
              >
                Reset
              </button>
              <button
                onClick={() => {}}
                className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-700"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results grid */}
      <div className="md:max-w-7xl mx-auto px-6 lg:px-8 mt-8">
        {count === 0 ? (
          <div className="text-center text-gray-600 py-20">
            {location
              ? `No parking lots available for ${location}.`
              : "Please enter a search to see results."}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredLots.map((lot,ind) => (
              <ParkingCard key={ind} data={lot} promo={promo} dates={{"start":start,"end":end}} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
