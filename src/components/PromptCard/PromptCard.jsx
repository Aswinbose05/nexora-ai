import './PromptCard.css';

function PromptCard({ icon: Icon, title, onClick }) {
  return (
    <button className="prompt-card" onClick={onClick}>
      <span className="prompt-card-text">{title}</span>
      <span className="prompt-card-icon">
        <Icon size={18} />
      </span>
    </button>
  );
}

export default PromptCard;
