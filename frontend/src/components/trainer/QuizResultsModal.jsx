import React, { useState, useEffect, useContext } from 'react';
import { FaTimes, FaUserGraduate, FaChevronDown, FaChevronUp, FaArrowRight, FaCheck } from 'react-icons/fa';
import { DataContext } from '../../context/DataContext';

/**
 * A modal that displays all student results for a specific quiz.
 * Features summary statistics and an expandable, detailed review for each student's attempt.
 * @param {object} props - The component's props.
 * @param {object} props.quiz - The quiz for which to display results.
 * @param {Function} props.onClose - Callback function to close the modal.
 */
const QuizResultsModal = ({ quiz, onClose }) => {
    // Access the data-fetching function from the global context.
    const { fetchQuizResults } = useContext(DataContext);
    
    // State to store the fetched results for this quiz.
    const [results, setResults] = useState([]);
    // State to manage the loading UI while fetching data.
    const [loading, setLoading] = useState(true);
    // State to control which student's detailed result is currently expanded (accordion-style).
    const [expandedStudentId, setExpandedStudentId] = useState(null);

    // Effect to fetch the quiz results when the modal opens or the quiz prop changes.
    useEffect(() => {
        const loadResults = async () => {
            setLoading(true);
            const data = await fetchQuizResults(quiz._id);
            setResults(data);
            setLoading(false);
        };
        if (quiz) {
            loadResults();
        }
    }, [quiz, fetchQuizResults]);

    /**
     * Toggles the expanded view for a specific student's result.
     * @param {string} studentId - The ID of the student whose view to toggle.
     */
    const toggleExpansion = (studentId) => {
        setExpandedStudentId(prevId => (prevId === studentId ? null : studentId));
    };

    // Calculate summary statistics from the fetched results.
    const stats = {
        totalSubmissions: results.length,
        avgScore: results.length > 0 ? Math.round(results.reduce((acc, r) => acc + r.score, 0) / results.length) : 0,
        totalMarks: quiz.questions?.length || 0
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl flex flex-col">
                {/* Modal Header */}
                <div className="p-6 border-b">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Quiz Results</h2>
                            <p className="text-sm text-gray-500">{quiz.title}</p>
                        </div>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><FaTimes size={20} /></button>
                    </div>
                </div>

                {/* Scrollable Modal Body */}
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                    {loading ? (
                        <p className="text-center py-10">Loading results...</p>
                    ) : (
                        <>
                            {/* Statistics Summary Card */}
                            <div className="bg-gray-50 rounded-lg p-4 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center border">
                                <div><div className="text-3xl font-bold text-blue-600">{stats.totalSubmissions}</div><div className="text-sm text-gray-600 font-medium">Submissions</div></div>
                                <div><div className="text-3xl font-bold text-green-600">{stats.avgScore} <span className="text-xl">/ {stats.totalMarks}</span></div><div className="text-sm text-gray-600 font-medium">Average Score</div></div>
                            </div>

                            {/* Conditionally render the list of results or a "no results" message. */}
                            {results.length === 0 ? (
                                <div className="text-center py-12 text-gray-500"><FaUserGraduate className="mx-auto text-4xl mb-4" /><p className="text-lg">No one has taken this quiz yet.</p></div>
                            ) : (
                                <div className="space-y-3">
                                    {/* Map through each result to create a collapsible entry for each student. */}
                                    {results.map((result) => (
                                        <div key={result._id} className="border rounded-lg bg-white">
                                            {/* Clickable header to toggle the detailed view. */}
                                            <div className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50" onClick={() => toggleExpansion(result.student._id)}>
                                                <div>
                                                    <h4 className="font-semibold text-gray-800">{result.student.name}</h4>
                                                    <div className="text-sm text-gray-500">{result.student.email}</div>
                                                </div>
                                                <div className="flex items-center">
                                                    <span className="font-bold text-lg text-blue-600 mr-4">{result.score}/{stats.totalMarks}</span>
                                                    {expandedStudentId === result.student._id ? <FaChevronUp className="text-gray-400"/> : <FaChevronDown className="text-gray-400"/>}
                                                </div>
                                            </div>

                                            {/* Conditionally render the detailed answer review when expanded. */}
                                            {expandedStudentId === result.student._id && (
                                                <div className="border-t p-4 space-y-4">
                                                    <h5 className="font-semibold">Answer Review</h5>
                                                    {/* Map through the original quiz questions to show a full review. */}
                                                    {quiz.questions.map((question, index) => {
                                                        const userAnswerObj = result.answers.find(a => a.questionId === question._id);
                                                        const userAnswer = userAnswerObj?.selectedAnswer;
                                                        const isCorrect = userAnswer === question.correctAnswer;

                                                        return (
                                                            <div key={question._id} className="border-b pb-3">
                                                                <p className="font-medium text-gray-800 mb-2">{index + 1}. {question.questionText}</p>
                                                                <div className="space-y-2 text-sm">
                                                                    {/* Map through options to display them with conditional styling. */}
                                                                    {question.options.map((option, optIndex) => {
                                                                        const isUserChoice = userAnswer === option;
                                                                        const isCorrectChoice = question.correctAnswer === option;
                                                                        let styles = 'border-gray-300'; // Default
                                                                        if (isCorrectChoice) styles = 'bg-green-100 border-green-400'; // Correct answer
                                                                        if (isUserChoice && !isCorrectChoice) styles = 'bg-red-100 border-red-400'; // User's wrong answer
                                                                        
                                                                        return (
                                                                            <div key={optIndex} className={`flex items-center p-2 border rounded-md ${styles}`}>
                                                                                {isUserChoice && <FaArrowRight className={`mr-2 h-3 w-3 ${isCorrect ? 'text-green-600' : 'text-red-600'}`} />}
                                                                                <span className={`${isCorrectChoice ? 'font-bold text-green-800' : ''}`}>{option}</span>
                                                                                {isCorrectChoice && <FaCheck className="ml-auto text-green-600" />}
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
                 {/* Modal Footer */}
                <div className="p-4 border-t bg-gray-50 flex justify-end rounded-b-lg">
                    <button onClick={onClose} className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300">Close</button>
                </div>
            </div>
        </div>
    );
};

export default QuizResultsModal;