// components/HowItWorks.js
export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Search & Compare",
      description:
        "Enter your airport and travel dates to compare all available parking options.",
    },
    {
      number: "02",
      title: "Book Securely",
      description:
        "Choose your preferred parking option and complete your booking in minutes.",
    },
    {
      number: "03",
      title: "Park & Go",
      description:
        "Follow the instructions in your confirmation email for a hassle-free parking experience.",
    },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">How It Works</h2>
        <p className="text-gray-600 mb-12">
          Finding and booking airport parking has never been easier.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step) => (
            <div
              key={step.number}
              className="relative bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
            >
              <div className="absolute -top-4 left-6 w-10 h-10 flex items-center justify-center bg-blue-900 text-white rounded-full font-bold">
                {step.number}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mt-6">{step.title}</h3>
              <p className="text-gray-600 mt-2">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-center items-center py-12 px-4">
      <div className="bg-gradient-to-r from-blue-900 to-white text-white rounded-2xl shadow-lg p-10 max-w-4xl w-full">
        <h2 className="text-3xl font-bold mb-4">
          Ready to Find Your Perfect Parking Spot?
        </h2>
        <p className="text-lg mb-6">
          Join <span className="font-semibold">thousands</span> of happy travelers who have saved time and money on airport parking.
        </p>
        <div className="flex items-center space-x-4">
          <button className="bg-white text-blue-700 px-5 py-2 rounded-lg font-semibold shadow hover:bg-gray-100 transition">
            Compare Prices Now →
          </button>
          <button className="bg-white/30 text-white px-5 py-2 rounded-lg font-semibold shadow cursor-not-allowed">
            Learn More
          </button>
        </div>
      </div>
    </div>
    </section>
  );
}
