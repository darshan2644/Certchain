import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Background3D from './components/Background3D';
import Home from './pages/Home';
import Upload from './pages/Upload';
import Verify from './pages/Verify';
import BulkUpload from './pages/BulkUpload';
import Dashboard from './pages/Dashboard';
import Guide from './pages/Guide';
import Developer from './pages/Developer';
import AdminPanel from './pages/AdminPanel';
import AdminAnalytics from './pages/AdminAnalytics';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';

const ProtectedRoute = ({ children, role }) => {
  const { user } = useAuth();
  if (!user) return <Login />;
  if (role && user.role !== role) return <div className="page-container"><h1>Unauthorized Access</h1></div>;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Background3D />
        <Navbar />
        <div style={{ paddingTop: '80px', display: 'flex', flexDirection: 'column', minHeight: '100vh', boxSizing: 'border-box' }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify" element={<Verify />} />

            {/* Protected routes */}
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/guide" element={<ProtectedRoute><Guide /></ProtectedRoute>} />
            <Route path="/dev" element={<ProtectedRoute><Developer /></ProtectedRoute>} />

            {/* Admin Only Routes */}
            <Route path="/upload" element={<ProtectedRoute role="admin"><Upload /></ProtectedRoute>} />
            <Route path="/bulk" element={<ProtectedRoute role="admin"><BulkUpload /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute role="admin"><AdminPanel /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute role="admin"><AdminAnalytics /></ProtectedRoute>} />

            {/* Student Specific Routes */}
            <Route path="/dashboard" element={<ProtectedRoute role="student"><Dashboard /></ProtectedRoute>} />

            {/* Redirect any unknown route to login if not authenticated */}
            <Route path="*" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
