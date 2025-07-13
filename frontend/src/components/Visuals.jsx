import React, { useState, useEffect, useRef } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Download, Users, FileText, TrendingUp } from 'lucide-react';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const Visuals = () => {
  // Sample data based on your JSON schema
  const [studentsData] = useState([
    {
      email_id: "john.doe@ves.ac.in",
      first_name: "John",
      last_name: "Doe",
      department: "INFT",
      batch_no: "A1",
      gender: "Male",
      current_sgpi: 8.5
    },
    {
      email_id: "jane.smith@ves.ac.in",
      first_name: "Jane",
      last_name: "Smith",
      department: "INFT",
      batch_no: "A1",
      gender: "Female",
      current_sgpi: 9.0
    },
    {
      email_id: "rohit.sharma@ves.ac.in",
      first_name: "Rohit",
      last_name: "Sharma",
      department: "INFT",
      batch_no: "A2",
      gender: "Male",
      current_sgpi: 7.8
    },
    {
      email_id: "priya.patel@ves.ac.in",
      first_name: "Priya",
      last_name: "Patel",
      department: "INFT",
      batch_no: "A2",
      gender: "Female",
      current_sgpi: null
    },
    {
      email_id: "vikram.singh@ves.ac.in",
      first_name: "Vikram",
      last_name: "Singh",
      department: "INFT",
      batch_no: "A3",
      gender: "Male",
      current_sgpi: 8.2
    }
  ]);

  const [activitiesData] = useState([
    { type: "Hackathon", count: 2 },
    { type: "Seminar", count: 1 },
    { type: "Workshop", count: 1 },
    { type: "Bootcamp", count: 1 }
  ]);

  const [internshipsData] = useState([
    { month: "May 2024", count: 1 },
    { month: "Jun 2024", count: 2 },
    { month: "Jul 2024", count: 1 },
    { month: "Aug 2024", count: 1 }
  ]);

  const [coursesData] = useState([
    { platform: "Coursera", count: 2 },
    { platform: "Udemy", count: 1 },
    { platform: "edX", count: 1 },
    { platform: "AWS Skill Builder", count: 1 }
  ]);

  // Animation state for charts
  const [chartsLoaded, setChartsLoaded] = useState(false);

  useEffect(() => {
    // Simulate loading animation
    const timer = setTimeout(() => setChartsLoaded(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // Bar Chart Configuration - SGPI Distribution by Batch
  const barChartData = {
    labels: ['Batch A1', 'Batch A2', 'Batch A3'],
    datasets: [
      {
        label: 'Average SGPI',
        data: [
          studentsData.filter(s => s.batch_no === 'A1' && s.current_sgpi).reduce((sum, s) => sum + s.current_sgpi, 0) / studentsData.filter(s => s.batch_no === 'A1' && s.current_sgpi).length || 0,
          studentsData.filter(s => s.batch_no === 'A2' && s.current_sgpi).reduce((sum, s) => sum + s.current_sgpi, 0) / studentsData.filter(s => s.batch_no === 'A2' && s.current_sgpi).length || 0,
          studentsData.filter(s => s.batch_no === 'A3' && s.current_sgpi).reduce((sum, s) => sum + s.current_sgpi, 0) / studentsData.filter(s => s.batch_no === 'A3' && s.current_sgpi).length || 0
        ],
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(236, 72, 153, 0.8)'
        ],
        borderColor: [
          'rgb(99, 102, 241)',
          'rgb(168, 85, 247)',
          'rgb(236, 72, 153)'
        ],
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false
      }
    ]
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 12,
            weight: 'bold'
          },
          color: '#374151'
        }
      },
      title: {
        display: true,
        text: 'Average SGPI by Batch',
        font: {
          size: 16,
          weight: 'bold'
        },
        color: '#1f2937'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
        grid: {
          color: 'rgba(156, 163, 175, 0.2)'
        },
        ticks: {
          color: '#6b7280'
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#6b7280'
        }
      }
    },
    animation: {
      duration: chartsLoaded ? 1500 : 0,
      easing: 'easeInOutQuart'
    }
  };

  // Pie Chart Configuration - Activity Types Distribution
  const pieChartData = {
    labels: activitiesData.map(item => item.type),
    datasets: [
      {
        data: activitiesData.map(item => item.count),
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(249, 115, 22, 0.8)',
          'rgba(245, 101, 101, 0.8)'
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(59, 130, 246)',
          'rgb(249, 115, 22)',
          'rgb(245, 101, 101)'
        ],
        borderWidth: 3,
        hoverOffset: 8
      }
    ]
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          font: {
            size: 12,
            weight: 'bold'
          },
          color: '#374151',
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      title: {
        display: true,
        text: 'Student Activities Distribution',
        font: {
          size: 16,
          weight: 'bold'
        },
        color: '#1f2937'
      }
    },
    animation: {
      animateRotate: chartsLoaded,
      duration: chartsLoaded ? 2000 : 0
    }
  };

  // Line Chart Configuration - Internships Over Time
  const lineChartData = {
    labels: internshipsData.map(item => item.month),
    datasets: [
      {
        label: 'New Internships',
        data: internshipsData.map(item => item.count),
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        borderWidth: 3,
        fill: true,
        pointBackgroundColor: 'rgb(168, 85, 247)',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8,
        tension: 0.4
      }
    ]
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 12,
            weight: 'bold'
          },
          color: '#374151'
        }
      },
      title: {
        display: true,
        text: 'Internship Trends Over Time',
        font: {
          size: 16,
          weight: 'bold'
        },
        color: '#1f2937'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(156, 163, 175, 0.2)'
        },
        ticks: {
          color: '#6b7280'
        }
      },
      x: {
        grid: {
          color: 'rgba(156, 163, 175, 0.2)'
        },
        ticks: {
          color: '#6b7280'
        }
      }
    },
    animation: {
      duration: chartsLoaded ? 2000 : 0,
      easing: 'easeInOutQuart'
    }
  };

  // Function to export data as CSV
  const exportToCSV = () => {
    const csvData = studentsData.map(student => ({
      'First Name': student.first_name,
      'Last Name': student.last_name,
      'Email': student.email_id,
      'Department': student.department,
      'Batch': student.batch_no,
      'Gender': student.gender,
      'SGPI': student.current_sgpi || 'N/A'
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'faculty_dashboard_data.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6">
      {/* Header with Export Button */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Faculty Dashboard Analytics
          </h1>
          <p className="text-gray-600 mt-2">Comprehensive student data visualization and insights</p>
        </div>
        
        {/* Export CSV Button - Top Right Corner */}
        <button
          onClick={exportToCSV}
          className="group bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-3"
        >
          <Download className="w-5 h-5 group-hover:animate-bounce" />
          Export CSV
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Students</p>
              <p className="text-3xl font-bold">{studentsData.length}</p>
            </div>
            <Users className="w-12 h-12 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Total Activities</p>
              <p className="text-3xl font-bold">{activitiesData.reduce((sum, item) => sum + item.count, 0)}</p>
            </div>
            <FileText className="w-12 h-12 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm font-medium">Active Internships</p>
              <p className="text-3xl font-bold">{internshipsData.reduce((sum, item) => sum + item.count, 0)}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-emerald-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-red-600 p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Courses Completed</p>
              <p className="text-3xl font-bold">{coursesData.reduce((sum, item) => sum + item.count, 0)}</p>
            </div>
            <FileText className="w-12 h-12 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Charts Container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bar Chart */}
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20">
          <div className="h-80">
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20">
          <div className="h-80">
            <Pie data={pieChartData} options={pieChartOptions} />
          </div>
        </div>

        {/* Line Chart - Full Width */}
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20">
          <div className="h-80">
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </div>
      </div>

      {/* Additional Statistics */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-indigo-50 to-blue-100 p-6 rounded-2xl border border-indigo-200">
          <h3 className="text-lg font-semibold text-indigo-800 mb-2">Gender Distribution</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-indigo-700">Male</span>
              <span className="font-semibold text-indigo-800">
                {studentsData.filter(s => s.gender === 'Male').length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-indigo-700">Female</span>
              <span className="font-semibold text-indigo-800">
                {studentsData.filter(s => s.gender === 'Female').length}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-100 p-6 rounded-2xl border border-purple-200">
          <h3 className="text-lg font-semibold text-purple-800 mb-2">Average SGPI</h3>
          <div className="text-3xl font-bold text-purple-800">
            {(studentsData.filter(s => s.current_sgpi).reduce((sum, s) => sum + s.current_sgpi, 0) / 
             studentsData.filter(s => s.current_sgpi).length).toFixed(2)}
          </div>
          <p className="text-sm text-purple-600 mt-1">Across all students</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-teal-100 p-6 rounded-2xl border border-emerald-200">
          <h3 className="text-lg font-semibold text-emerald-800 mb-2">Department</h3>
          <div className="text-2xl font-bold text-emerald-800">INFT</div>
          <p className="text-sm text-emerald-600 mt-1">Information Technology</p>
        </div>
      </div>
    </div>
  );
};

export default Visuals;