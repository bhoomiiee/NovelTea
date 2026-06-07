import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { useContext } from 'react';
import AuthContext from './context/AuthContext';

// Pages
import Home         from './pages/Home';
import Login        from './pages/Login';
import Register     from './pages/Register';
import Dashboard    from './pages/Dashboard';
import UploadBook   from './pages/UploadBook';
import Reader       from './pages/Reader';
import VocabularyVault from './pages/VocabularyVault';
import Quotes       from './pages/Quotes';
import Analytics    from './pages/Analytics';
import MoodRecommend from './pages/MoodRecommend';
import Community    from './pages/Community';
import Journal      from './pages/Journal';
import Goals        from './pages/Goals';
import Profile      from './pages/Profile';
import NotFound     from './pages/NotFound';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-tea-50)]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-[var(--color-tea-300)] border-t-[var(--color-tea-700)] rounded-full animate-spin" />
        <p className="text-sm text-[var(--color-tea-600)] font-medium">Brewing your session...</p>
      </div>
    </div>
  );
  return user ? children : <Navigate to="/login" />;
};

const P = (Component) => <ProtectedRoute><Component /></ProtectedRoute>;

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
            <Route path="/"           element={<Home />} />
            <Route path="/login"      element={<Login />} />
            <Route path="/register"   element={<Register />} />
            <Route path="/dashboard"  element={P(Dashboard)} />
            <Route path="/upload"     element={P(UploadBook)} />
            <Route path="/reader/:id" element={P(Reader)} />
            <Route path="/vocabulary" element={P(VocabularyVault)} />
            <Route path="/quotes"     element={P(Quotes)} />
            <Route path="/analytics"  element={P(Analytics)} />
            <Route path="/mood"       element={P(MoodRecommend)} />
            <Route path="/community"  element={P(Community)} />
            <Route path="/journal"    element={P(Journal)} />
            <Route path="/goals"      element={P(Goals)} />
            <Route path="/profile"    element={P(Profile)} />
            <Route path="*"           element={<NotFound />} />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
