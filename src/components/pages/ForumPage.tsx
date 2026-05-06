import { useState, useEffect, useCallback } from 'react';
import { Plus, MessageCircle, Clock, Send, ArrowLeft, Globe, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, hasCollegeAccess } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';

const API_BASE = 'http://localhost:8080/api/forum';

interface ForumPost {
  id: string;
  title: string;
  content: string;
  category: string;
  anonymousAuthor: string;
  scope: 'CAMPUS' | 'GLOBAL';
  collegeName: string | null;
  createdAt: string;
  commentCount: number;
  comments: ForumComment[];
}

interface ForumComment {
  id: string;
  content: string;
  anonymousAuthor: string;
  createdAt: string;
}

const CATEGORIES = ['all', 'anxiety', 'exams', 'relationships', 'loneliness', 'general'];

const CATEGORY_LABELS: Record<string, string> = {
  all: '🌐 All',
  anxiety: '😰 Anxiety',
  exams: '📝 Exams',
  relationships: '💛 Relationships',
  loneliness: '🌙 Loneliness',
  general: '💬 General',
};

export default function ForumPage() {
  const { user, isAuthenticated, token } = useAuth();
  const [scope, setScope] = useState<'global' | 'campus'>('global');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState('general');
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canAccessCampus = hasCollegeAccess(user);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ scope });
      if (selectedCategory !== 'all') params.set('category', selectedCategory);

      const response = await fetch(`${API_BASE}/posts?${params}`, { headers });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to load posts');
      }

      const data = await response.json();
      setPosts(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load posts';
      setError(msg);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [scope, selectedCategory, token]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleCreatePost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) return;

    try {
      const response = await fetch(`${API_BASE}/posts`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: newPostTitle,
          content: newPostContent,
          category: newPostCategory,
          scope,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create post');
      }

      setNewPostTitle('');
      setNewPostContent('');
      setNewPostCategory('general');
      setShowNewPostModal(false);
      fetchPosts();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create post');
    }
  };

  const handleReply = async () => {
    if (!replyContent.trim() || !selectedPost) return;

    try {
      const response = await fetch(`${API_BASE}/posts/${selectedPost.id}/comments`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ content: replyContent }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to post reply');
      }

      setReplyContent('');
      // Refresh post detail
      const postResponse = await fetch(`${API_BASE}/posts/${selectedPost.id}`, { headers });
      if (postResponse.ok) {
        const updatedPost = await postResponse.json();
        setSelectedPost(updatedPost);
        // Also update in list
        setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to post reply');
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="min-h-screen bg-background dark:bg-gray-950 py-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground dark:text-gray-100 mb-3">
            Peer Support Forum
          </h1>
          <p className="text-base font-paragraph text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Share anonymously. Support each other. No judgment.
          </p>
        </div>

        {/* Scope Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-1 inline-flex shadow-sm">
            <button
              onClick={() => setScope('global')}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg font-paragraph text-sm font-medium transition-all ${
                scope === 'global'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-foreground dark:hover:text-gray-200'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Global</span>
            </button>
            <button
              onClick={() => {
                if (!canAccessCampus) return;
                setScope('campus');
              }}
              disabled={!canAccessCampus}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg font-paragraph text-sm font-medium transition-all ${
                scope === 'campus'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : canAccessCampus
                    ? 'text-gray-600 dark:text-gray-400 hover:text-foreground dark:hover:text-gray-200'
                    : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
              }`}
              title={!canAccessCampus ? 'Sign in with a college email to access campus forum' : ''}
            >
              <Building2 className="w-4 h-4" />
              <span>Campus{user?.collegeName ? ` (${user.collegeName})` : ''}</span>
            </button>
          </div>
        </div>

        {/* Not signed in notice for campus */}
        {scope === 'global' && !canAccessCampus && (
          <div className="text-center mb-6">
            <p className="text-sm text-gray-500 dark:text-gray-500 font-paragraph">
              <Link to="/login" className="text-primary dark:text-green-400 hover:underline">Sign in with a college email</Link>
              {' '}to access your campus-specific forum.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Categories */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-5 sticky top-8">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-heading font-bold text-foreground dark:text-gray-100">Categories</h2>
                {isAuthenticated && (
                  <button
                    onClick={() => setShowNewPostModal(true)}
                    className="bg-primary text-primary-foreground p-2 rounded-lg hover:bg-primary/90 transition-colors"
                    title="New Post"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="space-y-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left p-3 rounded-lg transition-colors font-paragraph text-sm ${
                      selectedCategory === cat
                        ? 'bg-primary text-primary-foreground font-medium'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {CATEGORY_LABELS[cat] || cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {selectedPost ? (
              /* Post Detail View */
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                  <button
                    onClick={() => setSelectedPost(null)}
                    className="text-primary dark:text-green-400 hover:text-primary/80 dark:hover:text-green-300 font-paragraph text-sm mb-4 inline-flex items-center space-x-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to posts</span>
                  </button>

                  <h1 className="text-2xl font-heading font-bold text-foreground dark:text-gray-100 mb-3">
                    {selectedPost.title}
                  </h1>

                  <div className="flex items-center flex-wrap gap-3 text-sm text-gray-500 dark:text-gray-500">
                    <span className="font-paragraph font-medium text-foreground dark:text-gray-200">{selectedPost.anonymousAuthor}</span>
                    <span className="font-paragraph">{formatTimeAgo(selectedPost.createdAt)}</span>
                    <span className="bg-primary/10 text-primary dark:text-green-400 px-2.5 py-0.5 rounded-full font-paragraph text-xs font-medium">
                      {selectedPost.category}
                    </span>
                  </div>
                </div>

                <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                  <p className="font-paragraph text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {selectedPost.content}
                  </p>
                </div>

                {/* Comments */}
                <div className="p-6">
                  <h3 className="font-heading font-bold text-foreground dark:text-gray-100 mb-4">
                    Replies ({selectedPost.comments?.length || 0})
                  </h3>

                  <div className="space-y-3 mb-6">
                    {selectedPost.comments?.map((comment) => (
                      <div key={comment.id} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                        <div className="flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-500 mb-2">
                          <span className="font-paragraph font-medium text-foreground dark:text-gray-200">{comment.anonymousAuthor}</span>
                          <span className="font-paragraph">{formatTimeAgo(comment.createdAt)}</span>
                        </div>
                        <p className="font-paragraph text-gray-700 dark:text-gray-300">{comment.content}</p>
                      </div>
                    ))}

                    {(!selectedPost.comments || selectedPost.comments.length === 0) && (
                      <p className="text-gray-400 dark:text-gray-600 font-paragraph text-sm text-center py-4">
                        No replies yet. Be the first to share your thoughts.
                      </p>
                    )}
                  </div>

                  {/* Reply Form */}
                  {isAuthenticated ? (
                    <div className="border-t border-gray-100 dark:border-gray-800 pt-5">
                      <div className="space-y-3">
                        <textarea
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder="Share your thoughts or advice..."
                          rows={3}
                          className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-paragraph resize-none text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
                        />
                        <button
                          onClick={handleReply}
                          disabled={!replyContent.trim()}
                          className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-paragraph text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center space-x-2"
                        >
                          <Send className="w-4 h-4" />
                          <span>Reply</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="border-t border-gray-100 dark:border-gray-800 pt-5 text-center">
                      <p className="text-gray-500 dark:text-gray-500 font-paragraph text-sm">
                        <Link to="/login" className="text-primary dark:text-green-400 hover:underline">Sign in</Link> to reply.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Posts List View */
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-heading font-bold text-foreground dark:text-gray-100">
                    {scope === 'campus' ? `${user?.collegeName || 'Campus'} Posts` : 'Global Posts'}
                    {selectedCategory !== 'all' && ` — ${selectedCategory}`}
                  </h2>
                  {isAuthenticated && (
                    <button
                      onClick={() => setShowNewPostModal(true)}
                      className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-paragraph text-sm font-medium hover:bg-primary/90 transition-colors inline-flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>New Post</span>
                    </button>
                  )}
                </div>

                {loading && (
                  <div className="text-center py-12">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="font-paragraph text-gray-500 dark:text-gray-500 text-sm">Loading posts...</p>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl p-4 text-center">
                    <p className="font-paragraph text-red-600 dark:text-red-400 text-sm">{error}</p>
                  </div>
                )}

                {!loading && !error && (
                  <div className="space-y-3">
                    {posts.map((post) => (
                      <motion.div
                        key={post.id}
                        whileHover={{ scale: 1.005 }}
                        className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-5 cursor-pointer hover:shadow-md hover:border-gray-200 dark:hover:border-gray-700 transition-all"
                        onClick={() => setSelectedPost(post)}
                      >
                        <h3 className="font-heading font-bold text-foreground dark:text-gray-100 mb-2 hover:text-primary dark:hover:text-green-400 transition-colors">
                          {post.title}
                        </h3>
                        <p className="font-paragraph text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                          {post.content}
                        </p>
                        <div className="flex items-center flex-wrap gap-3 text-xs text-gray-400 dark:text-gray-500">
                          <span className="font-paragraph font-medium text-gray-600 dark:text-gray-400">{post.anonymousAuthor}</span>
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span className="font-paragraph">{formatTimeAgo(post.createdAt)}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <MessageCircle className="w-3 h-3" />
                            <span className="font-paragraph">{post.commentCount} replies</span>
                          </span>
                          <span className="bg-primary/10 text-primary dark:text-green-400 px-2 py-0.5 rounded-full font-paragraph text-xs">
                            {post.category}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {!loading && !error && posts.length === 0 && (
                  <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <MessageCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="font-heading font-bold text-foreground dark:text-gray-100 mb-2">
                      {scope === 'campus' ? 'No campus posts yet' : 'No posts in this category'}
                    </h3>
                    <p className="font-paragraph text-gray-500 dark:text-gray-500 text-sm mb-5 max-w-sm mx-auto">
                      {scope === 'campus'
                        ? 'Be the first to start a conversation with your campus peers.'
                        : 'Start a conversation — someone might be feeling the same way.'}
                    </p>
                    {isAuthenticated && (
                      <button
                        onClick={() => setShowNewPostModal(true)}
                        className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-paragraph text-sm font-medium hover:bg-primary/90 transition-colors"
                      >
                        Create First Post
                      </button>
                    )}
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
              className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-gray-900 rounded-2xl p-7 max-w-lg w-full max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-800"
              >
                <h3 className="text-xl font-heading font-bold text-foreground dark:text-gray-100 mb-5">
                  Create New Post
                </h3>

                <div className="space-y-5">
                  {/* Scope indicator */}
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <p className="font-paragraph text-sm text-gray-600 dark:text-gray-400">
                      Posting to: <strong className="dark:text-gray-200">{scope === 'campus' ? `${user?.collegeName} (Campus)` : 'Global Forum'}</strong>
                    </p>
                  </div>

                  <div>
                    <label className="block font-paragraph font-medium text-foreground dark:text-gray-200 mb-1.5 text-sm">
                      Category
                    </label>
                    <select
                      value={newPostCategory}
                      onChange={(e) => setNewPostCategory(e.target.value)}
                      className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-paragraph text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                    >
                      {CATEGORIES.filter(c => c !== 'all').map((cat) => (
                        <option key={cat} value={cat}>
                          {CATEGORY_LABELS[cat]?.replace(/^\S+\s/, '') || cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-paragraph font-medium text-foreground dark:text-gray-200 mb-1.5 text-sm">
                      Title
                    </label>
                    <input
                      type="text"
                      value={newPostTitle}
                      onChange={(e) => setNewPostTitle(e.target.value)}
                      placeholder="What would you like to discuss?"
                      className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-paragraph text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block font-paragraph font-medium text-foreground dark:text-gray-200 mb-1.5 text-sm">
                      Content
                    </label>
                    <textarea
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      placeholder="Share your thoughts, ask questions, or seek advice..."
                      rows={5}
                      className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-paragraph resize-none text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
                    />
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg border border-blue-100 dark:border-blue-900/50">
                    <p className="font-paragraph text-xs text-blue-700 dark:text-blue-300">
                      🔒 <strong>Anonymous:</strong> You'll appear as <strong>{user?.anonymousName || 'Anonymous'}</strong>.
                      Your real identity is never shared.
                    </p>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={handleCreatePost}
                      disabled={!newPostTitle.trim() || !newPostContent.trim()}
                      className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg font-paragraph text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Create Post
                    </button>
                    <button
                      onClick={() => setShowNewPostModal(false)}
                      className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-3 rounded-lg font-paragraph text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
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