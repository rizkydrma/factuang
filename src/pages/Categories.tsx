import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { Trash2, Plus, ChevronLeft, Tag } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Categories: React.FC = () => {
  const navigate = useNavigate();
  const [newCategory, setNewCategory] = useState('');

  const categories = useLiveQuery(() => db.categories.toArray()) || [];

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    try {
      await db.categories.add({ name: newCategory.trim() });
      setNewCategory('');
    } catch (error) {
      alert('Kategori sudah ada atau terjadi kesalahan.');
    }
  };

  const handleDeleteCategory = async (id: number, name: string) => {
    // Check if category is being used in transactions
    const count = await db.transactions.where('category').equals(name).count();
    if (count > 0) {
      alert(
        `Kategori "${name}" sedang digunakan oleh ${count} transaksi. Tidak bisa dihapus.`,
      );
      return;
    }

    if (confirm(`Hapus kategori "${name}"?`)) {
      await db.categories.delete(id);
    }
  };

  return (
    <div className="flex flex-col min-h-screen animate-in fade-in duration-700">
      {/* Page Header */}
      <header className="px-8 pt-8 pb-6 flex items-center justify-between bg-background border-b border-secondary/20">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full hover:bg-secondary/20"
          >
            <ChevronLeft size={24} strokeWidth={2.5} />
          </Button>
          <div className="space-y-0.5">
            <h2 className="text-xl font-black uppercase tracking-tighter text-foreground">
              Kategori
            </h2>
            <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em]">
              Management
            </p>
          </div>
        </div>
        <Tag size={24} className="text-foreground/30" />
      </header>

      <div className="flex-1 p-6 space-y-8">
        {/* Add New Category */}
        <form onSubmit={handleAddCategory} className="space-y-3">
          <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40 ml-2">
            Tambah Kategori Baru
          </Label>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Nama kategori..."
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="flex-1 h-14 bg-white border-secondary rounded-2xl focus-visible:ring-primary font-bold placeholder:text-foreground/20 shadow-sm"
            />
            <Button
              type="submit"
              size="icon"
              className="h-14 w-14 rounded-2xl shadow-lg shadow-primary/20"
            >
              <Plus size={24} strokeWidth={3} />
            </Button>
          </div>
        </form>

        {/* Category List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-foreground/40">
              Daftar Kategori
            </h3>
            <span className="text-[10px] font-bold text-primary bg-secondary/20 px-2 py-0.5 rounded-full">
              {categories.length} Total
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {categories.map((cat) => (
              <Card
                key={cat.id}
                className="group bg-white border-secondary/50 p-4 rounded-2xl flex items-center justify-between hover:border-primary transition-all duration-300 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-secondary/10 text-primary">
                    <Tag size={18} strokeWidth={2.5} />
                  </div>
                  <p className="font-black uppercase tracking-tight text-foreground text-sm">
                    {cat.name}
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    cat.id && handleDeleteCategory(cat.id, cat.name)
                  }
                  className="h-8 w-8 text-foreground/10 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Internal Label component since we're using shadcn ui labels usually,
// but I'll import it properly if available or just use a div
import { Label } from '@/components/ui/label';

export default Categories;
