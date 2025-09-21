import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaChalkboardTeacher, FaUserGraduate, FaBook, FaChartLine, FaClipboardCheck } from 'react-icons/fa';

/**
 * The main landing page for the application, intended for unauthenticated visitors.
 * It provides an overview of the platform's features and directs users to the login page.
 */
const HomePage = () => {
    // State to track the user's role selection ('trainer' or 'student') to enhance the login flow.
    const [selectedRole, setSelectedRole] = useState(null);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* --- Navigation Bar --- */}
            <nav className="bg-white shadow-sm">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center">
                        <div className="bg-blue-600 text-white p-2 rounded-lg mr-3">
                            <FaBook className="h-6 w-6" />
                        </div>
                        <h1 className="text-2xl font-bold text-blue-800">Learnix</h1>
                    </div>
                    <div className="flex space-x-4">
                        <Link to="/login" className="px-4 py-2 text-blue-600 hover:text-blue-800 font-medium">Login</Link>
                    </div>
                </div>
            </nav>

            {/* --- Hero Section --- */}
            <div className="container mx-auto px-4 py-16">
                <div className="flex flex-col md:flex-row items-center">
                    <div className="md:w-1/2 mb-10 md:mb-0">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                            Empower Your Teaching with <span className="text-blue-600">Learnix</span>
                        </h2>
                        <p className="text-lg text-gray-600 mb-8">
                            A comprehensive platform for trainers to create courses, track student progress, and administer quizzes - all in one place.
                        </p>
                        
                        {/* Interactive role selection for a guided login experience */}
                        <div className="mb-8">
                            <h3 className="text-xl font-semibold text-gray-700 mb-4">Login as:</h3>
                            <div className="flex space-x-4">
                                <button
                                    onClick={() => setSelectedRole('trainer')}
                                    className={`px-6 py-3 rounded-lg font-medium flex items-center ${
                                        selectedRole === 'trainer'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50'
                                    }`}
                                >
                                    <FaChalkboardTeacher className="mr-2" />
                                    Trainer
                                </button>
                                <button
                                    onClick={() => setSelectedRole('student')}
                                    className={`px-6 py-3 rounded-lg font-medium flex items-center ${
                                        selectedRole === 'student'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50'
                                    }`}
                                >
                                    <FaUserGraduate className="mr-2" />
                                    Student
                                </button>
                            </div>
                        </div>

                        {/* This button appears only after a role has been selected. */}
                        {selectedRole && (
                            // The selected role is passed via Link state to the login page.
                            <Link 
                                to="/login" 
                                state={{ role: selectedRole }}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-block font-medium"
                            >
                                Continue to Login
                            </Link>
                        )}
                    </div>
                    {/* Feature summary card */}
                    <div className="md:w-1/2">
                        <div className="bg-white p-6 rounded-xl shadow-lg">
                            <div className="flex items-center mb-6">
                                <div className="bg-blue-100 p-3 rounded-full mr-4">
                                    <FaChalkboardTeacher className="h-6 w-6 text-blue-600" />
                                </div>
                                <h3 className="text-xl font-semibold">For Trainers</h3>
                            </div>
                            <ul className="space-y-3">
                                <li className="flex items-center"><FaBook className="text-green-500 mr-2" /><span>Create and manage courses</span></li>
                                <li className="flex items-center"><FaClipboardCheck className="text-green-500 mr-2" /><span>Design interactive quizzes</span></li>
                                <li className="flex items-center"><FaChartLine className="text-green-500 mr-2" /><span>Track student progress and performance</span></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Key Features Section --- */}
            <div className="bg-white py-16">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Key Features</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="text-center p-6">
                            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><FaBook className="h-8 w-8 text-blue-600" /></div>
                            <h3 className="text-xl font-semibold mb-2">Course Management</h3>
                            <p className="text-gray-600">Create, organize, and manage your training materials with ease.</p>
                        </div>
                        {/* Feature 2 */}
                        <div className="text-center p-6">
                            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><FaClipboardCheck className="h-8 w-8 text-blue-600" /></div>
                            <h3 className="text-xl font-semibold mb-2">Quiz System</h3>
                            <p className="text-gray-600">Create assessments and track student performance.</p>
                        </div>
                        {/* Feature 3 */}
                        <div className="text-center p-6">
                            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><FaChartLine className="h-8 w-8 text-blue-600" /></div>
                            <h3 className="text-xl font-semibold mb-2">Progress Tracking</h3>
                            <p className="text-gray-600">Monitor student progress and identify areas for improvement.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Footer --- */}
            <footer className="bg-gray-800 text-white py-8">
                <div className="container mx-auto px-4 text-center">
                    <p>&copy; {new Date().getFullYear()} Learnix. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;