// components/ContactForm.jsx
'use client';

import { useState } from 'react';

export default function ContactForm({ onNext }) {
  const [formData, setFormData] = useState({
    title: 'Mr', firstName: '', lastName: '', email: '', contact: '', people: 1, cancellation: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    console.log("first step")
    e.preventDefault();
    // In a real app, you would validate the form data here
    onNext(formData);
  };

  return (
    <div className="bg-[#fdf8f2] rounded-lg shadow-md p-6 w-full md:w-2/3 h-max">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Contact Details</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <select name="title" value={formData.title} onChange={handleChange} className="text-gray-600 py-2 mt-1 block w-full border-gray-300 rounded-md shadow-sm">
              <option>Mr</option>
              <option>Mrs</option>
              <option>Ms</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">First Name*</label>
            <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required className="text-gray-600 py-2 mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Last Name*</label>
            <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required className="text-gray-600 py-2 mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email*</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required className="text-gray-600 py-2 mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Contact Number* (11 digits)</label>
            <input type="tel" name="contact" value={formData.contact} onChange={handleChange} required className="text-gray-600 py-2 mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">People*</label>
            <input type="number" name="people" value={formData.people} onChange={handleChange} required className="text-gray-600 py-2 mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
          </div>
        </div>
        <div className="flex justify-between items-center py-4 px-6 bg-blue-100 rounded-md">
          <label className="text-gray-700">Cancellation Coverage</label>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-semibold text-gray-700">£2.00</span>
            <input type="checkbox" name="cancellation" checked={formData.cancellation} onChange={handleChange} className="h-6 w-12 rounded-full appearance-none bg-gray-200 checked:bg-blue-600 transition duration-200 cursor-pointer relative after:absolute after:top-0.5 after:left-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-all after:duration-200 checked:after:left-[1.6rem]" />
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <button type="submit" className="bg-blue-800 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-900 transition-colors">
            Next →
          </button>
        </div>
      </form>
    </div>
  );
}