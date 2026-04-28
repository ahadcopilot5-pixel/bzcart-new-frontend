import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { productAPI, reviewAPI, wishlistAPI, cartAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { showToast } from "../utils/helpers";
import {
  HiOutlineHeart,
  HiHeart,
  HiOutlineShare,
  HiOutlineShieldCheck,
  HiOutlineTruck,
  HiOutlineRefresh,
  HiOutlineCreditCard,
  HiOutlineCash,
  HiChevronLeft,
  HiChevronRight,
  HiStar,
  HiOutlineStar,
  HiCheck,
} from "react-icons/hi";
import { FaWhatsapp } from "react-icons/fa";

// Format price helper
const formatPrice = (price) => {
  return `Rs.${Number(price).toLocaleString()} PKR`;
};

// Helper to create URL-friendly slug
const createSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

// Helper to check if string is a MongoDB ObjectId
const isObjectId = (str) => /^[a-f\d]{24}$/i.test(str);

const ProductPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Product state
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productId, setProductId] = useState(null);
  const fetchedSlugRef = useRef(null); // Track which slug we've already fetched

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewPage, setReviewPage] = useState(1);
  const reviewsPerPage = 8;

  // New review form
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [submitLoading, setSubmitLoading] = useState(false);

  // UI state
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [currentImage, setCurrentImage] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  // Fetch product - supports both slug and legacy ID URLs
  useEffect(() => {
    const fetchProduct = async () => {
      // Skip if we've already fetched this slug
      if (fetchedSlugRef.current === slug) {
        console.log(
          "ProductPage - Skipping fetch, already have data for:",
          slug,
        );
        return;
      }

      try {
        setLoading(true);
        setError(null);

        let data;
        let finalSlug = slug;

        // Check if it's an ObjectId (legacy URL) or slug
        if (isObjectId(slug)) {
          data = await productAPI.getById(slug);
          console.log(
            "ProductPage - Fetched by ID, colors:",
            JSON.stringify(data.colors),
          );

          // Get the slug for redirect
          if (data?.product_name) {
            finalSlug = createSlug(data.product_name);
          }
        } else {
          data = await productAPI.getBySlug(slug);
          console.log(
            "ProductPage - Fetched by slug, colors:",
            JSON.stringify(data.colors),
          );
        }

        // Store product data
        setProduct(data);
        setProductId(data._id);
        fetchedSlugRef.current = finalSlug; // Mark this slug as fetched

        // Set defaults
        if (data.colors?.length > 0) {
          setSelectedColor(data.colors[0].name);
        }
        if (data.sizes?.length > 0) {
          setSelectedSize(data.sizes[0].size);
        }

        setLoading(false);

        // Redirect if we fetched by ID
        if (isObjectId(slug) && data?.product_name) {
          navigate(`/product/${finalSlug}`, { replace: true });
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Product not found");
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug, navigate]);

  // Fetch reviews
  const fetchReviews = useCallback(async () => {
    if (!productId) return;
    try {
      setReviewsLoading(true);
      const data = await reviewAPI.getByProduct(productId);
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    if (productId) {
      fetchReviews();
    }
  }, [productId, fetchReviews]);

  // Submit review
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }
    if (!newReview.comment.trim()) return;

    try {
      setSubmitLoading(true);
      await reviewAPI.submit(productId, newReview.rating, newReview.comment);
      setNewReview({ rating: 5, comment: "" });
      fetchReviews(); // Refresh reviews
      showToast.success("Review submitted successfully!");
    } catch (err) {
      console.error("Error submitting review:", err);
      showToast.error("Failed to submit review. Please try again.");
    } finally {
      setSubmitLoading(false);
    }
  };

  // Toggle wishlist
  const handleWishlist = async () => {
    if (!productId) return;
    try {
      if (isWishlisted) {
        await wishlistAPI.remove(productId);
      } else {
        await wishlistAPI.add(productId);
      }
      setIsWishlisted(!isWishlisted);
    } catch (err) {
      console.error("Wishlist error:", err);
    }
  };

  // Add to cart
  const { refreshCart } = useCart();

  const handleAddToCart = async () => {
    try {
      setAddingToCart(true);
      const selectedImage =
        product.product_images?.[currentImage] || product.product_images?.[0];
      await cartAPI.add(
        product._id,
        selectedImage,
        selectedSize,
        selectedColor,
      );
      await refreshCart();
      showToast.success("Added to cart!");
    } catch (err) {
      console.error("Add to cart error:", err);
      showToast.error(err.message || "Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  // Buy now
  const handleBuyNow = async () => {
    await handleAddToCart();
    navigate("/checkout");
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <span
        key={index}
        className={`text-sm ${
          index < rating ? "text-yellow-400" : "text-gray-300"
        }`}
      >
        ★
      </span>
    ));
  };

  const nextImage = () => {
    if (product?.product_images?.length > 0) {
      setCurrentImage((prev) => (prev + 1) % product.product_images.length);
    }
  };

  const prevImage = () => {
    if (product?.product_images?.length > 0) {
      setCurrentImage((prev) =>
        prev === 0 ? product.product_images.length - 1 : prev - 1,
      );
    }
  };

  // Calculate average rating
  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ).toFixed(2)
      : 0;

  // Paginated reviews
  const paginatedReviews = reviews.slice(0, reviewPage * reviewsPerPage);
  const hasMoreReviews = reviews.length > paginatedReviews.length;

  if (loading) {
    return (
      <div className="bg-white min-h-screen flex flex-col items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-orange-400/20 blur-2xl rounded-full scale-150 animate-pulse"></div>
          <img src="/logo.png" alt="EZBZCART" className="h-12 relative z-10" />
        </div>
        <div className="mt-8 relative">
          <div className="w-12 h-12 rounded-full border-[3px] border-gray-200"></div>
          <div className="w-12 h-12 rounded-full border-[3px] border-transparent border-t-orange-500 border-r-orange-400 absolute top-0 left-0 animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="bg-white min-h-screen flex flex-col items-center justify-center">
        <p className="text-gray-500 text-lg">{error || "Product not found"}</p>
        <Link to="/" className="mt-4 text-orange-500 hover:underline">
          Go back home
        </Link>
      </div>
    );
  }

  const images =
    product.product_images?.length > 0
      ? product.product_images
      : ["/placeholder.png"];
  const hasColors = product.colors?.length > 0;
  const hasSizes = product.sizes?.length > 0;

  // Calculate discount percentage
  const discountPercent =
    product.product_base_price > product.product_discounted_price
      ? Math.round(
          ((product.product_base_price - product.product_discounted_price) /
            product.product_base_price) *
            100,
        )
      : 0;

  return (
    <div className="bg-white min-h-screen pb-24 lg:pb-0">
      {/* Breadcrumb - Desktop Only */}
      <div className="hidden lg:block border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-8 xl:px-12 py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link to="/" className="hover:text-orange-500 transition-colors">Home</Link>
            <HiChevronRight className="w-4 h-4" />
            <Link to="/mens-clothing" className="hover:text-orange-500 transition-colors">Products</Link>
            <HiChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium truncate max-w-xs">{product.product_name}</span>
          </nav>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 sticky top-0 bg-white z-10 border-b border-gray-100">
        <Link to="/" className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100">
          <HiChevronLeft className="w-5 h-5 text-gray-700" />
        </Link>
        <span className="text-sm font-medium text-gray-800 truncate max-w-[60%]">{product.product_name}</span>
        <button
          onClick={handleWishlist}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100"
        >
          {isWishlisted ? (
            <HiHeart className="w-5 h-5 text-red-500" />
          ) : (
            <HiOutlineHeart className="w-5 h-5 text-gray-600" />
          )}
        </button>
      </div>

      {/* Main Product Section */}
      <div className="max-w-7xl mx-auto px-0 lg:px-8 xl:px-12 py-0 lg:py-8">
        <div className="lg:flex lg:gap-10 xl:gap-14 lg:items-start">

          {/* Left: Image Gallery */}
          <div className="lg:w-[48%] lg:flex lg:gap-4 lg:sticky lg:top-8">
            {/* Desktop Thumbnails - Left Side */}
            {images.length > 1 && (
              <div className="hidden lg:flex lg:flex-col gap-2 w-[72px] flex-shrink-0">
                {images.slice(0, 6).map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImage(index)}
                    className={`w-[72px] h-[72px] rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                      index === currentImage
                        ? "border-orange-500 shadow-md"
                        : "border-gray-200 hover:border-gray-300 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Main Image */}
            <div className="relative flex-1">
              <div className="relative aspect-square lg:aspect-[4/5] lg:max-h-[70vh] bg-gray-50 lg:rounded-2xl overflow-hidden group">
                <img
                  src={images[currentImage]}
                  alt={product.product_name}
                  className="w-full h-full object-contain p-4 lg:p-6 transition-transform duration-500 group-hover:scale-105"
                />

                {/* Discount Badge */}
                {discountPercent > 0 && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
                    -{discountPercent}%
                  </div>
                )}

                {/* Image Counter */}
                {images.length > 1 && (
                  <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs font-medium px-2.5 py-1 rounded-full">
                    {currentImage + 1} / {images.length}
                  </div>
                )}

                {/* Nav Arrows — always visible on mobile, hover-only on desktop */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 lg:w-10 lg:h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg transition-all lg:opacity-0 lg:group-hover:opacity-100"
                    >
                      <HiChevronLeft className="w-5 h-5 text-gray-700" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 lg:w-10 lg:h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg transition-all lg:opacity-0 lg:group-hover:opacity-100"
                    >
                      <HiChevronRight className="w-5 h-5 text-gray-700" />
                    </button>
                  </>
                )}

                {/* Desktop: Share & Wishlist */}
                <div className="hidden lg:flex absolute top-4 right-4 gap-2">
                  <button
                    onClick={handleWishlist}
                    className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all"
                  >
                    {isWishlisted ? (
                      <HiHeart className="w-5 h-5 text-red-500" />
                    ) : (
                      <HiOutlineHeart className="w-5 h-5 text-gray-600" />
                    )}
                  </button>
                  <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all">
                    <HiOutlineShare className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Mobile Thumbnail Strip */}
              {images.length > 1 && (
                <div className="lg:hidden overflow-x-auto scrollbar-hide mt-3 px-4">
                  <div className="flex gap-2 w-max pb-1">
                    {images.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImage(index)}
                        className={`w-14 h-14 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                          index === currentImage
                            ? "border-orange-500 shadow"
                            : "border-gray-200 opacity-60"
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Product Details */}
          <div className="mt-5 lg:mt-0 lg:w-[52%] px-4 lg:px-0">

            {/* Brand + Stock Row */}
            <div className="flex items-center justify-between mb-2">
              {product.brand_name && (
                <span className="text-xs font-semibold text-orange-500 bg-orange-50 px-3 py-1 rounded-full uppercase tracking-wide">
                  {product.brand_name}
                </span>
              )}
              <span className={`text-xs font-medium px-3 py-1 rounded-full ml-auto ${
                product.product_stock > 10
                  ? "bg-green-50 text-green-600"
                  : product.product_stock > 0
                  ? "bg-amber-50 text-amber-600"
                  : "bg-red-50 text-red-500"
              }`}>
                {product.product_stock > 10
                  ? "In Stock"
                  : product.product_stock > 0
                  ? `Only ${product.product_stock} left`
                  : "Out of Stock"}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 leading-snug">
              {product.product_name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <span key={i}>
                    {i < Math.round(avgRating) ? (
                      <HiStar className="w-4 h-4 text-yellow-400" />
                    ) : (
                      <HiOutlineStar className="w-4 h-4 text-gray-300" />
                    )}
                  </span>
                ))}
              </div>
              <span className="text-xs text-gray-500">
                {avgRating} · {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
              </span>
            </div>

            {/* Price */}
            <div className="mt-4 p-4 bg-gray-50 rounded-2xl">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-2xl lg:text-3xl font-bold text-gray-900">
                  {formatPrice(product.product_discounted_price)}
                </span>
                {discountPercent > 0 && (
                  <>
                    <span className="text-sm text-gray-400 line-through">
                      {formatPrice(product.product_base_price)}
                    </span>
                    <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                      Save {discountPercent}%
                    </span>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1">Inclusive of all taxes · Free Delivery</p>
            </div>

            {/* Color Selection */}
            {hasColors && (
              <div className="mt-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-semibold text-gray-800">Color</span>
                  <span className="text-sm text-gray-500">— {selectedColor}</span>
                </div>
                <div className="flex gap-2.5 flex-wrap">
                  {product.colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      title={color.name}
                      className={`relative w-9 h-9 rounded-full transition-all ${
                        selectedColor === color.name
                          ? "ring-2 ring-offset-2 ring-orange-500 scale-110"
                          : "hover:scale-110"
                      } ${
                        color.hex === "#ffffff" || color.hex === "#FFFFFF"
                          ? "border border-gray-300"
                          : ""
                      }`}
                      style={{ backgroundColor: color.hex }}
                    >
                      {selectedColor === color.name && (
                        <HiCheck
                          className={`absolute inset-0 m-auto w-4 h-4 ${
                            color.hex === "#ffffff" || color.hex === "#FFFFFF" ||
                            color.hex === "#FFFF00" || color.hex === "#ffff00"
                              ? "text-gray-800"
                              : "text-white"
                          }`}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {hasSizes && (
              <div className="mt-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-800">
                    Size <span className="text-gray-400 font-normal">— {selectedSize}</span>
                  </span>
                  <button className="text-xs text-orange-500 font-medium hover:underline">Size Guide</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((sizeObj) => (
                    <button
                      key={sizeObj.size}
                      onClick={() => setSelectedSize(sizeObj.size)}
                      disabled={sizeObj.stock === 0}
                      className={`h-10 px-4 rounded-full text-sm font-medium transition-all border-2 ${
                        selectedSize === sizeObj.size
                          ? "bg-gray-900 text-white border-gray-900"
                          : sizeObj.stock === 0
                          ? "border-gray-200 text-gray-300 cursor-not-allowed line-through"
                          : "border-gray-200 text-gray-700 hover:border-gray-400"
                      }`}
                    >
                      {sizeObj.size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons - Desktop only (mobile uses sticky bar) */}
            <div className="hidden lg:flex mt-6 gap-3">
              <button
                onClick={handleAddToCart}
                disabled={addingToCart}
                className="flex-1 border-2 border-gray-900 text-gray-900 py-3.5 rounded-xl text-sm font-semibold hover:bg-gray-900 hover:text-white transition-all disabled:opacity-50"
              >
                {addingToCart ? "Adding..." : "Add to Cart"}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={addingToCart}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 shadow-lg shadow-orange-200"
              >
                {addingToCart ? "Processing..." : "Buy Now"}
              </button>
              <a
                href="https://wa.me/923297609190"
                target="_blank"
                rel="noopener noreferrer"
                className="w-14 bg-green-500 hover:bg-green-600 rounded-xl flex items-center justify-center transition-all shadow-lg shadow-green-200 flex-shrink-0"
              >
                <FaWhatsapp className="w-6 h-6 text-white" />
              </a>
            </div>

            {/* Trust Badges */}
            <div className="mt-5 lg:mt-6 grid grid-cols-2 gap-3">
              {[
                { icon: HiOutlineTruck, label: "Free Delivery", sub: "All over Pakistan" },
                { icon: HiOutlineCash, label: "Cash on Delivery", sub: "Pay when received" },
                { icon: HiOutlineRefresh, label: "Easy Returns", sub: "7-day return policy" },
                { icon: HiOutlineShieldCheck, label: "Secure Payment", sub: "100% protected" },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-800">{label}</p>
                    <p className="text-[11px] text-gray-400">{sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Payment Methods */}
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-400">Payment:</span>
              {[
                { icon: HiOutlineCreditCard, label: "Card" },
                { icon: HiOutlineCash, label: "COD" },
              ].map(({ icon: Icon, label }) => (
                <span key={label} className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="border-t border-gray-100 mt-8 lg:mt-16">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 xl:px-12">
          <div className="flex gap-1 lg:gap-2 pt-4 lg:pt-8 border-b border-gray-200">
            {[
              { key: "overview", label: "Description" },
              { key: "reviews", label: `Reviews (${reviews.length})` },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-5 lg:px-10 py-3 lg:py-4 text-sm lg:text-base font-medium transition-all relative ${
                  activeTab === key
                    ? "text-orange-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {label}
                {activeTab === key && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-t" />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="py-6 lg:py-12 pb-8 lg:pb-24">
            {activeTab === "overview" ? (
              <div className="max-w-4xl">
                <p className="text-sm lg:text-base text-gray-600 leading-relaxed lg:leading-loose whitespace-pre-line">
                  {product.product_description}
                </p>

                {product.highlights?.length > 0 && (
                  <div className="mt-6 lg:mt-10">
                    <h4 className="text-base lg:text-lg font-semibold text-gray-900 mb-4">Highlights</h4>
                    <ul className="space-y-2.5">
                      {product.highlights.map((highlight, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <HiCheck className="w-3 h-3 text-green-600" />
                          </div>
                          <span className="text-sm lg:text-base text-gray-600">{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {product.warranty && (
                  <div className="mt-6 lg:mt-10 p-4 lg:p-5 bg-blue-50 rounded-2xl flex items-center gap-3">
                    <HiOutlineShieldCheck className="w-6 h-6 text-blue-600 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Warranty</p>
                      <p className="text-sm text-gray-600">{product.warranty}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="lg:flex lg:gap-12 lg:items-start mb-8 lg:mb-10">
                  {/* Rating summary */}
                  <div className="flex items-center gap-4 lg:flex-col lg:items-start mb-6 lg:mb-0 lg:w-48">
                    <div>
                      <div className="text-4xl lg:text-5xl font-bold text-gray-900">{avgRating}</div>
                      <div className="flex items-center gap-0.5 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <span key={i}>
                            {i < Math.round(avgRating) ? (
                              <HiStar className="w-4 h-4 text-yellow-400" />
                            ) : (
                              <HiOutlineStar className="w-4 h-4 text-gray-300" />
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-400">{reviews.length} reviews</p>
                  </div>

                  {user && (
                    <div className="flex-1 p-5 lg:p-6 bg-gray-50 rounded-2xl max-w-2xl">
                      <h3 className="text-base font-semibold mb-4">Write a Review</h3>
                      <form onSubmit={handleSubmitReview}>
                        <div className="mb-4">
                          <label className="block text-sm text-gray-600 mb-2">Your Rating</label>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setNewReview({ ...newReview, rating: star })}
                                className="p-1"
                              >
                                {star <= newReview.rating ? (
                                  <HiStar className="w-7 h-7 text-yellow-400" />
                                ) : (
                                  <HiOutlineStar className="w-7 h-7 text-gray-300" />
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                        <textarea
                          value={newReview.comment}
                          onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                          placeholder="Share your experience with this product..."
                          className="w-full p-4 border border-gray-200 rounded-xl resize-none h-28 text-sm focus:outline-none focus:border-orange-300 mb-4 bg-white"
                          required
                          minLength={3}
                          maxLength={500}
                        />
                        <button
                          type="submit"
                          disabled={submitLoading}
                          className="bg-orange-500 text-white px-8 py-2.5 rounded-xl text-sm font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50"
                        >
                          {submitLoading ? "Submitting..." : "Submit Review"}
                        </button>
                      </form>
                    </div>
                  )}
                </div>

                {reviewsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="bg-gray-50 rounded-2xl p-5 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded mb-4 w-24" />
                        <div className="h-3 bg-gray-200 rounded mb-2 w-32" />
                        <div className="h-16 bg-gray-200 rounded" />
                      </div>
                    ))}
                  </div>
                ) : paginatedReviews.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {paginatedReviews.map((review) => (
                      <div key={review._id} className="bg-gray-50 rounded-2xl p-5 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-1 mb-3">
                          {[...Array(5)].map((_, i) => (
                            <span key={i}>
                              {i < review.rating ? (
                                <HiStar className="w-4 h-4 text-yellow-400" />
                              ) : (
                                <HiOutlineStar className="w-4 h-4 text-gray-300" />
                              )}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                            <span className="text-orange-500 font-semibold text-sm">
                              {(review.user_id?.first_name?.[0] || "C").toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {review.user_id?.first_name || "Customer"}
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(review.createdAt).toLocaleDateString("en-US", {
                                year: "numeric", month: "short", day: "numeric",
                              })}
                            </p>
                          </div>
                          <span className="ml-auto text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                            Verified
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">
                      No reviews yet. {user ? "Be the first to review!" : "Login to write a review."}
                    </p>
                  </div>
                )}

                {hasMoreReviews && (
                  <div className="text-center mt-8">
                    <button
                      onClick={() => setReviewPage((prev) => prev + 1)}
                      className="border-2 border-gray-900 text-gray-900 px-10 py-3 rounded-xl text-sm font-semibold hover:bg-gray-900 hover:text-white transition-colors"
                    >
                      Load More Reviews
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Mobile CTA Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 px-4 py-3 safe-area-pb">
        <div className="flex gap-3">
          <button
            onClick={handleAddToCart}
            disabled={addingToCart}
            className="flex-1 border-2 border-gray-900 text-gray-900 py-3 rounded-xl text-sm font-semibold hover:bg-gray-100 transition-all disabled:opacity-50"
          >
            {addingToCart ? "Adding..." : "Add to Cart"}
          </button>
          <button
            onClick={handleBuyNow}
            disabled={addingToCart}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 shadow-lg shadow-orange-200"
          >
            {addingToCart ? "Wait..." : "Buy Now"}
          </button>
          <a
            href="https://wa.me/923297609190"
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 bg-green-500 hover:bg-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-200 flex-shrink-0"
          >
            <FaWhatsapp className="w-5 h-5 text-white" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
