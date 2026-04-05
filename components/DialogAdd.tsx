"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";

interface AddDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  onSave: () => void;
  onCancel?: () => void;
}

export default function AddDialog({
  open,
  setOpen,
  title = "Tambah Data",
  description,
  children,
  onSave,
  onCancel
}: AddDialogProps) {
  const { t } = useLanguage();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t(title)}</DialogTitle>
          {description && <DialogDescription>{t(description)}</DialogDescription>}
        </DialogHeader>

        <div className="space-y-4">
          {children}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setOpen(false);
              onCancel?.();
            }}
          >
            {t("Cancel")}
          </Button>
          <Button onClick={onSave}>{t("Save")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
