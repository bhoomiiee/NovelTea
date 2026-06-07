import { useContext, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import {
  Coffee, LayoutDashboard, Quote, BarChart3, Smile, Users,
  LogOut, Upload, BookMarked, BookText, Target, UserCircle, Menu, X,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard'  },
  { to: '/vocabulary', icon: BookMarked,       label: 'Vocabulary' },
  { to: '/quotes',     icon: Quote,            label: 'My Quotes'  },
  { to: '/journal',    icon: BookText,         label: 'Journal'    },
  { to: '/goals',      icon: Target,           label: 'Goals'      },
  { to: '/analytics',  icon: BarChart3,        label: 'Analytics'  },
  { to: '/mood',       icon: Smile,            label: 'Mood Pick'  },
  { to: '/community',  icon: Users,            label: 'Community'  },
];

const SidebarContent = ({ onClose }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); onClose?.(); };

  return (
    <aside className="w-64 h-full bg-gradient-to-b from-[var(--color-tea-50)] to-[var(--color-tea-100)] border-r border-[var(--color-tea-200)] flex flex-col shadow-lg">
      {/* Logo */}
      <div className="p-5 flex items-center justify-between border-b border-[var(--color-tea-200)] bg-white/20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[var(--color-tea-800)] text-[var(--color-amber-gold)] rounded-xl flex items-center justify-center shadow-md border border-[var(--color-tea-950)]">
            <Coffee size={20} />
          </div>
          <div>
            <h1 className="font-extrabold text-[var(--color-tea-950)] text-xl leading-none font-serif tracking-wide">NovelTea</h1>
            <p className="text-[10px] font-bold text-[var(--color-tea-600)] mt-0.5 tracking-wider uppercase">Reading Oasis</p>
          </div>
        </div>
        {/* Close button — mobile only */}
        {onClose && (
          <button onClick={onClose} className="p-1.5 rounded-lg text-[var(--color-tea-600)] hover:bg-[var(--color-tea-200)] transition-colors lg:hidden">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-bold transition-all relative group ${
                isActive
                  ? 'bg-[var(--color-tea-800)] text-white shadow-md border-b-2 border-[var(--color-tea-950)]'
                  : 'text-[var(--color-tea-700)] hover:bg-[var(--color-tea-200)]/50 hover:text-[var(--color-tea-950)]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={18} className={isActive ? 'text-[var(--color-amber-gold)]' : 'text-[var(--color-tea-500)] group-hover:text-[var(--color-tea-800)]'} />
                {label}
                {isActive && <span className="absolute right-3 w-1.5 h-1.5 rounded-full bg-[var(--color-amber-gold)]" />}
              </>
            )}
          </NavLink>
        ))}

        <div className="pt-4 border-t border-[var(--color-tea-200)] mt-2 space-y-1.5">
          <button
            onClick={() => { navigate('/upload'); onClose?.(); }}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl text-sm font-extrabold text-white bg-[var(--color-tea-700)] hover:bg-[var(--color-tea-800)] transition-all shadow-md hover:shadow-lg border-b-2 border-[var(--color-tea-900)]"
          >
            <Upload size={18} /> Upload Book
          </button>
        </div>
      </nav>

      {/* User footer */}
      {user && (
        <div className="p-4 border-t border-[var(--color-tea-200)] bg-white/20 shrink-0">
          <div
            className="flex items-center gap-3 bg-[var(--color-tea-100)] border border-[var(--color-tea-200)] rounded-xl p-3 shadow-inner cursor-pointer hover:bg-[var(--color-tea-200)]/50 transition-colors"
            onClick={() => { navigate('/profile'); onClose?.(); }}
            title="View profile"
          >
            <div
              className="w-9 h-9 rounded-full border-2 border-[var(--color-tea-950)] flex items-center justify-center font-extrabold text-sm text-white shrink-0"
              style={{ background: user.avatarColor || '#8B5E3C' }}
            >
              {user.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-extrabold text-[var(--color-tea-950)] truncate">{user.name}</p>
              <p className="text-[9px] font-medium text-[var(--color-tea-600)] truncate">{user.email}</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); handleLogout(); }}
              title="Logout"
              className="text-[var(--color-tea-500)] hover:text-[var(--color-tea-800)] transition-colors shrink-0"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};

const Sidebar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar — always visible on lg+ */}
      <div className="hidden lg:flex shrink-0 h-screen sticky top-0 z-20">
        <SidebarContent />
      </div>

      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-30 p-2.5 bg-white border border-[var(--color-tea-200)] rounded-xl shadow-md text-[var(--color-tea-700)]"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* Mobile overlay + drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <div className="relative z-10 h-full w-64 animate-[slideInLeft_0.2s_ease-out]">
            <SidebarContent onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
