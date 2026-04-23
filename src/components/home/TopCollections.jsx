import { Link } from "react-router-dom";

const collections = [
  {
    name: "WATCHES",
    image: "/hoodies.jpg",
    href: "/watches",
  },
  {
    name: "SHOES",
    image: "/sweatshirts.jpg",
    href: "/shoes",
  },
  {
    name: "VAPES & PODS",
    image: "/loosebottomtrousers.jpg",
    href: "/pods",
  },
  {
    name: "CARE",
    image: "/tracksuits.jpg",
    href: "/care",
  },
];

const TopCollections = () => {
  return (
    <section className="bg-white py-12 lg:py-16">
      <div className="max-w-5xl mx-auto px-6 lg:px-12">
        {/* Section Title */}
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 text-center mb-10">
          TOP COLLECTION'S
        </h2>

        {/* Collections Grid - 2x2 */}
        <div className="grid grid-cols-2 gap-3 lg:gap-4">
          {collections.map((collection) => (
            <Link
              key={collection.name}
              to={collection.href}
              className="group relative overflow-hidden rounded-lg bg-gray-100"
            >
              {/* Image */}
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={collection.image}
                  alt={collection.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Label */}
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

export default TopCollections;
