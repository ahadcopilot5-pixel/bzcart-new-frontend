import { useState, useEffect } from "react";
import { testimonialAPI } from "../../services/api";

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

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <span
        key={index}
        className={`text-lg ${
          index < rating ? "text-yellow-400" : "text-gray-300"
        }`}
      >
        ★
      </span>
    ));
  };

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-4xl mx-auto">
        {/* Title */}
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-12">
          What Our Clients Say About Us
        </h2>

        {/* Testimonial Card */}
        <div className="bg-orange-500 rounded-3xl p-8 md:p-12 relative overflow-hidden">
          {/* Main Content */}
          <div className="flex flex-col items-center text-center px-8 md:px-16">
            {/* Profile Image — square card style */}
            <div className="relative mb-6 w-36 h-36 md:w-44 md:h-44 rounded-2xl overflow-hidden shadow-xl border-4 border-white">
              <img
                src={currentTestimonial.image}
                alt={currentTestimonial.name}
                className="w-full h-full object-cover transition-all duration-500"
              />
            </div>

            {/* Name */}
            <h3 className="text-xl md:text-2xl font-semibold text-white mb-4">
              {currentTestimonial.name}
            </h3>

            {currentTestimonial.role && (
              <p className="text-white/70 text-sm md:text-base mb-3">
                {currentTestimonial.role}
              </p>
            )}

            {/* Testimonial Text */}
            <p className="text-white/90 text-sm md:text-base leading-relaxed mb-6 max-w-lg transition-all duration-500">
              {currentTestimonial.text}
            </p>

            {/* Rating */}
            <div className="flex items-center gap-3 bg-white rounded-full px-4 py-2 shadow-md">
              <span className="font-bold text-gray-800">
                {Number(currentTestimonial.rating || 0).toFixed(1)}
              </span>
              <span className="text-gray-500 text-sm">/</span>
              <span className="text-gray-500 text-sm">
                {currentTestimonial.reviewsLabel || "Verified Review"}
              </span>
              <div className="flex">
                {renderStars(currentTestimonial.rating)}
              </div>
            </div>
          </div>

          {/* Slide Indicators */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "bg-white w-6"
                    : "bg-white/50 hover:bg-white/70"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClientTestimonials;
