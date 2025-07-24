import React, { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import useRegistrationStore from '../store/useStore';
import {
    getUserConversationsApi, // New API for conversation list
    getMessagesBetweenUsersApi, // New API for messages between two users
    getAllUsersApi // To fetch all users for the "Online Wizards" list
} from '../api/chatApi';
import { MessageSquareText, Users, LogOut } from 'lucide-react';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

function ChatPage() {
    const { token, registeredUser, isLoading: authLoading, logout } = useRegistrationStore();

    // Ensure _id is used consistently for the current user
    const currentUserId = registeredUser?._id || registeredUser?.id || '';
    const userName = registeredUser?.username || registeredUser?.fullName || '';
    const currentUserAvatar = registeredUser?.avatarUrl || 'https://placehold.co/100x100/aabbcc/ffffff?text=U';

    const [conversations, setConversations] = useState([]); // List of users current user has chatted with
    const [selectedConversationPartner, setSelectedConversationPartner] = useState(null); // The other user in the currently selected chat
    const [messages, setMessages] = useState([]); // Messages for the selected conversation
    const [newMessageContent, setNewMessageContent] = useState('');

    const [chatError, setChatError] = useState(null);
    const [chatLoading, setChatLoading] = useState(false); // For API calls
    const [socket, setSocket] = useState(null);

    const [onlineWizards, setOnlineWizards] = useState([]); // List of all online users (excluding self)
    const [allUsers, setAllUsers] = useState([]); // All registered users (for potential new chats)

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Helper function to make authenticated fetch requests
    const fetchWithAuth = useCallback(async (url, options = {}) => {
        setChatLoading(true);
        setChatError(null);
        try {
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
                throw new Error(data.message || 'Something went wrong');
            }
            return data;
        } catch (err) {
            setChatError(err.message);
            console.error('API Error in fetchWithAuth:', err);
            throw err;
        } finally {
            setChatLoading(false);
        }
    }, [token]); // token is a dependency

    // Fetch all users for the "Online Wizards" list
    const fetchAllUsers = useCallback(async () => {
        if (!token || !currentUserId || authLoading) return;
        try {
            const users = await fetchWithAuth(`${API_BASE_URL}/auth/users`);
            setAllUsers(users);
        } catch (err) {
            console.error("Error fetching all users:", err);
            setChatError(err.message || "Failed to fetch all users.");
        }
    }, [token, currentUserId, authLoading, fetchWithAuth]);


    // Fetch conversations (users current user has chatted with)
    const fetchConversations = useCallback(async () => {
        if (!token || !currentUserId || authLoading) return;
        try {
            // This calls the new GET /api/chats route
            const data = await fetchWithAuth(`${API_BASE_URL}/chats`);
            // The backend returns an array of { otherUser: { ... }, lastMessage: { ... } }
            setConversations(data);
        } catch (err) {
            console.error("Error fetching conversations:", err);
            setChatError(err.message || "Failed to load conversations.");
        }
    }, [token, currentUserId, authLoading, fetchWithAuth]);

    // Fetch messages for a specific conversation partner
    const fetchMessages = useCallback(async (otherUserId) => {
        if (!token || !currentUserId || authLoading || !otherUserId) {
            setMessages([]);
            return;
        }
        try {
            // This calls the GET /api/chats/:otherUserId/messages route
            const data = await fetchWithAuth(`${API_BASE_URL}/chats/${otherUserId}/messages`);
            setMessages(data); // Data is an array of messages
        } catch (err) {
            console.error("Error fetching messages:", err);
            setChatError(err.message || "Failed to load messages for this chat.");
        }
    }, [token, currentUserId, authLoading, fetchWithAuth]);


    // Effect for Socket.IO connection and event listeners
    useEffect(() => {
        if (token && currentUserId && !authLoading) {
            const newSocket = io(SOCKET_URL, {
                auth: { token: token }, // Pass the JWT token for authentication
                reconnection: true,
                reconnectionAttempts: Infinity,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                timeout: 20000
            });

            setSocket(newSocket);

            newSocket.on('connect', () => {
                console.log('Socket.IO Connected! Socket ID:', newSocket.id);
            });

            // Listen for online users update (from Marauder's Map or general online status)
            newSocket.on('online_users_update', (onlineUserIds) => {
                console.log('Received online users update:', onlineUserIds);
                // Filter out self and map to full user objects using allUsers state
                const filteredOnlineUsers = allUsers.filter(user =>
                    onlineUserIds.includes(user._id) && user._id !== currentUserId
                );
                setOnlineWizards(filteredOnlineUsers);
            });

            // Listen for new messages
            newSocket.on('receive_message', (message) => {
                console.log('Received new message via socket:', message);
                // Add message if it belongs to the currently selected conversation
                // A message is relevant if current user is sender OR receiver, AND the other party matches selectedConversationPartner
                const isRelevant =
                    (message.sender._id === selectedConversationPartner?._id && message.receiver._id === currentUserId) ||
                    (message.receiver._id === selectedConversationPartner?._id && message.sender._id === currentUserId);

                if (isRelevant) {
                    setMessages((prevMessages) => [...prevMessages, message]);
                }

                // Update conversations list with the latest message
                setConversations(prevConversations => {
                    let updatedConversations = prevConversations.map(convo => {
                        const convoOtherUserId = convo.otherUser._id;
                        // Check if this message is part of this conversation
                        if ((message.sender._id === convoOtherUserId && message.receiver._id === currentUserId) ||
                            (message.receiver._id === convoOtherUserId && message.sender._id === currentUserId)) {
                            return {
                                ...convo,
                                lastMessage: {
                                    content: message.content,
                                    timestamp: message.createdAt, // Use createdAt from message
                                    sender: message.sender
                                }
                            };
                        }
                        return convo;
                    });

                    // If the conversation doesn't exist yet (e.g., first message from a new user)
                    const messageOtherPartyId = message.sender._id === currentUserId ? message.receiver._id : message.sender._id;
                    const existingConvo = updatedConversations.find(c => c.otherUser._id === messageOtherPartyId);

                    if (!existingConvo) {
                        // Find the full user object for the other party
                        const otherUser = allUsers.find(u => u._id === messageOtherPartyId);
                        if (otherUser) {
                            updatedConversations = [{
                                otherUser: otherUser,
                                lastMessage: {
                                    content: message.content,
                                    timestamp: message.createdAt,
                                    sender: message.sender
                                }
                            }, ...updatedConversations];
                        }
                    }

                    // Sort to bring the most recent conversation to the top
                    return updatedConversations.sort((a, b) => {
                        const tsA = a.lastMessage?.timestamp ? new Date(a.lastMessage.timestamp).getTime() : 0;
                        const tsB = b.lastMessage?.timestamp ? new Date(b.lastMessage.timestamp).getTime() : 0;
                        return tsB - tsA;
                    });
                });
            });

            newSocket.on('chatError', (errorMessage) => {
                console.error('Socket Chat Error:', errorMessage);
                setChatError(errorMessage);
            });

            newSocket.on('disconnect', (reason) => {
                console.log('Socket.IO Disconnected:', reason);
                setOnlineWizards([]);
            });

            newSocket.on('connect_error', (err) => {
                console.error('Socket.IO Connection Error:', err.message);
                setChatError(`Socket connection error: ${err.message}`);
            });

            return () => {
                console.log('Cleaning up Socket.IO connection...');
                if (newSocket && newSocket.connected) {
                    newSocket.disconnect();
                }
            };
        } else if (socket && socket.connected) {
            console.log('Socket Effect: Conditions no longer met, disconnecting existing socket.');
            socket.disconnect();
            setSocket(null);
            setOnlineWizards([]);
        }
    }, [token, currentUserId, authLoading, selectedConversationPartner, allUsers]); // Dependencies for socket effect

    // Initial data fetching
    useEffect(() => {
        if (token && currentUserId && !authLoading) {
            fetchAllUsers(); // Fetch all users first for online list mapping
            fetchConversations(); // Then fetch conversations
        }
    }, [token, currentUserId, authLoading, fetchAllUsers, fetchConversations]);

    // Fetch messages when selectedConversationPartner changes
    useEffect(() => {
        if (selectedConversationPartner) {
            fetchMessages(selectedConversationPartner._id);
        } else {
            setMessages([]);
        }
    }, [selectedConversationPartner, fetchMessages]);

    // Scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages]);


    // Handle clicking on an online wizard to open a chat
    const handleWizardClick = async (wizardUser) => {
        // wizardUser is the full user object from allUsers/onlineWizards
        setSelectedConversationPartner(wizardUser);
        // The fetchMessages useEffect will handle loading messages
    };

    // Send a message via Socket.IO
    const sendMessage = async (e) => {
        e.preventDefault();
        if (!selectedConversationPartner || !newMessageContent.trim() || !socket) {
            setChatError('Please select a wizard and type a message.');
            return;
        }

        const messageContentToSend = newMessageContent.trim();
        setNewMessageContent(''); // Clear input immediately

        setChatError(null); // Clear previous errors

        try {
            // Emit the message via Socket.IO
            socket.emit('send_message', {
                receiverId: selectedConversationPartner._id,
                content: messageContentToSend
            });
            // The 'receive_message' event handler will update the UI
            // for both sender and receiver.
        } catch (err) {
            console.error('Error emitting message:', err);
            setChatError('Failed to send message via socket.');
        }
    };

    // Helper to get display name for a conversation partner
    const getConversationDisplayName = (user) => {
        return user ? (user.fullName || user.username || 'Unknown User') : 'Unknown User';
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 text-white font-inter p-4 flex flex-col items-center justify-center">
                <h1 className="text-4xl font-bold mb-8 text-yellow-300 drop-shadow-lg">Hogwarts Chat</h1>
                <div className="text-center text-gray-400 text-xl">
                    Authenticating... Please wait.
                </div>
            </div>
        );
    }

    if (!token || !currentUserId) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 text-white font-inter p-4 flex flex-col items-center justify-center">
                <h1 className="text-4xl font-bold mb-8 text-yellow-300 drop-shadow-lg">Hogwarts Chat</h1>
                <div className="text-center text-gray-400 text-xl">
                    Please log in to access the chat features.
                    <Link to="/login" className="text-yellow-400 hover:underline block mt-4">Go to Login</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 text-white font-inter p-4 flex flex-col items-center">
            <div className="flex justify-between items-center w-full max-w-5xl mb-8">
                <h1 className="text-4xl font-bold text-yellow-300 drop-shadow-lg">Hogwarts Chat</h1>
                <button
                    onClick={logout}
                    className="flex items-center bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105 shadow-md"
                >
                    <LogOut className="h-5 w-5 mr-2" /> Logout
                </button>
            </div>

            {chatError && (
                <div className="bg-red-700 p-3 rounded-md mb-4 w-full max-w-3xl text-center">
                    Error: {chatError}
                </div>
            )}
            {chatLoading && (
                <div className="bg-blue-700 p-3 rounded-md mb-4 w-full max-w-3xl text-center">
                    Loading Chat Data...
                </div>
            )}

            <div className="flex flex-col md:flex-row bg-gray-800 rounded-lg shadow-xl w-full max-w-5xl h-[70vh]">
                {/* Left Sidebar: Online Wizards and Conversations List */}
                <div className="w-full md:w-1/3 border-r border-gray-700 p-4 overflow-y-auto custom-scrollbar">
                    {/* Online Wizards Section */}
                    <div className="mb-6 pb-4 border-b border-gray-700">
                        <h2 className="text-xl font-semibold mb-4 text-yellow-200 flex items-center">
                            <Users className="h-5 w-5 mr-2" /> Online Wizards ({onlineWizards.length})
                        </h2>
                        {onlineWizards.length === 0 ? (
                            <p className="text-gray-400 text-sm">No other wizards currently online.</p>
                        ) : (
                            <ul className="space-y-2">
                                {onlineWizards.map((user) => (
                                    <li
                                        key={user._id}
                                        className="flex items-center space-x-3 p-2 bg-gray-700 rounded-md cursor-pointer hover:bg-gray-600 transition duration-200 ease-in-out"
                                        onClick={() => handleWizardClick(user)}
                                    >
                                        <img src={user.avatarUrl} alt={user.username} className="w-8 h-8 rounded-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x100/aabbcc/ffffff?text=U'; }}/>
                                        <span className="text-white font-medium">{user.fullName || user.username}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Your Conversations Section */}
                    <h2 className="text-xl font-semibold mb-4 text-yellow-200 flex items-center">
                        <MessageSquareText className="h-5 w-5 mr-2" /> Your Conversations
                    </h2>
                    {conversations.length === 0 ? (
                        <p className="text-gray-400">No conversations yet. Click an online wizard to start!</p>
                    ) : (
                        <ul className="space-y-2">
                            {conversations.map((convo) => (
                                <li
                                    key={convo.otherUser._id}
                                    className={`p-3 rounded-md cursor-pointer transition duration-200 ease-in-out ${
                                        selectedConversationPartner && selectedConversationPartner._id === convo.otherUser._id ? 'bg-indigo-700 shadow-lg' : 'bg-gray-700 hover:bg-gray-600'
                                    }`}
                                    onClick={() => setSelectedConversationPartner(convo.otherUser)}
                                >
                                    <div className="font-medium text-lg text-yellow-100">{getConversationDisplayName(convo.otherUser)}</div>
                                    {convo.lastMessage && (
                                        <div className="text-sm text-gray-300 truncate">
                                            <span className="font-semibold">{convo.lastMessage.sender?.fullName || convo.lastMessage.sender?.username || 'Unknown'}: </span>
                                            {convo.lastMessage.content}
                                        </div>
                                    )}
                                    <div className="text-xs text-gray-400 mt-1 text-right">
                                        {convo.lastMessage?.timestamp ? new Date(convo.lastMessage.timestamp).toLocaleString() : ''}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Chat Window */}
                <div className="flex-1 flex flex-col p-4">
                    {selectedConversationPartner ? (
                        <>
                            <h2 className="text-xl font-semibold mb-4 text-yellow-200 border-b border-gray-700 pb-2">
                                Chat with {getConversationDisplayName(selectedConversationPartner)}
                            </h2>
                            {/* Messages Display */}
                            <div className="flex-1 overflow-y-auto p-2 space-y-3 bg-gray-900 rounded-md mb-4 custom-scrollbar">
                                {messages.length === 0 ? (
                                    <p className="text-gray-400 text-center mt-4">No messages yet. Start the conversation!</p>
                                ) : (
                                    messages.map((message, index) => (
                                        <div
                                            key={message._id || index}
                                            className={`flex ${
                                                message.sender._id === currentUserId ? 'justify-end' : 'justify-start'
                                            }`}
                                        >
                                            <div
                                                className={`max-w-xs p-3 rounded-lg shadow-md ${
                                                    message.sender._id === currentUserId
                                                        ? 'bg-blue-600 text-white ml-auto'
                                                        : 'bg-gray-700 text-gray-100 mr-auto'
                                                }`}
                                            >
                                                <div className="font-semibold text-sm mb-1">
                                                    {message.sender._id === currentUserId ? 'You' : (message.sender.fullName || message.sender.username || 'Unknown')}
                                                </div>
                                                <p className="text-base">{message.content}</p>
                                                <div className="text-xs text-gray-300 mt-1 text-right">
                                                    {new Date(message.createdAt).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                                <div ref={messagesEndRef} /> {/* Scroll target */}
                            </div>

                            {/* Message Input Form */}
                            <form onSubmit={sendMessage} className="flex space-x-2">
                                <input
                                    type="text"
                                    className="flex-1 p-3 rounded-md bg-gray-700 border border-gray-600 focus:ring-yellow-500 focus:border-border-yellow-500 text-white"
                                    placeholder="Type your message..."
                                    value={newMessageContent}
                                    onChange={(e) => setNewMessageContent(e.target.value)}
                                    disabled={chatLoading}
                                />
                                <button
                                    type="submit"
                                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-md transition duration-300 ease-in-out transform hover:scale-105 shadow-md"
                                    disabled={chatLoading || !newMessageContent.trim()}
                                >
                                    Send
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 text-lg">
                            <p>Select an online wizard or an existing conversation to start chatting!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ChatPage;