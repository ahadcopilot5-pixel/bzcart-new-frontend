import { useEffect, useMemo, useState } from "react";
import { FaStar, FaRegStar } from "react-icons/fa";
import {
  MdHeadset,
  MdLocalShipping,
  MdLocationOn,
  MdVerifiedUser,
  MdWorkspacePremium,
} from "react-icons/md";
import { testimonialAPI } from "../../services/api";

const trustBadges = [
  { Icon: MdVerifiedUser,    color: "#2563EB", bg: "#EFF6FF", title: "100% Secure Payment", sub: "Safe & Protected" },
  { Icon: MdLocalShipping,   color: "#EA580C", bg: "#FFF7ED", title: "Fast Delivery",        sub: "All Over Pakistan" },
  { Icon: MdWorkspacePremium,color: "#CA8A04", bg: "#FEFCE8", title: "100% Satisfaction",    sub: "Money Back Guarantee" },
  { Icon: MdHeadset,         color: "#16A34A", bg: "#F0FDF4", title: "24/7 Support",         sub: "We're Here to Help" },
];

const getRating    = (v) => { const n = Number(v); return Number.isNaN(n) ? 5 : Math.max(0, Math.min(5, Math.round(n))); };
const getStoreName = (item) => item?.name || item?.city || "Customer";
const getReviewText = (item) => item?.text || item?.review || "Verified customer review.";

const StarRow = ({ rating }) => (
  <div className="flex items-center gap-0.5 mb-2">
    {Array.from({ length: 5 }).map((_, i) =>
      i < rating
        ? <FaStar    key={i} className="w-3 h-3 text-amber-400" />
        : <FaRegStar key={i} className="w-3 h-3 text-gray-200"  />
    )}
  </div>
);

const TestimonialCard = ({ item }) => {
  const rating = getRating(item?.rating);
  return (
    <article className="mx-2 rounded-2xl overflow-hidden bg-white border border-black/[0.08] hover:border-black/[0.15] hover:-translate-y-1 hover:shadow-[0_10px_28px_rgba(0,0,0,0.11)] transition-all duration-300 group">

      <div className="relative overflow-hidden" style={{ aspectRatio: "3/4" }}>
        <img
          src={item?.image}
          alt={getStoreName(item)}
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
          loading="lazy"
          draggable={false}
        />
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm rounded-lg px-2.5 py-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
          <span className="text-[10px] font-bold text-white uppercase tracking-wide">Verified Buyer</span>
        </div>
      </div>

      <div className="px-3.5 pt-3.5 pb-4">
        <StarRow rating={rating} />
        <p className="text-[13.5px] font-extrabold text-gray-900 tracking-tight truncate mb-1.5 leading-tight">
          {getStoreName(item)}
        </p>
        <p className="text-[11.5px] text-gray-500 leading-relaxed line-clamp-2 min-h-[2rem] mb-3">
          {getReviewText(item)}
        </p>
        <div className="flex items-center gap-1 pt-2.5 border-t border-gray-100">
          <MdLocationOn className="w-3 h-3 text-orange-400 flex-shrink-0" />
          <span className="text-[10.5px] font-semibold text-gray-400 truncate">
            {item?.city || "Pakistan"}
          </span>
        </div>
      </div>
    </article>
  );
};

const TrustBadge = ({ Icon, color, bg, title, sub }) => (
  <div className="flex items-center gap-3 bg-white border border-black/[0.07] rounded-2xl px-4 py-3.5 hover:-translate-y-0.5 hover:shadow-[0_4px_14px_rgba(0,0,0,0.07)] transition-all duration-200">
    <div className="flex-shrink-0 w-10 h-10 rounded-[12px] flex items-center justify-center" style={{ backgroundColor: bg }}>
      <Icon style={{ color, width: 19, height: 19 }} />
    </div>
    <div>
      <p className="text-[12.5px] font-bold text-gray-800 leading-snug">{title}</p>
      <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>
    </div>
  </div>
);

const SPEED = 44;

const ClientTestimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [cardsPerView, setCardsPerView] = useState(4);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await testimonialAPI.getAll();
        setTestimonials(Array.isArray(data) ? data.filter((d) => d?.image) : []);
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const update = () => {
      if (window.innerWidth < 640) setCardsPerView(1.4);
      else if (window.innerWidth < 1024) setCardsPerView(2.5);
      else setCardsPerView(4);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const items = useMemo(
    () => (testimonials.length ? [...testimonials, ...testimonials, ...testimonials] : []),
    [testimonials]
  );

  if (!items.length) return null;

  return (
    <section className="py-14 md:py-20 bg-[#F5F4F2]">
      <style>{`
        @keyframes tm { from { transform: translateX(0) } to { transform: translateX(-33.3333%) } }
        .tm-track { animation: tm ${SPEED}s linear infinite; will-change: transform; }
        .tm-track:hover { animation-play-state: paused; }
      `}</style>

      <div className="max-w-[1500px] mx-auto px-4 md:px-6">

        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-1.5 bg-orange-50 border border-orange-200 text-orange-500 text-[10.5px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
            <FaStar className="w-2.5 h-2.5" /> Customer Reviews
          </span>
          <h2 className="text-3xl md:text-[2.5rem] font-extrabold text-gray-900 leading-tight tracking-tight">
            What Our Clients Say{" "}
            <span className="text-orange-500">About Us</span>
          </h2>
          <p className="mt-3 text-[13.5px] text-gray-400 max-w-sm mx-auto leading-relaxed">
            Real feedback from happy customers who trust BZCart for quality & service.
          </p>
        </div>

        <div className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-14 md:w-20 bg-gradient-to-r from-[#F5F4F2] to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-14 md:w-20 bg-gradient-to-l from-[#F5F4F2] to-transparent z-10" />
          <div className="flex tm-track">
            {items.map((item, i) => (
              <div key={`${item._id || item.image}-${i}`} className="shrink-0" style={{ width: `${100 / cardsPerView}%` }}>
                <TestimonialCard item={item} />
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-10">
          {trustBadges.map((b) => <TrustBadge key={b.title} {...b} />)}
        </div>

      </div>
    </section>
  );
};

export default ClientTestimonials;