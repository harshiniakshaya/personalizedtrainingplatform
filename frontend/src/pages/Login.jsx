import React, { useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaChalkboardTeacher, FaUserGraduate } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';

/**
 * The login page component. It handles user authentication for both trainers and students.
 * It can receive a pre-selected role from the navigation state.
 */
const Login = () => {
    // State to manage the email and password form fields.
    const [formData, setFormData] = useState({ email: '', password: '' });
    // State to display any login errors to the user.
    const [error, setError] = useState('');
    // State to manage the UI during the asynchronous login process.
    const [loading, setLoading] = useState(false);
    
    // Access the login function from the global AuthContext.
    const { login } = useContext(AuthContext);
    
    // useLocation is used here to get the 'role' passed from the HomePage Link state.
    const location = useLocation();
    const roleFromState = location.state?.role;
    
    // The role state determines the UI and is pre-filled if a role was selected on the home page.
    const [role, setRole] = useState(roleFromState || 'trainer');

    // Destructure for easier access in the form.
    const { email, password } = formData;
    
    // Generic onChange handler to update the form data state.
    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    /**
     * Handles the form submission process.
     */
    const onSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            await login(email, password);
            // On successful login, navigation is handled by the AuthContext.
        } catch (err) {
            // Display a user-friendly error message from the API response or a generic one.
            setError(err.response?.data?.msg || 'Login failed. Please check your credentials.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
                <div>
                    {/* The icon and title change dynamically based on the selected role. */}
                    <div className="flex justify-center">
                        <div className="bg-blue-100 p-3 rounded-full">
                            {role === 'trainer' ? <FaChalkboardTeacher className="h-8 w-8 text-blue-600" /> : <FaUserGraduate className="h-8 w-8 text-blue-600" />}
                        </div>
                    </div>
                    <h2 className="mt-4 text-center text-2xl font-extrabold text-gray-900">
                        Login as {role === 'trainer' ? 'Trainer' : 'Student'}
                    </h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={onSubmit}>
                    {/* Conditionally display the error message. */}
                    {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}
                    
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div><input id="email" name="email" type="email" required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" placeholder="Email address" value={email} onChange={onChange}/></div>
                        <div><input id="password" name="password" type="password" required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" placeholder="Password" value={password} onChange={onChange}/></div>
                    </div>

                    {/* The submit button is disabled and shows a different text during the login process. */}
                    <div><button type="submit" disabled={loading} className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">{loading ? 'Signing in...' : 'Sign in'}</button></div>
                    
                    <div className="text-center"><Link to="/" className="text-blue-600 hover:text-blue-800">← Back to Home</Link></div>
                </form>
            </div>
        </div>
    );
};

export default Login;