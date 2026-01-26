import React, { useState, useEffect, useRef } from 'react';
import { IoClose, IoSearch, IoSend, IoWarning } from "react-icons/io5";
import { BsChatDots } from "react-icons/bs";
import { FaUserCircle } from "react-icons/fa";
import { CHAT_MESSAGES_URL, CHAT_ONLINE_USERS_URL, CHAT_CONVERSATIONS_URL } from '../config';

const Chat = ({ user, socket }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [conversationMessages, setConversationMessages] = useState({}); // Store messages per user
  const [messageInput, setMessageInput] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [conversations, setConversations] = useState({});
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const [canChat, setCanChat] = useState(true);
  const [chatRestriction, setChatRestriction] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Get current conversation messages
  const messages = selectedUser ? (conversationMessages[selectedUser] || []) : [];

  // Debug: Log messages when they change
  useEffect(() => {
    if (selectedUser) {
      console.log(`Messages for ${selectedUser}:`, messages.length, 'messages');
      console.log('All conversations:', Object.keys(conversationMessages));
    }
  }, [selectedUser, messages, conversationMessages]);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch all users from backend
  const fetchAllUsers = async () => {
    try {
      const accessToken = user?.access_token || JSON.parse(localStorage.getItem('user') || '{}').access_token;
      if (!accessToken) return;

      const response = await fetch(CHAT_ONLINE_USERS_URL, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAllUsers(data.users || []);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  // Fetch message history with a specific user
  const fetchMessageHistory = async (username) => {
    try {
      const accessToken = user?.access_token || JSON.parse(localStorage.getItem('user') || '{}').access_token;
      
      if (!accessToken) {
        console.error('No access token found - user may not be logged in');
        return;
      }

      const url = `${CHAT_MESSAGES_URL}/${username}`;
      console.log('Fetching from URL:', url);
      console.log('Using token:', accessToken.substring(0, 20) + '...');

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status, response.statusText);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Fetched message history for', username, ':', data);
        console.log('   Total messages:', data.total || data.messages.length);
        
        if (!data.messages || data.messages.length === 0) {
          console.warn('⚠️ No messages found for', username);
          setConversationMessages(prev => ({
            ...prev,
            [username]: []
          }));
          return;
        }
        
        const formattedMessages = data.messages.map((msg, idx) => {
          console.log(`   Message ${idx + 1}:`, msg.sender, '->', msg.receiver, ':', msg.message || msg.content);
          return {
            id: msg.id,
            sender: msg.sender,
            receiver: msg.receiver,
            message: msg.message || msg.content, // Handle both 'message' and 'content' field names
            timestamp: msg.timestamp,
            is_bullying: msg.is_bullying || false,
            bullying_probability: msg.bullying_probability || 0,
            is_read: msg.is_read || false
          };
        });
        
        console.log('✅ Formatted', formattedMessages.length, 'messages for', username);
        
        // Store messages for this specific conversation
        setConversationMessages(prev => ({
          ...prev,
          [username]: formattedMessages
        }));
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to fetch messages:', response.status, response.statusText);
        console.error('   Error response:', errorText);
      }
    } catch (err) {
      console.error('❌ Exception in fetchMessageHistory:', err);
      console.error('   Error details:', err.message, err.stack);
    }
  };

  // Socket.IO event handlers
  useEffect(() => {
    if (!socket) return;

    // Listen for incoming messages
    socket.on('receive_message', (data) => {
      console.log('Received message:', data);
      
      const messageData = {
        id: data.id,
        sender: data.sender,
        receiver: user?.username,
        message: data.message || data.content, // Handle both field names
        timestamp: data.timestamp,
        is_bullying: data.is_bullying || false,
        bullying_probability: data.bullying_probability || 0
      };

      // Store message in conversation-specific state (always, regardless of selected user)
      setConversationMessages(prev => ({
        ...prev,
        [data.sender]: [...(prev[data.sender] || []), messageData]
      }));

      // Update conversation list with unread count
      setConversations(prev => ({
        ...prev,
        [data.sender]: {
          ...prev[data.sender],
          unread: selectedUser === data.sender ? 0 : (prev[data.sender]?.unread || 0) + 1,
          lastMessage: data.message,
          lastTimestamp: data.timestamp
        }
      }));
    });

    // Listen for message sent confirmation
    socket.on('message_sent', (data) => {
      console.log('Message delivered:', data.status);
    });

    // Listen for online users
    socket.on('online_users', (users) => {
      setOnlineUsers(users.filter(u => u !== user?.username));
    });

    // Listen for user joined
    socket.on('user_joined', (username) => {
      console.log(`${username} joined`);
      setOnlineUsers(prev => [...new Set([...prev, username])].filter(u => u !== user?.username));
    });

    // Listen for typing indicators
    socket.on('user_typing', (data) => {
      if (data.sender !== user?.username) {
        setTypingUsers(prev => ({
          ...prev,
          [data.sender]: data.is_typing
        }));

        // Clear typing indicator after 3 seconds
        if (data.is_typing) {
          setTimeout(() => {
            setTypingUsers(prev => ({
              ...prev,
              [data.sender]: false
            }));
          }, 3000);
        }
      }
    });

    // Listen for errors
    socket.on('error', (data) => {
      console.error('Socket error:', data.message);
    });

    return () => {
      socket.off('receive_message');
      socket.off('message_sent');
      socket.off('online_users');
      socket.off('user_joined');
      socket.off('user_typing');
      socket.off('error');
    };
  }, [socket, selectedUser, user]);

  // Check if user can chat based on bullying count
  const checkCanChat = async () => {
    try {
      const accessToken = user?.access_token || JSON.parse(localStorage.getItem('user') || '{}').access_token;
      if (!accessToken) return;

      const response = await fetch('http://localhost:5000/api/chat/can-chat', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Can chat status:', data);
        setCanChat(data.can_chat);
        
        if (!data.can_chat) {
          setChatRestriction({
            bullyingCount: data.bullying_count,
            maxAllowed: data.max_allowed,
            message: data.message
          });
          console.warn(`User blocked from chatting: ${data.bullying_count}/${data.max_allowed}`);
        }
      }
    } catch (err) {
      console.error('Failed to check chat permissions:', err);
    }
  };

  // Fetch users and conversations when chat opens
  useEffect(() => {
    if (isOpen) {
      console.log('Chat opened, fetching users and conversations...');
      checkCanChat(); // Check if user can chat
      if (allUsers.length === 0) {
        fetchAllUsers();
      }
      // Fetch recent conversations to prepopulate the list
      fetchConversations();
    }
  }, [isOpen]);

  // Fetch conversations list
  const fetchConversations = async () => {
    try {
      const accessToken = user?.access_token || JSON.parse(localStorage.getItem('user') || '{}').access_token;
      if (!accessToken) return;

      const response = await fetch(CHAT_CONVERSATIONS_URL, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched conversations:', data.conversations);
        
        // Update conversations state with unread counts and last messages
        const conversationsMap = {};
        data.conversations.forEach(conv => {
          conversationsMap[conv.username] = {
            unread: conv.unread_count,
            lastMessage: conv.last_message?.message || conv.last_message?.content,
            lastTimestamp: conv.last_message?.timestamp,
            is_online: conv.is_online
          };
        });
        setConversations(conversationsMap);
      }
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    }
  };

  // Filter users based on search query
  const filteredUsers = React.useMemo(() => {
    const searchLower = searchQuery.toLowerCase();
    const usersToFilter = allUsers.length > 0 ? allUsers : onlineUsers;
    
    return usersToFilter
      .filter(userObj => {
        const username = typeof userObj === 'string' ? userObj : userObj.username;
        return username.toLowerCase().includes(searchLower) && username !== user?.username;
      })
      .map(userObj => {
        const username = typeof userObj === 'string' ? userObj : userObj.username;
        const isOnline = onlineUsers.includes(username) || 
                        (typeof userObj === 'object' && userObj.is_online);
        return { username, isOnline };
      });
  }, [searchQuery, allUsers, onlineUsers, user]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedUser || !socket) return;

    const messageData = {
      sender: user?.username,
      receiver: selectedUser,
      message: messageInput,
      timestamp: new Date().toISOString()
    };

    socket.emit('send_message', messageData);
    
    // Optimistically add message to UI in conversation-specific state
    setConversationMessages(prev => ({
      ...prev,
      [selectedUser]: [...(prev[selectedUser] || []), {
        ...messageData,
        is_bullying: false,
        bullying_probability: 0
      }]
    }));
    
    setMessageInput('');

    // Stop typing indicator
    if (isTyping) {
      socket.emit('typing', {
        sender: user?.username,
        receiver: selectedUser,
        is_typing: false
      });
      setIsTyping(false);
    }
  };

  const handleUserSelect = (username) => {
    console.log('User selected:', username);
    setSelectedUser(username);
    setSearchQuery('');
    
    // Always fetch fresh message history from server
    // This ensures we get the latest messages even after login/refresh
    console.log('Fetching fresh message history for:', username);
    fetchMessageHistory(username);
    
    // Mark conversation as read
    setConversations(prev => ({
      ...prev,
      [username]: {
        ...prev[username],
        unread: 0
      }
    }));
  };

  const handleTyping = (e) => {
    setMessageInput(e.target.value);

    if (!selectedUser || !socket) return;

    // Send typing indicator
    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing', {
        sender: user?.username,
        receiver: selectedUser,
        is_typing: true
      });
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit('typing', {
        sender: user?.username,
        receiver: selectedUser,
        is_typing: false
      });
    }, 2000);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-50"
        title="Open Chat"
      >
        <BsChatDots className="text-2xl" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
        <div className="flex items-center gap-2">
          <BsChatDots className="text-xl" />
          <h3 className="font-semibold text-lg">Messages</h3>
        </div>
        <button
          onClick={() => {
            setIsOpen(false);
            setSelectedUser(null);
          }}
          className="hover:bg-blue-700 p-1 rounded transition-colors"
        >
          <IoClose className="text-2xl" />
        </button>
      </div>

      {!selectedUser ? (
        // User List View
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Search Box */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Users List */}
          <div className="flex-1 overflow-y-auto">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((userObj, idx) => {
                const unreadCount = conversations[userObj.username]?.unread || 0;
                return (
                  <div
                    key={idx}
                    onClick={() => handleUserSelect(userObj.username)}
                    className="flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-colors"
                  >
                    <div className="relative">
                      <FaUserCircle className="text-4xl text-gray-400" />
                      {userObj.isOnline && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{userObj.username}</p>
                      <p className={`text-xs ${userObj.isOnline ? 'text-green-500' : 'text-gray-400'}`}>
                        {userObj.isOnline ? 'Online' : 'Offline'}
                      </p>
                    </div>
                    {unreadCount > 0 && (
                      <span className="bg-blue-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
                <BsChatDots className="text-5xl mb-3" />
                <p className="text-sm text-center">
                  {searchQuery ? 'No users found' : 'No users available'}
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Chat View
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Chat Header */}
          <div className="p-3 border-b border-gray-200 flex items-center gap-3">
            <button
              onClick={() => setSelectedUser(null)}
              className="text-gray-600 hover:text-gray-800"
            >
              ←
            </button>
            <FaUserCircle className="text-3xl text-gray-400" />
            <div className="flex-1">
              <p className="font-medium text-gray-800">{selectedUser}</p>
              <p className="text-xs text-green-500">
                {onlineUsers.includes(selectedUser) ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-400 text-sm">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isOwn = msg.sender === user?.username;
                const isBullying = msg.is_bullying;
                const probability = msg.bullying_probability;

                return (
                  <div key={msg.id || idx}>
                    <div className={`mb-3 flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[75%] rounded-lg px-4 py-2 ${
                          isOwn
                            ? 'bg-blue-500 text-white rounded-br-none'
                            : 'bg-white text-gray-800 rounded-bl-none shadow-sm'
                        }`}
                      >
                        <p className="text-sm break-words">
                          {isBullying ? '******' : msg.message}
                        </p>
                        <p className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-400'}`}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            
            {/* Typing Indicator */}
            {typingUsers[selectedUser] && (
              <div className="flex justify-start mb-3">
                <div className="bg-gray-200 rounded-lg px-4 py-2">
                  <p className="text-sm text-gray-600 italic">{selectedUser} is typing...</p>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-200 bg-white">
            {!canChat && chatRestriction ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm font-semibold flex items-center gap-2">
                  <IoWarning className="text-red-500" />
                  You are blocked from sending messages
                </p>
                <p className="text-red-600 text-xs mt-1">
                  Bullying detected: {chatRestriction.bullyingCount}/{chatRestriction.maxAllowed} messages
                </p>
                {chatRestriction.message && (
                  <p className="text-red-600 text-xs mt-1">{chatRestriction.message}</p>
                )}
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={handleTyping}
                  placeholder={canChat ? "Type a message..." : "Chat disabled due to bullying behavior"}
                  disabled={!canChat}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim() || !canChat}
                  className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-full transition-colors"
                >
                  <IoSend className="text-lg" />
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
