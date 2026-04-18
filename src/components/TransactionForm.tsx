import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  ArrowDown01Icon,
  Cancel01Icon,
  Delete02Icon,
  Loading03Icon,
  Mic01Icon,
  Tick01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useLiveQuery } from 'dexie-react-hooks';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { db } from '../db/database';
import { useUIStore } from '../store/uiStore';
import { Typography } from '@/components/ui/Typography';

// --- Types for Speech Recognition ---
// ... (rest of imports and types)
interface SpeechRecognitionEvent extends Event {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onstart: () => void;
  onend: () => void;
  onerror: (event: Event) => void;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

// --- Sub-components ---

const VoiceWaveform: React.FC = () => (
  <div className="flex items-center justify-center gap-1 h-8">
    {[1, 2, 3, 4, 5].map((i) => (
      <motion.div
        key={i}
        className="w-1 bg-primary rounded-full h-[28px] origin-center"
        animate={{
          scaleY: [0.4, 1, 0.6, 0.85, 0.4],
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
  const { isAddModalOpen, closeAddModal, editingTransactionId } = useUIStore();
  const [expression, setExpression] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');

  // Voice States
  const [isListening, setIsListening] = useState(false);
  const [isParsing, setIsParsing] = useState(false);

  const categories = useLiveQuery(() => db.categories.toArray()) || [];
  const effectiveCategory =
    category || (categories.length > 0 ? categories[0].name : '');

  // Fetch transaction if editing
  useEffect(() => {
    async function fetchTransaction() {
      if (editingTransactionId) {
        const tx = await db.transactions.get(editingTransactionId);
        if (tx) {
          setExpression(tx.amount.toString());
          setCategory(tx.category);
          setDate(tx.date);
          setNote(tx.note || '');
        }
      } else {
        // Reset form for new record
        setExpression('');
        setCategory('');
        setDate(new Date().toISOString().split('T')[0]);
        setNote('');
      }
    }
    fetchTransaction();
  }, [editingTransactionId, isAddModalOpen]);

  const calculateResult = (expr: string): string => {
    try {
      const cleanExpr = expr.replace(/[^-+*/.0-9]/g, '');
      if (!cleanExpr) return '0';

      // Safe evaluation of basic arithmetic
      const safeEval = (str: string): number => {
        const parts = str.split(/(\+|-)/).filter((p) => p.trim() !== '');
        let total = 0;
        let currentOp = '+';

        for (const part of parts) {
          if (part === '+' || part === '-') {
            currentOp = part;
          } else {
            const subParts = part
              .split(/(\*|\/)/)
              .filter((p) => p.trim() !== '');
            let subTotal = parseFloat(subParts[0]);
            if (isNaN(subTotal)) subTotal = 0;

            for (let i = 1; i < subParts.length; i += 2) {
              const op = subParts[i];
              const val = parseFloat(subParts[i + 1]);
              if (isNaN(val)) continue;
              if (op === '*') subTotal *= val;
              if (op === '/') subTotal = val !== 0 ? subTotal / val : 0;
            }

            if (currentOp === '+') total += subTotal;
            else total -= subTotal;
          }
        }
        return total;
      };

      const result = safeEval(cleanExpr);
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
      window.SpeechRecognition || window.webkitSpeechRecognition;
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

    recognition.onresult = (event: SpeechRecognitionEvent) => {
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

    const selectedCat = categories.find((c) => c.name === effectiveCategory);

    const txData = {
      type: 'expense' as const,
      amount: Number(finalAmount),
      category: effectiveCategory || 'Other',
      categoryIcon: selectedCat?.icon,
      categoryColor: selectedCat?.color,
      date,
      note,
    };

    if (editingTransactionId) {
      await db.transactions.update(editingTransactionId, txData);
    } else {
      await db.transactions.add(txData);
    }

    setExpression('');
    setNote('');
    closeAddModal();
  };

  return (
    <Drawer
      open={isAddModalOpen}
      onOpenChange={(open) => !open && closeAddModal()}
    >
      <DrawerContent className="bg-background max-w-md mx-auto rounded-t-[2.5rem] border-none shadow-[0_-8px_40px_rgba(0,0,0,0.12)] flex flex-col overflow-hidden max-h-[96vh] transition-transform duration-500 ring-1 ring-border/5">
        {/* Immersive Voice Overlay (Glassmorphism) */}
        <AnimatePresence>
          {isListening && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute inset-0 z-60 bg-background/80 backdrop-blur-2xl flex flex-col items-center justify-center p-8 space-y-10"
            >
              <div className="space-y-3 text-center">
                <Typography
                  variant="h2"
                  weight="semibold"
                  className="drop-shadow-sm"
                >
                  Listening…
                </Typography>
                <Typography variant="small" weight="medium" muted>
                  Speak the amount and category
                </Typography>
              </div>

              <div className="relative">
                <motion.div
                  animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.2, 0.1] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="absolute inset-0 bg-primary rounded-full blur-3xl"
                />
                <div className="relative bg-primary/10 text-primary p-7 rounded-full shadow-inner ring-1 ring-primary/20">
                  <HugeiconsIcon icon={Mic01Icon} size={42} />
                </div>
              </div>

              <VoiceWaveform />

              <Button
                onClick={() => setIsListening(false)}
                variant="outline"
                className="rounded-full bg-background/50 hover:bg-muted text-foreground border-border/50 font-medium px-8 transition-colors focus-visible:ring-2"
                aria-label="Cancel voice recording"
              >
                Cancel
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        <DrawerHeader className="px-8 pt-8 pb-5 flex flex-row items-center justify-between shrink-0">
          <div className="space-y-1">
            <DrawerTitle className="text-xl font-semibold tracking-tight leading-none text-foreground as-child">
              <Typography variant="h3" as="span">
                {editingTransactionId ? 'Edit Record' : 'New Record'}
              </Typography>
            </DrawerTitle>
            <Typography variant="small" weight="medium" muted>
              {editingTransactionId
                ? 'Update your transaction details'
                : 'Add a new transaction'}
            </Typography>
          </div>
          <DrawerClose asChild>
            <button
              className="p-2.5 bg-secondary/50 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Close modal"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={18} strokeWidth={2.5} />
            </button>
          </DrawerClose>
        </DrawerHeader>

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-8 py-2 space-y-7 pb-10 scrollbar-hide"
        >
          {/* Amount Display */}
          <div className="relative group bg-secondary/20 rounded-[2rem] p-7 text-center space-y-2 overflow-hidden border border-border/30 focus-within:border-primary/30 focus-within:ring-4 focus-within:ring-primary/5 transition-colors">
            <Typography
              variant="small"
              weight="medium"
              muted
              className="tracking-wide"
            >
              Spending Amount
            </Typography>

            <div className="flex items-center justify-center gap-2">
              <Typography
                variant="h4"
                weight="semibold"
                muted
                className="mt-0.5"
                as="span"
              >
                Rp
              </Typography>
              <Typography
                variant="h1"
                weight="bold"
                mono
                className="truncate max-w-full leading-none"
                as="div"
              >
                {expression || '0'}
              </Typography>
            </div>

            {/* Voice Trigger Small */}
            <div className="pt-3">
              <button
                type="button"
                onClick={startListening}
                className={cn(
                  'inline-flex items-center gap-2 px-5 py-2 rounded-full transition-colors font-medium text-xs shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                  isParsing
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-primary/10 text-primary hover:bg-primary/15 active:bg-primary/20',
                )}
                aria-label="Quick voice input"
              >
                {isParsing ? (
                  <>
                    <HugeiconsIcon
                      icon={Loading03Icon}
                      size={14}
                      className="animate-spin"
                    />
                    Parsing…
                  </>
                ) : (
                  <>
                    <HugeiconsIcon icon={Mic01Icon} size={14} />
                    Quick Voice
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Form Grid */}
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2.5">
              <Label
                htmlFor="category-select"
                className="text-xs font-medium text-foreground ml-1"
              >
                Category
              </Label>
              <div className="relative">
                <select
                  id="category-select"
                  name="category"
                  value={effectiveCategory}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-12 bg-secondary/40 border border-transparent rounded-[1.25rem] font-medium text-[13px] px-4 appearance-none outline-none focus-visible:border-primary/40 focus-visible:ring-4 focus-visible:ring-primary/5 transition-colors text-foreground"
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
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                />
              </div>
            </div>
            <div className="space-y-2.5">
              <Label
                htmlFor="date-input"
                className="text-xs font-medium text-foreground ml-1"
              >
                Date
              </Label>
              <input
                id="date-input"
                name="date"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-12 bg-secondary/40 border border-transparent rounded-[1.25rem] font-medium text-[13px] px-4 outline-none focus-visible:border-primary/40 focus-visible:ring-4 focus-visible:ring-primary/5 transition-colors text-foreground tabular-nums hover:cursor-pointer"
              />
            </div>
          </div>

          {/* Calculator Keypad - Clean styling */}
          <div className="bg-secondary/10 p-1.5 rounded-[1.75rem] border border-border/40">
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
                  aria-label={k === 'C' ? 'Clear' : k}
                  className={cn(
                    'h-13 font-medium text-[15px] rounded-2xl transition-colors active:scale-95 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary',
                    k === 'C'
                      ? 'text-destructive hover:bg-destructive/10'
                      : 'bg-card/60 hover:bg-card border border-border/30 shadow-[0_1px_2px_rgba(0,0,0,0.02)]',
                  )}
                >
                  {k}
                </Button>
              ))}
              <Button
                type="button"
                variant="ghost"
                onClick={() => handleKeyClick('.')}
                aria-label="Decimal point"
                className="h-13 font-medium text-[15px] rounded-2xl bg-card/60 hover:bg-card border border-border/30 shadow-[0_1px_2px_rgba(0,0,0,0.02)] active:scale-95 transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
              >
                .
              </Button>
              <Button
                type="button"
                onClick={() => handleKeyClick('=')}
                aria-label="Calculate equals"
                className="h-13 font-semibold text-[15px] rounded-2xl col-span-2 bg-foreground text-background shadow-md hover:bg-foreground/90 active:scale-95 transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
              >
                =
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => handleKeyClick('DEL')}
                aria-label="Delete last character"
                className="h-13 font-medium text-[15px] rounded-2xl bg-card/60 hover:bg-card border border-border/30 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex items-center justify-center text-muted-foreground active:scale-95 transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
              >
                <HugeiconsIcon icon={Delete02Icon} size={18} strokeWidth={2} />
              </Button>
            </div>
          </div>

          {/* Note & CTA */}
          <div className="space-y-6">
            <div className="space-y-2.5">
              <Label
                htmlFor="note-input"
                className="text-xs font-medium text-foreground ml-1"
              >
                Note (Optional)
              </Label>
              <textarea
                id="note-input"
                name="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What was this for?"
                className="w-full px-5 py-4 bg-secondary/30 border border-transparent rounded-[1.25rem] outline-none h-24 resize-none font-medium text-[13px] text-foreground placeholder:text-muted-foreground/60 focus-visible:border-primary/40 focus-visible:ring-4 focus-visible:ring-primary/5 transition-colors shadow-inner"
              />
            </div>

            <Button
              type="submit"
              disabled={isListening || isParsing}
              className="group w-full h-15 rounded-2xl bg-primary text-primary-foreground font-semibold text-[15px] shadow-lg shadow-primary/20 hover:bg-primary/95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
            >
              {editingTransactionId ? 'Update Record' : 'Save Record'}
              <HugeiconsIcon
                icon={Tick01Icon}
                size={20}
                strokeWidth={2.5}
                className="transition-transform group-hover:scale-110"
              />
            </Button>
          </div>
        </form>
      </DrawerContent>
    </Drawer>
  );
};

export default TransactionForm;
