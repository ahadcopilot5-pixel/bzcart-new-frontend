import { Link } from "react-router-dom";
import { IoChevronForward } from "react-icons/io5";
import { LiaShippingFastSolid } from "react-icons/lia";
import { BiSupport } from "react-icons/bi";
import { HiOutlineRefresh } from "react-icons/hi";

const features = [
  { icon: LiaShippingFastSolid, text: "Free Shipping" },
  { icon: HiOutlineRefresh, text: "Easy Returns" },
  { icon: BiSupport, text: "24/7 Support" },
];

const HeroSection = () => {
  return (
    <section className="flex flex-col">
      {/* Mobile Layout */}
      <div className="lg:hidden bg-white min-h-[calc(100vh-100px)] flex flex-col">
        {/* Hero Content */}
        <div className="flex-1 px-5 py-6">
          {/* Title - Left aligned */}
          <div className="mb-6">
            <h2 className="text-2xl font-light italic text-gray-800">
              YOUR NEXT
            </h2>
            <h1 className="text-xl font-bold text-gray-900 mt-1">
              GREAT LOOK STARTS HERE
            </h1>
          </div>

          {/* Product Image */}
          <div className="flex justify-center mb-6">
            <img
              src="/jacket.png"
              alt="Outdoor Jacket"
              className="w-full max-w-[280px] object-contain"
            />
          </div>

          {/* Product Info Row */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-gray-900">
              Outdoor Jacket
            </h3>
            <p className="text-sm font-semibold text-gray-900">
              Rs.6,999.00 PKR
            </p>
          </div>

          {/* Shop Now Button */}
          <Link
            to="/shop"
            className="inline-flex items-center gap-1 text-gray-700 text-sm border-b border-gray-400 pb-0.5"
          >
            Shop Now
            <IoChevronForward size={14} />
          </Link>
        </div>

        {/* Features Bar - Mobile */}
        <div className="border-t border-gray-200 py-4 px-4">
          <div className="flex items-center justify-between">
            {features.map((feature) => (
              <div key={feature.text} className="flex items-center gap-1.5">
                <feature.icon size={16} className="text-gray-600" />
                <span className="text-[10px] text-gray-600">
                  {feature.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex flex-col bg-white min-h-[calc(100vh-72px)]">
        <div className="flex-1 max-w-7xl mx-auto px-12 py-12 flex items-center w-full">
          <div className="flex flex-row items-center justify-between gap-8 w-full">
            {/* Left Content */}
            <div className="flex-1 space-y-6">
              <div>
                <h2 className="text-4xl xl:text-5xl font-light italic text-gray-800">
                  YOUR NEXT
                </h2>
                <h1 className="text-4xl xl:text-5xl font-bold text-gray-900 mt-1">
                  GREAT LOOK STARTS HERE
                </h1>
              </div>

              <div className="pt-16">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  Outdoor Jacket
                </h3>
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full text-sm font-medium transition-colors"
                >
                  Shop Now
                  <IoChevronForward size={16} />
                </Link>
              </div>
            </div>

            {/* Right Content - Product Image */}
            <div className="flex-1 flex flex-col items-center">
              <img
                src="/jacket.png"
                alt="Outdoor Jacket"
                className="w-full max-w-lg object-contain"
              />
              <p className="text-lg font-semibold text-gray-900 mt-4">
                Rs.6,999.00 PKR
              </p>
            </div>
          </div>
        </div>

        {/* Features Bar - Desktop */}
        <div className="border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-12 py-6">
            <div className="flex items-center justify-center gap-16">
              {features.map((feature) => (
                <div key={feature.text} className="flex items-center gap-2">
                  <feature.icon size={24} className="text-gray-600" />
                  <span className="text-sm text-gray-700">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
