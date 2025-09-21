import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import { DataContext } from '../context/DataContext';

/**
 * A page component that provides the interface for a student to take a quiz.
 * It handles fetching the quiz, recording answers, submission, and displaying the final score.
 */
const QuizTakingPage = () => {
    // Get the quizId from the URL to know which quiz to fetch.
    const { quizId } = useParams();
    // Hook for programmatic navigation (e.g., after viewing results).
    const navigate = useNavigate();
    // Access data-fetching functions from the global DataContext.
    const { fetchQuizToTake, submitQuiz } = useContext(DataContext);

    // State to hold the quiz data (questions, options, etc.).
    const [quiz, setQuiz] = useState(null);
    // State to store the student's selected answers, keyed by questionId.
    const [answers, setAnswers] = useState({});
    // State for the initial loading of the quiz.
    const [loading, setLoading] = useState(true);
    // State to manage the UI during the submission process.
    const [submitting, setSubmitting] = useState(false);
    // State to hold the quiz result after submission, which triggers the results view.
    const [result, setResult] = useState(null);

    // Effect to fetch the quiz data when the component mounts.
    useEffect(() => {
        const loadQuiz = async () => {
            const quizData = await fetchQuizToTake(quizId);
            setQuiz(quizData);
            setLoading(false);
        };
        loadQuiz();
    }, [quizId, fetchQuizToTake]);

    /**
     * Updates the answers state when a user selects an option for a question.
     * @param {string} questionId - The ID of the question.
     * @param {string} selectedAnswer - The answer option selected by the user.
     */
    const handleOptionChange = (questionId, selectedAnswer) => {
        setAnswers(prev => ({ ...prev, [questionId]: selectedAnswer }));
    };

    /**
     * Handles the submission of the completed quiz.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        // Format the answers from an object to the array structure required by the API.
        const submissionData = Object.entries(answers).map(([questionId, selectedAnswer]) => ({
            questionId,
            selectedAnswer,
        }));
        const quizResult = await submitQuiz(quizId, submissionData);
        // Storing the result triggers the conditional render of the score screen.
        setResult(quizResult);
        setSubmitting(false);
    };

    // --- Render Logic ---

    // 1. Initial loading state.
    if (loading) return <div className="text-center p-10">Loading Quiz...</div>;
    // 2. Error state if quiz could not be fetched.
    if (!quiz) return <div className="text-center p-10">Quiz not found.</div>;

    // 3. Render the results screen after the quiz has been submitted and a result is available.
    if (result) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <main className="max-w-2xl mx-auto py-10 sm:px-6 lg:px-8 text-center">
                    <div className="bg-white p-8 rounded-lg shadow-lg">
                        <h1 className="text-3xl font-bold text-gray-800">Quiz Submitted!</h1>
                        <p className="text-lg text-gray-600 mt-4">Your Score:</p>
                        <p className="text-6xl font-bold text-blue-600 my-4">
                            {result.score} <span className="text-3xl text-gray-500">/ {result.totalQuestions}</span>
                        </p>
                        <button onClick={() => navigate(-1)} className="mt-6 bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700">
                            Back to Course
                        </button>
                    </div>
                </main>
            </div>
        );
    }
    
    // 4. Render the main quiz-taking interface.
    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="max-w-3xl mx-auto py-8 sm:px-6 lg:px-8">
                <form onSubmit={handleSubmit}>
                    <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg">
                        <h1 className="text-3xl font-bold text-gray-800 border-b pb-4 mb-6">{quiz.title}</h1>
                        <div className="space-y-8">
                            {/* Map through each question to render it. */}
                            {quiz.questions.map((q, index) => (
                                <div key={q._id}>
                                    <p className="font-semibold text-lg mb-3">{index + 1}. {q.questionText}</p>
                                    <div className="space-y-2">
                                        {/* Map through options for each question. */}
                                        {q.options.map((option, optIndex) => (
                                            <label key={optIndex} className="flex items-center p-3 border rounded-md cursor-pointer transition-colors hover:bg-gray-50 has-[:checked]:bg-blue-50 has-[:checked]:border-blue-400 has-[:checked]:ring-1 has-[:checked]:ring-blue-400">
                                                <input
                                                    type="radio"
                                                    name={q._id} // Group radio buttons by question
                                                    value={option}
                                                    required
                                                    onChange={() => handleOptionChange(q._id, option)}
                                                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                                />
                                                <span className="ml-3 text-gray-700">{option}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 border-t pt-6 text-right">
                            {/* Submit button is disabled during submission. */}
                            <button type="submit" disabled={submitting} className="bg-blue-600 text-white py-2 px-8 rounded-md hover:bg-blue-700 disabled:opacity-50 font-semibold transition-colors">
                                {submitting ? 'Submitting...' : 'Submit Answers'}
                            </button>
                        </div>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default QuizTakingPage;