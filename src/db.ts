import Dexie, { type Table } from 'dexie';

export interface Product {
  id?: number;
  name: string;
  sku: string;
  unit: string;
}

export interface Salesman {
  id?: number;
  name: string;
  code: string;
}

export interface Transaction {
  id?: number;
  date: Date;
  type: 'IN' | 'OUT';
  docNumber: string; // Auto-generated: SP-DDMMYYYY for IN, SJ-DDMMYYYY-NAME for OUT
  productId: number;
  salesmanId?: number; // Only for OUT
  qty: number;
  note?: string;
}

export class SanvinalDB extends Dexie {
  products!: Table<Product>;
  salesmen!: Table<Salesman>;
  transactions!: Table<Transaction>;

  constructor() {
    super('SanvinalDB');
    this.version(1).stores({
      products: '++id, name, sku',
      salesmen: '++id, name, code',
      transactions: '++id, date, type, docNumber, productId, salesmanId'
    });
  }
}

export const db = new SanvinalDB();
