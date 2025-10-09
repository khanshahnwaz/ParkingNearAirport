"use client"
import { useAuth } from "@/context/AuthContext";

export default function CTA() {
  const {grandDiscount}=useAuth();
  return (
    <section className="bg-[#fdf8f2] py-6">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="bg-[#0a1128] text-white rounded-lg text-center py-4 px-6 ">
          <span className="text-xl font-semibold">
  Book Now and get{" "}
  <span className="font-extrabold bg-gradient-to-r from-pink-600 via-red-600 to-yellow-600 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(255,0,0,0.9)] animate-pulse">
    {grandDiscount?grandDiscount+"% off":"Offer Coming Soon"}
  </span>
</span>

        </div>
      </div>
    </section>
  );
}
