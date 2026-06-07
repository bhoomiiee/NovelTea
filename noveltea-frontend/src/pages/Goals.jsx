import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import AppLayout from '../components/AppLayout';
import { useToast } from '../context/ToastContext';
import { motion } from 'framer-motion';
import { Target, BookOpen, Zap, Calendar, TrendingUp, Save, Award } from 'lucide-react';
import API from '../api';

const BADGE_INFO = {
  'First Book': { emoji: '📖', desc: 'Uploaded your first book' },
  'Streak 3':   { emoji: '🔥', desc: '3-day reading streak' },
  'Streak 7':   { emoji: '⚡', desc: '7-day reading streak' },
  'Streak 30':  { emoji: '🌟', desc: '30-day reading streak' },
  'Bookworm':   { emoji: '🐛', desc: 'Read 5 books' },
  'Scholar':    { emoji: '🎓', desc: 'Read 10 books' },
  'Vocab 10':   { emoji: '📚', desc: 'Saved 10 vocabulary words' },
  'Vocab 50':   { emoji: '🏆', desc: 'Saved 50 vocabulary words' },
  'Quote Lover':{ emoji: '💬', desc: 'Saved 10 quotes' },
  'Journaler':  { emoji: '✍️', desc: 'Wrote 5 journal entries' },
};

const GoalBar = ({ label, value, max, unit, color }) => {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-sm font-bold text-[var(--color-tea-800)]">{label}</span>
        <span className="text-xs font-bold text-[var(--color-tea-600)]">
          {value} / {max} {unit}
        </span>
      </div>
      <div className="w-full h-3 bg-[var(--color-tea-100)] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
      <p className="text-right text-[10px] text-[var(--color-tea-500)] mt-0.5">{pct}% complete</p>
    </div>
  );
};

