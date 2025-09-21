import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';

/**
 * A modal for creating a new user or editing an existing one.
 * @param {object} props - The component's props.
 * @param {boolean} props.isOpen - Controls if the modal is visible.
 * @param {Function} props.onClose - Function to call to close the modal.
 * @param {Function} props.onSave - Function to call with the form data upon submission.
 * @param {object} [props.user] - The user object to edit. If null, the modal is in "create" mode.
 */
const CreateEditUserModal = ({ isOpen, onClose, onSave, user }) => {
    // Determines if the modal is for editing based on the presence of the 'user' prop.
    const isEditMode = Boolean(user);

    // State to manage the form's input fields.
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', role: 'student'
    });

    // Effect to populate or reset the form when the modal opens or the user prop changes.
    useEffect(() => {
        if (isEditMode) {
            // If in edit mode, fill the form with the user's data.
            setFormData({ name: user.name, email: user.email, password: '', role: user.role });
        } else {
            // If in create mode, reset the form to default values.
            setFormData({ name: '', email: '', password: '', role: 'student' });
        }
    }, [user, isOpen]); // Reruns when the user or isOpen state changes.

    // Updates the form state as the user types in any input field.
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handles the form submission.
    const handleSubmit = (e) => {
        e.preventDefault(); // Prevents the default browser form submission.
        onSave(formData); // Passes the form data to the parent component.
    };
    
    // Do not render the component if it's not open.
    if (!isOpen) return null;

    return (
        // Modal backdrop and main container.
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <form onSubmit={handleSubmit}>
                    {/* Modal Header with a dynamic title. */}
                    <div className="p-6 border-b">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold">{isEditMode ? 'Edit User' : 'Create New User'}</h2>
                            <button type="button" onClick={onClose}><FaTimes /></button>
                        </div>
                    </div>

                    {/* Modal Body with form inputs. */}
                    <div className="p-6 space-y-4">
                        <div>
                            <label>Name</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full mt-1 p-2 border rounded-md" />
                        </div>
                        <div>
                            <label>Email</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full mt-1 p-2 border rounded-md" />
                        </div>
                        
                        {/* The password field is only shown when creating a new user. */}
                        {!isEditMode && (
                            <div>
                                <label>Password</label>
                                <input type="password" name="password" value={formData.password} onChange={handleChange} required className="w-full mt-1 p-2 border rounded-md" />
                            </div>
                        )}
                        
                        <div>
                            <label>Role</label>
                            <select name="role" value={formData.role} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md">
                                <option value="student">Student</option>
                                <option value="trainer">Trainer</option>
                            </select>
                        </div>
                    </div>

                    {/* Modal Footer with action buttons. */}
                    <div className="p-4 bg-gray-50 flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="bg-gray-200 py-2 px-4 rounded-md">Cancel</button>
                        <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded-md">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateEditUserModal;