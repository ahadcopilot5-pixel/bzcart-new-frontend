import { Link } from "react-router-dom";

const shoes = [
  {
    id: 1,
    name: "Jordan Jumpman 2021 PF",
    price: "Rs.6,999.00 PKR",
    image: "/shoes.png",
    href: "/product/1",
  },
  {
    id: 2,
    name: "Nike Air Max 270 React",
    price: "Rs.8,499.00 PKR",
    image: "/shoes.png",
    href: "/product/2",
  },
  {
    id: 3,
    name: "Adidas Ultraboost 22",
    price: "Rs.12,999.00 PKR",
    image: "/shoes.png",
    href: "/product/3",
  },
  {
    id: 4,
    name: "Puma RS-X Reinvention",
    price: "Rs.7,999.00 PKR",
    image: "/shoes.png",
    href: "/product/4",
  },
  {
    id: 5,
    name: "New Balance 574 Core",
    price: "Rs.5,499.00 PKR",
    image: "/shoes.png",
    href: "/product/5",
  },
  {
    id: 6,
    name: "Reebok Club C 85",
    price: "Rs.4,999.00 PKR",
    image: "/shoes.png",
    href: "/product/6",
  },
  {
    id: 7,
    name: "Converse Chuck Taylor",
    price: "Rs.3,999.00 PKR",
    image: "/shoes.png",
    href: "/product/7",
  },
  {
    id: 8,
    name: "Vans Old Skool",
    price: "Rs.4,499.00 PKR",
    image: "/shoes.png",
    href: "/product/8",
  },
  {
    id: 9,
    name: "Nike Air Force 1 Low",
    price: "Rs.9,999.00 PKR",
    image: "/shoes.png",
    href: "/product/9",
  },
  {
    id: 10,
    name: "Adidas Stan Smith",
    price: "Rs.6,499.00 PKR",
    image: "/shoes.png",
    href: "/product/10",
  },
  {
    id: 11,
    name: "Jordan 1 Retro High",
    price: "Rs.15,999.00 PKR",
    image: "/shoes.png",
    href: "/product/11",
  },
  {
    id: 12,
    name: "Nike Dunk Low",
    price: "Rs.11,999.00 PKR",
    image: "/shoes.png",
    href: "/product/12",
  },
];

const ShoesViewAllPage = () => {
  return (
    <section className="bg-gray-50 py-12 lg:py-16">
      <div className="max-w-6xl mx-auto px-6 lg:px-12">
        {/* Title */}
        <h2 className="text-2xl lg:text-3xl font-medium text-center text-gray-900 mb-8 lg:mb-12">
          All Shoes
        </h2>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
          {shoes.map((product) => (
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

export default ShoesViewAllPage;
