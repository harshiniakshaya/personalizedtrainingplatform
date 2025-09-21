import React, { useContext, useEffect } from 'react';
import { DataContext } from '../../context/DataContext';
import { FaUserGraduate } from 'react-icons/fa';

/**
 * A component that fetches and displays a list of all students associated with the trainer.
 */
const StudentList = () => {
    // Access the global students list, loading state, and fetching function from the DataContext.
    const { students, studentsLoading, fetchStudents } = useContext(DataContext);

    // Effect to fetch the list of students when the component first mounts.
    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]); // The dependency array ensures this effect runs only once.

    // Display a loading message while the student data is being fetched.
    if (studentsLoading) {
        return <p className="text-center text-gray-500">Loading students...</p>;
    }

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">My Students</h2>
            
            {/* Conditionally render based on whether any students were found. */}
            {students.length === 0 ? (
                // Display a message if no students are available.
                <div className="text-center py-12 text-gray-500">
                    <FaUserGraduate className="mx-auto text-4xl mb-4" />
                    <p className="text-lg">No students are currently enrolled in any of your courses.</p>
                </div>
            ) : (
                // Display a list of all students.
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <ul className="divide-y divide-gray-200">
                        {/* Map through the students array to render a list item for each one. */}
                        {students.map((student) => (
                            <li key={student._id} className="px-6 py-4 flex items-center justify-between">
                                <div>
                                    <p className="text-md font-medium text-gray-900">{student.name}</p>
                                    <p className="text-sm text-gray-500">{student.email}</p>
                                </div>
                                {/* Future action buttons (e.g., view details, remove) could be added here. */}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default StudentList;