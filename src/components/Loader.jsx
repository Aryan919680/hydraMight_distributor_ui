export default function Loader({ label = 'Loading...' }) {
  return (
    <div className="loader-card">
      <div className="spinner" />
      <span>{label}</span>
    </div>
  );
}
