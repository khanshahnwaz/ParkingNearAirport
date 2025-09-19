import Hero from "@/components/Hero";
import CTA from "@/components/CTA";
import SearchForm from "@/components/SearchForm";
import WhyChooseUs from "@/components/WhyChooseUs";
import HowItWorks from "@/components/HowItWorks";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Hero />
      <CTA />
      <SearchForm/>
      <WhyChooseUs/>
      <HowItWorks/>
    </main>
  );
}
