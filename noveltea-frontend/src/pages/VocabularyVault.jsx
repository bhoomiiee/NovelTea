import { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Plus, Trash2, CheckCircle, Circle, ArrowLeft,
  Search, Sparkles, Volume2, X,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

import API from '../api';
const DICT_API = 'https://api.dictionaryapi.dev/api/v2/entries/en';

// Debounce hook
const useDebounce = (value, delay) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
};

// Fix: remove dead `error` state — toast handles errors now
const VocabularyVault = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState({ word: '', meaning: '', synonyms: '', example: '' });
  const [submitting, setSubmitting] = useState(false);

  // Dictionary lookup state
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupResult, setLookupResult] = useState(null);
  const [lookupError, setLookupError] = useState('');

  const debouncedWord = useDebounce(form.word, 600);
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    if (token) fetchWords();
  }, [token]);

  const fetchWords = async () => {
    try {
      const res = await axios.get(`${API}/api/vocabulary`, authHeader);
      setWords(res.data);
    } catch {
      toast('Failed to load vocabulary', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Auto-lookup when word changes (debounced)
  useEffect(() => {
    const word = debouncedWord.trim().toLowerCase().replace(/[^a-z]/g, '');
    if (!word || word.length < 2) { setLookupResult(null); setLookupError(''); return; }

    const lookup = async () => {
      setLookupLoading(true);
      setLookupError('');
      try {
        const res = await fetch(`${DICT_API}/${word}`);
        if (res.ok) {
          const data = await res.json();
          const entry = data[0];
          const m0 = entry.meanings?.[0];
          const def = m0?.definitions?.[0];

          setLookupResult(entry);
          // Auto-fill form fields
          setForm((prev) => ({
            ...prev,
            meaning: prev.meaning || def?.definition || '',
            example: prev.example || def?.example || '',
            synonyms: prev.synonyms || (m0?.synonyms?.slice(0, 5).join(', ') || ''),
          }));
        } else {
          setLookupResult(null);
          setLookupError('No definition found. Fill in manually.');
        }
      } catch {
        setLookupResult(null);
        setLookupError('Dictionary lookup failed.');
      } finally {
        setLookupLoading(false);
      }
    };
    lookup();
  }, [debouncedWord]);

  const handleAddWord = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        word: form.word.trim(),
        meaning: form.meaning.trim(),
        synonyms: form.synonyms.split(',').map((s) => s.trim()).filter(Boolean),
        example: form.example.trim(),
      };
      const res = await axios.post(`${API}/api/vocabulary`, payload, authHeader);
      setWords([res.data, ...words]);
      toast('Word saved to vault!', 'success');
      setForm({ word: '', meaning: '', synonyms: '', example: '' });
      setLookupResult(null);
      setLookupError('');
      setShowForm(false);
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to add word.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleMastered = async (id) => {
    try {
      const res = await axios.put(`${API}/api/vocabulary/${id}/mastered`, {}, authHeader);
      setWords(words.map((w) => (w._id === id ? res.data : w)));
    } catch {
      toast('Failed to update word', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/api/vocabulary/${id}`, authHeader);
      setWords(words.filter((w) => w._id !== id));
      toast('Word removed', 'info');
    } catch {
      toast('Failed to delete word', 'error');
    }
  };

  const playPronunciation = (entry) => {
    const audio = entry?.phonetics?.find((p) => p.audio)?.audio;
    if (audio) new Audio(audio.startsWith('http') ? audio : `https:${audio}`).play();
  };

  const filtered = words.filter((w) => {
    const matchSearch =
      w.word.toLowerCase().includes(search.toLowerCase()) ||
      w.meaning.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'all' ||
      (filter === 'mastered' && w.mastered) ||
      (filter === 'learning' && !w.mastered);
    return matchSearch && matchFilter;
  });

  const masteredCount = words.filter((w) => w.mastered).length;

  return (
    <div className="min-h-screen bg-[var(--color-tea-50)]">
      {/* Header */}
      <header className="bg-white border-b border-[var(--color-tea-100)] px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 text-[var(--color-tea-700)] hover:bg-[var(--color-tea-50)] rounded-full transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-tea-950)]">Vocabulary Vault</h1>
            <p className="text-xs text-[var(--color-tea-600)]">
              {words.length} words · {masteredCount} mastered
            </p>
          </div>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setLookupResult(null); setLookupError(''); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-tea-800)] text-white rounded-xl font-bold text-sm shadow-md hover:bg-[var(--color-tea-900)] transition-colors"
        >
          <Plus size={18} /> Add Word
        </button>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-6">

        {/* Add Word Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="bg-white rounded-3xl border border-[var(--color-tea-100)] shadow-lg p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-[var(--color-tea-950)] flex items-center gap-2">
                  <BookOpen size={22} className="text-[var(--color-tea-600)]" /> Add to Vault
                </h2>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setLookupResult(null); setLookupError(''); }}
                  className="p-1.5 rounded-full hover:bg-[var(--color-tea-50)] text-[var(--color-tea-400)]"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddWord} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Word field with auto-lookup indicator */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[var(--color-tea-900)] mb-1">
                    Word *
                    {lookupLoading && <span className="ml-2 text-xs text-[var(--color-tea-500)]">Looking up...</span>}
                    {lookupResult && !lookupLoading && (
                      <span className="ml-2 text-xs text-green-600 flex items-center gap-1 inline-flex">
                        <Sparkles size={10} /> Definition found!
                      </span>
                    )}
                  </label>
                  <div className="flex gap-2">
                    <input
                      required
                      value={form.word}
                      onChange={(e) => {
                        setForm({ word: e.target.value, meaning: '', synonyms: '', example: '' });
                        setLookupResult(null);
                        setLookupError('');
                      }}
                      className="flex-1 px-4 py-3 rounded-xl border border-[var(--color-tea-200)] focus:ring-2 focus:ring-[var(--color-tea-400)] outline-none bg-[var(--color-tea-50)]"
                      placeholder="e.g. ephemeral"
                    />
                    {lookupResult && (
                      <button
                        type="button"
                        onClick={() => playPronunciation(lookupResult)}
                        title="Hear pronunciation"
                        className="px-3 py-3 rounded-xl bg-[var(--color-tea-100)] text-[var(--color-tea-700)] hover:bg-[var(--color-tea-200)] transition-colors"
                      >
                        <Volume2 size={18} />
                      </button>
                    )}
                  </div>
                  {lookupResult?.phonetics?.[0]?.text && (
                    <p className="text-xs text-[var(--color-tea-500)] mt-1 font-mono">{lookupResult.phonetics[0].text}</p>
                  )}
                  {lookupError && <p className="text-xs text-[var(--color-tea-400)] mt-1">{lookupError}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-tea-900)] mb-1">
                    Synonyms <span className="text-[var(--color-tea-500)] font-normal">(comma separated)</span>
                  </label>
                  <input
                    value={form.synonyms}
                    onChange={(e) => setForm({ ...form, synonyms: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[var(--color-tea-200)] focus:ring-2 focus:ring-[var(--color-tea-400)] outline-none bg-[var(--color-tea-50)]"
                    placeholder="e.g. transient, fleeting"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[var(--color-tea-900)] mb-1">Meaning *</label>
                  <textarea
                    required
                    value={form.meaning}
                    onChange={(e) => setForm({ ...form, meaning: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl border border-[var(--color-tea-200)] focus:ring-2 focus:ring-[var(--color-tea-400)] outline-none bg-[var(--color-tea-50)] resize-none"
                    placeholder="Lasting for a very short time..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[var(--color-tea-900)] mb-1">Example Sentence</label>
                  <input
                    value={form.example}
                    onChange={(e) => setForm({ ...form, example: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[var(--color-tea-200)] focus:ring-2 focus:ring-[var(--color-tea-400)] outline-none bg-[var(--color-tea-50)]"
                    placeholder="e.g. The beauty of the sunset was ephemeral."
                  />
                </div>

                <div className="md:col-span-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => { setShowForm(false); setLookupResult(null); }}
                    className="px-6 py-2.5 rounded-xl border border-[var(--color-tea-200)] text-[var(--color-tea-700)] font-medium hover:bg-[var(--color-tea-50)] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-[var(--color-tea-800)] text-white font-bold hover:bg-[var(--color-tea-900)] transition-colors shadow-md"
                  >
                    {submitting ? 'Saving...' : 'Save Word'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-tea-400)]" size={18} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search words or meanings..."
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-[var(--color-tea-200)] bg-white focus:ring-2 focus:ring-[var(--color-tea-400)] outline-none shadow-sm"
            />
          </div>
          <div className="flex rounded-xl border border-[var(--color-tea-200)] overflow-hidden bg-white shadow-sm">
            {['all', 'learning', 'mastered'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-5 py-3 text-sm font-medium capitalize transition-colors ${
                  filter === f ? 'bg-[var(--color-tea-800)] text-white' : 'text-[var(--color-tea-700)] hover:bg-[var(--color-tea-50)]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Stats pills */}
        <div className="flex gap-4">
          <div className="bg-white rounded-2xl px-5 py-3 shadow-sm border border-[var(--color-tea-100)] text-center">
            <p className="text-2xl font-extrabold text-[var(--color-tea-900)]">{words.length}</p>
            <p className="text-xs text-[var(--color-tea-600)]">Total Words</p>
          </div>
          <div className="bg-white rounded-2xl px-5 py-3 shadow-sm border border-[var(--color-tea-100)] text-center">
            <p className="text-2xl font-extrabold text-[var(--color-tea-700)]">{masteredCount}</p>
            <p className="text-xs text-[var(--color-tea-600)]">Mastered</p>
          </div>
          <div className="bg-white rounded-2xl px-5 py-3 shadow-sm border border-[var(--color-tea-100)] text-center">
            <p className="text-2xl font-extrabold text-[var(--color-tea-500)]">{words.length - masteredCount}</p>
            <p className="text-xs text-[var(--color-tea-600)]">Learning</p>
          </div>
        </div>

        {/* Word Cards */}
        {loading ? (
          <div className="text-center py-20 text-[var(--color-tea-500)]">Loading your vault...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-[var(--color-tea-400)]">
            <BookOpen size={48} className="mx-auto mb-4 opacity-40" />
            <p className="font-medium">No words found. Start adding!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence>
              {filtered.map((w) => (
                <motion.div
                  key={w._id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={`bg-white rounded-2xl border p-6 shadow-sm transition-all hover:shadow-md ${
                    w.mastered ? 'border-[var(--color-tea-300)]' : 'border-[var(--color-tea-100)]'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-extrabold text-[var(--color-tea-950)] capitalize">{w.word}</h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleMastered(w._id)}
                        title={w.mastered ? 'Mark as learning' : 'Mark as mastered'}
                        className="text-[var(--color-tea-500)] hover:text-[var(--color-tea-800)] transition-colors"
                      >
                        {w.mastered ? <CheckCircle size={22} className="text-[var(--color-tea-700)]" /> : <Circle size={22} />}
                      </button>
                      <button
                        onClick={() => handleDelete(w._id)}
                        className="text-[var(--color-tea-300)] hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  <p className="text-[var(--color-tea-800)] text-sm leading-relaxed mb-3">{w.meaning}</p>
                  {w.synonyms?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {w.synonyms.map((s, i) => (
                        <span key={i} className="text-xs px-2.5 py-1 bg-[var(--color-tea-100)] text-[var(--color-tea-700)] rounded-full font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                  {w.example && (
                    <p className="text-xs text-[var(--color-tea-500)] italic border-l-2 border-[var(--color-tea-200)] pl-3">
                      "{w.example}"
                    </p>
                  )}
                  {w.mastered && (
                    <span className="mt-3 inline-block text-xs font-bold text-[var(--color-tea-700)] bg-[var(--color-tea-100)] px-3 py-1 rounded-full">
                      ✓ Mastered
                    </span>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
};

export default VocabularyVault;
