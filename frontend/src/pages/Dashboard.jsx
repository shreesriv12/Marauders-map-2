// Dashboard.jsx

import React, { useState, useEffect } from 'react';
import {
  User,
  Home,
  Star,
  Calendar,
  Mail,
  Wand2,
  Crown,
  Heart,
  BookOpen,
  Shield,
  Sparkles,
  LogOut,
  Settings,
  Trophy,
  Users,
  MapPin,
  Clock,
  Edit3,
  Cloud,
  Sun,
  CloudRain,
  CloudSnow,
  Moon,
  HandHelping // Import HandHelping icon for the new button
} from 'lucide-react';
import useRegistrationStore from '../store/useStore'; // Import the shared Zustand store
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection

const WizardDashboard = () => {
  // Use state from Zustand store
  const { registeredUser, setRegisteredUser, resetForm } = useRegistrationStore();
  const navigate = useNavigate(); // Initialize navigate

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState(null); // State for weather data

  // House configurations (static UI configurations)
  const houses = {
    gryffindor: {
      name: 'Gryffindor',
      colors: 'from-red-600 to-yellow-500',
      bgColors: 'from-red-50 to-yellow-50',
      borderColor: 'border-red-400',
      textColor: 'text-red-700',
      traits: 'Brave • Daring • Chivalrous',
      founder: 'Godric Gryffindor',
      element: 'Fire',
      symbol: '🦁',
      motto: 'Where dwell the brave at heart'
    },
    hufflepuff: {
      name: 'Hufflepuff',
      colors: 'from-yellow-500 to-amber-600',
      bgColors: 'from-yellow-50 to-amber-50',
      borderColor: 'border-yellow-400',
      textColor: 'text-yellow-700',
      traits: 'Loyal • Patient • Fair',
      founder: 'Helga Hufflepuff',
      element: 'Earth',
      symbol: '🦡',
      motto: 'Where they are just and loyal'
    },
    ravenclaw: {
      name: 'Ravenclaw',
      colors: 'from-blue-600 to-indigo-600',
      bgColors: 'from-blue-50 to-indigo-50',
      borderColor: 'border-blue-400',
      textColor: 'text-blue-700',
      traits: 'Wise • Witty • Learning',
      founder: 'Rowena Ravenclaw',
      element: 'Air',
      symbol: '🦅',
      motto: 'Where those of wit and learning'
    },
    slytherin: {
      name: 'Slytherin',
      colors: 'from-green-600 to-emerald-600',
      bgColors: 'from-green-50 to-emerald-50',
      borderColor: 'border-green-400',
      textColor: 'text-green-700',
      traits: 'Ambitious • Cunning • Leadership',
      founder: 'Salazar Slytherin',
      element: 'Water',
      symbol: '🐍',
      motto: 'Where cunning folk use any means'
    }
  };

  // Crucial: Define a sensible default user structure if registeredUser is not yet populated.
  // This helps prevent errors when accessing properties like registeredUser.fullName
  // before data is loaded or if registration didn't provide all fields.
  const defaultUserData = {
    fullName: 'Fellow Wizard',
    username: 'guest',
    email: 'guest@hogwarts.edu',
    dateOfBirth: '2000-01-01', // Example date
    house: 'gryffindor', // Default house for display purposes
    profilePicture: null, // This is a placeholder, 'avatarUrl' will be used from backend
    level: 'First Year',
    yearOfStudy: 'First Year',
    housePoints: 0,
    dormRoom: 'Great Hall', // Placeholder
    joinDate: new Date().toISOString(),
    favoriteSpell: 'None',
    wandCore: 'Unknown',
    petCompanion: 'None',
    favoriteSubjects: ['Charms', 'Potions'], // Example array
    achievements: ['First Class Passenger'], // Example array
    owlsReceived: 0,
    friends: 0,
    lastLogin: new Date().toISOString(), // Added lastLogin to default
  };

  // Merge registeredUser with default data for safe access
  // The 'avatarUrl' from registeredUser will override 'profilePicture: null'
  const user = registeredUser ? { ...defaultUserData, ...registeredUser } : defaultUserData;

  // Fetch user data from Zustand or attempt to load from persistence
  useEffect(() => {
    // Log initial state of registeredUser and authToken when component mounts
    console.log("Dashboard useEffect: Initial registeredUser state:", registeredUser);
    const initialAuthTokenCheck = localStorage.getItem('authToken');
    console.log("Dashboard useEffect: Initial localStorage authToken:", initialAuthTokenCheck ? "Found" : "Not Found", initialAuthTokenCheck);


    const loadUserData = async () => {
      // If registeredUser is already in Zustand (e.g., just registered or logged in),
      // and it's not just the default empty object from useStore, we're good to go.
      if (registeredUser && registeredUser.fullName && registeredUser.fullName !== 'Fellow Wizard') {
        console.log("User data already in Zustand:", registeredUser);
        setIsLoading(false);
        setError(null);
        return;
      }

      setIsLoading(true);
      try {
        const storedToken = localStorage.getItem('authToken'); // Assuming you store a token
        console.log("Dashboard loadUserData: Checking for authToken:", storedToken ? "Found" : "Not Found", storedToken);

        if (storedToken) {
          // --- IMPORTANT: Replace with your actual backend API call ---
          // This is a placeholder for fetching real user data after a refresh or direct navigation.
          console.log("Dashboard loadUserData: Attempting to fetch user profile with token...");
          const response = await fetch('http://localhost:5000/api/user/profile', {
            headers: { 'Authorization': `Bearer ${storedToken}` }
          });

          if (response.ok) {
            const userData = await response.json();
            console.log("Dashboard loadUserData: Successfully fetched user profile:", userData);

            // --- CRITICAL FIX: Check if setRegisteredUser is a function before calling ---
            if (typeof setRegisteredUser === 'function') {
              setRegisteredUser(userData); // Update Zustand store with real data
              setError(null);
            } else {
              console.error("Dashboard loadUserData: Zustand 'setRegisteredUser' is not a function. Store might be misconfigured.");
              setError("Initialization error: Could not update user data.");
              localStorage.removeItem('authToken');
              navigate('/');
            }
          } else {
            const errorData = await response.json();
            console.error('Dashboard loadUserData: Failed to fetch user profile:', response.status, errorData);
            setError(`Failed to load profile: ${errorData.message || 'Server error.'}`);
            localStorage.removeItem('authToken'); // Clear invalid token
            if (typeof setRegisteredUser === 'function') {
                setRegisteredUser(null); // Clear user data in store
            }
            console.log("Dashboard loadUserData: Redirecting to home due to failed profile fetch.");
            navigate('/'); // Redirect to your login/registration page
          }
        } else {
          // No token found or registeredUser is explicitly null, redirect to login
          setError('No user session found. Please log in.');
          if (typeof setRegisteredUser === 'function') {
            setRegisteredUser(null); // Ensure registeredUser is null
          }
          console.log("Dashboard loadUserData: Redirecting to home due to no user session.");
          navigate('/'); // Redirect to your login/registration page
        }
      } catch (err) {
        console.error('Dashboard loadUserData: Network error during user data load:', err);
        setError('Failed to connect to the server. Please check your internet.');
        localStorage.removeItem('authToken'); // Clear token on network error too
        if (typeof setRegisteredUser === 'function') {
            setRegisteredUser(null);
        }
        console.log("Dashboard loadUserData: Redirecting to home due to network error.");
        navigate('/'); // Redirect to your login/registration page
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [registeredUser, setRegisteredUser, navigate]); // Depend on registeredUser, its setter, and navigate

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Fetch mock weather data for Hogwarts
  useEffect(() => {
    const fetchWeather = async () => {
      // In a real app, you'd fetch from a weather API
      // For now, let's simulate
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      const mockWeather = {
        condition: 'Partly Cloudy',
        temperature: '15°C',
        icon: 'Cloud', // Corresponds to Lucide icon name
        description: 'Perfect weather for a Quidditch match!',
      };
      setWeather(mockWeather);
    };
    fetchWeather();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      console.error("Invalid date string:", dateString);
      return 'Invalid Date';
    }
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return 'N/A';
    try {
      const today = new Date();
      const birth = new Date(birthDate);
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      return age;
    } catch (e) {
      console.error("Invalid birth date string:", birthDate);
      return 'N/A';
    }
  };

  const getTimeGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getWeatherIcon = (condition) => {
    switch (condition.toLowerCase()) {
      case 'sunny': return <Sun className="h-10 w-10 text-yellow-500" />;
      case 'partly cloudy': return <Cloud className="h-10 w-10 text-gray-500" />;
      case 'cloudy': return <Cloud className="h-10 w-10 text-gray-600" />;
      case 'rainy': return <CloudRain className="h-10 w-10 text-blue-500" />;
      case 'snowy': return <CloudSnow className="h-10 w-10 text-blue-300" />;
      case 'night': return <Moon className="h-10 w-10 text-indigo-500" />;
      default: return <Cloud className="h-10 w-10 text-gray-400" />;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken'); // Clear token from storage
    resetForm(); // Reset Zustand store
    navigate('/'); // Redirect to login/registration page
  };

  // Handler for navigating to hand tracking page
  const handleGoToHandTracking = () => {
    navigate('/hand-tracking');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="bg-gradient-to-br from-amber-100 to-yellow-50 rounded-3xl shadow-2xl p-8 border-4 border-amber-400 text-center">
          <div className="animate-spin text-6xl mb-4">🔮</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Accessing Magical Records...</h2>
          <p className="text-gray-600">Please wait while we gather your information</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="bg-gradient-to-br from-red-100 to-pink-50 rounded-3xl shadow-2xl p-8 border-4 border-red-400 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-800 mb-2">Magical Error Detected</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')} // Navigate back to the login/registration
            className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // If registeredUser is still null after loading (e.g., no token, failed fetch),
  // this block ensures the "Access Denied" message is shown.
  // This might be redundant if the `error` state and navigation handle it,
  // but it's a safe fallback.
  if (!registeredUser || !registeredUser.fullName || registeredUser.fullName === 'Fellow Wizard') {
      return (
          <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
              <div className="bg-gradient-to-br from-amber-100 to-yellow-50 rounded-3xl shadow-2xl p-8 border-4 border-amber-400 text-center">
                  <div className="text-6xl mb-4">🚫</div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
                  <p className="text-gray-600 mb-4">Please log in to view your magical dashboard.</p>
                  <button
                      onClick={() => navigate('/')} // Redirect to your login/registration page
                      className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300"
                  >
                      Go to Login
                  </button>
              </div>
          </div>
      );
  }

  const currentHouse = houses[user.house.toLowerCase()] || houses.gryffindor; // Fallback to Gryffindor if house is missing or invalid

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4 font-inter">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`bg-gradient-to-r ${currentHouse.colors} rounded-3xl shadow-2xl p-6 mb-6 border-4 ${currentHouse.borderColor}`}>
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="flex items-center space-x-4 mb-4 lg:mb-0">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden border-4 border-white/30">
                  {/* Debugging: Log the profilePicture URL here */}
                  {console.log("Dashboard Render: user.profilePicture =", user.profilePicture)}
                  {/* Debugging: Log the avatarUrl here as well */}
                  {console.log("Dashboard Render: user.avatarUrl =", user.avatarUrl)}
                  {user.avatarUrl ? ( // Changed from user.profilePicture to user.avatarUrl
                    <img
                      src={user.avatarUrl} // Changed from user.profilePicture to user.avatarUrl
                      alt="Profile"
                      className="w-full h-full object-cover"
                      // Optional: Add onerror to see if image loading fails
                      onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x100/aabbcc/ffffff?text=Error'; console.error("Failed to load profile picture:", e.target.src); }}
                    />
                  ) : (
                    <User className="h-10 w-10 text-white" />
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 text-2xl">
                  {currentHouse.symbol}
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">
                  {getTimeGreeting()}, {user.fullName.split(' ')[0]}! ✨
                </h1>
                <p className="text-white/90 text-lg">
                  {user.level} • {currentHouse.name} House
                </p>
                <p className="text-white/75 text-sm">
                  Year {user.yearOfStudy} • {user.housePoints} House Points
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-white/90 text-sm">Current Time</div>
                <div className="text-white font-bold">
                  {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300">
                <Settings className="h-5 w-5" />
              </button>
              <button
                onClick={handleLogout} // Added logout handler
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl shadow-xl border-4 border-amber-400 mb-6">
          <div className="flex flex-wrap justify-center p-4 space-x-2">
            {[
              { id: 'profile', label: 'Profile', icon: User },
              { id: 'house', label: 'House Info', icon: Home },
              { id: 'magic', label: 'Magic Profile', icon: Wand2 },
              { id: 'achievements', label: 'Achievements', icon: Trophy },
              { id: 'social', label: 'Social', icon: Users }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 font-semibold ${
                  activeTab === id
                    ? `bg-gradient-to-r ${currentHouse.colors} text-white shadow-lg`
                    : 'bg-white hover:bg-gray-50 text-gray-700'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Main Content */}
          <div className="lg:col-span-2">

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border-4 border-amber-400 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">📋 Personal Details</h2>
                  <button className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white p-2 rounded-lg transition-all duration-300">
                    <Edit3 className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-amber-600" />
                      <div>
                        <p className="text-sm text-gray-500">Full Name</p>
                        <p className="font-semibold text-gray-800">{user.fullName}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Crown className="h-5 w-5 text-amber-600" />
                      <div>
                        <p className="text-sm text-gray-500">Username</p>
                        <p className="font-semibold text-gray-800">@{user.username}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-amber-600" />
                      <div>
                        <p className="text-sm text-gray-500">Email Address</p>
                        <p className="font-semibold text-gray-800">{user.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-amber-600" />
                      <div>
                        <p className="text-sm text-gray-500">Date of Birth</p>
                        <p className="font-semibold text-gray-800">
                          {formatDate(user.dateOfBirth)} ({calculateAge(user.dateOfBirth)} years old)
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-amber-600" />
                      <div>
                        <p className="text-sm text-gray-500">Dormitory</p>
                        <p className="font-semibold text-gray-800">{user.dormRoom}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <BookOpen className="h-5 w-5 text-amber-600" />
                      <div>
                        <p className="text-sm text-gray-500">Year of Study</p>
                        <p className="font-semibold text-gray-800">{user.yearOfStudy}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Clock className="h-5 w-5 text-amber-600" />
                      <div>
                        <p className="text-sm text-gray-500">Joined Hogwarts</p>
                        <p className="font-semibold text-gray-800">{formatDate(user.joinDate)}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Sparkles className="h-5 w-5 text-amber-600" />
                      <div>
                        <p className="text-sm text-gray-500">Last Login</p>
                        <p className="font-semibold text-gray-800">{formatDate(user.lastLogin)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* House Tab */}
            {activeTab === 'house' && (
              <div className={`bg-gradient-to-br ${currentHouse.bgColors} rounded-2xl shadow-xl border-4 ${currentHouse.borderColor} p-6`}>
                <div className="text-center mb-6">
                  <div className="text-8xl mb-4">{currentHouse.symbol}</div>
                  <h2 className={`text-3xl font-bold ${currentHouse.textColor} mb-2`}>
                    House {currentHouse.name}
                  </h2>
                  <p className={`text-lg ${currentHouse.textColor}/80`}>
                    "{currentHouse.motto}"
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className={`bg-white/70 backdrop-blur-sm rounded-xl p-6 border-2 ${currentHouse.borderColor}`}>
                    <h3 className={`text-xl font-bold ${currentHouse.textColor} mb-4`}>House Information</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600">Founder</p>
                        <p className={`font-semibold ${currentHouse.textColor}`}>{currentHouse.founder}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Element</p>
                        <p className={`font-semibold ${currentHouse.textColor}`}>{currentHouse.element}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Traits</p>
                        <p className={`font-semibold ${currentHouse.textColor}`}>{currentHouse.traits}</p>
                      </div>
                    </div>
                  </div>

                  <div className={`bg-white/70 backdrop-blur-sm rounded-xl p-6 border-2 ${currentHouse.borderColor}`}>
                    <h3 className={`text-xl font-bold ${currentHouse.textColor} mb-4`}>Your House Stats</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600">Current Points</p>
                        <p className={`font-bold text-2xl ${currentHouse.textColor}`}>{user.housePoints}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">House Rank</p>
                        <p className={`font-semibold ${currentHouse.textColor}`}>#2 of 4 Houses</p> {/* Mock data */}
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Personal Contribution</p>
                        <p className={`font-semibold ${currentHouse.textColor}`}>{user.housePoints} points earned</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Magic Tab */}
            {activeTab === 'magic' && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-xl border-4 border-purple-400 p-6">
                <div className="flex items-center mb-6">
                  <Wand2 className="h-8 w-8 text-purple-600 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-800">🪄 Magical Profile</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border-2 border-purple-300">
                    <div className="text-center">
                      <div className="text-4xl mb-3">⚡</div>
                      <h3 className="text-lg font-bold text-purple-700 mb-2">Favorite Spell</h3>
                      <p className="text-purple-600 font-semibold">{user.favoriteSpell}</p>
                    </div>
                  </div>

                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border-2 border-purple-300">
                    <div className="text-center">
                      <div className="text-4xl mb-3">🪄</div>
                      <h3 className="text-lg font-bold text-purple-700 mb-2">Wand Core</h3>
                      <p className="text-purple-600 font-semibold">{user.wandCore}</p>
                    </div>
                  </div>

                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border-2 border-purple-300">
                    <div className="text-center">
                      <div className="text-4xl mb-3">🦉</div>
                      <h3 className="text-lg font-bold text-purple-700 mb-2">Pet Companion</h3>
                      <p className="text-purple-600 font-semibold">{user.petCompanion}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">📚 Favorite Subjects</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Ensure user.favoriteSubjects is an array before mapping */}
                    {(user.favoriteSubjects || []).map((subject, index) => (
                      <div key={index} className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border-2 border-purple-300 text-center">
                        <BookOpen className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                        <p className="font-semibold text-purple-700">{subject}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Achievements Tab */}
            {activeTab === 'achievements' && (
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl shadow-xl border-4 border-yellow-400 p-6">
                <div className="flex items-center mb-6">
                  <Trophy className="h-8 w-8 text-yellow-600 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-800">🏆 Achievements & Awards</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Ensure user.achievements is an array before mapping */}
                  {(user.achievements || []).map((achievement, index) => (
                    <div key={index} className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border-2 border-yellow-300 text-center hover:shadow-lg transition-all duration-300">
                      <div className="text-4xl mb-3">
                        {/* More robust emoji selection */}
                        {index === 0 ? '🏅' : index === 1 ? '✨' : index === 2 ? '🌟' : '⭐'}
                      </div>
                      <h3 className="font-bold text-yellow-700 mb-2">{achievement}</h3>
                      <div className="w-full bg-yellow-200 rounded-full h-2">
                        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full" style={{ width: '100%' }}></div> {/* Mock progress */}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border-2 border-yellow-300">
                    <h3 className="text-xl font-bold text-yellow-700 mb-4">🦉 O.W.L.S Received</h3>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-yellow-600 mb-2">{user.owlsReceived}</div>
                      <p className="text-yellow-600">Outstanding Work Letters</p>
                    </div>
                  </div>

                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border-2 border-yellow-300">
                    <h3 className="text-xl font-bold text-yellow-700 mb-4">📈 Progress Level</h3>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600 mb-2">{user.level}</div>
                      <div className="w-full bg-yellow-200 rounded-full h-4 mb-2">
                        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 h-4 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                      <p className="text-yellow-600 text-sm">85% to Next Level</p> {/* Mock progress */}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Social Tab */}
            {activeTab === 'social' && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-xl border-4 border-blue-400 p-6">
                <div className="flex items-center mb-6">
                  <Users className="h-8 w-8 text-blue-600 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-800">👥 Social & Community</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border-2 border-blue-300">
                    <h3 className="text-xl font-bold text-blue-700 mb-4 flex items-center">
                      <Heart className="h-6 w-6 mr-2" />
                      Friends at Hogwarts
                    </h3>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-blue-600 mb-2">{user.friends}</div>
                      <p className="text-blue-600">Magical Friendships</p>
                    </div>
                  </div>

                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border-2 border-blue-300">
                    <h3 className="text-xl font-bold text-blue-700 mb-4">📬 Recent Activity</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Star className="h-4 w-4 text-blue-500" />
                        <p className="text-blue-600 text-sm">Earned 10 House Points</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <BookOpen className="h-4 w-4 text-blue-500" />
                        <p className="text-blue-600 text-sm">Completed Potions Assignment</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Users className="h-4 w-4 text-blue-500" />
                        <p className="text-blue-600 text-sm">Joined Study Group</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-amber-100 to-yellow-50 rounded-2xl shadow-xl border-4 border-amber-400 p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">⚡ Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">House Points</span>
                  <span className="font-bold text-amber-600">{user.housePoints}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Friends</span>
                  <span className="font-bold text-amber-600">{user.friends}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">O.W.L.S</span>
                  <span className="font-bold text-amber-600">{user.owlsReceived}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Achievements</span>
                  <span className="font-bold text-amber-600">{(user.achievements || []).length}</span>
                </div>
              </div>
            </div>

            {/* Hand Tracking Button */}
            <div className="bg-gradient-to-br from-purple-100 to-indigo-50 rounded-2xl shadow-xl border-4 border-purple-400 p-6 text-center">
                <h3 className="text-xl font-bold text-gray-800 mb-4">🖐️ Magical Interactions</h3>
                <button
                    onClick={handleGoToHandTracking}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
                >
                    <HandHelping className="h-5 w-5" />
                    <span>Start Hand Tracking</span>
                </button>
            </div>


            {/* Weather at Hogwarts */}
            <div className="bg-gradient-to-br from-sky-100 to-blue-50 rounded-2xl shadow-xl border-4 border-blue-400 p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">☁️ Weather at Hogwarts</h3>
              {weather ? (
                <div className="flex flex-col items-center justify-center text-gray-800">
                  <div className="text-6xl mb-2">
                    {getWeatherIcon(weather.condition)}
                  </div>
                  <p className="text-3xl font-bold mb-1">{weather.temperature}</p>
                  <p className="text-lg mb-2">{weather.condition}</p>
                  <p className="text-sm text-gray-600 text-center">{weather.description}</p>
                </div>
              ) : (
                <div className="flex items-center justify-center text-gray-600 h-24">
                  <span className="animate-pulse">Fetching weather...</span>
                </div>
              )}
            </div>

            {/* Upcoming Events (Mock Data) */}
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl shadow-xl border-4 border-green-400 p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">📅 Upcoming Events</h3>
                <ul className="space-y-3">
                    <li className="flex items-center space-x-3">
                        <Calendar className="h-5 w-5 text-green-600" />
                        <div>
                            <p className="font-semibold text-gray-800">Potions Exam</p>
                            <p className="text-sm text-gray-600">July 25, 2025 at 10:00 AM</p>
                        </div>
                    </li>
                    <li className="flex items-center space-x-3">
                        <Trophy className="h-5 w-5 text-green-600" />
                        <div>
                            <p className="font-semibold text-gray-800">Quidditch Tryouts</p>
                            <p className="text-sm text-gray-600">August 1, 2025 at 2:00 PM</p>
                        </div>
                    </li>
                    <li className="flex items-center space-x-3">
                        <BookOpen className="h-5 w-5 text-green-600" />
                        <div>
                            <p className="font-semibold text-gray-800">Ancient Runes Lecture</p>
                            <p className="text-sm text-gray-600">August 5, 2025 at 9:00 AM</p>
                        </div>
                    </li>
                </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WizardDashboard;
