"use client"

import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import SearchForm from "@/components/SearchForm";

const Search = () => {
  return (
    <div className="bg-[#fdf8f2] min-h-screen flex flex-col items-center justify-center">
      {/* Hero Text */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
          Find Airport Parking
        </h1>
        <p className="text-gray-600 mt-2">
          Search for parking at your destination airport
        </p>
      </div>

      {/* Banner */}
      <CTA />

      {/* Search Form */}
      <div className="mt-6">
        <SearchForm />
      </div>

      {/* <Footer /> */}
    </div>
  );
};

export default Search;
