import React, { useState, useEffect, useContext } from 'react';
import { FaTimes } from 'react-icons/fa';
import Select from 'react-select';
import { DataContext } from '../../context/DataContext';

/**
 * A modal for editing an existing course's details and managing student enrollment.
 * @param {object} props - The component's props.
 * @param {object} props.course - The course object to be edited.
 * @param {Function} props.onClose - Callback function to close the modal.
 * @param {Function} props.onSave - Callback function to save the updated course data.
 */
const EditCourseModal = ({ course, onClose, onSave }) => {
    // Access student data and fetching logic from the DataContext.
    const { students, studentsLoading, fetchStudents } = useContext(DataContext);

    // State for the form's controlled inputs.
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [enrolledStudentIds, setEnrolledStudentIds] = useState([]);

    // State for UI feedback during submission.
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Effect to populate the form with the existing course data when the modal opens.
    useEffect(() => {
        if (course) {
            setTitle(course.title);
            setDescription(course.description);
            // Extract just the IDs from the course's populated student objects.
            const initialStudentIds = course.students?.map(s => s._id) || [];
            setEnrolledStudentIds(initialStudentIds);
        }
    }, [course]);

    // Effect to fetch the full list of available students for the dropdown.
    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]); // Runs once when the component mounts.

    // --- Logic for the React-Select Component ---

    // 1. Format the raw student data into the { value, label } structure required by react-select.
    const studentOptions = students.map(student => ({
        value: student._id,
        label: `${student.name} (${student.email})`
    }));

    // 2. Determine the currently selected options by filtering the full options list.
    const selectedOptions = studentOptions.filter(option =>
        enrolledStudentIds.includes(option.value)
    );

    // 3. Handle changes from the multi-select dropdown.
    const handleStudentChange = (selected) => {
        // Extract just the student IDs from the selected option objects.
        const selectedIds = selected ? selected.map(option => option.value) : [];
        setEnrolledStudentIds(selectedIds);
    };

    // --- Form Submission ---

    /**
     * Handles the submission of the updated course data.
     */
    const handleSave = async () => {
        setLoading(true);
        setError('');
        try {
            // Call the onSave prop with the course ID and the updated data payload.
            await onSave(course._id, { title, description, students: enrolledStudentIds });
            onClose(); // Close the modal on successful save.
        } catch (err) {
            setError('Failed to save changes. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Do not render if the course prop is not yet available.
    if (!course) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold">Edit Course</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Display an error message if saving fails. */}
                {error && <div className="bg-red-100 text-red-700 p-3 rounded">{error}</div>}

                <div>
                    <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700">Course Title</label>
                    <input
                        type="text"
                        id="edit-title"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                    />
                </div>
                <div>
                    <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                        id="edit-description"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                        rows={3}
                    ></textarea>
                </div>

                {/* Multi-select dropdown for managing student enrollment. */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Manage Student Enrollment
                    </label>
                    <Select
                        isMulti
                        options={studentOptions}
                        value={selectedOptions}
                        onChange={handleStudentChange}
                        isLoading={studentsLoading}
                        isDisabled={studentsLoading}
                        className="mt-1"
                        placeholder={studentsLoading ? "Loading students..." : "Type to search..."}
                        noOptionsMessage={() => 
                            !studentsLoading && students.length === 0 ? "No students available to enroll" : "No students match your search"
                        }
                    />
                </div>

                {/* Modal action buttons */}
                <div className="flex justify-end space-x-3 pt-2">
                    <button onClick={onClose} className="py-2 px-4 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                        Cancel
                    </button>
                    <button onClick={handleSave} disabled={loading} className="py-2 px-4 bg-blue-600 text-white rounded-md disabled:opacity-50 hover:bg-blue-700">
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditCourseModal;