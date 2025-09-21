import React, { useState } from 'react';
import Header from '../components/layout/Header';
import CourseList from '../components/trainer/CourseList';
import CourseDetailView from '../components/trainer/CourseDetailView';
import CreateCourse from '../components/trainer/CreateCourse';
import StudentList from '../components/trainer/StudentList';

/**
 * The main dashboard container for the Trainer role.
 * It uses a state-driven tab system to render different management views
 * such as the course list, course creation form, and student list.
 */
const TrainerDashboard = () => {
    // State to track the currently active tab (e.g., 'courses', 'create-course').
    const [activeTab, setActiveTab] = useState('courses');
    // State to hold the currently selected course for viewing its details.
    // This enables the master-detail view pattern within the 'courses' tab.
    const [selectedCourse, setSelectedCourse] = useState(null);

    /**
     * A callback function for the CreateCourse component. After a course is created,
     * it switches the view back to the 'courses' tab and shows the detail page for the new course.
     * @param {object} newCourse - The newly created course object.
     */
    const handleCourseCreated = (newCourse) => {
        setActiveTab('courses');
        setSelectedCourse(newCourse);
    };

    /**
     * A render function that acts like a client-side router, determining which
     * component to display based on the current 'activeTab' and 'selectedCourse' state.
     * @returns {React.ReactNode} The component to be rendered in the main content area.
     */
    const renderContent = () => {
        switch (activeTab) {
            case 'courses':
                // If a course is selected, show its detail view; otherwise, show the list of all courses.
                return selectedCourse ? (
                    <CourseDetailView
                        course={selectedCourse}
                        onBack={() => setSelectedCourse(null)} // The 'Back' button in the detail view clears the selection.
                    />
                ) : (
                    <CourseList onCourseSelect={setSelectedCourse} />
                );
            case 'create-course':
                return <CreateCourse onCourseCreated={handleCourseCreated} />;
            case 'my-students':
                return <StudentList />;
            default:
                return <CourseList onCourseSelect={setSelectedCourse} />;
        }
    };

    /**
     * A reusable button component for the tab navigation.
     * @param {object} props - The component's props.
     * @param {string} props.tabName - The identifier for the tab.
     * @param {string} props.label - The display text for the tab.
     */
    const TabButton = ({ tabName, label }) => (
        <button
            onClick={() => {
                // Set the new active tab.
                setActiveTab(tabName);
                // Reset selectedCourse to ensure a clean state when switching tabs.
                setSelectedCourse(null);
            }}
            // Dynamically applies styles based on whether this tab is the active one.
            className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                activeTab === tabName
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
        >
            {label}
        </button>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
                <div className="px-4 sm:px-0">
                    <div className="bg-white rounded-lg shadow-sm">
                        {/* Tab Navigation Bar */}
                        <div className="border-b border-gray-200">
                            <nav className="flex space-x-2 px-4" aria-label="Tabs">
                                <TabButton tabName="courses" label="My Courses" />
                                <TabButton tabName="create-course" label="Create Course" />
                                <TabButton tabName="my-students" label="My Students" />
                            </nav>
                        </div>
                        {/* Dynamic Content Area */}
                        <div className="p-4 sm:p-6 min-h-[60vh]">
                            {/* The renderContent function determines what is displayed here. */}
                            {renderContent()}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TrainerDashboard;