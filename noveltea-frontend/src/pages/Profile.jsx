import { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import AppLayout from '../components/AppLayout';
import { useToast } from '../context/ToastContext';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Save, Award, BookOpen, Flame, Target, Edit3, Check } from 'lucide-react';
import API from '../api';

const BADGE_INFO = {
  'First Book':   '📖', 'Streak 3': '🔥', 'Streak 7': '⚡',
  'Streak 30':    '🌟', 'Bookworm': '🐛', 'Scholar':  '🎓',
  'Vocab 10':     '📚', 'Vocab 50': '🏆', 'Quote Lover': '💬',
  'Journaler':    '✍️',
};

const AVATAR_COLORS = [
  '#8B5E3C','#6B7280','#7C3AED','#059669','#DC2626','#D97706','#0891B2','#BE185D',
];

const InputRow = ({ icon: Icon, label, ...props }) => (
  <div>
    <label className="block text-xs font-bold text-[var(--color-tea-700)] uppercase tracking-wider mb-1.5">{label}</label>
    <div className="relative">
      <Icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-tea-400)]" />
      <input
        className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--color-tea-200)] bg-[var(--color-tea-50)] outline-none focus:ring-2 focus:ring-[var(--color-tea-400)] text-sm text-[var(--color-tea-900)] placeholder:text-[var(--color-tea-400)]"
        {...props}
      />
    </div>
  </div>
);

