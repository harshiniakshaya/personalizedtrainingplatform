import React, { useState, useContext } from 'react';
import { DataContext } from '../../context/DataContext';

/**
 * A component containing a form to create a new course.
 * @param {object} props - The component's props.
 * @param {Function} props.onCourseCreated - Callback function executed after a course is successfully created.
 */
const CreateCourse = ({ onCourseCreated }) => {
  // Access the addCourse function from the global DataContext.
  const { addCourse } = useContext(DataContext);
  
  // State to manage the form's input fields.
  const [formData, setFormData] = useState({ title: '', description: '' });
  // State for displaying a success message to the user.
  const [successMessage, setSuccessMessage] = useState('');
  // State for displaying an error message if submission fails.
  const [error, setError] = useState('');
  // State to manage the UI during the async submission process.
  const [loading, setLoading] = useState(false);

  /**
   * Handles the form submission process.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title) return; // Basic validation.
    
    // Set initial state for submission.
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const newCourseData = { title: formData.title, description: formData.description };
      const newCourse = await addCourse(newCourseData);
      
      setSuccessMessage('Course created successfully!');
      
      // Delay the callback to allow the user to see the success message.
      setTimeout(() => {
        onCourseCreated(newCourse);
      }, 1500);

    } catch (err) {
      setError('Failed to create course. Please try again.');
      console.error(err);
    } finally {
      // Ensure the loading state is reset after the operation completes.
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Create New Course</h2>
      
      {/* Conditionally render success or error messages based on submission status. */}
      {successMessage && <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4" role="alert">{successMessage}</div>}
      {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">{error}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Course Title</label>
          <input 
            type="text" 
            id="title" 
            required 
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
            value={formData.title} 
            onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
            placeholder="e.g., Advanced React Patterns" 
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Course Description</label>
          <textarea 
            id="description" 
            rows={3} 
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
            value={formData.description} 
            onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
            placeholder="A brief summary of the course content" 
          />
        </div>

        <p className="text-sm text-gray-500">Note: Student enrollment can be managed after course creation.</p>

        {/* Submit button's text and disabled state are controlled by the 'loading' state. */}
        <button 
          type="submit" 
          disabled={loading} 
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Course'}
        </button>
      </form>
    </div>
  );
};

export default CreateCourse;