import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Label } from '@/components/ui/label';
import { cn, formatCurrency } from '@/lib/utils';
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
import { DEFAULT_ICON, ICON_MAP } from '@/constants/icons';

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

  const formattedExpression = (() => {
    if (!expression) return '0';
    if (!/^\d+$/.test(expression)) return expression;

    return formatCurrency(Number(expression), { withSymbol: false });
  })();

  const formattedDate = new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const quickCategories = categories.slice(0, 6);

  const softCategoryColorMap: Record<string, string> = {
    'bg-rose-500': 'bg-rose-100 text-rose-500',
    'bg-indigo-500': 'bg-indigo-100 text-indigo-500',
    'bg-amber-500': 'bg-amber-100 text-amber-600',
    'bg-emerald-500': 'bg-emerald-100 text-emerald-600',
    'bg-purple-500': 'bg-purple-100 text-purple-500',
    'bg-rose-400': 'bg-rose-100 text-rose-500',
    'bg-cyan-500': 'bg-cyan-100 text-cyan-600',
    'bg-pink-500': 'bg-pink-100 text-pink-500',
    'bg-slate-500': 'bg-slate-200 text-slate-600',
  };

  const keypadKeys = [
    { label: 'AC', value: 'C', tone: 'danger' as const },
    { label: '×', value: '*', tone: 'default' as const },
    { label: '÷', value: '/', tone: 'default' as const },
    { label: '', value: 'DEL', tone: 'default' as const, isDelete: true },
    { label: '7', value: '7', tone: 'default' as const },
    { label: '8', value: '8', tone: 'default' as const },
    { label: '9', value: '9', tone: 'default' as const },
    { label: '-', value: '-', tone: 'default' as const },
    { label: '4', value: '4', tone: 'default' as const },
    { label: '5', value: '5', tone: 'default' as const },
    { label: '6', value: '6', tone: 'default' as const },
    { label: '+', value: '+', tone: 'default' as const },
    { label: '1', value: '1', tone: 'default' as const },
    { label: '2', value: '2', tone: 'default' as const },
    { label: '3', value: '3', tone: 'default' as const },
    { label: '0', value: '0', tone: 'default' as const },
    { label: '000', value: '000', tone: 'default' as const },
    { label: '.', value: '.', tone: 'default' as const },
  ];

  return (
    <Drawer
      open={isAddModalOpen}
      onOpenChange={(open) => !open && closeAddModal()}
    >
      <DrawerContent className="bg-background max-w-md mx-auto rounded-t-[2.5rem] border-none shadow-[0_-8px_40px_rgba(0,0,0,0.12)] flex flex-col overflow-hidden max-h-[calc(100vh-1rem)] transition-transform duration-500 ring-1 ring-border/5">
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

        <DrawerHeader className="px-5 pt-3 pb-2 flex flex-row items-start justify-between gap-3 shrink-0 text-left">
          <div className="flex-1 min-w-0 space-y-0.5 text-left">
            <DrawerTitle className="text-[1.5rem] font-semibold tracking-tight leading-[1.1] text-foreground">
              {editingTransactionId ? 'Edit Record' : 'New Record'}
            </DrawerTitle>
            <DrawerDescription className="text-[0.84rem] leading-tight font-medium text-muted-foreground">
              {editingTransactionId
                ? 'Update your transaction details'
                : 'Add a new transaction'}
            </DrawerDescription>
          </div>
          <div className="mt-0.5 flex items-center gap-2">
            <button
              type="button"
              onClick={startListening}
              className={cn(
                'h-10 w-10 rounded-full border border-border/50 bg-primary text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                isParsing && 'text-amber-700 bg-amber-100 border-amber-200',
              )}
              aria-label="Voice input"
            >
              {isParsing ? (
                <HugeiconsIcon
                  icon={Loading03Icon}
                  size={17}
                  className="mx-auto animate-spin motion-reduce:animate-none"
                />
              ) : (
                <HugeiconsIcon icon={Mic01Icon} size={17} className="mx-auto" />
              )}
            </button>
            <DrawerClose asChild>
              <button
                className="p-2.5 bg-secondary/50 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Close modal"
              >
                <HugeiconsIcon
                  icon={Cancel01Icon}
                  size={18}
                  strokeWidth={2.5}
                />
              </button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col">
          <div className="flex-1 min-h-0 overflow-y-auto px-5 py-1 space-y-3 scrollbar-hide">
            <div className="pt-1 pb-1 text-center">
              <div className="flex items-baseline justify-center gap-2">
                <Typography variant="h4" weight="semibold" muted as="span">
                  Rp
                </Typography>
                <Typography
                  variant="h1"
                  weight="bold"
                  mono
                  className="truncate max-w-full leading-none text-2xl"
                  as="div"
                >
                  {formattedExpression}
                </Typography>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="relative shrink-0">
                <select
                  id="category-select"
                  name="category"
                  value={effectiveCategory}
                  onChange={(e) => setCategory(e.target.value)}
                  className="h-12 min-h-[44px] rounded-full bg-slate-100/90 px-5 pr-11 text-[1.05rem] font-medium text-slate-800 appearance-none outline-none border border-slate-200 shadow-[0_1px_0_rgba(255,255,255,0.7)_inset] focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/20"
                >
                  {categories.length === 0 ? (
                    <option value="">Pilih Kategori</option>
                  ) : (
                    categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))
                  )}
                </select>
                <HugeiconsIcon
                  icon={ArrowDown01Icon}
                  size={18}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                />
              </div>

              <div className="flex-1 min-w-0 overflow-x-auto scrollbar-hide">
                <div className="flex items-center gap-2.5 pr-2">
                  {quickCategories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.name)}
                      className={cn(
                        'h-12 w-12 min-h-[44px] min-w-[44px] rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 motion-reduce:transition-none',
                        effectiveCategory === cat.name
                          ? cn(
                              cat.color || 'bg-slate-600',
                              'text-white ring-2 ring-white/80 shadow-[0_6px_16px_rgba(15,23,42,0.16)]',
                            )
                          : cn(
                              softCategoryColorMap[cat.color || ''] ||
                                'bg-slate-100 text-slate-400',
                              'ring-1 ring-slate-200/90',
                            ),
                      )}
                      aria-label={`Select ${cat.name}`}
                      title={cat.name}
                    >
                      <HugeiconsIcon
                        icon={
                          cat.icon
                            ? ICON_MAP[cat.icon] || DEFAULT_ICON
                            : DEFAULT_ICON
                        }
                        size={20}
                        className="mx-auto"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative h-12 min-h-[44px] rounded-2xl bg-secondary/35 px-4 flex items-center justify-between gap-2 border border-border/35">
              <div className="relative flex items-center gap-2 text-foreground">
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5 text-muted-foreground"
                  aria-hidden="true"
                >
                  <rect
                    x="3.5"
                    y="5"
                    width="17"
                    height="15.5"
                    rx="2.2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M7 3.7v2.8M17 3.7v2.8M3.7 9h16.6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="text-[1.02rem] font-medium">
                  {formattedDate}
                </span>
                <input
                  id="date-input"
                  name="date"
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="absolute inset-y-0 left-0 right-24 z-10 cursor-pointer opacity-0"
                  aria-label="Change transaction date"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  const yesterday = new Date();
                  yesterday.setDate(yesterday.getDate() - 1);
                  setDate(yesterday.toISOString().split('T')[0]);
                }}
                className="relative text-[0.95rem] font-semibold underline underline-offset-2 text-foreground/85 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-md px-1"
              >
                Kemarin?
              </button>
            </div>

            <div className="h-12 min-h-[44px] rounded-2xl bg-secondary/35 px-4 flex items-center gap-2 border border-border/35 focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/20">
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5 text-muted-foreground shrink-0"
                aria-hidden="true"
              >
                <path
                  d="M4 17.2V20h2.8l9.9-9.9-2.8-2.8L4 17.2Zm14.7-8.4a.75.75 0 0 0 0-1.1l-2.4-2.4a.75.75 0 0 0-1.1 0l-1.9 1.9 3.5 3.5 1.9-1.9Z"
                  fill="currentColor"
                />
              </svg>
              <Label htmlFor="note-input" className="sr-only">
                Note
              </Label>
              <input
                id="note-input"
                name="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Notes..."
                className="h-full w-full bg-transparent outline-none text-[1rem] font-medium text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="grid grid-cols-4 gap-1.5 pb-2">
              {keypadKeys.map((k) => (
                <Button
                  key={`${k.label}-${k.value}`}
                  type="button"
                  variant="ghost"
                  onClick={() => handleKeyClick(k.value)}
                  aria-label={k.isDelete ? 'Delete last character' : k.label}
                  className={cn(
                    'h-12 min-h-[44px] rounded-xl border border-slate-200/80 bg-slate-50/95 text-lg font-medium leading-none text-slate-700 transition-colors hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-primary/35 motion-reduce:transition-none shadow-[0_1px_0_rgba(15,23,42,0.03)]',
                    k.tone === 'danger' && 'text-slate-900',
                  )}
                >
                  {k.isDelete ? (
                    <HugeiconsIcon
                      icon={Delete02Icon}
                      size={18}
                      className="text-muted-foreground"
                    />
                  ) : (
                    <span className="translate-y-[1px]">{k.label}</span>
                  )}
                </Button>
              ))}

              <Button
                type="submit"
                disabled={isListening || isParsing}
                aria-label={
                  editingTransactionId ? 'Update record' : 'Save record'
                }
                className="col-start-4 row-start-4 row-span-2 h-full min-h-[116px] rounded-2xl bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary motion-reduce:transition-none"
              >
                <HugeiconsIcon icon={Tick01Icon} size={26} strokeWidth={2.8} />
              </Button>
            </div>
          </div>
        </form>
      </DrawerContent>
    </Drawer>
  );
};

export default TransactionForm;
