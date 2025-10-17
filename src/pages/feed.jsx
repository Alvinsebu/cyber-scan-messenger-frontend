
import React, { useState, useEffect, useRef } from 'react';
import { Gi3dMeeple } from "react-icons/gi";
import { BsChatDots } from "react-icons/bs";
import { IoShareOutline } from "react-icons/io5";
import { IoMdPower } from "react-icons/io";
import { BsChatFill } from "react-icons/bs";
import { IoMdSend } from "react-icons/io";

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [newImage, setNewImage] = useState(null);
  const [newDescription, setNewDescription] = useState('');
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [showComments, setShowComments] = useState({});
  const [showEmojis, setShowEmojis] = useState({});
  const fileInputRef = useRef(null);

  const emojis = ['😀', '😂', '😍', '👍', '❤️', '😢', '😮', '😡'];

  useEffect(() => {
    setPosts([
      {
        id: 1,
        author: 'john_doe',
        // avatar: 'https://via.placeholder.com/32',
        content: 'Beautiful sunset today! 🌅',
        image: 'https://via.placeholder.com/600x400',
        timestamp: '2h ago',
        likes: 24
      },
      {
        id: 2,
        author: 'jane_smith',
        // avatar: 'https://via.placeholder.com/32',
        content: 'Coffee and code ☕️',
        timestamp: '4h ago',
        likes: 12
      }
    ]);
    setComments({
      1: [{ user: 'alice', text: 'Amazing shot!' }],
      2: [{ user: 'bob', text: 'Perfect combo!' }]
    });
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setNewImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handlePostSubmit = (e) => {
    e.preventDefault();
    if (!newPost.trim() && !newImage) return;

    const post = {
      id: posts.length + 1,
      author: 'Alvin',
      // avatar: 'https://via.placeholder.com/32',
      content: newPost,
      image: newImage,
      description: newDescription,
      timestamp: 'Just now',
      likes: 0
    };

    setPosts([post, ...posts]);
    setNewPost('');
    setNewImage(null);
    setNewDescription('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCommentSubmit = (postId, e) => {
    e.preventDefault();
    const commentText = newComment[postId];
    if (!commentText?.trim()) return;

    setComments(prev => ({
      ...prev,
      [postId]: [...(prev[postId] || []), { user: 'Alvin', text: commentText }]
    }));
    setNewComment(prev => ({ ...prev, [postId]: '' }));
  };

  const toggleComments = (postId) => {
    setShowComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const toggleEmojis = (postId) => {
    setShowEmojis(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const addEmoji = (postId, emoji) => {
    setNewComment(prev => ({ ...prev, [postId]: (prev[postId] || '') + emoji }));
    setShowEmojis(prev => ({ ...prev, [postId]: false }));
  };

  return (
    <>
      <nav className="bg-white border-b border-gray-300 px-5 py-2.5 fixed top-0 w-full z-50 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-4">
          <button className="text-2xl hover:text-gray-600">
            <Gi3dMeeple /></button>
          <h1 className="m-0 text-2xl text-gray-800">CYBERSCAN</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-800">Alvin</span>
          <BsChatDots className="text-xl hover:text-gray-600" />
           <button className="text-sm hover:text-gray-600">
            <IoMdPower className="text-xl hover:text-gray-600"/></button>
        </div>
      </nav>
      
      <div className="max-w-2xl mx-auto mt-16 p-5">
        <div className="bg-white border border-gray-300 rounded-lg p-4 mb-5 shadow-md">
          <form onSubmit={handlePostSubmit}>
            <textarea
              className="w-full h-[60px] p-2.5 border-none resize-none text-sm focus:outline-none"
              placeholder={newPost ? "What's on your mind?" : "Select file to upload"}
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
            />
            <input
              ref={fileInputRef}
              className="my-2.5"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            {newImage && (
              <div className="relative">
                <img src={newImage} alt="Preview" className="w-full max-w-md max-h-80 object-cover aspect-square mt-2.5 mx-auto" />
                <button 
                  className="absolute bottom-4 right-4 bg-white hover:bg-gray-100 p-2 rounded-full shadow-md" 
                  type="submit"
                >
                  <IoShareOutline className="text-lg" />
                </button>
                <input
                  className="w-full mt-2 p-2 text-sm focus:outline-none"
                  placeholder="Add a description..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                />
              </div>
            )}
            {!newImage && (
              <div className="flex justify-end">
                <button className="bg-red-500 hover:bg-black-600 text-white px-4 py-2 border-none rounded cursor-pointer font-semibold" type="submit"> <IoShareOutline className="text-lg" /></button>
              </div>
            )}
          </form>
        </div>

        {posts.map(post => (
          <div key={post.id} className="bg-white border border-gray-300 rounded-lg mb-5 shadow-md">
            <div className="flex items-center p-4">
              <img className="w-8 h-8 rounded-full mr-2.5" alt={post.author} />
              <div>
                <h4 className="m-0 text-sm font-semibold">{post.author}</h4>
                <p className="m-0 text-gray-500 text-xs">{post.timestamp}</p>
              </div>
            </div>
            
            {post.image && <img className="w-full max-w-md max-h-80 object-cover aspect-square block mx-auto" src={post.image} alt="Post" />}
            
            <div className="px-4 pb-2.5 flex gap-4">
              <button 
                className="bg-none border-none cursor-pointer text-sm text-gray-800 py-2 mt-2 mb-2"
                onClick={() => toggleComments(post.id)}
              >
                <BsChatFill className="inline mr-1" /> {comments[post.id]?.length || 0} Comments
              </button>
            </div>
            
            {post.content && <div className="px-4 text-sm leading-relaxed">{post.content}</div>}
            {post.description && <div className="px-4 text-sm leading-relaxed text-gray-600 mb-2 pb-2">{post.description}</div>}
            
            {showComments[post.id] && (
              <div className="px-4 pb-4 mt-4 mb-4">
                {comments[post.id]?.map((comment, idx) => (
                  <div key={idx} className="mb-2 text-sm">
                    <strong>{comment.user}</strong> {comment.text}
                  </div>
                ))}
                <div className="mt-3 mb-3">
                  <form onSubmit={(e) => handleCommentSubmit(post.id, e)} className="flex gap-2 items-center">
                    <div className="flex-1 relative">
                      <input
                        className="w-full border border-gray-300 rounded-full py-2.5 px-4 pr-12 text-sm focus:outline-none focus:border-blue-500"
                        placeholder="Add a comment..."
                        value={newComment[post.id] || ''}
                        onChange={(e) => setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))}
                      />
                      <button 
                        type="button"
                        onClick={() => toggleEmojis(post.id)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-lg hover:bg-gray-100 p-1 rounded-full"
                      >
                        😊
                      </button>
                    </div>
                    <button 
                      type="submit"
                      className="bg-blue-200 hover:bg-black-100 text-white px-4 py-2 rounded-full text-sm"
                    >
                      <IoMdSend />
                    </button>
                  </form>
                  {showEmojis[post.id] && (
                    <div className="mt-2 mb-2 p-3 border border-gray-200 rounded-lg bg-gray-50">
                      <div className="flex flex-wrap gap-2">
                        {emojis.map((emoji, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => addEmoji(post.id, emoji)}
                            className="text-xl hover:bg-gray-200 p-2 rounded-full"
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
        ))}
      </div>
    </>
  );
};

export default Feed;

