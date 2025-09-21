import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import api from '../api/api';

// Create the context that will be consumed by other components.
export const AuthContext = createContext();

/**
 * The AuthProvider component is a wrapper that provides authentication state
 * and functions (login, logout) to the entire application. It handles token
 * management, validation, and role-based redirects.
 * @param {object} props - The component's props.
 * @param {React.ReactNode} props.children - The child components that will have access to the context.
 */
export const AuthProvider = ({ children }) => {
    // Manages the core authentication state of the application.
    const [auth, setAuth] = useState({
        token: localStorage.getItem('learnix-token'), // The JWT token.
        user: null,           // The decoded user object from the token.
        isAuthenticated: false, // Boolean flag for authentication status.
        loading: true,        // True while initially checking for a token, to prevent UI flashes.
    });
    const navigate = useNavigate();
    const location = useLocation();

    /**
     * Logs the user out by clearing the token from localStorage, resetting the auth state,
     * and redirecting to the login page.
     * useCallback is used to memoize the function, preventing it from being recreated on every render.
     */
    const logout = useCallback(() => {
        localStorage.removeItem('learnix-token');
        setAuth({ token: null, user: null, isAuthenticated: false, loading: false });
        navigate('/login');
    }, [navigate]);

    // This effect runs on initial application load to validate any existing token.
    useEffect(() => {
        const token = localStorage.getItem('learnix-token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                // Check if the token has expired.
                if (decoded.exp * 1000 < Date.now()) {
                    logout(); // Token is expired, so log out.
                } else {
                    // Token is valid, set the auth state.
                    setAuth({ token, user: decoded.user, isAuthenticated: true, loading: false });
                }
            } catch (error) {
                // If decoding fails, the token is invalid.
                logout();
            }
        } else {
            // No token found, finish the loading process.
            setAuth(prev => ({ ...prev, loading: false }));
        }
    }, [logout]);

    // This effect handles redirecting the user to their respective dashboard after they log in.
    useEffect(() => {
        const isOnPublicPage = location.pathname === '/' || location.pathname === '/login';

        // Only redirect if authentication is confirmed, loading is complete, and the user is on a public page.
        if (auth.isAuthenticated && !auth.loading && isOnPublicPage) {
            // Redirect based on the user's role.
            if (auth.user.role === 'admin') {
                navigate('/admin/dashboard');
            } else if (auth.user.role === 'trainer') {
                navigate('/trainer/dashboard');
            } else if (auth.user.role === 'student') {
                navigate('/student/courses');
            }
        }
    }, [auth, navigate, location]);

    /**
     * Handles the login process by making an API request and updating the auth state on success.
     * useCallback memoizes the function for performance.
     * @param {string} email - The user's email.
     * @param {string} password - The user's password.
     */
    const login = useCallback(async (email, password) => {
        const response = await api.post('/api/auth/login', { email, password });
        const { token } = response.data;
        localStorage.setItem('learnix-token', token);
        const decoded = jwtDecode(token);
        setAuth({ token, user: decoded.user, isAuthenticated: true, loading: false });
    }, []);

    // Memoize the context value to prevent unnecessary re-renders of consuming components.
    // The context value will only be recalculated if 'auth', 'login', or 'logout' change.
    const value = useMemo(() => ({
        auth,
        login,
        logout
    }), [auth, login, logout]);

    return (
        <AuthContext.Provider value={value}>
            {/* The rest of the application is only rendered after the initial token check is complete. */}
            {!auth.loading && children}
        </AuthContext.Provider>
    );
};