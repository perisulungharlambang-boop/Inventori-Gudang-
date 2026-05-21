import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Moon, 
  Sun, 
  Database, 
  Download, 
  Upload, 
  RefreshCcw, 
  Building,
  Save,
  AlertTriangle
} from 'lucide-react';
import { db } from '../db';
import { motion } from 'motion/react';

export default function Settings() {
  const [appName, setAppName] = useState(() => localStorage.getItem('app_name') || 'Sanvinal');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('dark_mode') === 'true');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleSaveAppName = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    localStorage.setItem('app_name', appName);
    setTimeout(() => {
      setIsSaving(false);
      window.location.reload(); // Reload to refresh sidebar and other components
    }, 500);
  };

  const toggleDarkMode = () => {
    const newVal = !darkMode;
    setDarkMode(newVal);
    localStorage.setItem('dark_mode', newVal.toString());
    
    // Applying directly for immediate feedback
    if (newVal) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Reload after a small delay to sync the whole App state
    setTimeout(() => {
      window.location.reload();
    }, 300);
  };

  const backupDatabase = async () => {
    try {
      const products = await db.products.toArray();
      const salesmen = await db.salesmen.toArray();
      const transactions = await db.transactions.toArray();

      const data = {
        products,
        salesmen,
        transactions,
        version: 1,
        exportedAt: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_lengkap_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Backup failed:", error);
      alert("Gagal melakukan backup database.");
    }
  };

  const backupMasterData = async () => {
    try {
      const products = await db.products.toArray();
      const salesmen = await db.salesmen.toArray();

      // Master data only, transactions is empty to reset quantities
      const data = {
        products,
        salesmen,
        transactions: [], 
        version: 1,
        type: 'MASTER_ONLY',
        exportedAt: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_master_produk_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Master backup failed:", error);
      alert("Gagal melakukan backup master data.");
    }
  };

  const restoreDatabase = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        
        if (confirm('Restorasi akan menghapus data saat ini. Lanjutkan?')) {
          await db.transaction('rw', db.products, db.salesmen, db.transactions, async () => {
            await db.products.clear();
            await db.salesmen.clear();
            await db.transactions.clear();

            await db.products.bulkAdd(data.products || []);
            await db.salesmen.bulkAdd(data.salesmen || []);
            await db.transactions.bulkAdd(data.transactions || []);
          });
          alert('Database berhasil di-restorasi!');
          window.location.reload();
        }
      } catch (error) {
        console.error("Restore failed:", error);
        alert("Gagal melakukan restorasi data. Pastikan format file benar.");
      }
    };
    reader.readAsText(file);
  };

  const resetApplication = async () => {
    if (confirm('PERINGATAN: Ini akan menghapus SELURUH data aplikasi termasuk pengaturan. Tindakan ini tidak dapat dibatalkan. Lanjutkan?')) {
      try {
        // Stop any active db connections if possible, though Dexie handles delete well
        await db.delete();
        
        // Clear all settings (dark mode, app name, etc)
        localStorage.clear();
        
        alert('Aplikasi telah berhasil di-reset ke pengaturan awal.');
        
        // Use href reload to ensure a fresh start from the root
        window.location.href = '/';
      } catch (error) {
        console.error("Reset failed:", error);
        // Fallback: reach manual clear if delete fails
        await Promise.all([
          db.products.clear(),
          db.salesmen.clear(),
          db.transactions.clear()
        ]);
        localStorage.clear();
        window.location.href = '/';
      }
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <SettingsIcon className="text-indigo-600" />
          Pengaturan Aplikasi
        </h1>
        <p className="text-slate-500 dark:text-slate-400">Sesuaikan aplikasi dan kelola basis data</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Tampilan & Identitas */}
        <div className="space-y-6">
          <section className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              <Building size={20} className="text-indigo-600" />
              Identitas Perusahaan
            </h2>
            <form onSubmit={handleSaveAppName} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">Nama Perusahaan</label>
                <input
                  type="text"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                <Save size={18} />
                {isSaving ? 'Menyimpan...' : 'Simpan Nama'}
              </button>
            </form>
          </section>

          <section className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              {darkMode ? <Moon size={20} className="text-indigo-400" /> : <Sun size={20} className="text-amber-500" />}
              Mode Tampilan
            </h2>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Mode Gelap (Dark Mode)</span>
              <button
                onClick={toggleDarkMode}
                className={`w-12 h-6 rounded-full transition-colors relative ${darkMode ? 'bg-indigo-600' : 'bg-slate-200'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${darkMode ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          </section>
        </div>

        {/* Database Management */}
        <div className="space-y-6">
          <section className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              <Database size={20} className="text-indigo-600" />
              Kelola Basis Data
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-3">
                <p className="text-sm text-slate-600 dark:text-slate-400 font-bold flex items-center gap-2">
                  <Download size={16} className="text-emerald-500" />
                  Backup Semua Data
                </p>
                <p className="text-xs text-slate-500">Mencadangkan Produk, Salesman, dan seluruh riwayat Transaksi (Stok tetap ada).</p>
                <button
                  onClick={backupDatabase}
                  className="flex items-center gap-2 w-full justify-center bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-white px-4 py-2.5 rounded-lg font-bold hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors shadow-sm"
                >
                  Backup Database Lengkap
                </button>
              </div>

              <div className="p-4 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-lg border border-emerald-100 dark:border-emerald-900/30 space-y-3">
                <p className="text-sm text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-2">
                  <Download size={16} />
                  Backup Master Produk
                </p>
                <p className="text-xs text-emerald-600/70 dark:text-emerald-500/70">Hanya mencadangkan nama item & kode produk. Tanpa riwayat transaksi (Quantity jadi nol).</p>
                <button
                  onClick={backupMasterData}
                  className="flex items-center gap-2 w-full justify-center bg-emerald-600 text-white px-4 py-2.5 rounded-lg font-bold hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  Backup Master (Tanpa Qty)
                </button>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-3">
                <p className="text-sm text-slate-600 dark:text-slate-400">Kembalikan data dari file cadangan. Ini akan menimpa data yang ada saat ini.</p>
                <label className="flex items-center gap-2 w-full justify-center bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-white px-4 py-2.5 rounded-lg font-bold hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors shadow-sm cursor-pointer">
                  <Upload size={20} className="text-indigo-600" />
                  Restore Database
                  <input type="file" accept=".json" onChange={restoreDatabase} className="hidden" />
                </label>
              </div>
            </div>
          </section>

          <section className="bg-rose-50 dark:bg-rose-950/20 p-6 rounded-xl border border-rose-100 dark:border-rose-900 shadow-sm">
            <h2 className="text-lg font-bold text-rose-800 dark:text-rose-400 mb-4 flex items-center gap-2">
              <AlertTriangle size={20} />
              Area Berbahaya
            </h2>
            <div className="space-y-4">
              <p className="text-sm text-rose-600 dark:text-rose-500">Ini akan menghapus seluruh data produk, salesman, dan riwayat transaksi secara permanen.</p>
              <button
                onClick={resetApplication}
                className="flex items-center gap-2 w-full justify-center bg-rose-600 text-white px-4 py-2.5 rounded-lg font-bold hover:bg-rose-700 transition-all shadow-md active:scale-95"
              >
                <RefreshCcw size={20} />
                Reset Seluruh Aplikasi
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
