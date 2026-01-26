# CyberScan Messenger App

A modern social media messaging application with real-time bullying detection and content moderation features. Built with React, Vite, and Tailwind CSS.

## 🌟 Features

### User Features
- **Authentication System**
  - User registration and login
  - JWT-based authentication with access and refresh tokens
  - Secure session management

- **Social Feed**
  - Create posts with text and images
  - Infinite scroll pagination
  - Real-time feed updates
  - Image upload support (PNG, JPG, JPEG, GIF)

- **Interactive Comments**
  - Add comments to posts
  - Emoji picker for expressions
  - Automatic bullying detection
  - Toggle visibility for toxic comments

- **Real-Time Chat Messaging**
  - One-on-one private messaging
  - Instant message delivery using WebSocket technology
  - Online/offline status indicators
  - Typing indicators to see when someone is typing
  - Message history persistence
  - Automatic bullying detection in chat messages
  - Blocked chat access for users exceeding bullying limits
  - Unread message counters
  - Real-time conversation updates

- **Content Moderation**
  - AI-powered bullying detection
  - Censored display for toxic comments
  - Eye icon to toggle toxic content visibility

### Admin Features
- **Admin Dashboard**
  - View all users with bullying statistics
  - Monitor bullying comment counts, message counts, and totals
  - Paginated user list
  - Status indicators (Open/Blocked based on bullying activity)
  - Filter and search capabilities
  - Responsive table and card views

## 💬 Real-Time Chat System

The application features a sophisticated real-time messaging system that allows users to communicate instantly. Here's how it works:

### What is Real-Time Communication?

Traditional web applications work like sending letters - you send a request to the server and wait for a response. Real-time communication is more like a phone call - both parties can talk and hear each other instantly without waiting.

### How It Works Technically

#### 1. **WebSocket Technology - Socket.IO**

We use **Socket.IO** (v4.8.3), a popular JavaScript library that enables real-time, bidirectional communication between web browsers and servers.

**Think of it like this:**
- **Traditional HTTP:** Like sending postcards - you send one, wait for a reply, then send another
- **WebSocket/Socket.IO:** Like a phone call - a constant open connection where both sides can talk anytime

**Technical Flow:**
```
User A's Browser ←──────────→ Server ←──────────→ User B's Browser
   (Socket.IO Client)      (Socket.IO Server)     (Socket.IO Client)
```

When User A sends a message:
1. Message travels through the open WebSocket connection to the server
2. Server instantly forwards it to User B's open connection
3. User B sees the message immediately without refreshing the page

#### 2. **Key Real-Time Features**

**a) Instant Message Delivery**
- When you click send, the message goes through the WebSocket connection
- The server receives it and immediately broadcasts it to the recipient
- No page refresh needed - messages appear instantly

**b) Online Status Indicators**
- Socket.IO tracks who's connected in real-time
- When you open the chat, the server notifies everyone you're online
- Green dots show who's currently available
- When you close the app, the server notifies others you're offline

**c) Typing Indicators**
- As you type, your keystrokes trigger "typing" events
- These events are sent through the WebSocket to the other person
- They see "User is typing..." in real-time
- Indicator disappears 3 seconds after you stop typing

**d) Message Persistence**
- All messages are stored in the backend database
- When you open a chat, past messages are loaded via REST API
- New messages arrive via WebSocket in real-time
- This combination ensures you never lose message history

#### 3. **Technical Architecture**

**Connection Setup:**
```javascript
// In app.jsx - Socket connection is established once
import { io } from 'socket.io-client';
const socket = io('http://localhost:5000');
```

**Event-Driven Communication:**
The chat works using "events" - think of them as radio channels:

- **`send_message`** - You broadcast: "I'm sending a message"
- **`receive_message`** - You listen: "Someone sent me a message"
- **`user_typing`** - You broadcast: "I'm typing"
- **`online_users`** - You listen: "Here's who's online"

**Example Message Flow:**
```
1. User types message and clicks send
2. Client emits: socket.emit('send_message', { to: 'john', message: 'Hi!' })
3. Server receives event and processes it
4. Server checks for bullying content using AI
5. Server stores message in database
6. Server emits to recipient: socket.to(john).emit('receive_message', {...})
7. John's browser receives event and displays message instantly
```

#### 4. **Bullying Detection in Chat**

Every chat message is automatically scanned:

```
Message → WebSocket → Server → AI Analysis → Database Storage → 
Recipient's Browser (with bullying flag if detected)
```

- Messages with toxic content are flagged with `is_bullying: true`
- Bullying probability score is included (0-1 scale)
- Visual indicators (red warning icons) show toxic messages
- Users with >5 bullying messages are automatically blocked from chatting

