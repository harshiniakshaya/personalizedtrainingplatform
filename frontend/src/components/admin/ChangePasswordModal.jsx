import React, { useState } from 'react';
import { FaTimes, FaKey } from 'react-icons/fa';

/**
 * A modal component for changing a user's password.
 * @param {object} props - The component's props.
 * @param {boolean} props.isOpen - Controls if the modal is visible.
 * @param {Function} props.onClose - Function to call when the modal should be closed.
 * @param {Function} props.onSave - Function to call to save the new password.
 * @param {string} props.userName - The name of the user whose password is being changed.
 */
const ChangePasswordModal = ({ isOpen, onClose, onSave, userName }) => {
    // State for the new password input.
    const [password, setPassword] = useState('');
    // State to manage the loading status during submission.
    const [loading, setLoading] = useState(false);

    // Handles the form submission process.
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Calls the onSave function passed through props.
            await onSave(password);
        } catch (error) {
            // Error handling can be enhanced here.
            console.error("Failed to save password:", error);
        } finally {
            // Ensures the loading state is reset after the operation.
            setLoading(false);
        }
    };
    
    // If the modal is not set to be open, render nothing.
    if (!isOpen) return null;

    return (
        // Modal backdrop and container.
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <form onSubmit={handleSubmit}>
                    {/* Modal Header */}
                    <div className="p-6 border-b">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800">Change Password</h2>
                            <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-800"><FaTimes /></button>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                            For user: <span className="font-medium">{userName}</span>
                        </p>
                    </div>

                    {/* Modal Body */}
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 flex items-center">
                                <FaKey className="mr-2 text-gray-400"/> New Password
                            </label>
                            <input 
                                type="password" 
                                id="newPassword"
                                name="password" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                required 
                                minLength="6"
                                className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter at least 6 characters"
                            />
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="p-4 bg-gray-50 flex justify-end space-x-3 rounded-b-lg">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300">Cancel</button>
                        <button type="submit" disabled={loading} className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50">
                            {loading ? 'Saving...' : 'Save Password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChangePasswordModal;