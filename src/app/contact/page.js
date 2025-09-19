import React from 'react';

const GetInTouch = () => {
  return (
    <div className="bg-gray-100 min-h-screen items-center justify-center">
        <div className="bg-gradient-to-b from-[#001a4d] to-blue-900 text-white py-16 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center">
              <span className="text-2xl">?</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-2">Contact Us</h1>
          <p className="text-lg text-blue-200">
            We are here to help you with your parking needs
          </p>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-lg flex max-w-6xl w-full mx-auto">
        {/* Left Side: Form */}
        <div className="p-8 w-full lg:w-1/2">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Get in Touch</h2>
          <p className="text-gray-600 mb-6">
            Have questions about our services? Fill out the form below and we'll get back to you as soon as possible.
          </p>
          <form className="space-y-4">
            <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
              <div className="flex-1">
                <label htmlFor="your-name" className="block text-gray-700">Your Name</label>
                <input
                  type="text"
                  id="your-name"
                  placeholder="John Doe"
                  className="mt-1 block w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="email" className="block text-gray-700">Email Address</label>
                <input
                  type="email"
                  id="email"
                  placeholder="john@example.com"
                  className="mt-1 block w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label htmlFor="subject" className="block text-gray-700">Subject</label>
              <input
                type="text"
                id="subject"
                placeholder="How can we help you?"
                className="mt-1 block w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-gray-700">Message</label>
              <textarea
                id="message"
                rows="4"
                placeholder="Your message here..."
                className="mt-1 block w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-blue-900 text-white py-3 px-8 rounded-lg font-semibold shadow-md hover:bg-blue-800 transition duration-300"
              >
                Send Message
              </button>
            </div>
          </form>
        </div>

        {/* Right Side: Contact Details & Business Hours */}
        <div className="bg-gray-50 p-8 w-full lg:w-1/2 rounded-r-lg">
          <div className="space-y-8">
            {/* Phone */}
            <div className="bg-white rounded-xl p-6 hover:shadow-2xl flex items-start space-x-4">
              <div className="bg-blue-100 p-3 rounded-full text-blue-900">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Phone</h3>
                <p className="text-gray-600">033 0133 1513</p>
                <p className="text-sm text-gray-500">Monday to Friday, 9am to 5pm</p>
              </div>
            </div>

            {/* Email */}
            <div className="bg-white rounded-lg p-6 shadow-sm flex items-start space-x-4">
              <div className="bg-blue-100 p-3 rounded-full text-blue-900">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Email</h3>
                <p className="text-gray-600">info@compareparking4me.co.uk</p>
                <p className="text-sm text-gray-500">We'll respond as soon as possible</p>
              </div>
            </div>

            {/* Address */}
            <div className="bg-white rounded-lg p-6 shadow-sm flex items-start space-x-4">
              <div className="bg-blue-100 p-3 rounded-full text-blue-900">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Address</h3>
                <p className="text-gray-600">Bartle House, 9 Oxford Court, Manchester England, M2 3WQ</p>
                <a href="#" className="text-blue-500 text-sm hover:underline">Visit our office location</a>
              </div>
            </div>

            {/* Business Hours */}
            <div className="bg-blue-900 text-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center space-x-4 mb-4">
                <div className="bg-blue-100 p-3 rounded-full text-blue-900">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-300">Business Hours</h3>
              </div>
              <ul className="text-gray-200">
                <li className="flex justify-between py-1 border-b border-gray-200">
                  <span>Monday - Friday:</span>
                  <span>9:00 AM - 5:00 PM</span>
                </li>
                <li className="flex justify-between py-1 border-b border-gray-200">
                  <span>Saturday:</span>
                  <span>10:00 AM - 2:00 PM</span>
                </li>
                <li className="flex justify-between py-1">
                  <span>Sunday:</span>
                  <span>Closed</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GetInTouch;