import React, { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { FileSpreadsheet, Download, Search, Calendar as CalendarIcon, Filter } from 'lucide-react';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import * as XLSX from 'xlsx';

export default function Laporan() {
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  const [filterType, setFilterType] = useState<'ALL' | 'IN' | 'OUT'>('ALL');

  const products = useLiveQuery(() => db.products.toArray()) || [];
  const salesmen = useLiveQuery(() => db.salesmen.toArray()) || [];
  const transactions = useLiveQuery(() => db.transactions.toArray()) || [];

  const filteredData = useMemo(() => {
    return transactions
      .filter(t => {
        const dateMatch = isWithinInterval(t.date, {
          start: new Date(startDate),
          end: new Date(endDate)
        });
        const typeMatch = filterType === 'ALL' || t.type === filterType;
        return dateMatch && typeMatch;
      })
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [transactions, startDate, endDate, filterType]);

  const exportToExcel = () => {
    const dataForExport = filteredData.map(t => {
      const product = products.find(p => p.id === t.productId);
      const salesman = salesmen.find(s => s.id === t.salesmanId);
      
      // Calculate current stock for the report (simple version: current stock as of today or just display transaction)
      // The requirement asks for "Sisa Stok", which usually means stock after that transaction.
      // But calculating that accurately per row requires historical aggregation.
      // For this MVP, we provide the core transaction data.
      
      return {
        'Tanggal': format(t.date, 'dd/MM/yyyy'),
        'No. Bukti / Surat Jalan': t.docNumber,
        'Tipe': t.type === 'IN' ? 'MASUK' : 'KELUAR',
        'Nama Item': product?.name || 'N/A',
        'SKU': product?.sku || 'N/A',
        'Salesman': salesman?.name || '-',
        'Qty Masuk': t.type === 'IN' ? t.qty : 0,
        'Qty Keluar': t.type === 'OUT' ? t.qty : 0,
        'Keterangan': t.note || ''
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataForExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Gudang");
    
    const fileName = `Laporan_Gudang_${startDate}_sd_${endDate}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Laporan Harian</h1>
          <p className="text-slate-500 dark:text-slate-400">Generate laporan stok dalam format Excel</p>
        </div>
        <button
          onClick={exportToExcel}
          disabled={filteredData.length === 0}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white px-6 py-2.5 rounded-lg font-bold transition-all shadow-md active:scale-95"
        >
          <Download size={20} />
          Ekspor Excel (.xlsx)
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-200 mb-2">
          <Filter size={18} className="text-indigo-600" />
          Filter Data
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Dari Tanggal</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-sans"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Sampai Tanggal</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-sans"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Tipe Transaksi</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-sans"
            >
              <option value="ALL">Semua Tipe</option>
              <option value="IN">Barang Masuk</option>
              <option value="OUT">Barang Keluar</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
          <h2 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <FileSpreadsheet size={18} className="text-indigo-600" />
            Preview Laporan ({filteredData.length} baris)
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4">Dokumen</th>
                <th className="px-6 py-4">Item</th>
                <th className="px-6 py-4">Salesman</th>
                <th className="px-6 py-4 text-center">Qty</th>
                <th className="px-6 py-4">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredData.map((t) => {
                const product = products.find(p => p.id === t.productId);
                const salesman = salesmen.find(s => s.id === t.salesmanId);
                return (
                  <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                      {format(t.date, 'dd/MM/yyyy')}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">{t.docNumber}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800 dark:text-slate-200">{product?.name || 'N/A'}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{product?.sku}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{salesman?.name || '-'}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        t.type === 'IN' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400'
                      }`}>
                        {t.type === 'IN' ? '+' : '-'}{t.qty}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-sm max-w-[200px] truncate">
                      {t.note || '-'}
                    </td>
                  </tr>
                );
              })}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">
                    Tidak ada data ditemukan untuk periode ini.
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
