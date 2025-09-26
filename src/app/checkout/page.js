// checkout/page.js
"use client";

import { useState, Suspense } from "react";
import CheckoutStepper from "@/components/CheckoutStepper";
import BookingSummary from "@/components/BookingSummary";
import ContactForm from "@/components/ContactForm";
// ... import other components
import { useSearchParams } from "next/navigation";
import FlightForm from "@/components/FlightForm";
import VehicleForm from "@/components/VehicleForm";
import PaymentForm from "@/components/PaymentForm";
// A new component to handle the form logic and useSearchParams
function CheckoutForm({currentStep,setCurrentStep}) {
  const searchParams = useSearchParams();
  const bookingParam = searchParams.get('booking');
  let booking = {};

  try {
    if (bookingParam) {
      // Decode the URL-encoded string before parsing
      booking = JSON.parse(decodeURIComponent(bookingParam));
    }
  } catch (e) {
    console.error("Failed to parse booking data from URL", e);
    // You may want to redirect or show an error message to the user here
  }

  // Fallback to static data if no valid booking data is found in URL
  const defaultBooking = {
    name: "Parkway Solutions",
    location: "Gatwick Airport",
    country: "London, UK",
    type: "Meet & Greet",
    dropoff: "Thursday, 25 September 2025",
    pickup: "Friday, 26 September 2025",
    duration: 1,
    base: 60,
    promoCode: "SUMMERS",
    discount: 3.15,
    total: 56.85,
    cancellation:false
  };

  const finalBooking = Object.keys(booking).length > 0 ? booking : defaultBooking;

  const [formData, setFormData] = useState({});

  const handleNext = (stepData) => {
    setFormData(prev => ({ ...prev, ...stepData }));
    // console.log("form at second step ",formData)
    setCurrentStep(prev => prev + 1);
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };
  // console.log("form data at first step",formData)

  const renderStep = () => {
    // You will need to create and import these components
    // for the other steps (FlightForm, VehicleForm, PaymentForm).
    switch (currentStep) {
      case 1:
        return <ContactForm onNext={handleNext}data={formData} />;
      case 2:
        return <FlightForm onNext={handleNext} onPrevious={handlePrevious} />;
      case 3:
        return <VehicleForm onNext={handleNext} onPrevious={handlePrevious} />;
      case 4:
        return <PaymentForm bookingSummary={formData} total={finalBooking.total} onPrevious={handlePrevious} onCompleteBooking={() => {alert("Boking completed check console for data"),console.log('Booking completed',formData)}} />;
      default:
        return <ContactForm onNext={handleNext} />;
    }
  };

  return (
    <>
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row gap-8">
        {renderStep()}
        <BookingSummary booking={{ ...finalBooking, ...formData }} />
      </div>
    </>
  );
}

// The main export component, now responsible for the layout and Suspense boundary
export default function CheckoutPage() {
    const [currentStep, setCurrentStep] = useState(1);

  return (
    <div className="min-h-screen bg-[#fdf8f2]">
      {/* CheckoutStepper can remain here as it does not use client-side hooks */}
      <CheckoutStepper currentStep={currentStep}  />
      
      {/* Wrap the component that uses useSearchParams in Suspense */}
      <Suspense fallback={<div>Loading...</div>}>
        <CheckoutForm currentStep={currentStep} setCurrentStep={setCurrentStep} />
      </Suspense>
    </div>
  );
}