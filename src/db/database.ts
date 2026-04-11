import Dexie, { type EntityTable } from 'dexie';

interface Transaction {
  id?: number;
  type: 'expense';
  amount: number;
  category: string;
  date: string;
  note?: string;
}

interface Category {
  id?: number;
  name: string;
  icon?: string;
}

const db = new Dexie('FactuangDB') as Dexie & {
  transactions: EntityTable<Transaction, 'id'>;
  categories: EntityTable<Category, 'id'>;
};

// Schema definition
db.version(2)
  .stores({
    transactions: '++id, type, category, date',
    categories: '++id, &name',
  })
  .upgrade(async (tx) => {
    // If upgrading from v1, seed default categories
    const count = await tx.table('categories').count();
    if (count === 0) {
      await tx
        .table('categories')
        .bulkAdd([
          { name: 'Food' },
          { name: 'Transport' },
          { name: 'Shopping' },
          { name: 'Bills' },
          { name: 'Entertainment' },
          { name: 'Health' },
          { name: 'Other' },
        ]);
    }
  });

// Initial seed for new databases
db.on('populate', async () => {
  await db.categories.bulkAdd([
    { name: 'Food' },
    { name: 'Transport' },
    { name: 'Shopping' },
    { name: 'Bills' },
    { name: 'Entertainment' },
    { name: 'Health' },
    { name: 'Other' },
  ]);
});

export type { Transaction, Category };
export { db };
