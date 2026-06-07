import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import AppLayout from '../components/AppLayout';
import { useToast } from '../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Heart, MessageCircle, BookOpen, Star, Plus,
  X, Send, Trash2, MapPin, Package,
} from 'lucide-react';
import API from '../api';

const AVATAR_COLORS = [
  'bg-blue-400', 'bg-pink-400', 'bg-green-400', 'bg-purple-400',
  'bg-orange-400', 'bg-teal-400', 'bg-rose-400', 'bg-indigo-400',
];
const avatarColor = (name = '') =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

const timeAgo = (iso) => {
  const diff = (Date.now() - new Date(iso)) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const POST_TYPES = ['thought', 'quote', 'review', 'milestone'];
const TYPE_LABELS = { thought: '💭 Thought', quote: '💬 Quote', review: '⭐ Review', milestone: '🏆 Milestone' };
const TYPE_COLORS = {
  thought: 'bg-[var(--color-tea-100)] text-[var(--color-tea-700)]',
  quote: 'bg-[var(--color-tea-100)] text-[var(--color-tea-700)]',
  review: 'bg-amber-100 text-amber-800',
  milestone: 'bg-green-100 text-green-800',
};

const CONDITIONS = ['Like New', 'Good', 'Fair', 'Well Read'];
const GENRES = ['Fiction', 'Non-Fiction', 'Self-Help', 'Sci-Fi', 'Fantasy', 'Biography', 'Mystery', 'Romance', 'History', 'Philosophy', 'General'];

// ── Post Card ──────────────────────────────────────────────────────────────
const PostCard = ({ post, currentUser, authHeader, onDelete, toast }) => {
  const [liked, setLiked] = useState(post.likes?.includes(currentUser?._id));
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(post.comments || []);
  const [commentText, setCommentText] = useState('');
  const [sendingComment, setSendingComment] = useState(false);

  const handleLike = async () => {
    try {
      const res = await axios.put(`${API}/api/community/posts/${post._id}/like`, {}, authHeader);
      setLiked(res.data.liked);
      setLikeCount(res.data.likes);
    } catch {
      toast('Failed to update like', 'error');
    }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    setSendingComment(true);
    try {
      const res = await axios.post(
        `${API}/api/community/posts/${post._id}/comments`,
        { text: commentText.trim() },
        authHeader
      );
      setComments(res.data);
      setCommentText('');
    } catch {
      toast('Failed to post comment', 'error');
    }
    setSendingComment(false);
  };

  const isOwn = post.userId === currentUser?._id || post.userId?.toString() === currentUser?._id?.toString();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-[var(--color-tea-100)] p-6 shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-full ${avatarColor(post.userName)} text-white font-bold flex items-center justify-center text-sm shadow-sm shrink-0`}>
          {post.userName?.[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[var(--color-tea-950)] text-sm">{post.userName}</p>
          <p className="text-[10px] text-[var(--color-tea-500)]">{timeAgo(post.createdAt)}</p>
        </div>
        <span className={`text-xs font-medium px-3 py-1 rounded-full ${TYPE_COLORS[post.type] || TYPE_COLORS.thought}`}>
          {TYPE_LABELS[post.type] || post.type}
        </span>
        {isOwn && (
          <button
            onClick={() => onDelete(post._id)}
            className="p-1.5 rounded-full text-[var(--color-tea-300)] hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* Book tag + rating */}
      {post.bookTitle && (
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <BookOpen size={13} className="text-[var(--color-tea-500)]" />
          <span className="text-xs font-medium text-[var(--color-tea-600)] italic">{post.bookTitle}</span>
          {post.rating && (
            <div className="flex gap-0.5 ml-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={11} fill={i < post.rating ? '#d48b67' : 'none'} className="text-[var(--color-tea-400)]" />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <p className={`text-[var(--color-tea-800)] leading-relaxed ${
        post.type === 'quote'
          ? 'italic text-base font-medium border-l-4 border-[var(--color-tea-300)] pl-4'
          : 'text-sm'
      }`}>
        {post.content}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-5 mt-5 pt-4 border-t border-[var(--color-tea-50)]">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
            liked ? 'text-[var(--color-tea-700)]' : 'text-[var(--color-tea-400)] hover:text-[var(--color-tea-700)]'
          }`}
        >
          <Heart size={17} fill={liked ? 'currentColor' : 'none'} /> {likeCount}
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-tea-400)] hover:text-[var(--color-tea-700)] transition-colors"
        >
          <MessageCircle size={17} /> {comments.length}
        </button>
      </div>

      {/* Comments section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-[var(--color-tea-50)] space-y-3">
              {comments.map((c, i) => (
                <div key={i} className="flex gap-2.5">
                  <div className={`w-7 h-7 rounded-full ${avatarColor(c.userName)} text-white font-bold flex items-center justify-center text-xs shrink-0`}>
                    {c.userName?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 bg-[var(--color-tea-50)] rounded-xl px-3 py-2">
                    <p className="text-xs font-bold text-[var(--color-tea-800)]">{c.userName}</p>
                    <p className="text-xs text-[var(--color-tea-700)] mt-0.5">{c.text}</p>
                  </div>
                </div>
              ))}
              <div className="flex gap-2 pt-1">
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleComment()}
                  placeholder="Write a comment..."
                  className="flex-1 px-3 py-2 rounded-xl border border-[var(--color-tea-200)] bg-white text-xs outline-none focus:ring-2 focus:ring-[var(--color-tea-300)]"
                />
                <button
                  onClick={handleComment}
                  disabled={sendingComment}
                  className="px-3 py-2 bg-[var(--color-tea-800)] text-white rounded-xl hover:bg-[var(--color-tea-900)] transition-colors"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ── Main Component ──────────────────────────────────────────────────────────
const Community = () => {
  const { user, token } = useContext(AuthContext);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('feed');

  // Feed state
  const [posts, setPosts] = useState([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [showCompose, setShowCompose] = useState(false);
  const [compose, setCompose] = useState({ type: 'thought', content: '', bookTitle: '', rating: 0 });
  const [posting, setPosting] = useState(false);

  // Exchange state
  const [listings, setListings] = useState([]);
  const [exchangeLoading, setExchangeLoading] = useState(true);
  const [showListForm, setShowListForm] = useState(false);
  const [listForm, setListForm] = useState({ title: '', author: '', genre: 'General', condition: 'Good', location: '', description: '' });
  const [listing, setListing] = useState(false);

  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    if (!token) return;
    fetchPosts();
    fetchListings();
  }, [token]);

  const fetchPosts = async () => {
    setFeedLoading(true);
    try {
      const res = await axios.get(`${API}/api/community/posts`, authHeader);
      setPosts(res.data);
    } catch {
      toast('Failed to load posts', 'error');
    }
    setFeedLoading(false);
  };

  const fetchListings = async () => {
    setExchangeLoading(true);
    try {
      const res = await axios.get(`${API}/api/community/exchange`, authHeader);
      setListings(res.data);
    } catch {
      toast('Failed to load listings', 'error');
    }
    setExchangeLoading(false);
  };

  const handlePost = async () => {
    if (!compose.content.trim()) return;
    setPosting(true);
    try {
      const res = await axios.post(`${API}/api/community/posts`, compose, authHeader);
      setPosts([res.data, ...posts]);
      setCompose({ type: 'thought', content: '', bookTitle: '', rating: 0 });
      setShowCompose(false);
      toast('Posted!', 'success');
    } catch {
      toast('Failed to post', 'error');
    }
    setPosting(false);
  };

  const handleDeletePost = async (id) => {
    try {
      await axios.delete(`${API}/api/community/posts/${id}`, authHeader);
      setPosts(posts.filter((p) => p._id !== id));
      toast('Post deleted', 'info');
    } catch {
      toast('Failed to delete post', 'error');
    }
  };

  const handleListBook = async () => {
    if (!listForm.title.trim()) return;
    setListing(true);
    try {
      const res = await axios.post(`${API}/api/community/exchange`, listForm, authHeader);
      setListings([res.data, ...listings]);
      setListForm({ title: '', author: '', genre: 'General', condition: 'Good', location: '', description: '' });
      setShowListForm(false);
      toast('Book listed for exchange!', 'success');
    } catch {
      toast('Failed to list book', 'error');
    }
    setListing(false);
  };

  const handleDeleteListing = async (id) => {
    try {
      await axios.delete(`${API}/api/community/exchange/${id}`, authHeader);
      setListings(listings.filter((l) => l._id !== id));
      toast('Listing removed', 'info');
    } catch {
      toast('Failed to remove listing', 'error');
    }
  };

  return (
    <AppLayout>
      <div className="p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-[var(--color-tea-950)]">Community</h1>
          <p className="text-[var(--color-tea-600)] mt-1">Connect with fellow readers, share quotes & exchange books</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[var(--color-tea-100)] p-1 rounded-2xl mb-8 w-fit">
          {['feed', 'exchange'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold capitalize transition-all ${
                activeTab === tab
                  ? 'bg-white text-[var(--color-tea-900)] shadow-sm'
                  : 'text-[var(--color-tea-600)] hover:text-[var(--color-tea-800)]'
              }`}
            >
              {tab === 'feed' ? '📰 Reader Feed' : '🔄 Book Exchange'}
            </button>
          ))}
        </div>

        {/* ── FEED TAB ──────────────────────────────────────────────────── */}
        {activeTab === 'feed' && (
          <div className="space-y-4">
            {/* Compose trigger */}
            <div
              className="bg-white rounded-2xl border border-[var(--color-tea-100)] p-5 shadow-sm flex gap-3 cursor-pointer hover:border-[var(--color-tea-300)] transition-colors"
              onClick={() => setShowCompose(true)}
            >
              <div className={`w-10 h-10 rounded-full ${avatarColor(user?.name)} text-white font-bold flex items-center justify-center text-sm shrink-0`}>
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--color-tea-50)] border border-[var(--color-tea-200)] text-sm text-[var(--color-tea-400)]">
                Share a quote, review, or thought...
              </div>
            </div>

            {/* Compose modal */}
            <AnimatePresence>
              {showCompose && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
                  onClick={(e) => e.target === e.currentTarget && setShowCompose(false)}
                >
                  <motion.div
                    initial={{ scale: 0.95, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.95, y: 20 }}
                    className="bg-white rounded-3xl shadow-2xl w-full max-w-lg border border-[var(--color-tea-100)] p-6"
                  >
                    <div className="flex justify-between items-center mb-5">
                      <h2 className="font-bold text-[var(--color-tea-950)] text-lg">Share with the community</h2>
                      <button onClick={() => setShowCompose(false)} className="p-1.5 rounded-full hover:bg-[var(--color-tea-50)] text-[var(--color-tea-500)]">
                        <X size={18} />
                      </button>
                    </div>

                    {/* Type selector */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {POST_TYPES.map((t) => (
                        <button
                          key={t}
                          onClick={() => setCompose({ ...compose, type: t })}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-colors ${
                            compose.type === t
                              ? 'bg-[var(--color-tea-800)] text-white border-[var(--color-tea-800)]'
                              : 'bg-white text-[var(--color-tea-600)] border-[var(--color-tea-200)] hover:border-[var(--color-tea-400)]'
                          }`}
                        >
                          {TYPE_LABELS[t]}
                        </button>
                      ))}
                    </div>

                    {/* Book title (optional) */}
                    {(compose.type === 'quote' || compose.type === 'review') && (
                      <input
                        value={compose.bookTitle}
                        onChange={(e) => setCompose({ ...compose, bookTitle: e.target.value })}
                        placeholder="Book title (optional)"
                        className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-tea-200)] bg-[var(--color-tea-50)] outline-none focus:ring-2 focus:ring-[var(--color-tea-300)] text-sm mb-3"
                      />
                    )}

                    {/* Rating for reviews */}
                    {compose.type === 'review' && (
                      <div className="flex gap-1 mb-3">
                        {[1, 2, 3, 4, 5].map((r) => (
                          <button key={r} onClick={() => setCompose({ ...compose, rating: r })}>
                            <Star
                              size={22}
                              fill={r <= compose.rating ? '#d48b67' : 'none'}
                              className="text-[var(--color-tea-400)] hover:text-[var(--color-tea-600)] transition-colors"
                            />
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Content */}
                    <textarea
                      rows={4}
                      value={compose.content}
                      onChange={(e) => setCompose({ ...compose, content: e.target.value })}
                      placeholder={
                        compose.type === 'quote' ? '"The best quotes from your book..."'
                          : compose.type === 'review' ? 'Share your thoughts about the book...'
                          : compose.type === 'milestone' ? 'Celebrate a reading milestone!'
                          : 'What\'s on your reading mind?'
                      }
                      className="w-full px-4 py-3 rounded-xl border border-[var(--color-tea-200)] bg-[var(--color-tea-50)] outline-none focus:ring-2 focus:ring-[var(--color-tea-300)] text-sm resize-none"
                    />

                    <div className="flex justify-end gap-3 mt-4">
                      <button onClick={() => setShowCompose(false)} className="px-5 py-2.5 rounded-xl border border-[var(--color-tea-200)] text-sm font-medium text-[var(--color-tea-700)] hover:bg-[var(--color-tea-50)]">
                        Cancel
                      </button>
                      <button
                        onClick={handlePost}
                        disabled={posting || !compose.content.trim()}
                        className="px-6 py-2.5 rounded-xl bg-[var(--color-tea-800)] text-white text-sm font-bold hover:bg-[var(--color-tea-900)] shadow-md disabled:opacity-50 flex items-center gap-2"
                      >
                        <Send size={15} />
                        {posting ? 'Posting...' : 'Post'}
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Posts list */}
            {feedLoading ? (
              <div className="text-center py-16 text-[var(--color-tea-500)]">Loading posts...</div>
            ) : posts.length === 0 ? (
              <div className="text-center py-16 text-[var(--color-tea-400)]">
                <Users size={48} className="mx-auto mb-4 opacity-30" />
                <p className="font-medium">No posts yet. Be the first to share!</p>
              </div>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  currentUser={user}
                  authHeader={authHeader}
                  onDelete={handleDeletePost}
                  toast={toast}
                />
              ))
            )}
          </div>
        )}

        {/* ── EXCHANGE TAB ─────────────────────────────────────────────── */}
        {activeTab === 'exchange' && (
          <div className="space-y-5">
            <div className="flex justify-between items-center">
              <p className="text-sm text-[var(--color-tea-600)] bg-[var(--color-tea-50)] border border-[var(--color-tea-200)] rounded-xl px-4 py-3 flex-1 mr-4">
                📦 Browse books available for exchange. List your own to share with the community!
              </p>
              <button
                onClick={() => setShowListForm(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-tea-800)] text-white rounded-xl font-bold text-sm shadow-md hover:bg-[var(--color-tea-900)] transition-colors shrink-0"
              >
                <Plus size={16} /> List a Book
              </button>
            </div>

            {/* List Book Modal */}
            <AnimatePresence>
              {showListForm && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
                  onClick={(e) => e.target === e.currentTarget && setShowListForm(false)}
                >
                  <motion.div
                    initial={{ scale: 0.95, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.95, y: 20 }}
                    className="bg-white rounded-3xl shadow-2xl w-full max-w-lg border border-[var(--color-tea-100)] p-6 max-h-[90vh] overflow-y-auto"
                  >
                    <div className="flex justify-between items-center mb-5">
                      <h2 className="font-bold text-[var(--color-tea-950)] text-lg">List a Book for Exchange</h2>
                      <button onClick={() => setShowListForm(false)} className="p-1.5 rounded-full hover:bg-[var(--color-tea-50)] text-[var(--color-tea-500)]">
                        <X size={18} />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                          <label className="block text-xs font-bold text-[var(--color-tea-700)] uppercase tracking-wider mb-1">Book Title *</label>
                          <input
                            required
                            value={listForm.title}
                            onChange={(e) => setListForm({ ...listForm, title: e.target.value })}
                            placeholder="e.g. Atomic Habits"
                            className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-tea-200)] bg-[var(--color-tea-50)] outline-none focus:ring-2 focus:ring-[var(--color-tea-300)] text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-[var(--color-tea-700)] uppercase tracking-wider mb-1">Author</label>
                          <input
                            value={listForm.author}
                            onChange={(e) => setListForm({ ...listForm, author: e.target.value })}
                            placeholder="Author name"
                            className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-tea-200)] bg-[var(--color-tea-50)] outline-none focus:ring-2 focus:ring-[var(--color-tea-300)] text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-[var(--color-tea-700)] uppercase tracking-wider mb-1">Genre</label>
                          <select
                            value={listForm.genre}
                            onChange={(e) => setListForm({ ...listForm, genre: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-tea-200)] bg-[var(--color-tea-50)] outline-none focus:ring-2 focus:ring-[var(--color-tea-300)] text-sm"
                          >
                            {GENRES.map((g) => <option key={g}>{g}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-[var(--color-tea-700)] uppercase tracking-wider mb-1">Condition</label>
                          <select
                            value={listForm.condition}
                            onChange={(e) => setListForm({ ...listForm, condition: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-tea-200)] bg-[var(--color-tea-50)] outline-none focus:ring-2 focus:ring-[var(--color-tea-300)] text-sm"
                          >
                            {CONDITIONS.map((c) => <option key={c}>{c}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-[var(--color-tea-700)] uppercase tracking-wider mb-1">Your Location</label>
                          <input
                            value={listForm.location}
                            onChange={(e) => setListForm({ ...listForm, location: e.target.value })}
                            placeholder="e.g. Bangalore"
                            className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-tea-200)] bg-[var(--color-tea-50)] outline-none focus:ring-2 focus:ring-[var(--color-tea-300)] text-sm"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs font-bold text-[var(--color-tea-700)] uppercase tracking-wider mb-1">Description <span className="font-normal text-[var(--color-tea-500)]">(optional)</span></label>
                          <textarea
                            rows={2}
                            value={listForm.description}
                            onChange={(e) => setListForm({ ...listForm, description: e.target.value })}
                            placeholder="Any notes about the book..."
                            className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-tea-200)] bg-[var(--color-tea-50)] outline-none focus:ring-2 focus:ring-[var(--color-tea-300)] text-sm resize-none"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-2">
                        <button onClick={() => setShowListForm(false)} className="px-5 py-2.5 rounded-xl border border-[var(--color-tea-200)] text-sm font-medium text-[var(--color-tea-700)] hover:bg-[var(--color-tea-50)]">
                          Cancel
                        </button>
                        <button
                          onClick={handleListBook}
                          disabled={listing || !listForm.title.trim()}
                          className="px-6 py-2.5 rounded-xl bg-[var(--color-tea-800)] text-white text-sm font-bold hover:bg-[var(--color-tea-900)] shadow-md disabled:opacity-50 flex items-center gap-2"
                        >
                          <Package size={15} />
                          {listing ? 'Listing...' : 'List Book'}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Listings grid */}
            {exchangeLoading ? (
              <div className="text-center py-16 text-[var(--color-tea-500)]">Loading listings...</div>
            ) : listings.length === 0 ? (
              <div className="text-center py-16 text-[var(--color-tea-400)]">
                <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
                <p className="font-medium mb-4">No books listed for exchange yet.</p>
                <button
                  onClick={() => setShowListForm(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-tea-800)] text-white rounded-xl font-bold text-sm shadow-md hover:bg-[var(--color-tea-900)]"
                >
                  <Plus size={16} /> Be the first to list one
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {listings.map((book, i) => {
                  const isOwn = book.userId === user?._id || book.userId?.toString() === user?._id?.toString();
                  return (
                    <motion.div
                      key={book._id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="bg-white rounded-2xl border border-[var(--color-tea-100)] p-6 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="w-full aspect-[3/2] bg-[var(--color-tea-100)] rounded-xl mb-4 flex items-center justify-center">
                        <BookOpen size={32} className="text-[var(--color-tea-400)]" />
                      </div>
                      <h3 className="font-extrabold text-[var(--color-tea-950)]">{book.title}</h3>
                      <p className="text-[var(--color-tea-600)] text-sm">{book.author || 'Unknown author'}</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <span className="text-xs px-2.5 py-1 bg-[var(--color-tea-100)] text-[var(--color-tea-700)] rounded-full font-medium">{book.genre}</span>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          book.condition === 'Like New' ? 'bg-green-100 text-green-700'
                            : book.condition === 'Good' ? 'bg-blue-100 text-blue-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {book.condition}
                        </span>
                      </div>
                      {book.description && (
                        <p className="text-xs text-[var(--color-tea-500)] mt-2 italic">{book.description}</p>
                      )}
                      <div className="mt-4 pt-4 border-t border-[var(--color-tea-50)] text-xs text-[var(--color-tea-500)]">
                        <p className="font-bold text-[var(--color-tea-700)]">{book.userName}</p>
                        {book.location && <p className="flex items-center gap-1 mt-0.5"><MapPin size={10} /> {book.location}</p>}
                      </div>
                      {isOwn ? (
                        <button
                          onClick={() => handleDeleteListing(book._id)}
                          className="w-full mt-4 py-2.5 border border-red-200 text-red-600 text-sm font-bold rounded-xl hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                        >
                          <Trash2 size={14} /> Remove Listing
                        </button>
                      ) : (
                        <button className="w-full mt-4 py-2.5 bg-[var(--color-tea-700)] text-white text-sm font-bold rounded-xl hover:bg-[var(--color-tea-800)] transition-colors shadow-sm">
                          Request Exchange
                        </button>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Community;