const Profile = () => {
  const { user, token, login } = useContext(AuthContext);
  const { toast } = useToast();

  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  // Edit profile
  const [nameVal, setNameVal] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [savingName, setSavingName] = useState(false);

  // Change password
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [savingPw, setSavingPw] = useState(false);

  // Avatar color picker
  const [avatarColor, setAvatarColor] = useState('#8B5E3C');

  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    if (!token) return;
    const fetch = async () => {
      try {
        const [meRes, booksRes, vocabRes, progressRes, journalRes] = await Promise.all([
          axios.get(`${API}/api/auth/me`, authHeader),
          axios.get(`${API}/api/books`, authHeader),
          axios.get(`${API}/api/vocabulary`, authHeader),
          axios.get(`${API}/api/progress`, authHeader),
          axios.get(`${API}/api/journal`, authHeader),
        ]);
        setUserData(meRes.data);
        setNameVal(meRes.data.name);
        setAvatarColor(meRes.data.avatarColor || '#8B5E3C');
        const completed = progressRes.data.filter((p) => p.isCompleted).length;
        const quotes = progressRes.data.reduce((a, p) => a + (p.highlights?.length || 0), 0);
        setStats({
          books: booksRes.data.length,
          completed,
          vocab: vocabRes.data.length,
          journal: journalRes.data.length,
          quotes,
          streak: meRes.data.streaks?.current || 0,
          longest: meRes.data.streaks?.longest || 0,
          badges: meRes.data.badges || [],
          goals: meRes.data.readingGoals,
        });
      } catch { toast('Failed to load profile', 'error'); }
      finally { setLoading(false); }
    };
    fetch();
  }, [token]);

  const handleSaveName = async () => {
    if (!nameVal.trim() || nameVal === userData?.name) { setEditingName(false); return; }
    setSavingName(true);
    try {
      await axios.put(`${API}/api/auth/profile`, { name: nameVal.trim() }, authHeader);
      setUserData((prev) => ({ ...prev, name: nameVal.trim() }));
      toast('Name updated!', 'success');
      setEditingName(false);
    } catch { toast('Failed to update name', 'error'); }
    setSavingName(false);
  };

  const handleSaveAvatar = async (color) => {
    const previous = avatarColor;
    setAvatarColor(color); // optimistic
    try {
      await axios.put(`${API}/api/auth/profile`, { avatarColor: color }, authHeader);
      toast('Avatar updated!', 'success');
    } catch {
      setAvatarColor(previous); // revert on failure
      toast('Failed to update avatar', 'error');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.next !== pwForm.confirm) { toast('Passwords do not match', 'error'); return; }
    if (pwForm.next.length < 6) { toast('Password must be at least 6 characters', 'error'); return; }
    setSavingPw(true);
    try {
      await axios.put(`${API}/api/auth/password`, { currentPassword: pwForm.current, newPassword: pwForm.next }, authHeader);
      toast('Password changed successfully!', 'success');
      setPwForm({ current: '', next: '', confirm: '' });
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to change password', 'error');
    }
    setSavingPw(false);
  };

  if (loading) return (
    <AppLayout>
      <div className="p-8 space-y-6 max-w-3xl mx-auto animate-pulse">
        {[200, 160, 180].map((h, i) => (
          <div key={i} className="bg-[var(--color-tea-100)] rounded-3xl" style={{ height: h }} />
        ))}
      </div>
    </AppLayout>
  );

  const initials = (userData?.name || 'U').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <AppLayout>
      <div className="p-8 max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--color-tea-950)]">My Profile</h1>
          <p className="text-[var(--color-tea-600)] mt-1">Manage your account and view your reading identity</p>
        </div>

        {/* ── Avatar + Name card ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-[var(--color-tea-100)] p-7 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="shrink-0 flex flex-col items-center gap-3">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-extrabold shadow-lg border-4 border-white"
                style={{ background: avatarColor }}
              >
                {initials}
              </div>
              {/* Color picker */}
              <div className="flex gap-1.5 flex-wrap justify-center">
                {AVATAR_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => handleSaveAvatar(c)}
                    className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
                    style={{ background: c, borderColor: avatarColor === c ? '#000' : 'transparent' }}
                    title={c}
                  />
                ))}
              </div>
            </div>

            {/* Name + email */}
            <div className="flex-1 w-full">
              <div className="mb-4">
                <label className="block text-xs font-bold text-[var(--color-tea-700)] uppercase tracking-wider mb-1.5">Display Name</label>
                <div className="flex items-center gap-2">
                  {editingName ? (
                    <>
                      <input
                        value={nameVal}
                        onChange={(e) => setNameVal(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--color-tea-300)] bg-[var(--color-tea-50)] outline-none focus:ring-2 focus:ring-[var(--color-tea-400)] text-sm font-bold"
                        autoFocus
                      />
                      <button
                        onClick={handleSaveName}
                        disabled={savingName}
                        className="p-2.5 rounded-xl bg-[var(--color-tea-800)] text-white hover:bg-[var(--color-tea-900)] transition-colors"
                      >
                        <Check size={16} />
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="flex-1 text-lg font-extrabold text-[var(--color-tea-950)]">{userData?.name}</p>
                      <button
                        onClick={() => setEditingName(true)}
                        className="p-2 rounded-xl text-[var(--color-tea-500)] hover:text-[var(--color-tea-800)] hover:bg-[var(--color-tea-50)] transition-colors"
                      >
                        <Edit3 size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--color-tea-700)] uppercase tracking-wider mb-1.5">Email</label>
                <p className="text-sm text-[var(--color-tea-600)] bg-[var(--color-tea-50)] border border-[var(--color-tea-100)] px-4 py-2.5 rounded-xl">
                  {userData?.email}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Stats grid ────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-3xl border border-[var(--color-tea-100)] p-7 shadow-sm"
        >
          <h2 className="text-lg font-bold text-[var(--color-tea-950)] mb-5 flex items-center gap-2">
            <BookOpen size={20} className="text-[var(--color-tea-600)]" /> Reading Stats
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: 'Books Uploaded',   value: stats.books,     icon: '📚' },
              { label: 'Books Completed',  value: stats.completed, icon: '✅' },
              { label: 'Vocab Words',      value: stats.vocab,     icon: '📖' },
              { label: 'Quotes Saved',     value: stats.quotes,    icon: '💬' },
              { label: 'Journal Entries',  value: stats.journal,   icon: '✍️' },
              { label: 'Current Streak',   value: `${stats.streak}d 🔥`, icon: null },
            ].map(({ label, value, icon }) => (
              <div key={label} className="bg-[var(--color-tea-50)] rounded-2xl px-5 py-4 border border-[var(--color-tea-100)]">
                {icon && <span className="text-xl mb-1 block">{icon}</span>}
                <p className="text-2xl font-extrabold text-[var(--color-tea-950)]">{value}</p>
                <p className="text-xs text-[var(--color-tea-600)] mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Badges ────────────────────────────────────────────── */}
        {stats.badges?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl border border-[var(--color-tea-100)] p-7 shadow-sm"
          >
            <h2 className="text-lg font-bold text-[var(--color-tea-950)] mb-5 flex items-center gap-2">
              <Award size={20} className="text-[var(--color-tea-600)]" /> Earned Badges
            </h2>
            <div className="flex flex-wrap gap-3">
              {stats.badges.map((badge) => (
                <div key={badge} className="flex items-center gap-2 bg-[#fdf9ee] border-2 border-[var(--color-amber-gold)] px-4 py-2 rounded-full shadow-sm">
                  <span className="text-lg">{BADGE_INFO[badge] || '🏅'}</span>
                  <span className="text-sm font-bold text-[var(--color-tea-900)]">{badge}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Change Password ───────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-3xl border border-[var(--color-tea-100)] p-7 shadow-sm"
        >
          <h2 className="text-lg font-bold text-[var(--color-tea-950)] mb-5 flex items-center gap-2">
            <Lock size={20} className="text-[var(--color-tea-600)]" /> Change Password
          </h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <InputRow icon={Lock} label="Current Password" type="password" placeholder="••••••••" value={pwForm.current} onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })} />
            <InputRow icon={Lock} label="New Password" type="password" placeholder="Min. 6 characters" value={pwForm.next} onChange={(e) => setPwForm({ ...pwForm, next: e.target.value })} />
            <InputRow icon={Lock} label="Confirm New Password" type="password" placeholder="Repeat new password" value={pwForm.confirm} onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })} />
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={savingPw || !pwForm.current || !pwForm.next || !pwForm.confirm}
                className="flex items-center gap-2 px-6 py-2.5 bg-[var(--color-tea-800)] text-white rounded-xl font-bold text-sm shadow-md hover:bg-[var(--color-tea-900)] disabled:opacity-40 transition-colors"
              >
                <Save size={15} />
                {savingPw ? 'Saving...' : 'Update Password'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default Profile;
