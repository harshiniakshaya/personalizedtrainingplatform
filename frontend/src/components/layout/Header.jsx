import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { FaSignOutAlt } from 'react-icons/fa';

/**
 * The main application header component.
 * Displays the application title, a welcome message, and a logout button.
 */
const Header = () => {
    // Access authentication state and logout function from the AuthContext.
    const { auth, logout } = useContext(AuthContext);

    return (
        // The header element is sticky to keep it visible while scrolling.
        <header className="bg-white shadow-sm sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Application Title */}
                    <div className="flex-shrink-0">
                        <h1 className="text-xl font-bold text-gray-800">Learnix Dashboard</h1>
                    </div>

                    {/* User Info and Logout */}
                    <div className="flex items-center">
                        <span className="text-gray-600 mr-4">
                            Welcome, <span className="font-medium text-gray-900">{auth.user?.name || 'Trainer'}</span>
                        </span>
                        
                        {/* Logout button */}
                        <button
                            onClick={logout}
                            className="flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-red-600 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                            <FaSignOutAlt className="mr-2" />
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;