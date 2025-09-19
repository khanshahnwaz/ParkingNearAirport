"use client";

import { useState } from "react";
import { ChevronDown, Car, Shield, CreditCard, Clock } from "lucide-react";

export default function FAQPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("All Questions");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    "All Questions",
    "Booking",
    "Services",
    "Security",
    "Payment",
  ];

  const faqs = [
    {
      category: "Booking",
      question: "How do I book airport parking?",
      answer:
        "You can easily book airport parking through our website by selecting your airport, dates, and preferred parking type, then completing payment online.",
      icon: <Car className="w-5 h-5 text-blue-900" />,
    },
    {
      category: "Services",
      question: "What is Meet and Greet parking?",
      answer:
        "Meet and Greet parking allows you to drive directly to the terminal, where a professional driver meets you, takes your car, and parks it securely while you travel.",
      icon: <Clock className="w-5 h-5 text-blue-900" />,
    },
    {
      category: "Security",
      question: "How secure is my vehicle during parking?",
      answer:
        "All our parking partners provide 24/7 security monitoring, gated entry, and CCTV surveillance to ensure your vehicle remains safe.",
      icon: <Shield className="w-5 h-5 text-blue-900" />,
    },
    {
      category: "Payment",
      question: "What payment methods do you accept?",
      answer:
        "We accept major credit cards, debit cards, and secure online payment gateways for quick and hassle-free transactions.",
      icon: <CreditCard className="w-5 h-5 text-blue-900" />,
    },
  ];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory =
      selectedCategory === "All Questions" ||
      faq.category === selectedCategory;
    const matchesSearch = faq.question
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#fdf8f2]">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-[#001a4d] to-blue-900 text-white py-16 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center">
              <span className="text-2xl">?</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-2">Frequently Asked Questions</h1>
          <p className="text-lg text-blue-200">
            Find answers to common questions about our airport parking services
          </p>
        </div>
      </div>

      {/* FAQ Content */}
      <div className="max-w-4xl mx-auto p-6 text-gray-600">
        {/* Search */}
        <div className="bg-white shadow rounded-xl p-4 mb-6">
          <input
            type="text"
            placeholder="Search for questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-3 mb-6 text-gray-600">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                selectedCategory === category
                  ? "bg-blue-800 text-white"
                  : "bg-gray-100 hover:bg-gray-200 "
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {filteredFaqs.map((faq, index) => (
            <div
              key={index}
              className=" border rounded-lg shadow-sm overflow-hidden "
            >
              <button
                onClick={() =>
                  setActiveIndex(activeIndex === index ? null : index)
                }
                className="w-full flex justify-between items-center p-4 text-left"
              >
                <div className="flex items-center gap-3">
                  {faq.icon}
                  <span className="font-medium">{faq.question}</span>
                </div>
                <ChevronDown
                  className={`w-5 h-5 transform transition-transform ${
                    activeIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              {activeIndex === index && (
                <div className="px-12 pb-4 text-gray-600">{faq.answer}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
