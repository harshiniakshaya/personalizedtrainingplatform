import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";

// Import all page components for routing.
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import TrainerDashboard from "./pages/TrainerDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import StudentCourseDetailPage from "./pages/StudentCourseDetailPage";
import QuizTakingPage from "./pages/QuizTakingPage";
import AdminDashboard from "./pages/AdminDashboard";

/**
 * The root component of the application. It sets up the router, context providers,
 * and defines all public and protected application routes.
 */
function App() {
    /**
     * A wrapper component that protects routes based on authentication status and user roles.
     * @param {object} props - The component's props.
     * @param {string[]} props.allowedRoles - An array of roles that are permitted to access this route.
     * @returns {React.ReactNode} The child route's component via <Outlet /> or a <Navigate> component for redirection.
     */
    const ProtectedRoute = ({ allowedRoles }) => {
        const { auth } = useContext(AuthContext);

        // 1. Show a loading spinner while the initial authentication check is in progress.
        if (auth.loading) {
            return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div></div>;
        }

        // 2. If not authenticated, redirect to the login page.
        if (!auth.isAuthenticated) {
            return <Navigate to="/login" replace />;
        }

        // 3. If the user's role is not in the list of allowed roles, redirect to the home page.
        if (allowedRoles && !allowedRoles.includes(auth.user.role)) {
            return <Navigate to="/" replace />;
        }

        // 4. If all checks pass, render the intended child route.
        return <Outlet />;
    };

    return (
        <Router>
            {/* The AuthProvider wraps the app to provide authentication state globally. */}
            <AuthProvider>
                {/* The DataProvider wraps the app to provide data management functions globally. */}
                <DataProvider>
                    <Routes>
                        {/* --- Public Routes --- */}
                        <Route path="/" element={<HomePage />} />
                        <Route path="/login" element={<Login />} />

                        {/* --- Trainer Protected Routes --- */}
                        {/* These routes are only accessible to users with the 'trainer' role. */}
                        <Route element={<ProtectedRoute allowedRoles={["trainer"]} />}>
                            <Route path="/trainer/dashboard" element={<TrainerDashboard />} />
                            {/* Redirect base /trainer path to the dashboard. */}
                            <Route path="/trainer" element={<Navigate to="/trainer/dashboard" replace />} />
                        </Route>

                        {/* --- Student Protected Routes --- */}
                        {/* These routes are only accessible to users with the 'student' role. */}
                        <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
                            <Route path="/student/:tab" element={<StudentDashboard />} />
                            <Route path="/student/courses/:courseId" element={<StudentCourseDetailPage />} />
                            <Route path="/student/quiz/:quizId" element={<QuizTakingPage />} />
                            {/* Redirect base /student path to their courses page. */}
                            <Route path="/student" element={<Navigate to="/student/courses" replace />} />
                        </Route>

                        {/* --- Admin Protected Routes --- */}
                        {/* These routes are only accessible to users with the 'admin' role. */}
                        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
                            <Route path="/admin/dashboard" element={<AdminDashboard />} />
                            {/* Redirect base /admin path to the dashboard. */}
                            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                        </Route>

                        {/* --- Fallback Route --- */}
                        {/* This route catches any undefined paths and redirects them to the home page. */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </DataProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;