import React, { useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Cancel01Icon,
  Delete02Icon,
  ArrowDown01Icon,
  Mic01Icon,
  Loading03Icon,
  Tick01Icon,
} from '@hugeicons/core-free-icons';
import { motion, AnimatePresence } from 'framer-motion';
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
import { cn } from '@/lib/utils';

// --- Sub-components ---

const VoiceWaveform: React.FC = () => (
  <div className="flex items-center justify-center gap-1 h-8">
    {[1, 2, 3, 4, 5].map((i) => (
      <motion.div
        key={i}
        className="w-1 bg-primary rounded-full"
        animate={{
          height: [12, 28, 16, 24, 12],
        }}
        transition={{
          duration: 0.6,
          repeat: Infinity,
          delay: i * 0.1,
          ease: 'easeInOut',
        }}
      />
    ))}
  </div>
);

const TransactionForm: React.FC = () => {
  const { isAddModalOpen, closeAddModal } = useUIStore();
  const [expression, setExpression] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');

  // Voice States
  const [isListening, setIsListening] = useState(false);
  const [isParsing, setIsParsing] = useState(false);

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

  // --- Voice Logic ---
  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Browser Anda tidak mendukung Speech Recognition.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'id-ID';
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      processVoiceTranscript(transcript);
    };

    recognition.start();
  };

  const processVoiceTranscript = (text: string) => {
    setIsParsing(true);
    const amountMatch = text.match(/\d+/g);
    const amount = amountMatch ? amountMatch.join('') : '0';

    if (amount !== '0') {
      setExpression(amount);
      setNote(text);
    }

    setTimeout(() => setIsParsing(false), 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = calculateResult(expression);
    if (!finalAmount || finalAmount === '0') return;

    const selectedCat = categories.find((c) => c.name === category);

    await db.transactions.add({
      type: 'expense',
      amount: Number(finalAmount),
      category: category || 'Other',
      categoryIcon: selectedCat?.icon,
      categoryColor: selectedCat?.color,
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
      <DrawerContent className="bg-background max-w-120 mx-auto rounded-t-[2.5rem] border-border shadow-2xl flex flex-col overflow-hidden max-h-[96vh] transition-colors duration-500">
        {/* Immersive Voice Overlay */}
        <AnimatePresence>
          {isListening && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[60] bg-primary flex flex-col items-center justify-center text-white p-8 space-y-8"
            >
              <div className="space-y-2 text-center">
                <h2 className="text-2xl font-black uppercase tracking-tighter italic">
                  Listening...
                </h2>
                <p className="text-xs font-bold opacity-60 uppercase tracking-widest text-white/80">
                  Katakan jumlah dan catatan
                </p>
              </div>

              <div className="relative">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-white/20 rounded-full blur-3xl"
                />
                <div className="relative bg-white text-primary p-8 rounded-full shadow-2xl">
                  <HugeiconsIcon icon={Mic01Icon} size={48} />
                </div>
              </div>

              <VoiceWaveform />

              <Button
                onClick={() => setIsListening(false)}
                variant="outline"
                className="rounded-full border-white/20 bg-white/10 hover:bg-white/20 text-white border-2 font-bold uppercase tracking-widest px-8"
              >
                Cancel
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        <DrawerHeader className="px-8 pt-8 pb-4 flex flex-row items-center justify-between shrink-0">
          <div className="space-y-0.5">
            <DrawerTitle className="text-xl font-black uppercase tracking-tighter italic leading-none">
              New Record
            </DrawerTitle>
            <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em]">
              Manual or Voice Entry
            </p>
          </div>
          <DrawerClose asChild>
            <button className="p-2 bg-secondary rounded-full text-foreground/40 hover:text-primary transition-colors">
              <HugeiconsIcon icon={Cancel01Icon} size={20} strokeWidth={2.5} />
            </button>
          </DrawerClose>
        </DrawerHeader>

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-8 py-4 space-y-8 pb-12 scrollbar-hide"
        >
          {/* Amount Display */}
          <div className="relative group bg-secondary/30 rounded-[2rem] p-8 text-center space-y-3 overflow-hidden border border-transparent focus-within:border-primary/20 transition-all">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/20">
              Spending Amount
            </p>

            <div className="flex items-center justify-center gap-3">
              <span className="text-xl font-black text-primary/30 mt-1">
                Rp
              </span>
              <div className="text-5xl font-black tracking-tighter text-foreground truncate max-w-full">
                {expression || '0'}
              </div>
            </div>

            {/* Voice Trigger Small */}
            <div className="pt-4">
              <button
                type="button"
                onClick={startListening}
                className={cn(
                  'inline-flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-300 font-bold text-[11px] uppercase tracking-widest shadow-sm',
                  isParsing
                    ? 'bg-amber-100 text-amber-600'
                    : 'bg-primary text-white shadow-primary/20 hover:scale-105 active:scale-95',
                )}
              >
                {isParsing ? (
                  <>
                    <HugeiconsIcon
                      icon={Loading03Icon}
                      size={14}
                      className="animate-spin"
                    />
                    Parsing...
                  </>
                ) : (
                  <>
                    <HugeiconsIcon icon={Mic01Icon} size={14} />
                    Quick Voice
                  </>
                )}
              </button>
            </div>

            {/* Subtle Decoration */}
            <div className="absolute -bottom-6 -right-6 opacity-[0.03] text-foreground pointer-events-none">
              <HugeiconsIcon icon={Mic01Icon} size={120} />
            </div>
          </div>

          {/* Form Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-1">
                Category
              </Label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-12 bg-secondary/50 border-none rounded-2xl font-bold text-xs uppercase tracking-wider px-4 appearance-none outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <HugeiconsIcon
                  icon={ArrowDown01Icon}
                  size={14}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/30 pointer-events-none"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-1">
                Date
              </Label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-12 bg-secondary/50 border-none rounded-2xl font-bold text-xs px-4 outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
              />
            </div>
          </div>

          {/* Calculator Keypad - Compact */}
          <div className="bg-secondary/20 p-2 rounded-[2rem] border border-border/50">
            <div className="grid grid-cols-4 gap-1.5">
              {[
                '7',
                '8',
                '9',
                '/',
                '4',
                '5',
                '6',
                '*',
                '1',
                '2',
                '3',
                '-',
                'C',
                '0',
                '000',
                '+',
              ].map((k) => (
                <Button
                  key={k}
                  type="button"
                  variant="ghost"
                  onClick={() => handleKeyClick(k)}
                  className={cn(
                    'h-12 font-bold text-base rounded-xl transition-all active:bg-primary/10 active:text-primary',
                    k === 'C'
                      ? 'text-destructive hover:bg-destructive/5'
                      : 'bg-card/40 hover:bg-card shadow-sm border border-border/5',
                  )}
                >
                  {k}
                </Button>
              ))}
              <Button
                type="button"
                variant="ghost"
                onClick={() => handleKeyClick('.')}
                className="h-12 font-bold text-base rounded-xl bg-card/40 border border-border/5 shadow-sm"
              >
                .
              </Button>
              <Button
                type="button"
                onClick={() => handleKeyClick('=')}
                className="h-12 font-bold text-base rounded-xl col-span-2 bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
              >
                =
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => handleKeyClick('DEL')}
                className="h-12 font-bold text-base rounded-xl bg-card/40 border border-border/5 shadow-sm flex items-center justify-center text-foreground/60"
              >
                <HugeiconsIcon icon={Delete02Icon} size={18} />
              </Button>
            </div>
          </div>

          {/* Note & CTA */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-1">
                Note (Optional)
              </Label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What was this for?"
                className="w-full px-5 py-4 bg-secondary/30 border border-transparent rounded-2xl focus:border-primary/20 focus:bg-card outline-none h-20 resize-none font-medium text-xs text-foreground placeholder:text-foreground/20 transition-all shadow-inner"
              />
            </div>

            <Button
              type="submit"
              disabled={isListening || isParsing}
              className="group w-full h-16 rounded-[1.5rem] bg-primary text-white font-black uppercase tracking-[0.3em] text-xs shadow-xl shadow-primary/30 hover:bg-primary/90 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-3"
            >
              Save Record
              <HugeiconsIcon
                icon={Tick01Icon}
                size={18}
                strokeWidth={3}
                className="group-hover:scale-110 transition-transform"
              />
            </Button>
          </div>
        </form>
      </DrawerContent>
    </Drawer>
  );
};

export default TransactionForm;
