// SearchForm.jsx
"use client";

import { useEffect, useState, useRef } from "react";
import HoverSelect from "./SelectBox";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";


// --- 1. Dedicated React Date Picker Component (With Hint Logic) ---
const DatePickerField = ({ name, value, min, onChange, placeholder, timeRequired = true, dates, setDates }) => {
    const inputType = timeRequired ? "datetime-local" : "date";
    const inputRef = useRef(null);
    // NEW STATE: Tracks if the hint should be shown for this specific field
    const [showHint, setShowHint] = useState(false); 

    const handleWrapperClick = () => {
        if (inputRef.current) {
            inputRef.current.click(); 
        }
    };
    
    // Logic to show the hint if the input is focused but remains empty after a short delay
    const handleFocus = () => {
        // Only show hint if the input is currently empty and not already showing
        if (!value) {
            setTimeout(() => {
                // If value is STILL empty after 500ms, show the hint
                if (!inputRef.current.value) {
                    setShowHint(true);
                }
            }, 500); 
        }
    };

    const handleBlur = () => {
        // Hide the hint when focus leaves
        setShowHint(false);
    };


    return (
        <div 
            className="relative flex-1 min-w-[230px] cursor-pointer" 
            onClick={handleWrapperClick}
        >
            <label htmlFor={name} className="block text-sm font-semibold text-gray-700 mb-1">
                {placeholder}
            </label> 
            <input
                type={inputType}
                id={name} 
                ref={inputRef}
                name={name}
                value={value}
                min={min}
                onChange={onChange}
                required
                onFocus={handleFocus} // 👈 Added focus handler
                onBlur={handleBlur}   // 👈 Added blur handler
                className="w-full px-4 py-2 border rounded-lg text-black placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            
            {/* HINT DISPLAY 👈 NEW */}
            {showHint && (
                <div className="absolute top-full z-10 p-1 mt-1 text-xs font-medium text-white bg-gray-800 rounded shadow-lg transition duration-300">
                    💡 Please tap or click the icon again to open the calendar.
                </div>
            )}
        </div>
    );
};
// --- End DatePickerField ---


export default function SearchForm() {
    const router = useRouter();
    const [location, setLocation] = useState("");
    const [dates, setDates] = useState({ start: "", end: "" });
    const [promo, setPromo] = useState(null);
    const [isFormValid, setIsFormValid] = useState(false);
 const{setCompany}=useAuth();

    const { airportLocations, promoCodes } = useAuth();
    
    const today = new Date().toISOString().slice(0, 16); 

    useEffect(() => {
        setIsFormValid(
            location.trim() !== "" && dates.start !== "" && dates.end !== "" && dates.start < dates.end
        );
    }, [location, dates]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!isFormValid) return;
  setCompany(location);
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
                    className="bg-transparent rounded-xl flex flex-col md:flex-row flex-wrap items-stretch md:items-start p-4 gap-4"
                >
                    {/* Location */}
                    <div className="relative flex-1 min-w-[230px]">
                        <label htmlFor="location-select" className="block text-sm font-semibold text-gray-700 mb-1">
                            Select your location
                        </label>
                        <HoverSelect
                            options={airportLocations}
                            placeholder="Select your location"
                            onChange={setLocation}
                        />
                    </div>

                    {/* Start Date (Dropoff) - Passed dates and setDates props are optional here, 
                       but kept for completeness if future logic requires them inside the date picker */}
                    <DatePickerField
                        name="start"
                        value={dates.start}
                        min={today}
                        onChange={(e) => setDates({ ...dates, start: e.target.value })}
                        placeholder="Dropoff Date & Time" 
                        timeRequired={true} 
                        dates={dates}
                        setDates={setDates}
                    />

                    {/* End Date (Pickup) - Passed dates and setDates props are optional here */}
                    <DatePickerField
                        name="end"
                        value={dates.end}
                        min={dates.start || today} 
                        onChange={(e) => setDates({ ...dates, end: e.target.value })}
                        placeholder="Pickup Date & Time" 
                        timeRequired={true} 
                        dates={dates}
                        setDates={setDates}
                    />

                    {/* Promo Code */}
                    <div className="relative flex-1 min-w-[230px]">
                         <label htmlFor="promo-select" className="block text-sm font-semibold text-gray-700 mb-1">
                            Select promo code (optional)
                        </label>
                        <HoverSelect
                            options={promoCodes.map((p) => p.label)}
                            placeholder="Select promo code (optional)"
                            onChange={(value) => {
                                const selected = promoCodes.find((p) => p.label === value);
                                setPromo(selected || null);
                            }}
                        />
                    </div>

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