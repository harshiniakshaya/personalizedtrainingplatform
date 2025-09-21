import React, { useState, useContext } from 'react';
import { FaUsers, FaClipboardList, FaArrowLeft, FaPencilAlt, FaPlus, FaTrash, FaChartBar, FaChevronDown, FaChevronUp, FaChartPie } from 'react-icons/fa';
import { DataContext } from '../../context/DataContext';
import EditCourseModal from './EditCourseModal';
import CreateQuizModal from './CreateQuizModal';
import EditQuizModal from './EditQuizModal';
import QuizResultsModal from './QuizResultsModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import StudentReportModal from './StudentReportModal';

/**
 * A detailed view component for managing a single course.
 * It handles displaying course info, managing students, CRUD for quizzes, and viewing results.
 * @param {object} props - The component's props.
 * @param {object} props.course - The course object to display and manage.
 * @param {Function} props.onBack - Callback function to return to the previous view.
 */
const CourseDetailView = ({ course, onBack }) => {
    // Access data manipulation functions from the global context.
    const { updateCourse, deleteCourse, deleteQuiz } = useContext(DataContext);
    
    // A single state object to manage the visibility and data for all modals.
    // This pattern avoids multiple useState hooks and simplifies modal control.
    const [modalState, setModalState] = useState({
        editCourse: false,
        createQuiz: false,
        editQuiz: null,         // Holds the quiz object to edit
        viewResults: null,      // Holds the quiz object to view results for
        deleteItem: null,       // Holds { item, type } for deletion confirmation
        viewStudentReport: null // Holds the student object for the report modal
    });
    
    // State to manage the collapsible student list section.
    const [studentsVisible, setStudentsVisible] = useState(true);

    /**
     * Callback for the EditCourseModal to save changes to the course.
     */
    const handleSaveChanges = async (id, courseData) => {
        await updateCourse(id, courseData);
    };

    /**
     * Handles the confirmation of a delete action for either a course or a quiz.
     */
    const handleDelete = () => {
        if (!modalState.deleteItem) return;

        if (modalState.deleteItem.type === 'course') {
            deleteCourse(modalState.deleteItem.item._id);
            onBack(); // Navigate back after deleting the entire course.
        } else if (modalState.deleteItem.type === 'quiz') {
            deleteQuiz(modalState.deleteItem.item._id);
        }
        
        closeModal(); // Close the confirmation modal.
    };

    /**
     * Utility function to close any active modal by resetting the modal state.
     */
    const closeModal = () => {
        setModalState({
            editCourse: false,
            createQuiz: false,
            editQuiz: null,
            viewResults: null,
            deleteItem: null,
            viewStudentReport: null
        });
    };

    return (
        <div>
            {/* --- MODAL RENDERING --- */}
            {/* This section conditionally renders modals based on the modalState object. */}
            {modalState.editCourse && <EditCourseModal course={course} onClose={closeModal} onSave={handleSaveChanges} />}
            {modalState.createQuiz && <CreateQuizModal course={course} onClose={closeModal} />}
            {modalState.editQuiz && <EditQuizModal quiz={modalState.editQuiz} onClose={closeModal} />}
            {modalState.viewResults && <QuizResultsModal quiz={modalState.viewResults} onClose={closeModal} />}
            {modalState.viewStudentReport && <StudentReportModal student={modalState.viewStudentReport} course={course} onClose={closeModal} />}
            {modalState.deleteItem && (
                <DeleteConfirmationModal
                    isOpen={true}
                    onClose={closeModal}
                    onConfirm={handleDelete}
                    itemName={modalState.deleteItem.item.title}
                    itemType={modalState.deleteItem.type}
                />
            )}

            {/* --- HEADER & ACTIONS --- */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                <button onClick={onBack} className="flex items-center text-blue-600 hover:underline font-medium">
                    <FaArrowLeft className="mr-2" /> Back to All Courses
                </button>
                <button onClick={() => setModalState({...modalState, deleteItem: { item: course, type: 'course' }})} className="flex items-center text-sm text-red-600 bg-red-100 py-2 px-3 rounded-md font-medium hover:bg-red-200 self-start sm:self-center">
                    <FaTrash className="mr-2" /> Delete Course
                </button>
            </div>

            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-800">{course.title}</h1>
                <p className="text-lg text-gray-600 mt-2">{course.description}</p>
            </div>

            {/* --- MAIN CONTENT --- */}
            <div className="space-y-6">
                {/* Collapsible card for Enrolled Students */}
                <div className="bg-white rounded-lg shadow-sm border">
                    <div className="p-6 flex justify-between items-center cursor-pointer hover:bg-gray-50" onClick={() => setStudentsVisible(!studentsVisible)}>
                        <h2 className="text-xl font-bold flex items-center"><FaUsers className="mr-3 text-blue-500" />Enrolled Students</h2>
                        <div className="flex items-center">
                            <button onClick={(e) => { e.stopPropagation(); setModalState({...modalState, editCourse: true}) }} className="flex items-center text-sm text-blue-600 font-medium hover:underline mr-4">
                                <FaPencilAlt className="mr-1" /> Manage
                            </button>
                            {studentsVisible ? <FaChevronUp className="text-gray-500"/> : <FaChevronDown className="text-gray-500"/>}
                        </div>
                    </div>
                    {studentsVisible && (
                        <div className="px-6 pb-6 border-t pt-4">
                            {course.students?.length > 0 ? (
                                <ul className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                    {course.students.map(student => (
                                        <li key={student._id} className="p-3 bg-gray-50 rounded-md flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                                            <div>
                                                <span className="font-medium text-gray-700">{student.name}</span>
                                                <span className="text-gray-500 text-sm block sm:inline sm:ml-2">{student.email}</span>
                                            </div>
                                            <button onClick={() => setModalState({...modalState, viewStudentReport: student})} className="flex items-center text-xs bg-white text-gray-600 border py-1 px-3 rounded-md font-medium hover:bg-gray-100 hover:border-gray-400 self-end sm:self-center">
                                                <FaChartPie className="mr-2"/> View Report
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500 py-4 text-center">No students enrolled yet. Click "Manage" to add students.</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Card for Quizzes */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold flex items-center"><FaClipboardList className="mr-3 text-green-500" />Quizzes</h2>
                        <button onClick={() => setModalState({...modalState, createQuiz: true})} className="flex items-center text-sm bg-green-600 text-white py-2 px-3 rounded-md font-medium hover:bg-green-700 shadow-sm">
                            <FaPlus className="mr-2" /> Create Quiz
                        </button>
                    </div>
                     {course.quizzes?.length > 0 ? (
                        <ul className="space-y-3">
                            {course.quizzes.map(quiz => (
                                <li key={quiz._id} className="p-3 bg-gray-50 rounded-md">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium text-gray-700">{quiz.title}</span>
                                        {/* Action buttons for each quiz */}
                                        <div className="flex items-center space-x-3">
                                            <button onClick={() => setModalState({...modalState, viewResults: quiz})} className="text-gray-500 hover:text-indigo-600 p-1" title="View Results"><FaChartBar/></button>
                                            <button onClick={() => setModalState({...modalState, editQuiz: quiz})} className="text-gray-500 hover:text-blue-600 p-1" title="Edit Quiz"><FaPencilAlt/></button>
                                            <button onClick={() => setModalState({...modalState, deleteItem: { item: quiz, type: 'quiz' }})} className="text-gray-500 hover:text-red-600 p-1" title="Delete Quiz"><FaTrash/></button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500 py-4 text-center">No quizzes created for this course yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CourseDetailView;