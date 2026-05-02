import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { IoChevronForward } from "react-icons/io5";
import { LiaShippingFastSolid } from "react-icons/lia";
import { BiSupport } from "react-icons/bi";
import { HiOutlineRefresh } from "react-icons/hi";
import { ClientTestimonials } from "../components/home";
import SectionLoader from "../components/ui/SectionLoader";
import { categoryAPI, productAPI } from "../services/api";
import { createSlug } from "../utils/helpers";

const features = [
  { icon: LiaShippingFastSolid, text: "Free Shipping" },
  { icon: HiOutlineRefresh, text: "Easy Returns" },
  { icon: BiSupport, text: "24/7 Support" },
];

const defaultWatches = [
  {
    id: 1,
    name: "Velocity X Chrono",
    price: "Rs.6,999.00 PKR",
    image: "/watchbg1.png",
  },
  {
    id: 2,
    name: "Classic Elegance",
    price: "Rs.8,499.00 PKR",
    image: "/watchbg2.png",
  },
  {
    id: 3,
    name: "Sport Pro Series",
    price: "Rs.5,999.00 PKR",
    image: "/watchbg3.png",
  },
];

const formatPrice = (price) => `Rs.${price?.toLocaleString() || 0} PKR`;

const WatchesHero = ({ heroProducts }) => {
  const watches =
    heroProducts.length >= 3
      ? heroProducts.slice(0, 3).map((p, i) => ({
          id: p._id,
          name: p.product_name,
          slug: createSlug(p.product_name),
          price: formatPrice(p.product_discounted_price),
          image:
            p.product_images?.[0] ||
            defaultWatches[i]?.image ||
            "/watchbg1.png",
        }))
      : defaultWatches;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % watches.length);
        setIsAnimating(false);
      }, 300);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const currentWatch = watches[currentIndex];

  const handleDotClick = (index) => {
    if (index !== currentIndex) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex(index);
        setIsAnimating(false);
      }, 300);
    }
  };

  return (
    <section className="flex flex-col">
      {/* Levitate Animation */}
      <style>{`
        @keyframes levitate {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        .animate-levitate-watch {
          animation: levitate 3s ease-in-out infinite;
        }
      `}</style>

      {/* Mobile Layout */}
      <div className="lg:hidden bg-white flex flex-col">
        <div className="flex-1 px-5 pt-6">
          <div className="mb-4">
            <h2 className="text-2xl font-light italic text-gray-500">
              YOUR NEXT
            </h2>
            <h1 className="text-xl font-bold text-gray-900 mt-1">
              ICONIC LOOK STARTS HERE
            </h1>
          </div>

          <div className="flex justify-center mb-4">
            <img
              src={currentWatch.image}
              alt={currentWatch.name}
              className={`w-full max-w-[280px] object-contain transition-opacity duration-300 animate-levitate-watch ${
                isAnimating ? "opacity-0" : "opacity-100"
              }`}
            />
          </div>

          <div className="flex items-center justify-between mb-2">
            <h3 className={`text-base font-semibold text-gray-900 transition-opacity duration-300 ${isAnimating ? "opacity-0" : "opacity-100"}`}>
              {currentWatch.name}
            </h3>
            <p className={`text-sm font-semibold text-gray-900 transition-opacity duration-300 ${isAnimating ? "opacity-0" : "opacity-100"}`}>
              {currentWatch.price}
            </p>
          </div>

          {/* Dot indicators */}
          <div className="flex gap-2 mb-3">
            {watches.map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`h-2 rounded-full transition-all duration-300 ${index === currentIndex ? "bg-gray-900 w-5" : "bg-gray-300 w-2"}`}
              />
            ))}
          </div>

          <Link
            to={`/product/${currentWatch.slug || currentWatch.id}`}
            className="inline-flex items-center gap-1 bg-gray-900 text-white text-sm px-5 py-2.5 rounded-sm"
          >
            Shop Now
            <IoChevronForward size={14} />
          </Link>
        </div>

        <div className="border-t border-gray-200 py-4 px-4 mt-3">
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

      {/* Desktop Layout */}
      <div className="hidden lg:flex flex-col bg-white min-h-[calc(100vh-72px)]">
        <div className="flex-1 max-w-7xl mx-auto px-12 py-12 flex items-center w-full">
          <div className="flex flex-row items-center justify-between gap-8 w-full">
            <div className="flex-1 space-y-6">
              <div>
                <h2 className="text-4xl xl:text-5xl font-light italic text-gray-500">
                  YOUR NEXT
                </h2>
                <h1 className="text-4xl xl:text-5xl font-bold text-gray-900 mt-1">
                  ICONIC LOOK STARTS HERE
                </h1>
              </div>
              <div className="pt-16">
                <h3 className={`text-2xl font-semibold text-gray-900 mb-2 transition-opacity duration-300 ${isAnimating ? "opacity-0" : "opacity-100"}`}>
                  {currentWatch.name}
                </h3>
                <p className={`text-xl font-medium text-gray-700 mb-4 transition-opacity duration-300 ${isAnimating ? "opacity-0" : "opacity-100"}`}>
                  {currentWatch.price}
                </p>
                <Link
                  to={`/product/${currentWatch.slug || currentWatch.id}`}
                  className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-sm text-sm font-medium transition-colors"
                >
                  Shop Now
                  <IoChevronForward size={16} />
                </Link>
              </div>
              <div className="flex gap-3 pt-8">
                {watches.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleDotClick(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentIndex ? "bg-gray-900 w-8" : "bg-gray-300 hover:bg-gray-400"}`}
                  />
                ))}
              </div>
            </div>
            <div className="flex-1 flex flex-col items-center">
              <img
                src={currentWatch.image}
                alt={currentWatch.name}
                className={`w-full max-w-lg object-contain transition-all duration-500 animate-levitate-watch ${
                  isAnimating ? "opacity-0 scale-90" : "opacity-100 scale-100"
                }`}
              />
              <p
                className={`text-lg font-semibold text-gray-900 mt-4 transition-opacity duration-300 ${
                  isAnimating ? "opacity-0" : "opacity-100"
                }`}
              >
                {currentWatch.price}
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

// Watch Categories
const watchCategories = [
  {
    name: "LUXURY WATCHES",
    image: "/watch1.png",
    href: "/category/luxury-watches",
  },
  {
    name: "SPORT WATCHES",
    image: "/watch2.png",
    href: "/category/sport-watches",
  },
  {
    name: "CLASSIC WATCHES",
    image: "/watch3.png",
    href: "/category/classic-watches",
  },
  {
    name: "SMART WATCHES",
    image: "/watch4.png",
    href: "/category/smart-watches",
  },
];

// Watch Categories Section (like WinterJackets)
const WatchCategories = () => {
  return (
    <section className="bg-white py-8 lg:py-16">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-12">
        <h2 className="text-base sm:text-2xl lg:text-3xl font-bold text-gray-900 text-center mb-6 lg:mb-10">
          EXCLUSIVE WATCH COLLECTIONS
        </h2>

        <div className="flex flex-col gap-5 lg:grid lg:grid-cols-4 lg:gap-6">
          {watchCategories.map((category) => (
            <Link
              key={category.name}
              to={category.href}
              className="group flex flex-col items-center bg-white rounded-xl overflow-hidden shadow-sm lg:relative lg:bg-gray-100"
            >
              <div className="w-full aspect-[3/4] overflow-hidden rounded-xl relative">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-auto lg:bottom-4">
                  <span className="bg-white px-4 py-2 rounded-full text-xs font-medium text-gray-800 whitespace-nowrap shadow-sm border border-gray-200">
                    {category.name}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

// Top Watch Collections (like TopCollections)
const topWatchCollections = [
  {
    name: "CHRONOGRAPH",
    image: "/watch1.png",
    href: "/category/chronograph",
  },
  {
    name: "AUTOMATIC",
    image: "/watch2.png",
    href: "/category/automatic",
  },
  {
    name: "QUARTZ",
    image: "/watch3.png",
    href: "/category/quartz",
  },
  {
    name: "DIGITAL",
    image: "/watch4.png",
    href: "/category/digital",
  },
];

const TopWatchCollections = () => {
  return (
    <section className="bg-white py-12 lg:py-16">
      <div className="max-w-5xl mx-auto px-6 lg:px-12">
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 text-center mb-10">
          TOP WATCH TYPES
        </h2>

        <div className="grid grid-cols-2 gap-3 lg:gap-4">
          {topWatchCollections.map((collection) => (
            <Link
              key={collection.name}
              to={collection.href}
              className="group relative overflow-hidden rounded-lg bg-gray-100"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={collection.image}
                  alt={collection.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="absolute bottom-3 left-3">
                <span className="bg-white px-3 py-1.5 rounded-full text-[10px] lg:text-xs font-medium text-gray-800 shadow-sm">
                  {collection.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

const TrendingWatches = ({ products, loading }) => {
  const displayProducts = products.slice(0, 8);

  return (
    <section className="bg-gray-50 py-12 lg:py-16">
      <div className="max-w-6xl mx-auto px-6 lg:px-12">
        <h2 className="text-2xl lg:text-3xl font-medium text-gray-900 text-center mb-10">
          Trending Watches
        </h2>

        {loading ? (
          <SectionLoader
            count={8}
            columnsClass="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6"
            cardClass="aspect-[3/4]"
          />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
            {displayProducts.map((product) => (
              <Link
                key={product._id}
                to={`/product/${createSlug(product.product_name)}`}
                className="group"
              >
                <div className="aspect-[3/4] overflow-hidden rounded-lg bg-gray-100 mb-3">
                  <img
                    src={product.product_images?.[0] || "/watch1.png"}
                    alt={product.product_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div>
                  <h3 className="text-xs lg:text-sm font-medium text-gray-900 leading-tight mb-1">
                    {product.product_name}
                  </h3>
                  <p className="text-xs text-orange-500 font-medium">
                    {formatPrice(product.product_discounted_price)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="text-center mt-10">
          <Link
            to="/watches/all"
            className="inline-block border border-gray-300 rounded-full px-6 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            View All
          </Link>
        </div>
      </div>
    </section>
  );
};

const MoreTrendingWatches = ({ products, loading }) => {
  const displayProducts = products.slice(8, 16);

  if (displayProducts.length === 0 && !loading) return null;

  return (
    <section className="bg-white py-12 lg:py-16">
      <div className="max-w-6xl mx-auto px-6 lg:px-12">
        <h2 className="text-2xl lg:text-3xl font-medium text-gray-900 text-center mb-10">
          Premium Collection
        </h2>

        {loading ? (
          <SectionLoader
            count={8}
            columnsClass="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6"
            cardClass="aspect-[3/4]"
          />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
            {displayProducts.map((product) => (
              <Link
                key={product._id}
                to={`/product/${createSlug(product.product_name)}`}
                className="group"
              >
                <div className="aspect-[3/4] overflow-hidden rounded-lg bg-gray-100 mb-3">
                  <img
                    src={product.product_images?.[0] || "/watch1.png"}
                    alt={product.product_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div>
                  <h3 className="text-xs lg:text-sm font-medium text-gray-900 leading-tight mb-1">
                    {product.product_name}
                  </h3>
                  <p className="text-xs text-orange-500 font-medium">
                    {formatPrice(product.product_discounted_price)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="text-center mt-10">
          <Link
            to="/watches/all"
            className="inline-block border border-gray-300 rounded-full px-6 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            View All
          </Link>
        </div>
      </div>
    </section>
  );
};

const WatchesPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      // Use string category ID directly
      const data = await productAPI.getByCategory("watches");
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching watches:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <WatchesHero heroProducts={products} />

      {/* Watch Categories (like WinterJackets) */}
      <WatchCategories />

      {/* Top Watch Collections (like TopCollections) */}
      <TopWatchCollections />

      {/* Trending Watches (like TrendingStyles) */}
      <TrendingWatches products={products} loading={loading} />

      {/* More Trending Watches (like TrendingStyles2) */}
      <MoreTrendingWatches products={products} loading={loading} />

      {/* Client Testimonials */}
      <ClientTestimonials />
    </div>
  );
};

export default WatchesPage;
