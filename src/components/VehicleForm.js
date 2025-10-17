'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * VehicleForm (Option 1: Exact required vehicles)
 *
 * - Enforces exact number of vehicles from data.vehicle (requiredCount).
 * - No Remove button (user cannot remove forms below required count).
 * - Add button available only until forms length === requiredCount.
 * - All fields are required for every vehicle. Next button is clickable (option 2):
 *   if there are validation errors, show inline animated errors and scroll to first error.
 *
 * Props:
 * - onNext({ vehicles })
 * - onPrevious()
 * - data: { vehicle: "2", vehicleDetails: [...] }
 */

export default function VehicleForm({ onNext, onPrevious, data }) {
  // requiredCount — exact number of vehicles user selected in previous step
  const requiredCount = Number.parseInt(data?.vehicle ?? 1, 10) || 1;

  // initialize vehicles: if data.vehicleDetails provided, load them and pad/truncate to requiredCount
  const makeEmpty = () => ({ make: '', model: '', color: '', regNo: '', errors: {} });

  const buildInitialVehicles = () => {
    const provided = Array.isArray(data?.vehicleDetails) ? data.vehicleDetails : [];
    // map provided vehicles and ensure each has fields + errors
    const normalized = provided.map(v => ({
      make: v.make ?? '',
      model: v.model ?? '',
      color: v.color ?? '',
      regNo: v.regNo ?? '',
      errors: {},
    }));
    // if fewer than requiredCount, pad with empty objects
    while (normalized.length < requiredCount) normalized.push(makeEmpty());
    // if more than requiredCount, trim to requiredCount (Option 1 enforces exact)
    return normalized.slice(0, requiredCount);
  };

  const [vehicles, setVehicles] = useState(buildInitialVehicles);
  // track which vehicle index has first error for scrolling
  const firstErrorIndexRef = useRef(null);
  // refs to each vehicle card for scrolling into view
  const cardRefs = useRef([]);

  // ensure cardRefs has proper length
  useEffect(() => {
    cardRefs.current = cardRefs.current.slice(0, vehicles.length);
  }, [vehicles.length]);

  // If data changes (user steps back and returns), reload vehicles to required count
  useEffect(() => {
    setVehicles(buildInitialVehicles());
    // reset scroll index
    firstErrorIndexRef.current = null;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.vehicleDetails, data?.vehicle]);

  const handleChange = (index, e) => {
    const { name, value } = e.target;
    setVehicles(prev => {
      const next = prev.map((v, i) => (i === index ? { ...v, [name]: value, errors: { ...v.errors, [name]: '' } } : v));
      return next;
    });
  };

  const addCar = () => {
    // Only allow adding until we reach requiredCount
    if (vehicles.length >= requiredCount) return;
    setVehicles(prev => [...prev, makeEmpty()]);
  };

  // No remove function — Option 1 forbids removing below required count.
  // But if user supplied more in data.vehicleDetails, we trimmed earlier.

  const validateAll = () => {
    let isValid = true;
    let firstErrorIndex = null;

    const validated = vehicles.map((v, idx) => {
      const errors = {};
      if (!v.make || !v.make.trim()) {
        errors.make = 'Make is required';
        if (firstErrorIndex === null) firstErrorIndex = idx;
      }
      if (!v.model || !v.model.trim()) {
        errors.model = 'Model is required';
        if (firstErrorIndex === null) firstErrorIndex = idx;
      }
      if (!v.color || !v.color.trim()) {
        errors.color = 'Color is required';
        if (firstErrorIndex === null) firstErrorIndex = idx;
      }
      if (!v.regNo || !v.regNo.trim()) {
        errors.regNo = 'Reg. No is required';
        if (firstErrorIndex === null) firstErrorIndex = idx;
      }
      if (Object.keys(errors).length > 0) isValid = false;
      return { ...v, errors };
    });

    setVehicles(validated);
    firstErrorIndexRef.current = firstErrorIndex;
    return isValid;
  };

  // Scroll to first error card when validation fails
  useEffect(() => {
    const idx = firstErrorIndexRef.current;
    if (idx !== null && typeof idx === 'number') {
      const el = cardRefs.current[idx];
      if (el && el.scrollIntoView) {
        // smooth scroll and slight offset
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      // reset after scrolling once
      firstErrorIndexRef.current = null;
    }
  }, [vehicles]); // triggers after setVehicles with errors

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate all vehicles (exact count enforced)
    const ok = validateAll();

    if (!ok) {
      // Do not proceed; errors are visible inline
      return;
    }

    // Clean vehicles (remove errors) and pass to onNext
    const clean = vehicles.map(({ errors, ...rest }) => rest);
    onNext({ vehicles: clean });
  };

  return (
    <div className="bg-[#fdf8f2] rounded-lg shadow-md p-6 w-full md:w-2/3 h-max mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Vehicle Details</h2>
        <div className="flex items-center gap-3">
          <p className="text-sm text-gray-600">Required: <span className="font-medium text-gray-800">{requiredCount}</span></p>
          <button
            type="button"
            onClick={addCar}
            disabled={vehicles.length >= requiredCount}
            className={`text-blue-600 font-semibold px-3 py-1 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-200 ${
              vehicles.length >= requiredCount ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-50'
            }`}
            aria-disabled={vehicles.length >= requiredCount}
          >
            Add Car
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <AnimatePresence initial={false}>
          {vehicles.map((vehicle, index) => (
            <motion.div
              key={index}
              ref={el => (cardRefs.current[index] = el)}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.22 }}
              className="border p-4 rounded-lg space-y-4 relative bg-[#fdf8f2]"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-700">Car {index + 1}</h3>
                {/* No Remove button for Option 1 */}
                <span className="text-sm text-gray-500">Required</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Make */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Make*</label>
                  <input
                    type="text"
                    name="make"
                    value={vehicle.make}
                    onChange={(e) => handleChange(index, e)}
                    className={`text-gray-700 mt-1 py-2 block w-full border rounded-md shadow-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-colors ${
                      vehicle.errors.make ? 'border-red-500' : 'border-gray-300'
                    }`}
                    aria-invalid={!!vehicle.errors.make}
                    aria-describedby={vehicle.errors.make ? `make-error-${index}` : undefined}
                  />
                  <AnimatePresence>
                    {vehicle.errors.make && (
                      <motion.p
                        id={`make-error-${index}`}
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.18 }}
                        className="text-red-500 text-xs mt-1"
                      >
                        {vehicle.errors.make}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Model */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Model*</label>
                  <input
                    type="text"
                    name="model"
                    value={vehicle.model}
                    onChange={(e) => handleChange(index, e)}
                    className={`text-gray-700 mt-1 py-2 block w-full border rounded-md shadow-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-colors ${
                      vehicle.errors.model ? 'border-red-500' : 'border-gray-300'
                    }`}
                    aria-invalid={!!vehicle.errors.model}
                    aria-describedby={vehicle.errors.model ? `model-error-${index}` : undefined}
                  />
                  <AnimatePresence>
                    {vehicle.errors.model && (
                      <motion.p
                        id={`model-error-${index}`}
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.18 }}
                        className="text-red-500 text-xs mt-1"
                      >
                        {vehicle.errors.model}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Color*</label>
                  <input
                    type="text"
                    name="color"
                    value={vehicle.color}
                    onChange={(e) => handleChange(index, e)}
                    className={`text-gray-700 mt-1 py-2 block w-full border rounded-md shadow-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-colors ${
                      vehicle.errors.color ? 'border-red-500' : 'border-gray-300'
                    }`}
                    aria-invalid={!!vehicle.errors.color}
                    aria-describedby={vehicle.errors.color ? `color-error-${index}` : undefined}
                  />
                  <AnimatePresence>
                    {vehicle.errors.color && (
                      <motion.p
                        id={`color-error-${index}`}
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.18 }}
                        className="text-red-500 text-xs mt-1"
                      >
                        {vehicle.errors.color}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Reg No */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Reg No*</label>
                  <input
                    type="text"
                    name="regNo"
                    value={vehicle.regNo}
                    onChange={(e) => handleChange(index, e)}
                    className={`text-gray-700 mt-1 py-2 block w-full border rounded-md shadow-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-colors ${
                      vehicle.errors.regNo ? 'border-red-500' : 'border-gray-300'
                    }`}
                    aria-invalid={!!vehicle.errors.regNo}
                    aria-describedby={vehicle.errors.regNo ? `reg-error-${index}` : undefined}
                  />
                  <AnimatePresence>
                    {vehicle.errors.regNo && (
                      <motion.p
                        id={`reg-error-${index}`}
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.18 }}
                        className="text-red-500 text-xs mt-1"
                      >
                        {vehicle.errors.regNo}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        <div className="flex justify-between mt-6 items-center">
          <button
            type="button"
            onClick={onPrevious}
            className="bg-gray-200 text-gray-800 font-semibold py-2 px-6 rounded-lg hover:bg-gray-300 transition-colors"
          >
            ← Previous
          </button>

          {/* Option 2 chosen: Next clickable, shows errors if any */}
          <button
            type="submit"
            className="bg-blue-800 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-900 transition-colors"
          >
            Next →
          </button>
        </div>
      </form>
    </div>
  );
}
