import { useState, useEffect } from 'react';
import { Plus, MessageCircle, Clock, Users, ChevronRight, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BaseCrudService } from '@/integrations';
import { ForumCategories } from '@/entities/forumcategories';

interface ForumPost {
  id: string;
  title: string;
  content: string;
  author: string;
  timestamp: Date;
  category: string;
  replies: ForumReply[];
  isAnonymous: boolean;
}

interface ForumReply {
  id: string;
  content: string;
  author: string;
  timestamp: Date;
  isAnonymous: boolean;
}

export default function ForumPage() {
  const [categories, setCategories] = useState<ForumCategories[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { items } = await BaseCrudService.getAll<ForumCategories>('forumcategories');
        const activeCategories = items.filter(cat => cat.isActive).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
        setCategories(activeCategories);
        if (activeCategories.length > 0) {
          setNewPostCategory(activeCategories[0]._id);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
    loadMockPosts();
  }, []);

  const loadMockPosts = () => {
    const mockPosts: ForumPost[] = [
      {
        id: '1',
        title: 'Dealing with exam anxiety - any tips?',
        content: 'I have my finals coming up and I\'m feeling really overwhelmed. The anxiety is making it hard to focus on studying. Has anyone found effective ways to manage exam stress?',
        author: 'Student123',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        category: 'Stress',
        isAnonymous: true,
        replies: [
          {
            id: 'r1',
            content: 'I found that breaking study sessions into smaller chunks really helps. Try the Pomodoro technique - 25 minutes of focused study, then a 5-minute break.',
            author: 'StudyBuddy',
            timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
            isAnonymous: true
          },
          {
            id: 'r2',
            content: 'Deep breathing exercises before exams have been a game-changer for me. There are some great guided breathing videos in the resources section.',
            author: 'ZenStudent',
            timestamp: new Date(Date.now() - 30 * 60 * 1000),
            isAnonymous: true
          }
        ]
      },
      {
        id: '2',
        title: 'Trouble sleeping before important deadlines',
        content: 'Anyone else find it impossible to sleep when you have big assignments due? My mind just keeps racing with all the things I need to do.',
        author: 'NightOwl',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        category: 'Sleep',
        isAnonymous: true,
        replies: [
          {
            id: 'r3',
            content: 'I use a journal to write down all my thoughts before bed. It helps get them out of my head so I can relax.',
            author: 'SleepyHead',
            timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
            isAnonymous: true
          }
        ]
      },
      {
        id: '3',
        title: 'Effective study techniques that actually work',
        content: 'I\'ve been struggling to find study methods that stick. What techniques have you found most effective for retaining information?',
        author: 'StudySeeker',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        category: 'Study Tips',
        isAnonymous: true,
        replies: []
      },
      {
        id: '4',
        title: 'Social anxiety in group projects',
        content: 'Group projects make me so anxious. I worry about speaking up and being judged. How do you handle working with classmates when you have social anxiety?',
        author: 'QuietStudent',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
        category: 'Anxiety',
        isAnonymous: true,
        replies: [
          {
            id: 'r4',
            content: 'Start small - maybe suggest meeting in a quiet coffee shop instead of a busy library. Smaller, calmer environments help me feel more comfortable.',
            author: 'CalmCollaborator',
            timestamp: new Date(Date.now() - 7 * 60 * 60 * 1000),
            isAnonymous: true
          }
        ]
      }
    ];
    setPosts(mockPosts);
  };

  const filteredPosts = selectedCategory === 'All' 
    ? posts 
    : posts.filter(post => post.category === selectedCategory);

  const handleCreatePost = () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) return;

    const newPost: ForumPost = {
      id: Date.now().toString(),
      title: newPostTitle,
      content: newPostContent,
      author: `Anonymous${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date(),
      category: categories.find(cat => cat._id === newPostCategory)?.categoryName || 'General',
      isAnonymous: true,
      replies: []
    };

    setPosts(prev => [newPost, ...prev]);
    setNewPostTitle('');
    setNewPostContent('');
    setShowNewPostModal(false);
  };

  const handleReply = () => {
    if (!replyContent.trim() || !selectedPost) return;

    const newReply: ForumReply = {
      id: Date.now().toString(),
      content: replyContent,
      author: `Anonymous${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date(),
      isAnonymous: true
    };

    const updatedPost = {
      ...selectedPost,
      replies: [...selectedPost.replies, newReply]
    };

    setPosts(prev => prev.map(post => post.id === selectedPost.id ? updatedPost : post));
    setSelectedPost(updatedPost);
    setReplyContent('');
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-paragraph text-gray-600">Loading forum...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-[120rem] mx-auto px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-heading font-bold text-foreground mb-4">
            Peer Support Forum
          </h1>
          <p className="text-lg font-paragraph text-gray-600 max-w-3xl mx-auto">
            Connect anonymously with fellow students. Share experiences, ask questions, 
            and support each other in a safe, judgment-free environment.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Categories */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-heading font-bold text-foreground">Categories</h2>
                <button
                  onClick={() => setShowNewPostModal(true)}
                  className="bg-primary text-primary-foreground p-2 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory('All')}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedCategory === 'All'
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-paragraph font-medium">All Posts</span>
                    <span className="text-sm">{posts.length}</span>
                  </div>
                </button>
                
                {categories.map((category) => {
                  const categoryPosts = posts.filter(post => post.category === category.categoryName);
                  return (
                    <button
                      key={category._id}
                      onClick={() => setSelectedCategory(category.categoryName || '')}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedCategory === category.categoryName
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-paragraph font-medium">{category.categoryName}</span>
                        <span className="text-sm">{categoryPosts.length}</span>
                      </div>
                      {category.description && (
                        <p className="text-xs mt-1 opacity-75">{category.description}</p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {selectedPost ? (
              /* Post Detail View */
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                {/* Post Header */}
                <div className="p-6 border-b border-gray-100">
                  <button
                    onClick={() => setSelectedPost(null)}
                    className="text-primary hover:text-primary/80 font-paragraph text-sm mb-4 inline-flex items-center"
                  >
                    ← Back to posts
                  </button>
                  
                  <h1 className="text-2xl font-heading font-bold text-foreground mb-4">
                    {selectedPost.title}
                  </h1>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="font-paragraph">By {selectedPost.author}</span>
                    <span className="font-paragraph">{formatTimeAgo(selectedPost.timestamp)}</span>
                    <span className="bg-primary/10 text-primary px-2 py-1 rounded-full font-paragraph text-xs">
                      {selectedPost.category}
                    </span>
                  </div>
                </div>

                {/* Post Content */}
                <div className="p-6 border-b border-gray-100">
                  <p className="font-paragraph text-gray-700 leading-relaxed">
                    {selectedPost.content}
                  </p>
                </div>

                {/* Replies */}
                <div className="p-6">
                  <h3 className="font-heading font-bold text-foreground mb-4">
                    Replies ({selectedPost.replies.length})
                  </h3>
                  
                  <div className="space-y-4 mb-6">
                    {selectedPost.replies.map((reply) => (
                      <div key={reply.id} className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                          <span className="font-paragraph font-medium">{reply.author}</span>
                          <span className="font-paragraph">{formatTimeAgo(reply.timestamp)}</span>
                        </div>
                        <p className="font-paragraph text-gray-700">{reply.content}</p>
                      </div>
                    ))}
                  </div>

                  {/* Reply Form */}
                  <div className="border-t border-gray-100 pt-6">
                    <h4 className="font-heading font-bold text-foreground mb-4">Add a Reply</h4>
                    <div className="space-y-4">
                      <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Share your thoughts or advice..."
                        rows={4}
                        className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-paragraph resize-none"
                      />
                      <button
                        onClick={handleReply}
                        disabled={!replyContent.trim()}
                        className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-paragraph font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center space-x-2"
                      >
                        <Send className="w-4 h-4" />
                        <span>Post Reply</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Posts List View */
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-heading font-bold text-foreground">
                    {selectedCategory === 'All' ? 'All Posts' : selectedCategory}
                  </h2>
                  <button
                    onClick={() => setShowNewPostModal(true)}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-paragraph font-medium hover:bg-primary/90 transition-colors inline-flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>New Post</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {filteredPosts.map((post) => (
                    <motion.div
                      key={post.id}
                      whileHover={{ scale: 1.01 }}
                      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setSelectedPost(post)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-heading font-bold text-foreground mb-2 hover:text-primary transition-colors">
                            {post.title}
                          </h3>
                          <p className="font-paragraph text-gray-600 mb-4 line-clamp-2">
                            {post.content}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="font-paragraph">By {post.author}</span>
                            <span className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span className="font-paragraph">{formatTimeAgo(post.timestamp)}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <MessageCircle className="w-3 h-3" />
                              <span className="font-paragraph">{post.replies.length} replies</span>
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-paragraph text-xs">
                            {post.category}
                          </span>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {filteredPosts.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="font-heading font-bold text-foreground mb-2">No posts yet</h3>
                    <p className="font-paragraph text-gray-600 mb-4">
                      Be the first to start a conversation in this category.
                    </p>
                    <button
                      onClick={() => setShowNewPostModal(true)}
                      className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-paragraph font-medium hover:bg-primary/90 transition-colors"
                    >
                      Create First Post
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* New Post Modal */}
        <AnimatePresence>
          {showNewPostModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <h3 className="text-2xl font-heading font-bold text-foreground mb-6">
                  Create New Post
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block font-paragraph font-medium text-foreground mb-2">
                      Category
                    </label>
                    <select
                      value={newPostCategory}
                      onChange={(e) => setNewPostCategory(e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-paragraph"
                    >
                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.categoryName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-paragraph font-medium text-foreground mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={newPostTitle}
                      onChange={(e) => setNewPostTitle(e.target.value)}
                      placeholder="What would you like to discuss?"
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-paragraph"
                    />
                  </div>

                  <div>
                    <label className="block font-paragraph font-medium text-foreground mb-2">
                      Content
                    </label>
                    <textarea
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      placeholder="Share your thoughts, ask questions, or seek advice..."
                      rows={6}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-paragraph resize-none"
                    />
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="font-paragraph text-sm text-blue-800">
                      <strong>Privacy Note:</strong> All posts are anonymous. Your identity will not be shared, 
                      and you'll be assigned a random username for this conversation.
                    </p>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      onClick={handleCreatePost}
                      disabled={!newPostTitle.trim() || !newPostContent.trim()}
                      className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg font-paragraph font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Create Post
                    </button>
                    <button
                      onClick={() => setShowNewPostModal(false)}
                      className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-paragraph font-medium hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}