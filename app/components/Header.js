export default function Header({ title, subtitle }) {
  return (
    <header className="app-header">
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>

      <div className="header-right">
        <span className="role">Administrator</span>
        <div className="avatar">A</div>
      </div>
    </header>
  );
}
