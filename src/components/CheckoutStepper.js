"use client";
import { User, Plane, Car, CheckCircle } from "lucide-react";
import React from "react";
export default function CheckoutStepper({ currentStep }) {
  const steps = [
    { id: 1, icon: <User />, label: "Contact Details" },
    { id: 2, icon: <Plane />, label: "Flight Details" },
    { id: 3, icon: <Car />, label: "Vehicle Details" },
    { id: 4, icon: <CheckCircle />, label: "Payment" },
  ];

  return (
    <div className="flex justify-center items-center py-6 w-4/5 md:w-3/5 mx-auto">
      {steps.map((step, i) => (
        <React.Fragment key={step.id}>
          <div className="flex flex-col items-center">
            <div className={`w-12 h-12 flex items-center justify-center rounded-full border-2 transition-colors duration-300
              ${currentStep === step.id ? 'border-blue-900 text-blue-900' :
                currentStep > step.id ? 'bg-blue-900 border-blue-900 text-white' :
                'border-gray-300 text-gray-500'}`}>
              {step.icon}
            </div>
            <p className={`text-sm mt-2 transition-colors duration-300 ${currentStep === step.id ? 'text-blue-900 font-semibold' : 'text-gray-700'}`}>
              {step.label}
            </p>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-grow h-0.5 mx-2 transition-colors duration-300
              ${currentStep > step.id ? 'bg-blue-900' : 'bg-gray-300'}`}></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}