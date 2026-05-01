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
        <div className="bg-orange-500 rounded-3xl overflow-hidden shadow-2xl">
          {/* Layout: image left on md+, stacked on mobile */}
          <div className="flex flex-col md:flex-row">

            {/* Image Panel */}
            <div className="w-full md:w-2/5 relative">
              <img
                src={currentTestimonial.image}
                alt={currentTestimonial.name}
                className="w-full h-64 md:h-full object-cover transition-all duration-500"
                style={{ minHeight: "280px" }}
              />
              {/* Overlay gradient on mobile bottom, on md right side */}
              <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-orange-500/80 via-transparent to-transparent" />
            </div>

            {/* Content Panel */}
            <div className="flex-1 flex flex-col justify-between p-8 md:p-10">
              {/* Quote icon */}
              <div className="text-white/30 text-7xl font-serif leading-none select-none mb-2">"</div>

              {/* Name & Role */}
              <div className="mb-4">
                <h3 className="text-2xl md:text-3xl font-bold text-white">
                  {currentTestimonial.name}
                </h3>
                {currentTestimonial.role && (
                  <p className="text-white/70 text-sm mt-1">{currentTestimonial.role}</p>
                )}
              </div>

              {/* Testimonial Text */}
              <p className="text-white/90 text-sm md:text-base leading-relaxed mb-6 transition-all duration-500">
                {currentTestimonial.text}
              </p>

              {/* Rating Badge */}
              <div className="flex items-center gap-3 bg-white rounded-2xl px-5 py-3 shadow-md self-start">
                <span className="font-bold text-gray-800 text-lg">
                  {Number(currentTestimonial.rating || 0).toFixed(1)}
                </span>
                <span className="text-gray-300 text-sm">/</span>
                <span className="text-gray-500 text-sm font-medium">
                  {currentTestimonial.reviewsLabel || "Verified Review"}
                </span>
                <div className="flex">{renderStars(currentTestimonial.rating)}</div>
              </div>

              {/* Slide Indicators */}
              <div className="flex gap-2 mt-6">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? "bg-white w-6"
                        : "bg-white/40 w-2 hover:bg-white/60"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClientTestimonials;
