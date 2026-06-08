export default function Toast({ type = 'info', message, onClose }) {
  if (!message) return null;

  return (
    <div className={`toast toast-${type}`}>
      <span>{message}</span>
      <button type="button" onClick={onClose}>×</button>
    </div>
  );
}
