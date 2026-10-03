import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layouts & Auth
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import Spinner from './components/ui/Spinner';
import Profile from './pages/Profile';
// Public Pages
import Home from './pages/public/Home';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import CourseList from './pages/public/CourseList';
import CourseDetails from './pages/public/CourseDetails';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import MyLearning from './pages/student/MyLearning';
import CoursePlayer from './pages/student/CoursePlayer';
import Certificate from './pages/student/Certificate';

// Instructor Pages
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import InstructorCourses from './pages/instructor/InstructorCourses';
import CreateCourse from './pages/instructor/CreateCourse';
import EditCourse from './pages/instructor/EditCourse';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCourses from './pages/admin/AdminCourses';
import ManageUsers from './pages/admin/ManageUsers';

const App = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Spinner size="xl" />;
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes with MainLayout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<CourseList />} />
          <Route path="/courses/:id" element={<CourseDetails />} />
          
          {/* Auth Routes - Redirect to dashboard if already logged in */}
          <Route 
            path="/login" 
            element={user ? <Navigate to={`/${user.role}/dashboard`} replace /> : <Login />} 
          />
          <Route 
            path="/register" 
            element={user ? <Navigate to={`/${user.role}/dashboard`} replace /> : <Register />} 
          />
<Route path="/student/profile" element={<Profile />} />
<Route path="/instructor/profile" element={<Profile />} />
<Route path="/admin/profile" element={<Profile />} />
          {/* Protected Student Routes */}
          <Route element={<ProtectedRoute allowedRoles={['student', 'admin']} />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/learning" element={<MyLearning />} />
            <Route path="/student/certificate/:courseId" element={<Certificate />} />
          </Route>

          {/* Protected Instructor Routes */}
          <Route element={<ProtectedRoute allowedRoles={['instructor', 'admin']} />}>
            <Route path="/instructor/dashboard" element={<InstructorDashboard />} />
            <Route path="/instructor/courses" element={<InstructorCourses />} />
            <Route path="/instructor/courses/create" element={<CreateCourse />} />
            <Route path="/instructor/courses/:id/edit" element={<EditCourse />} />
          </Route>

          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/courses" element={<AdminCourses />} />
            <Route path="/admin/users" element={<ManageUsers />} />
          </Route>
        </Route>

        {/* Course Player (Fullscreen, without standard MainLayout) */}
        <Route element={<ProtectedRoute allowedRoles={['student', 'instructor', 'admin']} />}>
          <Route path="/student/learning/:courseId" element={<CoursePlayer />} />
        </Route>

        {/* 404 Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;