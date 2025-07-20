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
  MapPin, // MapPin is already imported
  Clock,
  Edit3,
  Cloud,
  Sun,
  CloudRain,
  CloudSnow,
  Moon,
  HandHelping,
  Newspaper,
  MessageSquareText // Import MessageSquareText icon for the chatbot button
} from 'lucide-react';
import useRegistrationStore from '../store/useStore';
import { useNavigate } from 'react-router-dom';

const WizardDashboard = () => {
  const { registeredUser, setRegisteredUser, resetForm } = useRegistrationStore();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState(null);

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

  const defaultUserData = {
    fullName: 'Fellow Wizard',
    username: 'guest',
    email: 'guest@hogwarts.edu',
    dateOfBirth: '2000-01-01',
    house: 'gryffindor',
    profilePicture: null,
    level: 'First Year',
    yearOfStudy: 'First Year',
    housePoints: 0,
    dormRoom: 'Great Hall',
    joinDate: new Date().toISOString(),
    favoriteSpell: 'None',
    wandCore: 'Unknown',
    petCompanion: 'None',
    favoriteSubjects: ['Charms', 'Potions'],
    achievements: ['First Class Passenger'],
    owlsReceived: 0,
    friends: 0,
    lastLogin: new Date().toISOString(),
  };

  const user = registeredUser ? { ...defaultUserData, ...registeredUser } : defaultUserData;

  useEffect(() => {
    console.log("Dashboard useEffect: Initial registeredUser state:", registeredUser);
    const initialAuthTokenCheck = localStorage.getItem('authToken');
    console.log("Dashboard useEffect: Initial localStorage authToken:", initialAuthTokenCheck ? "Found" : "Not Found", initialAuthTokenCheck);

    const loadUserData = async () => {
      if (registeredUser && registeredUser.fullName && registeredUser.fullName !== 'Fellow Wizard') {
        console.log("User data already in Zustand:", registeredUser);
        setIsLoading(false);
        setError(null);
        return;
      }

      setIsLoading(true);
      try {
        const storedToken = localStorage.getItem('authToken');
        console.log("Dashboard loadUserData: Checking for authToken:", storedToken ? "Found" : "Not Found", storedToken);

        if (storedToken) {
          console.log("Dashboard loadUserData: Attempting to fetch user profile with token...");
          const response = await fetch('http://localhost:5000/api/user/profile', {
            headers: { 'Authorization': `Bearer ${storedToken}` }
          });

          if (response.ok) {
            const userData = await response.json();
            console.log("Dashboard loadUserData: Successfully fetched user profile:", userData);

            if (typeof setRegisteredUser === 'function') {
              setRegisteredUser(userData);
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
            localStorage.removeItem('authToken');
            if (typeof setRegisteredUser === 'function') {
              setRegisteredUser(null);
            }
            console.log("Dashboard loadUserData: Redirecting to home due to failed profile fetch.");
            navigate('/');
          }
        } else {
          setError('No user session found. Please log in.');
          if (typeof setRegisteredUser === 'function') {
            setRegisteredUser(null);
          }
          console.log("Dashboard loadUserData: Redirecting to home due to no user session.");
          navigate('/');
        }
      } catch (err) {
        console.error('Dashboard loadUserData: Network error during user data load:', err);
        setError('Failed to connect to the server. Please check your internet.');
        localStorage.removeItem('authToken');
        if (typeof setRegisteredUser === 'function') {
          setRegisteredUser(null);
        }
        console.log("Dashboard loadUserData: Redirecting to home due to network error.");
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [registeredUser, setRegisteredUser, navigate]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchWeather = async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      const mockWeather = {
        condition: 'Partly Cloudy',
        temperature: '15°C',
        icon: 'Cloud',
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
    localStorage.removeItem('authToken');
    resetForm();
    navigate('/');
  };

  const handleGoToHandTracking = () => {
    navigate('/hand-tracking');
  };

  const handleGoToDailyProphet = () => {
    navigate('/daily-prophet');
  };

  // Handler for navigating to Ask Librarian AI Chatbot page
  const handleGoToLibrarianChat = () => {
    navigate('/ask-librarian');
  };

  // NEW: Handler for navigating to Marauder's Map page
  const handleGoToMaraudersMap = () => {
    navigate('/maraudersmap');
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
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (!registeredUser || !registeredUser.fullName || registeredUser.fullName === 'Fellow Wizard') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="bg-gradient-to-br from-amber-100 to-yellow-50 rounded-3xl shadow-2xl p-8 border-4 border-amber-400 text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">Please log in to view your magical dashboard.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const currentHouse = houses[user.house.toLowerCase()] || houses.gryffindor;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4 font-inter">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`bg-gradient-to-r ${currentHouse.colors} rounded-3xl shadow-2xl p-6 mb-6 border-4 ${currentHouse.borderColor}`}>
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="flex items-center space-x-4 mb-4 lg:mb-0">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden border-4 border-white/30">
                  {console.log("Dashboard Render: user.profilePicture =", user.profilePicture)}
                  {console.log("Dashboard Render: user.avatarUrl =", user.avatarUrl)}
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt="Profile"
                      className="w-full h-full object-cover"
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
                onClick={handleLogout}
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
              { id: 'social', label: 'Social', icon: Users },
              { id: 'marauders-map', label: 'Marauder\'s Map', icon: MapPin, handler: handleGoToMaraudersMap }, // NEW BUTTON
              { id: 'ask-librarian', label: 'Ask Librarian AI', icon: MessageSquareText, handler: handleGoToLibrarianChat }
            ].map(({ id, label, icon: Icon, handler }) => (
              <button
                key={id}
                onClick={handler || (() => setActiveTab(id))} // Use handler if provided, else set active tab
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 font-semibold ${
                  activeTab === id || handler
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
                        <p className={`font-semibold ${currentHouse.textColor}`}>#2 of 4 Houses</p>
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
                  {(user.achievements || []).map((achievement, index) => (
                    <div key={index} className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border-2 border-yellow-300 text-center hover:shadow-lg transition-all duration-300">
                      <div className="text-4xl mb-3">
                        {index === 0 ? '🏅' : index === 1 ? '✨' : index === 2 ? '🌟' : '⭐'}
                      </div>
                      <h3 className="font-bold text-yellow-700 mb-2">{achievement}</h3>
                      <div className="w-full bg-yellow-200 rounded-full h-2">
                        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full" style={{ width: '100%' }}></div>
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
                      <p className="text-yellow-600 text-sm">85% to Next Level</p>
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
                  <h2 className="text-2xl font-bold text-gray-800">👥 Friends & Fellow Students</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border-2 border-blue-300 text-center">
                    <p className="text-sm text-gray-600 mb-2">Total Friends</p>
                    <p className="text-5xl font-bold text-blue-700">{user.friends}</p>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border-2 border-blue-300 text-center">
                    <p className="text-sm text-gray-600 mb-2">Pending Friend Requests</p>
                    <p className="text-5xl font-bold text-blue-700">0</p> {/* Mock data */}
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Find New Friends</h3>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Search by username..."
                      className="flex-grow p-3 rounded-lg border-2 border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white p-3 rounded-lg transition-all duration-300">
                      Search
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Weather Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-xl border-4 border-blue-400 p-6 text-center">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Hogwarts Weather</h2>
              {weather ? (
                <>
                  <div className="flex items-center justify-center space-x-3 mb-4">
                    {getWeatherIcon(weather.condition)}
                    <span className="text-4xl font-bold text-gray-800">{weather.temperature}</span>
                  </div>
                  <p className="text-gray-600 text-lg mb-2">{weather.condition}</p>
                  <p className="text-gray-500 text-sm">{weather.description}</p>
                </>
              ) : (
                <p className="text-gray-500">Fetching weather...</p>
              )}
            </div>

            {/* Quick Actions Card */}
            <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl shadow-xl border-4 border-green-400 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">⚡ Quick Actions</h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleGoToDailyProphet} // Navigates to Daily Prophet
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border-2 border-green-300 text-center flex flex-col items-center justify-center hover:shadow-lg transition-all duration-300"
                >
                  <Newspaper className="h-6 w-6 text-green-600 mb-2" />
                  <span className="font-semibold text-green-700 text-sm">Daily Prophet</span>
                </button>
                <button
                  onClick={handleGoToHandTracking} // Navigates to Hand Tracking
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border-2 border-green-300 text-center flex flex-col items-center justify-center hover:shadow-lg transition-all duration-300"
                >
                  <HandHelping className="h-6 w-6 text-green-600 mb-2" />
                  <span className="font-semibold text-green-700 text-sm">Wand Practice</span>
                </button>
                {/* Additional Quick Actions can be added here */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WizardDashboard;
