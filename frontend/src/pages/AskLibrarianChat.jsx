import React, { useState } from 'react';
import { Send, CornerDownLeft, XCircle, BookOpen } from 'lucide-react'; // Example icons

const AskLibrarianChat = () => {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'Librarian AI', text: 'Welcome, young wizard! How may I assist you with your research today? What arcane knowledge do you seek?', type: 'bot' },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false); // To simulate AI typing

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    const userMessage = { id: messages.length + 1, sender: 'You', text: newMessage, type: 'user' };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setNewMessage('');
    setIsTyping(true);

    // Simulate API call to your AI chatbot backend
    // In a real application, you'd send newMessage to an API and get a response
    try {
      // Replace with your actual chatbot API endpoint
      const response = await fetch('http://localhost:5001/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${localStorage.getItem('authToken')}` // If your API requires auth
        },
        body: JSON.stringify({ query: newMessage }),
      });

      if (response.ok) {
        const data = await response.json();
        // Simulate a delay for the AI response
        setTimeout(() => {
          const botResponse = { id: messages.length + 2, sender: 'Librarian AI', text: data.response || "Hmm, that's a curious query! Let me consult the ancient texts...", type: 'bot' };
          setMessages((prevMessages) => [...prevMessages, botResponse]);
          setIsTyping(false);
        }, 1500); // Simulate AI thinking time
      } else {
        console.error('Chatbot API error:', response.status);
        setTimeout(() => {
          const botError = { id: messages.length + 2, sender: 'Librarian AI', text: "Apologies, I'm encountering a magical disturbance and cannot answer at the moment. Please try again later.", type: 'bot' };
          setMessages((prevMessages) => [...prevMessages, botError]);
          setIsTyping(false);
        }, 1500);
      }
    } catch (error) {
      console.error('Network error while connecting to chatbot:', error);
      setTimeout(() => {
        const botError = { id: messages.length + 2, sender: 'Librarian AI', text: "My apologies, the owl carrying my response seems to have gone astray. Please check your connection and try again.", type: 'bot' };
        setMessages((prevMessages) => [...prevMessages, botError]);
        setIsTyping(false);
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4 flex items-center justify-center font-inter">
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl p-6 w-full max-w-2xl border-4 border-amber-400">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center flex items-center justify-center">
          <BookOpen className="h-8 w-8 text-amber-600 mr-3" /> Ask the Librarian AI
        </h2>

        <div className="flex flex-col h-[60vh] bg-amber-50 rounded-xl border border-amber-300 p-4 mb-4 overflow-y-auto custom-scrollbar">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex mb-3 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] px-4 py-2 rounded-lg shadow-md ${
                  msg.type === 'user'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                    : 'bg-white text-gray-800 border border-amber-200'
                }`}
              >
                <p className="font-bold text-sm mb-1">
                  {msg.sender === 'Librarian AI' ? '📚 Librarian AI' : '👤 You'}
                </p>
                <p>{msg.text}</p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start mb-3">
              <div className="max-w-[75%] px-4 py-2 rounded-lg shadow-md bg-white text-gray-800 border border-amber-200">
                <p className="font-bold text-sm mb-1">📚 Librarian AI</p>
                <p className="animate-pulse">Typing...</p>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSendMessage} className="flex space-x-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Ask a question about Hogwarts, spells, history..."
            className="flex-grow p-3 rounded-xl border-2 border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-800"
            disabled={isTyping}
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white p-3 rounded-xl transition-all duration-300 flex items-center justify-center"
            disabled={isTyping || newMessage.trim() === ''}
          >
            <Send className="h-5 w-5 mr-2" /> Ask
          </button>
        </form>
        <div className="text-center mt-4">
          <button
            onClick={() => window.history.back()} // Simple back button
            className="text-gray-600 hover:text-gray-800 flex items-center justify-center mx-auto"
          >
            <XCircle className="h-4 w-4 mr-1" /> Close Chat
          </button>
        </div>
      </div>
    </div>
  );
};

export default AskLibrarianChat;
