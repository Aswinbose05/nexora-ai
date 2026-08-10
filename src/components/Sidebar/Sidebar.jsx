import { useState } from 'react';
import {
  PanelLeftClose,
  PanelLeftOpen,
  SquarePen,
  MessageSquareText,
  CircleHelp,
  Activity,
  Settings,
  Trash2,
  X,
} from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import './Sidebar.css';

function Sidebar({ isOpen, onClose }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { conversations, activeId, startNewChat, selectConversation, deleteConversation, clearAllHistory } =
    useChat();

  const handleSelect = (id) => {
    selectConversation(id);
    onClose();
  };

  const handleNewChat = () => {
    startNewChat();
    onClose();
  };

  return (
    <>
      {/* Mobile scrim, only rendered while the drawer is open */}
      {isOpen && <div className="sidebar-scrim" onClick={onClose} />}

      <aside className={`sidebar ${isCollapsed ? 'is-collapsed' : ''} ${isOpen ? 'is-open' : ''}`}>
        <div className="sidebar-top">
          <button
            className="icon-btn sidebar-toggle"
            onClick={() => setIsCollapsed((c) => !c)}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
          </button>
          <button className="icon-btn sidebar-close-mobile" onClick={onClose} aria-label="Close sidebar">
            <X size={20} />
          </button>
        </div>

        <button className="new-chat-btn" onClick={handleNewChat}>
          <SquarePen size={18} />
          {!isCollapsed && <span>New chat</span>}
        </button>

        <nav className="sidebar-recent">
          {!isCollapsed && conversations.length > 0 && <p className="sidebar-label">Recent</p>}
          <ul>
            {conversations.map((conv) => (
              <li key={conv.id}>
                <button
                  className={`recent-item ${conv.id === activeId ? 'is-active' : ''}`}
                  onClick={() => handleSelect(conv.id)}
                  title={conv.title}
                >
                  <MessageSquareText size={16} className="recent-icon" />
                  {!isCollapsed && <span className="recent-title">{conv.title}</span>}
                  {!isCollapsed && (
                    <span
                      className="recent-delete"
                      role="button"
                      tabIndex={0}
                      aria-label="Delete conversation"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConversation(conv.id);
                      }}
                    >
                      <Trash2 size={14} />
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
          {!isCollapsed && conversations.length === 0 && (
            <p className="sidebar-empty">Your conversations will show up here.</p>
          )}
        </nav>

        <div className="sidebar-bottom">
          <button className="sidebar-nav-item" title="Help">
            <CircleHelp size={18} />
            {!isCollapsed && <span>Help</span>}
          </button>
          <button className="sidebar-nav-item" title="Activity">
            <Activity size={18} />
            {!isCollapsed && <span>Activity</span>}
          </button>
          <button className="sidebar-nav-item" title="Settings">
            <Settings size={18} />
            {!isCollapsed && <span>Settings</span>}
          </button>
          {!isCollapsed && conversations.length > 0 && (
            <button className="sidebar-nav-item sidebar-clear" onClick={clearAllHistory} title="Clear all history">
              <Trash2 size={18} />
              <span>Clear all history</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
