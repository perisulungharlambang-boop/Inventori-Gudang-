import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Product } from '../db';
import { Plus, Trash2, Search, Package } from 'lucide-react';
import { motion } from 'motion/react';

export default function MasterProduk() {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [unit, setUnit] = useState('');
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const products = useLiveQuery(
    () => db.products.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) || 
      p.sku.toLowerCase().includes(search.toLowerCase())
    ).toArray(),
    [search]
  );

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sku) return;

    try {
      await db.products.add({ name, sku, unit });
      setName('');
      setSku('');
      setUnit('');
      setIsAdding(false);
    } catch (error) {
      console.error("Failed to add product:", error);
    }
  };

  const handleDeleteProduct = async (id?: number) => {
    if (id === undefined) return;
    
    try {
      await db.products.delete(id);
    } catch (error) {
      console.error("Gagal menghapus produk:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Master Produk</h1>
          <p className="text-slate-500">Kelola daftar barang yang tersedia di gudang</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
        >
          <Plus size={20} />
          Produk Baru
        </button>
      </div>

      {isAdding && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm"
        >
          <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase">Nama Produk</label>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Sanvinal 10 EC"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase">SKU / Kode</label>
              <input
                required
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="SVL-001"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase">Satuan</label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="Ltr / Pcs"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
            <div className="md:col-span-2 lg:col-span-3 flex justify-end gap-3 mt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-indigo-600 text-white font-medium hover:bg-indigo-700 rounded-lg transition-colors"
              >
                Simpan Produk
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center bg-slate-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama atau SKU produk..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Produk</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Satuan</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products?.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                        <Package size={18} />
                      </div>
                      <span className="font-medium text-slate-800">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-mono text-sm">{product.sku}</td>
                  <td className="px-6 py-4 text-slate-600">{product.unit || '-'}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {products?.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">
                    Belum ada produk. Klik "Produk Baru" untuk menambahkan.
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
