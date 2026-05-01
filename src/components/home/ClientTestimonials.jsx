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
      <div className="max-w-lg mx-auto">
        {/* Title */}
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-10">
          What Our Clients Say
        </h2>

        {/* Card */}
        <div className="rounded-3xl overflow-hidden shadow-2xl bg-white border border-gray-100">

          {/* Full-width image on top */}
          <div className="relative w-full" style={{ height: "320px" }}>
            <img
              src={currentTestimonial.image}
              alt={currentTestimonial.name}
              className="w-full h-full object-cover transition-all duration-500"
            />
            {/* Gradient fade into content below */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-orange-500 to-transparent" />
          </div>

          {/* Orange content panel */}
          <div className="bg-orange-500 px-7 pt-4 pb-8">

            {/* Quote mark */}
            <div className="text-white/20 text-6xl font-serif leading-none select-none -mt-2 mb-2">"</div>

            {/* Testimonial text */}
            <p className="text-white text-sm md:text-base leading-relaxed mb-5">
              {currentTestimonial.text}
            </p>

            {/* Name & role */}
            <div className="mb-5">
              <h3 className="text-white font-bold text-xl">{currentTestimonial.name}</h3>
              {currentTestimonial.role && (
                <p className="text-white/70 text-sm">{currentTestimonial.role}</p>
              )}
            </div>

            {/* Rating badge */}
            <div className="flex items-center gap-3 bg-white rounded-2xl px-5 py-3 shadow-md w-fit mb-6">
              <span className="font-bold text-gray-800 text-lg">
                {Number(currentTestimonial.rating || 0).toFixed(1)}
              </span>
              <span className="text-gray-300 text-sm">/</span>
              <span className="text-gray-500 text-sm font-medium">
                {currentTestimonial.reviewsLabel || "Verified Review"}
              </span>
              <div className="flex">{renderStars(currentTestimonial.rating)}</div>
            </div>

            {/* Slide indicators */}
            <div className="flex gap-2">
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
    </section>
  );
};

export default ClientTestimonials;