const Goals = () => {
  const { token, user } = useContext(AuthContext);
  const { toast } = useToast();
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState({ booksCompleted: 0, vocabCount: 0, journalCount: 0, quotesCount: 0 });
  const [goals, setGoals] = useState({ yearly: 12, monthly: 1, dailyPages: 20 });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    if (!token) return;
    const fetchAll = async () => {
      try {
        const [meRes, booksRes, vocabRes, journalRes, progressRes] = await Promise.all([
          axios.get(`${API}/api/auth/me`, authHeader),
          axios.get(`${API}/api/books`, authHeader),
          axios.get(`${API}/api/vocabulary`, authHeader),
          axios.get(`${API}/api/journal`, authHeader),
          axios.get(`${API}/api/progress`, authHeader),
        ]);

        setUserData(meRes.data);
        setGoals({
          yearly: meRes.data.readingGoals?.yearly ?? 12,
          monthly: meRes.data.readingGoals?.monthly ?? 1,
          dailyPages: meRes.data.readingGoals?.dailyPages ?? 20,
        });

        const completed = progressRes.data.filter((p) => p.isCompleted).length;
        const totalHighlights = progressRes.data.reduce((a, p) => a + (p.highlights?.length || 0), 0);
        const currentStreak = meRes.data.streaks?.current || 0;
        const vocabCount = vocabRes.data.length;
        const journalCount = journalRes.data.length;

        // Auto-award badges
        const existingBadges = meRes.data.badges || [];
        const toAward = [];
        if (booksRes.data.length >= 1 && !existingBadges.includes('First Book')) toAward.push('First Book');
        if (currentStreak >= 3 && !existingBadges.includes('Streak 3')) toAward.push('Streak 3');
        if (currentStreak >= 7 && !existingBadges.includes('Streak 7')) toAward.push('Streak 7');
        if (currentStreak >= 30 && !existingBadges.includes('Streak 30')) toAward.push('Streak 30');
        if (completed >= 5 && !existingBadges.includes('Bookworm')) toAward.push('Bookworm');
        if (completed >= 10 && !existingBadges.includes('Scholar')) toAward.push('Scholar');
        if (vocabCount >= 10 && !existingBadges.includes('Vocab 10')) toAward.push('Vocab 10');
        if (vocabCount >= 50 && !existingBadges.includes('Vocab 50')) toAward.push('Vocab 50');
        if (totalHighlights >= 10 && !existingBadges.includes('Quote Lover')) toAward.push('Quote Lover');
        if (journalCount >= 5 && !existingBadges.includes('Journaler')) toAward.push('Journaler');

        let latestBadges = [...existingBadges];
        for (const badge of toAward) {
          try {
            const r = await axios.post(`${API}/api/auth/badge`, { badge }, authHeader);
            latestBadges = r.data.badges;
          } catch {}
        }

        setStats({
          booksCompleted: completed,
          booksTotal: booksRes.data.length,
          vocabCount,
          journalCount,
          quotesCount: totalHighlights,
          currentStreak,
          longestStreak: meRes.data.streaks?.longest || 0,
          badges: latestBadges,
        });
      } catch (err) {
        toast('Failed to load goals. Please try again.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [token]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await axios.put(`${API}/api/auth/goals`, goals, authHeader);
      setUserData(res.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      toast('Goals saved!', 'success');
    } catch (err) {
      toast('Failed to save goals', 'error');
    } finally {
      setSaving(false);
    }
  };

  const currentMonth = new Date().getMonth(); // 0-indexed

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen text-[var(--color-tea-500)]">
          Loading your goals...
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-8 max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--color-tea-950)]">Reading Goals</h1>
          <p className="text-[var(--color-tea-600)] mt-1">
            Set targets, track progress, earn badges.
          </p>
        </div>

        {/* Streak Banner */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[var(--color-tea-950)] to-[var(--color-tea-800)] text-white rounded-3xl p-7 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl"
        >
          <div>
            <p className="text-sm font-bold text-[var(--color-tea-300)] uppercase tracking-wider mb-1">
              Current Streak
            </p>
            <div className="flex items-end gap-2">
              <span className="text-6xl font-extrabold text-[var(--color-amber-gold)]">
                {stats.currentStreak}
              </span>
              <span className="text-2xl font-bold text-[var(--color-tea-200)] mb-1">days 🔥</span>
            </div>
          </div>
          <div className="flex flex-col items-center sm:items-end gap-1">
            <span className="text-xs text-[var(--color-tea-400)] font-medium">Longest Streak</span>
            <span className="text-4xl font-extrabold text-white">{stats.longestStreak}</span>
            <span className="text-xs text-[var(--color-tea-400)]">days ⚡</span>
          </div>
        </motion.div>

        {/* Goal Settings */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl border border-[var(--color-tea-100)] p-7 shadow-sm"
        >
          <h2 className="text-xl font-bold text-[var(--color-tea-950)] mb-6 flex items-center gap-2">
            <Target size={22} className="text-[var(--color-tea-700)]" /> Set Your Targets
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { key: 'yearly', label: 'Books This Year', icon: Calendar, min: 1, max: 100, unit: 'books' },
              { key: 'monthly', label: 'Books This Month', icon: BookOpen, min: 1, max: 20, unit: 'books' },
              { key: 'dailyPages', label: 'Daily Pages Goal', icon: TrendingUp, min: 1, max: 200, unit: 'pages' },
            ].map(({ key, label, icon: Icon, min, max, unit }) => (
              <div key={key}>
                <label className="flex items-center gap-2 text-sm font-bold text-[var(--color-tea-800)] mb-2">
                  <Icon size={16} className="text-[var(--color-tea-600)]" /> {label}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={min}
                    max={max}
                    value={goals[key]}
                    onChange={(e) => setGoals({ ...goals, [key]: parseInt(e.target.value) || min })}
                    className="w-24 px-3 py-2.5 rounded-xl border border-[var(--color-tea-200)] bg-[var(--color-tea-50)] outline-none focus:ring-2 focus:ring-[var(--color-tea-400)] font-bold text-lg text-center text-[var(--color-tea-950)]"
                  />
                  <span className="text-sm text-[var(--color-tea-500)]">{unit}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-[var(--color-tea-800)] text-white rounded-xl font-bold text-sm shadow-md hover:bg-[var(--color-tea-900)] transition-colors"
            >
              <Save size={16} />
              {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Goals'}
            </button>
          </div>
        </motion.div>

        {/* Progress Bars */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl border border-[var(--color-tea-100)] p-7 shadow-sm space-y-6"
        >
          <h2 className="text-xl font-bold text-[var(--color-tea-950)] flex items-center gap-2">
            <Zap size={22} className="text-[var(--color-tea-700)]" /> Progress Tracker
          </h2>
          <GoalBar
            label="Yearly Reading Goal"
            value={stats.booksCompleted}
            max={goals.yearly}
            unit="books"
            color="bg-[var(--color-tea-700)]"
          />
          <GoalBar
            label="Vocabulary Words Saved"
            value={stats.vocabCount}
            max={50}
            unit="words"
            color="bg-amber-500"
          />
          <GoalBar
            label="Journal Entries Written"
            value={stats.journalCount}
            max={20}
            unit="entries"
            color="bg-[var(--color-tea-500)]"
          />
          <GoalBar
            label="Quotes Collected"
            value={stats.quotesCount}
            max={30}
            unit="quotes"
            color="bg-[var(--color-tea-400)]"
          />
          <GoalBar
            label="Reading Streak"
            value={stats.currentStreak}
            max={30}
            unit="days"
            color="bg-orange-500"
          />
        </motion.div>

        {/* Badges */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl border border-[var(--color-tea-100)] p-7 shadow-sm"
        >
          <h2 className="text-xl font-bold text-[var(--color-tea-950)] mb-6 flex items-center gap-2">
            <Award size={22} className="text-[var(--color-tea-700)]" /> Achievement Badges
          </h2>
          {stats.badges?.length === 0 ? (
            <p className="text-sm text-[var(--color-tea-500)] text-center py-6">
              Keep reading to earn your first badge! 🏅
            </p>
          ) : null}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Object.entries(BADGE_INFO).map(([name, info]) => {
              const earned = stats.badges?.includes(name);
              return (
                <motion.div
                  key={name}
                  whileHover={earned ? { scale: 1.05 } : {}}
                  className={`rounded-2xl border-2 p-4 text-center transition-all ${
                    earned
                      ? 'border-[var(--color-amber-gold)] bg-[#fdf9ee] shadow-md'
                      : 'border-[var(--color-tea-100)] bg-[var(--color-tea-50)] opacity-40 grayscale'
                  }`}
                >
                  <div className="text-4xl mb-2">{info.emoji}</div>
                  <p className="text-xs font-extrabold text-[var(--color-tea-950)]">{name}</p>
                  <p className="text-[10px] text-[var(--color-tea-500)] mt-0.5">{info.desc}</p>
                  {earned && (
                    <span className="inline-block mt-2 text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                      Earned ✓
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default Goals;
