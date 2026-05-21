import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Plus, Trash2, Search, UserCheck } from 'lucide-react';
import { motion } from 'motion/react';

export default function MasterSalesman() {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const salesmen = useLiveQuery(
    () => db.salesmen.filter(s => 
      s.name.toLowerCase().includes(search.toLowerCase()) || 
      s.code.toLowerCase().includes(search.toLowerCase())
    ).toArray(),
    [search]
  );

  const handleAddSalesman = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) return;

    try {
      await db.salesmen.add({ name, code });
      setName('');
      setCode('');
      setIsAdding(false);
    } catch (error) {
      console.error("Failed to add salesman:", error);
    }
  };

  const handleDeleteSalesman = async (id?: number) => {
    if (id === undefined) return;
    
    try {
      await db.salesmen.delete(id);
    } catch (error) {
      console.error("Gagal menghapus salesman:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Master Salesman</h1>
          <p className="text-slate-500 dark:text-slate-400">Kelola daftar salesman untuk pencatatan barang keluar</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
        >
          <Plus size={20} />
          Salesman Baru
        </button>
      </div>

      {isAdding && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-2xl"
        >
          <form onSubmit={handleAddSalesman} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase">Nama Lengkap</label>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Budi Santoso"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase">Kode / Inisial</label>
              <input
                required
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="BS-01"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3 mt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-indigo-600 text-white font-medium hover:bg-indigo-700 rounded-lg transition-colors"
              >
                Simpan Salesman
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center bg-slate-50/50 dark:bg-slate-800/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari salesman..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white dark:bg-slate-800 dark:text-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nama Salesman</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Kode</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {salesmen?.map((salesman) => (
                <tr key={salesman.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                        <UserCheck size={18} />
                      </div>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{salesman.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-mono text-sm uppercase">{salesman.code}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDeleteSalesman(salesman.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-rose-900/30 rounded-lg transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {salesmen?.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-slate-400 italic">
                    Belum ada data salesman. Klik "Salesman Baru" untuk menambahkan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
