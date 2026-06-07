import { useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import AppLayout from '../components/AppLayout';
import { useToast } from '../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Smile, BookOpen, Sparkles, RefreshCw } from 'lucide-react';
import API from '../api';

const MOODS = [
  { emoji: '😊', label: 'Happy',      color: 'bg-yellow-50 border-yellow-200 text-yellow-800',   active: 'bg-yellow-400 border-yellow-400 text-white' },
  { emoji: '🔥', label: 'Motivated',  color: 'bg-orange-50 border-orange-200 text-orange-800',   active: 'bg-orange-500 border-orange-500 text-white' },
  { emoji: '😢', label: 'Lonely',     color: 'bg-blue-50 border-blue-200 text-blue-800',         active: 'bg-blue-400 border-blue-400 text-white' },
  { emoji: '🤔', label: 'Curious',    color: 'bg-purple-50 border-purple-200 text-purple-800',   active: 'bg-purple-500 border-purple-500 text-white' },
  { emoji: '💼', label: 'Productive', color: 'bg-green-50 border-green-200 text-green-800',      active: 'bg-green-500 border-green-500 text-white' },
  { emoji: '😴', label: 'Relaxed',    color: 'bg-[var(--color-tea-50)] border-[var(--color-tea-200)] text-[var(--color-tea-800)]', active: 'bg-[var(--color-tea-600)] border-[var(--color-tea-600)] text-white' },
  { emoji: '😤', label: 'Frustrated', color: 'bg-red-50 border-red-200 text-red-800',            active: 'bg-red-500 border-red-500 text-white' },
  { emoji: '🌟', label: 'Inspired',   color: 'bg-indigo-50 border-indigo-200 text-indigo-800',   active: 'bg-indigo-500 border-indigo-500 text-white' },
];

// Typing dots animation component
const TypingDots = () => (
  <div className="flex items-center gap-1.5">
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        className="w-2.5 h-2.5 rounded-full bg-[var(--color-tea-600)]"
        animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
      />
    ))}
  </div>
);

