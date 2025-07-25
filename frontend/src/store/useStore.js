// ../store/useStore.js

import { create } from 'zustand';

// Function to get initial state from localStorage
const getInitialState = () => {
  let user = null;
  let token = null;
  try {
    token = localStorage.getItem('authToken');
    // You might also store user details in localStorage if needed,
    // but typically the token is enough for re-authentication on page load.
    // For this case, we'll primarily rely on the token.
    if (token) {
        // If a token exists, you might want to fetch user details or
        // just assume a basic registeredUser object for initial checks
        // until a full user profile is loaded.
        // For simplicity, let's just make sure `registeredUser` is not null if a token exists.
        // A more robust solution would involve an initial API call to validate the token and fetch user details.
        // For now, let's assume if there's a token, there's a "user" logged in.
        // You might need to adjust this based on your backend's authentication flow.
        user = { username: 'Authenticated User (from token)' }; // Placeholder username
    }
  } catch (e) {
    console.error("Failed to read from localStorage:", e);
  }
  return {
    registeredUser: user,
    token: token,
    isLoading: false,
    error: null,
  };
};

const useRegistrationStore = create((set, get) => ({
  ...getInitialState(), // Initialize state from localStorage

  // Actions (rest remain the same)
  setRegisteredUser: (user) => set({ registeredUser: user }),
  setToken: (token) => set({ token: token }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error: error }),
  clearError: () => set({ error: null }),
  resetForm: () => {
    localStorage.removeItem('authToken'); // Clear token on logout/reset
    set({ registeredUser: null, token: null, isLoading: false, error: null });
  },

  signup: async (data) => {
    set({ isLoading: true, error: null });
    try {
      let requestBody;
      let requestHeaders = {};

      if (data instanceof FormData) {
        requestBody = data;
      } else {
        requestBody = JSON.stringify(data);
        requestHeaders['Content-Type'] = 'application/json';
      }

      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: requestHeaders,
        body: requestBody,
      });

      if (response.ok) {
        const result = await response.json();
        console.log('useStore.js: Signup successful - Full backend response:', result);
        console.log('useStore.js: Signup successful - Username:', result.user?.username || 'username not found in result.user');

        if (result.token) {
          localStorage.setItem('authToken', result.token);
          set({ token: result.token });
          console.log('useStore.js: AuthToken saved to localStorage and Zustand.');
        } else {
          console.warn('useStore.js: Signup successful, but no token received from backend.');
        }

        set({ registeredUser: result.user, isLoading: false, error: null });
        console.log('useStore.js: Zustand registeredUser set to:', get().registeredUser);

        return { success: true, message: 'Registration successful!', user: result.user, token: result.token };
      } else {
        const errorData = await response.json();
        console.error('useStore.js: Signup error:', errorData.message || 'Unknown error');
        set({ error: errorData.message || 'Registration failed.', isLoading: false });
        return { success: false, message: errorData.message || 'Registration failed.' };
      }
    } catch (error) {
      console.error('useStore.js: Network or unexpected signup error:', error);
      set({ error: 'Network error or unexpected issue during registration.', isLoading: false });
      return { success: false, message: 'Network error or unexpected issue during registration.' };
    }
  },

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('useStore.js: Login successful - Full backend response:', result);
        console.log('useStore.js: Login successful - Username:', result.user?.username || 'username not found in result.user');

        if (result.token) {
          localStorage.setItem('authToken', result.token);
          set({ token: result.token });
          console.log('useStore.js: AuthToken saved to localStorage and Zustand after login.');
        } else {
          console.warn('useStore.js: Login successful, but no token received from backend.');
        }

        set({ registeredUser: result.user, isLoading: false, error: null });
        console.log('useStore.js: Zustand registeredUser set to:', get().registeredUser);
        return { success: true, message: 'Login successful!', user: result.user, token: result.token };
      } else {
        const errorData = await response.json();
        console.error('useStore.js: Login error:', errorData.message || 'Unknown error');
        set({ error: errorData.message || 'Login failed.', isLoading: false });
        return { success: false, message: errorData.message || 'Login failed.' };
      }
    } catch (error) {
      console.error('useStore.js: Network or unexpected login error:', error);
      set({ error: 'Network error or unexpected issue during login.', isLoading: false });
      return { success: false, message: 'Network error or unexpected issue during login.' };
    }
  },
}));

export default useRegistrationStore;