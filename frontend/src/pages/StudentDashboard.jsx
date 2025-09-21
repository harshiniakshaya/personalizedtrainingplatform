import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import MyCourses from '../components/student/MyCourses';
import MyProgress from '../components/student/MyProgress';
import { FaBook, FaChartLine } from 'react-icons/fa';

/**
 * The main dashboard for students, featuring a tabbed interface to switch
 * between viewing enrolled courses and tracking overall progress.
 */
const StudentDashboard = () => {
    // Get the 'tab' parameter from the URL, defaulting to 'courses' if not present.
    // This allows the URL to control which view is active (e.g., /student/courses).
    const { tab = 'courses' } = useParams();

    /**
     * A reusable and navigation-aware button component for the tab interface.
     * It determines its active state based on the current URL parameter.
     * @param {object} props - The component's props.
     * @param {string} props.to - The URL slug for this tab (e.g., 'courses').
     * @param {React.ReactNode} props.icon - The icon to display on the tab.
     * @param {string} props.label - The text label for the tab.
     */
    const TabButton = ({ to, icon, label }) => {
        const isActive = tab === to;
        return (
            <Link
                to={`/student/${to}`}
                // Apply different styles based on whether the tab is currently active.
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                    isActive
                        ? 'border-blue-600 text-blue-600' // Active state
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300' // Inactive state
                }`}
            >
                {icon}
                <span className="ml-2">{label}</span>
            </Link>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
                <div className="px-4 sm:px-0">
                    <div className="bg-white rounded-lg shadow-sm">
                        {/* Tab Navigation Bar */}
                        <div className="border-b border-gray-200">
                            <nav className="flex space-x-2 px-4" aria-label="Tabs">
                                <TabButton to="courses" icon={<FaBook />} label="My Courses" />
                                <TabButton to="progress" icon={<FaChartLine />} label="My Progress" />
                            </nav>
                        </div>
                        {/* Tab Content Area */}
                        <div className="p-4 sm:p-6">
                            {/* Conditionally render the content based on the active tab from the URL. */}
                            {tab === 'courses' && <MyCourses />}
                            {tab === 'progress' && <MyProgress />}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default StudentDashboard;