#### 5. **API Endpoints for Chat**

**REST API (for loading data):**
- `GET /api/chat/messages/:username` - Load message history
- `GET /api/chat/online-users` - Get list of all users
- `GET /api/chat/conversations` - Get all your conversations
- `GET /api/chat/can-chat` - Check if you're allowed to chat

**Socket.IO Events (for real-time updates):**
- Emit: `send_message`, `typing`, `join`
- Listen: `receive_message`, `message_sent`, `online_users`, `user_joined`, `user_typing`

#### 6. **State Management**

The chat component uses React hooks to manage real-time data:

- **`conversationMessages`** - Stores all messages organized by user
- **`onlineUsers`** - Array of currently online users
- **`typingUsers`** - Tracks who's currently typing
- **`selectedUser`** - Currently open conversation

When a new message arrives via WebSocket, React automatically re-renders the component to show it.

### Why Socket.IO Instead of Plain WebSockets?

Socket.IO provides several advantages:

1. **Auto-reconnection** - If connection drops, it automatically reconnects
2. **Fallback support** - If WebSockets fail, it falls back to HTTP polling
3. **Room support** - Easy to send messages to specific users
4. **Event-based** - Clean, organized code with named events
5. **Built-in heartbeat** - Keeps connection alive
6. **Cross-browser compatibility** - Works on all modern browsers

### Security Features

- **JWT Authentication** - All socket connections require valid access tokens
- **User verification** - Server verifies identity before delivering messages
- **Message encryption** - Communications use secure WebSocket protocol (WSS in production)
- **Content moderation** - AI scans all messages before delivery
- **Rate limiting** - Prevents spam and abuse

## 🛠️ Tech Stack

- **Frontend Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router DOM
- **Real-Time Communication:** Socket.IO Client (v4.8.3)
- **Icons:** React Icons
- **HTTP Client:** Fetch API

## 📋 Prerequisites

Before running this application, make sure you have:

