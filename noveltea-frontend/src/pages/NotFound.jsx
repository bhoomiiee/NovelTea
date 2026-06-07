import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Coffee, Home, BookOpen } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[var(--color-tea-50)] flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <div className="w-24 h-24 bg-[var(--color-tea-100)] rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <Coffee size={44} className="text-[var(--color-tea-500)]" />
        </div>
        <h1 className="text-7xl font-extrabold text-[var(--color-tea-800)] font-serif mb-2">404</h1>
        <h2 className="text-2xl font-bold text-[var(--color-tea-950)] mb-3">Page not found</h2>
        <p className="text-[var(--color-tea-600)] mb-8 leading-relaxed">
          Looks like this page wandered off to find a quiet corner to read. Let's get you back on track.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--color-tea-800)] text-white rounded-xl font-bold shadow-md hover:bg-[var(--color-tea-900)] transition-colors"
          >
            <Home size={18} /> Go to Dashboard
          </button>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-[var(--color-tea-300)] text-[var(--color-tea-700)] rounded-xl font-bold hover:bg-[var(--color-tea-100)] transition-colors"
          >
            <BookOpen size={18} /> Go Back
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
