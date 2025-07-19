import React, { useState } from 'react';
import { create } from 'zustand';
import { Camera, Upload, Wand2, Home, User, Mail, Lock, LockKeyhole, Calendar, Star } from 'lucide-react';

// Zustand store for registration state
const useRegistrationStore = create((set) => ({
  formData: {
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    house: '',
    autoSortHouse: false,
    favoriteSpell: '',
    wandCore: '',
    petCompanion: '',
    profilePicture: null, // Stores base64 string for preview
    profilePictureFile: null, // Stores the actual File object for upload
    agreeToTerms: false
  },
  currentStep: 1,
  isLoading: false,
  setFormData: (data) => set((state) => ({
    formData: { ...state.formData, ...data }
  })),
  setCurrentStep: (step) => set({ currentStep: step }),
  setLoading: (loading) => set({ isLoading: loading }),
  resetForm: () => set({
    formData: {
      fullName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      dateOfBirth: '',
      house: '',
      autoSortHouse: false,
      favoriteSpell: '',
      wandCore: '',
      petCompanion: '',
      profilePicture: null,
      profilePictureFile: null,
      agreeToTerms: false
    },
    currentStep: 1
  })
}));

const WizardRegistration = () => {
  const {
    formData,
    currentStep,
    isLoading,
    setFormData,
    setCurrentStep,
    setLoading,
    resetForm
  } = useRegistrationStore();

  const [sortingQuizActive, setSortingQuizActive] = useState(false);
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState([]);

  const houses = {
    gryffindor: {
      name: 'Gryffindor',
      colors: 'from-red-600 to-yellow-500',
      traits: 'Brave, Daring, Chivalrous'
    },
    hufflepuff: {
      name: 'Hufflepuff',
      colors: 'from-yellow-500 to-black',
      traits: 'Loyal, Patient, Fair'
    },
    ravenclaw: {
      name: 'Ravenclaw',
      colors: 'from-blue-600 to-gray-400',
      traits: 'Wise, Witty, Learning'
    },
    slytherin: {
      name: 'Slytherin',
      colors: 'from-green-600 to-gray-600',
      traits: 'Ambitious, Cunning, Leadership'
    }
  };

  const spells = [
    'Expelliarmus', 'Patronus Charm', 'Accio', 'Lumos', 'Expecto Patronum',
    'Wingardium Leviosa', 'Alohomora', 'Stupefy', 'Protego', 'Avada Kedavra'
  ];

  const wandCores = [
    'Phoenix Feather', 'Dragon Heartstring', 'Unicorn Hair', 'Thestral Tail Hair',
    'Veela Hair', 'Kelpie Mane', 'Basilisk Horn'
  ];

  const pets = [
    'Owl', 'Cat', 'Toad', 'Rat', 'Snake', 'Raven', 'Phoenix'
  ];

  const sortingQuestions = [
    {
      question: "Which quality do you most admire?",
      answers: [
        { text: "Courage", house: "gryffindor" },
        { text: "Loyalty", house: "hufflepuff" },
        { text: "Intelligence", house: "ravenclaw" },
        { text: "Ambition", house: "slytherin" }
      ]
    },
    {
      question: "What would you most like to study?",
      answers: [
        { text: "Defense Against the Dark Arts", house: "gryffindor" },
        { text: "Herbology", house: "hufflepuff" },
        { text: "Ancient Runes", house: "ravenclaw" },
        { text: "Potions", house: "slytherin" }
      ]
    },
    {
      question: "Which magical creature would you most like as a companion?",
      answers: [
        { text: "Griffin", house: "gryffindor" },
        { text: "Niffler", house: "hufflepuff" },
        { text: "Phoenix", house: "ravenclaw" },
        { text: "Basilisk", house: "slytherin" }
      ]
    },
    {
      question: "You find a lost, ancient magical artifact. What do you do?",
      answers: [
        { text: "Examine it carefully to understand its purpose.", house: "ravenclaw" },
        { text: "Try to use it for a noble cause.", house: "gryffindor" },
        { text: "Seek to understand its history and value before acting.", house: "slytherin" },
        { text: "Ensure it causes no harm and perhaps find its rightful owner.", house: "hufflepuff" }
      ]
    },
    {
      question: "What is your ideal way to spend a free afternoon?",
      answers: [
        { text: "Exploring the Forbidden Forest for new adventures.", house: "gryffindor" },
        { text: "Helping a friend with their homework or a difficult task.", house: "hufflepuff" },
        { text: "Reading in the library, delving into forgotten lore.", house: "ravenclaw" },
        { text: "Planning your next big achievement or strategy.", house: "slytherin" }
      ]
    },
    {
      question: "Faced with a difficult choice, what guides you?",
      answers: [
        { text: "My heart and what feels right.", house: "gryffindor" },
        { text: "The well-being of others and fairness.", house: "hufflepuff" },
        { text: "Logic and careful consideration.", house: "ravenclaw" },
        { text: "My desire to achieve my goals.", house: "slytherin" }
      ]
    },
    {
      question: "Which class would you excel in?",
      answers: [
        { text: "Charms, for its practical applications.", house: "gryffindor" },
        { text: "Care of Magical Creatures, fostering bonds.", house: "hufflepuff" },
        { text: "Arithmancy, for its complex patterns.", house: "ravenclaw" },
        { text: "Transfiguration, for its power to change.", house: "slytherin" }
      ]
    },
    {
      question: "What do you value most in friendship?",
      answers: [
        { text: "Shared adventures and unwavering support.", house: "gryffindor" },
        { text: "Kindness and mutual understanding.", house: "hufflepuff" },
        { text: "Intellectual discussions and new perspectives.", house: "ravenclaw" },
        { text: "Loyalty and a shared path to success.", house: "slytherin" }
      ]
    }
  ];

  const handleInputChange = (field, value) => {
    setFormData({ [field]: value });
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // For preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData({ profilePicture: e.target.result });
      };
      reader.readAsDataURL(file);

      // Store the actual File object for upload
      setFormData({ profilePictureFile: file });
    } else {
      setFormData({ profilePicture: null, profilePictureFile: null });
    }
  };

  const startSortingQuiz = () => {
    setSortingQuizActive(true);
    setCurrentQuizQuestion(0);
    setQuizAnswers([]);
  };

  const handleQuizAnswer = (answer) => {
    const newAnswers = [...quizAnswers, answer.house];
    setQuizAnswers(newAnswers);

    if (currentQuizQuestion < sortingQuestions.length - 1) {
      setCurrentQuizQuestion(currentQuizQuestion + 1);
    } else {
      const houseCount = newAnswers.reduce((acc, house) => {
        acc[house] = (acc[house] || 0) + 1;
        return acc;
      }, {});

      const sortedHouse = Object.keys(houseCount).reduce((a, b) =>
        houseCount[a] > houseCount[b] ? a : b
      );

      setFormData({ house: sortedHouse });
      setSortingQuizActive(false);
      setCurrentStep(3);
    }
  };

  // Function to show a custom message box (replaces alert())
  const showMessageBox = (title, message, emoji, onConfirm) => {
    const messageBox = document.createElement('div');
    messageBox.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    messageBox.innerHTML = `
      <div class="bg-gradient-to-br from-amber-100 to-yellow-50 rounded-3xl shadow-2xl p-8 max-w-md w-full text-center border-4 border-amber-400">
        <div class="text-6xl mb-4">${emoji}</div>
        <h3 class="text-2xl font-bold text-gray-800 mb-4">${title}</h3>
        <p class="text-gray-700 mb-6">${message}</p>
        <button id="closeMessageBox" class="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300">
          OK
        </button>
      </div>
    `;
    document.body.appendChild(messageBox);

    document.getElementById('closeMessageBox').onclick = () => {
      document.body.removeChild(messageBox);
      if (onConfirm) onConfirm();
    };
  };

  const handleSubmit = async () => {
    setLoading(true);
    const backendUrl = 'http://localhost:5000/api/auth/register'; // Your backend registration endpoint

    try {
      // Create FormData object to send multipart/form-data
      const data = new FormData();

      // Append all text fields
      data.append('fullName', formData.fullName);
      data.append('username', formData.username);
      data.append('email', formData.email);
      data.append('password', formData.password);
      data.append('house', formData.house);
      // Ensure dateOfBirth is formatted correctly for backend if it's a Date type
      if (formData.dateOfBirth) {
        data.append('dateOfBirth', formData.dateOfBirth);
      }
      data.append('favoriteSpell', formData.favoriteSpell);
      data.append('wandCore', formData.wandCore);
      data.append('petCompanion', formData.petCompanion);

      // Append the actual file if it exists
      if (formData.profilePictureFile) {
        data.append('profilePicture', formData.profilePictureFile);
      }

      const response = await fetch(backendUrl, {
        method: 'POST',
        body: data, // Send the FormData object
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Registration successful:', result);
        showMessageBox(
          'Welcome to Hogwarts!',
          'Your magical journey begins now! 🎉',
          '🎉',
          () => {
            resetForm();
            setLoading(false);
          }
        );
      } else {
        const errorData = await response.json();
        console.error('Registration failed:', response.status, errorData);
        showMessageBox(
          'Registration Failed!',
          `Error: ${errorData.message || 'Something went wrong on the server.'}`,
          '❌',
          () => setLoading(false)
        );
      }
    } catch (error) {
      console.error('Network error during registration:', error);
      showMessageBox(
        'Network Error!',
        'Could not connect to the server. Please check your internet connection or try again later.',
        '📡',
        () => setLoading(false)
      );
    }
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        // Basic email regex for client-side validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return (
          formData.fullName &&
          formData.username &&
          formData.email && emailRegex.test(formData.email) && // <--- Added email regex validation
          formData.password &&
          formData.confirmPassword &&
          (formData.password === formData.confirmPassword)
        );
      case 2:
        return formData.house || formData.autoSortHouse;
      case 3:
        return formData.agreeToTerms;
      default:
        return true;
    }
  };

  if (sortingQuizActive) {
    const currentQ = sortingQuestions[currentQuizQuestion];
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4 font-inter">
        <div className="bg-gradient-to-br from-amber-100 to-yellow-50 rounded-3xl shadow-2xl p-8 max-w-2xl w-full border-4 border-amber-400">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🎩</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">The Sorting Hat Speaks</h2>
            <p className="text-gray-600">Question {currentQuizQuestion + 1} of {sortingQuestions.length}</p>
          </div>

          <div className="bg-white rounded-xl p-6 mb-6 shadow-lg border-2 border-amber-300">
            <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">
              "{currentQ.question}"
            </h3>

            <div className="grid grid-cols-1 gap-4">
              {currentQ.answers.map((answer, index) => (
                <button
                  key={index}
                  onClick={() => handleQuizAnswer(answer)}
                  className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 hover:from-amber-100 hover:to-yellow-100 rounded-lg border-2 border-amber-200 hover:border-amber-400 transition-all duration-300 text-gray-800 font-medium"
                >
                  {answer.text}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4 font-inter">
      <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-3xl shadow-2xl max-w-4xl w-full border-4 border-amber-400 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-yellow-600 p-6 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Wand2 className="h-8 w-8 text-white" />
            <h1 className="text-3xl font-bold text-white">Wizard Registration</h1>
            <Wand2 className="h-8 w-8 text-white" />
          </div>
          <div className="flex justify-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  currentStep >= step
                    ? 'bg-white text-amber-600'
                    : 'bg-amber-400 text-white opacity-50'
                }`}
              >
                {step}
              </div>
            ))}
          </div>
        </div>

        <div className="p-8">
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">🧑‍🎓 Wizard Profile Setup</h2>
                <p className="text-gray-600">Tell us about your magical self</p>
              </div>

              {/* Profile Picture Upload */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center overflow-hidden border-4 border-amber-400">
                    {formData.profilePicture ? (
                      <img src={formData.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="h-10 w-10 text-white" />
                    )}
                  </div>
                  <label className="absolute -bottom-2 -right-2 bg-amber-500 rounded-full p-2 cursor-pointer hover:bg-amber-600 transition-colors">
                    <Camera className="h-4 w-4 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-sm text-gray-500 mt-2">Upload your magical profile picture</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name / Wizarding Name *
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="e.g., Hermione Granger or Mystica Flamewind"
                    className="w-full p-3 border-2 border-amber-300 rounded-lg focus:border-amber-500 focus:outline-none bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Username *
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    placeholder="Your unique wizarding handle"
                    className="w-full p-3 border-2 border-amber-300 rounded-lg focus:border-amber-500 focus:outline-none bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="your.owl@hogwarts.edu"
                    className="w-full p-3 border-2 border-amber-300 rounded-lg focus:border-amber-500 focus:outline-none bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    className="w-full p-3 border-2 border-amber-300 rounded-lg focus:border-amber-500 focus:outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Create a magical password"
                    className="w-full p-3 border-2 border-amber-300 rounded-lg focus:border-amber-500 focus:outline-none bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="Confirm your password"
                    className="w-full p-3 border-2 border-amber-300 rounded-lg focus:border-amber-500 focus:outline-none bg-white"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setCurrentStep(2)}
                  disabled={!validateStep(1)}
                  className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next: House Sorting 🏠
                </button>
              </div>
            </div>
          )}

          {/* Step 2: House Sorting */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">🏠 House Sorting</h2>
                <p className="text-gray-600">Discover your Hogwarts House</p>
              </div>

              <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-center space-x-4 mb-4">
                  <input
                    type="checkbox"
                    id="autoSort"
                    checked={formData.autoSortHouse}
                    onChange={(e) => handleInputChange('autoSortHouse', e.target.checked)}
                    className="w-5 h-5 text-amber-500 rounded focus:ring-amber-400"
                  />
                  <label htmlFor="autoSort" className="text-lg font-semibold text-gray-800">
                    Let the Sorting Hat decide my House! 🎩
                  </label>
                </div>
                <p className="text-gray-600 text-center">
                  Check this box to take the magical Sorting Hat quiz, or choose your house manually below
                </p>
              </div>

              {formData.autoSortHouse && (
                <div className="text-center">
                  <button
                    onClick={startSortingQuiz}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105"
                  >
                    🎩 Begin Sorting Ceremony
                  </button>
                </div>
              )}

              {!formData.autoSortHouse && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(houses).map(([key, house]) => (
                    <button
                      key={key}
                      onClick={() => handleInputChange('house', key)}
                      className={`p-6 rounded-xl border-3 transition-all duration-300 transform hover:scale-105 ${
                        formData.house === key
                          ? 'border-amber-500 bg-gradient-to-br ' + house.colors + ' text-white'
                          : 'border-gray-300 bg-white hover:border-amber-300'
                      }`}
                    >
                      <h3 className={`text-xl font-bold mb-2 ${
                        formData.house === key ? 'text-white' : 'text-gray-800'
                      }`}>
                        {house.name}
                      </h3>
                      <p className={`text-sm ${
                        formData.house === key ? 'text-gray-100' : 'text-gray-600'
                      }`}>
                        {house.traits}
                      </p>
                    </button>
                  ))}
                </div>
              )}

              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  disabled={!validateStep(2)}
                  className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next: Magic Preferences 🪄
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Magic Preferences & Final */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">🪄 Magic Preferences</h2>
                <p className="text-gray-600">Personalize your magical experience</p>
              </div>

              {formData.house && (
                <div className={`p-6 rounded-xl bg-gradient-to-br ${houses[formData.house].colors} text-white text-center mb-6`}>
                  <h3 className="text-2xl font-bold mb-2">Welcome to {houses[formData.house].name}!</h3>
                  <p className="text-lg">{houses[formData.house].traits}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Favorite Spell
                  </label>
                  <select
                    value={formData.favoriteSpell}
                    onChange={(e) => handleInputChange('favoriteSpell', e.target.value)}
                    className="w-full p-3 border-2 border-amber-300 rounded-lg focus:border-amber-500 focus:outline-none bg-white"
                  >
                    <option value="">Choose a spell...</option>
                    {spells.map((spell) => (
                      <option key={spell} value={spell}>{spell}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Wand Core
                  </label>
                  <select
                    value={formData.wandCore}
                    onChange={(e) => handleInputChange('wandCore', e.target.value)}
                    className="w-full p-3 border-2 border-amber-300 rounded-lg focus:border-amber-500 focus:outline-none bg-white"
                  >
                    <option value="">Choose a wand core...</option>
                    {wandCores.map((core) => (
                      <option key={core} value={core}>{core}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Pet Companion
                  </label>
                  <select
                    value={formData.petCompanion}
                    onChange={(e) => handleInputChange('petCompanion', e.target.value)}
                    className="w-full p-3 border-2 border-amber-300 rounded-lg focus:border-amber-500 focus:outline-none bg-white"
                  >
                    <option value="">Choose a companion...</option>
                    {pets.map((pet) => (
                      <option key={pet} value={pet}>{pet}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-gradient-to-r from-red-100 to-pink-100 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={formData.agreeToTerms}
                    onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                    className="w-5 h-5 text-amber-500 rounded focus:ring-amber-400"
                    required
                  />
                  <label htmlFor="terms" className="text-lg font-bold text-gray-800">
                    ✅ I solemnly swear I am up to no good
                  </label>
                </div>
                <p className="text-sm text-gray-600 ml-8">
                  By checking this box, you agree to the Terms & Conditions and Privacy Policy of Hogwarts School of Witchcraft and Wizardry
                </p>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300"
                >
                  ← Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!validateStep(3) || isLoading}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Casting Magic...</span>
                    </>
                  ) : (
                    <>
                      <Star className="h-5 w-5" />
                      <span>Begin My Journey! 🎉</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WizardRegistration;
