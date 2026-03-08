
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { UPLOAD_IMAGE_URL, POSTS_RANDOM_URL, API_BASE_URL, ADMIN_EMAILS, SOCKET_SERVER_URL } from '../config';
import { useAuth } from '../authContext';
import { Gi3dMeeple } from "react-icons/gi";
import { BsChatDots } from "react-icons/bs";
import { IoShareOutline } from "react-icons/io5";
import { IoMdPower } from "react-icons/io";
import { BsChatFill } from "react-icons/bs";
import { IoMdSend } from "react-icons/io";
import { IoEye, IoEyeOff } from "react-icons/io5";
import Toast from '../components/toast';
import Chat from '../components/chat';
import io from 'socket.io-client';
import { motion } from 'framer-motion';

// ── floating dot config ──────────────────────────────────────────
const DOTS = [
  { top: "15%", left: "10%", delay: 0 },
  { top: "70%", left: "5%", delay: 0.8 },
  { top: "30%", left: "88%", delay: 1.6 },
  { top: "80%", left: "80%", delay: 0.4 },
  { top: "50%", left: "50%", delay: 1.2 },
  { top: "10%", left: "60%", delay: 2.0 },
];

const Feed = () => {
  const navigate = useNavigate();
  const { user } = useAuth ? useAuth() : { user: null };
  // Redirect to login if not signed in
  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
    }
  }, [user, navigate]);
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newPost, setNewPost] = useState('');
  const [newImage, setNewImage] = useState(null);
  // Removed newDescription, not needed
  const [comments, setComments] = useState({}); // { [postId]: [ ... ] }
  const [commentsLoading, setCommentsLoading] = useState({}); // { [postId]: boolean }
  const [newComment, setNewComment] = useState({});
  const [showComments, setShowComments] = useState({});
  const [showEmojis, setShowEmojis] = useState({});
  const [showBullyingComments, setShowBullyingComments] = useState({}); // { 'postId-commentIdx': boolean }
  const [toast, setToast] = useState(null);
  const [socket, setSocket] = useState(null);
  const fileInputRef = useRef(null);
  const observer = useRef();

  const emojis = ['😀', '😂', '😍', '👍', '❤️', '😢', '😮', '😡'];


  // Helper to get access token
  const getAccessToken = () => {
    let accessToken = user?.access_token;
    if (!accessToken) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          accessToken = JSON.parse(storedUser).access_token;
        } catch {
          console.error('Failed to parse stored user data');
        }
      }
    }
    return accessToken;
  };

  const clearUserDataAndRedirect = () => {
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  }

  // Fetch posts from API
  const fetchPosts = useCallback(async (pageNum = 1) => {
    setLoading(true);
    setError(null);
    try {
      const accessToken = getAccessToken();
      if (!accessToken) {
        clearUserDataAndRedirect();
        return;
      }
      const response = await fetch(`${POSTS_RANDOM_URL}?page=${pageNum}&per_page=10`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch posts');
      const data = await response.json();
      // API returns { current_page, pages, posts, total }
      setPosts(prev => pageNum === 1 ? data.posts : [...prev, ...data.posts]);
      setHasMore(data.current_page < data.pages);
    } catch (err) {
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Initial load and on page change
  useEffect(() => {
    fetchPosts(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // Initialize Socket.IO connection
  useEffect(() => {
    if (!user?.username) return;

    const newSocket = io(SOCKET_SERVER_URL, {
      query: { username: user.username }
    });

    newSocket.on('connect', () => {
      console.log('Connected to socket server');
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [user]);

  // Infinite scroll observer
  const lastPostRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new window.IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => prev + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      alert('Only png, jpg, jpeg, and gif images are supported.');
      return;
    }

    // Prepare form data
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Get access token from context or localStorage
      let accessToken = user?.access_token;
      if (!accessToken) {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            accessToken = JSON.parse(storedUser).access_token;
          } catch { }
        }
      }
      if (!accessToken) {
        clearUserDataAndRedirect();
        return;
      }
      const response = await fetch(UPLOAD_IMAGE_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        body: formData
      });
      if (!response.ok) throw new Error('Image upload failed');
      const data = await response.json();
      setNewImage(data.url);
    } catch (err) {
      alert('Image upload failed.');
      setNewImage(null);
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) {
      alert('Content is required.');
      return;
    }

    // Only allow supported image types
    if (newImage && !/\.(jpg|jpeg|png|gif)$/i.test(newImage)) {
      alert('Only jpg, jpeg, png, gif images are supported.');
      return;
    }

    const accessToken = getAccessToken();
    if (!accessToken) {
      clearUserDataAndRedirect();
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/post`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          content: newPost,
          url: newImage || undefined
        })
      });
      if (!response.ok) throw new Error('Failed to post content');
      // Clear form
      setNewPost('');
      setNewImage(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      // Fetch posts again to show the new post
      setPage(1);
      fetchPosts(1);
    } catch (err) {
      alert('Failed to post content.');
    }
  };

  // Fetch comments for a post
  const fetchComments = async (postId) => {
    setCommentsLoading(prev => ({ ...prev, [postId]: true }));
    const accessToken = getAccessToken();
    if (!accessToken) {
      clearUserDataAndRedirect();
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/comments/${postId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch comments');
      const data = await response.json();
      // API returns an array of comments
      setComments(prev => ({ ...prev, [postId]: Array.isArray(data) ? data : [] }));
    } catch (err) {
      setComments(prev => ({ ...prev, [postId]: [] }));
    } finally {
      setCommentsLoading(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleCommentSubmit = async (postId, e) => {
    e.preventDefault();
    const commentText = newComment[postId];
    if (!commentText?.trim()) return;

    const accessToken = getAccessToken();
    if (!accessToken) {
      clearUserDataAndRedirect();
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/comment/${postId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ content: commentText })
      });

      const data = await response.json();

      if (!response.ok) {
        console.log('Error response data:', data);
        throw new Error(data.msg || 'Failed to post comment');
      }

      setNewComment(prev => ({ ...prev, [postId]: '' }));
      // Fetch updated comments after posting
      fetchComments(postId);
    } catch (err) {
      setToast({ message: err.message || 'Failed to post comment.', type: 'error' });
    }
  };

  const toggleComments = (postId) => {
    setShowComments(prev => {
      const willShow = !prev[postId];
      if (willShow && !comments[postId]) {
        fetchComments(postId);
      }
      return { ...prev, [postId]: willShow };
    });
  };

  const toggleEmojis = (postId) => {
    setShowEmojis(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const addEmoji = (postId, emoji) => {
    setNewComment(prev => ({ ...prev, [postId]: (prev[postId] || '') + emoji }));
    setShowEmojis(prev => ({ ...prev, [postId]: false }));
  };

  const toggleBullyingComment = (postId, commentIdx) => {
    const key = `${postId}-${commentIdx}`;
    setShowBullyingComments(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div
      className="relative min-h-screen w-full overflow-x-hidden"
      style={{ backgroundColor: "#0d0f14" }}
    >
      {/* ── ambient glow circles ─────────────────────────── */}
      <div
        className="fixed pointer-events-none"
        style={{
          top: "-100px", left: "-100px",
          width: "600px", height: "600px",
          borderRadius: "50%",
          background: "hsl(180 100% 40% / 0.06)",
          filter: "blur(120px)",
          zIndex: 0,
        }}
      />
      <div
        className="fixed pointer-events-none"
        style={{
          bottom: "-80px", right: "-80px",
          width: "500px", height: "500px",
          borderRadius: "50%",
          background: "hsl(180 100% 40% / 0.04)",
          filter: "blur(100px)",
          zIndex: 0,
        }}
      />
      <div
        className="fixed pointer-events-none"
        style={{
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: "800px", height: "800px",
          borderRadius: "50%",
          background: "hsl(220 100% 50% / 0.05)",
          filter: "blur(150px)",
          zIndex: 0,
        }}
      />

      {/* ── grid overlay ─────────────────────────────────── */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(hsl(180 100% 50% / 0.03) 1px, transparent 1px), linear-gradient(90deg, hsl(180 100% 50% / 0.03) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          zIndex: 0,
        }}
      />

      {/* ── floating dots ────────────────────────────────── */}
      {DOTS.map((dot, i) => (
        <motion.div
          key={i}
          className="fixed pointer-events-none rounded-full"
          style={{
            top: dot.top, left: dot.left,
            width: "4px", height: "4px",
            backgroundColor: "hsl(180 100% 60%)",
            zIndex: 0,
          }}
          animate={{ y: [-20, 20], opacity: [0.2, 0.6, 0.2] }}
          transition={{
            duration: 4, repeat: Infinity,
            repeatType: "mirror", delay: dot.delay, ease: "easeInOut",
          }}
        />
      ))}

      {/* ── Toast ─────────────────────────────────────── */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* ── Navbar ─────────────────────────────────────── */}
      <nav
        className="fixed top-0 w-full z-50 flex justify-between items-center px-5 py-3"
        style={{
          background: "rgba(13,15,20,0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid hsl(180 100% 50% / 0.12)",
          boxShadow: "0 4px 24px hsl(0 0% 0% / 0.4)",
        }}
      >
        <div className="flex items-center gap-3">
          <button
            className="text-2xl transition-colors duration-200"
            style={{ color: "hsl(180 100% 60%)" }}
          >
            <Gi3dMeeple />
          </button>
          <h1
            className="text-xl font-bold tracking-widest select-none"
            style={{
              background: "linear-gradient(135deg, hsl(180 100% 55%), hsl(180 100% 70%))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            CYBERSCAN
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <span
            className="text-sm font-medium px-3 py-1 rounded-lg"
            style={{
              color: "#dde3ed",
              background: "hsl(180 100% 50% / 0.08)",
              border: "1px solid hsl(180 100% 50% / 0.15)",
            }}
          >
            {user?.username || 'User'}
          </span>
          {user?.email && ADMIN_EMAILS.includes(user.email) && (
            <button
              onClick={() => navigate('/admin')}
              className="px-3 py-1 text-xs font-semibold rounded-lg transition-all duration-200"
              style={{
                background: "hsl(220 100% 50% / 0.15)",
                border: "1px solid hsl(220 100% 60% / 0.3)",
                color: "hsl(220 100% 75%)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "hsl(220 100% 50% / 0.25)";
                e.currentTarget.style.boxShadow = "0 0 12px hsl(220 100% 60% / 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "hsl(220 100% 50% / 0.15)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              Admin
            </button>
          )}
          <button
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200"
            style={{
              color: "hsl(0 80% 65%)",
              background: "hsl(0 80% 50% / 0.08)",
              border: "1px solid hsl(0 80% 50% / 0.2)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "hsl(0 80% 50% / 0.18)";
              e.currentTarget.style.boxShadow = "0 0 12px hsl(0 80% 60% / 0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "hsl(0 80% 50% / 0.08)";
              e.currentTarget.style.boxShadow = "none";
            }}
            onClick={async () => {
              const storedUser = localStorage.getItem('user');
              let refreshToken = null;
              if (storedUser) {
                try {
                  refreshToken = JSON.parse(storedUser).refresh_token;
                } catch { }
              }
              if (refreshToken) {
                try {
                  await fetch('http://localhost:5000/api/logout', {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${refreshToken}`
                    }
                  });
                } catch { }
              }
              localStorage.removeItem('user');
              navigate('/login', { replace: true });
            }}
          >
            <IoMdPower className="text-lg" />
          </button>
        </div>
      </nav>

      {/* ── Main Content ────────────────────────────────── */}
      <div className="relative z-10 max-w-2xl mx-auto pt-20 pb-10 px-4">

        {/* ── Create Post Card ─────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative mb-5"
          style={{
            background: "rgba(17,20,28,0.88)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid hsl(180 100% 50% / 0.14)",
            borderRadius: "14px",
            padding: "20px",
            boxShadow: "0 0 30px hsl(180 100% 50% / 0.06), 0 8px 32px hsl(0 0% 0% / 0.4)",
          }}
        >
          {/* top glow line */}
          <div
            className="absolute top-0 left-6 right-6 h-px pointer-events-none"
            style={{
              background: "linear-gradient(90deg, transparent, hsl(180 100% 50% / 0.4), transparent)",
            }}
          />
          <form onSubmit={handlePostSubmit}>
            <textarea
              className="w-full resize-none text-sm outline-none rounded-xl px-4 py-3 transition-all duration-200"
              placeholder="What's on your mind?"
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              required
              rows={3}
              style={{
                backgroundColor: "#1a1e28",
                border: "1px solid #2a2f3d",
                color: "#dde3ed",
                caretColor: "hsl(180 100% 60%)",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "hsl(180 100% 50% / 0.5)";
                e.target.style.boxShadow = "0 0 0 2px hsl(180 100% 50% / 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#2a2f3d";
                e.target.style.boxShadow = "none";
              }}
            />
            <input
              ref={fileInputRef}
              className="my-2.5 text-xs w-full"
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/gif"
              onChange={handleImageChange}
              style={{ color: "hsl(215 20% 55%)" }}
            />
            {newImage && (
              <div className="relative mb-2">
                <img
                  src={newImage}
                  alt="Preview"
                  className="w-full max-w-md max-h-80 object-cover aspect-square mt-2 mx-auto rounded-lg"
                  style={{ border: "1px solid hsl(180 100% 50% / 0.2)" }}
                />
              </div>
            )}
            <div className="flex justify-end mt-3">
              <button
                type="submit"
                disabled={!newPost.trim()}
                className="flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-xl transition-all duration-300"
                style={{
                  background: "linear-gradient(135deg, hsl(180 80% 30%), hsl(180 100% 45%))",
                  color: "#0d0f14",
                  boxShadow: "0 0 16px hsl(180 100% 50% / 0.2)",
                  opacity: !newPost.trim() ? 0.5 : 1,
                  cursor: !newPost.trim() ? "not-allowed" : "pointer",
                }}
                onMouseEnter={(e) => {
                  if (newPost.trim()) e.currentTarget.style.boxShadow = "0 0 28px hsl(180 100% 50% / 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 0 16px hsl(180 100% 50% / 0.2)";
                }}
              >
                <IoShareOutline className="text-base" />
                Post
              </button>
            </div>
          </form>
        </motion.div>

        {/* ── Posts ─────────────────────────────────────── */}
        {posts.map((post, idx) => {
          const isLast = idx === posts.length - 1;
          return (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx < 5 ? idx * 0.05 : 0 }}
              className="relative mb-5"
              ref={isLast ? lastPostRef : undefined}
              style={{
                background: "rgba(17,20,28,0.88)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid hsl(180 100% 50% / 0.10)",
                borderRadius: "14px",
                boxShadow: "0 4px 24px hsl(0 0% 0% / 0.35)",
              }}
            >
              {/* Post Header */}
              <div className="flex items-center p-4 gap-3">
                <img
                  className="w-9 h-9 rounded-full flex-shrink-0"
                  src="https://ui-avatars.com/api/?background=random&size=36&name=User"
                  alt="User avatar"
                  style={{ border: "2px solid hsl(180 100% 50% / 0.25)" }}
                />
                <div>
                  <h4
                    className="m-0 text-sm font-semibold"
                    style={{ color: "#dde3ed" }}
                  >
                    {post.username || 'User'}
                  </h4>
                </div>
              </div>

              {/* Post Image */}
              {(post.image || post.url) && (
                <img
                  className="w-full max-h-96 object-cover block"
                  src={post.image || post.url}
                  alt="Post"
                  style={{ borderTop: "1px solid hsl(180 100% 50% / 0.08)", borderBottom: "1px solid hsl(180 100% 50% / 0.08)" }}
                />
              )}

              {/* Post Content */}
              {post.content && (
                <div
                  className="px-4 py-3 text-sm leading-relaxed"
                  style={{ color: "hsl(215 20% 75%)" }}
                >
                  {post.content}
                </div>
              )}

              {/* Actions */}
              <div
                className="px-4 pb-3 flex gap-4"
                style={{ borderTop: "1px solid hsl(180 100% 50% / 0.07)" }}
              >
                <button
                  className="flex items-center gap-2 text-sm py-2 mt-1 transition-colors duration-200"
                  style={{ color: "hsl(215 20% 50%)", background: "none", border: "none", cursor: "pointer" }}
                  onClick={() => toggleComments(post.id)}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "hsl(180 100% 60%)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "hsl(215 20% 50%)")}
                >
                  <BsChatFill />
                  Comments
                </button>
              </div>

              {/* Comments Section */}
              {showComments[post.id] && (
                <div
                  style={{
                    borderTop: "1px solid hsl(180 100% 50% / 0.10)",
                    background: "rgba(13,15,20,0.5)",
                    borderRadius: "0 0 14px 14px",
                  }}
                >
                  {/* Comments Header */}
                  <div
                    className="px-4 py-3"
                    style={{ borderBottom: "1px solid hsl(180 100% 50% / 0.08)" }}
                  >
                    <h5
                      className="text-sm font-semibold flex items-center gap-2 m-0"
                      style={{ color: "hsl(180 100% 60%)" }}
                    >
                      <BsChatFill />
                      Comments ({comments[post.id]?.length || 0})
                    </h5>
                  </div>

                  {/* Comments List */}
                  <div className="px-4 py-3 max-h-64 overflow-y-auto">
                    {commentsLoading[post.id] ? (
                      <div className="flex items-center justify-center py-4">
                        <div
                          className="animate-spin rounded-full h-6 w-6 border-b-2"
                          style={{ borderColor: "hsl(180 100% 55%)" }}
                        ></div>
                        <span className="ml-2 text-sm" style={{ color: "hsl(215 20% 50%)" }}>Loading comments...</span>
                      </div>
                    ) : (
                      comments[post.id]?.length > 0 ? (
                        <div className="space-y-3">
                          {comments[post.id].map((comment, idx) => {
                            const commentKey = `${post.id}-${idx}`;
                            const isVisible = showBullyingComments[commentKey];

                            return (
                              <div
                                key={idx}
                                className="flex items-start gap-3 p-3 rounded-xl transition-all"
                                style={{
                                  background: comment.is_bullying
                                    ? "hsl(0 80% 50% / 0.08)"
                                    : "rgba(26,30,40,0.6)",
                                  border: comment.is_bullying
                                    ? "1px solid hsl(0 80% 50% / 0.3)"
                                    : "1px solid hsl(180 100% 50% / 0.08)",
                                }}
                              >
                                <img
                                  className="w-8 h-8 rounded-full flex-shrink-0"
                                  src={`https://ui-avatars.com/api/?background=0a6e6e&color=fff&size=32&name=${comment.username || 'User'}`}
                                  alt="Avatar"
                                  style={{ border: "2px solid hsl(180 100% 50% / 0.2)" }}
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-sm" style={{ color: "#dde3ed" }}>
                                      {comment.username || 'User'}
                                    </span>
                                    {comment.is_bullying && (
                                      <span
                                        className="px-2 py-0.5 text-xs rounded-full font-medium"
                                        style={{
                                          background: "hsl(0 80% 50% / 0.15)",
                                          color: "hsl(0 80% 70%)",
                                          border: "1px solid hsl(0 80% 50% / 0.3)",
                                        }}
                                      >
                                        Flagged
                                      </span>
                                    )}
                                  </div>
                                  <div className="mt-1">
                                    {comment.is_bullying && !isVisible ? (
                                      <div
                                        className="flex items-center gap-2 rounded-lg px-3 py-2"
                                        style={{
                                          background: "hsl(0 70% 15% / 0.55)",
                                          border: "1px solid hsl(0 80% 40% / 0.3)",
                                        }}
                                      >
                                        <span style={{ fontSize: "14px", lineHeight: 1 }}>⚠️</span>
                                        <span
                                          className="text-xs leading-snug"
                                          style={{ color: "hsl(0 70% 68%)" }}
                                        >
                                          Hidden · violates community guidelines
                                        </span>
                                      </div>
                                    ) : (
                                      <p className="text-sm break-words" style={{ color: "hsl(215 20% 65%)" }}>
                                        {comment.content}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                {comment.is_bullying && (
                                  <button
                                    type="button"
                                    onClick={() => toggleBullyingComment(post.id, idx)}
                                    className="flex-shrink-0 p-1.5 rounded-full transition-colors"
                                    style={{ color: "hsl(0 80% 65%)", background: "none", border: "none", cursor: "pointer" }}
                                    title={isVisible ? 'Hide comment' : 'Show comment'}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = "hsl(0 80% 50% / 0.15)")}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                                  >
                                    {isVisible ? <IoEyeOff size={18} /> : <IoEye size={18} />}
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <BsChatDots className="mx-auto text-3xl mb-2" style={{ color: "hsl(215 20% 30%)" }} />
                          <p className="text-sm" style={{ color: "hsl(215 20% 40%)" }}>No comments yet. Be the first to comment!</p>
                        </div>
                      )
                    )}
                  </div>

                  {/* Comment Input */}
                  <div
                    className="px-4 py-3"
                    style={{
                      borderTop: "1px solid hsl(180 100% 50% / 0.08)",
                      background: "rgba(17,20,28,0.5)",
                      borderRadius: "0 0 14px 14px",
                    }}
                  >
                    <form onSubmit={(e) => handleCommentSubmit(post.id, e)} className="flex gap-2 items-center">
                      <img
                        className="w-8 h-8 rounded-full flex-shrink-0"
                        src={`https://ui-avatars.com/api/?background=0a6e6e&color=fff&size=32&name=${user?.username || 'User'}`}
                        alt="Your avatar"
                        style={{ border: "2px solid hsl(180 100% 50% / 0.2)" }}
                      />
                      <div className="flex-1 relative">
                        <input
                          className="w-full py-2.5 px-4 pr-12 text-sm rounded-full outline-none transition-all duration-200"
                          placeholder="Write a comment..."
                          value={newComment[post.id] || ''}
                          onChange={(e) => setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))}
                          style={{
                            backgroundColor: "#1a1e28",
                            border: "1px solid #2a2f3d",
                            color: "#dde3ed",
                            caretColor: "hsl(180 100% 60%)",
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = "hsl(180 100% 50% / 0.5)";
                            e.target.style.boxShadow = "0 0 0 2px hsl(180 100% 50% / 0.1)";
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = "#2a2f3d";
                            e.target.style.boxShadow = "none";
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => toggleEmojis(post.id)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-lg hover:scale-110 transition-transform"
                        >
                          😊
                        </button>
                      </div>
                      <button
                        type="submit"
                        className="p-2.5 rounded-full transition-all duration-200"
                        style={{
                          background: "linear-gradient(135deg, hsl(180 80% 30%), hsl(180 100% 45%))",
                          color: "#0d0f14",
                          boxShadow: "0 0 12px hsl(180 100% 50% / 0.2)",
                          border: "none",
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 0 20px hsl(180 100% 50% / 0.4)")}
                        onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 0 12px hsl(180 100% 50% / 0.2)")}
                      >
                        <IoMdSend size={18} />
                      </button>
                    </form>
                    {showEmojis[post.id] && (
                      <div
                        className="mt-3 p-3 rounded-xl"
                        style={{
                          background: "rgba(26,30,40,0.95)",
                          border: "1px solid hsl(180 100% 50% / 0.15)",
                          boxShadow: "0 4px 16px hsl(0 0% 0% / 0.4)",
                        }}
                      >
                        <div className="flex flex-wrap gap-1">
                          {emojis.map((emoji, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => addEmoji(post.id, emoji)}
                              className="text-xl p-2 rounded-lg transition-all hover:scale-110"
                              style={{ background: "none", border: "none", cursor: "pointer" }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = "hsl(180 100% 50% / 0.1)")}
                              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}

        {loading && (
          <div className="text-center py-6">
            <div
              className="inline-block animate-spin rounded-full h-8 w-8 border-b-2"
              style={{ borderColor: "hsl(180 100% 55%)" }}
            ></div>
            <p className="mt-2 text-sm" style={{ color: "hsl(215 20% 45%)" }}>Loading posts...</p>
          </div>
        )}
        {error && (
          <div
            className="text-center py-4 rounded-xl text-sm"
            style={{
              color: "hsl(0 80% 65%)",
              background: "hsl(0 80% 50% / 0.08)",
              border: "1px solid hsl(0 80% 50% / 0.2)",
            }}
          >
            {error}
          </div>
        )}
        {!hasMore && !loading && posts.length > 0 && (
          <div className="text-center py-4 text-sm" style={{ color: "hsl(215 20% 35%)" }}>
            — No more posts —
          </div>
        )}
      </div>

      {/* Chat Component */}
      <Chat user={user} socket={socket} />
    </div>
  );
};

export default Feed;
