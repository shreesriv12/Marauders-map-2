import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import useRegistrationStore from './store/useStore'; // Not directly needed for ProtectedRoute token check

// Import your components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/Login';
import GreatHallPage from './pages/GreatHallPage';
import VirtualTourPage from './pages/VirtualTourPage';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import HandTrackingPage from './pages/HandTracking'; // Import the new HandTrackingPage

// --- Corrected ProtectedRoute Component ---
const ProtectedRoute = ({ children }) => {
  // Get the token directly from localStorage for the primary authentication check.
  // This is the most reliable way for a route guard.
  const token = localStorage.getItem('authToken');

  console.log("ProtectedRoute: Checking localStorage for authToken:", token ? "Found" : "Not Found", token);

  // If there's no token, redirect to the homepage or login page
  if (!token) {
    console.log("ProtectedRoute: No valid token found in localStorage. Redirecting to /");
    return <Navigate to="/" replace />;
  }

  // If a token exists, render the child component (e.g., Dashboard)
  console.log("ProtectedRoute: AuthToken found in localStorage. Rendering children.");
  return children;
};
// --- End Corrected ProtectedRoute Component ---

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            {/* Public Routes - Accessible to everyone */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path='/register' element={<Register />} />
            <Route path="/greathall" element={<GreatHallPage />} />
            <Route path="/virtual-tour" element={<VirtualTourPage />} />

            {/* Protected Routes - Require authentication */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route // New Protected Route for HandTrackingPage
              path="/hand-tracking"
              element={
                <ProtectedRoute>
                  <HandTrackingPage />
                </ProtectedRoute>
              }
            />
            {/* You can add more protected routes here similarly */}

            {/* Fallback route for unmatched paths (optional) */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
