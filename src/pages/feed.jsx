
// Feed.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
// Styled components
const FeedContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
`;

const CreatePostCard = styled.div`
  background: white;
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const PostInput = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  margin-bottom: 10px;
  resize: none;
`;

const Button = styled.button`
  background: #0a66c2;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 600;
  
  &:hover {
    background: #004182;
  }
`;

const Post = styled.div`
  background: white;
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const PostHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
`;

const Avatar = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-right: 10px;
`;

const UserInfo = styled.div`
  h4 {
    margin: 0;
    font-size: 16px;
  }
  p {
    margin: 0;
    color: #666;
    font-size: 14px;
  }
`;

const PostContent = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
`;

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');

  // Simulated posts data
  useEffect(() => {
    setPosts([
      {
        id: 1,
        author: 'John Doe',
        position: 'Software Engineer',
        avatar: 'https://via.placeholder.com/48',
        content: 'Excited to share that I just launched my new project!',
        timestamp: '2h ago'
      },
      {
        id: 2,
        author: 'Jane Smith',
        position: 'Product Manager',
        avatar: 'https://via.placeholder.com/48',
        content: 'Great meeting with the team today discussing our Q4 goals.',
        timestamp: '4h ago'
      }
    ]);
  }, []);

  const handlePostSubmit = (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    const post = {
      id: posts.length + 1,
      author: 'Current User',
      position: 'Your Position',
      avatar: 'https://via.placeholder.com/48',
      content: newPost,
      timestamp: 'Just now'
    };

    setPosts([post, ...posts]);
    setNewPost('');
  };

  return (
    <FeedContainer>
      <CreatePostCard>
        <form onSubmit={handlePostSubmit}>
          <PostInput
            placeholder="What do you want to share?"
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
          />
          <Button type="submit">Post</Button>
        </form>
      </CreatePostCard>

      {posts.map(post => (
        <Post key={post.id}>
          <PostHeader>
            <Avatar src={post.avatar} alt={post.author} />
            <UserInfo>
              <h4>{post.author}</h4>
              <p>{post.position}</p>
              <p>{post.timestamp}</p>
            </UserInfo>
          </PostHeader>
          <PostContent>{post.content}</PostContent>
        </Post>
      ))}
    </FeedContainer>
  );
};

export default Feed;