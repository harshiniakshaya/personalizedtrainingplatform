import React, { useContext, useEffect, useState } from "react";
import { FaUsers, FaClipboardList } from "react-icons/fa";
import { DataContext } from "../../context/DataContext";

/**
 * A component that fetches and displays a list of available courses.
 * Each course is rendered as a clickable card.
 * @param {object} props - The component's props.
 * @param {Function} props.onCourseSelect - Callback function triggered when a course card is clicked.
 */
const CourseList = ({ onCourseSelect }) => {
  // Access course data and fetching logic from the DataContext.
  const { courses, fetchCourses } = useContext(DataContext);
  // State to manage the loading indicator while fetching courses.
  const [loading, setLoading] = useState(true);

  // Effect to load the course data when the component first mounts.
  useEffect(() => {
    const loadCourses = async () => {
      await fetchCourses();
      setLoading(false);
    };
    loadCourses();
  }, [fetchCourses]); // Dependency array ensures this runs once.

  // Display a loading message while data is being fetched.
  if (loading) return <p className="text-center text-gray-500">Loading courses...</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">My Courses</h2>
      
      {/* Conditionally render based on whether any courses exist. */}
      {courses.length === 0 ? (
        // Display a message prompting the user to create a course if none exist.
        <div className="text-center py-16 text-gray-500 bg-gray-50 rounded-lg">
          <p className="text-lg font-medium">You haven't created any courses yet.</p>
          <p className="mt-1">Click the "Create Course" tab to get started!</p>
        </div>
      ) : (
        // Display a grid of course cards.
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            // Each card is clickable and triggers the onCourseSelect callback.
            <div
              key={course._id}
              onClick={() => onCourseSelect(course)}
              className="bg-white border rounded-lg overflow-hidden shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer"
            >
              {/* Card Body with course title and description. */}
              <div className="p-5">
                <h3 className="font-bold text-lg text-gray-800 truncate mb-2">{course.title}</h3>
                <p className="text-gray-600 text-sm mb-4 h-12 overflow-hidden">{course.description}</p>
              </div>
              {/* Card Footer with student and quiz counts. */}
              <div className="px-5 py-3 bg-gray-50 border-t flex justify-between items-center text-sm text-gray-600 font-medium">
                <span className="flex items-center">
                  <FaUsers className="mr-2 text-blue-500" />
                  {course.students?.length || 0} Students
                </span>
                <span className="flex items-center">
                  <FaClipboardList className="mr-2 text-green-500" />
                  {course.quizzes?.length || 0} Quizzes
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseList;