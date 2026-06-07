import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import AppLayout from '../components/AppLayout';
import { motion } from 'framer-motion';
import { Upload, Book, FileText, ArrowLeft } from 'lucide-react';
import API from '../api';

const GENRES = [
  'Self-Help', 'Fiction', 'Non-Fiction', 'Sci-Fi', 'Fantasy',
  'Biography', 'Mystery', 'Thriller', 'Romance', 'History',
  'Philosophy', 'Science', 'Business', 'Psychology', 'Poetry',
  'Classic', 'Horror', 'Adventure', 'Graphic Novel', 'General',
];

const UploadBook = () => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'application/pdf') {
        setError('Please upload a PDF file.');
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('A PDF file is required.');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('author', author);
    formData.append('genre', genre);
    formData.append('pdf', file);

    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      };

      await axios.post(`${API}/api/books`, formData, config);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload book.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
    <div className="py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8 text-[var(--color-tea-950)] cursor-pointer" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={20} className="text-[var(--color-tea-600)]" />
          <span className="font-bold text-[var(--color-tea-700)] hover:text-[var(--color-tea-950)] transition-colors">Back to Dashboard</span>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
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
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center text-sm font-medium">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[var(--color-tea-900)] mb-2">Book Title</label>
                <div className="relative">
                  <Book className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[var(--color-tea-400)]" size={20} />
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-[var(--color-tea-200)] focus:ring-2 focus:ring-[var(--color-tea-400)] outline-none transition-all bg-[var(--color-tea-50)]"
                    placeholder="e.g. Atomic Habits"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--color-tea-900)] mb-2">Author</label>
                <div className="relative">
                  <FileText className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[var(--color-tea-400)]" size={20} />
                  <input
                    type="text"
                    required
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-[var(--color-tea-200)] focus:ring-2 focus:ring-[var(--color-tea-400)] outline-none transition-all bg-[var(--color-tea-50)]"
                    placeholder="e.g. James Clear"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-tea-900)] mb-2">Genre / Category</label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[var(--color-tea-200)] focus:ring-2 focus:ring-[var(--color-tea-400)] outline-none transition-all bg-[var(--color-tea-50)]"
              >
                <option value="">Select a genre...</option>
                {GENRES.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div className="mt-8">
              <label className="block text-sm font-medium text-[var(--color-tea-900)] mb-2">Upload PDF File</label>
              <div className="border-2 border-dashed border-[var(--color-tea-300)] bg-[var(--color-tea-50)] rounded-2xl p-10 text-center hover:bg-[var(--color-tea-100)] transition-colors relative cursor-pointer">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
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

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 mt-6 rounded-xl font-bold shadow-md transition-colors flex justify-center items-center gap-2 ${
                loading ? 'bg-[var(--color-tea-400)] text-[var(--color-tea-100)]' : 'bg-[var(--color-tea-800)] text-white hover:bg-[var(--color-tea-900)]'
              }`}
            >
              {loading ? 'Uploading...' : 'Add to Bookshelf'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
    </AppLayout>
  );
};

export default UploadBook;
