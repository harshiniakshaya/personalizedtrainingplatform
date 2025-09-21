import React from 'react';
import { FaTimes, FaCheck, FaArrowRight } from 'react-icons/fa';

/**
 * A modal for displaying a detailed, question-by-question review of a quiz attempt.
 * @param {object} props - The component's props.
 * @param {object} props.attempt - The full result object, including quiz data and user answers.
 * @param {Function} props.onClose - Function to call to close the modal.
 */
const ReviewAttemptModal = ({ attempt, onClose }) => {
    // Do not render the modal if no attempt data is provided.
    if (!attempt) return null;

    // Destructure necessary data from the attempt prop for easier access.
    const { quiz, answers, score } = attempt;
    const totalQuestions = quiz.questions.length;

    return (
        // Modal backdrop and container.
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col">
                {/* Modal Header */}
                <div className="p-5 border-b">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Review Quiz</h2>
                            <p className="text-sm text-gray-500">{quiz.title}</p>
                        </div>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><FaTimes size={20} /></button>
                    </div>
                    {/* Final Score Banner */}
                    <div className="mt-4 text-center bg-blue-50 p-3 rounded-lg">
                        <span className="font-bold text-blue-700 text-lg">Final Score: {score} / {totalQuestions}</span>
                    </div>
                </div>

                {/* Scrollable list of questions and answers. */}
                <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
                    {quiz.questions.map((question, index) => {
                        // Find the user's answer for the current question.
                        const userAnswerObj = answers.find(a => a.questionId === question._id);
                        const userAnswer = userAnswerObj?.selectedAnswer;
                        const isCorrect = userAnswer === question.correctAnswer;

                        return (
                            <div key={question._id} className="border-b pb-4">
                                <p className="font-semibold text-gray-800 mb-3">{index + 1}. {question.questionText}</p>
                                <div className="space-y-2">
                                    {/* Map through each option for the current question. */}
                                    {question.options.map((option, optIndex) => {
                                        let optionStyle = 'border-gray-300'; // Default style.
                                        const isUserChoice = userAnswer === option;
                                        const isCorrectChoice = question.correctAnswer === option;

                                        // Apply conditional styling based on correctness.
                                        if (isCorrectChoice) {
                                            // Highlight the correct answer in green.
                                            optionStyle = 'bg-green-50 border-green-400 ring-1 ring-green-400';
                                        } else if (isUserChoice && !isCorrectChoice) {
                                            // Highlight the user's incorrect choice in red.
                                            optionStyle = 'bg-red-50 border-red-400 ring-1 ring-red-400';
                                        }

                                        return (
                                            <div
                                                key={optIndex}
                                                className={`flex items-center p-3 border rounded-md text-sm ${optionStyle}`}
                                            >
                                                {/* Arrow indicates the user's selected answer. */}
                                                {isUserChoice && <FaArrowRight className={`mr-3 ${isCorrect ? 'text-green-600' : 'text-red-600'}`} />}
                                                
                                                <span className={`${isCorrectChoice ? 'font-bold text-green-800' : ''}`}>{option}</span>
                                                
                                                {/* Checkmark indicates the correct answer. */}
                                                {isCorrectChoice && <FaCheck className="ml-auto text-green-600" />}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Modal Footer */}
                <div className="p-4 border-t bg-gray-50 flex justify-end rounded-b-lg">
                    <button onClick={onClose} className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReviewAttemptModal;