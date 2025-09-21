import React, { createContext, useState, useCallback, useMemo } from "react";
import api from "../api/api";

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  // State
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);

  // --- COURSES ---
  const fetchCourses = useCallback(async () => {
    try {
      const res = await api.get("/api/courses");
      setCourses(res.data);
    } catch (err) {
      console.error("Error fetching courses:", err);
    }
  }, []);

  const fetchCourseById = useCallback(async (courseId) => {
    try {
      const res = await api.get(`/api/courses/${courseId}`);
      return res.data;
    } catch (err) {
      console.error(`Error fetching course ${courseId}:`, err);
      return null;
    }
  }, []);

  const addCourse = useCallback(
    async (courseData) => {
      const res = await api.post("/api/courses", courseData);
      await fetchCourses(); // Refetch to get the latest list
      return res.data;
    },
    [fetchCourses]
  );

  const updateCourse = useCallback(
    async (courseId, courseData) => {
      const res = await api.put(`/api/courses/${courseId}`, courseData);
      await fetchCourses(); // Refetch to ensure UI consistency
      return res.data;
    },
    [fetchCourses]
  );

  // --- STUDENTS ---
  const fetchStudents = useCallback(async () => {
    setStudentsLoading(true);
    try {
      const response = await api.get("/api/users/students");
      setStudents(response.data);
    } catch (error) {
      console.error("Failed to fetch students:", error);
      setStudents([]);
    } finally {
      setStudentsLoading(false);
    }
  }, []);

  // --- QUIZZES ---
  const addQuiz = useCallback(
    async (quizData) => {
      await api.post("/api/quizzes", quizData);
      await fetchCourses(); // Refresh courses to show new quiz count
    },
    [fetchCourses]
  );

  const fetchQuizToTake = useCallback(async (quizId) => {
    try {
      const res = await api.get(`/api/quizzes/${quizId}/take`);
      return res.data;
    } catch (err) {
      console.error("Error fetching quiz:", err);
      return null;
    }
  }, []);

  const submitQuiz = useCallback(async (quizId, answers) => {
    const res = await api.post(`/api/quizzes/${quizId}/submit`, { answers });
    return res.data;
  }, []);

  // --- RESULTS ---
  const fetchQuizResults = useCallback(async (quizId) => {
    try {
      const res = await api.get(`/api/quizzes/${quizId}/results`);
      return res.data;
    } catch (err) {
      console.error("Error fetching quiz results:", err);
      return [];
    }
  }, []);

  const fetchMyResults = useCallback(async () => {
    try {
      const res = await api.get("/api/quizzes/my-results");
      return res.data;
    } catch (err) {
      console.error("Error fetching my results:", err);
      return [];
    }
  }, []);

  // --- ADMIN FUNCTIONS ---
  const adminGetAllUsers = useCallback(async () => {
    try {
      const res = await api.get("/api/admin/users");
      return res.data;
    } catch (err) {
      console.error("Error fetching all users:", err);
      return [];
    }
  }, []);

  const adminCreateUser = useCallback(async (userData) => {
    await api.post("/api/admin/users", userData);
  }, []);

  const adminUpdateUser = useCallback(async (userId, userData) => {
    await api.put(`/api/admin/users/${userId}`, userData);
  }, []);

  const adminDeleteUser = useCallback(async (userId) => {
    await api.delete(`/api/admin/users/${userId}`);
  }, []);

  const adminChangeUserPassword = useCallback(async (userId, password) => {
    try {
      await api.put(`/api/admin/users/${userId}/change-password`, { password });
    } catch (err) {
      console.error("Error changing user password:", err);
      throw err;
    }
  }, []);

  const updateQuiz = useCallback(
    async (quizId, quizData) => {
      await api.put(`/api/quizzes/${quizId}`, quizData);
      await fetchCourses(); // Refresh course data
    },
    [fetchCourses]
  );

  const deleteQuiz = useCallback(
    async (quizId) => {
      await api.delete(`/api/quizzes/${quizId}`);
      await fetchCourses(); // Refresh course data
    },
    [fetchCourses]
  );

  const deleteCourse = useCallback(
    async (courseId) => {
      await api.delete(`/api/courses/${courseId}`);
      await fetchCourses(); // Refresh course list
    },
    [fetchCourses]
  );

  const fetchStudentReport = useCallback(async (studentId, courseId) => {
    try {
      const res = await api.get(`/api/reports/student/${studentId}/course/${courseId}`);
      return res.data;
    } catch (err) {
      console.error("Error fetching student report:", err);
      return null;
    }
  }, []);

  // Memoize the context value to prevent infinite re-render loops
  const value = useMemo(
    () => ({
      courses,
      students,
      studentsLoading,
      fetchCourses,
      fetchCourseById,
      updateCourse,
      addCourse,
      fetchStudents,
      addQuiz,
      fetchQuizToTake,
      submitQuiz,
      fetchQuizResults,
      fetchMyResults,
      adminGetAllUsers,
      adminCreateUser,
      adminUpdateUser,
      adminDeleteUser,
      adminChangeUserPassword,
      updateQuiz,
      deleteQuiz,
      deleteCourse,
      fetchStudentReport,
    }),
    [
      courses,
      students,
      studentsLoading,
      fetchCourses,
      fetchCourseById,
      updateCourse,
      addCourse,
      fetchStudents,
      addQuiz,
      fetchQuizToTake,
      submitQuiz,
      fetchQuizResults,
      fetchMyResults,
      adminGetAllUsers,
      adminCreateUser,
      adminUpdateUser,
      adminDeleteUser,
      adminChangeUserPassword,
      updateQuiz,
      deleteQuiz,
      deleteCourse,
      fetchStudentReport,
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
