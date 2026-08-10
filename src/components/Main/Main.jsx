import { useEffect, useRef, useState } from 'react';
import { Menu, SquarePen, Trash2, CodeXml, Coffee, Server, Sparkles, TriangleAlert, X } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import ChatMessage from '../ChatMessage/ChatMessage';
import PromptCard from '../PromptCard/PromptCard';
import ChatInput from '../ChatInput/ChatInput';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import './Main.css';

const SUGGESTIONS = [
  { icon: CodeXml, title: 'Explain React Hooks' },
  { icon: Coffee, title: 'Write a Java program' },
  { icon: Server, title: 'Explain AWS EC2' },
  { icon: Sparkles, title: 'Create a Python project idea' },
];

function Main({ onOpenSidebar }) {
  const { activeConversation, sendMessage, isGenerating, error, setError, startNewChat } = useChat();
  const [confirmingClear, setConfirmingClear] = useState(false);
  const scrollRef = useRef(null);

  const messages = activeConversation?.messages || [];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length, messages[messages.length - 1]?.content]);

  const handleClearChat = () => {
    if (confirmingClear) {
      startNewChat();
      setConfirmingClear(false);
    } else {
      setConfirmingClear(true);
      setTimeout(() => setConfirmingClear(false), 3000);
    }
  };

  return (
    <main className="main">
      <header className="main-header">
        <button className="icon-btn menu-btn" onClick={onOpenSidebar} aria-label="Open sidebar">
          <Menu size={20} />
        </button>
        <h1 className="main-title">Nexora AI</h1>
        <div className="main-header-actions">
          {activeConversation && (
            <button
              className={`icon-btn ${confirmingClear ? 'is-danger' : ''}`}
              onClick={handleClearChat}
              title="Clear this conversation"
              aria-label="Clear conversation"
            >
              <Trash2 size={18} />
            </button>
          )}
          <button className="icon-btn" onClick={startNewChat} title="New chat" aria-label="New chat">
            <SquarePen size={18} />
          </button>
          <ThemeToggle />
        </div>
      </header>

      {error && (
        <div className="error-banner" role="alert">
          <TriangleAlert size={16} />
          <span>{error}</span>
          <button onClick={() => setError(null)} aria-label="Dismiss error">
            <X size={14} />
          </button>
        </div>
      )}

      <div className="main-content" ref={scrollRef}>
        {!activeConversation ? (
          <div className="welcome-screen">
            <h2 className="welcome-gradient-text">Hello, I'm Nexora AI</h2>
            <p className="welcome-subtitle">How can I help you today?</p>

            <div className="suggestion-grid">
              {SUGGESTIONS.map((s) => (
                <PromptCard key={s.title} icon={s.icon} title={s.title} onClick={() => sendMessage(s.title)} />
              ))}
            </div>
          </div>
        ) : (
          <div className="message-list">
            {messages.map((msg, i) => (
              <ChatMessage
                key={i}
                message={msg}
                isStreaming={isGenerating && i === messages.length - 1 && msg.role === 'assistant'}
              />
            ))}
          </div>
        )}
      </div>

      <ChatInput />
    </main>
  );
}

export default Main;
