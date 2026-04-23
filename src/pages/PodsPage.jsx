import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { IoChevronForward } from "react-icons/io5";
import { LiaShippingFastSolid } from "react-icons/lia";
import { BiSupport } from "react-icons/bi";
import { HiOutlineRefresh } from "react-icons/hi";
import { ClientTestimonials } from "../components/home";
import { categoryAPI, productAPI } from "../services/api";
import { createSlug } from "../utils/helpers";

const features = [
  { icon: LiaShippingFastSolid, text: "Free Shipping" },
  { icon: HiOutlineRefresh, text: "Easy Returns" },
  { icon: BiSupport, text: "24/7 Support" },
];

const formatPrice = (price) => `Rs.${price?.toLocaleString() || 0} PKR`;

const PodsHero = ({ heroProduct }) => {
  const product = heroProduct || {
    name: "OXVA XLIM PRO",
    price: "Rs.6,999.00 PKR",
    image: "/pod.png",
    id: null,
  };

  return (
    <section className="flex flex-col">
      {/* Levitate Animation */}
      <style>
        {`
          @keyframes levitate {
            0%, 100% {
              transform: translateY(0) rotate(-6deg);
            }
            50% {
              transform: translateY(-15px) rotate(-6deg);
            }
          }
          .animate-levitate {
            animation: levitate 3s ease-in-out infinite;
          }
        `}
      </style>

      {/* Mobile Layout */}
      <div className="lg:hidden bg-white flex flex-col">
        {/* Hero Content */}
        <div className="flex-1 px-5 pt-6">
          {/* Title - Left aligned */}
          <div className="mb-4">
            <h2 className="text-2xl font-light italic text-gray-500">
              YOUR NEXT
            </h2>
            <h1 className="text-xl font-bold text-gray-900 mt-1">
              PERFECT HIT STARTS HERE
            </h1>
          </div>

          {/* Product Image - Rotated and Levitating */}
          <div className="flex justify-center mb-4">
            <img
              src={product.image}
              alt={product.name}
              className="w-full max-w-[280px] object-contain animate-levitate"
            />
          </div>

          {/* Product Info Row */}
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-semibold text-gray-900">
              {product.name}
            </h3>
            <p className="text-sm font-semibold text-gray-900">
              {product.price}
            </p>
          </div>

          {/* Shop Now Button */}
          <Link
            to={product.id ? `/product/${product.id}` : "/pods/all"}
            className="inline-flex items-center gap-1 bg-gray-900 text-white text-sm px-5 py-2.5 rounded-sm"
          >
            Shop Now
            <IoChevronForward size={14} />
          </Link>
        </div>

        {/* Features Bar - Mobile */}
        <div className="border-t border-gray-200 py-4 px-4 mt-3">
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
                <h2 className="text-4xl xl:text-5xl font-light italic text-gray-500">
                  YOUR NEXT
                </h2>
                <h1 className="text-4xl xl:text-5xl font-bold text-gray-900 mt-1">
                  PERFECT HIT STARTS HERE
                </h1>
              </div>

              <div className="pt-16">
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  {product.name}
                </h3>
                <p className="text-xl font-medium text-gray-700 mb-4">
                  {product.price}
                </p>
                <Link
                  to={product.id ? `/product/${product.id}` : "/pods/all"}
                  className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-sm text-sm font-medium transition-colors"
                >
                  Shop Now
                  <IoChevronForward size={16} />
                </Link>
              </div>
            </div>

            {/* Right Content - Product Image - Rotated and Levitating */}
            <div className="flex-1 flex flex-col items-center">
              <img
                src={product.image}
                alt={product.name}
                className="w-full max-w-md object-contain animate-levitate"
              />
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

const TrendingVapes = ({ products, loading }) => {
  return (
    <section className="bg-white py-6 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 lg:px-12">
        {/* Header */}
        <h2 className="text-lg lg:text-2xl font-bold text-gray-900 mb-4 lg:mb-6">
          Trending Vapes
        </h2>

        {/* Products Grid - 2 columns on mobile, 4 on desktop */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-lg aspect-square" />
                <div className="mt-2 h-4 bg-gray-200 rounded" />
                <div className="mt-1 h-3 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
            {products.map((product) => (
              <Link
                key={product._id}
                to={`/product/${createSlug(product.product_name)}`}
                className="group"
              >
                <div className="bg-gray-100 rounded-lg aspect-square flex items-center justify-center overflow-hidden p-4">
                  <img
                    src={product.product_images?.[0] || "/pod.png"}
                    alt={product.product_name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                  />
                </div>
                <p className="mt-2 text-xs lg:text-sm font-medium text-gray-900 line-clamp-1">
                  {product.product_name}
                </p>
                <p className="text-[10px] lg:text-xs text-gray-500">
                  {formatPrice(product.product_discounted_price)}
                </p>
              </Link>
            ))}
          </div>
        )}

        {/* View All Button */}
        <div className="flex justify-center mt-6">
          <Link
            to="/pods/all"
            className="text-sm text-orange-500 font-medium hover:text-orange-600 transition-colors"
          >
            View all
          </Link>
        </div>
      </div>
    </section>
  );
};

const PodsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      // Use string category ID directly
      const data = await productAPI.getByCategory("pods-vape");
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching pods:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const heroProduct = products[0]
    ? {
        id: products[0]._id,
        name: products[0].product_name,
        price: formatPrice(products[0].product_discounted_price),
        image: products[0].product_images?.[0] || "/pod.png",
      }
    : null;

  return (
    <div className="min-h-screen bg-white">
      <PodsHero heroProduct={heroProduct} />
      <TrendingVapes products={products} loading={loading} />
      <ClientTestimonials />
    </div>
  );
};

export default PodsPage;
