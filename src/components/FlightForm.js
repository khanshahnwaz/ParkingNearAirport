// components/FlightForm.jsx
'use client';

import { useState } from 'react';

export default function FlightForm({ onNext, onPrevious }) {
  const [formData, setFormData] = useState({
    hasFlightDetails: false, departureTerminal: '', departureFlightNo: '', arrivalTerminal: '', arrivalFlightNo: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'radio' ? value === 'yes' : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext(formData);
  };

  return (
    <div className="bg-[#fdf8f2] rounded-lg shadow-md p-6 w-full md:w-2/3 h-max">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Flight Details</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Select Terminal</label>
          <select className="py-2 mt-1 block w-full border-gray-300 rounded-md shadow-sm">
            <option className='py-2 bg-gray-600'>Select Terminal</option>
            {/* Add terminal options here */}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Do you have terminal and flight details?</label>
          <div className="flex items-center space-x-4 mt-2">
            <label className="flex items-center space-x-2">
              <input type="radio" name="hasFlightDetails" value="yes" checked={formData.hasFlightDetails} onChange={handleChange} className="text-gray-600 py-2 form-radio" />
              <span>Yes</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="radio" name="hasFlightDetails" value="no" checked={!formData.hasFlightDetails} onChange={handleChange} className="py-2 form-radio" />
              <span className='text-gray-600'>No</span>
            </label>
          </div>
        </div>

        {formData.hasFlightDetails && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Departure Terminal</label>
              <select name="departureTerminal" value={formData.departureTerminal} onChange={handleChange} className="bg-gray-600 mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                <option className='py-2'>Select Terminal</option>
                {/* Add terminal options here */}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Departure Flight No.</label>
              <input type="text" name="departureFlightNo" value={formData.departureFlightNo} onChange={handleChange} className="text-gray-600 mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Arrival Terminal</label>
              <select name="arrivalTerminal" value={formData.arrivalTerminal} onChange={handleChange} className="bg-gray-600 mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                <option>Select Terminal</option>
                {/* Add terminal options here */}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Arrival Flight No.</label>
              <input type="text" name="arrivalFlightNo" value={formData.arrivalFlightNo} onChange={handleChange} className="text-gray-600 mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
            </div>
          </div>
        )}

        <div className="flex justify-between mt-6">
          <button type="button" onClick={onPrevious} className="bg-gray-200 text-gray-800 font-semibold py-2 px-6 rounded-lg hover:bg-gray-300 transition-colors">
            ← Previous
          </button>
          <button type="submit" className="bg-blue-800 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-900 transition-colors">
            Next →
          </button>
        </div>
      </form>
    </div>
  );
}