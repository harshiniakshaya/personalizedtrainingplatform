import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

/**
 * A generic and reusable modal to confirm a destructive action, such as deletion.
 * @param {object} props - The component's props.
 * @param {boolean} props.isOpen - Controls if the modal is visible.
 * @param {Function} props.onClose - Callback function to close the modal.
 * @param {Function} props.onConfirm - Callback function to execute the confirmed action.
 * @param {string} props.itemName - The name of the specific item being deleted (e.g., "Advanced React Quiz").
 * @param {string} [props.itemType='item'] - The general type of the item (e.g., "course", "quiz").
 */
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, itemName, itemType = 'item' }) => {
    // Do not render the modal if it's not set to be open.
    if (!isOpen) return null;

    return (
        // Modal backdrop and container, using a high z-index to appear on top.
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
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
                            {/* The title and message are dynamic based on props for reusability. */}
                            <h3 className="text-lg leading-6 font-medium text-gray-900">Delete {itemType}</h3>
                            <div className="mt-2">
                                <p className="text-sm text-gray-500">
                                    Are you sure you want to delete <span className="font-bold">{itemName}</span>? This will permanently remove the {itemType} and all its associated data. This action cannot be undone.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Modal Footer with action buttons. */}
                <div className="p-4 bg-gray-50 flex justify-end space-x-3 rounded-b-lg">
                    <button onClick={onClose} className="bg-white py-2 px-4 rounded-md border border-gray-300 hover:bg-gray-50">Cancel</button>
                    <button onClick={onConfirm} className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700">Delete</button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal;