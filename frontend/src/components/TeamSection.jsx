import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LogOut, Menu, X } from "lucide-react";
import Footer from "./Footer";
import { useAuthStore } from "../context/authStore";
import mohish from "../assets/mohish.jpg";
import roshan from "../assets/roshan.jpg";
import kshitij from "../assets/kshitij.png";
import sarthak from "../assets/sarthak.jpg";
import pooja_shetty from "../assets/pooja_shetty.jpg";


const mentor = {
  name: "Pooja Shetty",
  info: "Lead Mentor, guiding the team to success.",
  image: pooja_shetty,
  instagram: "https://instagram.com/",
  linkedin: "https://linkedin.com/",
};

const team = [
  {
    name: "Kshitij Nangare",
    info: "Team Member",
    image: kshitij,
    instagram: "https://instagram.com/",
    linkedin: "https://www.linkedin.com/in/kshitijnangare",
  },
  {
    name: "Mohish Padave",
    info: "Team Member",
    image: mohish,
    instagram: "https://instagram.com/",
    linkedin: "https://www.linkedin.com/in/mohish-padave",
  },
  {
    name: "Roshan Yadav",
    info: "Team Member",
    image: roshan,
    instagram: "https://instagram.com/",
    linkedin: "https://www.linkedin.com/in/roshan-yadav-32810a28b",
  },
  {
    name: "Sarthak Mhatre",
    info: "Team Member",
    image: sarthak,
    instagram: "https://instagram.com/",
    linkedin: "https://www.linkedin.com/in/sarthak-mhatre-4875b42a2",
  },
];

const SocialIcons = ({ instagram, linkedin }) => (
  <div className="flex gap-4 justify-center mt-3">
    <a href={instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
      className="text-blue-600 hover:text-pink-600 transform transition duration-200 hover:scale-110">
      {/* Instagram SVG */}
      <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204...z" />
      </svg>
    </a>
    <a href={linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"
      className="text-blue-600 hover:text-pink-600 transform transition duration-200 hover:scale-110">
      {/* LinkedIn SVG */}
      <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 0h-14c-2.761...z" />
      </svg>
    </a>
  </div>
);

const Navbar = () => {
  
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/login');
  };


  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 fixed w-full top-0 z-50 transition-all duration-300 ease-in-out">
      <div className="max-w-full mx-auto px-4 sm:px-8 lg:px-12 h-16 flex justify-between items-center">
    
        {/* Left Section: Sidebar Toggle + Dashboard Title */}
        <div className="flex items-center space-x-2 sm:space-x-4"> {/* Adjusted spacing for smaller screens */}
    
          {/* Dashboard Title - Consistent branding */}
          <div className="ml-2">
            <NavLink to="/" className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
              Students Achievements
            </NavLink>
          </div>
        </div>
    
        {/* Right Section: Logout */}
        <div className="flex items-center space-x-2 sm:space-x-4"> {/* Adjusted spacing */}
    
          {/* Logout Button */}

          {user && (<button
            onClick={handleLogout}
            className="p-2 cursor-pointer rounded-lg flex items-center text-white hover:text-gray-100 bg-red-600 hover:bg-red-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 text-sm font-medium touch-manipulation"
            aria-label="Logout"
          >
            <LogOut size={16} className="sm:mr-1" />
            <span className="hidden sm:inline">Logout</span>
          </button>
          )}
        </div>
      </div>
    </nav>
  );
};

const TeamSection = () => {
  const [selected, setSelected] = useState(null);

  return (
    <>
      {/* Navbar */}
      <Navbar />

      {/* Page Content */}
      <div className="flex flex-col items-center pt-24 pb-8 px-4 min-h-screen bg-gradient-to-br from-blue-100 to-gray-50">
        {/* Title */}
        <h2 className="text-4xl font-extrabold mb-8 text-blue-700  drop-shadow-md">
          Know The Team
        </h2>

        {/* Mentor Card */}
        <div className="bg-gradient-to-tr from-white to-blue-100 shadow-2xl border border-gray-200 rounded-2xl p-10 text-center mb-10 w-[380px] flex flex-col items-center">
          <img src={mentor.image} alt={mentor.name}
            className="w-28 h-28 rounded-full object-cover mb-5 border-4 border-blue-500 shadow-md" />
          <h3 className="text-xl font-bold text-blue-600">{mentor.name}</h3>
          <p className="text-gray-600 text-base mt-2">{mentor.info}</p>
          <SocialIcons instagram={mentor.instagram} linkedin={mentor.linkedin} />
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-6xl">
          {team.map((member, idx) => (
            <div key={idx} onClick={() => setSelected(idx)}
              className={`bg-gradient-to-tr from-white to-blue-100 shadow-lg border border-gray-200 rounded-xl p-6 text-center flex flex-col items-center cursor-pointer transition-transform duration-300 ${
                selected === idx
                  ? "scale-110 -translate-y-4 border-blue-500 shadow-2xl z-10"
                  : "hover:scale-105 hover:-translate-y-2 hover:shadow-xl"
              }`}>
              <img src={member.image} alt={member.name}
                className="w-24 h-24 rounded-full object-cover mb-4 border-2 border-gray-300" />
              <h4 className="text-lg font-semibold text-blue-600">{member.name}</h4>
              <p className="text-gray-500 text-sm">{member.info}</p>
              <SocialIcons instagram={member.instagram} linkedin={member.linkedin} />
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default TeamSection;
