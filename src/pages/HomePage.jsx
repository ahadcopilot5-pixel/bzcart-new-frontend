import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { LiaShippingFastSolid } from "react-icons/lia";
import { BiSupport } from "react-icons/bi";
import { HiOutlineRefresh } from "react-icons/hi";
import { HiOutlineHeart, HiHeart } from "react-icons/hi2";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import { productAPI } from "../services/api";
import { getProductUrl } from "../utils/helpers";
import ClientTestimonials from "../components/home/ClientTestimonials";
import FaviconSpinner from "../components/ui/FaviconSpinner";

const features = [
  { icon: LiaShippingFastSolid, text: "Free Shipping" },
  { icon: HiOutlineRefresh, text: "Easy Returns" },
  { icon: BiSupport, text: "24/7 Support" },
];

// Category definitions matching backend enum
const categoryDefinitions = [
  { slug: "pods-vape", name: "Pods & Vape", href: "/pods" },
  { slug: "mens-clothing", name: "Men's Clothing", href: "/mens-clothing" },
  { slug: "watches", name: "Watches", href: "/watches" },
  { slug: "shoes", name: "Shoes", href: "/shoes" },
  { slug: "mens-care", name: "Men's Care", href: "/care" },
];

const formatPrice = (price) =>
  `Rs.${Number(price || 0).toLocaleString()}.00 PKR`;

// Helper functions for product data
const getProductImage = (product) => {
  if (product?.product_images?.length > 0) return product.product_images[0];
  if (product?.images?.length > 0) return product.images[0];
  if (product?.image) return product.image;
  return "/home.png";
};

const getProductName = (product) => {
  return product?.product_name || product?.name || "Product";
};

const getProductPrice = (product) => {
  return (
    product?.product_discounted_price ||
    product?.product_base_price ||
    product?.price ||
    0
  );
};

// Product Card Component matching the image design
const ProductCard = ({ product }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  return (
    <Link
      to={getProductUrl(product)}
      className="group block w-full"
    >
      <div className="relative bg-white rounded-2xl border-2 border-gray-200 overflow-hidden hover:border-gray-300 transition-colors">
        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
        >
          {isWishlisted ? (
            <HiHeart className="w-5 h-5 text-red-500" />
          ) : (
            <HiOutlineHeart className="w-5 h-5 text-gray-600" />
          )}
        </button>

        {/* Product Image */}
        <div className="aspect-square bg-white p-3 flex items-center justify-center">
          <img
            src={getProductImage(product)}
            alt={getProductName(product)}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>

        {/* Product Info */}
        <div className="px-3 pb-3 pt-1 text-center">
          <h3 className="text-xs md:text-sm font-medium text-gray-900 line-clamp-2 mb-1 leading-tight">
            {getProductName(product)}
          </h3>
          <p className="text-xs md:text-sm font-semibold text-gray-800">
            {formatPrice(getProductPrice(product))}
          </p>
        </div>
      </div>
    </Link>
  );
};

