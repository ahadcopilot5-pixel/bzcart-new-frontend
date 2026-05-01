import { useState, useEffect } from "react";
import { testimonialAPI } from "../../services/api";

const trustBadges = [
  { icon: "🛡️", title: "100% Secure Payment", sub: "Safe & Protected" },
  { icon: "🚚", title: "Fast Delivery", sub: "All Over Pakistan" },
  { icon: "🏅", title: "100% Satisfaction", sub: "Money Back Guarantee" },
  { icon: "🎧", title: "24/7 Support", sub: "We're Here to Help" },
];

const ClientTestimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const data = await testimonialAPI.getAll();
        setTestimonials(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching testimonials:", error);
        setTestimonials([]);
      }
    };

    fetchTestimonials();
  }, []);

  useEffect(() => {
    if (testimonials.length <= 1) {
      return undefined;
    }

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [testimonials]);

  useEffect(() => {
    if (currentIndex > testimonials.length - 1) {
      setCurrentIndex(0);
    }
  }, [currentIndex, testimonials.length]);

  if (testimonials.length === 0) {
    return null;
  }

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-4xl mx-auto">

        {/* Badge */}
        <div className="flex justify-center mb-4">
          <span className="flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-500 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full">
            <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.171c.969 0 1.371 1.24.588 1.81l-3.374 2.452a1 1 0 00-.364 1.118l1.286 3.967c.3.921-.755 1.688-1.54 1.118L10 15.347l-3.374 2.452c-.784.57-1.838-.197-1.539-1.118l1.286-3.967a1 1 0 00-.364-1.118L2.635 9.394c-.783-.57-.38-1.81.588-1.81h4.171a1 1 0 00.95-.69l1.286-3.967z" />
            </svg>
            Customer Review
          </span>
        </div>

        {/* Title */}
        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-gray-900 mb-3">
          What Our Clients Say <br />About <span className="text-orange-500">Us</span>
        </h2>

        {/* Subtitle */}
        <p className="text-center text-gray-500 text-sm md:text-base mb-3 max-w-md mx-auto">
          Real feedback from our happy customers who love shopping with{" "}
          <span className="font-bold text-gray-800">BZCart.</span>{" "}
          Your satisfaction is our top priority.
        </p>

        {/* Decorative line */}
        <div className="flex justify-center gap-1 mb-10">
          <span className="w-8 h-1 rounded-full bg-orange-500 inline-block" />
          <span className="w-2 h-1 rounded-full bg-orange-300 inline-block" />
        </div>

        {/* Main Card */}
        <div className="bg-orange-500 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row">

          {/* Left — image with orange padding border */}
          <div className="w-full md:w-1/2 p-4">
            <img
              src={currentTestimonial.image}
              alt={currentTestimonial.name}
              className="w-full h-full object-cover rounded-2xl"
              style={{ minHeight: "320px" }}
            />
          </div>

          {/* Right — content */}
          <div className="w-full md:w-1/2 flex flex-col justify-between p-7 md:p-8 gap-2">

            {/* Location + Verified */}
            <div className="bg-white rounded-2xl px-4 py-3 flex flex-col gap-1 shadow-sm">
              <div className="flex items-center gap-2 text-gray-800 font-bold text-sm md:text-base">
                <svg className="w-4 h-4 text-orange-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                {currentTestimonial.city || currentTestimonial.name}
              </div>
              <div className="flex items-center gap-1 text-orange-500 text-xs font-semibold">
                {currentTestimonial.role || "Verified Customer"}
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            {/* Rating */}
            <div className="bg-white rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm">
              <span className="text-2xl font-extrabold text-gray-800">
                {Number(currentTestimonial.rating || 0).toFixed(1)}
              </span>
              <div className="w-px h-8 bg-gray-200" />
              <div className="flex flex-col">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`text-lg ${i < currentTestimonial.rating ? "text-yellow-400" : "text-gray-200"}`}>★</span>
                  ))}
                </div>
                <span className="text-gray-500 text-xs">{currentTestimonial.reviewsLabel || "Verified Review"}</span>
              </div>
            </div>

            {/* Quote + text */}
            <div className="relative px-2 pt-2 pb-6">
              <span className="text-white text-5xl font-bold leading-none select-none block mb-1">❝</span>
              <p className="text-white text-sm md:text-base leading-relaxed">
                {currentTestimonial.text}
              </p>
              <span className="text-white text-5xl font-bold leading-none select-none absolute bottom-0 right-2">❞</span>
            </div>

            {/* Trusted badge */}
            <div className="bg-white rounded-2xl px-4 py-3 flex items-center gap-3">
              <svg className="w-5 h-5 text-orange-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-gray-800 text-sm font-medium">
                Trusted by <span className="font-bold text-orange-500">5000+</span> Happy Customers
              </span>
            </div>

            {/* Slide indicators */}
            <div className="flex gap-2 mt-1">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex ? "bg-white w-6" : "bg-white/40 w-2 hover:bg-white/60"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Trust badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
          {trustBadges.map((badge) => (
            <div key={badge.title} className="flex items-center gap-3 border border-gray-100 rounded-2xl px-4 py-4 shadow-sm bg-white">
              <span className="text-2xl">{badge.icon}</span>
              <div>
                <p className="text-gray-800 font-bold text-xs md:text-sm leading-tight">{badge.title}</p>
                <p className="text-gray-400 text-xs">{badge.sub}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default ClientTestimonials;
