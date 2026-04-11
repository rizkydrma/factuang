import React, { useState, useEffect } from 'react';
import { X, ArrowRight, Delete, ChevronDown } from 'lucide-react';
import { db } from '../db/database';
import { useUIStore } from '../store/uiStore';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { useLiveQuery } from 'dexie-react-hooks';

const TransactionForm: React.FC = () => {
  const { isAddModalOpen, closeAddModal } = useUIStore();
  const [expression, setExpression] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');

  const categories = useLiveQuery(() => db.categories.toArray()) || [];

  useEffect(() => {
    if (categories.length > 0 && !category) {
      setCategory(categories[0].name);
    }
  }, [categories, category]);

  const calculateResult = (expr: string): string => {
    try {
      const cleanExpr = expr.replace(/[^-+*/.0-9]/g, '');
      if (!cleanExpr) return '0';
      // eslint-disable-next-line no-eval
      const result = eval(cleanExpr);
      return String(Math.max(0, Math.floor(result)));
    } catch {
      return '0';
    }
  };

  const handleKeyClick = (val: string) => {
    if (val === 'C') {
      setExpression('');
    } else if (val === 'DEL') {
      setExpression((prev) => prev.slice(0, -1));
    } else if (val === '=') {
      setExpression(calculateResult(expression));
    } else if (val === '000') {
      setExpression((prev) => prev + '000');
    } else {
      const lastChar = expression.slice(-1);
      const isOperator = ['+', '-', '*', '/'].includes(val);
      const lastIsOperator = ['+', '-', '*', '/'].includes(lastChar);

      if (
        (isOperator && expression === '' && val !== '-') ||
        (isOperator && lastIsOperator)
      ) {
        return;
      }
      setExpression((prev) => prev + val);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = calculateResult(expression);
    if (!finalAmount || finalAmount === '0') return;

    await db.transactions.add({
      type: 'expense',
      amount: Number(finalAmount),
      category: category || 'Other',
      date,
      note,
    });

    setExpression('');
    setNote('');
    closeAddModal();
  };

  return (
    <Drawer
      open={isAddModalOpen}
      onOpenChange={(open) => !open && closeAddModal()}
    >
      <DrawerContent className="bg-background max-w-120 mx-auto rounded-t-[32px] border-border shadow-2xl flex flex-col overflow-hidden max-h-[94vh]">
        <DrawerHeader className="px-8 py-4 flex flex-row items-center justify-between border-b border-secondary/10 shrink-0">
          <div className="space-y-0.5">
            <DrawerTitle className="text-base font-black uppercase tracking-tighter text-foreground text-left">
              New Record
            </DrawerTitle>
            <p className="text-[9px] text-primary font-black uppercase tracking-[0.1em] text-left">
              Details Entry
            </p>
          </div>
          <DrawerClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="bg-secondary/10 text-foreground/30 hover:text-primary rounded-full h-8 w-8"
            >
              <X size={14} strokeWidth={3} />
            </Button>
          </DrawerClose>
        </DrawerHeader>

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-8 space-y-8 pb-12 scrollbar-hide"
        >
          {/* 1. Amount Display (Clean Text Only) */}
          <div className="text-center space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/20">
              Spending Amount
            </p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-xl font-black text-primary/40">Rp</span>
              <div className="text-5xl font-black tracking-tighter text-foreground overflow-x-auto whitespace-nowrap scrollbar-hide py-2">
                {expression || '0'}
              </div>
            </div>
          </div>

          {/* 2. Category & Date (Symmetrical Grid) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground/40 ml-1">
                Category
              </Label>
              <div className="relative group">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-12 bg-secondary/10 border-none rounded-xl font-black text-[10px] uppercase tracking-widest px-4 appearance-none outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/30 pointer-events-none"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground/40 ml-1">
                Date
              </Label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-12 bg-secondary/10 border-none rounded-xl font-black text-[10px] uppercase px-4 outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground"
              />
            </div>
          </div>

          {/* 3. Calculator Keypad */}
          <div className="space-y-3 bg-secondary/5 p-4 rounded-2xl border border-secondary/10">
            <div className="grid grid-cols-4 gap-2">
              {['7', '8', '9', '/'].map((k) => (
                <Button
                  key={k}
                  type="button"
                  variant="secondary"
                  onClick={() => handleKeyClick(k)}
                  className="h-11 font-bold text-base rounded-xl bg-white shadow-sm border border-secondary/5 hover:bg-secondary/10"
                >
                  {k}
                </Button>
              ))}
              {['4', '5', '6', '*'].map((k) => (
                <Button
                  key={k}
                  type="button"
                  variant="secondary"
                  onClick={() => handleKeyClick(k)}
                  className="h-11 font-bold text-base rounded-xl bg-white shadow-sm border border-secondary/5 hover:bg-secondary/10"
                >
                  {k}
                </Button>
              ))}
              {['1', '2', '3', '-'].map((k) => (
                <Button
                  key={k}
                  type="button"
                  variant="secondary"
                  onClick={() => handleKeyClick(k)}
                  className="h-11 font-bold text-base rounded-xl bg-white shadow-sm border border-secondary/5 hover:bg-secondary/10"
                >
                  {k}
                </Button>
              ))}
              {['C', '0', '000', '+'].map((k) => (
                <Button
                  key={k}
                  type="button"
                  variant={k === 'C' ? 'destructive' : 'secondary'}
                  onClick={() => handleKeyClick(k)}
                  className={`h-11 font-bold text-base rounded-xl ${k !== 'C' ? 'bg-white shadow-sm border border-secondary/5 hover:bg-secondary/10' : ''}`}
                >
                  {k}
                </Button>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => handleKeyClick('.')}
                className="h-11 font-bold text-base rounded-xl col-span-1 bg-white border-secondary/10"
              >
                .
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleKeyClick('=')}
                className="h-11 font-bold text-base rounded-xl col-span-2 bg-white border-secondary/10"
              >
                =
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleKeyClick('DEL')}
                className="h-11 font-bold text-base rounded-xl col-span-1 bg-white border-secondary/10"
              >
                <Delete size={18} />
              </Button>
            </div>
          </div>

          {/* 4. Note & Save */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground/40 ml-1">
                Note (Optional)
              </Label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What was this for?"
                className="w-full px-4 py-3 bg-secondary/5 border border-secondary/10 rounded-xl focus:ring-2 focus:ring-primary/50 outline-none h-16 resize-none font-bold text-xs text-foreground placeholder:text-foreground/10"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-[0.3em] text-xs shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all active:scale-[0.97] flex items-center justify-center gap-3"
            >
              Save Transaction
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Button>
          </div>
        </form>
      </DrawerContent>
    </Drawer>
  );
};

export default TransactionForm;
