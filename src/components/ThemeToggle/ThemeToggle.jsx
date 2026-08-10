import { Sun, Moon } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import './ThemeToggle.css';

function ThemeToggle() {
  const { theme, toggleTheme } = useChat();
  const isDark = theme === 'dark';

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className={`theme-toggle-track ${isDark ? 'is-dark' : ''}`}>
        <span className="theme-toggle-thumb">
          {isDark ? <Moon size={12} /> : <Sun size={12} />}
        </span>
      </span>
    </button>
  );
}

export default ThemeToggle;
