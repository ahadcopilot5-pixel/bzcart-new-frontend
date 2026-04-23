import { useState, useEffect } from "react";

const testimonials = [
  {
    id: 1,
    name: "Leticia Kutch",
    image: "https://i.pravatar.cc/150?img=44",
    text: "Sapiente accusati exercitationem quasi eum corporis sit. Aut consectetur maxime debitis quam voluptatem aut consequatur voluptatum.",
    rating: 5,
    reviews: "8 rating",
  },
  {
    id: 2,
    name: "Marcus Johnson",
    image: "https://i.pravatar.cc/150?img=32",
    text: "Absolutely love the quality and style! The customer service was exceptional and delivery was super fast. Will definitely shop again.",
    rating: 5,
    reviews: "12 rating",
  },
  {
    id: 3,
    name: "Sarah Williams",
    image: "https://i.pravatar.cc/150?img=68",
    text: "Best online shopping experience I've ever had. The clothes fit perfectly and the materials are top-notch. Highly recommended!",
    rating: 4,
    reviews: "6 rating",
  },
  {
    id: 4,
    name: "David Chen",
    image: "https://i.pravatar.cc/150?img=12",
    text: "Great collection and amazing prices. The winter jacket I bought is incredibly warm and stylish. Five stars all the way!",
    rating: 5,
    reviews: "10 rating",
  },
];

const ClientTestimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, []);

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
            {/* Profile Image */}
            <div className="relative mb-6">
              <img
                src={currentTestimonial.image}
                alt={currentTestimonial.name}
                className="w-24 h-24 md:w-28 md:h-28 rounded-full border-4 border-white object-cover shadow-lg transition-all duration-500"
              />
            </div>

            {/* Name */}
            <h3 className="text-xl md:text-2xl font-semibold text-white mb-4">
              {currentTestimonial.name}
            </h3>

            {/* Testimonial Text */}
            <p className="text-white/90 text-sm md:text-base leading-relaxed mb-6 max-w-lg transition-all duration-500">
              {currentTestimonial.text}
            </p>

            {/* Rating */}
            <div className="flex items-center gap-3 bg-white rounded-full px-4 py-2 shadow-md">
              <span className="font-bold text-gray-800">5.0</span>
              <span className="text-gray-500 text-sm">/</span>
              <span className="text-gray-500 text-sm">
                {currentTestimonial.reviews}
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
