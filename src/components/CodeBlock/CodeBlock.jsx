import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import './CodeBlock.css';

// Renders a fenced code block with a language label and a copy button.
// Used as the custom `pre` renderer for react-markdown.
function CodeBlock({ language, children }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard API can fail on insecure origins — fail silently,
      // the copy button just won't show confirmation.
    }
  };

  return (
    <div className="code-block">
      <div className="code-block-header">
        <span className="code-block-lang">{language || 'text'}</span>
        <button className="code-block-copy" onClick={handleCopy}>
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? 'Copied!' : 'Copy code'}
        </button>
      </div>
      <pre className="code-block-pre">
        <code>{children}</code>
      </pre>
    </div>
  );
}

export default CodeBlock;
