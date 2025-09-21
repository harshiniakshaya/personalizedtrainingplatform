import React, { useState, useContext, useEffect } from 'react';
import { FaPlus, FaTrash, FaTimes, FaPencilAlt, FaFileCode } from 'react-icons/fa';
import { DataContext } from '../../context/DataContext';

/**
 * A reusable sub-component for editing a single quiz question within the manual builder.
 * It is a controlled component, lifting all state changes to its parent.
 * @param {object} props - The component's props.
 * @param {object} props.question - The question object to be edited.
 * @param {number} props.index - The display index of the question.
 * @param {Function} props.onUpdate - Callback to update the question state in the parent.
 * @param {Function} props.onRemove - Callback to remove the question in the parent.
 */
const QuestionEditor = ({ question, index, onUpdate, onRemove }) => {
    // Each handler calls the onUpdate prop to ensure the parent's state is the single source of truth.
    const handleInputChange = (field, value) => {
        onUpdate(question.id, { ...question, [field]: value });
    };

    const handleOptionChange = (optIndex, value) => {
        const newOptions = [...question.options];
        newOptions[optIndex] = value;
        onUpdate(question.id, { ...question, options: newOptions });
    };

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
                {/* Text area for the question itself */}
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
                {/* Inputs for the multiple-choice options */}
                <div>
                    <label className="text-sm font-medium text-gray-600">Options</label>
                    <div className="space-y-2 mt-1">
                        {question.options.map((opt, optIndex) => (
                            <div key={optIndex} className="flex items-center">
                                <input
                                    type="radio"
                                    name={`correctAnswer-${question.id}`}
                                    required
                                    className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                    checked={question.correctAnswer === opt}
                                    onChange={() => handleCorrectAnswerChange(opt)}
                                />
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
 * A modal for editing an existing quiz, offering two modes: a visual builder and a raw JSON editor.
 * @param {object} props - The component's props.
 * @param {object} props.quiz - The quiz object to be edited.
 * @param {Function} props.onClose - Callback to close the modal.
 */
const EditQuizModal = ({ quiz, onClose }) => {
    const { updateQuiz } = useContext(DataContext);

    // State to toggle between the 'manual' builder and 'json' editor.
    const [editMethod, setEditMethod] = useState('manual');
    
    // State for the quiz data being edited.
    const [title, setTitle] = useState('');
    const [questions, setQuestions] = useState([]);
    
    // State specific to the JSON editor view.
    const [jsonInput, setJsonInput] = useState('');
    const [jsonError, setJsonError] = useState('');

    // State for UI feedback.
    const [loading, setLoading] = useState(false);

    // Effect to initialize the component's state when the 'quiz' prop is provided.
    useEffect(() => {
        if (quiz) {
            setTitle(quiz.title);
            // Add a temporary client-side ID to each question for React key and state management.
            const questionsWithIds = quiz.questions.map(q => ({ ...q, id: q._id || `temp_${Math.random()}` }));
            setQuestions(questionsWithIds);

            // Generate the initial JSON string for the JSON editor from the quiz data.
            const initialJson = { title: quiz.title, questions: quiz.questions };
            setJsonInput(JSON.stringify(initialJson, null, 2)); // Pretty-print for readability.
        }
    }, [quiz]);

    // --- State management functions for the manual builder ---
    const handleUpdateQuestion = (id, updatedQuestion) => {
        setQuestions(prev => prev.map(q => (q.id === id) ? updatedQuestion : q));
    };

    const handleAddQuestion = () => {
        const newQuestion = { id: `temp_${Date.now()}`, questionText: '', options: ['', '', ''], correctAnswer: '' };
        setQuestions(prev => [...prev, newQuestion]);
    };

    const handleRemoveQuestion = (id) => {
        if (questions.length > 1) {
            setQuestions(prev => prev.filter(q => q.id !== id));
        }
    };
    
    /**
     * Parses and applies changes from the JSON editor to the component's main state.
     */
    const handleJsonApply = () => {
        setJsonError('');
        try {
            const parsedData = JSON.parse(jsonInput);
            // Basic validation of the JSON structure.
            if (!parsedData.title || !Array.isArray(parsedData.questions)) {
                throw new Error("JSON must have a 'title' (string) and 'questions' (array).");
            }
            // Update the main form state from the parsed JSON.
            setTitle(parsedData.title);
            setQuestions(parsedData.questions.map(q => ({ ...q, id: `temp_${Date.now()}_${Math.random()}` })));
            // Switch back to the manual builder to show the applied changes.
            setEditMethod('manual');
        } catch (e) {
            setJsonError(`Invalid JSON format: ${e.message}`);
        }
    };

    /**
     * Synchronizes the JSON editor with the current state of the manual builder before switching views.
     */
    const handleSwitchToJSON = () => {
        // Generate a fresh JSON string from the current 'title' and 'questions' state.
        const currentStateJson = { title, questions: questions.map(({id, ...rest}) => rest) };
        setJsonInput(JSON.stringify(currentStateJson, null, 2));
        setEditMethod('json');
    };

    /**
     * Handles the final submission of the edited quiz.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        // Prepare the data payload for the API.
        const quizData = {
            title,
            // Strip all temporary frontend IDs (_id and id) before sending to the backend.
            questions: questions.map(({ id, _id, ...rest }) => rest)
        };
        await updateQuiz(quiz._id, quizData);
        setLoading(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl flex flex-col">
                {/* Modal Header */}
                <div className="p-6 border-b">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-gray-800">Edit Quiz</h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><FaTimes size={20}/></button>
                    </div>
                </div>

                {/* Tabs to switch between editing modes */}
                <div className="flex border-b">
                    <button onClick={() => setEditMethod('manual')} className={`flex-1 p-3 font-medium text-sm flex justify-center items-center transition-colors ${editMethod === 'manual' ? 'bg-gray-100 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}>
                        <FaPencilAlt className="mr-2"/> Manual Builder
                    </button>
                    <button onClick={handleSwitchToJSON} className={`flex-1 p-3 font-medium text-sm flex justify-center items-center transition-colors ${editMethod === 'json' ? 'bg-gray-100 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}>
                        <FaFileCode className="mr-2"/> Edit JSON
                    </button>
                </div>

                {/* Conditionally render the selected editor view */}
                {editMethod === 'manual' ? (
                    // Manual Builder View
                    <form onSubmit={handleSubmit} className="flex-grow contents">
                        <div className="p-6 max-h-[65vh] overflow-y-auto space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Quiz Title</label>
                                <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full mt-1 p-2 border border-gray-300 rounded-md"/>
                            </div>
                            <div className="space-y-6">
                                {questions.map((q, index) => (
                                    <QuestionEditor key={q.id} question={q} index={index} onUpdate={handleUpdateQuestion} onRemove={handleRemoveQuestion} />
                                ))}
                            </div>
                        </div>
                        <div className="p-6 border-t bg-gray-50 flex justify-between items-center rounded-b-lg">
                            <button type="button" onClick={handleAddQuestion} className="flex items-center text-blue-600 font-medium py-2 px-4 rounded-md border border-blue-600 hover:bg-blue-50">
                                <FaPlus className="mr-2" /> Add Question
                            </button>
                            <button type="submit" disabled={loading} className="bg-blue-600 text-white py-2 px-6 rounded-md font-medium disabled:opacity-50 hover:bg-blue-700">
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                ) : (
                    // JSON Editor View
                    <div className="p-6 max-h-[65vh] overflow-y-auto">
                        <h3 className="font-bold text-lg mb-2">Edit Quiz as JSON</h3>
                        <p className="text-sm text-gray-600 mb-4">Modify the JSON below and click "Apply" to see the changes reflected in the manual builder.</p>
                        
                        <textarea
                            className="w-full h-64 p-2 border rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={jsonInput}
                            onChange={(e) => setJsonInput(e.target.value)}
                        />
                        {jsonError && <p className="text-red-500 text-sm mt-2">{jsonError}</p>}

                        <div className="p-6 border-t bg-gray-50 flex justify-end items-center rounded-b-lg mt-4 -mx-6 -mb-6">
                            <button type="button" onClick={handleJsonApply} className="bg-blue-600 text-white py-2 px-6 rounded-md font-medium hover:bg-blue-700">
                                Apply JSON and Review
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EditQuizModal;