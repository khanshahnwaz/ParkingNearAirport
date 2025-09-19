"use client";

import { FaCar, FaLock, FaClock, FaTag } from "react-icons/fa";

const features = [
  {
    icon: <FaCar size={30} className="text-blue-900" />,
    title: "Wide Selection",
    description: "Find parking spots near major airports with plenty of choices.",
  },
  {
    icon: <FaLock size={30} className="text-blue-900" />,
    title: "Secure Booking",
    description: "Your booking is protected with secure payment options.",
  },
  {
    icon: <FaClock size={30} className="text-blue-900" />,
    title: "Fast & Easy",
    description: "Book your parking in just a few clicks, hassle-free.",
  },
  {
    icon: <FaTag size={30} className="text-blue-900" />,
    title: "Best Price",
    description: "We guarantee the lowest prices for your parking needs.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">
          Why Choose Us
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-4">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl shadow-md p-6 text-center hover:shadow-lg transition"
            >
              <div className="flex justify-center mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
