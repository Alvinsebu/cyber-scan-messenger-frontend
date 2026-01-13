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

- **Content Moderation**
  - AI-powered bullying detection
  - Censored display for toxic comments
  - Eye icon to toggle toxic content visibility

### Admin Features
- **Admin Dashboard**
  - View all users with bullying comment statistics
  - Paginated user list
  - Status indicators (Open/Blocked based on comment count)
  - Filter and search capabilities
  - Responsive table and card views

## 🛠️ Tech Stack

- **Frontend Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router DOM
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
│   │   └── toast.jsx     # Toast notification component
│   ├── pages/            # Page components
│   │   ├── admin.jsx     # Admin dashboard
│   │   ├── feed.jsx      # Main feed page
│   │   ├── login.jsx     # Login page
│   │   └── register.jsx  # Registration page
│   ├── app.css           # Global styles
│   ├── app.jsx           # Root component with routing
│   ├── authContext.jsx   # Authentication context
│   ├── config.js         # API configuration
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
- **User Table:** Username, bullying comment count, status
- **Status System:**
  - 🟢 Open: 0-5 bullying comments
  - 🔴 Blocked: More than 5 bullying comments
- **Pagination:** Navigate through user pages
- **Responsive Design:** Table view on desktop, card view on mobile

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
4. **Admin Access:** If you're an admin, click the "Admin" button in navbar
5. **Monitor:** View bullying statistics in admin dashboard

## 🐛 Troubleshooting

### Port Already in Use
If port 5173 is busy, Vite will automatically use the next available port.

### API Connection Issues
- Verify backend server is running at `http://localhost:5000`
- Check CORS settings on backend
- Verify API_BASE_URL in `src/config.js`

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
- Icons from React Icons
- Bullying detection powered by backend AI

---

**Note:** This application requires a backend API server to function. Ensure the backend is properly configured and running before starting the frontend application.