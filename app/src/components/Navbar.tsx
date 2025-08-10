import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-10 backdrop-saturate-150 backdrop-blur bg-white/70 border-b border-gray-200">
      <div className="container flex items-center justify-between py-3">
        <div className="font-bold tracking-tight">FinMind</div>
        <nav className="flex items-center gap-4">
          <Link className="text-gray-900 hover:underline" to="/categories">Categories</Link>
        </nav>
      </div>
    </header>
  );
}
