import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { TrendingUp, Home, BarChart2, Brain, Sun, Moon } from 'lucide-react';
import './Header.css';

export default function Header() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const toggleMenu = () => {
    setMenuOpen(prev => !prev);
  };

  return (
    <header className="header">
      <div className="header-inner">
        {/* Brand */}
        <a 
          className="header-brand" 
          onClick={(e) => {
            e.preventDefault();
            setMenuOpen(false);
            navigate('/');
          }} 
          href="/"
        >
          <div className="header-brand-icon">
            <TrendingUp size={18} strokeWidth={2.5} />
          </div>
          <span className="header-brand-name">Stock<span>GPT</span></span>
        </a>

        {/* Nav */}
        <nav className={`header-nav ${menuOpen ? 'mobile-open' : ''}`}>
          <NavLink 
            to="/" 
            end 
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            <span className="nav-item-icon"><Home size={15} strokeWidth={2} /></span> Home
          </NavLink>
          <NavLink 
            to="/stocks" 
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            <span className="nav-item-icon"><BarChart2 size={15} strokeWidth={2} /></span> Markets
          </NavLink>
          <NavLink 
            to="/how-it-works" 
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            <span className="nav-item-icon"><Brain size={15} strokeWidth={2} /></span> How It Works
          </NavLink>
        </nav>

        {/* Right side */}
        <div className="header-right">
          {/* Theme Toggle Button */}
          <button 
            className="theme-toggle-btn" 
            onClick={toggleTheme} 
            aria-label="Toggle Theme"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px',
              borderRadius: '50%',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            {theme === 'dark' ? <Sun size={18} strokeWidth={2} /> : <Moon size={18} strokeWidth={2} />}
          </button>

          <div className="live-chip">
            <span className="live-dot"></span>
            StockGPT Live
          </div>
        </div>

        {/* Mobile hamburger */}
        <button 
          className={`hamburger ${menuOpen ? 'active' : ''}`} 
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span></span><span></span><span></span>
        </button>
      </div>
    </header>
  );
}
