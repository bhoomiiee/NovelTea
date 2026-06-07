import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import AppLayout from '../components/AppLayout';
import { useToast } from '../context/ToastContext';
import { motion } from 'framer-motion';
import { BarChart3, BookOpen, Zap, BookMarked, TrendingUp } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, PieChart, Pie, Legend,
} from 'recharts';
import { StatCardSkeleton } from '../components/Skeleton';
import API from '../api';

const GENRE_COLORS = ['#c56e4c', '#d48b67', '#e8c6ae', '#a4563e', '#854735', '#6b3b2d'];

const StatCard = ({ icon: Icon, label, value, sub }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="bg-white rounded-2xl border border-[var(--color-tea-100)] p-6 shadow-sm hover:shadow-md transition-shadow"
  >
    <div className="flex items-center gap-3 mb-3">
      <div className="w-10 h-10 rounded-xl bg-[var(--color-tea-100)] text-[var(--color-tea-700)] flex items-center justify-center">
        <Icon size={20} />
      </div>
      <span className="text-sm font-medium text-[var(--color-tea-600)]">{label}</span>
    </div>
    <p className="text-4xl font-extrabold text-[var(--color-tea-950)]">{value}</p>
    {sub && <p className="text-xs text-[var(--color-tea-500)] mt-1">{sub}</p>}
  </motion.div>
);

const Analytics = () => {
  const { token } = useContext(AuthContext);
  const { toast } = useToast();
  const [books, setBooks] = useState([]);
  const [progresses, setProgresses] = useState([]);
  const [vocabCount, setVocabCount] = useState(0);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const auth = { headers: { Authorization: `Bearer ${token}` } };
        const [booksRes, vocabRes, progressRes, meRes] = await Promise.all([
          axios.get(`${API}/api/books`, auth),
          axios.get(`${API}/api/vocabulary`, auth),
          axios.get(`${API}/api/progress`, auth),
          axios.get(`${API}/api/auth/me`, auth),
        ]);
        setBooks(booksRes.data);
        setVocabCount(vocabRes.data.length);
        setUserData(meRes.data);

        // Enrich progress with book titles
        const bookMap = Object.fromEntries(booksRes.data.map((b) => [b._id, b]));
        const enriched = progressRes.data.map((p) => ({
          ...p,
          bookTitle: bookMap[p.bookId]?.title || 'Unknown',
          genre: bookMap[p.bookId]?.genre || 'General',
        }));
        setProgresses(enriched);
      } catch (err) {
        toast('Failed to load analytics', 'error');
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchAll();
  }, [token]);

  // Derived stats
  const totalPages = progresses.reduce((acc, p) => acc + (p.currentPage || 0), 0);
  const completed = progresses.filter(p => p.isCompleted).length;
  const totalHighlights = progresses.reduce((acc, p) => acc + (p.highlights?.length || 0), 0);
  const totalBookmarks = progresses.reduce((acc, p) => acc + (p.bookmarks?.length || 0), 0);

  // Bar chart data — pages read per book
  const barData = progresses.map(p => ({
    name: p.bookTitle?.length > 12 ? p.bookTitle.slice(0, 12) + '…' : p.bookTitle,
    pages: p.currentPage || 0,
    total: p.totalPages || 0,
  }));

  // Genre pie
  const genreCounts = books.reduce((acc, b) => {
    acc[b.genre || 'General'] = (acc[b.genre || 'General'] || 0) + 1;
    return acc;
  }, {});
  const pieData = Object.entries(genreCounts).map(([name, value]) => ({ name, value }));

  return (
    <AppLayout>
      <div className="p-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-[var(--color-tea-950)]">Reading Analytics</h1>
          <p className="text-[var(--color-tea-600)] mt-1">Your reading journey at a glance</p>
        </div>

        {loading ? (
          <div className="space-y-6">
            <StatCardSkeleton count={4} />
            <StatCardSkeleton count={4} />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={BookOpen}   label="Books Uploaded"  value={books.length} />
              <StatCard icon={TrendingUp} label="Pages Read"      value={totalPages} />
              <StatCard icon={Zap}        label="Completed"       value={completed} sub={`of ${books.length}`} />
              <StatCard icon={BookMarked} label="Words Learned"   value={vocabCount} />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={BarChart3}  label="Highlights Saved" value={totalHighlights} />
              <StatCard icon={BookMarked} label="Bookmarks"         value={totalBookmarks} />
              <StatCard icon={Zap}        label="Current Streak"   value={`${userData?.streaks?.current || 0}d 🔥`} />
              <StatCard icon={TrendingUp} label="Longest Streak"   value={`${userData?.streaks?.longest || 0}d ⚡`} />
            </div>

            {/* Pages per Book Bar Chart */}
            {barData.length > 0 && (
              <div className="bg-white rounded-3xl border border-[var(--color-tea-100)] p-7 shadow-sm">
                <h2 className="text-lg font-bold text-[var(--color-tea-950)] mb-6">Pages Read per Book</h2>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={barData} barCategoryGap="30%">
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#854735' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#a4563e' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: 12, border: '1px solid #f1dfcf', boxShadow: 'none' }}
                      cursor={{ fill: '#f8efe7' }}
                    />
                    <Bar dataKey="pages" fill="#c56e4c" radius={[8, 8, 0, 0]} name="Pages Read" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Genre Pie */}
            {pieData.length > 0 && (
              <div className="bg-white rounded-3xl border border-[var(--color-tea-100)] p-7 shadow-sm">
                <h2 className="text-lg font-bold text-[var(--color-tea-950)] mb-6">Books by Genre</h2>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={4} dataKey="value">
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={GENRE_COLORS[i % GENRE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #f1dfcf' }} />
                    <Legend iconType="circle" iconSize={10} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {books.length === 0 && (
              <div className="text-center py-16 text-[var(--color-tea-400)]">
                <BarChart3 size={48} className="mx-auto mb-4 opacity-30" />
                <p className="font-medium">Upload some books to see your analytics!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Analytics;
