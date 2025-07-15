import React, { useEffect, useState } from 'react';

const teamMembers = [
  {
    name: "Roshan Yadav",
    description: "Frontend Developer with a love for UI/UX design.",
    year: "Joined 2021",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    name: "Sarthak Mhatre",
    description: "Backend Developer specialized in Node.js and databases.",
    year: "Joined 2020",
    image: "https://randomuser.me/api/portraits/men/46.jpg",
  },
  {
    name: "Kshitij Nangare",
    description: "Project Manager who ensures everything runs smoothly.",
    year: "Joined 2019",
    image: "https://randomuser.me/api/portraits/women/68.jpg",
  },
  {
    name: "Mohish Padave",
    description: "DevOps Engineer passionate about cloud infrastructure.",
    year: "Joined 2022",
    image: "https://randomuser.me/api/portraits/men/52.jpg",
  },
];

const TeamSection = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setIsVisible(true), 100); // slight delay for fade-in
    return () => clearTimeout(timeout);
  }, []);

  return (
    <section className="bg-gradient-to-b from-white via-blue-50 to-gray-100 py-16 px-4 sm:px-6 lg:px-8">
      <h2 className="text-4xl font-bold text-center text-black mb-12">
        Our Team
      </h2>

      <div className="grid gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
        {teamMembers.map((member, index) => (
          <div
            key={index}
            className={`rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-xl p-6 transform transition duration-500 ease-in-out hover:scale-105 opacity-0 translate-y-10 ${
              isVisible ? 'opacity-100 translate-y-0' : ''
            }`}
            style={{ transitionDelay: `${index * 150}ms` }}
          >
            <div className="flex flex-col items-center text-center">
              <img
                src={member.image}
                alt={member.name}
                className="w-24 h-24 rounded-full border-4 border-white shadow-md mb-4"
              />
              <h3 className="text-xl font-semibold">{member.name}</h3>
              <p className="text-sm text-gray-100 mt-2">{member.description}</p>
              <span className="mt-4 text-sm text-gray-300 italic">{member.year}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TeamSection;
