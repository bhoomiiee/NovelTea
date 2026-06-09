import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import AppLayout from '../components/AppLayout';
import { motion } from 'framer-motion';
import { Upload, Book, FileText, ArrowLeft, CheckCircle } from 'lucide-react';
import API from '../api';

const GENRES = [
  'Self-Help', 'Fiction', 'Non-Fiction', 'Sci-Fi', 'Fantasy',
  'Biography', 'Mystery', 'Thriller', 'Romance', 'History',
  'Philosophy', 'Science', 'Business', 'Psychology', 'Poetry',
  'Classic', 'Horror', 'Adventure', 'Graphic Novel', 'General',
];

const UploadBook = () => {
  const [title, setTitle]   = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre]   = useState('');
  const [file, setFile]     = useState(null);
  const [loading, setLoading]           = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [stage, setStage]   = useState(''); // 'uploading' | 'saving' | 'done'
  const [error, setError]   = useState(null);

  const { token } = useContext(AuthContext);
  const navigate  = useNavigate();

  const handleFileChange = (e) => {
    if (e.target.files?.length > 0) {
      const f = e.target.files[0];
      if (f.type !== 'application/pdf') { setError('Please upload a PDF file.'); setFile(null); return; }
      setFile(f);
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { setError('A PDF file is required.'); return; }

    setLoading(true);
    setError(null);
    setUploadProgress(0);
    setStage('uploading');

    try {
      // Step 1 — get a signed upload signature from our backend
      setStage('uploading');
      const sigRes = await axios.get(`${API}/api/books/upload-signature`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const { signature, timestamp, cloud_name, api_key, folder } = sigRes.data;

      // Step 2 — upload directly from browser to Cloudinary using signed params
      const cloudForm = new FormData();
      cloudForm.append('file', file);
      cloudForm.append('api_key', api_key);
      cloudForm.append('timestamp', timestamp);
      cloudForm.append('signature', signature);
      cloudForm.append('folder', folder);
      cloudForm.append('resource_type', 'raw');

      const cloudRes = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloud_name}/raw/upload`,
        cloudForm,
        {
          onUploadProgress: (ev) => {
            setUploadProgress(Math.round((ev.loaded * 100) / ev.total));
          },
        }
      );

      const fileUrl = cloudRes.data.secure_url;

      // Step 3 — save metadata to our backend (instant, just JSON)
      setStage('saving');
      await axios.post(
        `${API}/api/books/register`,
        { title, author, genre, fileUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setStage('done');
      setTimeout(() => navigate('/dashboard'), 800);

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
      setStage('');
    } finally {
      setLoading(false);
    }
  };

  const stageLabel = () => {
    if (stage === 'uploading') return `Uploading... ${uploadProgress}%`;
    if (stage === 'saving')    return 'Saving to your library...';
    if (stage === 'done')      return '✓ Added to bookshelf!';
    return 'Add to Bookshelf';
  };

  return (
    <AppLayout>
      <div className="py-10 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-8 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={20} className="text-[var(--color-tea-600)]" />
            <span className="font-bold text-[var(--color-tea-700)] hover:text-[var(--color-tea-950)] transition-colors">Back to Dashboard</span>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-lg p-8 border border-[var(--color-tea-100)]"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[var(--color-tea-100)] text-[var(--color-tea-700)] rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload size={32} />
              </div>
              <h2 className="text-3xl font-bold text-[var(--color-tea-950)]">Upload a Book</h2>
              <p className="text-[var(--color-tea-700)] mt-2">Add a new PDF to your personal library.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center text-sm font-medium">{error}</div>}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-tea-900)] mb-2">Book Title</label>
                  <div className="relative">
                    <Book className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-tea-400)]" size={20} />
                    <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-[var(--color-tea-200)] focus:ring-2 focus:ring-[var(--color-tea-400)] outline-none bg-[var(--color-tea-50)]"
                      placeholder="e.g. Atomic Habits" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-tea-900)] mb-2">Author</label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-tea-400)]" size={20} />
                    <input type="text" required value={author} onChange={(e) => setAuthor(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-[var(--color-tea-200)] focus:ring-2 focus:ring-[var(--color-tea-400)] outline-none bg-[var(--color-tea-50)]"
                      placeholder="e.g. James Clear" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-tea-900)] mb-2">Genre / Category</label>
                <select value={genre} onChange={(e) => setGenre(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--color-tea-200)] focus:ring-2 focus:ring-[var(--color-tea-400)] outline-none bg-[var(--color-tea-50)]">
                  <option value="">Select a genre...</option>
                  {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-tea-900)] mb-2">Upload PDF File</label>
                <div className="border-2 border-dashed border-[var(--color-tea-300)] bg-[var(--color-tea-50)] rounded-2xl p-10 text-center hover:bg-[var(--color-tea-100)] transition-colors relative cursor-pointer">
                  <input type="file" accept="application/pdf" onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <div className="pointer-events-none flex flex-col items-center">
                    {file ? (
                      <>
                        <FileText className="text-[var(--color-tea-600)] mb-3" size={40} />
                        <p className="text-[var(--color-tea-900)] font-bold">{file.name}</p>
                        <p className="text-xs text-[var(--color-tea-600)] mt-1">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </>
                    ) : (
                      <>
                        <Upload className="text-[var(--color-tea-400)] mb-3" size={40} />
                        <p className="text-[var(--color-tea-700)] font-medium mb-1">Click to browse or drag and drop</p>
                        <p className="text-[var(--color-tea-500)] text-sm">PDF files only (Max 50MB)</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              {loading && stage === 'uploading' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium text-[var(--color-tea-700)]">
                    <span>Uploading to cloud...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-[var(--color-tea-100)] rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--color-tea-600)] rounded-full transition-all duration-200"
                      style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}

              <button type="submit" disabled={loading}
                className={`w-full py-4 mt-2 rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2 ${
                  stage === 'done' ? 'bg-green-600 text-white'
                  : loading ? 'bg-[var(--color-tea-400)] text-[var(--color-tea-100)] cursor-not-allowed'
                  : 'bg-[var(--color-tea-800)] text-white hover:bg-[var(--color-tea-900)]'
                }`}>
                {stage === 'done' && <CheckCircle size={18} />}
                {stageLabel()}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
};

export default UploadBook;
