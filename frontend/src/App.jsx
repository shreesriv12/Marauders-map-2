import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import your components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/Login';
import GreatHallPage from './pages/GreatHallPage';
import VirtualTourPage from './pages/VirtualTourPage';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import HandTrackingPage from './pages/HandTracking';
import DailyProphetPage from './pages/DailyProphetPage';
import AskLibrarianChat from './pages/AskLibrarianChat'; // NEW: Import the chatbot component
import MaraudersMap from './pages/MaraudersMap'; // NEW: Import the MaraudersMap component
import TransfigurationBooth from './pages/TransfigurationBooth';


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
            
            {/* NEW: Route for the Daily Prophet page (public or protected based on your design) */}
            <Route path="/daily-prophet" element={<DailyProphetPage />} />

            {/* Protected Routes - Require authentication */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route // Existing Protected Route for HandTrackingPage
              path="/hand-tracking"
              element={
                <ProtectedRoute>
                  <HandTrackingPage />
                </ProtectedRoute>
              }
            />
            {/* NEW: Protected Route for the Ask Librarian AI Chatbot page */}
            <Route
              path="/ask-librarian"
              element={
                <ProtectedRoute>
                  <AskLibrarianChat />
                </ProtectedRoute>
              }
            />
            {/* NEW: Protected Route for the Marauder's Map page */}
            <Route
              path="/maraudersmap"
              element={
                <ProtectedRoute>
                  <MaraudersMap />
                </ProtectedRoute>
              }
            />
            {/* New:protected route for transfiguration booth */}
            <Route
              path="/transfiguration-booth"
              element={
                <ProtectedRoute>
                  <TransfigurationBooth />
                </ProtectedRoute>
              }
            />

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
