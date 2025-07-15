import React from 'react';
import { MapPin, ExternalLink } from 'lucide-react';
import TeamSection from '../components/TeamSection';
const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">

          {/* College Name & Address Section */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <MapPin className="mr-2 text-red-400" size={20} />
              Our Address
            </h3>
            <div className="text-gray-300 text-sm leading-relaxed">
              <p className="mb-1 font-semibold text-white">
                Vivekanand Education Society's Institute of Technology
              </p>
              <p className="mb-2 font-medium text-white">Hashu Advani Memorial Complex</p>
              <p>Collector's Colony, Chembur,</p>
              <p>Mumbai, Maharashtra 400074</p>
            </div>
          </div>

          {/* Know the Team Link */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <ExternalLink className="mr-2 text-blue-400" size={20} />
              Quick Link
            </h3>
            <ul className="list-none space-y-2 text-sm">
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white hover:underline transition-all duration-200 flex items-center group"
                >
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 group-hover:bg-white transition-colors duration-200"></span>
                  Know the Team
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2024 VESIT. All rights reserved. | Designed for student success.
            </p>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
