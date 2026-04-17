import React, { useState } from 'react';
import { UserIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface NameOnboardingModalProps {
  isOpen: boolean;
  onSave: (name: string) => void;
}

export const NameOnboardingModal: React.FC<NameOnboardingModalProps> = ({
  isOpen,
  onSave,
}) => {
  const [tempName, setTempName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempName.trim()) {
      onSave(tempName.trim());
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && isOpen) return;
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="max-w-sm rounded-[2rem] p-8"
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-5 shadow-inner border border-primary/20">
            <HugeiconsIcon icon={UserIcon} size={32} strokeWidth={2} />
          </div>
          <DialogHeader className="items-center">
            <DialogTitle className="text-xl font-bold tracking-tight">
              Selamat Datang!
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed px-2">
              Silakan masukkan nama panggilan kamu terlebih dahulu untuk mulai
              menggunakan aplikasi.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="w-full space-y-4 pt-6">
            <Input
              required
              placeholder="Nama kamu..."
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              className="h-12 rounded-xl text-center font-medium"
              autoFocus
            />
            <Button
              type="submit"
              disabled={!tempName.trim()}
              className="w-full h-12 rounded-xl text-sm font-bold"
            >
              Simpan & Lanjutkan
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
