import Sidebar from './Sidebar';

const AppLayout = ({ children }) => (
  <div className="flex h-screen bg-[var(--color-tea-50)] overflow-hidden">
    <Sidebar />
    {/* On mobile, add top padding so content clears the hamburger button */}
    <main className="flex-1 overflow-y-auto pt-0 lg:pt-0">
      <div className="lg:hidden h-14" /> {/* spacer for mobile hamburger */}
      {children}
    </main>
  </div>
);

export default AppLayout;
