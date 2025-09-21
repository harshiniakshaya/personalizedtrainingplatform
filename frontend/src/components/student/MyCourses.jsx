import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataContext } from '../../context/DataContext';
import { FaBookOpen, FaUsers } from 'react-icons/fa';

/**
 * Renders a page displaying all the courses a student is currently enrolled in.
 */
const MyCourses = () => {
    // Access course data and the function to fetch them from the DataContext.
    const { courses, fetchCourses } = useContext(DataContext);
    // State to handle the loading UI while courses are being fetched.
    const [loading, setLoading] = useState(true);
    // Hook for programmatic navigation.
    const navigate = useNavigate();

    // Fetches the course data when the component first mounts.
    useEffect(() => {
        const loadData = async () => {
            await fetchCourses();
            setLoading(false); // Hides the loading indicator once data is fetched.
        };
        loadData();
    }, [fetchCourses]); // Dependency array ensures this runs only when fetchCourses changes.

    // Display a loading message while data is being fetched.
    if (loading) return <p className="text-center text-gray-500 py-10">Loading your courses...</p>;

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">My Enrolled Courses</h2>
            
            {/* Conditional rendering based on whether any courses were found. */}
            {courses.length === 0 ? (
                // Display a message if the user is not enrolled in any courses.
                <div className="text-center py-16 text-gray-500 bg-gray-50 rounded-lg">
                    <p className="text-lg font-medium">You are not enrolled in any courses yet.</p>
                </div>
            ) : (
                // Display a grid of course cards if courses exist.
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => (
                        // Each course card navigates to the course details page on click.
                        <div
                            key={course._id}
                            onClick={() => navigate(`/student/courses/${course._id}`)}
                            className="bg-white border rounded-lg overflow-hidden shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer group"
                        >
                            {/* Card Body */}
                            <div className="p-5">
                                <div className="flex items-start mb-3">
                                    <div className="p-3 bg-blue-100 rounded-full mr-4">
                                        <FaBookOpen className="text-blue-600 h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-800 group-hover:text-blue-600">{course.title}</h3>
                                        <p className="text-xs text-gray-500">Taught by {course.trainer.name}</p>
                                    </div>
                                </div>
                                <p className="text-gray-600 text-sm h-12 overflow-hidden">{course.description}</p>
                            </div>
                            
                            {/* Card Footer */}
                            <div className="px-5 py-3 bg-gray-50 border-t flex justify-end items-center text-sm text-gray-600 font-medium">
                                <span className="flex items-center">
                                    <FaUsers className="mr-2 text-gray-400" />
                                    {course.students?.length || 0} Enrolled
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyCourses;