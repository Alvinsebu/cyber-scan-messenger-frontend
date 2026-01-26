
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
          } catch {}
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
    <div className="min-h-screen w-full bg-gradient-to-br from-emerald-50 via-teal-100 to-cyan-200">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-200 px-5 py-2.5 fixed top-0 w-full z-50 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-4">
          <button className="text-2xl hover:text-gray-600">
            <Gi3dMeeple /></button>
          <h1 className="m-0 text-2xl text-gray-800">CYBERSCAN</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-800">{user?.username || 'User'}</span>
          {user?.email && ADMIN_EMAILS.includes(user.email) && (
            <button
              onClick={() => navigate('/admin')}
              className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
            >
              Admin
            </button>
          )}
           <button
             className="text-sm hover:text-gray-600"
             onClick={async () => {
               const storedUser = localStorage.getItem('user');
               let refreshToken = null;
               if (storedUser) {
                 try {
                   refreshToken = JSON.parse(storedUser).refresh_token;
                 } catch {}
               }
               if (refreshToken) {
                 try {
                   await fetch('http://localhost:5000/api/logout', {
                     method: 'POST',
                     headers: {
                       'Authorization': `Bearer ${refreshToken}`
                     }
                   });
                 } catch {}
               }
               localStorage.removeItem('user');
               navigate('/login', { replace: true });
             }}
           >
            <IoMdPower className="text-xl hover:text-gray-600"/>
           </button>
        </div>
      </nav>
      
      <div className="max-w-2xl mx-auto mt-16 p-5">
        <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg p-4 mb-5 shadow-md">
          <form onSubmit={handlePostSubmit}>
            <textarea
              className="w-full h-[60px] p-2.5 border-none resize-none text-sm focus:outline-none"
              placeholder="What's on your mind?"
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              required
            />
            <input
              ref={fileInputRef}
              className="my-2.5"
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/gif"
              onChange={handleImageChange}
            />
            {newImage && (
              <div className="relative">
                <img src={newImage} alt="Preview" className="w-full max-w-md max-h-80 object-cover aspect-square mt-2.5 mx-auto" />
              </div>
            )}
            <div className="flex justify-end mt-2">
              <button
                className="bg-red-500 hover:bg-black-600 text-white px-4 py-2 border-none rounded cursor-pointer font-semibold"
                type="submit"
                disabled={!newPost.trim()}
                title={!newPost.trim() ? 'Content is required' : 'Post'}
              >
                <IoShareOutline className="text-lg" />
              </button>
            </div>
          </form>
        </div>

        {posts.map((post, idx) => {
          const isLast = idx === posts.length - 1;
          return (
            <div
              key={post.id}
              className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg mb-5 shadow-md"
              ref={isLast ? lastPostRef : undefined}
            >
            <div className="flex items-center p-4">
              <img
                className="w-8 h-8 rounded-full mr-2.5"
                src="https://ui-avatars.com/api/?background=random&size=32&name=User"
                alt="User avatar"
              />
              <div>
                <h4 className="m-0 text-sm font-semibold">{post.username || 'User'}</h4>
                {/* Optionally show timestamp if available */}
              </div>
            </div>
            
            {(post.image || post.url) && (
              <img
                className="w-full max-w-md max-h-80 object-cover aspect-square block mx-auto"
                src={post.image || post.url}
                alt="Post"
              />
            )}
            {post.content && <div className="px-4 text-sm leading-relaxed">{post.content}</div>}
            <div className="px-4 pb-2.5 flex gap-4">
              <button 
                className="bg-none border-none cursor-pointer text-sm text-gray-800 py-2 mt-2 mb-2"
                onClick={() => toggleComments(post.id)}
              >
                <BsChatFill className="inline mr-1" /> Comments
              </button>
            </div>
            
            {showComments[post.id] && (
              <div className="border-t border-gray-200 bg-gradient-to-b from-gray-50/80 to-white/60">
                {/* Comments Header */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <h5 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <BsChatFill className="text-emerald-500" />
                    Comments ({comments[post.id]?.length || 0})
                  </h5>
                </div>
                
                {/* Comments List */}
                <div className="px-4 py-3 max-h-64 overflow-y-auto">
                  {commentsLoading[post.id] ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500"></div>
                      <span className="ml-2 text-gray-500 text-sm">Loading comments...</span>
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
                              className={`flex items-start gap-3 p-3 rounded-xl transition-all ${
                                comment.is_bullying 
                                  ? 'bg-red-50/80 border border-red-200 shadow-sm' 
                                  : 'bg-white/70 border border-gray-100 hover:bg-white hover:shadow-sm'
                              }`}
                            >
                              <img
                                className="w-8 h-8 rounded-full flex-shrink-0"
                                src={`https://ui-avatars.com/api/?background=10b981&color=fff&size=32&name=${comment.username || 'User'}`}
                                alt="Avatar"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-sm text-gray-800">{comment.username || 'User'}</span>
                                  {comment.is_bullying && (
                                    <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full font-medium">
                                      Flagged
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mt-1 break-words">
                                  {comment.is_bullying && !isVisible ? (
                                    <span className="text-red-500 italic text-xs">⚠️ Content hidden due to policy violation</span>
                                  ) : (
                                    comment.content
                                  )}
                                </p>
                              </div>
                              {comment.is_bullying && (
                                <button
                                  type="button"
                                  onClick={() => toggleBullyingComment(post.id, idx)}
                                  className="flex-shrink-0 text-red-400 hover:text-red-600 transition-colors p-1.5 hover:bg-red-50 rounded-full"
                                  title={isVisible ? 'Hide comment' : 'Show comment'}
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
                        <BsChatDots className="mx-auto text-3xl text-gray-300 mb-2" />
                        <p className="text-gray-400 text-sm">No comments yet. Be the first to comment!</p>
                      </div>
                    )
                  )}
                </div>
                
                {/* Comment Input */}
                <div className="px-4 py-3 border-t border-gray-100 bg-white/50">
                  <form onSubmit={(e) => handleCommentSubmit(post.id, e)} className="flex gap-2 items-center">
                    <img
                      className="w-8 h-8 rounded-full flex-shrink-0"
                      src={`https://ui-avatars.com/api/?background=10b981&color=fff&size=32&name=${user?.username || 'User'}`}
                      alt="Your avatar"
                    />
                    <div className="flex-1 relative">
                      <input
                        className="w-full border border-gray-200 rounded-full py-2.5 px-4 pr-12 text-sm bg-white/80 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent transition-all"
                        placeholder="Write a comment..."
                        value={newComment[post.id] || ''}
                        onChange={(e) => setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))}
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
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white p-2.5 rounded-full shadow-md shadow-emerald-200 transition-all hover:shadow-lg"
                    >
                      <IoMdSend size={18} />
                    </button>
                  </form>
                  {showEmojis[post.id] && (
                    <div className="mt-3 p-3 border border-gray-200 rounded-xl bg-white/90 shadow-sm">
                      <div className="flex flex-wrap gap-1">
                        {emojis.map((emoji, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => addEmoji(post.id, emoji)}
                            className="text-xl hover:bg-emerald-50 p-2 rounded-lg transition-colors hover:scale-110"
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
          </div>
          );
        })}
        {loading && (
          <div className="text-center text-gray-500 py-4">Loading...</div>
        )}
        {error && (
          <div className="text-center text-red-500 py-4">{error}</div>
        )}
        {!hasMore && !loading && posts.length > 0 && (
          <div className="text-center text-gray-400 py-4">No more posts to show.</div>
        )}
      </div>

      {/* Chat Component */}
      <Chat user={user} socket={socket} />
    </div>
  );
};

export default Feed;

