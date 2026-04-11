import Dexie, { type EntityTable } from 'dexie';

interface Transaction {
  id?: number;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  date: string;
  note?: string;
}

const db = new Dexie('FactuangDB') as Dexie & {
  transactions: EntityTable<Transaction, 'id'>;
};

// Schema definition: id is primary key (auto-increment)
// Index fields that we'll query by often
db.version(1).stores({
  transactions: '++id, type, category, date',
});

export type { Transaction };
export { db };
