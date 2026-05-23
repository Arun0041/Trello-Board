import { Search, Grid } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Navbar({ searchQuery, onSearchChange }) {
  return (
    <header className="h-12 bg-black/45 backdrop-blur-sm border-b border-white/10 flex items-center justify-between px-3 shrink-0 z-20 text-white">
      {/* Left side: Logo */}
      <div className="flex items-center gap-3 min-w-[150px]">
        <Link to="/" className="hover:bg-white/10 p-1.5 rounded transition-colors flex items-center justify-center">
          <Grid size={18} />
        </Link>

        <Link to="/" className="flex items-center gap-1.5 font-bold text-lg tracking-tight hover:opacity-80 transition-opacity">
          <div className="flex gap-[2px]">
            <div className="w-1.5 h-3.5 bg-white/90 rounded-sm"></div>
            <div className="w-1.5 h-2.5 bg-white/90 rounded-sm"></div>
          </div>
          Trello
        </Link>
      </div>

      {/* Middle side: Centered Search */}
      <div className="flex-1 flex justify-center max-w-[500px]">
        <div className="relative w-full hidden md:block">
          <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/60" />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery || ''}
            onChange={e => onSearchChange(e.target.value)}
            className="pl-8 pr-3 py-1.5 bg-white/20 border border-white/20 rounded-md text-sm w-full text-white placeholder:text-white/60 focus:bg-[#22272b] focus:border-blue-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* Right side: Profile */}
      <div className="flex items-center justify-end gap-2 min-w-[150px]">
        <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-[11px] font-bold cursor-pointer ring-1 ring-white/20">
          AG
        </div>
      </div>
    </header>
  );
}
