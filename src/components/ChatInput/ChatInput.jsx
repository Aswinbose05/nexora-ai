import { useEffect, useRef, useState } from 'react';
import { ArrowUp, Square } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import './ChatInput.css';

function ChatInput() {
  const [value, setValue] = useState('');
  const textareaRef = useRef(null);
  const { sendMessage, isGenerating, stopGeneration } = useChat();

  // Auto-grow the textarea up to a max height, then let it scroll.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [value]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!value.trim() || isGenerating) return;
    sendMessage(value);
    setValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form className="chat-input" onSubmit={handleSubmit}>
      <div className="chat-input-inner">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message Nexora AI..."
          rows={1}
          disabled={isGenerating}
        />
        {isGenerating ? (
          <button type="button" className="send-btn is-stop" onClick={stopGeneration} aria-label="Stop generating">
            <Square size={14} fill="currentColor" />
          </button>
        ) : (
          <button type="submit" className="send-btn" disabled={!value.trim()} aria-label="Send message">
            <ArrowUp size={18} />
          </button>
        )}
      </div>
      <p className="chat-input-hint">
        Nexora AI may display inaccurate info. Verify important details.
      </p>
    </form>
  );
}

export default ChatInput;
