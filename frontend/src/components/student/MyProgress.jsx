import React, { useContext, useEffect, useState } from 'react';
import { DataContext } from '../../context/DataContext';
import ReviewAttemptModal from './ReviewAttemptModal';
import { FaEye, FaDownload } from 'react-icons/fa';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Displays a student's progress by listing their completed quiz results.
 * Allows reviewing each attempt and downloading a detailed PDF report.
 */
const MyProgress = () => {
    // Access data-fetching functions and course list from the DataContext.
    const { fetchMyResults, courses, fetchCourses } = useContext(DataContext);
    
    // State for storing the student's quiz results.
    const [results, setResults] = useState([]);
    // State to manage the loading UI while data is fetched.
    const [loading, setLoading] = useState(true);
    // State to hold the specific quiz attempt being reviewed in the modal.
    const [reviewingAttempt, setReviewingAttempt] = useState(null);

    // Fetches quiz results and course data when the component mounts.
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            // Use Promise.all to fetch results and courses concurrently for efficiency.
            const [myResultsData] = await Promise.all([
                fetchMyResults(),
                fetchCourses() 
            ]);
            setResults(myResultsData);
            setLoading(false);
        };
        loadData();
    }, [fetchMyResults, fetchCourses]);

    /**
     * Finds the title of a course based on a quiz ID it contains.
     * @param {string} quizId - The ID of the quiz.
     * @returns {string} The title of the course or "Unknown Course".
     */
    const getCourseTitle = (quizId) => {
        const course = courses.find(c => c.quizzes && c.quizzes.some(q => q._id === quizId));
        return course ? course.title : "Unknown Course";
    };

    /**
     * Generates and triggers the download of a PDF report for a quiz result.
     * @param {object} result - The quiz result object.
     */
    const handleDownload = (result) => {
        if (!result || !result.quiz) return;

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        const margin = 15;
        let y = 20; // Vertical position tracker.

        // Helper function to add headers and footers to each page.
        const addHeaderAndFooter = () => {
            doc.setFontSize(10);
            doc.setTextColor(150);
            doc.text(`Quiz Review: ${result.quiz.title}`, margin, 10);
            const pageCount = doc.internal.getNumberOfPages();
            doc.text(`Page ${pageCount}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
        };

        addHeaderAndFooter();

        // Add main title and summary.
        doc.setFontSize(22);
        doc.setFont(undefined, 'bold');
        doc.setTextColor('#1a202c');
        doc.text("Quiz Result", pageWidth / 2, y, { align: 'center' });
        y += 20;

        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        doc.text(`Course: ${getCourseTitle(result.quiz._id)}`, margin, y);
        doc.text(`Final Score: ${result.score} / ${result.quiz.questions.length}`, pageWidth - margin, y, { align: 'right' });
        y += 10;
        doc.line(margin, y - 4, pageWidth - margin, y - 4); // Horizontal line.
        y += 5;

        // Iterate through each question and add it to the PDF.
        result.quiz.questions.forEach((question, index) => {
            const userAnswerObj = result.answers.find(a => a.questionId === question._id);
            const userAnswer = userAnswerObj ? userAnswerObj.selectedAnswer : 'Not Answered';

            // Handle text wrapping for long questions.
            const questionTextLines = doc.splitTextToSize(`${index + 1}. ${question.questionText}`, pageWidth - margin * 2);

            // Check if there is enough space on the page for the next question block.
            const blockHeight = (questionTextLines.length * 7) + (question.options.length * 8) + 10;
            if (y + blockHeight > pageHeight - 20) {
                doc.addPage();
                addHeaderAndFooter();
                y = 20; // Reset vertical position for the new page.
            }

            // Add question text.
            doc.setFontSize(11);
            doc.setFont(undefined, 'bold');
            doc.setTextColor('#2d3748');
            doc.text(questionTextLines, margin, y);
            y += (questionTextLines.length * 6) + 5;
            
            doc.setFontSize(10);
            doc.setFont(undefined, 'normal'); 

            // Add options with color-coding for correctness.
            question.options.forEach(option => {
                const isUserChoice = userAnswer === option;
                const isCorrectChoice = question.correctAnswer === option;
                const indicator = isCorrectChoice ? '✓' : '✗';
                
                // Set text color based on answer status.
                if (isCorrectChoice) {
                    doc.setTextColor('#2f855a'); // Green for correct.
                } else if (isUserChoice && !isCorrectChoice) {
                    doc.setTextColor('#c53030'); // Red for user's incorrect choice.
                } else {
                    doc.setTextColor('#4a5568'); // Gray for other incorrect options.
                }

                let line = `${indicator} ${option}`;
                if (isUserChoice) line += " (Your Answer)";
                
                doc.text(line, margin + 5, y);
                y += 7;
            });
            
            doc.setTextColor('#2d3748'); // Reset color for the next question.
            y += 10;
        });
        
        // Sanitize the title for a safe filename and save the PDF.
        const safeTitle = result.quiz.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        doc.save(`result_${safeTitle}.pdf`);
    };


    // Display a loading indicator while fetching data.
    if (loading) return <p className="text-center text-gray-500 py-10">Loading your progress...</p>;
    
    return (
        <div>
            {/* The modal for reviewing a specific quiz attempt, shown when 'reviewingAttempt' is not null. */}
            {reviewingAttempt && (
                <ReviewAttemptModal
                    attempt={reviewingAttempt}
                    onClose={() => setReviewingAttempt(null)}
                />
            )}

            <h2 className="text-2xl font-bold text-gray-800 mb-6">My Progress Overview</h2>
            
            {/* Conditionally render based on whether the user has any quiz results. */}
            {results.length === 0 ? (
                // Message shown when no results are available.
                <div className="text-center py-16 text-gray-500 bg-gray-50 rounded-lg">
                    <p className="text-lg font-medium">You haven't completed any quizzes yet.</p>
                </div>
            ) : (
                // List of quiz results.
                <div className="bg-white shadow-sm rounded-lg overflow-hidden border">
                    <ul className="divide-y divide-gray-200">
                        {results.map(result => {
                            // Failsafe: Don't render if a result is missing its quiz data.
                            if (!result.quiz) return null;
                            
                            return (
                                <li key={result._id} className="px-6 py-4">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                                        {/* Quiz and Course Title */}
                                        <div className="mb-3 sm:mb-0">
                                            <p className="text-md font-semibold text-gray-900">{result.quiz.title}</p>
                                            <p className="text-sm text-gray-500">Course: {getCourseTitle(result.quiz._id)}</p>
                                        </div>
                                        {/* Score and Action Buttons */}
                                        <div className="flex items-center space-x-2 sm:space-x-4">
                                            <div className="flex items-baseline bg-blue-50 text-blue-700 font-bold px-3 py-1 rounded-full">
                                                <p className="text-lg">{result.score}</p>
                                                <p className="text-sm ml-1">/ {result.quiz.questions.length}</p>
                                            </div>
                                            <button 
                                                onClick={() => setReviewingAttempt(result)}
                                                className="flex items-center text-sm bg-gray-100 text-gray-700 py-2 px-3 rounded-md font-medium hover:bg-gray-200 border"
                                            >
                                                <FaEye className="mr-2" /> Review
                                            </button>
                                            <button 
                                                onClick={() => handleDownload(result)}
                                                className="flex items-center text-sm bg-gray-100 text-gray-700 py-2 px-3 rounded-md font-medium hover:bg-gray-200 border"
                                            >
                                                <FaDownload className="mr-2" /> Download PDF
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default MyProgress;