import { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { Document, Page, pdfjs } from 'react-pdf';
import {
  ChevronLeft, ChevronRight, ZoomIn, ZoomOut, ArrowLeft,
  Bookmark, BookmarkCheck, Quote, BookOpen, X, Save, Trash2,
} from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

import API from '../api';
const DICT_API = 'https://api.dictionaryapi.dev/api/v2/entries/en';
const CATEGORIES = ['Motivation', 'Life Lessons', 'Emotional', 'Favourite Dialogues', 'General'];

const Reader = () => {
  const { id } = useParams();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [progress, setProgress] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  // Highlight / quote panel
  const [selectedText, setSelectedText] = useState('');
  const [showHighlightPanel, setShowHighlightPanel] = useState(false);
  const [highlightCategory, setHighlightCategory] = useState('General');
  const [savingHighlight, setSavingHighlight] = useState(false);
  const [highlightMsg, setHighlightMsg] = useState('');

  // Bookmark notes panel
  const [showBookmarkPanel, setShowBookmarkPanel] = useState(false);
  const [bookmarkNote, setBookmarkNote] = useState('');
  const [bookmarkMsg, setBookmarkMsg] = useState('');
  const [bookmarks, setBookmarks] = useState([]);
  const [bookmarkAdded, setBookmarkAdded] = useState(false);

  // Word lookup panel
  const [lookupWord, setLookupWord] = useState('');
  const [lookupResult, setLookupResult] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [showLookup, setShowLookup] = useState(false);
  const [savingWord, setSavingWord] = useState(false);
  const [wordSaved, setWordSaved] = useState(false);

  // Sidebar for bookmarks list
  const [showBookmarksList, setShowBookmarksList] = useState(false);

  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    const init = async () => {
      try {
        const [bookRes, progressRes] = await Promise.all([
          axios.get(`${API}/api/books/${id}`, authHeader),
          axios.get(`${API}/api/progress/${id}`, authHeader),
        ]);
        setBook(bookRes.data);
        setProgress(progressRes.data);
        setBookmarks(progressRes.data.bookmarks || []);
        if (progressRes.data.currentPage) setPageNumber(progressRes.data.currentPage);
      } catch (err) {
        setError('Failed to load book.');
      } finally {
        setLoading(false);
      }
    };
    if (token) init();
  }, [id, token]);

  const saveProgress = useCallback(
    async (page, total) => {
      try {
        await axios.put(`${API}/api/progress/${id}`, { currentPage: page, totalPages: total }, authHeader);
      } catch {}
    },
    [id, token]
  );

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    saveProgress(pageNumber, numPages);
  };

  const changePage = (offset) => {
    setPageNumber((prev) => {
      const next = prev + offset;
      if (next >= 1 && next <= numPages) {
        saveProgress(next, numPages);
        setBookmarkAdded(false);
        return next;
      }
      return prev;
    });
  };

  const changeScale = (offset) => {
    setScale((prev) => Math.max(0.5, Math.min(3.0, parseFloat((prev + offset).toFixed(1)))));
  };

  // ── Text selection → highlight panel ──────────────────────────────────
  // Works on both mouse (desktop) and touch (mobile)
  const handleTextSelection = () => {
    // Small delay to let the browser finalize the selection on touch
    setTimeout(() => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();
      if (text && text.length > 2) {
        setSelectedText(text);
        setHighlightCategory('General');
        setHighlightMsg('');
        setShowHighlightPanel(true);
        // Single word → also show dictionary lookup
        if (text.split(' ').length === 1) {
          openLookup(text);
        }
      }
    }, 100);
  };

  const handleSaveHighlight = async () => {
    if (!selectedText) return;
    setSavingHighlight(true);
    try {
      await axios.post(
        `${API}/api/progress/${id}/highlights`,
        { page: pageNumber, text: selectedText, category: highlightCategory },
        authHeader
      );
      setHighlightMsg('Quote saved! ✓');
      setTimeout(() => {
        setShowHighlightPanel(false);
        setHighlightMsg('');
        setSelectedText('');
      }, 1200);
    } catch {
      setHighlightMsg('Failed to save.');
    } finally {
      setSavingHighlight(false);
    }
  };

  // ── Bookmark ──────────────────────────────────────────────────────────
  const handleAddBookmark = async () => {
    const note = bookmarkNote.trim() || `Bookmarked page ${pageNumber}`;
    try {
      const res = await axios.post(
        `${API}/api/progress/${id}/bookmarks`,
        { page: pageNumber, note },
        authHeader
      );
      setBookmarks(res.data);
      setBookmarkAdded(true);
      setBookmarkNote('');
      setBookmarkMsg('Bookmark saved! ✓');
      setTimeout(() => { setShowBookmarkPanel(false); setBookmarkMsg(''); }, 1200);
    } catch {
      setBookmarkMsg('Failed to save bookmark.');
    }
  };

  const handleDeleteBookmark = async (bookmarkId) => {
    try {
      const res = await axios.delete(`${API}/api/progress/${id}/bookmarks/${bookmarkId}`, authHeader);
      setBookmarks(res.data);
    } catch {}
  };

  const isPageBookmarked = bookmarks.some((b) => b.page === pageNumber) || bookmarkAdded;

  // ── Dictionary lookup ─────────────────────────────────────────────────
  const openLookup = async (word) => {
    const clean = word.toLowerCase().replace(/[^a-z]/g, '');
    if (!clean) return;
    setLookupWord(clean);
    setLookupResult(null);
    setWordSaved(false);
    setShowLookup(true);
    setLookupLoading(true);
    try {
      const res = await fetch(`${DICT_API}/${clean}`);
      if (res.ok) {
        const data = await res.json();
        setLookupResult(data[0]);
      } else {
        setLookupResult(null);
      }
    } catch {
      setLookupResult(null);
    } finally {
      setLookupLoading(false);
    }
  };

  const handleSaveWord = async () => {
    if (!lookupResult) return;
    setSavingWord(true);
    try {
      const meanings = lookupResult.meanings?.[0];
      const meaning = meanings?.definitions?.[0]?.definition || 'See dictionary.';
      const example = meanings?.definitions?.[0]?.example || '';
      const synonyms = meanings?.synonyms?.slice(0, 5) || [];
      await axios.post(
        `${API}/api/vocabulary`,
        { word: lookupWord, meaning, synonyms, example, bookId: id },
        authHeader
      );
      setWordSaved(true);
    } catch (err) {
      // Word already in vault or network error — show feedback in lookup panel
      setWordSaved(false);
      setLookupResult((prev) => prev ? { ...prev, _saveError: err.response?.data?.message || 'Could not save word' } : prev);
    } finally {
      setSavingWord(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-tea-50)]">
      <div className="text-[var(--color-tea-600)] text-lg font-medium">Loading book...</div>
    </div>
  );
  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-tea-50)] text-red-500">{error}</div>
  );

  const dm = darkMode;
  const base = dm ? 'bg-[#1a1208]' : 'bg-[#ece5df]';
  const toolbar = dm ? 'bg-[#2c1f0f] border-[#4a3520]' : 'bg-white border-[var(--color-tea-100)]';
  const btn = dm ? 'text-[#d4a867] hover:bg-[#3d2e18]' : 'text-[var(--color-tea-700)] hover:bg-[var(--color-tea-50)]';
  const text = dm ? 'text-[#f0d9b5]' : 'text-[var(--color-tea-950)]';
  const subtext = dm ? 'text-[#a07840]' : 'text-[var(--color-tea-600)]';
  const inputCls = dm
    ? 'bg-[#3d2e18] border-[#5a4a30] text-[#f0d9b5]'
    : 'bg-[var(--color-tea-50)] border-[var(--color-tea-200)] text-[var(--color-tea-950)]';

  return (
    <div className={`h-screen flex flex-col ${base} transition-colors duration-300 relative`}>

      {/* ── Toolbar ─────────────────────────────────────────────────── */}
      <div className={`${toolbar} border-b px-4 py-3 flex justify-between items-center shadow-sm z-10 shrink-0 transition-colors`}>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className={`p-2 rounded-full transition-colors ${btn}`}>
            <ArrowLeft size={20} />
          </button>
          <div className="hidden sm:block">
            <h2 className={`font-bold text-sm ${text}`}>{book?.title}</h2>
            <p className={`text-xs ${subtext}`}>{book?.author}</p>
          </div>
          {/* Mobile: show truncated title */}
          <h2 className={`sm:hidden font-bold text-xs max-w-[80px] truncate ${text}`}>{book?.title}</h2>
        </div>

        <div className={`flex items-center gap-1 text-sm font-medium ${dm ? 'text-[#d4a867]' : 'text-[var(--color-tea-800)]'}`}>
          <input
            type="number"
            value={pageNumber}
            min={1}
            max={numPages || 1}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              if (val >= 1 && val <= numPages) { setPageNumber(val); saveProgress(val, numPages); }
            }}
            className={`w-14 text-center border rounded-lg px-2 py-1 font-bold outline-none ${inputCls}`}
          />
          <span className="opacity-60">/ {numPages || '--'}</span>
        </div>

        <div className="flex items-center gap-1">
          {/* Zoom — visible on all screens */}
          <div className={`flex items-center gap-1 ${dm ? 'bg-[#3d2e18]' : 'bg-[var(--color-tea-50)]'} rounded-lg p-1 mr-1`}>
            <button onClick={() => changeScale(-0.1)} className={`p-1.5 rounded-md transition-colors ${btn}`}><ZoomOut size={16} /></button>
            <span className={`text-xs font-bold min-w-[2.5rem] text-center ${dm ? 'text-[#d4a867]' : 'text-[var(--color-tea-800)]'}`}>{Math.round(scale * 100)}%</span>
            <button onClick={() => changeScale(0.1)} className={`p-1.5 rounded-md transition-colors ${btn}`}><ZoomIn size={16} /></button>
          </div>

          {/* Bookmark button */}
          <button
            onClick={() => { setBookmarkNote(''); setBookmarkMsg(''); setShowBookmarkPanel(true); }}
            title={isPageBookmarked ? 'Page bookmarked' : 'Bookmark this page'}
            className={`p-2 rounded-full transition-colors ${isPageBookmarked ? 'text-[var(--color-tea-700)]' : `${subtext} hover:bg-[var(--color-tea-50)]`}`}
          >
            {isPageBookmarked ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
          </button>

          {/* Bookmarks list */}
          <button
            onClick={() => setShowBookmarksList(!showBookmarksList)}
            title="View all bookmarks"
            className={`p-2 rounded-full transition-colors ${btn}`}
          >
            <BookOpen size={18} />
          </button>

          {/* Dark mode */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-full text-sm font-bold transition-colors ${dm ? 'bg-[#3d2e18] text-[#f0d9b5]' : 'bg-[var(--color-tea-100)] text-[var(--color-tea-800)]'}`}
          >
            {dm ? '☀️' : '🌙'}
          </button>
        </div>
      </div>

      {/* ── PDF Viewport ──────────────────────────────────────────────── */}
      <div
        className="flex-1 overflow-auto flex justify-center items-start py-8 px-4"
        onMouseUp={handleTextSelection}
        onTouchEnd={handleTextSelection}
        onDoubleClick={(e) => {
          const selection = window.getSelection();
          const word = selection?.toString().trim();
          if (word && word.split(' ').length === 1) {
            openLookup(word);
          }
        }}
      >
        <Document
          file={`${API}${book?.fileUrl}`}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className={`flex items-center justify-center mt-32 text-lg ${subtext}`}>Rendering PDF...</div>
          }
          error={
            <div className="flex items-center justify-center mt-32 text-red-500">
              Failed to load PDF. Make sure the backend is running.
            </div>
          }
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            renderTextLayer={true}
            renderAnnotationLayer={true}
            className={`shadow-2xl ${dm ? 'invert sepia brightness-75' : ''} transition-all`}
          />
        </Document>
      </div>

      {/* ── Footer Nav ───────────────────────────────────────────────── */}
      <div className={`${toolbar} border-t px-6 py-4 flex flex-col items-center z-10 shrink-0 transition-colors gap-2`}>
        <div className="flex items-center gap-6">
          <button
            onClick={() => changePage(-1)}
            disabled={pageNumber <= 1}
            className={`p-3 rounded-full transition-colors shadow-sm ${
              pageNumber <= 1 ? 'opacity-30 cursor-not-allowed'
                : dm ? 'bg-[#3d2e18] text-[#f0d9b5] hover:bg-[#4a3520]'
                : 'bg-[var(--color-tea-50)] text-[var(--color-tea-900)] hover:bg-[var(--color-tea-100)]'
            }`}
          >
            <ChevronLeft size={24} />
          </button>

          <div className={`w-48 h-1.5 ${dm ? 'bg-[#4a3520]' : 'bg-[var(--color-tea-100)]'} rounded-full overflow-hidden`}>
            <div
              className="h-full bg-[var(--color-tea-600)] rounded-full transition-all duration-300"
              style={{ width: numPages ? `${(pageNumber / numPages) * 100}%` : '0%' }}
            />
          </div>

          <button
            onClick={() => changePage(1)}
            disabled={pageNumber >= numPages}
            className={`p-3 rounded-full transition-colors shadow-sm ${
              pageNumber >= numPages ? 'opacity-30 cursor-not-allowed'
                : dm ? 'bg-[#3d2e18] text-[#f0d9b5] hover:bg-[#4a3520]'
                : 'bg-[var(--color-tea-50)] text-[var(--color-tea-900)] hover:bg-[var(--color-tea-100)]'
            }`}
          >
            <ChevronRight size={24} />
          </button>
        </div>
        {/* Helper hint */}
        <p className={`text-[10px] ${subtext} opacity-60`}>
          Select text to save as a quote • Double-click a word to look it up in the dictionary
        </p>
      </div>

      {/* ── Highlight / Quote Panel ───────────────────────────────────── */}
      {showHighlightPanel && (
        <div className="fixed inset-0 z-40 bg-black/40 flex items-end justify-center p-0 sm:p-4 sm:items-center">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-md border border-[var(--color-tea-100)] p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-[var(--color-tea-950)] flex items-center gap-2">
                <Quote size={18} className="text-[var(--color-tea-600)]" /> Save Quote
              </h3>
              <button onClick={() => setShowHighlightPanel(false)} className="p-1 rounded-full hover:bg-[var(--color-tea-50)] text-[var(--color-tea-500)]"><X size={18} /></button>
            </div>

            <div className="bg-[var(--color-tea-50)] border border-[var(--color-tea-200)] rounded-xl p-4 mb-4">
              <p className="text-sm text-[var(--color-tea-800)] italic leading-relaxed line-clamp-4">"{selectedText}"</p>
              <p className="text-xs text-[var(--color-tea-500)] mt-1">Page {pageNumber}</p>
            </div>

            <label className="block text-xs font-bold text-[var(--color-tea-700)] uppercase tracking-wider mb-2">Category</label>
            <div className="flex flex-wrap gap-2 mb-5">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setHighlightCategory(c)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-colors ${
                    highlightCategory === c
                      ? 'bg-[var(--color-tea-800)] text-white border-[var(--color-tea-800)]'
                      : 'bg-white text-[var(--color-tea-700)] border-[var(--color-tea-200)] hover:border-[var(--color-tea-400)]'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {highlightMsg && (
              <p className={`text-sm font-bold text-center mb-3 ${highlightMsg.includes('✓') ? 'text-green-600' : 'text-red-500'}`}>
                {highlightMsg}
              </p>
            )}

            <div className="flex gap-3">
              <button onClick={() => setShowHighlightPanel(false)} className="flex-1 py-2.5 rounded-xl border border-[var(--color-tea-200)] text-sm font-medium text-[var(--color-tea-700)] hover:bg-[var(--color-tea-50)]">
                Cancel
              </button>
              <button
                onClick={handleSaveHighlight}
                disabled={savingHighlight}
                className="flex-1 py-2.5 rounded-xl bg-[var(--color-tea-800)] text-white text-sm font-bold hover:bg-[var(--color-tea-900)] shadow-md flex items-center justify-center gap-2"
              >
                <Save size={15} />
                {savingHighlight ? 'Saving...' : 'Save Quote'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Bookmark Panel ────────────────────────────────────────────── */}
      {showBookmarkPanel && (
        <div className="fixed inset-0 z-40 bg-black/40 flex items-end justify-center p-0 sm:p-4 sm:items-center">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-md border border-[var(--color-tea-100)] p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-[var(--color-tea-950)] flex items-center gap-2">
                <Bookmark size={18} className="text-[var(--color-tea-600)]" /> Bookmark Page {pageNumber}
              </h3>
              <button onClick={() => setShowBookmarkPanel(false)} className="p-1 rounded-full hover:bg-[var(--color-tea-50)] text-[var(--color-tea-500)]"><X size={18} /></button>
            </div>
            <textarea
              rows={3}
              value={bookmarkNote}
              onChange={(e) => setBookmarkNote(e.target.value)}
              placeholder="Add a note about this page... (optional)"
              className="w-full px-4 py-3 rounded-xl border border-[var(--color-tea-200)] bg-[var(--color-tea-50)] outline-none focus:ring-2 focus:ring-[var(--color-tea-400)] text-sm resize-none mb-4"
            />
            {bookmarkMsg && (
              <p className={`text-sm font-bold text-center mb-3 ${bookmarkMsg.includes('✓') ? 'text-green-600' : 'text-red-500'}`}>
                {bookmarkMsg}
              </p>
            )}
            <div className="flex gap-3">
              <button onClick={() => setShowBookmarkPanel(false)} className="flex-1 py-2.5 rounded-xl border border-[var(--color-tea-200)] text-sm font-medium text-[var(--color-tea-700)] hover:bg-[var(--color-tea-50)]">
                Cancel
              </button>
              <button
                onClick={handleAddBookmark}
                className="flex-1 py-2.5 rounded-xl bg-[var(--color-tea-800)] text-white text-sm font-bold hover:bg-[var(--color-tea-900)] shadow-md flex items-center justify-center gap-2"
              >
                <BookmarkCheck size={15} /> Bookmark
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Bookmarks List Sidebar ────────────────────────────────────── */}
      {showBookmarksList && (
        <div className="fixed right-0 top-0 h-full z-40 w-80 bg-white shadow-2xl border-l border-[var(--color-tea-100)] flex flex-col">
          <div className="flex justify-between items-center p-5 border-b border-[var(--color-tea-100)]">
            <h3 className="font-bold text-[var(--color-tea-950)]">Bookmarks</h3>
            <button onClick={() => setShowBookmarksList(false)} className="p-1 rounded-full hover:bg-[var(--color-tea-50)] text-[var(--color-tea-500)]"><X size={18} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {bookmarks.length === 0 ? (
              <p className="text-sm text-[var(--color-tea-500)] text-center py-8">No bookmarks yet. Bookmark a page to see it here.</p>
            ) : (
              bookmarks
                .slice()
                .sort((a, b) => a.page - b.page)
                .map((bm, i) => (
                  <div key={bm._id || i} className="bg-[var(--color-tea-50)] rounded-xl p-4 border border-[var(--color-tea-100)] flex items-start gap-2">
                    <div className="flex-1">
                      <button
                        onClick={() => { setPageNumber(bm.page); saveProgress(bm.page, numPages); setShowBookmarksList(false); }}
                        className="text-[var(--color-tea-800)] font-bold text-sm hover:text-[var(--color-tea-950)] hover:underline"
                      >
                        Page {bm.page}
                      </button>
                      {bm.note && <p className="text-xs text-[var(--color-tea-600)] mt-1">{bm.note}</p>}
                    </div>
                    {bm._id && (
                      <button
                        onClick={() => handleDeleteBookmark(bm._id)}
                        className="p-1.5 rounded-lg text-[var(--color-tea-300)] hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                        title="Remove bookmark"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* ── Dictionary Lookup Panel ───────────────────────────────────── */}
      {showLookup && (
        <div className="fixed bottom-20 left-2 right-2 sm:left-auto sm:right-6 sm:w-80 z-50 bg-white rounded-3xl shadow-2xl border border-[var(--color-tea-100)] overflow-hidden">
          <div className="flex justify-between items-center px-5 py-4 border-b border-[var(--color-tea-100)]">
            <h3 className="font-bold text-[var(--color-tea-950)] capitalize">{lookupWord}</h3>
            <button onClick={() => setShowLookup(false)} className="p-1 rounded-full hover:bg-[var(--color-tea-50)] text-[var(--color-tea-500)]"><X size={16} /></button>
          </div>
          <div className="p-5 max-h-64 overflow-y-auto">
            {lookupLoading ? (
              <p className="text-sm text-[var(--color-tea-500)] text-center py-4">Looking up...</p>
            ) : lookupResult ? (
              <>
                {lookupResult.phonetics?.[0]?.text && (
                  <p className="text-xs text-[var(--color-tea-500)] mb-3 font-mono">{lookupResult.phonetics[0].text}</p>
                )}
                {lookupResult.meanings?.slice(0, 2).map((m, mi) => (
                  <div key={mi} className="mb-3">
                    <span className="text-xs font-bold text-[var(--color-tea-700)] bg-[var(--color-tea-100)] px-2 py-0.5 rounded-full italic">
                      {m.partOfSpeech}
                    </span>
                    {m.definitions?.slice(0, 2).map((d, di) => (
                      <div key={di} className="mt-1.5">
                        <p className="text-sm text-[var(--color-tea-800)]">{d.definition}</p>
                        {d.example && (
                          <p className="text-xs text-[var(--color-tea-500)] italic mt-0.5">"{d.example}"</p>
                        )}
                      </div>
                    ))}
                    {m.synonyms?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {m.synonyms.slice(0, 4).map((s, si) => (
                          <span key={si} className="text-xs bg-[var(--color-tea-100)] text-[var(--color-tea-700)] px-2 py-0.5 rounded-full font-medium">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                <button
                  onClick={handleSaveWord}
                  disabled={savingWord || wordSaved}
                  className={`w-full mt-3 py-2 rounded-xl text-sm font-bold transition-colors ${
                    wordSaved
                      ? 'bg-green-100 text-green-700'
                      : 'bg-[var(--color-tea-800)] text-white hover:bg-[var(--color-tea-900)]'
                  }`}
                >
                  {wordSaved ? '✓ Saved to Vault' : savingWord ? 'Saving...' : '+ Save to Vocabulary'}
                </button>
                {lookupResult?._saveError && !wordSaved && (
                  <p className="text-xs text-red-500 text-center mt-1">{lookupResult._saveError}</p>
                )}
              </>
            ) : (
              <p className="text-sm text-[var(--color-tea-500)] text-center py-4">
                No definition found for "<span className="font-medium">{lookupWord}</span>".
                <br />
                <button
                  onClick={() => setShowLookup(false)}
                  className="mt-3 block mx-auto text-xs text-[var(--color-tea-700)] underline"
                >
                  Add manually to Vault →
                </button>
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Reader;