// Category Slider Component
const CategorySlider = ({ category, products }) => {
  const sliderRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollButtons = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollButtons();
    const slider = sliderRef.current;
    if (slider) {
      slider.addEventListener("scroll", checkScrollButtons);
      return () => slider.removeEventListener("scroll", checkScrollButtons);
    }
  }, [products]);

  const scroll = (direction) => {
    if (sliderRef.current) {
      const scrollAmount = 300;
      sliderRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (!products || products.length === 0) return null;

  return (
    <section className="py-6 md:py-10">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900">
            {category.name}
          </h2>
          <Link
            to={category.href}
            className="text-sm text-orange-500 font-medium hover:text-orange-600 transition-colors"
          >
            View all
          </Link>
        </div>

        {/* Horizontal Slider — all screen sizes */}
        <div className="relative group">
          {/* Left Arrow */}
          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg hidden md:flex items-center justify-center hover:bg-gray-50 transition-colors opacity-0 group-hover:opacity-100"
            >
              <IoChevronBack className="w-5 h-5 text-gray-600" />
            </button>
          )}

          {/* Products Slider — negative right margin on mobile so partial next card peeks */}
          <div className="-mr-4 md:mr-0">
            <div
              ref={sliderRef}
              className="flex gap-3 md:gap-4 overflow-x-auto scroll-smooth pb-2 pr-4 md:pr-0"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {products.map((product) => (
                <div key={product._id} className="flex-shrink-0 w-[42vw] md:w-[240px] lg:w-[280px]">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>

          {/* Right Arrow */}
          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg hidden md:flex items-center justify-center hover:bg-gray-50 transition-colors opacity-0 group-hover:opacity-100"
            >
              <IoChevronForward className="w-5 h-5 text-gray-600" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

// Hero Section Component
const HeroSection = ({ featuredProducts = [] }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  // Auto-rotate with fade animation every 3 seconds
  useEffect(() => {
    if (featuredProducts.length < 2) return;
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setActiveIndex((i) => (i + 1) % featuredProducts.length);
        setVisible(true);
      }, 400);
    }, 3000);
    return () => clearInterval(timer);
  }, [featuredProducts.length]);

  const showProducts = featuredProducts.length > 0;
  const activeProduct = showProducts ? featuredProducts[activeIndex] : null;

  return (
    <section className="bg-white">
      {/* Desktop Layout */}
      <div className="hidden md:block">
        <div className="max-w-7xl mx-auto px-8 lg:px-12 py-8 lg:py-12">
          <div className="flex items-center justify-between gap-8">
            {/* Left Content */}
            <div className="flex-1 space-y-6">
              <div>
                <h2 className="text-3xl lg:text-4xl xl:text-5xl font-light italic text-gray-500 leading-tight tracking-tight">
                  DISCOVER YOUR
                </h2>
                <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight tracking-tight mt-1">
                  SIGNATURE LOOK
                </h1>
              </div>

              {activeProduct && (
                <div
                  style={{ transition: "opacity 0.4s ease", opacity: visible ? 1 : 0 }}
                >
                  <p className="text-base font-semibold text-gray-800 line-clamp-1">{getProductName(activeProduct)}</p>
                  <p className="text-sm text-orange-500 font-bold">{formatPrice(getProductPrice(activeProduct))}</p>
                </div>
              )}

              <Link
                to={activeProduct ? getProductUrl(activeProduct) : "/mens-clothing"}
                className="inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-sm text-base font-medium transition-colors"
              >
                {activeProduct ? "Shop Now" : "Explore Collection"}
                <IoChevronForward className="w-4 h-4" />
              </Link>
            </div>

            {/* Right Content - Single product with fade */}
            <div className="flex-1 flex justify-center">
              {showProducts ? (
                <Link
                  to={getProductUrl(activeProduct)}
                  className="group w-full max-w-sm"
                  style={{ transition: "opacity 0.4s ease", opacity: visible ? 1 : 0 }}
                >
                  <div className="bg-gray-50 rounded-3xl border border-gray-100 overflow-hidden aspect-square flex items-center justify-center p-6">
                    <img
                      src={getProductImage(activeProduct)}
                      alt={getProductName(activeProduct)}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </Link>
              ) : (
                <img
                  src="/home.png"
                  alt="Discover Your Signature Look"
                  className="w-full max-w-lg h-auto object-contain"
                />
              )}
            </div>
          </div>

          {/* Dot indicators */}
          {showProducts && (
            <div className="flex justify-center gap-2 mt-6">
              {featuredProducts.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setVisible(false); setTimeout(() => { setActiveIndex(i); setVisible(true); }, 400); }}
                  className={`w-2 h-2 rounded-full transition-all ${i === activeIndex ? "bg-orange-500 w-5" : "bg-gray-300"}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden px-5 py-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-light italic text-gray-500 leading-tight tracking-tight">
              DISCOVER YOUR
            </h2>
            <h1 className="text-3xl font-bold text-gray-900 leading-tight tracking-tight mt-1">
              SIGNATURE LOOK
            </h1>
          </div>

          {/* Single product with fade */}
          {showProducts ? (
            <Link
              to={getProductUrl(activeProduct)}
              className="group block w-full"
              style={{ transition: "opacity 0.4s ease", opacity: visible ? 1 : 0 }}
            >
              <div className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden aspect-square flex items-center justify-center p-4">
                <img
                  src={getProductImage(activeProduct)}
                  alt={getProductName(activeProduct)}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="mt-2 text-center" style={{ transition: "opacity 0.4s ease", opacity: visible ? 1 : 0 }}>
                <p className="text-sm font-semibold text-gray-800 line-clamp-1">{getProductName(activeProduct)}</p>
                <p className="text-sm text-orange-500 font-bold">{formatPrice(getProductPrice(activeProduct))}</p>
              </div>
            </Link>
          ) : (
            <div className="w-full py-2">
              <img src="/home.png" alt="Discover Your Signature Look" className="w-full h-auto object-contain" />
            </div>
          )}

          {/* Dot indicators */}
          {showProducts && (
            <div className="flex justify-center gap-2">
              {featuredProducts.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setVisible(false); setTimeout(() => { setActiveIndex(i); setVisible(true); }, 400); }}
                  className={`w-2 h-2 rounded-full transition-all ${i === activeIndex ? "bg-orange-500 w-5" : "bg-gray-300"}`}
                />
              ))}
            </div>
          )}

          <Link
            to={activeProduct ? getProductUrl(activeProduct) : "/mens-clothing"}
            className="inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-6 py-2.5 rounded-sm text-sm font-medium transition-colors"
          >
            {activeProduct ? "Shop Now" : "Explore Collection"}
            <IoChevronForward className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Features Bar */}
      <div className="border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 lg:px-12 lg:py-6">
          <div className="flex items-center justify-between lg:justify-center lg:gap-16">
            {features.map((feature) => (
              <div key={feature.text} className="flex items-center gap-1.5 lg:gap-2">
                <feature.icon className="w-4 h-4 lg:w-6 lg:h-6 text-gray-600" />
                <span className="text-[10px] text-gray-600 lg:text-sm lg:text-gray-700">
                  {feature.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// Loading Skeleton for Category
const CategorySkeleton = () => (
  <section className="py-6 md:py-10">
    <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div className="h-6 w-32 bg-orange-100 rounded" />
        <div className="h-4 w-16 bg-orange-100 rounded" />
      </div>
      <div className="flex gap-4 overflow-hidden">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex-shrink-0 w-[200px] md:w-[240px] lg:w-[280px]"
          >
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="aspect-square bg-orange-50 flex items-center justify-center">
                <FaviconSpinner size={44} showGlow />
              </div>
              <div className="p-4 space-y-2">
                <div className="h-4 bg-orange-100 rounded mx-auto w-3/4" />
                <div className="h-4 bg-orange-100 rounded mx-auto w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const HomePage = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all products once
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productAPI.getAll();
        const productList = Array.isArray(data) ? data : data.products || [];
        setAllProducts(productList);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Group products by category
  const getProductsByCategory = (categorySlug) => {
    return allProducts.filter((product) => product.category === categorySlug);
  };

  // Pick up to 8 products spread across categories for hero rotation
  const featuredProducts = allProducts.length > 0
    ? (() => {
        const shuffled = [...allProducts].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 8);
      })()
    : [];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <HeroSection featuredProducts={featuredProducts} />

      {/* Category Sliders */}
      <div className="bg-gray-50/50">
        {loading ? (
          // Loading skeletons
          <>
            <CategorySkeleton />
            <CategorySkeleton />
            <CategorySkeleton />
          </>
        ) : (
          categoryDefinitions.map((category) => {
            const products = getProductsByCategory(category.slug);
            if (products.length === 0) return null;
            return (
              <CategorySlider
                key={category.slug}
                category={category}
                products={products}
              />
            );
          })
        )}
      </div>

      {/* Testimonials */}
      <ClientTestimonials />
    </div>
  );
};

export default HomePage;
