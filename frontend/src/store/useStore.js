// ../store/useStore.js

import { create } from 'zustand';

const useRegistrationStore = create((set, get) => ({
  registeredUser: null,
  token: null,
  isLoading: false, // Added isLoading state
  error: null,      // Added error state

  // Actions
  setRegisteredUser: (user) => set({ registeredUser: user }),
  setToken: (token) => set({ token: token }),
  setLoading: (loading) => set({ isLoading: loading }), // Added setLoading action
  setError: (error) => set({ error: error }),           // Added setError action
  clearError: () => set({ error: null }),               // Added clearError action
  resetForm: () => set({ registeredUser: null, token: null, isLoading: false, error: null }),

  // Modified signup action to handle FormData for file uploads
  signup: async (data) => { // 'data' can now be a plain object or FormData
    set({ isLoading: true, error: null }); // Set loading and clear previous errors
    try {
      let requestBody;
      let requestHeaders = {};

      if (data instanceof FormData) {
        requestBody = data;
        // Do NOT set Content-Type for FormData, browser handles it
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
    set({ isLoading: true, error: null }); // Set loading and clear previous errors
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
