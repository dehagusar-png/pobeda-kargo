import { Bell, Search, User } from "lucide-react";

export default function Topbar() {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-10 shadow-sm">
      <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 w-full max-w-xs md:w-96 ml-12 md:ml-0 focus-within:ring-2 focus-within:ring-red-500 transition-all">
        <Search className="text-gray-400 mr-2" size={20} />
        <input 
          type="text" 
          placeholder="Ҷустуҷӯ аз рӯи Трек-код..." 
          className="bg-transparent border-none outline-none w-full text-sm text-gray-700 placeholder-gray-400"
        />
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-700">Администратор</p>
            <p className="text-xs text-gray-500">admin@pobedakargo.tj</p>
          </div>
          <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-bold">
            <User size={20} />
          </div>
        </div>
      </div>
    </header>
  );
}