- Node.js (v18 or higher)
- npm or yarn
- Backend API server running (default: http://localhost:5000)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd cyber-scan-messenger-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configuration

Update the API configuration in `src/config.js`:

```javascript
export const API_BASE_URL = 'http://localhost:5000/api';
export const ADMIN_EMAILS = [
  'admin@example.com',
  // Add more admin emails here
];
```

**Admin Access:** Add admin email addresses to the `ADMIN_EMAILS` array to grant admin dashboard access.

### 4. Run the Development Server

```bash
npm run dev
```

The application will start at `http://localhost:5173` (or another port if 5173 is busy).

### 5. Build for Production

```bash
npm run build
```

The optimized production build will be created in the `dist` directory.

### 6. Preview Production Build

```bash
npm run preview
```

## 📁 Project Structure

```
cyber-scan-messenger-app/
├── public/                # Static assets
├── src/
│   ├── components/        # Reusable components
│   │   ├── chat.jsx      # Real-time chat component with Socket.IO
│   │   └── toast.jsx     # Toast notification component
│   ├── pages/            # Page components
│   │   ├── admin.jsx     # Admin dashboard
│   │   ├── feed.jsx      # Main feed page
│   │   ├── login.jsx     # Login page
│   │   └── register.jsx  # Registration page
│   ├── app.css           # Global styles
│   ├── app.jsx           # Root component with routing & Socket.IO setup
│   ├── authContext.jsx   # Authentication context
│   ├── config.js         # API configuration & Socket.IO server URL
│   ├── index.css         # Tailwind imports
│   └── main.jsx          # Application entry point
├── eslint.config.js      # ESLint configuration
├── index.html            # HTML template
├── package.json          # Dependencies and scripts
├── tailwind.config.js    # Tailwind CSS configuration
├── vite.config.js        # Vite configuration
└── README.md            # Project documentation
```

## 🔑 API Endpoints

The application connects to the following backend endpoints:

### Authentication
- `POST /api/login` - User login
- `POST /api/register` - User registration
- `POST /api/logout` - User logout
- `POST /api/refresh` - Refresh access token

### Posts
- `GET /api/posts/random?page={page}&per_page={limit}` - Get paginated posts
- `POST /api/post` - Create a new post
- `POST /api/upload-image` - Upload post image

### Comments
- `GET /api/comments/{postId}` - Get comments for a post
- `POST /api/comment/{postId}` - Add comment to a post

### Chat (REST API)
- `GET /api/chat/messages/:username` - Get message history with a user
- `GET /api/chat/online-users` - Get list of all users
- `GET /api/chat/conversations` - Get all conversations
- `GET /api/chat/can-chat` - Check chat permissions

### Chat (Socket.IO Events)
**Client Emits (Send to Server):**
- `send_message` - Send a message to another user
- `typing` - Notify when user is typing
- `stop_typing` - Notify when user stops typing

**Client Listens (Receive from Server):**
- `receive_message` - Receive incoming message
- `message_sent` - Confirmation message was delivered
- `online_users` - List of currently online users
- `user_joined` - Notification when user comes online
- `user_left` - Notification when user goes offline
- `user_typing` - Notification when someone is typing
- `error` - Error notifications

### Admin
- `GET /api/users/bullying?page={page}&limit={limit}` - Get users with bullying statistics

## 👤 User Roles

### Regular User
- Create posts and comments
- View feed and interact with content
- Emoji reactions

### Admin User
- All regular user features
- Access to admin dashboard
- View bullying statistics
- Monitor user behavior

## 🎨 Features in Detail

### Bullying Detection
Comments are automatically analyzed for toxic content. When detected:
- Comment is censored with message: "******* hidden due to toxic comment *******"
- Red background highlights toxic comments
- Eye icon allows toggling visibility
- Admin dashboard tracks users with bullying comments

### Admin Dashboard
- **Statistics Cards:** Total users, current page, total pages
- **User Table:** Username, bullying comment count, bullying message count, total bullying count, status
- **Status System:**
  - 🟢 Open: 0-5 total bullying instances
  - 🔴 Blocked: More than 5 total bullying instances
- **Pagination:** Navigate through user pages
- **Responsive Design:** Table view on desktop, card view on mobile

### Real-Time Chat
- **Instant Messaging:** Messages appear immediately via WebSocket connection
- **Connection Status:** See who's online with green status indicators
- **Typing Awareness:** "User is typing..." appears when others type
- **Message History:** Previous conversations load automatically
- **Safety Features:**
  - Toxic messages flagged with red warning icons
  - Users with >5 bullying messages blocked from chatting
  - Bullying probability scores tracked
- **Unread Counts:** Badge shows unread messages per conversation
- **Search Users:** Find and start conversations with any user

### Authentication Flow
- Automatic token refresh
- Session persistence with localStorage
- Protected routes
- Automatic logout on token expiration

## 🔒 Security Features

- JWT token-based authentication
- Access token refresh mechanism
- Protected API routes
- Admin-only access controls
- Secure image upload

## 🎯 Usage

1. **Register/Login:** Create an account or log in
2. **Create Posts:** Share thoughts with text and images
3. **Interact:** Comment on posts with emoji support
4. **Real-Time Chat:**
   - Click the chat icon (bottom-right floating button)
   - Search for users or select from online users
   - Start messaging - messages appear instantly
   - See typing indicators when others are typing
   - Messages are automatically scanned for bullying content
5. **Admin Access:** If you're an admin, click the "Admin" button in navbar
6. **Monitor:** View bullying statistics in admin dashboard

## 🐛 Troubleshooting

### Port Already in Use
If port 5173 is busy, Vite will automatically use the next available port.

### API Connection Issues
- Verify backend server is running at `http://localhost:5000`
- Check CORS settings on backend
- Verify API_BASE_URL in `src/config.js`
- Ensure Socket.IO server is running and accessible

### Chat Not Working
- Check if Socket.IO server is running on backend
- Verify SOCKET_SERVER_URL in `src/config.js` (default: `http://localhost:5000`)
- Check browser console for WebSocket connection errors
- Ensure firewall isn't blocking WebSocket connections
- Try refreshing the page to re-establish socket connection

### Messages Not Appearing
- Check if both users are connected to the socket
- Verify access token is valid (re-login if needed)
- Check browser console for errors
- Ensure backend message endpoint is working

### Admin Access Not Working
- Ensure your email is added to ADMIN_EMAILS in `src/config.js`
- Clear browser cache and localStorage
- Re-login after adding email to admin list

## 📝 Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Support

For support, email support@cyberscan.com or open an issue in the repository.

## 🙏 Acknowledgments

- Built with React and Vite
- Styled with Tailwind CSS
- Real-time communication powered by Socket.IO
- Icons from React Icons
- Bullying detection powered by backend AI

---

**Note:** This application requires a backend API server with Socket.IO support to function. Ensure the backend is properly configured and running before starting the frontend application.

### Backend Requirements
- Node.js/Python backend with REST API
- Socket.IO server for real-time messaging
- Database for storing messages, posts, and user data
- AI/ML model for bullying detection
- JWT authentication system