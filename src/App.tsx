import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PackagePlus, 
  PackageMinus, 
  Package, 
  Users, 
  FileSpreadsheet,
  Menu,
  Settings as SettingsIcon,
  X
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

// Pages - Initial Implementation
import Dashboard from './pages/Dashboard';
import MasterProduk from './pages/MasterProduk';
import MasterSalesman from './pages/MasterSalesman';
import BarangMasuk from './pages/BarangMasuk';
import BarangKeluar from './pages/BarangKeluar';
import Laporan from './pages/Laporan';
import Settings from './pages/Settings';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/barang-masuk', label: 'Barang Masuk', icon: PackagePlus },
  { path: '/barang-keluar', label: 'Barang Keluar', icon: PackageMinus },
  { path: '/produk', label: 'Master Produk', icon: Package },
  { path: '/salesman', label: 'Master Salesman', icon: Users },
  { path: '/laporan', label: 'Laporan Harian', icon: FileSpreadsheet },
  { path: '/settings', label: 'Pengaturan', icon: SettingsIcon },
];

function Sidebar({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (v: boolean) => void }) {
  const location = useLocation();
  const [appName] = useState(() => localStorage.getItem('app_name') || 'Sanvinal');

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : -280 }}
        className={cn(
          "fixed top-0 left-0 bottom-0 w-[280px] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-50 lg:translate-x-0 transition-transform duration-300 ease-in-out",
          !isOpen && "lg:block"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xl font-bold text-indigo-600 tracking-tight leading-none">
              {appName} <span className="text-slate-800 dark:text-slate-200 font-medium">Gudang</span>
            </span>
          </div>

          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400" 
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
                  )}
                >
                  <Icon size={20} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-100 dark:border-slate-800">
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mb-1">Status Sistem</p>
              <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Database Aktif
              </div>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
}

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [darkMode] = useState(() => localStorage.getItem('dark_mode') === 'true');
  const [appName] = useState(() => localStorage.getItem('app_name') || 'Sanvinal');

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <Router>
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex transition-colors duration-300 font-sans">
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

        <main className="flex-1 lg:pl-[280px] min-w-0">
          <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 lg:hidden sticky top-0 z-30">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg"
            >
              <Menu size={24} />
            </button>
            <span className="ml-4 font-bold text-slate-800 dark:text-slate-100">{appName} Gudang</span>
          </header>

          <div className="max-w-7xl mx-auto p-4 md:p-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/barang-masuk" element={<BarangMasuk />} />
              <Route path="/barang-keluar" element={<BarangKeluar />} />
              <Route path="/produk" element={<MasterProduk />} />
              <Route path="/salesman" element={<MasterSalesman />} />
              <Route path="/laporan" element={<Laporan />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}
