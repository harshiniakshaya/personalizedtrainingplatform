import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

/**
 * A confirmation modal for deleting a user.
 * @param {object} props - The component's props.
 * @param {boolean} props.isOpen - Controls if the modal is visible.
 * @param {Function} props.onClose - Function to call when the modal is closed without confirmation.
 * @param {Function} props.onConfirm - Function to call when the delete action is confirmed.
 * @param {string} props.userName - The name of the user to be deleted, for display purposes.
 */
const DeleteUserModal = ({ isOpen, onClose, onConfirm, userName }) => {
    // Do not render the component if it's not supposed to be open.
    if (!isOpen) return null;

    return (
        // Modal backdrop and container.
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                {/* Modal Body */}
                <div className="p-6">
                    <div className="flex items-start">
                        {/* Warning Icon */}
                        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0">
                            <FaExclamationTriangle className="h-6 w-6 text-red-600" />
                        </div>
                        {/* Confirmation Text */}
                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">Delete User</h3>
                            <div className="mt-2">
                                <p className="text-sm text-gray-500">
                                    Are you sure you want to delete <span className="font-bold">{userName}</span>? This action cannot be undone.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Modal Footer with action buttons. */}
                <div className="p-4 bg-gray-50 flex justify-end space-x-2">
                    <button onClick={onClose} className="bg-white py-2 px-4 rounded-md border">Cancel</button>
                    <button onClick={onConfirm} className="bg-red-600 text-white py-2 px-4 rounded-md">Delete</button>
                </div>
            </div>
        </div>
    );
};

export default DeleteUserModal;