import { Link } from "react-router-dom";
import {
  FaInstagram,
  FaWhatsapp,
  FaYoutube,
  FaFacebookF,
  FaTiktok,
} from "react-icons/fa";
import { HiPhone, HiMail, HiLocationMarker } from "react-icons/hi";

const socialLinks = [
  { icon: FaInstagram, href: "https://instagram.com", label: "Instagram" },
  { icon: FaWhatsapp, href: "https://whatsapp.com", label: "WhatsApp" },
  { icon: FaYoutube, href: "https://youtube.com", label: "YouTube" },
  { icon: FaFacebookF, href: "https://facebook.com", label: "Facebook" },
  { icon: FaTiktok, href: "https://tiktok.com", label: "TikTok" },
];

const Footer = () => {
  return (
    <footer className="bg-[#3d3d3d] text-white py-8">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
          {/* Left Section - Logo & Contact */}
          <div className="space-y-3">
            <Link to="/">
              <img src="/logo.png" alt="EZBZCART" className="h-10" />
            </Link>

            <a
              href="https://wa.me/923297609190"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-gray-300 hover:text-green-400 transition-colors"
            >
              <HiPhone size={16} />
              <span>0329 7609190</span>
            </a>

            <div className="flex items-center gap-2 text-sm text-gray-300">
              <HiMail size={16} />
              <span>info@bzcart.store</span>
            </div>

            <div className="flex items-start gap-2 text-sm text-gray-300">
              <HiLocationMarker size={16} className="mt-0.5 flex-shrink-0" />
              <span>
                Dinga, Tehsil Kharian District Gujrat,
                <br />
                Punjab – Pakistan
              </span>
            </div>
          </div>

          {/* Right Section - Social Links */}
          <div className="flex flex-col items-start lg:items-end gap-4">
            <span className="text-sm text-orange-500 tracking-wide">
              FOLLOW US
            </span>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-gray-500 flex items-center justify-center hover:border-orange-500 hover:text-orange-500 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
