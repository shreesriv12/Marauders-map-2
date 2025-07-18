// src/App.jsx (simplified)
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import GreatHallPage from './pages/GreatHallPage';
// ...other pages

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/greathall" element={<GreatHallPage />} />
            {/* ... other routes */}
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;