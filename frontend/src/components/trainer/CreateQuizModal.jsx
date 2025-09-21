import React, { useState, useContext } from 'react';
import { FaPlus, FaTrash, FaTimes, FaFileImport, FaPencilAlt } from 'react-icons/fa';
import { DataContext } from '../../context/DataContext';

/**
 * A controlled component for editing a single quiz question.
 * It's used within the manual quiz builder.
 * @param {object} props - The component's props.
 * @param {object} props.question - The question object to be edited.
 * @param {number} props.index - The display index of the question.
 * @param {Function} props.onUpdate - Callback to update the question state in the parent component.
 * @param {Function} props.onRemove - Callback to remove the question from the parent component.
 */
const QuestionEditor = ({ question, index, onUpdate, onRemove }) => {
    // Lifts state changes for any field up to the parent component.
    const handleInputChange = (field, value) => {
        onUpdate(question.id, { ...question, [field]: value });
    };

    // Handles changes to a specific option's text.
    const handleOptionChange = (optIndex, value) => {
        const newOptions = [...question.options];
        newOptions[optIndex] = value;
        onUpdate(question.id, { ...question, options: newOptions });
    };

    // Handles setting the correct answer when a radio button is selected.
    const handleCorrectAnswerChange = (value) => {
        onUpdate(question.id, { ...question, correctAnswer: value });
    };

    return (
        <div className="border rounded-lg p-4 bg-gray-50 relative shadow-sm">
            <div className="flex justify-between items-center mb-3">
                <p className="font-semibold text-gray-700">Question {index + 1}</p>
                <button type="button" onClick={() => onRemove(question.id)} className="text-red-500 hover:text-red-700">
                    <FaTrash />
                </button>
            </div>
            <div className="space-y-3">
                <div>
                    <label className="text-sm font-medium text-gray-600">Question Text</label>
                    <textarea
                        required
                        className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={question.questionText}
                        onChange={(e) => handleInputChange('questionText', e.target.value)}
                        placeholder="e.g., What is the capital of France?"
                        rows={2}
                    ></textarea>
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-600">Options</label>
                    <div className="space-y-2 mt-1">
                        {question.options.map((opt, optIndex) => (
                            <div key={optIndex} className="flex items-center">
                                {/* Radio button to select the correct answer */}
                                <input
                                    type="radio"
                                    name={`correctAnswer-${question.id}`}
                                    required
                                    className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                    checked={question.correctAnswer === opt}
                                    onChange={() => handleCorrectAnswerChange(opt)}
                                />
                                {/* Text input for the option content */}
                                <input
                                    type="text"
                                    required
                                    className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={opt}
                                    onChange={(e) => handleOptionChange(optIndex, e.target.value)}
                                    placeholder={`Option ${optIndex + 1}`}
                                />
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Select the radio button for the correct answer.</p>
                </div>
            </div>
        </div>
    );
};


/**
 * A modal for creating a new quiz, offering two methods: a manual builder or importing from JSON.
 * @param {object} props - The component's props.
 * @param {object} props.course - The course to which this quiz will be added.
 * @param {Function} props.onClose - Callback to close the modal.
 */
const CreateQuizModal = ({ course, onClose }) => {
    const { addQuiz } = useContext(DataContext);
    // State to toggle between the 'manual' builder and 'json' import views.
    const [creationMethod, setCreationMethod] = useState('manual');
    
    // State for quiz properties.
    const [title, setTitle] = useState('');
    const [questions, setQuestions] = useState([createNewQuestion()]); // Start with one empty question.
    const [jsonInput, setJsonInput] = useState('');
    
    // State for error handling and loading indicators.
    const [jsonError, setJsonError] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    /**
     * Factory function to create a new, empty question object with a temporary unique ID.
     */
    function createNewQuestion() {
        // Temp ID is used for key prop and client-side manipulation before being stripped for submission.
        return { id: `temp_${Date.now()}`, questionText: '', options: ['', '', ''], correctAnswer: '' };
    }

    // --- CRUD functions for managing questions in the manual builder ---
    const handleUpdateQuestion = (id, updatedQuestion) => {
        setQuestions(prev => prev.map(q => (q.id === id) ? updatedQuestion : q));
    };

    const handleAddQuestion = () => {
        setQuestions(prev => [...prev, createNewQuestion()]);
    };

    const handleRemoveQuestion = (id) => {
        // Prevent removing the last question to ensure there's always at least one.
        if (questions.length > 1) {
            setQuestions(prev => prev.filter(q => q.id !== id));
        }
    };

    /**
     * Parses and validates the JSON input, then loads it into the manual builder for review.
     */
    const handleJsonImport = () => {
        setJsonError('');
        setError('');
        try {
            const parsedData = JSON.parse(jsonInput);
            // Basic validation of the JSON structure.
            if (!parsedData.title || !Array.isArray(parsedData.questions)) {
                throw new Error("JSON must have a 'title' (string) and 'questions' (array).");
            }
            const isValid = parsedData.questions.every(q => 
                q.questionText && Array.isArray(q.options) && q.correctAnswer
            );
            if (!isValid) {
                throw new Error("Each question object must have 'questionText', 'options', and 'correctAnswer'.");
            }

            // Populate the form state with the imported data.
            setTitle(parsedData.title);
            setQuestions(parsedData.questions.map(q => ({ ...q, id: `temp_${Date.now()}_${Math.random()}` })));
            
            // Switch to the manual view so the user can review/edit the imported questions.
            setCreationMethod('manual'); 
        } catch (e) {
            setJsonError(`Invalid JSON format: ${e.message}`);
        }
    };

    /**
     * Handles the final submission of the quiz to the server.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (title.trim() === '' || questions.length === 0) {
            setError('Quiz title and at least one question are required.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            // Prepare data for the API: remove the temporary client-side 'id' from each question.
            const quizData = { title, courseId: course._id, questions: questions.map(({ id, ...rest }) => rest) };
            await addQuiz(quizData);
            onClose(); // Close the modal on success.
        } catch (err) {
            setError('Failed to create quiz. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    
    // Example JSON structure for the guide.
    const jsonFormatGuide = `{
  "title": "Your Quiz Title",
  "questions": [
    {
      "questionText": "What is 2 + 2?",
      "options": ["3", "4", "5"],
      "correctAnswer": "4"
    }
  ]
}`;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl flex flex-col">
                {/* Modal Header */}
                <div className="p-6 border-b">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Create New Quiz</h2>
                            <p className="text-sm text-gray-500">For course: {course.title}</p>
                        </div>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><FaTimes size={20} /></button>
                    </div>
                </div>

                {/* Tabs for switching between creation methods */}
                <div className="flex border-b">
                    <button onClick={() => setCreationMethod('manual')} className={`flex-1 p-3 font-medium text-sm flex justify-center items-center transition-colors ${creationMethod === 'manual' ? 'bg-gray-100 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}>
                        <FaPencilAlt className="mr-2"/> Manual Builder
                    </button>
                    <button onClick={() => setCreationMethod('json')} className={`flex-1 p-3 font-medium text-sm flex justify-center items-center transition-colors ${creationMethod === 'json' ? 'bg-gray-100 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}>
                        <FaFileImport className="mr-2"/> Import from JSON
                    </button>
                </div>

                {/* Conditional rendering of the selected creation method view */}
                {creationMethod === 'manual' ? (
                    // Manual Builder View
                    <form onSubmit={handleSubmit} className="flex-grow contents">
                        <div className="p-6 max-h-[65vh] overflow-y-auto space-y-6">
                            {error && <div className="bg-red-100 text-red-700 p-3 rounded">{error}</div>}
                            <div>
                                <label htmlFor="quizTitle" className="block text-sm font-medium text-gray-700 mb-1">Quiz Title</label>
                                <input type="text" id="quizTitle" required className="w-full p-2 border border-gray-300 rounded-md" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Java Basics Assessment" />
                            </div>
                            <div className="space-y-6">
                                {/* Render an editor for each question in the state */}
                                {questions.map((q, index) => (
                                    <QuestionEditor key={q.id} question={q} index={index} onUpdate={handleUpdateQuestion} onRemove={handleRemoveQuestion} />
                                ))}
                            </div>
                        </div>
                        {/* Footer with actions for the manual builder */}
                        <div className="p-6 border-t bg-gray-50 flex justify-between items-center rounded-b-lg">
                            <button type="button" onClick={handleAddQuestion} className="flex items-center text-blue-600 hover:text-blue-800 font-medium py-2 px-4 rounded-md border border-blue-600 hover:bg-blue-50">
                                <FaPlus className="mr-2" /> Add Question
                            </button>
                            <button type="submit" disabled={loading} className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 font-medium disabled:opacity-50">
                                {loading ? 'Creating...' : 'Create Quiz'}
                            </button>
                        </div>
                    </form>
                ) : (
                    // JSON Import View
                    <div className="p-6 max-h-[65vh] overflow-y-auto">
                        <h3 className="font-bold text-lg mb-2">Import Quiz from JSON</h3>
                        <p className="text-sm text-gray-600 mb-4">Paste your quiz JSON below. The questions will be loaded into the manual builder for final review.</p>
                        
                        <textarea
                            className="w-full h-48 p-2 border rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={jsonInput}
                            onChange={(e) => setJsonInput(e.target.value)}
                            placeholder="Paste your JSON here..."
                        />
                        {jsonError && <p className="text-red-500 text-sm mt-2">{jsonError}</p>}
                        
                        {/* A guide showing the required JSON format */}
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                            <h4 className="font-semibold text-sm mb-2">JSON Format Guide</h4>
                            <p className="text-xs text-gray-500 mb-2">Your JSON must match this structure exactly.</p>
                            <pre className="bg-white p-2 rounded border text-xs overflow-x-auto">
                                <code>{jsonFormatGuide}</code>
                            </pre>
                        </div>

                        {/* Footer with action for the JSON import */}
                        <div className="p-6 border-t bg-gray-50 flex justify-end items-center rounded-b-lg mt-4 -mx-6 -mb-6">
                            <button type="button" onClick={handleJsonImport} className="bg-blue-600 text-white py-2 px-6 rounded-md font-medium hover:bg-blue-700">
                                Import and Review
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreateQuizModal;