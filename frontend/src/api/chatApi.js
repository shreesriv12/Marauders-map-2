const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const fetchWithAuth = async (url, token, options = {}) => {
    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers,
        },
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Something went wrong with the API call.');
    }
    return data;
};

export const registerUserApi = async (userData) => {
    // Note: For registration with file upload, you'd use FormData
    // This is a simplified version assuming no file for initial API call setup.
    // If you're sending files, you'll need to adjust this.
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json', // Adjust if sending FormData
        },
        body: JSON.stringify(userData), // Adjust if sending FormData
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Registration failed.');
    }
    return data;
};

export const loginUserApi = async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Login failed.');
    }
    return data;
};

export const getMyProfileApi = async (token) => {
    return fetchWithAuth(`${API_BASE_URL}/auth/me`, token);
};

export const getAllUsersApi = async (token) => {
    return fetchWithAuth(`${API_BASE_URL}/auth/users`, token);
};

// NEW: API call to get all conversations (list of users you've chatted with)
export const getUserConversationsApi = async (token) => {
    return fetchWithAuth(`${API_BASE_URL}/chats`, token);
};

// NEW: API call to get messages for a specific conversation (between two users)
export const getMessagesBetweenUsersApi = async (token, otherUserId) => {
    return fetchWithAuth(`${API_BASE_URL}/chats/${otherUserId}/messages`, token);
};

// Removed createChatApi and sendMessageApi as they are now handled by Socket.IO
// or the new conversation/message fetching logic.