import React, { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { PackageMinus, History, Trash2, Calendar as CalendarIcon, User, Plus, X } from 'lucide-react';
import { motion } from 'motion/react';
import { format, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

export default function BarangKeluar() {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [salesmanId, setSalesmanId] = useState<string>('');
  const [isAdding, setIsAdding] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(50);
  
  // Filter states
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterProductId, setFilterProductId] = useState('');
  const [filterSalesmanId, setFilterSalesmanId] = useState('');
  
  // Current item selection
  const [productId, setProductId] = useState<string>('');
  const [qty, setQty] = useState<number>(0);
  const [note, setNote] = useState('');
  
  // Temporary list for batching
  const [items, setItems] = useState<{ productId: number, productName: string, sku: string, qty: number, note: string }[]>([]);

  const products = useLiveQuery(() => db.products.toArray());
  const salesmen = useLiveQuery(() => db.salesmen.toArray());
  const transactions = useLiveQuery(() => 
    db.transactions
      .where('type').equals('OUT')
      .reverse()
      .toArray()
  );

  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];
    
    return transactions.filter(t => {
      const matchProduct = filterProductId ? t.productId === parseInt(filterProductId) : true;
      const matchSalesman = filterSalesmanId ? t.salesmanId === parseInt(filterSalesmanId) : true;
      
      let matchDate = true;
      if (filterStartDate && filterEndDate) {
        matchDate = isWithinInterval(t.date, {
          start: startOfDay(new Date(filterStartDate)),
          end: endOfDay(new Date(filterEndDate))
        });
      } else if (filterStartDate) {
        matchDate = t.date >= startOfDay(new Date(filterStartDate));
      } else if (filterEndDate) {
        matchDate = t.date <= endOfDay(new Date(filterEndDate));
      }
      
      return matchProduct && matchSalesman && matchDate;
    });
  }, [transactions, filterStartDate, filterEndDate, filterProductId, filterSalesmanId]);

  const clearFilters = () => {
    setFilterStartDate('');
    setFilterEndDate('');
    setFilterProductId('');
    setFilterSalesmanId('');
  };

  const addItemToList = () => {
    if (!productId || qty <= 0) return;
    const product = products?.find(p => p.id === parseInt(productId));
    if (!product) return;

    setItems([...items, {
      productId: product.id!,
      productName: product.name,
      sku: product.sku,
      qty,
      note
    }]);

    // Reset item inputs
    setProductId('');
    setQty(0);
    setNote('');
  };

  const removeItemFromList = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSaveBatch = async () => {
    if (items.length === 0 || !salesmanId || !date) return;

    try {
      const salesman = salesmen?.find(s => s.id === parseInt(salesmanId));
      const formattedDate = format(new Date(date), 'ddMMyyyy');
      const docNumber = `SJ-${formattedDate}-${salesman?.name.split(' ')[0] || 'TEMP'}`;

      const batchEntries = items.map(item => ({
        date: new Date(date),
        type: 'OUT' as const,
        docNumber,
        productId: item.productId,
        salesmanId: parseInt(salesmanId),
        qty: item.qty,
        note: item.note
      }));

      await db.transactions.bulkAdd(batchEntries);
      
      setItems([]);
      setIsAdding(false);
    } catch (error) {
      console.error("Failed to save batch:", error);
    }
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    if (confirm('Hapus histori transaksi ini?')) {
      await db.transactions.delete(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Barang Keluar</h1>
          <p className="text-slate-500 dark:text-slate-400">Pencatatan item per Surat Pengantar Barang per Salesman</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-lg font-bold transition-all shadow-md active:scale-95"
        >
          <PackageMinus size={20} />
          Input Baru
        </button>
      </div>

      {isAdding && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 rounded-xl border-2 border-rose-100 dark:border-rose-900 shadow-xl overflow-hidden"
        >
          <div className="p-4 bg-rose-50 dark:bg-rose-900/20 border-b border-rose-100 dark:border-rose-800 flex flex-wrap gap-4">
            <div className="flex-1 min-w-[150px] space-y-1">
              <label className="text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase">Tanggal</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 px-3 py-2 rounded border border-rose-200 dark:border-rose-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 dark:text-white"
              />
            </div>
            <div className="flex-[2] min-w-[200px] space-y-1">
              <label className="text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase">Salesman / Store Keeper</label>
              <select
                value={salesmanId}
                onChange={(e) => setSalesmanId(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 px-3 py-2 rounded border border-rose-200 dark:border-rose-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 dark:text-white"
              >
                <option value="">-- Pilih Salesman --</option>
                {salesmen?.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-10 gap-4 items-end bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
              <div className="md:col-span-4 space-y-1">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Produk</label>
                <select
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white"
                >
                  <option value="">-- Pilih Produk --</option>
                  {products?.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Qty</label>
                <input
                  type="number"
                  min="1"
                  value={qty || ''}
                  onChange={(e) => setQty(parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div className="md:col-span-3 space-y-1">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Keterangan</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Opsional"
                  className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div className="md:col-span-1">
                <button
                  type="button"
                  onClick={addItemToList}
                  disabled={!productId || qty <= 0}
                  className="w-full h-[42px] bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 transition-colors flex items-center justify-center"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>

            {items.length > 0 && (
              <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-4 py-2 text-left text-slate-600 dark:text-slate-400 font-bold">Produk</th>
                      <th className="px-4 py-2 text-center text-slate-600 dark:text-slate-400 font-bold w-24">Qty</th>
                      <th className="px-4 py-2 text-left text-slate-600 dark:text-slate-400 font-bold">Catatan</th>
                      <th className="px-4 py-2 text-right text-slate-600 dark:text-slate-400 font-bold w-16"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {items.map((item, idx) => (
                      <tr key={idx} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                        <td className="px-4 py-2">
                          <div className="font-medium">{item.productName}</div>
                          <div className="text-[10px] text-slate-500">{item.sku}</div>
                        </td>
                        <td className="px-4 py-2 text-center font-bold text-rose-600">-{item.qty}</td>
                        <td className="px-4 py-2 text-slate-500 italic">{item.note || '-'}</td>
                        <td className="px-4 py-2 text-right">
                          <button onClick={() => removeItemFromList(idx)} className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 p-1 rounded">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 pt-6">
              <button
                type="button"
                onClick={() => { setItems([]); setIsAdding(false); }}
                className="px-6 py-2 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveBatch}
                disabled={items.length === 0 || !salesmanId}
                className="px-8 py-2 bg-rose-600 text-white font-bold hover:bg-rose-700 rounded-lg shadow-lg disabled:bg-slate-300 dark:disabled:bg-slate-700 transition-all flex items-center gap-2"
              >
                Simpan Surat Pengantar Barang
              </button>
            </div>
          </div>
        </motion.div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-4 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200">
              <History size={18} className="text-slate-400" />
              Histori Barang Keluar
            </div>
            
            {(filterStartDate || filterEndDate || filterProductId || filterSalesmanId) && (
              <button 
                onClick={clearFilters}
                className="text-xs font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1 bg-rose-50 dark:bg-rose-900/20 px-2 py-1 rounded"
              >
                <X size={12} /> Hapus Filter
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Dari Tanggal</label>
              <input
                type="date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
                className="w-full text-xs bg-white dark:bg-slate-800 px-2 py-1.5 rounded border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20 dark:text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Sampai Tanggal</label>
              <input
                type="date"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
                className="w-full text-xs bg-white dark:bg-slate-800 px-2 py-1.5 rounded border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20 dark:text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Filter Salesman</label>
              <select
                value={filterSalesmanId}
                onChange={(e) => setFilterSalesmanId(e.target.value)}
                className="w-full text-xs bg-white dark:bg-slate-800 px-2 py-1.5 rounded border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20 dark:text-white"
              >
                <option value="">Semua Salesman</option>
                {salesmen?.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Filter Produk</label>
              <select
                value={filterProductId}
                onChange={(e) => setFilterProductId(e.target.value)}
                className="w-full text-xs bg-white dark:bg-slate-800 px-2 py-1.5 rounded border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20 dark:text-white"
              >
                <option value="">Semua Produk</option>
                {products?.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tanggal</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Item</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Salesman</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Qty</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTransactions?.slice(0, displayLimit).map((t) => {
                const product = products?.find(p => p.id === t.productId);
                const salesman = salesmen?.find(s => s.id === t.salesmanId);
                return (
                  <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-2">
                        <CalendarIcon size={14} className="text-slate-400" />
                        {format(t.date, 'dd MMM yyyy', { locale: idLocale })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 truncate max-w-[200px]">{product?.name || 'Item Dihapus'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-medium">
                        <User size={14} className="text-slate-400" />
                        {salesman?.name || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400">
                        -{t.qty}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-rose-900/30 rounded-lg transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredTransactions?.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                    Pencarian tidak ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {filteredTransactions && filteredTransactions.length > displayLimit && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 flex flex-col items-center gap-2">
            <p className="text-xs text-slate-500 italic">Menampilkan {displayLimit} dari {filteredTransactions.length} histori</p>
            <button 
              onClick={() => setDisplayLimit(prev => prev + 50)}
              className="px-6 py-2 bg-rose-600 text-white text-xs font-bold rounded-lg hover:bg-rose-700 transition-colors"
            >
              Muat Lebih Banyak...
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
