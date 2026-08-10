import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { User, Copy, Check } from 'lucide-react';
import CodeBlock from '../CodeBlock/CodeBlock';
import './ChatMessage.css';

const markdownComponents = {
  code({ inline, className, children }) {
    const match = /language-(\w+)/.exec(className || '');
    const text = String(children).replace(/\n$/, '');
    if (inline) {
      return <code className="inline-code">{text}</code>;
    }
    return <CodeBlock language={match?.[1]}>{text}</CodeBlock>;
  },
};

// A gradient "spark" avatar — the app's signature visual element,
// reused for the assistant's identity and as the loading indicator.
function SparkAvatar({ pulsing }) {
  return <span className={`spark-avatar ${pulsing ? 'is-pulsing' : ''}`} aria-hidden="true" />;
}

function TypingDots() {
  return (
    <div className="typing-dots" aria-label="Nexora AI is thinking">
      <span />
      <span />
      <span />
    </div>
  );
}

function ChatMessage({ message, isStreaming }) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (isStreaming) {
      bottomRef.current?.scrollIntoView({ block: 'nearest' });
    }
  }, [message.content, isStreaming]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  };

  const isEmptyAssistant = !isUser && message.content === '';

  return (
    <div className={`chat-message ${isUser ? 'is-user' : 'is-assistant'}`}>
      <div className="chat-message-avatar">
        {isUser ? (
          <span className="user-avatar">
            <User size={16} />
          </span>
        ) : (
          <SparkAvatar pulsing={isEmptyAssistant} />
        )}
      </div>

      <div className="chat-message-body">
        {isEmptyAssistant ? (
          <TypingDots />
        ) : isUser ? (
          <p className="chat-message-text">{message.content}</p>
        ) : (
          <div className="markdown-content">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
              {message.content}
            </ReactMarkdown>
          </div>
        )}

        {!isUser && !isEmptyAssistant && (
          <button className="message-copy-btn" onClick={handleCopy}>
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

export default ChatMessage;
