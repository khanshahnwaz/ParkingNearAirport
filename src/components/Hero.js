import Image from "next/image";

export default function Hero() {
  return (
    <section className="bg-[#fdf8f2] py-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        
        {/* Left: Text */}
        <div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Airport Parking <span className="md:text-gray-400  text-gray-600">Made Simple</span>
          </h1>

          <p className="mt-4 text-gray-700 text-lg">
            Airport Car Parking Near You - Get lowest price airport car parking near you. 
            Parking spots available near Heathrow, Gatwick, Luton and all major airports. 
            Pick up and drop facility available.
          </p>

          {/* Features */}
          <div className="mt-6 flex flex-wrap gap-6 text-gray-700">
            <span className="flex items-center gap-2">
              ✅ <span>24/7 Support</span>
            </span>
            <span className="flex items-center gap-2">
              ✅ <span>Secure Booking</span>
            </span>
            <span className="flex items-center gap-2">
              ✅ <span>Best Price</span>
            </span>
          </div>
        </div>

        {/* Right: Illustration */}
        <div className=" justify-center md:justify-end hidden md:flex">
          <Image
            src="/illus.svg" // replace with your actual image in /public
            alt="Parking Illustration"
            width={400}
            height={300}
            className="w-full max-w-sm"
          />
        </div>
      </div>
    </section>
  );
}
