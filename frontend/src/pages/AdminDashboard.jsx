import React, { useState, useEffect, useContext } from 'react';
import Header from '../components/layout/Header';
import { DataContext } from '../context/DataContext';
import { FaUsers, FaPlus, FaEdit, FaTrash, FaKey } from 'react-icons/fa';
import CreateEditUserModal from '../components/admin/CreateEditUserModal';
import DeleteUserModal from '../components/admin/DeleteUserModal';
import ChangePasswordModal from '../components/admin/ChangePasswordModal';

/**
 * The main dashboard for administrators, providing a complete interface for user management.
 * Features include creating, editing, deleting users, and changing their passwords.
 */
const AdminDashboard = () => {
    // Access all admin-specific data functions from the DataContext.
    const { adminGetAllUsers, adminCreateUser, adminUpdateUser, adminDeleteUser, adminChangeUserPassword } = useContext(DataContext);
    
    // State to hold the list of all users.
    const [users, setUsers] = useState([]);
    // State to manage the loading UI while fetching users.
    const [loading, setLoading] = useState(true);
    // A single state object to manage which modal is open ('create', 'edit', 'delete', 'change-password')
    // and which user is being acted upon. This avoids multiple boolean state variables.
    const [modalState, setModalState] = useState({ type: null, user: null });

    /**
     * Fetches the full list of users from the server and updates the component's state.
     */
    const refreshUsers = async () => {
        setLoading(true);
        const userData = await adminGetAllUsers();
        setUsers(userData);
        setLoading(false);
    };

    // Effect to fetch the initial list of users when the component mounts.
    useEffect(() => {
        refreshUsers();
    }, []); // Empty dependency array ensures this runs only once on mount.

    /**
     * Generic handler for saving user data from the CreateEditUserModal.
     * It determines whether to create a new user or update an existing one based on the modal's type.
     * @param {object} userData - The user data from the modal form.
     */
    const handleSave = async (userData) => {
        if (modalState.type === 'create') {
            await adminCreateUser(userData);
        } else {
            await adminUpdateUser(modalState.user._id, userData);
        }
        setModalState({ type: null, user: null }); // Close the modal.
        refreshUsers(); // Refresh the user list to show changes.
    };

    /**
     * Handler for confirming a user deletion.
     */
    const handleDelete = async () => {
        await adminDeleteUser(modalState.user._id);
        setModalState({ type: null, user: null }); // Close the modal.
        refreshUsers(); // Refresh the user list.
    };
    
    /**
     * Handler for saving a new password from the ChangePasswordModal.
     * @param {string} password - The new password.
     */
    const handleChangePassword = async (password) => {
        await adminChangeUserPassword(modalState.user._id, password);
        setModalState({ type: null, user: null }); // Close the modal.
        // No need to refresh the user list as the password is not displayed.
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* --- MODAL RENDERING --- */}
            {/* This section conditionally renders the active modal based on the modalState. */}
            {modalState.type === 'create' || modalState.type === 'edit' ? (
                <CreateEditUserModal isOpen={true} onClose={() => setModalState({ type: null, user: null })} onSave={handleSave} user={modalState.user} />
            ) : null}
            {modalState.type === 'delete' ? (
                <DeleteUserModal isOpen={true} onClose={() => setModalState({ type: null, user: null })} onConfirm={handleDelete} userName={modalState.user.name} />
            ) : null}
            {modalState.type === 'change-password' ? (
                <ChangePasswordModal isOpen={true} onClose={() => setModalState({ type: null, user: null })} onSave={handleChangePassword} userName={modalState.user.name} />
            ) : null}

            <Header />
            <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
                {/* Page Header and Create User Button */}
                <div className="flex justify-between items-center mb-6 px-4 sm:px-0">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                        <FaUsers className="mr-3" /> User Management
                    </h1>
                    {/* This button opens the 'create' modal. */}
                    <button onClick={() => setModalState({ type: 'create', user: null })} className="flex items-center bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 shadow-sm">
                        <FaPlus className="mr-2" /> Create User
                    </button>
                </div>

                {/* User List Table */}
                <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
                    {loading ? <p className="p-6 text-center text-gray-500">Loading users...</p> : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.map(user => (
                                    <tr key={user._id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'trainer' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        {/* Action buttons update the modalState to open the correct modal for the selected user. */}
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            <button onClick={() => setModalState({ type: 'change-password', user })} className="text-gray-500 hover:text-blue-700 p-1" title="Change Password"><FaKey /></button>
                                            <button onClick={() => setModalState({ type: 'edit', user })} className="text-gray-500 hover:text-indigo-700 p-1" title="Edit User"><FaEdit /></button>
                                            <button onClick={() => setModalState({ type: 'delete', user })} className="text-gray-500 hover:text-red-700 p-1" title="Delete User"><FaTrash /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;