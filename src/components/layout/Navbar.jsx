import { Search, Grid } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Navbar({ searchQuery, onSearchChange }) {
  return (
    <header className="h-12 bg-[#1d2125] border-b border-white/10 flex items-center justify-between px-3 shrink-0 z-20 text-white">
      <div className="flex items-center gap-3">
        <Link to="/" className="hover:bg-white/10 p-1.5 rounded transition-colors">
          <Grid size={18} />
        </Link>

        <Link to="/" className="flex items-center gap-1.5 font-bold text-lg tracking-tight hover:opacity-80 transition-opacity">
          <div className="flex gap-[2px]">
            <div className="w-1.5 h-3.5 bg-white/90 rounded-sm"></div>
            <div className="w-1.5 h-2.5 bg-white/90 rounded-sm"></div>
          </div>
          Trello
        </Link>

        {/* Search */}
        <div className="relative ml-1 hidden md:block">
          <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/50" />
          <input
            type="text"
            placeholder="Search cards..."
            value={searchQuery || ''}
            onChange={e => onSearchChange(e.target.value)}
            className="pl-8 pr-3 py-1.5 bg-white/10 border border-white/20 rounded-md text-sm w-[280px] lg:w-[400px] text-white placeholder:text-white/40 focus:bg-[#22272b] focus:border-blue-500 outline-none transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-[11px] font-bold cursor-pointer ring-1 ring-white/20">
          AG
        </div>
      </div>
    </header>
  );
}
