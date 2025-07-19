// src/App.jsx (simplified)
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/Login';
import GreatHallPage from './pages/GreatHallPage';
import VirtualTourPage from './pages/VirtualTourPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashoard from './pages/Dashboard';
// ...other pages

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login/>} />
            <Route path='/register' element={<Register />} />
            <Route path="/greathall" element={<GreatHallPage />} />
            <Route path="/virtual-tour" element={<VirtualTourPage />} />
            <Route path="/dashboard" element={<Dashoard />} />
            {/* ... other routes */}
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;