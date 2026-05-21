import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Package, Users, ArrowUpRight, ArrowDownRight, LayoutDashboard, History } from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

export default function Dashboard() {
  const [appName] = React.useState(() => localStorage.getItem('app_name') || 'Sanvinal');
  const [stockLimit, setStockLimit] = React.useState(50);
  const [activityLimit, setActivityLimit] = React.useState(20);

  const productCount = useLiveQuery(() => db.products.count()) || 0;
  const salesmanCount = useLiveQuery(() => db.salesmen.count()) || 0;
  
  const products = useLiveQuery(() => db.products.toArray()) || [];
  const transactions = useLiveQuery(() => db.transactions.toArray()) || [];

  const recentTransactions = [...transactions]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, activityLimit);

  const calculateStock = (productId: number) => {
    const txs = transactions.filter(t => t.productId === productId);
    const incoming = txs.filter(t => t.type === 'IN').reduce((acc, curr) => acc + curr.qty, 0);
    const outgoing = txs.filter(t => t.type === 'OUT').reduce((acc, curr) => acc + curr.qty, 0);
    return incoming - outgoing;
  };

  const totalIncoming = transactions.filter(t => t.type === 'IN').reduce((acc, curr) => acc + curr.qty, 0);
  const totalOutgoing = transactions.filter(t => t.type === 'OUT').reduce((acc, curr) => acc + curr.qty, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 uppercase tracking-tight">Ringkasan Gudang {appName}</h1>
        <p className="text-slate-500 dark:text-slate-400">Pantau status stok dan aktivitas terbaru gudang Anda</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Produk" 
          value={productCount.toString()} 
          icon={<Package className="text-indigo-600" />} 
          color="bg-indigo-50 dark:bg-indigo-900/20"
        />
        <StatCard 
          title="Total Salesman" 
          value={salesmanCount.toString()} 
          icon={<Users className="text-amber-600" />} 
          color="bg-amber-50 dark:bg-amber-900/20"
        />
        <StatCard 
          title="Total Masuk" 
          value={totalIncoming.toString()} 
          icon={<ArrowUpRight className="text-emerald-600" />} 
          color="bg-emerald-50 dark:bg-emerald-900/20"
          subtitle="Semua periode"
        />
        <StatCard 
          title="Total Keluar" 
          value={totalOutgoing.toString()} 
          icon={<ArrowDownRight className="text-rose-600" />} 
          color="bg-rose-50 dark:bg-rose-900/20"
          subtitle="Semua periode"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
              <h2 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <LayoutDashboard size={18} className="text-indigo-600" />
                Stok Saat Ini
              </h2>
            </div>
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 dark:bg-slate-800/50 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider sticky top-0 bg-white dark:bg-slate-900 z-10 shadow-sm">
                  <tr>
                    <th className="px-6 py-4">Nama Produk</th>
                    <th className="px-6 py-4">SKU</th>
                    <th className="px-6 py-4 text-center">Stok Akhir</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {products.slice(0, stockLimit).map((product) => {
                    const stock = calculateStock(product.id!);
                    return (
                      <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">{product.name}</td>
                        <td className="px-6 py-4 font-mono text-sm text-slate-500 dark:text-slate-400">{product.sku}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                            stock <= 10 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400'
                          }`}>
                            {stock} {product.unit}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {products.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-slate-400 italic">Belum ada data produk</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {products.length > stockLimit && (
              <div className="p-4 text-center border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 flex flex-col items-center gap-2">
                <p className="text-xs text-slate-500 italic">Menampilkan {stockLimit} dari {products.length} produk</p>
                <button 
                  onClick={() => setStockLimit(prev => prev + 50)}
                  className="px-4 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Muat Lebih Banyak...
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center gap-2">
              <History size={18} className="text-indigo-600" />
              <h2 className="font-bold text-slate-800 dark:text-slate-100">Aktivitas Terbaru</h2>
            </div>
            <div className="p-4 max-h-[600px] overflow-y-auto">
              <div className="space-y-4">
                {recentTransactions.map((t) => {
                  const product = products.find(p => p.id === t.productId);
                  return (
                    <div key={t.id} className="flex gap-3">
                      <div className={`mt-1 p-2 rounded-lg shrink-0 ${
                        t.type === 'IN' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600' : 'bg-rose-50 dark:bg-rose-900/30 text-rose-600'
                      }`}>
                        {t.type === 'IN' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                          {t.type === 'IN' ? 'Masuk: ' : 'Keluar: '} {product?.name || 'Item'}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {format(t.date, 'dd MMM HH:mm', { locale: idLocale })} • Qty: {t.qty}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {recentTransactions.length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-4 italic">Belum ada aktivitas</p>
                )}
                {transactions.length > activityLimit && (
                  <button 
                    onClick={() => setActivityLimit(prev => prev + 20)}
                    className="w-full py-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg transition-colors mt-2"
                  >
                    Muat Lebih Banyak...
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, subtitle }: { 
  title: string, 
  value: string, 
  icon: React.ReactNode, 
  color: string, 
  subtitle?: string 
}) {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${color}`}>
          {icon}
        </div>
      </div>
      <div>
        <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">{title}</h3>
        <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
        {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}
