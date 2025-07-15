import React, { useState, useEffect, useRef, Suspense } from 'react';
import { ChevronRight, Briefcase, BookOpen, Code, Users, Book, FileText, Lightbulb, Heart, Award, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import axiosInstance from '../services/axiosInstance';

const CardContainer = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [cards, setCards] = useState([
  {
    id: 1,
    title: 'Internships',
    message: 'Add details of your internships.',
    status: '',
    statusColor: 'bg-green-500',
    route: '/student/internships',
  },
  {
    id: 2,
    title: 'Courses/Certifications',
    message: 'List your completed courses or certifications.',
    status: '',
    statusColor: 'bg-green-500',
    route: '/student/courses',
  },
  {
    id: 3,
    title: 'Technical Activities',
    message: 'Mention technical events and competitions.',
    status: '',
    statusColor: 'bg-green-500',
    route: '/student/tech-activities',
  },
  {
    id: 4,
    title: 'Non-Technical Activities',
    message: 'Add cultural and non-tech event roles.',
    status: '',
    statusColor: 'bg-green-500',
    route: '/student/non-tech-activities',
  },
  {
    id: 5,
    title: 'Workshops',
    message: 'Include workshops you have attended.',
    status: '',
    statusColor: 'bg-green-500',
    route: '/student/workshop',
  },
  {
    id: 6,
    title: 'Paper Publications',
    message: 'Add published or presented research papers.',
    status: '',
    statusColor: 'bg-green-500',
    route: '/student/paper-publications',
  },
  {
    id: 7,
    title: 'Enterprenurship/Projects',
    message: 'Highlight start-ups or key projects.',
    status: '',
    statusColor: 'bg-green-500',
    route: '/student/entrepreneurship',
  },
  {
    id: 8,
    title: 'Volunteering',
    message: 'List social or volunteer contributions.',
    status: '',
    statusColor: 'bg-green-500',
    route: '/student/volunteering',
  },
  {
    id: 9,
    title: 'Patents',
    message: 'Mention patents filed or contributed to.',
    status: '',
    statusColor: 'bg-green-500',
    route: '/student/patents',
  },
  {
    id: 10,
    title: 'Other Achievements',
    message: 'Add awards or notable recognitions.',
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
            status: statuses[card.title] === 'Pending Submission' ? 'Pending Submission' : '',
            statusColor: statuses[card.title] === 'Pending Submission' ? 'bg-orange-500 shadow-sm' : '',
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-2">
             { cards.map((card) => (
                <div
                  key={card.id}
                  className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 ease-out transform hover:scale-105 hover:-translate-y-1 hover:bg-gray-50 border border-gray-100 hover:border-blue-200 p-6 relative overflow-visible flex flex-col"
                  style={{
                    animation: `fadeInUp 0.6s ease-out ${cards.indexOf(card) * 0.1}s both`,
                  }}
                >
                  {/* Top Row: Icon and Status Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center justify-center px-2 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-semibold rounded-md shadow-md" style={{minWidth: '32px', minHeight: '28px'}}>
                      {(() => {
                        switch(card.title) {
                          case 'Internships': return <Briefcase className="w-4 h-4" />;
                          case 'Courses/Certifications': return <BookOpen className="w-4 h-4" />;
                          case 'Technical Activities': return <Code className="w-4 h-4" />;
                          case 'Non-Technical Activities': return <Users className="w-4 h-4" />;
                          case 'Workshops': return <Book className="w-4 h-4" />;
                          case 'Paper Publications': return <FileText className="w-4 h-4" />;
                          case 'Enterprenurship/Projects': return <Lightbulb className="w-4 h-4" />;
                          case 'Volunteering': return <Heart className="w-4 h-4" />;
                          case 'Patents': return <Award className="w-4 h-4" />;
                          case 'Other Achievements': return <Star className="w-4 h-4" />;
                          default: return null;
                        }
                      })()}
                    </span>
                    <span className={`flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold text-white ${card.statusColor}`} style={{minWidth: '48px', minHeight: '18px'}}>
                      {card.status}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-l font-bold text-gray-600 mb-2  group-hover:text-blue-600 transition-colors duration-200">
                    {card.title}
                  </h3>

                  {/* Message */}
                  <p className="text-sm text-gray-600 mb-8 leading-relaxed line-clamp-3">{card.message}</p>

                  {/* Navigate Button - bottom left */}
                  <button
                    onClick={() => handleNavigate(card.route)}
                    className="absolute left-4 bottom-4 z-20 inline-flex items-center gap-1 mt-4 px-2 py-1 cursor-pointer bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-semibold rounded-md hover:from-blue-600 hover:to-purple-600 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg "
                    style={{minWidth: '70px', minHeight: '28px'}}
                  >
                    {card.status === 'Pending Submission' ? 'Update' : 'Add New'}
                    <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-200" />
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