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
    <div className="bg-white min-h-screen">
      {/* Breadcrumb - Desktop Only */}
      <div className="hidden lg:block border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-8 xl:px-12 py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link to="/" className="hover:text-orange-500 transition-colors">
              Home
            </Link>
            <HiChevronRight className="w-4 h-4" />
            <Link
              to="/mens-clothing"
              className="hover:text-orange-500 transition-colors"
            >
              Products
            </Link>
            <HiChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium truncate max-w-xs">
              {product.product_name}
            </span>
          </nav>
        </div>
      </div>

      {/* Mobile Back Button */}
      <div className="lg:hidden px-4 py-4">
        <Link to="/" className="text-gray-800 hover:text-gray-600">
          <HiChevronLeft className="w-6 h-6" />
        </Link>
      </div>

      {/* Main Product Section */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 xl:px-12 py-4 lg:py-4">
        <div className="lg:flex lg:gap-8 xl:gap-12 lg:items-start">
          {/* Left: Image Gallery - Desktop */}
          <div className="lg:w-[50%] xl:w-[48%] lg:flex lg:gap-4">
            {/* Thumbnail Gallery - Left Side on Desktop */}
            {images.length > 1 && (
              <div className="hidden lg:flex lg:flex-col gap-2 w-20">
                {images.slice(0, 5).map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImage(index)}
                    className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                      index === currentImage
                        ? "border-orange-500"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.product_name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Main Image */}
            <div className="relative flex-1 aspect-square lg:aspect-[4/5] lg:max-h-[65vh] bg-gray-50 rounded-2xl overflow-hidden group">
              <img
                src={images[currentImage]}
                alt={product.product_name}
                className="w-full h-full object-contain p-4 lg:p-6 transition-transform duration-500 group-hover:scale-105"
              />

              {/* Discount Badge */}
              {discountPercent > 0 && (
                <div className="absolute top-4 left-4 lg:top-6 lg:left-6 bg-red-500 text-white text-xs lg:text-sm font-bold px-3 py-1.5 rounded-full">
                  -{discountPercent}%
                </div>
              )}

              {/* Navigation Arrows - Desktop */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-3 lg:left-4 top-1/2 -translate-y-1/2 w-10 h-10 lg:w-12 lg:h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all opacity-0 group-hover:opacity-100"
                  >
                    <HiChevronLeft className="w-5 h-5 lg:w-6 lg:h-6 text-gray-700" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-3 lg:right-4 top-1/2 -translate-y-1/2 w-10 h-10 lg:w-12 lg:h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all opacity-0 group-hover:opacity-100"
                  >
                    <HiChevronRight className="w-5 h-5 lg:w-6 lg:h-6 text-gray-700" />
                  </button>
                </>
              )}

              {/* Share & Wishlist - Top Right */}
              <div className="absolute top-3 right-3 lg:top-4 lg:right-4 flex gap-2">
                <button
                  onClick={handleWishlist}
                  className="w-9 h-9 lg:w-10 lg:h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all"
                >
                  {isWishlisted ? (
                    <HiHeart className="w-4 h-4 lg:w-5 lg:h-5 text-red-500" />
                  ) : (
                    <HiOutlineHeart className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600" />
                  )}
                </button>
                <button className="w-9 h-9 lg:w-10 lg:h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all">
                  <HiOutlineShare className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Mobile Dots */}
            <div className="flex lg:hidden justify-center gap-1.5 mt-3">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImage(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentImage ? "bg-orange-500" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Right: Product Details */}
          <div className="mt-6 lg:mt-0 lg:w-[50%] xl:w-[52%]">
            {/* Brand */}
            {product.brand_name && (
              <p className="text-xs lg:text-sm text-orange-500 font-medium uppercase tracking-wide mb-1">
                {product.brand_name}
              </p>
            )}

            {/* Title */}
            <h1 className="text-lg lg:text-2xl xl:text-3xl font-bold text-gray-900 leading-tight">
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
              <span className="text-xs lg:text-sm text-gray-500">
                {avgRating} ({reviews.length})
              </span>
            </div>

            {/* Price Section - Compact */}
            <div className="mt-3 lg:mt-4 flex items-baseline gap-3 flex-wrap">
              <span className="text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900">
                {formatPrice(product.product_discounted_price)}
              </span>
              {discountPercent > 0 && (
                <>
                  <span className="text-sm lg:text-base text-gray-400 line-through">
                    {formatPrice(product.product_base_price)}
                  </span>
                  <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                    -{discountPercent}%
                  </span>
                </>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">Inclusive of all taxes</p>

            {/* Color & Size in Row on Desktop */}
            <div className="mt-4 lg:mt-5 lg:flex lg:gap-8">
              {/* Color Selection */}
              {hasColors && (
                <div className="mb-4 lg:mb-0">
                  <span className="text-xs lg:text-sm font-medium text-gray-700 block mb-2">
                    Color:{" "}
                    <span className="text-gray-500">{selectedColor}</span>
                  </span>
                  <div className="flex gap-2">
                    {product.colors.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => setSelectedColor(color.name)}
                        className={`relative w-8 h-8 lg:w-9 lg:h-9 rounded-full transition-all ${
                          selectedColor === color.name
                            ? "ring-2 ring-offset-2 ring-orange-500"
                            : "hover:scale-110"
                        } ${
                          color.hex === "#ffffff" || color.hex === "#FFFFFF"
                            ? "border border-gray-300"
                            : ""
                        }`}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      >
                        {selectedColor === color.name && (
                          <HiCheck
                            className={`absolute inset-0 m-auto w-4 h-4 ${
                              color.hex === "#ffffff" ||
                              color.hex === "#FFFFFF" ||
                              color.hex === "#FFFF00" ||
                              color.hex === "#ffff00"
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
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs lg:text-sm font-medium text-gray-700">
                      Size:{" "}
                      <span className="text-gray-500">{selectedSize}</span>
                    </span>
                    <button className="text-xs text-orange-500 hover:underline">
                      Size Guide
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((sizeObj) => (
                      <button
                        key={sizeObj.size}
                        onClick={() => setSelectedSize(sizeObj.size)}
                        className={`min-w-[40px] h-9 lg:h-10 px-3 rounded-lg text-xs lg:text-sm font-medium transition-all ${
                          selectedSize === sizeObj.size
                            ? "bg-gray-900 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        } ${
                          sizeObj.stock === 0
                            ? "opacity-40 cursor-not-allowed line-through"
                            : ""
                        }`}
                        disabled={sizeObj.stock === 0}
                      >
                        {sizeObj.size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons - Compact */}
            <div className="mt-4 lg:mt-5 flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={addingToCart}
                className="flex-1 border-2 border-gray-900 text-gray-900 py-3 lg:py-3.5 rounded-xl text-sm lg:text-base font-semibold hover:bg-gray-900 hover:text-white transition-all disabled:opacity-50"
              >
                {addingToCart ? "Adding..." : "Add to Cart"}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={addingToCart}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 lg:py-3.5 rounded-xl text-sm lg:text-base font-semibold transition-all disabled:opacity-50 shadow-lg shadow-orange-200"
              >
                {addingToCart ? "Processing..." : "Buy Now"}
              </button>
              <a
                href="https://wa.me/923297609190"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 lg:w-14 bg-green-500 hover:bg-green-600 rounded-xl flex items-center justify-center transition-all shadow-lg shadow-green-200 flex-shrink-0"
              >
                <FaWhatsapp className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              </a>
            </div>

            {/* Trust Badges - Inline */}
            <div className="mt-4 lg:mt-5 flex flex-wrap gap-4 lg:gap-6 text-xs lg:text-sm text-gray-600">
              <div className="flex items-center gap-1.5">
                <HiOutlineTruck className="w-4 h-4 lg:w-5 lg:h-5 text-orange-500" />
                <span>Free Delivery</span>
              </div>
              <div className="flex items-center gap-1.5">
                <HiOutlineRefresh className="w-4 h-4 lg:w-5 lg:h-5 text-orange-500" />
                <span>Easy Returns</span>
              </div>
              <div className="flex items-center gap-1.5">
                <HiOutlineShieldCheck className="w-4 h-4 lg:w-5 lg:h-5 text-orange-500" />
                <span>Secure Payment</span>
              </div>
              <div className="flex items-center gap-1.5">
                <HiOutlineCash className="w-4 h-4 lg:w-5 lg:h-5 text-orange-500" />
                <span>COD Available</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Tabs Section */}
      <div className="border-t border-gray-100 mt-8 lg:mt-16">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 xl:px-12">
          {/* Tabs */}
          <div className="flex gap-1 lg:gap-2 pt-6 lg:pt-10 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-6 lg:px-10 py-3 lg:py-4 text-sm lg:text-base font-medium transition-all relative ${
                activeTab === "overview"
                  ? "text-orange-500"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Description
              {activeTab === "overview" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`px-6 lg:px-10 py-3 lg:py-4 text-sm lg:text-base font-medium transition-all relative ${
                activeTab === "reviews"
                  ? "text-orange-500"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Reviews ({reviews.length})
              {activeTab === "reviews" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />
              )}
            </button>
          </div>

          {/* Tab Content */}
          <div className="py-8 lg:py-12 pb-16 lg:pb-24">
            {activeTab === "overview" ? (
              <div className="max-w-4xl">
                <h3 className="text-lg lg:text-2xl font-semibold text-gray-900 mb-4 lg:mb-6">
                  Product Description
                </h3>
                <p className="text-sm lg:text-base text-gray-600 leading-relaxed lg:leading-loose whitespace-pre-line">
                  {product.product_description}
                </p>

                {/* Highlights */}
                {product.highlights?.length > 0 && (
                  <div className="mt-8 lg:mt-12">
                    <h4 className="text-base lg:text-xl font-semibold text-gray-900 mb-4">
                      Highlights
                    </h4>
                    <ul className="space-y-3">
                      {product.highlights.map((highlight, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <HiCheck className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm lg:text-base text-gray-600">
                            {highlight}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Warranty */}
                {product.warranty && (
                  <div className="mt-8 lg:mt-12 p-4 lg:p-6 bg-blue-50 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <HiOutlineShieldCheck className="w-6 h-6 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">Warranty</p>
                        <p className="text-sm text-gray-600">
                          {product.warranty}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                {/* Reviews Summary */}
                <div className="lg:flex lg:gap-12 lg:items-start mb-8 lg:mb-12">
                  {/* Left: Rating Overview */}
                  <div className="text-center lg:text-left lg:w-64 mb-6 lg:mb-0">
                    <div className="text-5xl lg:text-6xl font-bold text-gray-900 mb-2">
                      {avgRating}
                    </div>
                    <div className="flex items-center justify-center lg:justify-start gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <span key={i}>
                          {i < Math.round(avgRating) ? (
                            <HiStar className="w-5 h-5 text-yellow-400" />
                          ) : (
                            <HiOutlineStar className="w-5 h-5 text-gray-300" />
                          )}
                        </span>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500">
                      Based on {reviews.length} reviews
                    </p>
                  </div>

                  {/* Right: Write a Review Form */}
                  {user && (
                    <div className="flex-1 p-5 lg:p-6 bg-gray-50 rounded-2xl max-w-2xl">
                      <h3 className="text-base lg:text-lg font-semibold mb-4">
                        Write a Review
                      </h3>
                      <form onSubmit={handleSubmitReview}>
                        <div className="mb-4">
                          <label className="block text-sm text-gray-600 mb-2">
                            Your Rating
                          </label>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() =>
                                  setNewReview({ ...newReview, rating: star })
                                }
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
                        <div className="mb-4">
                          <textarea
                            value={newReview.comment}
                            onChange={(e) =>
                              setNewReview({
                                ...newReview,
                                comment: e.target.value,
                              })
                            }
                            placeholder="Share your experience with this product..."
                            className="w-full p-4 border border-gray-200 rounded-xl resize-none h-28 text-sm focus:outline-none focus:border-orange-300"
                            required
                            minLength={3}
                            maxLength={500}
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={submitLoading}
                          className="bg-orange-500 text-white px-8 py-3 rounded-xl text-sm font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50"
                        >
                          {submitLoading ? "Submitting..." : "Submit Review"}
                        </button>
                      </form>
                    </div>
                  )}
                </div>

                {/* Reviews Grid */}
                {reviewsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="bg-gray-50 rounded-2xl p-5 animate-pulse"
                      >
                        <div className="h-4 bg-gray-200 rounded mb-4 w-24" />
                        <div className="h-3 bg-gray-200 rounded mb-2 w-32" />
                        <div className="h-16 bg-gray-200 rounded" />
                      </div>
                    ))}
                  </div>
                ) : paginatedReviews.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                    {paginatedReviews.map((review) => (
                      <div
                        key={review._id}
                        className="bg-gray-50 rounded-2xl p-5 lg:p-6 hover:shadow-md transition-shadow"
                      >
                        {/* Rating */}
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

                        {/* User Info */}
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                            <span className="text-orange-500 font-semibold text-sm">
                              {(
                                review.user_id?.first_name?.[0] || "C"
                              ).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {review.user_id?.first_name || "Customer"}
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(review.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                },
                              )}
                            </p>
                          </div>
                          <span className="ml-auto text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                            Verified
                          </span>
                        </div>

                        {/* Review Content */}
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {review.comment}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">
                      No reviews yet.{" "}
                      {user
                        ? "Be the first to review!"
                        : "Login to write a review."}
                    </p>
                  </div>
                )}

                {/* Load More */}
                {hasMoreReviews && (
                  <div className="text-center mt-8 lg:mt-12">
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
    </div>
  );
};

export default ProductPage;
