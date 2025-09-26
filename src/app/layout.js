import Footer from "@/components/Footer";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/context/AuthContext";

export const metadata = {
  title: "Parking App",
  description: "Find available parking spots near your airport",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* Razorpay script */}
        <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
      
      <body className="bg-[#fdf8f2]">
        <AuthProvider>
        <Navbar />
        {children}
        <Footer/>
        </AuthProvider>
      </body>
      
    </html>
  );
}
