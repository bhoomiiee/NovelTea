import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import AppLayout from '../components/AppLayout';
import { useToast } from '../context/ToastContext';
import { CardListSkeleton } from '../components/Skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Plus, Trash2, Edit3, X, Save, Calendar, Tag, Smile,
} from 'lucide-react';
import API from '../api';

const MOODS = [
  { label: 'Happy', emoji: '😊' },
  { label: 'Motivated', emoji: '🔥' },
  { label: 'Lonely', emoji: '😢' },
  { label: 'Curious', emoji: '🤔' },
  { label: 'Productive', emoji: '💼' },
  { label: 'Relaxed', emoji: '😴' },
  { label: 'Frustrated', emoji: '😤' },
  { label: 'Inspired', emoji: '🌟' },
];

const MOOD_MAP = Object.fromEntries(MOODS.map((m) => [m.label, m.emoji]));

const EMPTY_FORM = { title: '', content: '', mood: '', bookTitle: '', tags: '' };

const Journal = () => {
  const { token } = useContext(AuthContext);
  const { toast } = useToast();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null); // entry id being edited
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    if (token) fetchEntries();
  }, [token]);

  const fetchEntries = async () => {
    try {
      const res = await axios.get(`${API}/api/journal`, authHeader);
      setEntries(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (entry) => {
    setEditing(entry._id);
    setForm({
      title: entry.title,
      content: entry.content,
      mood: entry.mood || '',
      bookTitle: entry.bookTitle || '',
      tags: (entry.tags || []).join(', '),
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;
    setSubmitting(true);
    const payload = {
      title: form.title.trim(),
      content: form.content.trim(),
      mood: form.mood,
      bookTitle: form.bookTitle.trim(),
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    };
    try {
      if (editing) {
        const res = await axios.put(`${API}/api/journal/${editing}`, payload, authHeader);
        setEntries((prev) => prev.map((e) => (e._id === editing ? res.data : e)));
        toast('Entry updated!', 'success');
      } else {
        const res = await axios.post(`${API}/api/journal`, payload, authHeader);
        setEntries((prev) => [res.data, ...prev]);
        toast('Entry saved!', 'success');
      }
      setShowForm(false);
      setEditing(null);
      setForm(EMPTY_FORM);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this journal entry?')) return;
    try {
      await axios.delete(`${API}/api/journal/${id}`, authHeader);
      setEntries((prev) => prev.filter((e) => e._id !== id));
      toast('Entry deleted', 'info');
    } catch {
      toast('Failed to delete', 'error');
    }
  };

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <AppLayout>
      <div className="p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-[var(--color-tea-950)]">Reading Journal</h1>
            <p className="text-[var(--color-tea-600)] mt-1">
              {entries.length} {entries.length === 1 ? 'entry' : 'entries'} — your reading reflections
            </p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-tea-800)] text-white rounded-xl font-bold text-sm shadow-md hover:bg-[var(--color-tea-900)] transition-colors"
          >
            <Plus size={18} /> New Entry
          </button>
        </div>

        {/* Form Modal */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={(e) => e.target === e.currentTarget && setShowForm(false)}
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl border border-[var(--color-tea-100)] overflow-hidden"
              >
                <div className="flex justify-between items-center p-6 border-b border-[var(--color-tea-100)]">
                  <h2 className="text-xl font-bold text-[var(--color-tea-950)]">
                    {editing ? 'Edit Entry' : 'New Journal Entry'}
                  </h2>
                  <button
                    onClick={() => setShowForm(false)}
                    className="p-2 rounded-full hover:bg-[var(--color-tea-50)] text-[var(--color-tea-500)] transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
                  {/* Title */}
                  <div>
                    <label className="block text-xs font-bold text-[var(--color-tea-700)] uppercase tracking-wider mb-1.5">
                      Title *
                    </label>
                    <input
                      required
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="e.g. Reflections on Chapter 5..."
                      className="w-full px-4 py-3 rounded-xl border border-[var(--color-tea-200)] bg-[var(--color-tea-50)] outline-none focus:ring-2 focus:ring-[var(--color-tea-400)] text-sm"
                    />
                  </div>

                  {/* Book (optional) */}
                  <div>
                    <label className="block text-xs font-bold text-[var(--color-tea-700)] uppercase tracking-wider mb-1.5">
                      Book Title <span className="font-normal text-[var(--color-tea-500)]">(optional)</span>
                    </label>
                    <input
                      value={form.bookTitle}
                      onChange={(e) => setForm({ ...form, bookTitle: e.target.value })}
                      placeholder="e.g. Atomic Habits"
                      className="w-full px-4 py-3 rounded-xl border border-[var(--color-tea-200)] bg-[var(--color-tea-50)] outline-none focus:ring-2 focus:ring-[var(--color-tea-400)] text-sm"
                    />
                  </div>

                  {/* Mood */}
                  <div>
                    <label className="block text-xs font-bold text-[var(--color-tea-700)] uppercase tracking-wider mb-2">
                      Mood
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {MOODS.map((m) => (
                        <button
                          type="button"
                          key={m.label}
                          onClick={() => setForm({ ...form, mood: form.mood === m.label ? '' : m.label })}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-colors ${
                            form.mood === m.label
                              ? 'bg-[var(--color-tea-800)] text-white border-[var(--color-tea-800)]'
                              : 'bg-white text-[var(--color-tea-700)] border-[var(--color-tea-200)] hover:border-[var(--color-tea-400)]'
                          }`}
                        >
                          {m.emoji} {m.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Content */}
                  <div>
                    <label className="block text-xs font-bold text-[var(--color-tea-700)] uppercase tracking-wider mb-1.5">
                      Your Thoughts *
                    </label>
                    <textarea
                      required
                      rows={7}
                      value={form.content}
                      onChange={(e) => setForm({ ...form, content: e.target.value })}
                      placeholder="What did you learn? How did this chapter make you feel? Any insights or questions..."
                      className="w-full px-4 py-3 rounded-xl border border-[var(--color-tea-200)] bg-[var(--color-tea-50)] outline-none focus:ring-2 focus:ring-[var(--color-tea-400)] text-sm resize-none leading-relaxed"
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-xs font-bold text-[var(--color-tea-700)] uppercase tracking-wider mb-1.5">
                      Tags <span className="font-normal text-[var(--color-tea-500)]">(comma separated)</span>
                    </label>
                    <input
                      value={form.tags}
                      onChange={(e) => setForm({ ...form, tags: e.target.value })}
                      placeholder="e.g. habits, growth, chapter-5"
                      className="w-full px-4 py-3 rounded-xl border border-[var(--color-tea-200)] bg-[var(--color-tea-50)] outline-none focus:ring-2 focus:ring-[var(--color-tea-400)] text-sm"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-5 py-2.5 rounded-xl border border-[var(--color-tea-200)] text-[var(--color-tea-700)] text-sm font-medium hover:bg-[var(--color-tea-50)] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2.5 rounded-xl bg-[var(--color-tea-800)] text-white text-sm font-bold hover:bg-[var(--color-tea-900)] shadow-md transition-colors flex items-center gap-2"
                    >
                      <Save size={16} />
                      {submitting ? 'Saving...' : editing ? 'Update Entry' : 'Save Entry'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Entries list */}
        {loading ? (
          <CardListSkeleton count={3} />
        ) : entries.length === 0 ? (
          <div className="text-center py-24 text-[var(--color-tea-400)]">
            <BookOpen size={52} className="mx-auto mb-4 opacity-30" />
            <p className="font-semibold text-lg mb-2">Your journal is empty</p>
            <p className="text-sm">Start documenting your reading reflections, lessons, and thoughts.</p>
            <button
              onClick={openCreate}
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-tea-800)] text-white rounded-xl font-bold text-sm shadow-md hover:bg-[var(--color-tea-900)] transition-colors"
            >
              <Plus size={16} /> Write First Entry
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry, i) => {
              const isExpanded = expandedId === entry._id;
              return (
                <motion.div
                  key={entry._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-white rounded-2xl border border-[var(--color-tea-100)] shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  {/* Card header */}
                  <div
                    className="p-6 cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : entry._id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          {entry.mood && (
                            <span className="text-lg" title={entry.mood}>
                              {MOOD_MAP[entry.mood] || ''}
                            </span>
                          )}
                          <h3 className="font-extrabold text-[var(--color-tea-950)] text-lg leading-tight">
                            {entry.title}
                          </h3>
                        </div>
                        <div className="flex items-center gap-3 mt-1 flex-wrap text-xs text-[var(--color-tea-500)]">
                          <span className="flex items-center gap-1">
                            <Calendar size={11} /> {formatDate(entry.createdAt)}
                          </span>
                          {entry.bookTitle && (
                            <span className="flex items-center gap-1">
                              <BookOpen size={11} /> {entry.bookTitle}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={(e) => { e.stopPropagation(); openEdit(entry); }}
                          className="p-2 rounded-full hover:bg-[var(--color-tea-50)] text-[var(--color-tea-400)] hover:text-[var(--color-tea-700)] transition-colors"
                          title="Edit"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(entry._id); }}
                          className="p-2 rounded-full hover:bg-red-50 text-[var(--color-tea-300)] hover:text-red-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Preview */}
                    {!isExpanded && (
                      <p className="text-[var(--color-tea-700)] text-sm mt-3 leading-relaxed line-clamp-2">
                        {entry.content}
                      </p>
                    )}
                  </div>

                  {/* Expanded content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 border-t border-[var(--color-tea-50)]">
                          <p className="text-[var(--color-tea-800)] text-sm leading-loose whitespace-pre-wrap mt-4">
                            {entry.content}
                          </p>
                          {entry.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-4">
                              {entry.tags.map((tag, ti) => (
                                <span
                                  key={ti}
                                  className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1 bg-[var(--color-tea-100)] text-[var(--color-tea-700)] rounded-full"
                                >
                                  <Tag size={10} /> {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Journal;
