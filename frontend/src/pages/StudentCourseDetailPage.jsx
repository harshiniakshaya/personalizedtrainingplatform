import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import { DataContext } from '../context/DataContext';
import { FaArrowLeft, FaClipboardCheck, FaPlayCircle, FaCheckCircle } from 'react-icons/fa';

/**
 * A page that displays the details of a single course from a student's perspective.
 * It lists all quizzes for the course and shows whether each has been completed,
 * providing a link to take any incomplete quizzes.
 */
const StudentCourseDetailPage = () => {
    // Get the courseId from the URL to identify which course to display.
    const { courseId } = useParams();
    // Hook for programmatic navigation.
    const navigate = useNavigate();
    // Access data-fetching functions from the global DataContext.
    const { fetchCourseById, fetchMyResults } = useContext(DataContext);

    // State to hold the specific course object being viewed.
    const [course, setCourse] = useState(null);
    // State to hold all of the current student's quiz results across all courses.
    const [myResults, setMyResults] = useState([]);
    // State to manage the loading UI while fetching data.
    const [loading, setLoading] = useState(true);

    // Effect to fetch both course details and the student's results when the component mounts.
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            // Use Promise.all to fetch required data in parallel for better performance.
            const [courseData, resultsData] = await Promise.all([
                fetchCourseById(courseId),
                fetchMyResults()
            ]);
            setCourse(courseData);
            setMyResults(resultsData);
            setLoading(false);
        };
        loadData();
    }, [courseId, fetchCourseById, fetchMyResults]);

    /**
     * Checks if a specific quiz has been completed by the student.
     * @param {string} quizId - The ID of the quiz to check.
     * @returns {object|undefined} The result object if found, otherwise undefined.
     */
    const getQuizResult = (quizId) => {
        // Find the result in the student's results list that matches the given quiz ID.
        // The check for 'r.quiz' ensures the app doesn't crash if data is malformed.
        return myResults.find(r => r.quiz && r.quiz._id === quizId);
    };

    // --- Render Logic ---

    // 1. Display a loading indicator while data is being fetched.
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <main className="max-w-4xl mx-auto py-8 text-center">
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                    <p className="text-gray-600 mt-4">Loading course details...</p>
                </main>
            </div>
        );
    }
    
    // 2. Display an error message if the course could not be found.
    if (!course) {
        return (
             <div className="min-h-screen bg-gray-50">
                <Header />
                <main className="max-w-4xl mx-auto py-8 text-center">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                        <h1 className="text-xl font-bold text-yellow-800 mb-2">Course Not Found</h1>
                        <p className="text-yellow-600 mb-4">The course you are looking for does not exist or you may not be enrolled.</p>
                        <Link to="/student/courses" className="inline-flex items-center text-blue-600 hover:underline">
                            <FaArrowLeft className="mr-2" /> Go back to my courses
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    // 3. Render the main course detail view.
    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="max-w-4xl mx-auto py-8 sm:px-6 lg:px-8">
                <button onClick={() => navigate('/student/courses')} className="flex items-center text-blue-600 hover:underline mb-6 font-medium">
                    <FaArrowLeft className="mr-2" /> Back to My Courses
                </button>

                {/* Course Header */}
                <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                    <h1 className="text-4xl font-bold mb-2">{course.title}</h1>
                    <p className="text-gray-600">{course.description}</p>
                </div>

                {/* Quizzes List */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold flex items-center mb-4">
                        <FaClipboardCheck className="mr-3 text-green-500" /> Quizzes
                    </h2>
                    {course.quizzes?.length > 0 ? (
                        <ul className="space-y-3">
                            {/* Map through each quiz in the course. */}
                            {course.quizzes.map(quiz => {
                                // For each quiz, check if the student has a corresponding result.
                                const result = getQuizResult(quiz._id);
                                return (
                                    <li key={quiz._id} className="p-4 bg-gray-50 rounded-md flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                                        <span className="font-medium text-gray-800">{quiz.title}</span>
                                        {/* Conditionally render based on whether a result was found. */}
                                        {result ? (
                                            // If the quiz is completed, show the score and status.
                                            <div className="flex items-center space-x-4">
                                                <div className="text-sm text-gray-600 font-medium">
                                                    Score: <span className="font-bold text-blue-600">{result.score} / {quiz.questions.length}</span>
                                                </div>
                                                <div className="flex items-center text-sm bg-gray-200 text-gray-700 py-2 px-4 rounded-md font-medium">
                                                    <FaCheckCircle className="mr-2 text-green-500" /> Completed
                                                </div>
                                            </div>
                                        ) : (
                                            // If the quiz is not completed, show a link to start it.
                                            <Link
                                                to={`/student/quiz/${quiz._id}`}
                                                className="flex items-center text-sm bg-green-600 text-white py-2 px-4 rounded-md font-medium hover:bg-green-700 shadow-sm"
                                            >
                                                <FaPlayCircle className="mr-2" /> Start Quiz
                                            </Link>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <p className="text-gray-500 py-4 text-center">There are no quizzes for this course yet.</p>
                    )}
                </div>
            </main>
        </div>
    );
};

export default StudentCourseDetailPage;