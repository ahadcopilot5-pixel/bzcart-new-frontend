import { Link } from "react-router-dom";

const watches = [
  {
    id: 1,
    name: "Fossil Machine Chronograph Watch",
    price: "Rs.6,999.00 PKR",
    image: "/watch1.png",
    href: "/product/1",
  },
  {
    id: 2,
    name: "Casio G-Shock Sport Watch",
    price: "Rs.8,499.00 PKR",
    image: "/watch2.png",
    href: "/product/2",
  },
  {
    id: 3,
    name: "Seiko Presage Automatic",
    price: "Rs.12,999.00 PKR",
    image: "/watch3.png",
    href: "/product/3",
  },
  {
    id: 4,
    name: "Tissot PRX Powermatic",
    price: "Rs.15,999.00 PKR",
    image: "/watch4.png",
    href: "/product/4",
  },
  {
    id: 5,
    name: "Orient Bambino Classic",
    price: "Rs.9,499.00 PKR",
    image: "/watch1.png",
    href: "/product/5",
  },
  {
    id: 6,
    name: "Citizen Eco-Drive Titanium",
    price: "Rs.11,999.00 PKR",
    image: "/watch2.png",
    href: "/product/6",
  },
  {
    id: 7,
    name: "Timex Expedition Scout",
    price: "Rs.4,999.00 PKR",
    image: "/watch3.png",
    href: "/product/7",
  },
  {
    id: 8,
    name: "Hamilton Khaki Field",
    price: "Rs.18,999.00 PKR",
    image: "/watch4.png",
    href: "/product/8",
  },
  {
    id: 9,
    name: "Omega Seamaster Diver",
    price: "Rs.45,999.00 PKR",
    image: "/watch1.png",
    href: "/product/9",
  },
  {
    id: 10,
    name: "Tag Heuer Formula 1",
    price: "Rs.38,999.00 PKR",
    image: "/watch2.png",
    href: "/product/10",
  },
  {
    id: 11,
    name: "Longines HydroConquest",
    price: "Rs.32,999.00 PKR",
    image: "/watch3.png",
    href: "/product/11",
  },
  {
    id: 12,
    name: "Oris Aquis Date",
    price: "Rs.28,999.00 PKR",
    image: "/watch4.png",
    href: "/product/12",
  },
];

const WatchesViewAllPage = () => {
  return (
    <section className="bg-gray-50 py-12 lg:py-16">
      <div className="max-w-6xl mx-auto px-6 lg:px-12">
        {/* Title */}
        <h2 className="text-2xl lg:text-3xl font-medium text-center text-gray-900 mb-8 lg:mb-12">
          All Watches
        </h2>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
          {watches.map((product) => (
            <Link key={product.id} to={product.href} className="group">
              {/* Image */}
              <div className="aspect-[3/4] overflow-hidden rounded-lg bg-gray-100 mb-3">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Product Info */}
              <div>
                <h3 className="text-xs lg:text-sm font-medium text-gray-900 leading-tight mb-1">
                  {product.name}
                </h3>
                <p className="text-xs text-orange-500 font-medium">
                  {product.price}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WatchesViewAllPage;
