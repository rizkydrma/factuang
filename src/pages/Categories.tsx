import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useLiveQuery } from 'dexie-react-hooks';
import { AnimatePresence, motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Delete02Icon,
  Add01Icon,
  SparklesIcon,
} from '@hugeicons/core-free-icons';
import React, { useMemo, useState } from 'react';
import { db, type Category } from '../db/database';
import PageHeader from '@/components/PageHeader';
import SearchBar from '@/components/SearchBar';
import { ICON_MAP, DEFAULT_ICON, AVAILABLE_ICONS } from '@/constants/icons';
import { AVAILABLE_COLORS, DEFAULT_CATEGORY_COLOR } from '@/constants/colors';

const Categories: React.FC = () => {
  const [newCategory, setNewCategory] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Tag');
  const [selectedColor, setSelectedColor] = useState(DEFAULT_CATEGORY_COLOR);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const liveCategories = useLiveQuery(() => db.categories.toArray());
  const categories = useMemo(() => liveCategories || [], [liveCategories]);

  const filteredCategories = useMemo(
    () =>
      categories.filter((cat) =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [categories, searchTerm],
  );

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    try {
      await db.categories.add({
        name: newCategory.trim(),
        icon: selectedIcon,
        color: selectedColor,
      });
      setNewCategory('');
      setSelectedIcon('Tag');
      setSelectedColor(DEFAULT_CATEGORY_COLOR);
      setIsAdding(false);
    } catch {
      alert('Kategori sudah ada atau terjadi kesalahan.');
    }
  };

  const getIconComponent = (name: string) => {
    return ICON_MAP[name] || DEFAULT_ICON;
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    const { id, name } = categoryToDelete;
    const count = await db.transactions.where('category').equals(name).count();

    if (count > 0) {
      alert(`"${name}" is in use by ${count} transactions. Cannot delete.`);
      setCategoryToDelete(null);
      return;
    }

    await db.categories.delete(id);
    setCategoryToDelete(null);
  };

  const getCategoryColor = (cat: Category) => {
    if (cat.color) return `${cat.color}/10 text-${cat.color.split('-')[1]}-500`;

    const colors = AVAILABLE_COLORS.map(
      (c) => `${c}/10 text-${c.split('-')[1]}-500`,
    );
    let hash = 0;
    const name = cat.name || '';
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 transition-colors duration-300 relative">
      <PageHeader
        title="Categories"
        subtitle="Manage your record types"
        showBack
      />

      <main className="max-w-2xl mx-auto px-6 pt-6 pb-32 space-y-8">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Quick search..."
        />

        <section className="flex flex-col gap-3">
          <AnimatePresence mode="popLayout">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((cat) => {
                const icon = getIconComponent(cat.icon || '');
                return (
                  <motion.div
                    layout
                    key={cat.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="group relative bg-card border border-border/40 rounded-xl p-4 flex items-center justify-between hover:border-primary/30 transition-all cursor-default shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          'w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm',
                          getCategoryColor(cat),
                        )}
                      >
                        <HugeiconsIcon
                          icon={icon}
                          size={20}
                          strokeWidth={2.5}
                        />
                      </div>

                      <div className="space-y-0.5">
                        <p className="font-bold text-sm uppercase tracking-tight">
                          {cat.name}
                        </p>
                        <p className="text-[10px] font-medium opacity-30 uppercase tracking-widest">
                          Ref #{cat.id}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        cat.id &&
                        setCategoryToDelete({ id: cat.id, name: cat.name })
                      }
                      className="p-2.5 rounded-xl text-foreground/10 group-hover:text-destructive group-hover:bg-destructive/5 transition-all active:scale-90 flex items-center justify-center"
                    >
                      <HugeiconsIcon icon={Delete02Icon} size={16} />
                    </button>
                  </motion.div>
                );
              })
            ) : (
              <div className="py-20 flex flex-col items-center justify-center text-center opacity-20">
                <HugeiconsIcon icon={SparklesIcon} size={32} className="mb-4" />
                <p className="text-xs font-bold uppercase tracking-widest">
                  No matching categories
                </p>
              </div>
            )}
          </AnimatePresence>
        </section>
      </main>

      {/* Floating Action Button for Categories */}
      <div className="fixed bottom-24 right-6 z-40">
        <button
          onClick={() => setIsAdding(true)}
          className="w-14 h-14 bg-primary text-white rounded-2xl shadow-xl shadow-primary/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
          aria-label="Add Category"
        >
          <HugeiconsIcon icon={Add01Icon} size={24} strokeWidth={3} />
        </button>
      </div>

      <Dialog
        open={!!categoryToDelete}
        onOpenChange={(open) => !open && setCategoryToDelete(null)}
      >
        <DialogContent className="max-w-[320px] rounded-2xl border-none shadow-2xl bg-card text-foreground">
          <DialogHeader className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-2">
              <HugeiconsIcon icon={Delete02Icon} size={24} strokeWidth={2.5} />
            </div>
            <DialogTitle className="text-xl font-bold uppercase tracking-tight italic text-center">
              Are you sure?
            </DialogTitle>
            <DialogDescription className="text-xs font-medium opacity-60 text-center px-2 leading-relaxed text-foreground/60">
              This will permanently delete the category{' '}
              <span className="font-bold text-foreground">
                "{categoryToDelete?.name}"
              </span>{' '}
              and all its associations.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 pt-4">
            <Button
              variant="destructive"
              onClick={handleDeleteCategory}
              className="w-full h-12 rounded-2xl font-bold uppercase tracking-widest text-[11px] shadow-lg shadow-destructive/20"
            >
              Delete Category
            </Button>
            <Button
              variant="ghost"
              onClick={() => setCategoryToDelete(null)}
              className="w-full h-11 rounded-xl font-bold opacity-40 hover:opacity-100 transition-all text-foreground"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Drawer open={isAdding} onOpenChange={setIsAdding}>
        <DrawerContent className="bg-card text-foreground">
          <div className="mx-auto w-full max-w-md text-foreground">
            <DrawerHeader>
              <DrawerTitle className="text-xl font-bold uppercase tracking-tight italic">
                New Category
              </DrawerTitle>
            </DrawerHeader>
            <form onSubmit={handleAddCategory} className="p-4 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 px-1">
                  Category Name
                </label>
                <input
                  autoFocus
                  placeholder="e.g. Subscriptions, Coffee, Rent..."
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full h-12 px-4 bg-secondary/50 border-none rounded-2xl focus:ring-1 focus:ring-primary/30 font-semibold outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 px-1">
                  Select Icon
                </label>
                <div className="grid grid-cols-5 gap-2 max-h-40 overflow-y-auto p-1 scrollbar-hide">
                  {AVAILABLE_ICONS.map(({ name, icon: iconComp }) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setSelectedIcon(name)}
                      className={cn(
                        'aspect-square rounded-xl flex items-center justify-center transition-all',
                        selectedIcon === name
                          ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/20'
                          : 'bg-secondary text-foreground/40 hover:bg-secondary/80',
                      )}
                    >
                      <HugeiconsIcon icon={iconComp} size={20} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 px-1">
                  Select Color
                </label>
                <div className="flex flex-wrap gap-3 p-1">
                  {AVAILABLE_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={cn(
                        'w-8 h-8 rounded-full transition-all flex items-center justify-center',
                        color,
                        selectedColor === color
                          ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-110'
                          : 'opacity-80 hover:opacity-100 hover:scale-105',
                      )}
                    >
                      {selectedColor === color && (
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 pb-6">
                <Button
                  type="submit"
                  disabled={!newCategory.trim()}
                  className="w-full h-14 rounded-2xl text-base font-bold uppercase tracking-widest shadow-xl shadow-primary/30"
                >
                  Create Category
                </Button>
              </div>
            </form>
          </div>
        </DrawerContent>
      </Drawer>

      <div className="fixed bottom-0 left-0 right-0 h-32 bg-linear-to-t from-background to-transparent pointer-events-none" />
    </div>
  );
};

export default Categories;
