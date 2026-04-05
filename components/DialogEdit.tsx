"use client";

import AddDialog from "./DialogAdd";
import { ReactNode } from "react";
import { useLanguage } from "@/context/LanguageContext";

interface EditDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  title?: string;
  description?: string;
  children: ReactNode;
  onSave: () => void;
  onCancel?: () => void;
}

export default function EditDialog({
  open,
  setOpen,
  title = "Edit Data",
  children,
  onSave,
  onCancel,
}: EditDialogProps) {
  const { t } = useLanguage();
  return (
    <AddDialog
      open={open}
      setOpen={setOpen}
      title={t(title)}
      onSave={onSave}
      onCancel={onCancel}
    >
      {children} {/* <- gunakan next children, bukan props.children */}
    </AddDialog>
  );
}
