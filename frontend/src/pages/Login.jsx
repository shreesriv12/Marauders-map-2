import React from 'react';
import { create } from 'zustand';
import { Mail, Lock, Star, Wand2, User } from 'lucide-react';

// Zustand store for login state
const useLoginStore = create((set) => ({
  loginFormData: {
    emailOrUsername: '',
    password: ''
  },
  isLoading: false,
  errorMessage: '',
  setLoginFormData: (data) => set((state) => ({
    loginFormData: { ...state.loginFormData, ...data }
  })),
  setLoading: (loading) => set({ isLoading: loading }),
  setErrorMessage: (message) => set({ errorMessage: message }),
  resetLoginForm: () => set({
    loginFormData: {
      emailOrUsername: '',
      password: ''
    },
    isLoading: false,
    errorMessage: ''
  })
}));

const WizardLoginPage = () => {
  const {
    loginFormData,
    isLoading,
    errorMessage,
    setLoginFormData,
    setLoading,
    setErrorMessage,
    resetLoginForm
  } = useLoginStore();

  const handleInputChange = (field, value) => {
    setLoginFormData({ [field]: value });
    setErrorMessage(''); // Clear error message on input change
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

  const validateForm = () => {
    return loginFormData.emailOrUsername && loginFormData.password;
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setLoading(true);
    setErrorMessage(''); // Clear previous errors

    const backendUrl = 'http://localhost:5000/api/auth/login'; // Your backend login endpoint

    try {
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginFormData), // Send login credentials as JSON
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Login successful:', result);
        // Here you would typically store the token (e.g., in localStorage or a global state)
        // and redirect the user to a protected dashboard page.
        showMessageBox(
          'Welcome Back, Wizard!',
          `Logged in as ${result.user.username || result.user.email}! Your magical journey continues! ✨`,
          '✨',
          () => {
            resetLoginForm();
            setLoading(false);
            // Example: Redirect to dashboard or home page
            // window.location.href = '/dashboard';
          }
        );
      } else {
        const errorData = await response.json();
        console.error('Login failed:', response.status, errorData);
        setErrorMessage(errorData.message || 'Login failed. Please check your credentials.');
        showMessageBox(
          'Login Failed!',
          errorData.message || 'Something went wrong. Please try again.',
          '❌',
          () => setLoading(false)
        );
      }
    } catch (error) {
      console.error('Network error during login:', error);
      setErrorMessage('Network error. Could not connect to the server.');
      showMessageBox(
        'Network Error!',
        'Could not connect to the server. Please check your internet connection or try again later.',
        '📡',
        () => setLoading(false)
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4 font-inter">
      <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-3xl shadow-2xl max-w-md w-full border-4 border-amber-400 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-yellow-600 p-6 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Wand2 className="h-8 w-8 text-white" />
            <h1 className="text-3xl font-bold text-white">Wizard Login</h1>
            <Wand2 className="h-8 w-8 text-white" />
          </div>
        </div>

        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">🔑 Access the Magic</h2>
            <p className="text-gray-600">Enter your credentials to continue your journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email or Username
              </label>
              <input
                type="text"
                value={loginFormData.emailOrUsername}
                onChange={(e) => handleInputChange('emailOrUsername', e.target.value)}
                placeholder="your.owl@hogwarts.edu or your handle"
                className="w-full p-3 border-2 border-amber-300 rounded-lg focus:border-amber-500 focus:outline-none bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={loginFormData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Your magical password"
                className="w-full p-3 border-2 border-amber-300 rounded-lg focus:border-amber-500 focus:outline-none bg-white"
                required
              />
            </div>

            {errorMessage && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
                <strong className="font-bold">Oops!</strong>
                <span className="block sm:inline"> {errorMessage}</span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <a href="#" className="text-amber-600 hover:underline text-sm font-medium">
                Forgot your password?
              </a>
              <button
                type="submit"
                disabled={!validateForm() || isLoading}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Logging In...</span>
                  </>
                ) : (
                  <>
                    <Star className="h-5 w-5" />
                    <span>Enter Hogwarts!</span>
                  </>
                )}
              </button>
            </div>

            <div className="text-center mt-6">
              <p className="text-gray-700">
                New to Hogwarts?{' '}
                <a href="/register" className="text-amber-600 hover:underline font-bold">
                  Register here!
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WizardLoginPage;
