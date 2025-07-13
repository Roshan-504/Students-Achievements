import React from 'react';
import {  
  Twitter,
  Linkedin,
  Instagram,
  MapPin,
  ExternalLink,
} from 'lucide-react';

const Footer = () => {
    return(
        <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Address Section - Think of this as our "Home Base" info */}
          <div className="md:col-span-1">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <MapPin className="mr-2 text-red-400" size={20} />
              Our Address
            </h3>
            <div className="text-gray-300 text-sm leading-relaxed">
              <p className="mb-2 font-medium text-white">Hashu Advani Memorial Complex</p>
              <p>Collector's Colony Chembur,</p>
              <p>Mumbai, Maharashtra 400074</p>
            </div>
          </div>

          {/* Useful Links Section - Like a helpful menu of important pages */}
          <div className="md:col-span-1">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <ExternalLink className="mr-2 text-blue-400" size={20} />
              Useful Links
            </h3>
            {/* We use 'list-none' to remove bullet points, making it look cleaner */}
            <ul className="space-y-2 text-sm list-none">
              <li>
                <a 
                  href="#" 
                  className="text-gray-300 hover:text-white hover:underline transition-all duration-200 flex items-center group"
                >
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 group-hover:bg-white transition-colors duration-200"></span>
                  RTI Information
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-gray-300 hover:text-white hover:underline transition-all duration-200 flex items-center group"
                >
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 group-hover:bg-white transition-colors duration-200"></span>
                  NIRF
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-gray-300 hover:text-white hover:underline transition-all duration-200 flex items-center group"
                >
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 group-hover:bg-white transition-colors duration-200"></span>
                  NDL
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-gray-300 hover:text-white hover:underline transition-all duration-200 flex items-center group"
                >
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 group-hover:bg-white transition-colors duration-200"></span>
                  NPTEL Swayam
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-gray-300 hover:text-white hover:underline transition-all duration-200 flex items-center group"
                >
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 group-hover:bg-white transition-colors duration-200"></span>
                  Sitemap
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-gray-300 hover:text-white hover:underline transition-all duration-200 flex items-center group"
                >
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 group-hover:bg-white transition-colors duration-200"></span>
                  Website Disclaimer Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Related Links Section - Like a helpful menu of important pages */}
          <div className="md:col-span-1">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <ExternalLink className="mr-2 text-blue-400" size={20} />
              Related Links
            </h3>
            {/* We use 'list-none' to remove bullet points, making it look cleaner */}
            <ul className="list-none space-y-2 text-sm">
              <li>
                <a 
                  href="#" 
                  className="text-gray-300 hover:text-white hover:underline transition-all duration-200 flex items-center group"
                >
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 group-hover:bg-white transition-colors duration-200"></span>
                  DTE Maharashtra
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-gray-300 hover:text-white hover:underline transition-all duration-200 flex items-center group"
                >
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 group-hover:bg-white transition-colors duration-200"></span>
                  AICTE Students and Faculty Feedback
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-gray-300 hover:text-white hover:underline transition-all duration-200 flex items-center group"
                >
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 group-hover:bg-white transition-colors duration-200"></span>
                  Mandatory Disclosure
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-gray-300 hover:text-white hover:underline transition-all duration-200 flex items-center group"
                >
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 group-hover:bg-white transition-colors duration-200"></span>
                  Directory
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-gray-300 hover:text-white hover:underline transition-all duration-200 flex items-center group"
                >
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 group-hover:bg-white transition-colors duration-200"></span>
                  AICTE
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-gray-300 hover:text-white hover:underline transition-all duration-200 flex items-center group"
                >
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 group-hover:bg-white transition-colors duration-200"></span>
                  Government Initiatives
                </a>
              </li>
            </ul>
          </div>

          {/* Social Media Section - Keeping the original design but improving layout */}
          <div className="md:col-span-1">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Instagram className="mr-2 text-orange-400" size={20} />
              Connect With Us
            </h3>
            <div className="space-y-4">
              <p className="text-gray-300 text-sm">
                Follow us on social media for the latest updates and campus news.
              </p>
              {/* Social media icons with hover effects - like buttons that light up when you touch them */}
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-500 transition-all duration-200 hover:scale-110 transform shadow-lg"
                  title="Twitter"
                >
                  <Twitter size={20} />
                </a>
                <a
                  href="#"
                  className="bg-blue-800 text-white p-3 rounded-full hover:bg-blue-700 transition-all duration-200 hover:scale-110 transform shadow-lg"
                  title="LinkedIn"
                >
                  <Linkedin size={20} />
                </a>
                <a
                  href="#"
                  className="bg-purple-600 text-white p-3 rounded-full hover:bg-purple-500 transition-all duration-200 hover:scale-110 transform shadow-lg"
                  title="Instagram"
                >
                  <Instagram size={20} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright Section - The legal stuff at the bottom, like a signature */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2024 EduPortal. All rights reserved. | Designed for student success.
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
    )
}

export default Footer;