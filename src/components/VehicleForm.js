'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function VehicleForm({ onNext, onPrevious, data }) {
  const maxVehicles = parseInt(data?.vehicle) || 5; // maximum cars allowed
  const [vehicles, setVehicles] = useState([
    { make: '', model: '', color: '', regNo: '' },
  ]);
//  when user step back 
useEffect(() => {
    if (data?.vehicleDetails && data.vehicleDetails.length > 0) {
      setVehicles(data.vehicleDetails);
    }
  }, [data]);

  const handleChange = (index, e) => {
    const { name, value } = e.target;
    const newVehicles = [...vehicles];
    newVehicles[index][name] = value;
    setVehicles(newVehicles);
  };

  const addCar = () => {
    if (vehicles.length < maxVehicles) {
      setVehicles([
        ...vehicles,
        { make: '', model: '', color: '', regNo: '' },
      ]);
    }
  };

  const removeCar = (index) => {
    setVehicles(vehicles.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Filter out forms that are completely empty (all fields empty)
    const filledVehicles = vehicles.filter(
      (v) => v.make || v.model || v.color || v.regNo
    );
    onNext({ vehicles: filledVehicles });
  };

  return (
    <div className="bg-[#fdf8f2] rounded-lg shadow-md p-6 w-full md:w-2/3 h-max">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Vehicle Details</h2>
        <button
          type="button"
          onClick={addCar}
          disabled={vehicles.length >= maxVehicles}
          className={`text-blue-600 font-semibold hover:underline ${
            vehicles.length >= maxVehicles ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          Add New Car
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <AnimatePresence>
          {vehicles.map((vehicle, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="border p-4 rounded-lg space-y-4 relative"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-700">Car {index + 1}</h3>
                {vehicles.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCar(index)}
                    className="text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Make</label>
                  <input
                    type="text"
                    name="make"
                    value={vehicle.make}
                    onChange={(e) => handleChange(index, e)}
                    className="text-gray-600 mt-1 py-2 block w-full border-gray-300 rounded-md shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Model</label>
                  <input
                    type="text"
                    name="model"
                    value={vehicle.model}
                    onChange={(e) => handleChange(index, e)}
                    className="text-gray-600 py-2 mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Color</label>
                  <input
                    type="text"
                    name="color"
                    value={vehicle.color}
                    onChange={(e) => handleChange(index, e)}
                    className="text-gray-600 py-2 mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Reg No</label>
                  <input
                    type="text"
                    name="regNo"
                    value={vehicle.regNo}
                    onChange={(e) => handleChange(index, e)}
                    className="text-gray-600 py-2 mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

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
