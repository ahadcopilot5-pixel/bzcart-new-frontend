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

const defaultShoes = [
  {
    id: 1,
    name: "JORDAN JUMPMAN 2021 PF",
    price: "Rs.6,999.00 PKR",
    image: "/shoes.png",
    colors: ["#D32F2F", "#212121", "#757575", "#E0E0E0"],
  },
  {
    id: 2,
    name: "NIKE AIR MAX 270",
    price: "Rs.8,499.00 PKR",
    image: "/shoes.png",
    colors: ["#1976D2", "#212121", "#FF5722", "#E0E0E0"],
  },
  {
    id: 3,
    name: "ADIDAS ULTRABOOST 22",
    price: "Rs.9,999.00 PKR",
    image: "/shoes.png",
    colors: ["#388E3C", "#212121", "#9C27B0", "#E0E0E0"],
  },
];

const formatPrice = (price) => `Rs.${price?.toLocaleString() || 0} PKR`;

const ShoesHero = ({ heroProducts }) => {
  const shoes =
    heroProducts.length >= 3
      ? heroProducts.slice(0, 3).map((p, i) => ({
          id: p._id,
          slug: createSlug(p.product_name),
          name: p.product_name,
          price: formatPrice(p.product_discounted_price),
          image:
            p.product_images?.[0] || defaultShoes[i]?.image || "/shoes.png",
          colors: defaultShoes[i]?.colors || [
            "#D32F2F",
            "#212121",
            "#757575",
            "#E0E0E0",
          ],
        }))
      : defaultShoes;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedColor, setSelectedColor] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % shoes.length);
        setSelectedColor(0);
        setIsAnimating(false);
      }, 300);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const currentShoe = shoes[currentIndex];

  const handleDotClick = (index) => {
    if (index !== currentIndex) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex(index);
        setSelectedColor(0);
        setIsAnimating(false);
      }, 300);
    }
  };

  return (
    <section className="flex flex-col">
      {/* Mobile Layout */}
      <div className="lg:hidden bg-white min-h-[calc(100vh-180px)] flex flex-col">
        {/* Hero Content */}
        <div className="flex-1 px-5 py-6">
          {/* Title - Left aligned */}
          <div className="mb-6">
            <h2 className="text-2xl font-light italic text-gray-800">
              YOUR NEXT
            </h2>
            <h1 className="text-xl font-bold text-gray-900 mt-1">
              PERFECT PAIR STARTS HERE
            </h1>
          </div>

          {/* Shoe Image with Color Options */}
          <div className="relative mb-6">
            {/* Shoe Image */}
            <div className="flex justify-center items-center h-[280px]">
              <img
                src={currentShoe.image}
                alt={currentShoe.name}
                className={`w-72 h-auto object-contain transition-all duration-300 -rotate-[15deg] ${
                  isAnimating ? "opacity-0 scale-95" : "opacity-100 scale-100"
                }`}
              />
            </div>

            {/* Color Options - Right side */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2">
              {currentShoe.colors.map((color, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedColor(index)}
                  className={`w-5 h-5 rounded-full border-2 transition-all ${
                    selectedColor === index
                      ? "border-gray-900 scale-110"
                      : "border-gray-300"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Product Info Row */}
          <div className="flex items-center justify-between mb-3">
            <h3
              className={`text-base font-semibold text-gray-900 transition-opacity duration-300 ${
                isAnimating ? "opacity-0" : "opacity-100"
              }`}
            >
              {currentShoe.name}
            </h3>
            <p
              className={`text-sm font-semibold text-gray-900 transition-opacity duration-300 ${
                isAnimating ? "opacity-0" : "opacity-100"
              }`}
            >
              {currentShoe.price}
            </p>
          </div>

          {/* Shop Now Button */}
          <Link
            to={`/product/${currentShoe.slug || currentShoe.id}`}
            className="inline-flex items-center gap-1 bg-gray-900 text-white text-sm px-5 py-2.5 rounded-sm"
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
                  PERFECT PAIR STARTS HERE
                </h1>
              </div>

              <div className="pt-16">
                <h3
                  className={`text-2xl font-semibold text-gray-900 mb-4 transition-opacity duration-300 ${
                    isAnimating ? "opacity-0" : "opacity-100"
                  }`}
                >
                  {currentShoe.name}
                </h3>
                <p
                  className={`text-xl font-medium text-gray-700 mb-4 transition-opacity duration-300 ${
                    isAnimating ? "opacity-0" : "opacity-100"
                  }`}
                >
                  {currentShoe.price}
                </p>
                <Link
                  to={`/product/${currentShoe.slug || currentShoe.id}`}
                  className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full text-sm font-medium transition-colors"
                >
                  Shop Now
                  <IoChevronForward size={16} />
                </Link>
              </div>

              {/* Color Options - Desktop */}
              <div className="flex gap-3 pt-4">
                {currentShoe.colors.map((color, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedColor(index)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      selectedColor === index
                        ? "border-gray-900 scale-110"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>

              {/* Dot Indicators - Desktop */}
              <div className="flex gap-3 pt-4">
                {shoes.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleDotClick(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? "bg-orange-500 w-8"
                        : "bg-gray-300 hover:bg-gray-400"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Right Content - Product Image */}
            <div className="flex-1 flex flex-col items-center relative">
              <img
                src={currentShoe.image}
                alt={currentShoe.name}
                className={`w-full max-w-xl object-contain transition-all duration-500 -rotate-[15deg] ${
                  isAnimating ? "opacity-0 scale-90" : "opacity-100 scale-100"
                }`}
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

// Shoe Categories
const shoeCategories = [
  {
    name: "RUNNING SHOES",
    image: "/shoes.png",
    href: "/category/running-shoes",
  },
  {
    name: "SNEAKERS",
    image: "/shoes.png",
    href: "/category/sneakers",
  },
  {
    name: "CASUAL SHOES",
    image: "/shoes.png",
    href: "/category/casual-shoes",
  },
  {
    name: "FORMAL SHOES",
    image: "/shoes.png",
    href: "/category/formal-shoes",
  },
];

const ShoeCategories = () => {
  return (
    <section className="bg-white py-8 lg:py-16">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-12">
        <h2 className="text-base sm:text-2xl lg:text-3xl font-bold text-gray-900 text-center mb-6 lg:mb-10">
          EXCLUSIVE SHOE COLLECTIONS
        </h2>

        <div className="flex flex-col gap-5 lg:grid lg:grid-cols-4 lg:gap-6">
          {shoeCategories.map((category) => (
            <Link
              key={category.name}
              to={category.href}
              className="group flex flex-col items-center bg-white rounded-xl overflow-hidden shadow-sm lg:relative lg:bg-gray-100"
            >
              <div className="w-full aspect-[3/4] overflow-hidden rounded-xl relative bg-gray-50">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
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

// Top Shoe Collections
const topShoeCollections = [
  {
    name: "BASKETBALL",
    image: "/shoes.png",
    href: "/category/basketball",
  },
  {
    name: "TRAINING",
    image: "/shoes.png",
    href: "/category/training",
  },
  {
    name: "LIFESTYLE",
    image: "/shoes.png",
    href: "/category/lifestyle",
  },
  {
    name: "OUTDOOR",
    image: "/shoes.png",
    href: "/category/outdoor",
  },
];

const TopShoeCollections = () => {
  return (
    <section className="bg-white py-12 lg:py-16">
      <div className="max-w-5xl mx-auto px-6 lg:px-12">
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 text-center mb-10">
          TOP SHOE TYPES
        </h2>

        <div className="grid grid-cols-2 gap-3 lg:gap-4">
          {topShoeCollections.map((collection) => (
            <Link
              key={collection.name}
              to={collection.href}
              className="group relative overflow-hidden rounded-lg bg-gray-100"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={collection.image}
                  alt={collection.name}
                  className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
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

const TrendingShoes = ({ products, loading }) => {
  const displayProducts = products.slice(0, 8);

  return (
    <section className="bg-gray-50 py-12 lg:py-16">
      <div className="max-w-6xl mx-auto px-6 lg:px-12">
        <h2 className="text-2xl lg:text-3xl font-medium text-gray-900 text-center mb-10">
          Trending Shoes
        </h2>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-gray-200 rounded-lg mb-3" />
                <div className="h-4 bg-gray-200 rounded mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
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
                    src={product.product_images?.[0] || "/shoes.png"}
                    alt={product.product_name}
                    className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
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
            to="/shoes/all"
            className="inline-block border border-gray-300 rounded-full px-6 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            View All
          </Link>
        </div>
      </div>
    </section>
  );
};

const MoreTrendingShoes = ({ products, loading }) => {
  const displayProducts = products.slice(8, 16);

  if (displayProducts.length === 0 && !loading) return null;

  return (
    <section className="bg-white py-12 lg:py-16">
      <div className="max-w-6xl mx-auto px-6 lg:px-12">
        <h2 className="text-2xl lg:text-3xl font-medium text-gray-900 text-center mb-10">
          Premium Collection
        </h2>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-gray-200 rounded-lg mb-3" />
                <div className="h-4 bg-gray-200 rounded mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
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
                    src={product.product_images?.[0] || "/shoes.png"}
                    alt={product.product_name}
                    className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
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
            to="/shoes/all"
            className="inline-block border border-gray-300 rounded-full px-6 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            View All
          </Link>
        </div>
      </div>
    </section>
  );
};

const ShoesPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      // Use string category ID directly
      const data = await productAPI.getByCategory("shoes");
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching shoes:", error);
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
      <ShoesHero heroProducts={products} />

      {/* Shoe Categories */}
      <ShoeCategories />

      {/* Top Shoe Collections */}
      <TopShoeCollections />

      {/* Trending Shoes */}
      <TrendingShoes products={products} loading={loading} />

      {/* More Trending Shoes */}
      <MoreTrendingShoes products={products} loading={loading} />

      {/* Client Testimonials */}
      <ClientTestimonials />
    </div>
  );
};

export default ShoesPage;
