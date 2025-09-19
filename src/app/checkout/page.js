// checkout/page.js
"use client";
import CheckoutStepper from "@/components/CheckoutStepper";
import ContactForm from "@/components/ContactForm";
import BookingSummary from "@/components/BookingSummary";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const bookingParam = searchParams.get('booking');
  console.log(JSON.parse(bookingParam))
  let booking = {};

  try {
    if (bookingParam) {
      booking = JSON.parse(bookingParam);
    }
  } catch (e) {
    console.error("Failed to parse booking data from URL", e);
  }

  // Fallback to static data if no valid booking data is found in URL
  const defaultBooking = {
    name: "Parkway Solutions",
    location: "Gatwick Airport",
    country: "London, UK",
    type: "Meet & Greet",
    dropoff: "Thursday, 25 September 2025", // Hardcoded for this example
    pickup: "Friday, 26 September 2025",   // Hardcoded for this example
    duration: 1,                          // Hardcoded for this example
    base: 60,
    promoCode: "SUMMERS",
    discount: 3.15,
    total: 56.85,
  };

  const finalBooking = Object.keys(booking).length > 0 ? booking : defaultBooking;

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});

  const handleNext = (stepData) => {
    setFormData(prev => ({ ...prev, ...stepData }));
    setCurrentStep(prev => prev + 1);
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  const renderStep = () => {
    // You will need to create and import these components
    // for the other steps (FlightForm, VehicleForm, PaymentForm).
    switch (currentStep) {
      case 1:
        return <ContactForm onNext={handleNext} />;
      // case 2:
      //   return <FlightForm onNext={handleNext} onPrevious={handlePrevious} />;
      // case 3:
      //   return <VehicleForm onNext={handleNext} onPrevious={handlePrevious} />;
      // case 4:
      //   return <PaymentForm onPrevious={handlePrevious} onCompleteBooking={() => console.log('Booking completed')} />;
      default:
        return <ContactForm onNext={handleNext} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <CheckoutStepper currentStep={currentStep} />
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row gap-8">
        {renderStep()}
        <BookingSummary booking={{ ...finalBooking, ...formData }} />
      </div>
    </div>
  );
}