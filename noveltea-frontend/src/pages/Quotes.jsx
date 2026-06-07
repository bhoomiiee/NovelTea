import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import AppLayout from '../components/AppLayout';
import { useToast } from '../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, Plus, Tag, BookOpen, Copy, Check, X } from 'lucide-react';
import API from '../api';

const CATEGORIES = ['All', 'Motivation', 'Life Lessons', 'Emotional', 'Favourite Dialogues', 'General'];

const Quotes = () => {
  const { token } = useContext(AuthContext);
  const { toast } = useToast();

  const [highlights, setHighlights] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ text: '', category: 'General', page: '', bookId: '' });
  const [submitting, setSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [searchText, setSearchText] = useState('');

  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    if (token) fetchAll();
  }, [token]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [booksRes, progressRes] = await Promise.all([
        axios.get(`${API}/api/books`, authHeader),
        axios.get(`${API}/api/progress`, authHeader),
      ]);
      setBooks(booksRes.data);

      const bookMap = Object.fromEntries(booksRes.data.map((b) => [b._id, b.title]));
      const allHighlights = [];
      for (const p of progressRes.data) {
        if (p.highlights?.length) {
          p.highlights.forEach((h) =>
            allHighlights.push({
              ...h,
              bookTitle: bookMap[p.bookId] || 'Unknown Book',
              bookId: p.bookId,
              progressId: p._id,
            })
          );
        }
      }
      // Sort newest first (by createdAt if available, else reverse insertion order)
      allHighlights.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setHighlights(allHighlights);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuote = async () => {
    if (!form.text.trim()) return;
    setSubmitting(true);
    try {
      // Must attach to a book — use selected book or first book
      const targetBookId = form.bookId || books[0]?._id;
      if (!targetBookId) {
        // No books uploaded yet — add locally only
        setHighlights((prev) => [
          { text: form.text, category: form.category, page: form.page, bookTitle: 'Manual Entry', _id: Date.now().toString() },
          ...prev,
        ]);
        setShowForm(false);
        setForm({ text: '', category: 'General', page: '', bookId: '' });
        setSubmitting(false);
        return;
      }
      await axios.post(
        `${API}/api/progress/${targetBookId}/highlights`,
        { text: form.text.trim(), category: form.category, page: parseInt(form.page) || 1 },
        authHeader
      );
      toast('Quote saved!', 'success');
      await fetchAll(); // re-fetch to get real data with IDs
      setShowForm(false);
      setForm({ text: '', category: 'General', page: '', bookId: '' });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(`"${text}"`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const filtered = highlights.filter((h) => {
    const matchCat = activeCategory === 'All' || h.category === activeCategory;
    const matchSearch = !searchText || h.text.toLowerCase().includes(searchText.toLowerCase()) ||
      h.bookTitle?.toLowerCase().includes(searchText.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <AppLayout>
      <div className="p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-[var(--color-tea-950)]">My Quotes</h1>
            <p className="text-[var(--color-tea-600)] mt-1">
              {highlights.length} saved {highlights.length === 1 ? 'quote' : 'quotes'} across your books
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-tea-800)] text-white rounded-xl font-bold text-sm shadow-md hover:bg-[var(--color-tea-900)] transition-colors"
          >
            <Plus size={18} /> Add Quote
          </button>
        </div>

        {/* Search */}
        <div className="mb-5">
          <input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search quotes or books..."
            className="w-full px-4 py-3 rounded-xl border border-[var(--color-tea-200)] bg-white outline-none focus:ring-2 focus:ring-[var(--color-tea-300)] text-sm shadow-sm"
          />
        </div>

        {/* Add Quote Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="bg-white rounded-3xl border border-[var(--color-tea-100)] shadow-lg p-7 mb-6"
            >
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-lg font-bold text-[var(--color-tea-950)] flex items-center gap-2">
                  <Quote size={20} className="text-[var(--color-tea-600)]" /> Save a Quote
                </h2>
                <button onClick={() => setShowForm(false)} className="p-1.5 rounded-full hover:bg-[var(--color-tea-50)] text-[var(--color-tea-400)]">
                  <X size={16} />
                </button>
              </div>
              <div className="space-y-4">
                <textarea
                  rows={3}
                  value={form.text}
                  onChange={(e) => setForm({ ...form, text: e.target.value })}
                  placeholder="Paste your favourite quote here..."
                  className="w-full px-4 py-3 rounded-xl border border-[var(--color-tea-200)] focus:ring-2 focus:ring-[var(--color-tea-400)] outline-none bg-[var(--color-tea-50)] resize-none text-sm"
                />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="px-4 py-2.5 rounded-xl border border-[var(--color-tea-200)] bg-[var(--color-tea-50)] outline-none focus:ring-2 focus:ring-[var(--color-tea-400)] text-sm"
                  >
                    {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  {books.length > 0 && (
                    <select
                      value={form.bookId}
                      onChange={(e) => setForm({ ...form, bookId: e.target.value })}
                      className="px-4 py-2.5 rounded-xl border border-[var(--color-tea-200)] bg-[var(--color-tea-50)] outline-none focus:ring-2 focus:ring-[var(--color-tea-400)] text-sm"
                    >
                      <option value="">Select book...</option>
                      {books.map((b) => (
                        <option key={b._id} value={b._id}>{b.title}</option>
                      ))}
                    </select>
                  )}
                  <input
                    type="number"
                    value={form.page}
                    onChange={(e) => setForm({ ...form, page: e.target.value })}
                    placeholder="Page #"
                    className="px-4 py-2.5 rounded-xl border border-[var(--color-tea-200)] bg-[var(--color-tea-50)] outline-none focus:ring-2 focus:ring-[var(--color-tea-400)] text-sm"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowForm(false)}
                    className="px-5 py-2.5 rounded-xl border border-[var(--color-tea-200)] text-[var(--color-tea-700)] text-sm font-medium hover:bg-[var(--color-tea-50)]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddQuote}
                    disabled={submitting || !form.text.trim()}
                    className="px-5 py-2.5 rounded-xl bg-[var(--color-tea-800)] text-white text-sm font-bold hover:bg-[var(--color-tea-900)] shadow-md disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : 'Save Quote'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category filter */}
        <div className="flex gap-2 flex-wrap mb-8">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === c
                  ? 'bg-[var(--color-tea-800)] text-white shadow-sm'
                  : 'bg-white text-[var(--color-tea-700)] border border-[var(--color-tea-200)] hover:border-[var(--color-tea-400)]'
              }`}
            >
              {c}
              {c !== 'All' && (
                <span className="ml-1.5 text-[10px] opacity-70">
                  ({highlights.filter((h) => h.category === c).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Quote Cards */}
        {loading ? (
          <div className="text-center py-20 text-[var(--color-tea-500)]">Loading quotes...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-[var(--color-tea-400)]">
            <Quote size={48} className="mx-auto mb-4 opacity-30" />
            <p className="font-medium">
              {searchText ? 'No quotes match your search.' : 'No quotes yet. Highlight text while reading!'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((h, i) => {
              const uniqueId = h._id || `${h.bookId}-${i}`;
              return (
                <motion.div
                  key={uniqueId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.04, 0.3) }}
                  className="bg-white rounded-2xl border border-[var(--color-tea-100)] p-6 shadow-sm hover:shadow-md transition-shadow group"
                >
                  <div className="flex gap-4">
                    <div className="w-1 rounded-full bg-[var(--color-tea-400)] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[var(--color-tea-900)] text-base leading-relaxed font-medium italic">
                        "{h.text}"
                      </p>
                      <div className="flex items-center gap-3 mt-3 flex-wrap">
                        {h.bookTitle && (
                          <span className="flex items-center gap-1 text-xs text-[var(--color-tea-600)] bg-[var(--color-tea-50)] border border-[var(--color-tea-100)] px-3 py-1 rounded-full">
                            <BookOpen size={11} /> {h.bookTitle}
                          </span>
                        )}
                        {h.category && (
                          <span className="flex items-center gap-1 text-xs text-[var(--color-tea-700)] bg-[var(--color-tea-100)] px-3 py-1 rounded-full font-medium">
                            <Tag size={11} /> {h.category}
                          </span>
                        )}
                        {h.page && (
                          <span className="text-xs text-[var(--color-tea-400)]">pg. {h.page}</span>
                        )}
                      </div>
                    </div>
                    {/* Copy button */}
                    <button
                      onClick={() => handleCopy(h.text, uniqueId)}
                      className="shrink-0 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all text-[var(--color-tea-400)] hover:text-[var(--color-tea-700)] hover:bg-[var(--color-tea-50)]"
                      title="Copy quote"
                    >
                      {copiedId === uniqueId ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Quotes;
