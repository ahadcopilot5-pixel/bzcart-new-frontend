import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { IoChevronForward, IoChevronBack } from "react-icons/io5";
import { FaInstagram, FaTwitter } from "react-icons/fa";
import { HiPaperAirplane } from "react-icons/hi";
import { LiaShippingFastSolid } from "react-icons/lia";
import { BiSupport } from "react-icons/bi";
import { HiOutlineRefresh } from "react-icons/hi";

const heroSlides = [
  {
    id: 1,
    image: "/jacket.png",
    title: "Outdoor Jacket",
  },
  {
    id: 2,
    image: "/jacket.png",
    title: "Premium Jacket",
  },
];

const features = [
  { icon: LiaShippingFastSolid, text: "Free Shipping" },
  { icon: HiOutlineRefresh, text: "Easy Returns" },
  { icon: BiSupport, text: "24/7 Support" },
];

const MensHeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + heroSlides.length) % heroSlides.length,
    );
  };

  // Auto-slide every 5 seconds
  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="flex flex-col">
      {/* Levitate Animation */}
      <style>{`
        @keyframes levitate {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        .animate-levitate-mens {
          animation: levitate 3s ease-in-out infinite;
        }
      `}</style>

      {/* Mobile Layout */}
      <div className="lg:hidden bg-white flex flex-col">
        <div className="px-5 py-6">
          <div className="mb-4">
            <h2 className="text-2xl font-light italic text-gray-500">
              YOUR NEXT
            </h2>
            <h1 className="text-xl font-bold text-gray-900 mt-1">
              GREAT LOOK STARTS HERE
            </h1>
          </div>

          <div className="flex justify-center mb-4">
            <img
              src="/jacket.png"
              alt="Outdoor Jacket"
              className="w-full max-w-[280px] object-contain animate-levitate-mens"
            />
          </div>

          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-semibold text-gray-900">Outdoor Jacket</h3>
            <p className="text-sm font-semibold text-gray-900">Rs.6,999.00 PKR</p>
          </div>

          <Link
            to="/mens-clothing"
            className="inline-flex items-center gap-1 bg-gray-900 text-white text-sm px-5 py-2.5 rounded-sm"
          >
            Shop Now
            <IoChevronForward size={14} />
          </Link>
        </div>

        <div className="border-t border-gray-200 py-4 px-4">
          <div className="flex items-center justify-between">
            {features.map((feature) => (
              <div key={feature.text} className="flex items-center gap-1.5">
                <feature.icon size={16} className="text-gray-600" />
                <span className="text-[10px] text-gray-600">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop Layout - New Design */}
      <div className="hidden lg:block relative w-full h-[calc(100vh-72px)] bg-white overflow-hidden">
        {/* Decorative Curved Lines */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Top right curve */}
          <path
            d="M1200 -100 Q1400 200 1100 400"
            stroke="#F97316"
            strokeWidth="1.5"
            strokeOpacity="0.3"
            fill="none"
          />
          {/* Bottom left curve */}
          <path
            d="M-100 600 Q200 400 100 800 Q50 900 200 950"
            stroke="#F97316"
            strokeWidth="1.5"
            strokeOpacity="0.4"
            fill="none"
          />
          {/* Middle decorative curve */}
          <path
            d="M300 700 Q400 600 350 800"
            stroke="#F97316"
            strokeWidth="1"
            strokeOpacity="0.3"
            fill="none"
          />
        </svg>

        <div className="relative h-full max-w-7xl mx-auto px-12 flex items-center">
          <div className="w-full flex flex-row items-center justify-between gap-4">
            {/* Left Content */}
            <div className="flex-1 z-10">
              {/* Outfit of the Day Label */}
              <p className="text-base text-gray-500 italic mb-2 tracking-wide">
                Outfit of the Day
              </p>

              {/* Main Heading */}
              <div className="mb-6">
                <h2 className="text-4xl lg:text-5xl xl:text-6xl font-light italic text-gray-500 leading-tight">
                  YOUR NEXT
                </h2>
                <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight">
                  GREAT LOOK STARTS HERE
                </h1>
              </div>

              {/* Description */}
              <p className="text-base text-gray-500 max-w-md mb-8 leading-relaxed">
                Discover premium men's fashion designed for everyday style and
                comfort.
              </p>

              {/* CTA Button */}
              <Link
                to="/mens-clothing"
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-8 py-3.5 rounded text-base font-medium transition-colors shadow-lg shadow-orange-500/30"
              >
                BUY NOW
                <IoChevronForward size={18} />
              </Link>

              {/* Social Icons */}
              <div className="flex items-center gap-4 mt-16">
                <a
                  href="#"
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-orange-500 transition-colors"
                >
                  <FaInstagram size={18} />
                </a>
                <a
                  href="#"
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-orange-500 transition-colors"
                >
                  <HiPaperAirplane size={18} className="rotate-45" />
                </a>
                <a
                  href="#"
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-orange-500 transition-colors"
                >
                  <FaTwitter size={18} />
                </a>
              </div>
            </div>

            {/* Right Content - Product Image with Circle */}
            <div className="flex-1 relative flex items-center justify-center">
              {/* Peach Circle Background */}
              <div className="absolute w-[420px] h-[420px] xl:w-[480px] xl:h-[480px] rounded-full bg-gradient-to-br from-orange-100 to-orange-200/80" />

              {/* Product Image */}
              <div className="relative z-10 w-[360px] xl:w-[400px]">
                <img
                  src={heroSlides[currentSlide].image}
                  alt={heroSlides[currentSlide].title}
                  className="w-full h-auto object-contain drop-shadow-2xl transition-opacity duration-500"
                />
              </div>

              {/* Navigation Arrows */}
              <button
                onClick={prevSlide}
                className="absolute left-0 lg:-left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow z-20 group"
                aria-label="Previous slide"
              >
                <IoChevronBack
                  size={20}
                  className="text-gray-600 group-hover:text-orange-500 transition-colors"
                />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-0 lg:-right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow z-20 group"
                aria-label="Next slide"
              >
                <IoChevronForward
                  size={20}
                  className="text-gray-600 group-hover:text-orange-500 transition-colors"
                />
              </button>
            </div>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentSlide
                  ? "w-6 bg-orange-500"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default MensHeroSection;
