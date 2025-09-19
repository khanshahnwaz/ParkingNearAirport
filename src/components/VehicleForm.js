// components/VehicleForm.jsx
'use client';

import { useState } from 'react';

export default function VehicleForm({ onNext, onPrevious }) {
  const [formData, setFormData] = useState({
    make: 'TBC', model: 'TBC', color: 'TBC', regNo: 'TBC'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext(formData);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 w-full md:w-2/3 h-max">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Vehicle Details</h2>
        <button className="text-blue-600 font-semibold hover:underline">
          Add Extra car
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Make</label>
            <input type="text" name="make" value={formData.make} onChange={handleChange} className="mt-1 py-2 block w-full border-gray-300 rounded-md shadow-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Model</label>
            <input type="text" name="model" value={formData.model} onChange={handleChange} className="py-2 mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Color</label>
            <input type="text" name="color" value={formData.color} onChange={handleChange} className="py-2 mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Reg No</label>
            <input type="text" name="regNo" value={formData.regNo} onChange={handleChange} className="py-2 mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
          </div>
        </div>
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