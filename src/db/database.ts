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
  color?: string;
}

const db = new Dexie('FactuangDB') as Dexie & {
  transactions: EntityTable<Transaction, 'id'>;
  categories: EntityTable<Category, 'id'>;
};

// Schema definition
db.version(4).stores({
  transactions: '++id, type, category, date',
  categories: '++id, &name, icon, color',
});

db.version(3)
  .stores({
    transactions: '++id, type, category, date',
    categories: '++id, &name',
  })
  .upgrade(async (tx) => {
    // Migration logic for Indonesian categories
    const categoriesTable = tx.table('categories');
    const existingCategories = await categoriesTable.toArray();

    const mapping: Record<string, string> = {
      Food: 'Makanan & Minuman',
      Transport: 'Transportasi',
      Shopping: 'Belanja',
      Bills: 'Tagihan',
      Entertainment: 'Hiburan',
      Health: 'Kesehatan',
      Other: 'Lainnya',
    };

    for (const cat of existingCategories) {
      if (mapping[cat.name]) {
        // Update category name
        await categoriesTable.update(cat.id, { name: mapping[cat.name] });

        // Also update existing transactions that use this category
        await tx
          .table('transactions')
          .where('category')
          .equals(cat.name)
          .modify({ category: mapping[cat.name] });
      }
    }

    // If still empty, seed all
    if (existingCategories.length === 0) {
      await categoriesTable.bulkAdd([
        { name: 'Makanan & Minuman', icon: 'Utensils', color: 'bg-rose-500' },
        { name: 'Transportasi', icon: 'Car', color: 'bg-indigo-500' },
        { name: 'Belanja', icon: 'ShoppingBag', color: 'bg-amber-500' },
        { name: 'Tagihan', icon: 'Receipt', color: 'bg-emerald-500' },
        { name: 'Hiburan', icon: 'Gamepad2', color: 'bg-purple-500' },
        { name: 'Kesehatan', icon: 'HeartPulse', color: 'bg-rose-400' },
        { name: 'Pendidikan', icon: 'GraduationCap', color: 'bg-cyan-500' },
        { name: 'Sedekah', icon: 'Heart', color: 'bg-pink-500' },
        { name: 'Lainnya', icon: 'Box', color: 'bg-slate-500' },
      ]);
    }
  });

// Keep version 2 for compatibility if needed, though Dexie handles it
db.version(2).stores({
  transactions: '++id, type, category, date',
  categories: '++id, &name',
});

// Initial seed for new databases
db.on('populate', async () => {
  await db.categories.bulkAdd([
    { name: 'Makanan & Minuman', icon: 'Utensils', color: 'bg-rose-500' },
    { name: 'Transportasi', icon: 'Car', color: 'bg-indigo-500' },
    { name: 'Belanja', icon: 'ShoppingBag', color: 'bg-amber-500' },
    { name: 'Tagihan', icon: 'Receipt', color: 'bg-emerald-500' },
    { name: 'Hiburan', icon: 'Gamepad2', color: 'bg-purple-500' },
    { name: 'Kesehatan', icon: 'HeartPulse', color: 'bg-rose-400' },
    { name: 'Pendidikan', icon: 'GraduationCap', color: 'bg-cyan-500' },
    { name: 'Sedekah', icon: 'Heart', color: 'bg-pink-500' },
    { name: 'Lainnya', icon: 'Box', color: 'bg-slate-500' },
  ]);
});

export type { Transaction, Category };
export { db };
