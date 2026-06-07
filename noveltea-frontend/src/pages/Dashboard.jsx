import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import AppLayout from '../components/AppLayout';
import { useToast } from '../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Book, Upload, Zap, BookMarked, BarChart3, BookText,
  Target, Flame, Award, Search, Trash2, CheckCircle, Circle, X,
} from 'lucide-react';
import { BookshelfSkeleton, StatCardSkeleton } from '../components/Skeleton';
import coverClassic from '../assets/cover_classic.png';
import coverFloral from '../assets/cover_floral.png';
import coverCelestial from '../assets/cover_celestial.png';
import API from '../api';

const getBookCover = (book) => {
  const genre = (book.genre || '').toLowerCase();
  const title = (book.title || '').toLowerCase();
  if (genre.includes('fantasy') || genre.includes('sci-fi') || title.includes('celestial') || title.includes('star') || title.includes('magic'))
    return coverCelestial;
  if (genre.includes('romance') || genre.includes('classic') || title.includes('love') || title.includes('heart'))
    return coverFloral;
  const hash = book.title ? book.title.charCodeAt(0) % 3 : 0;
  return hash === 1 ? coverFloral : hash === 2 ? coverCelestial : coverClassic;
};

const Dashboard = () => {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [books, setBooks]           = useState([]);
  const [progresses, setProgresses] = useState([]);
  const [vocabCount, setVocabCount] = useState(0);
  const [streak, setStreak]         = useState(0);
  const [badges, setBadges]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null); // bookId awaiting confirm

  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    if (user && token) fetchData();
  }, [user, token]);

  const fetchData = async () => {
    try {
      const [bRes, vRes, meRes, pRes] = await Promise.all([
        axios.get(`${API}/api/books`, authHeader),
        axios.get(`${API}/api/vocabulary`, authHeader),
        axios.get(`${API}/api/auth/me`, authHeader),
        axios.get(`${API}/api/progress`, authHeader),
      ]);
      setBooks(bRes.data);
      setProgresses(pRes.data);
      setVocabCount(vRes.data.length);
      setStreak(meRes.data.streaks?.current || 0);
      setBadges(meRes.data.badges || []);
    } catch { toast('Failed to load dashboard', 'error'); }
    finally { setLoading(false); }
  };

  // Progress lookup by bookId
  const getProgress = (bookId) => progresses.find((p) => p.bookId?.toString() === bookId?.toString());

  const handleDeleteBook = async (bookId) => {
    try {
      await axios.delete(`${API}/api/books/${bookId}`, authHeader);
      setBooks((prev) => prev.filter((b) => b._id !== bookId));
      setConfirmDelete(null);
      toast('Book removed from your library', 'success');
    } catch { toast('Failed to delete book', 'error'); }
  };

  const handleToggleComplete = async (bookId, e) => {
    e.stopPropagation();
    try {
      const res = await axios.put(`${API}/api/progress/${bookId}/complete`, {}, authHeader);
      setProgresses((prev) => prev.map((p) => p.bookId?.toString() === bookId ? { ...p, isCompleted: res.data.isCompleted } : p));
      toast(res.data.isCompleted ? '🎉 Marked as completed!' : 'Marked as reading', 'success');
    } catch { toast('Failed to update', 'error'); }
  };

  const filteredBooks = books.filter((b) =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    (b.author || '').toLowerCase().includes(search.toLowerCase()) ||
    (b.genre || '').toLowerCase().includes(search.toLowerCase())
  );

  // Find last-read book for "Continue Reading"
  const lastRead = progresses.length > 0
    ? [...progresses].sort((a, b) => new Date(b.lastReadAt) - new Date(a.lastReadAt))[0]
    : null;
  const lastReadBook = lastRead ? books.find((b) => b._id === lastRead.bookId?.toString()) : books[0];

  if (!user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <AppLayout>
      <div className="p-8 max-w-6xl mx-auto space-y-8">

        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-[var(--color-tea-950)] via-[var(--color-tea-900)] to-[var(--color-tea-800)] text-white rounded-3xl p-8 relative overflow-hidden shadow-2xl border border-[var(--color-tea-700)]/40 glow-amber"
        >
          <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-[var(--color-amber-gold)]/40 rounded-tl-md" />
          <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-[var(--color-amber-gold)]/40 rounded-tr-md" />
          <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-[var(--color-amber-gold)]/40 rounded-bl-md" />
          <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-[var(--color-amber-gold)]/40 rounded-br-md" />

          <div className="relative z-10 max-w-lg space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-amber-gold)]/10 text-[var(--color-amber-gold)] font-bold text-[10px] uppercase tracking-wider border border-[var(--color-amber-gold)]/20">
              <Zap size={10} className="animate-bounce" /> Cozy Reading Lounge
            </div>
            <h2 className="text-4xl font-extrabold font-serif tracking-wide leading-tight">
              Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'},{' '}
              <span className="text-[var(--color-amber-gold)]">{user.name.split(' ')[0]}</span>! ☕
            </h2>
            <p className="text-[var(--color-tea-200)] text-base font-medium leading-relaxed">
              {books.length > 0
                ? `You have ${books.length} volume${books.length > 1 ? 's' : ''} on your study table. Let's continue your journey.`
                : "Welcome to NovelTea! Upload your first PDF to begin."}
            </p>
            <div className="flex flex-wrap gap-3.5 pt-2">
              {lastReadBook ? (
                <button
                  onClick={() => navigate(`/reader/${lastReadBook._id}`)}
                  className="px-6 py-3 bg-[var(--color-amber-gold)] hover:bg-[#e4be42] text-[var(--color-tea-950)] font-extrabold rounded-xl shadow-md transition-all border-b-2 border-[#a47b1e] text-sm"
                >
                  Continue Reading
                </button>
              ) : (
                <button
                  onClick={() => navigate('/upload')}
                  className="px-6 py-3 bg-[var(--color-amber-gold)] hover:bg-[#e4be42] text-[var(--color-tea-950)] font-extrabold rounded-xl shadow-md transition-all border-b-2 border-[#a47b1e] text-sm"
                >
                  Upload First Book
                </button>
              )}
              <button
                onClick={() => navigate('/mood')}
                className="px-6 py-3 bg-white/10 hover:bg-white/15 text-white font-bold rounded-xl border border-white/20 hover:border-white/30 transition-all text-sm"
              >
                Mood Recommendation ✨
              </button>
            </div>
          </div>
          <div className="absolute right-6 bottom-0 opacity-15 pointer-events-none text-[var(--color-amber-gold)]">
            <Book size={240} />
          </div>
        </motion.div>

        {/* Quick Stats */}
        {loading ? <StatCardSkeleton count={4} /> : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { label: 'Books Uploaded',  value: books.length,  icon: Book,     action: '/upload',     color: 'text-[var(--color-tea-600)]' },
              { label: 'Vocabulary Words',value: vocabCount,    icon: BookMarked,action: '/vocabulary', color: 'text-[var(--color-amber-gold)]' },
              { label: 'Reading Streak',  value: `${streak}d 🔥`,icon: Flame,   action: '/goals',      color: 'text-orange-500' },
              { label: 'Badges Earned',   value: badges.length, icon: Award,    action: '/goals',      color: 'text-[var(--color-tea-600)]' },
            ].map(({ label, value, icon: Icon, action, color }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                onClick={() => navigate(action)}
                className="vintage-glass rounded-2xl p-6 vintage-shadow hover:translate-y-[-4px] hover:border-[var(--color-tea-400)] transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-3">
                  <Icon size={20} className={`${color} group-hover:scale-110 transition-transform`} />
                  <span className="text-[10px] font-bold text-[var(--color-tea-500)] uppercase tracking-wider">Logs</span>
                </div>
                <p className="text-3xl font-extrabold text-[var(--color-tea-950)] font-serif">{value}</p>
                <p className="text-xs font-bold text-[var(--color-tea-600)] mt-1.5">{label}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Quick Action Tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'My Journal', icon: BookText, to: '/journal', desc: 'Reading reflections',  color: 'bg-[var(--color-tea-100)]' },
            { label: 'Goals',      icon: Target,   to: '/goals',   desc: 'Targets & badges',     color: 'bg-amber-50' },
            { label: 'Mood Pick',  icon: Zap,      to: '/mood',    desc: 'Books for your mood',  color: 'bg-purple-50' },
            { label: 'Analytics',  icon: BarChart3, to: '/analytics', desc: 'Reading insights',  color: 'bg-green-50' },
          ].map(({ label, icon: Icon, to, desc, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              onClick={() => navigate(to)}
              className={`${color} rounded-2xl p-5 cursor-pointer hover:shadow-md transition-all hover:translate-y-[-2px] border border-transparent hover:border-[var(--color-tea-200)]`}
            >
              <Icon size={22} className="text-[var(--color-tea-700)] mb-2" />
              <p className="font-extrabold text-[var(--color-tea-950)] text-sm">{label}</p>
              <p className="text-xs text-[var(--color-tea-600)] mt-0.5">{desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Bookshelf */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="vintage-glass rounded-3xl p-8 border border-[var(--color-tea-200)] vintage-shadow-premium"
        >
          {/* Header row */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b-2 border-[var(--color-tea-200)] pb-5">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-6 rounded bg-[var(--color-tea-800)]" />
              <h3 className="text-2xl font-extrabold text-[var(--color-tea-950)] font-serif tracking-wide">Personal Mahogany Study</h3>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Search */}
              <div className="relative flex-1 sm:w-52">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-tea-400)]" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search books..."
                  className="w-full pl-8 pr-3 py-2 text-sm rounded-xl border border-[var(--color-tea-200)] bg-white outline-none focus:ring-2 focus:ring-[var(--color-tea-300)]"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-tea-400)]">
                    <X size={13} />
                  </button>
                )}
              </div>
              <button
                onClick={() => navigate('/upload')}
                className="flex items-center gap-1.5 text-sm font-extrabold text-[var(--color-tea-800)] hover:text-[var(--color-tea-950)] bg-[var(--color-tea-100)] border border-[var(--color-tea-200)] px-4 py-2 rounded-xl transition-all shadow-sm shrink-0"
              >
                <Upload size={14} /> Upload
              </button>
            </div>
          </div>

          {loading ? <BookshelfSkeleton /> : (
            <>
              {filteredBooks.length === 0 && search && (
                <p className="text-center py-10 text-[var(--color-tea-500)]">No books match "{search}"</p>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-6 pt-2">
                {filteredBooks.map((book) => {
                  const prog = getProgress(book._id);
                  const pct = prog?.totalPages > 0 ? Math.round((prog.currentPage / prog.totalPages) * 100) : 0;
                  const isCompleted = prog?.isCompleted;

                  return (
                    <motion.div
                      key={book._id}
                      className="group cursor-pointer text-center relative"
                      whileHover={{ y: -6 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <div
                        onClick={() => navigate(`/reader/${book._id}`)}
                        className="aspect-[2/3] relative rounded-xl mb-3 border border-[var(--color-tea-900)]/30 group-hover:border-[var(--color-tea-800)] overflow-hidden shadow-md group-hover:shadow-2xl bg-[var(--color-tea-950)] transition-shadow"
                      >
                        <img
                          src={getBookCover(book)}
                          alt={book.title}
                          className="w-full h-full object-cover filter brightness-90 contrast-110 group-hover:brightness-100 transition-all"
                        />
                        <div className="absolute left-0 top-0 w-3 h-full bg-gradient-to-r from-black/40 via-black/10 to-transparent" />
                        <div className="absolute inset-x-2 bottom-3 bg-black/75 backdrop-blur-xs py-1 px-1.5 rounded border border-white/15">
                          <p className="text-[9px] font-extrabold text-[var(--color-amber-gold)] uppercase tracking-widest truncate">{book.genre || 'General'}</p>
                        </div>
                        {/* Completed badge */}
                        {isCompleted && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                            <CheckCircle size={14} className="text-white" />
                          </div>
                        )}
                        {/* Progress bar */}
                        {pct > 0 && !isCompleted && (
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
                            <div className="h-full bg-[var(--color-amber-gold)] transition-all" style={{ width: `${pct}%` }} />
                          </div>
                        )}
                      </div>

                      <h4 className="font-extrabold text-[var(--color-tea-950)] text-xs font-serif leading-tight truncate px-1">{book.title}</h4>
                      <p className="text-[10px] font-bold text-[var(--color-tea-500)] mt-0.5 truncate px-1">{book.author || 'Unknown'}</p>

                      {/* Action buttons — appear on hover */}
                      <div className="flex justify-center gap-1.5 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => handleToggleComplete(book._id, e)}
                          title={isCompleted ? 'Mark as reading' : 'Mark as completed'}
                          className="p-1.5 rounded-lg bg-white border border-[var(--color-tea-200)] text-[var(--color-tea-600)] hover:text-green-600 hover:border-green-300 transition-colors shadow-sm"
                        >
                          {isCompleted ? <Circle size={12} /> : <CheckCircle size={12} />}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setConfirmDelete(book._id); }}
                          title="Delete book"
                          className="p-1.5 rounded-lg bg-white border border-[var(--color-tea-200)] text-[var(--color-tea-400)] hover:text-red-500 hover:border-red-300 transition-colors shadow-sm"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}

                {/* Add New Volume */}
                {!search && (
                  <div onClick={() => navigate('/upload')} className="group cursor-pointer text-center">
                    <div className="aspect-[2/3] border-2 border-dashed border-[var(--color-tea-300)] rounded-xl mb-3 flex flex-col items-center justify-center text-[var(--color-tea-500)] group-hover:bg-[var(--color-tea-100)]/70 group-hover:border-[var(--color-tea-600)] transition-all shadow-sm">
                      <div className="w-10 h-10 rounded-full bg-[var(--color-tea-100)] flex items-center justify-center mb-2 group-hover:scale-110 group-hover:bg-[var(--color-tea-200)] transition-all shadow-inner border border-[var(--color-tea-200)] text-[var(--color-tea-800)] font-extrabold">
                        <span className="text-xl leading-none">+</span>
                      </div>
                      <span className="text-xs font-extrabold">New Volume</span>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setConfirmDelete(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl p-7 max-w-sm w-full border border-[var(--color-tea-100)]"
            >
              <div className="text-center mb-5">
                <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Trash2 size={24} className="text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-[var(--color-tea-950)]">Remove this book?</h3>
                <p className="text-sm text-[var(--color-tea-600)] mt-1">
                  This will permanently delete the book and all its reading progress, bookmarks, and highlights.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 py-2.5 rounded-xl border border-[var(--color-tea-200)] text-sm font-bold text-[var(--color-tea-700)] hover:bg-[var(--color-tea-50)]"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteBook(confirmDelete)}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 shadow-md"
                >
                  Yes, Remove
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
};

export default Dashboard;
