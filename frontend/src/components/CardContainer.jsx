import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import axiosInstance from '../services/axiosInstance';

const CardContainer = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [cards, setCards] = useState([
    {
      id: 1,
      title: 'Internships',
      message: "Add details of internships you've completed or are currently doing as a student intern.",
      status: '',
      statusColor: 'bg-green-500',
      route: '/student/internships',
    },
    {
      id: 2,
      title: 'Courses/Certifications',
      message: 'Add technical or non-technical courses and certifications that helped you gain new skills or explore your interests.',
      status: '',
      statusColor: 'bg-green-500',
      route: '/student/courses',
    },
    {
      id: 3,
      title: 'Technical Activities',
      message: 'Record your participation in technical events like coding contests, hackathons, workshops, and tech conferences.',
      status: '',
      statusColor: 'bg-green-500',
      route: '/student/tech-activities',
    },
    {
      id: 4,
      title: 'Non-Technical Activities',
      message: 'Mention your roles in cultural events, sports, college fests, debates, etc.',
      status: '',
      statusColor: 'bg-green-500',
      route: '/student/non-tech-activities',
    },
    {
      id: 5,
      title: 'Workshops',
      message: "List the workshops you've attended to learn new skills or deepen your knowledge in a specific area.",
      status: '',
      statusColor: 'bg-green-500',
      route: '/student/workshop',
    },
    {
      id: 6,
      title: 'Paper Publications',
      message: "Share your contributions to research and academics through papers you've published or presented in conferences or journals.",
      status: '',
      statusColor: 'bg-green-500',
      route: '/student/paper-publications',
    },
    {
      id: 7,
      title: 'Enterprenurship/Projects',
      message: 'Highlight your start-up ideas, freelance projects, or college projects.',
      status: '',
      statusColor: 'bg-green-500',
      route: '/student/entrepreneurship',
    },
    {
      id: 8,
      title: 'Volunteering',
      message: 'Add details of your social work or volunteer contributions with any NGOs, college committees, or social initiatives.',
      status: '',
      statusColor: 'bg-green-500',
      route: '/student/volunteering',
    },
    {
      id: 9,
      title: 'Patents',
      message: "Record your innovation and creativity by listing patents you've filed or been a part of as an inventor.",
      status: '',
      statusColor: 'bg-green-500',
      route: '/student/patents',
    },
    {
      id: 10,
      title: 'Other Achievements',
      message: 'Include any exceptional accomplishments not covered elsewhere - awards, media features, or unique recognitions.',
      status: '',
      statusColor: 'bg-green-500',
      route: '/student/achievements',
    },
  ]);
  const [loading, setLoading] = useState(true);

  // Fetch submission statuses
  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const response = await axiosInstance.get('/student/activity-status');
        const statuses = response.data;

        setCards(prevCards =>
          prevCards.map(card => ({
            ...card,
            status: statuses[card.title] || '',
            statusColor: statuses[card.title] === 'Pending Submission' ? 'bg-orange-500' : 'bg-green-500',
          }))
        );
      } catch (error) {
        console.error('Error fetching submission statuses:', error);
        // Fallback to default statuses
      } finally {
        setLoading(false);
      }
    };

    fetchStatuses();
  }, []);

  const handleNavigate = (route) => {
    navigate(route);
  };

  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Header */}
        <div className="max-w-6xl mx-auto mb-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
            Complete Your Activity Details
          </h1>
        </div>

        {/* Card Container */}
        <div
          ref={containerRef}
          className="mx-auto overflow-y-auto scroll-smooth"
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#3b82f6 #e5e7eb' }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-2">
             { cards.map((card) => (
                <div
                  key={card.id}
                  className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 ease-out transform hover:scale-105 hover:-translate-y-1 hover:bg-gray-50 border border-gray-100 hover:border-blue-200 p-6 relative overflow-visible"
                  style={{
                    animation: `fadeInUp 0.6s ease-out ${cards.indexOf(card) * 0.1}s both`,
                  }}
                >
                  {/* Status Badge */}
                  <div
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white mb-4 ${card.statusColor} shadow-sm`}
                  >
                    {card.status}
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors duration-200">
                    {card.title}
                  </h3>

                  {/* Message */}
                  <p className="text-gray-600 mb-6 leading-relaxed line-clamp-3">{card.message}</p>

                  {/* Navigate Button */}
                  <button
                    onClick={() => handleNavigate(card.route)}
                    className="inline-flex items-center gap-2 px-4 py-2 cursor-pointer bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                  >
                    {card.status !== 'Completed' ? 'Update' : 'Add New'}
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                  </button>
                </div>
              ))
              }
          </div>
        </div>

        {/* Custom Styles */}
        <style jsx>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .line-clamp-3 {
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          .max-h-96::-webkit-scrollbar {
            width: 8px;
          }

          .max-h-96::-webkit-scrollbar-track {
            background: #e5e7eb;
            border-radius: 4px;
          }

          .max-h-96::-webkit-scrollbar-thumb {
            background: #3b82f6;
            border-radius: 4px;
          }

          .max-h-96::-webkit-scrollbar-thumb:hover {
            background: #2563eb;
          }
        `}</style>
      </div>
  );
};

export default CardContainer;