const MoodRecommend = () => {
  const { token } = useContext(AuthContext);
  const { toast } = useToast();

  const [selected, setSelected] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState(null); // 'gemini' | 'static' | 'fallback'
  const [hasResult, setHasResult] = useState(false);

  const fetchRecommendations = async (mood) => {
    setLoading(true);
    setHasResult(false);
    setBooks([]);
    setSource(null);
    try {
      const res = await axios.post(
        `${API}/api/mood/recommend`,
        { mood },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBooks(res.data.books || []);
      setSource(res.data.source);
      setHasResult(true);
    } catch {
      toast('Could not get recommendations right now', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMoodSelect = (mood) => {
    setSelected(mood);
    setHasResult(false);
    setBooks([]);
    setSource(null);
  };

  const handleGetReads = () => {
    if (selected) fetchRecommendations(selected);
  };

  const handleRefresh = () => {
    if (selected) fetchRecommendations(selected);
  };

  const handleReset = () => {
    setSelected(null);
    setHasResult(false);
    setBooks([]);
    setSource(null);
  };

  return (
    <AppLayout>
      <div className="p-8 max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-10 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-[var(--color-tea-100)] rounded-full flex items-center justify-center">
            <Smile size={32} className="text-[var(--color-tea-700)]" />
          </div>
          <h1 className="text-3xl font-extrabold text-[var(--color-tea-950)]">Mood-Based Picks</h1>
          <p className="text-[var(--color-tea-600)] mt-2">
            How are you feeling right now? Gemini AI will find your perfect read.
          </p>
          {/* Powered by badge */}
          <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full bg-[var(--color-tea-100)] border border-[var(--color-tea-200)] text-[10px] font-bold text-[var(--color-tea-600)] uppercase tracking-wider">
            <Sparkles size={10} className="text-[var(--color-amber-gold)]" />
            Powered by Gemini AI
          </div>
        </div>

        {/* Mood Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {MOODS.map(({ emoji, label, color, active }) => (
            <motion.button
              key={label}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => handleMoodSelect(label)}
              disabled={loading}
              className={`flex flex-col items-center gap-2 p-5 rounded-2xl border-2 font-semibold text-sm transition-all shadow-sm disabled:opacity-50 ${
                selected === label ? active : `${color} hover:opacity-90`
              }`}
            >
              <span className="text-3xl">{emoji}</span>
              {label}
            </motion.button>
          ))}
        </div>

        {/* CTA button */}
        <AnimatePresence>
          {selected && !loading && !hasResult && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center mb-8"
            >
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleGetReads}
                className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--color-tea-800)] text-white rounded-2xl text-base font-bold shadow-lg hover:bg-[var(--color-tea-900)] transition-colors"
              >
                <Sparkles size={20} />
                Get My {selected} Reads
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading state */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <div className="inline-flex flex-col items-center gap-5 bg-white rounded-3xl border border-[var(--color-tea-100)] px-10 py-8 shadow-sm">
                <div className="w-14 h-14 bg-[var(--color-tea-100)] rounded-full flex items-center justify-center">
                  <Sparkles size={26} className="text-[var(--color-tea-700)] animate-pulse" />
                </div>
                <div>
                  <p className="font-bold text-[var(--color-tea-900)] text-base mb-1">
                    Gemini is thinking...
                  </p>
                  <p className="text-sm text-[var(--color-tea-500)] mb-3">
                    Finding the perfect books for your {selected} mood
                  </p>
                  <TypingDots />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {hasResult && books.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Result header */}
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-[var(--color-tea-950)]">
                  📚 Perfect reads for when you're feeling{' '}
                  <span className="text-[var(--color-tea-700)]">{selected}</span>:
                </h2>
                <button
                  onClick={handleRefresh}
                  title="Get new recommendations"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-[var(--color-tea-600)] hover:text-[var(--color-tea-900)] hover:bg-[var(--color-tea-100)] transition-colors border border-[var(--color-tea-200)]"
                >
                  <RefreshCw size={13} /> Refresh
                </button>
              </div>

              {/* Source badge */}
              {source === 'gemini' && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 border border-green-200 text-[10px] font-bold text-green-700 uppercase tracking-wider mb-2">
                  <Sparkles size={9} /> AI-generated by Gemini
                </div>
              )}
              {(source === 'static' || source === 'fallback') && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-tea-100)] border border-[var(--color-tea-200)] text-[10px] font-bold text-[var(--color-tea-600)] uppercase tracking-wider mb-2">
                  📚 Curated picks
                </div>
              )}

              {/* Book cards */}
              {books.map((book, i) => (
                <motion.div
                  key={`${book.title}-${i}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-white rounded-2xl border border-[var(--color-tea-100)] p-6 shadow-sm hover:shadow-md transition-shadow flex gap-5"
                >
                  {/* Book spine decoration */}
                  <div className="w-14 h-20 bg-gradient-to-b from-[var(--color-tea-200)] to-[var(--color-tea-300)] rounded-xl flex items-center justify-center shrink-0 shadow-sm relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[var(--color-tea-500)]" />
                    <BookOpen size={22} className="text-[var(--color-tea-700)]" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-extrabold text-[var(--color-tea-950)] text-base leading-tight">
                      {book.title}
                    </h3>
                    <p className="text-[var(--color-tea-500)] text-sm mt-0.5 font-medium">
                      {book.author}
                    </p>
                    <span className="inline-block mt-2 text-xs font-medium px-3 py-1 bg-[var(--color-tea-100)] text-[var(--color-tea-700)] rounded-full">
                      {book.genre}
                    </span>
                    <p className="text-[var(--color-tea-700)] text-sm mt-3 italic leading-relaxed border-l-2 border-[var(--color-tea-200)] pl-3">
                      "{book.why}"
                    </p>
                  </div>
                </motion.div>
              ))}

              {/* Reset */}
              <div className="text-center pt-4">
                <button
                  onClick={handleReset}
                  className="text-[var(--color-tea-500)] hover:text-[var(--color-tea-800)] text-sm font-medium underline-offset-2 hover:underline"
                >
                  Pick another mood
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
};

export default MoodRecommend;
