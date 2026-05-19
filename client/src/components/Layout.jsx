import { Link, useLocation } from 'react-router-dom';
import { CalendarDays, LayoutDashboard, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">ADAS</span><div><strong>Advanced ADAS</strong><small>Job Scheduler</small></div></div>
        <nav>
          <Link className={location.pathname === '/' ? 'active' : ''} to="/"><CalendarDays size={18}/>Calendar</Link>
          {isAdmin && <Link className={location.pathname === '/admin' ? 'active' : ''} to="/admin"><LayoutDashboard size={18}/>Admin Dashboard</Link>}
        </nav>
        <div className="user-card"><strong>{user.name}</strong><span>{user.role}</span><button onClick={logout}><LogOut size={16}/>Logout</button></div>
      </aside>
      <main className="content">{children}</main>
    </div>
  );
}
