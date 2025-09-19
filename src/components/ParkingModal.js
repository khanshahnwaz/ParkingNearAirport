// components/ParkingModal.jsx
"use client";
import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";

export default function ParkingModal({ data, onClose }) {
  const [activeTab, setActiveTab] = useState("overview");
  const modalRef = useRef(null);

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "dropoff", label: "Drop-off Procedure" },
    { id: "pickup", label: "Pick-up Procedure" },
    { id: "terms", label: "Terms & Conditions" },
    { id: "reviews", label: "Reviews" },
  ];

  // Effect to handle clicks outside the modal
  useEffect(() => {
    function handleOutsideClick(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    }
    
    // Add event listener to the document body
    document.addEventListener("mousedown", handleOutsideClick);
    
    // Cleanup the event listener on component unmount
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [onClose]);

  return (
    <>
      {/* Overlay - now just a visual backdrop */}
      <div className="fixed inset-0 bg-black/50 z-50"></div>

      {/* Modal - The main container for the modal, handling positioning */}
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div 
          ref={modalRef}
          className="bg-white rounded-lg shadow-lg w-full md:w-[60vw]  h-[70vh] md:h-[60vh] flex relative"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          >
            <X size={22} />
          </button>

          {/* Sidebar */}
          <div className="w-1/4 border-r p-4 space-y-2 bg-gray-50 rounded-l-lg">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`block w-full text-left px-3 py-2 rounded-md transition-colors duration-200 ${
                  activeTab === tab.id
                    ? "bg-yellow-200 font-medium text-blue-900"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Price & Title */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{data.name}</h2>
              <span className="text-2xl font-bold text-blue-900">
                £{data.price}
              </span>
            </div>

            {activeTab === "overview" && (
              <div>
                <h3 className="font-semibold mb-2">{data.name}</h3>
                <ul className="space-y-2 mb-4">
                  {data.highlights?.map((h, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="bg-yellow-400 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                        {i + 1}
                      </span>
                      <span
                        className={i === 0 ? "font-semibold text-blue-900" : ""}
                      >
                        {h}
                      </span>
                    </li>
                  ))}
                </ul>

                <h4 className="font-semibold mb-2">Features</h4>
                <div className="grid grid-cols-2 gap-2">
                  {data.features?.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className="text-yellow-500">✔</span>
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "dropoff" && (
              <p className="text-gray-700">{data.dropoff || "Info not provided"}</p>
            )}

            {activeTab === "pickup" && (
              <p className="text-gray-700">{data.pickup || "Info not provided"}</p>
            )}

            {activeTab === "terms" && (
              <p className="text-gray-700">{data.terms || "Info not provided"}</p>
            )}

            {activeTab === "reviews" && (
              <p className="text-gray-700">{data.reviews || "No reviews yet."}</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}