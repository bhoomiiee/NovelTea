import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { motion } from 'framer-motion';
import { BookOpen, UserPlus } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-tea-50)] px-4 relative overflow-hidden">
      {/* Glow overlays */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.05)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[radial-gradient(circle,rgba(186,129,83,0.05)_0%,transparent_70%)] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full vintage-glass rounded-3xl overflow-hidden vintage-shadow-premium border border-[var(--color-tea-200)]"
      >
        <div className="bg-[var(--color-tea-150,rgba(246,236,223,0.7))] p-8 text-center border-b border-[var(--color-tea-200)] relative">
          {/* Ornate corner line */}
          <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-[var(--color-tea-500)]/30 rounded-tl" />
          <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-[var(--color-tea-500)]/30 rounded-tr" />
          
          <motion.div 
            initial={{ scale: 0, rotate: 20 }}
            animate={{ scale: 1, rotate: -3 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-16 h-16 bg-[var(--color-tea-800)] text-[var(--color-amber-gold)] border border-[var(--color-tea-950)] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
          >
            <BookOpen size={30} className="animate-pulse" />
          </motion.div>
          <h2 className="text-3xl font-extrabold text-[var(--color-tea-950)] font-serif tracking-wide">Join NovelTea</h2>
          <p className="text-[var(--color-tea-700)] mt-2 font-medium text-sm">Start your premium reading journey today.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {error && (
            <div className="bg-red-50/80 border border-red-200 text-red-600 p-3.5 rounded-xl text-sm text-center font-bold">
              {error}
            </div>
          )}
          
          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold text-[var(--color-tea-850)] uppercase tracking-wider">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[var(--color-tea-250,var(--color-tea-300))] focus:ring-2 focus:ring-[var(--color-tea-500)] focus:border-transparent outline-none transition-all bg-white/60 font-medium text-sm"
              placeholder="Jane Doe"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold text-[var(--color-tea-850)] uppercase tracking-wider">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[var(--color-tea-250,var(--color-tea-300))] focus:ring-2 focus:ring-[var(--color-tea-500)] focus:border-transparent outline-none transition-all bg-white/60 font-medium text-sm"
              placeholder="reader@noveltea.com"
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold text-[var(--color-tea-850)] uppercase tracking-wider">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[var(--color-tea-250,var(--color-tea-300))] focus:ring-2 focus:ring-[var(--color-tea-500)] focus:border-transparent outline-none transition-all bg-white/60 font-medium text-sm"
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full py-4 bg-[var(--color-tea-800)] hover:bg-[var(--color-tea-900)] text-white rounded-xl font-extrabold shadow-md hover:shadow-lg border-b-4 border-[var(--color-tea-950)] transition-all flex justify-center items-center gap-2 cursor-pointer text-sm tracking-wide mt-2"
          >
            <UserPlus size={18} className="text-[var(--color-amber-gold)]" />
            Create Study Account
          </motion.button>

          <p className="text-center text-sm text-[var(--color-tea-700)] font-medium">
            Already have an account?{' '}
            <Link to="/login" className="font-extrabold text-[var(--color-tea-900)] hover:text-[var(--color-tea-950)] underline decoration-wavy decoration-[var(--color-tea-400)]">
              Sign In here
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
};

export default Register;
