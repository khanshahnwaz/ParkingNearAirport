// components/FlightForm.jsx
"use client";

import { useState } from "react";
import SelectBox from "./SelectBox";

export default function FlightForm({ onNext, onPrevious }) {
  const [formData, setFormData] = useState({
    hasFlightDetails: false,
    departureTerminal: "",
    departureFlightNo: "",
    arrivalTerminal: "",
    arrivalFlightNo: "",
  });

  const terminals = ["Terminal 1", "Terminal 2", "Terminal 3", "Terminal 4"];

  // for normal inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "radio" ? value === "yes" : value,
    }));
  };

  // for selects
  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext(formData);
  };

  return (
    <div className="bg-[#fdf8f2] rounded-lg shadow-md p-6 w-full md:w-2/3 h-max">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        Flight Details
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* First Departure Terminal Select */}
        <div>
          <SelectBox
            style="w-full"
            options={terminals}
            placeholder="Select Departure Terminal"
            value={formData.departureTerminal}
            onChange={(val) => {handleSelectChange("departureTerminal", val)}}
          />
        </div>

        {/* Radio: Has flight details */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Do you have terminal and flight details?
          </label>
          <div className="flex items-center space-x-4 mt-2">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="hasFlightDetails"
                value="yes"
                checked={formData.hasFlightDetails}
                onChange={handleChange}
                className="form-radio"
              />
              <span className="text-gray-600">Yes</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="hasFlightDetails"
                value="no"
                checked={!formData.hasFlightDetails}
                onChange={handleChange}
                className="form-radio"
              />
              <span className="text-gray-600">No</span>
            </label>
          </div>
        </div>

        {/* Second Section if hasFlightDetails */}
        {formData.hasFlightDetails && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Departure Terminal (fixed from first select) */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Departure Terminal
              </label>
              <input
                type="text"
                value={formData.departureTerminal}
                disabled
                className="text-gray-600 mt-1 block w-full border-gray-300 rounded-md shadow-sm px-4 py-2 bg-gray-100 cursor-not-allowed"
              />
            </div>

            {/* Departure Flight No */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Departure Flight No
              </label>
              <input
                type="text"
                name="departureFlightNo"
                value={formData.departureFlightNo}
                onChange={handleChange}
                placeholder="Enter departure flight no."
                className="text-gray-600 mt-1 block w-full border-gray-300 rounded-md shadow-sm px-4 py-2"
              />
            </div>

            {/* Arrival Terminal */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Arrival Terminal
              </label>
              <SelectBox
                style="w-full"
                options={terminals}
                placeholder="Select Arrival Terminal"
                value={formData.arrivalTerminal}
                onChange={(val) => handleSelectChange("arrivalTerminal", val)}
              />
            </div>

            {/* Arrival Flight No */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Arrival Flight No
              </label>
              <input
                type="text"
                name="arrivalFlightNo"
                value={formData.arrivalFlightNo}
                onChange={handleChange}
                placeholder="Enter arrival flight no."
                className="text-gray-600 mt-1 block w-full border-gray-300 rounded-md shadow-sm px-4 py-2"
              />
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={onPrevious}
            className="bg-gray-200 text-gray-800 font-semibold py-2 px-6 rounded-lg hover:bg-gray-300 transition-colors"
          >
            ← Previous
          </button>
          <button
            type="submit"
            className="bg-blue-800 cursor-pointer text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-900 transition-colors"
          >
            Next →
          </button>
        </div>
      </form>
    </div>
  );
}
